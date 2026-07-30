'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Loader2, 
  Bold, 
  Italic, 
  Underline, 
  Download, 
  ChevronDown,
  Plus,
  Folder,
  PenTool,
  Check,
  Search,
  Mic,
  FileText,
  Undo,
  Redo,
  Link,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
  SquarePen,
  SlidersHorizontal
} from 'lucide-react';
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

export const ResumeChatStudio: React.FC<ResumeChatStudioProps> = ({
  cv,
  onChange,
  fieldLabel,
  onBack,
}) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content: `Happy to build that for you. To get a real, ATS-friendly resume and not a template of placeholders, share a few details — paste, drop, or just type them out:

1. Target role — what job(s) are you applying to?
2. Snapshot of you — name, contact, current/most recent job title + company, roughly how many years of experience, a couple of past roles.
3. Education & key skills — degree(s), school(s), year, and your top 5-10 skills.
4. Anything extra — links (LinkedIn, GitHub, portfolio), notable achievements, projects.

If it's easier, paste your current resume or LinkedIn "About" + Experience sections and I'll restructure everything into a polished resume in your resume editor.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [selectedModel, setSelectedModel] = useState('Flash');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [revision, setRevision] = useState(0);
  const external = (next: CvData) => {
    onChange(next);
    setRevision((r) => r + 1);
  };

  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false, strikethrough: false });
  const refreshFmt = () => {
    try {
      const b = document.queryCommandState('bold');
      const i = document.queryCommandState('italic');
      const u = document.queryCommandState('underline');
      const s = document.queryCommandState('strikeThrough');
      setFmt((prev) => (prev.bold === b && prev.italic === i && prev.underline === u && prev.strikethrough === s ? prev : { bold: b, italic: i, underline: u, strikethrough: s }));
    } catch {}
  };

  useEffect(() => {
    document.addEventListener('selectionchange', refreshFmt);
    return () => document.removeEventListener('selectionchange', refreshFmt);
  }, []);

  const exportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<null | 'pdf' | 'png'>(null);
  const [dlMenu, setDlMenu] = useState(false);

  const download = async (format: 'pdf' | 'png') => {
    const el = exportRef.current;
    if (!el || downloading) return;
    setDlMenu(false);
    setDownloading(format);
    try {
      const name = (cv.personalInfo.fullName || 'resume').replace(/<[^>]+>/g, '').trim() || 'resume';
      const { toPng, toCanvas } = await import('html-to-image');
      const opts = {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        filter: (n: HTMLElement) => n?.dataset?.pageBreak !== 'true',
      };
      await toPng(el, opts).catch(() => undefined);
      if (format === 'png') {
        const dataUrl = await toPng(el, opts);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${name}.png`;
        a.click();
      } else {
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

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-100 overflow-hidden font-sans border-0 rounded-none">
      
      {/* COLUMN 2 (AI CHAT - LEFT) */}
      <div className="w-full lg:w-[500px] xl:w-[560px] 2xl:w-[600px] flex flex-col bg-white border-r border-slate-200 shrink-0 h-full overflow-hidden">
        
        {/* Top Header of Chat Column */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Back to templates"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-800 truncate">
              Creating a Professional...
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold">
              Interface
            </span>
            <button
              onClick={() => setMessages([{ role: 'assistant', content: 'Started a new chat session. What would you like to build or update?' }])}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              New chat
            </button>
          </div>
        </div>

        {/* Chat Scroll Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-white text-sm">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-2xl text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-slate-100 text-slate-900 border border-slate-200/80 px-4 py-3 max-w-[85%] font-medium'
                    : 'bg-white text-slate-800 p-4.5 max-w-[98%] border border-slate-200/60 shadow-2xs space-y-2'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl px-4 py-2.5 text-sm font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Generating AI resume updates…</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="shrink-0 p-3.5 bg-white border-t border-slate-200">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 focus-within:border-slate-400 focus-within:bg-white transition-all">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none font-normal"
            />

            {/* Bottom Bar inside Input Box */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              
              {/* Left Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="w-6 h-6 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors font-bold text-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>

                <button type="button" className="p-1 hover:bg-slate-200/60 rounded-md text-slate-500">
                  <Folder className="w-3.5 h-3.5" />
                </button>

                <button type="button" className="p-1 hover:bg-slate-200/60 rounded-md text-slate-500">
                  <PenTool className="w-3.5 h-3.5" />
                </button>

                {/* Auto Badge */}
                <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[10px] font-semibold flex items-center gap-1 border border-slate-300/50">
                  <Check className="w-2.5 h-2.5 text-slate-500" />
                  <span>Auto</span>
                </span>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-600 hover:bg-slate-200/60 flex items-center gap-1 border border-slate-200 transition-colors"
                >
                  <span>{selectedModel}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  type="button"
                  className="p-1 hover:bg-slate-200/60 rounded-md text-slate-500"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-7 h-7 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 3 (RESUME CANVAS - RIGHT) */}
      <div className="flex-1 flex flex-col bg-slate-100/90 h-full overflow-hidden relative">
        
        {/* MacOS Window Top Header Bar */}
        <div className="shrink-0 bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            {/* MacOS Traffic Light Dots */}
            <div className="flex items-center gap-1.5 pr-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>

            {/* Tab Title */}
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors border border-slate-200/80">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              <span>Resume</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Download Action */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDlMenu((o) => !o)}
              disabled={!!downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold shadow-2xs hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-slate-700" />}
              <span>{downloading ? (downloading === 'pdf' ? 'PDF…' : 'PNG…') : 'Download'}</span>
            </button>

            {dlMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDlMenu(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden text-xs">
                  <button onClick={() => download('pdf')} className="w-full text-left px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold border-b border-slate-100">
                    Download PDF
                  </button>
                  <button onClick={() => download('png')} className="w-full text-left px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold">
                    Download PNG
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Document Formatting & Toolbar Header */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between flex-wrap gap-2 text-xs shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-xs text-slate-900 pr-2 border-r border-slate-200">
              AI Resume
            </span>

            {/* Undo / Redo */}
            <div className="flex items-center gap-1">
              <button
                title="Undo"
                onMouseDown={(e) => { e.preventDefault(); document.execCommand('undo'); }}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                title="Redo"
                onMouseDown={(e) => { e.preventDefault(); document.execCommand('redo'); }}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Font Family Dropdown */}
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                document.execCommand('fontName', false, e.target.value);
              }}
              className="px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-800 focus:outline-none"
            >
              <option value="Times New Roman">Times New Roman</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Garamond">Garamond</option>
              <option value="Calibri">Calibri</option>
            </select>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Formatting Icons */}
            <div className="flex items-center gap-0.5">
              {([
                { cmd: 'bold', Icon: Bold, label: 'Bold' },
                { cmd: 'italic', Icon: Italic, label: 'Italic' },
                { cmd: 'underline', Icon: Underline, label: 'Underline' },
                { cmd: 'strikeThrough', Icon: Strikethrough, label: 'Strikethrough' },
              ] as const).map(({ cmd, Icon, label }) => (
                <button
                  key={cmd}
                  title={label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    document.execCommand(cmd);
                    refreshFmt();
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    fmt[cmd as keyof typeof fmt]
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Alignments & Lists */}
            <div className="flex items-center gap-0.5">
              <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertUnorderedList'); }} className="w-6 h-6 rounded-md text-slate-600 hover:bg-slate-100 flex items-center justify-center" title="Bullet List">
                <List className="w-3.5 h-3.5" />
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertOrderedList'); }} className="w-6 h-6 rounded-md text-slate-600 hover:bg-slate-100 flex items-center justify-center" title="Numbered List">
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Professional / Student Pill */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5 border border-slate-200">
              {(['professional', 'student'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => external({ ...cv, cvType: t })}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize transition-colors ${
                    (cv.cvType ?? 'professional') === t
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2">
            <button className="text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1">
              <span>Preferences</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <button className="p-1 text-slate-500 hover:text-slate-800 rounded-md">
              <Search className="w-3.5 h-3.5" />
            </button>
            <button className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors">
              Styles
            </button>
          </div>
        </div>

        {/* Live Resume Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex justify-center items-start">
          <div ref={exportRef} className="relative w-full max-w-[820px] bg-white shadow-xl rounded-sm my-2">
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

        {/* Floating ATS Score Badge (matching bottom-right 57 ATS in reference screenshot!) */}
        <div className="fixed bottom-6 right-8 bg-white border-2 border-emerald-500 rounded-full w-14 h-14 shadow-2xl flex flex-col items-center justify-center text-center z-30 font-bold hover:scale-105 transition-transform cursor-pointer">
          <span className="text-sm font-black text-slate-900 leading-none">94</span>
          <span className="text-[8px] font-extrabold text-emerald-600 uppercase tracking-tighter">ATS</span>
        </div>

      </div>

    </div>
  );
};
