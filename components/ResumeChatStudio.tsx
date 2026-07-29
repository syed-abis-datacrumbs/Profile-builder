'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Sparkles, Loader2, Bold, Italic, Underline, Download, ChevronDown } from 'lucide-react';
import { CvData } from '../lib/cvTypes';
import { CvPreview } from './CvPreview';

/**
 * Block-aligned A4 page breaks (CSS px, relative to `el`) — a break never falls
 * inside an entry ([data-cv-block]); a block that would straddle the boundary
 * moves whole to the next page. Mirrors the LMS pagination so text is never cut.
 */
function computePageBreaks(el: HTMLElement): number[] {
  const rootTop = el.getBoundingClientRect().top;
  const blocks = Array.from(el.querySelectorAll<HTMLElement>('[data-cv-block]'))
    .map((b) => {
      const r = b.getBoundingClientRect();
      return { top: r.top - rootTop, bottom: r.bottom - rootTop };
    })
    .sort((a, b) => a.top - b.top);
  const contentHeight = el.offsetHeight;
  const pageH = (el.offsetWidth * 297) / 210; // A4 page height at this width
  const breaks: number[] = [];
  let start = 0;
  let guard = 0;
  while (start + pageH < contentHeight && guard++ < 200) {
    const limit = start + pageH;
    let breakAt = 0;
    for (const b of blocks) {
      if (b.top >= start - 1 && b.bottom <= limit && b.bottom > breakAt) breakAt = b.bottom;
    }
    if (breakAt <= start) {
      // No block fits whole: move a straddling block down, else hard-cut a block
      // taller than a page.
      const straddler = blocks.find((b) => b.top > start + 1 && b.top < limit && b.bottom > limit);
      breakAt = straddler ? straddler.top : limit;
    }
    breaks.push(breakAt);
    start = breakAt;
  }
  return breaks;
}

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

interface ResumeChatStudioProps {
  cv: CvData;
  onChange: (cv: CvData) => void;
  fieldLabel?: string;
  onBack: () => void;
}

/**
 * Split "Resume Studio": AI chat on the left drives the resume; the LMS-format
 * CvPreview on the right updates live. Chat edits and the Professional/Student
 * toggle both write to the same `cv`.
 */
export const ResumeChatStudio: React.FC<ResumeChatStudioProps> = ({
  cv,
  onChange,
  fieldLabel,
  onBack,
}) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content: `Loaded a ${fieldLabel || 'resume'} template. Tell me what to change — e.g. "make my summary punchier", "add a project about X", or "switch to a student resume". You can also switch Professional / Student above the resume.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Bumped only on EXTERNAL changes (chat, layout toggle) → remounts the
  // CvPreview so they show. Inline edits go through onChange WITHOUT bumping it,
  // so the resume never remounts mid-edit and the caret stays put.
  const [revision, setRevision] = useState(0);
  const external = (next: CvData) => {
    onChange(next);
    setRevision((r) => r + 1);
  };

  // Whether the current selection is bold/italic/underline, so the toolbar
  // buttons light up when that formatting is active (updates as you move the
  // caret / select text).
  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false });
  const refreshFmt = () => {
    try {
      const b = document.queryCommandState('bold');
      const i = document.queryCommandState('italic');
      const u = document.queryCommandState('underline');
      // Only update when it actually changed, so caret moves inside a field
      // don't trigger needless re-renders.
      setFmt((prev) => (prev.bold === b && prev.italic === i && prev.underline === u ? prev : { bold: b, italic: i, underline: u }));
    } catch {
      /* queryCommandState can throw when nothing is focused — ignore */
    }
  };
  useEffect(() => {
    document.addEventListener('selectionchange', refreshFmt);
    return () => document.removeEventListener('selectionchange', refreshFmt);
  }, []);

  // Download — captures a hidden, read-only A4-width copy of the resume.
  const exportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<null | 'pdf' | 'png'>(null);
  const [dlMenu, setDlMenu] = useState(false);

  const download = async (format: 'pdf' | 'png') => {
    const el = exportRef.current;
    if (!el || downloading) return;
    setDlMenu(false);
    setDownloading(format);
    try {
      const name =
        (cv.personalInfo.fullName || 'resume').replace(/<[^>]+>/g, '').trim() || 'resume';
      const { toPng, toCanvas } = await import('html-to-image');
      const opts = {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        // Never capture the on-screen page-break guide lines.
        filter: (n: HTMLElement) => n?.dataset?.pageBreak !== 'true',
      };
      // html-to-image's first render can come out blank (fonts/resources not
      // embedded yet); a discarded warm-up pass fixes it.
      await toPng(el, opts).catch(() => undefined);
      if (format === 'png') {
        const dataUrl = await toPng(el, opts);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${name}.png`;
        a.click();
      } else {
        // Block-aligned page breaks (measured from the live DOM), so a page
        // never cuts through an entry.
        const cutsCss = computePageBreaks(el);
        const canvas = await toCanvas(el, opts);
        const scaleY = canvas.height / el.offsetHeight;
        const cuts = [...cutsCss.map((y) => Math.round(y * scaleY)), canvas.height];

        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pdfW = pdf.internal.pageSize.getWidth();

        let start = 0;
        cuts.forEach((end, idx) => {
          const sliceH = Math.round(end - start);
          if (sliceH <= 0) {
            start = end;
            return;
          }
          const slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = sliceH;
          slice.getContext('2d')?.drawImage(canvas, 0, start, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          const img = slice.toDataURL('image/png');
          const imgH = (sliceH * pdfW) / canvas.width;
          if (idx > 0) pdf.addPage();
          pdf.addImage(img, 'PNG', 0, 0, pdfW, imgH);
          start = end;
        });
        pdf.save(`${name}.pdf`);
      }
    } catch (err) {
      console.error('Resume download failed', err);
    } finally {
      setDownloading(null);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/resume-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, cv }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${data.error}` }]);
      } else {
        if (data.cv) external(data.cv as CvData);
        setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'Done.' }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Page-break guides in the preview: a dashed line every A4 page-height so you
  // can see where each printed page ends. Recomputed on any size change.
  const [pageLines, setPageLines] = useState<number[]>([]);
  useEffect(() => {
    const el = exportRef.current;
    if (!el) return;
    const measure = () => setPageLines(computePageBreaks(el));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isStudent = cv.cvType === 'student';

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-150px)]">
      {/* LEFT — chat */}
      <div className="lg:w-[34%] xl:w-[30%] flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <button
            onClick={onBack}
            className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center"
            title="Back to templates"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="font-bold text-sm text-slate-800">AI Resume Assistant</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-500 rounded-2xl px-3 py-2 text-xs flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 p-3 border-t border-slate-100">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 transition-colors">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask the AI to edit your resume…"
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none max-h-24"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT — live resume */}
      <div className="lg:flex-1 flex flex-col bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden min-h-0">
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            {/* Professional / Student */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              {(['professional', 'student'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => external({ ...cv, cvType: t })}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-colors ${
                    (cv.cvType ?? 'professional') === t
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {/* Rich-text toolbar — formats the selected text inside the resume.
                onMouseDown+preventDefault keeps the field focused so the browser
                applies the command to the current selection. */}
            <div className="flex items-center gap-0.5 pl-2 border-l border-slate-200">
              {([
                { cmd: 'bold', Icon: Bold, label: 'Bold' },
                { cmd: 'italic', Icon: Italic, label: 'Italic' },
                { cmd: 'underline', Icon: Underline, label: 'Underline' },
              ] as const).map(({ cmd, Icon, label }) => (
                <button
                  key={cmd}
                  title={label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    document.execCommand(cmd);
                    refreshFmt();
                  }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                    fmt[cmd]
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
          {/* Download PDF / PNG */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDlMenu((o) => !o)}
              disabled={!!downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloading ? (downloading === 'pdf' ? 'PDF…' : 'PNG…') : 'Download'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {dlMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDlMenu(false)} />
                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  <button onClick={() => download('pdf')} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50">
                    Download PDF
                  </button>
                  <button onClick={() => download('png')} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50">
                    Download PNG
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center">
          <div ref={exportRef} className="relative w-full max-w-[920px] bg-white shadow-xl rounded-sm">
            <CvPreview key={revision} data={cv} onChange={onChange} />
            {pageLines.map((y, i) => (
              <div
                key={i}
                data-page-break="true"
                className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-red-300"
                style={{ top: y }}
              >
                <span className="absolute right-1 -top-4 text-[9px] font-sans text-red-400 bg-white px-1">
                  Page {i + 2}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
