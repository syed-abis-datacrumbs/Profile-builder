'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  SlidersHorizontal,
  Trash2
} from 'lucide-react';
import { CvData, cvMarkdownToHtml } from '../lib/cvTypes';
import { getResumeAccentColor } from '../lib/resumeHelpers';
import { CvPreview } from './CvPreview';

// Blank breathing room reserved at the BOTTOM of every page and the TOP of
// every continuation page (page 2+), so content never runs flush to a page
// break. The first page's top spacing already comes from CvPreview's own
// p-8 padding.
//
// Kept smaller than the LMS's 80px on purpose: since a whole section (its
// heading + first entry are one block, never split) moves down together
// when it doesn't fit, a bigger reserved margin means MORE of the page gets
// judged "not enough room" and pushed down as dead space. A smaller margin
// still guarantees a page break never lands flush against the content, but
// gives borderline sections more room to actually fit before being pushed.
const PAGE_MARGIN_PX = 32;

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
  let isFirst = true;
  let guard = 0;
  while (guard++ < 200) {
    const topMargin = isFirst ? 0 : PAGE_MARGIN_PX;
    // Everything left fits within this page's remaining height — no more
    // breaks needed, so no bottom margin needs to be reserved for one.
    if (contentHeight - start <= pageH - topMargin) break;

    const limit = start + (pageH - topMargin - PAGE_MARGIN_PX);
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
    isFirst = false;
  }
  return breaks;
}

/**
 * Finds the nearest fully-white (blank) horizontal row of the canvas to
 * `targetY`, within +/- `range` px. html-to-image can position individual
 * text lines a few px off from the live DOM (baseline/line-height
 * differences), so cutting at a DOM-derived Y can clip a line even when the
 * block math above is right. Snapping the cut to real whitespace guarantees
 * text is never sliced. Ported from the LMS's cvExport.ts (same bug, same fix).
 */
function nearestBlankRow(
  ctx: CanvasRenderingContext2D,
  width: number,
  heightLimit: number,
  targetY: number,
  range: number
): number {
  const rowIsBlank = (y: number): boolean => {
    if (y < 0 || y >= heightLimit) return false;
    const data = ctx.getImageData(0, y, width, 1).data;
    for (let i = 0; i < data.length; i += 4) {
      // Near-white on all channels (tolerates anti-aliasing).
      if (data[i] < 248 || data[i + 1] < 248 || data[i + 2] < 248) return false;
    }
    return true;
  };

  const t = Math.round(targetY);
  if (rowIsBlank(t)) return t;
  for (let d = 1; d <= range; d++) {
    if (rowIsBlank(t + d)) return t + d; // prefer snapping DOWN (keep the block whole on this page)
    if (rowIsBlank(t - d)) return t - d;
  }
  return t; // no blank found — fall back to the target
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
  isLoggedIn: boolean;
  onRequireAuth: () => void;
  /** Prompt typed on the landing page before entering the Studio — sent to
   *  the AI automatically once, on mount. */
  initialPrompt?: string;
}

export const ResumeChatStudio: React.FC<ResumeChatStudioProps> = ({
  cv,
  onChange,
  fieldLabel,
  onBack,
  isLoggedIn,
  onRequireAuth,
  initialPrompt,
}) => {
  // Same accent stripe the template's grid card and preview popup show —
  // derived from fieldLabel (the loaded template's name), so it stays
  // consistent everywhere without threading a colour prop around.
  const accent = getResumeAccentColor(fieldLabel ? { label: fieldLabel } : null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [revision, setRevision] = useState(0);

  // Real undo/redo history of CvData snapshots. document.execCommand('undo')
  // relies on the browser's native contentEditable edit history, which never
  // sees these changes — fields commit via React state on blur
  // (dangerouslySetInnerHTML), and structural changes (bullet style, AI
  // edits, cvType) go through `external` directly, none of which registers
  // as native browser input history. So Undo/Redo need their own stack.
  const [past, setPast] = useState<CvData[]>([]);
  const [future, setFuture] = useState<CvData[]>([]);

  // Ordinary field edits (typing commits on blur, bullet Enter/Backspace/
  // paste) — one history entry per commit, not per keystroke, since RichText
  // only calls onChange on blur. No remount: keeps whatever field the user
  // is still focused in from being ripped out mid-edit.
  //
  // Wrapped in useCallback (keyed on `cv`/`onChange`, not recreated on
  // every render) so this stays referentially stable whenever `cv` itself
  // hasn't changed. CvPreview is React.memo'd on its `data`/`onChange`
  // props specifically so unrelated Studio re-renders (chat input, the
  // page-break ResizeObserver, ATS popover, etc.) don't touch it — but a
  // fresh `recordChange` function every render defeated that: React saw
  // `onChange` as "changed" every time and re-rendered CvPreview anyway,
  // which re-applies `dangerouslySetInnerHTML` and silently wipes out any
  // direct DOM edit (like a manual text-selection delete) made in the
  // brief window before that field's next blur/commit — proven live: a
  // correct deletion was reverted ~13ms later by exactly this cascade.
  const recordChange = useCallback(
    (next: CvData) => {
      setPast((p) => [...p.slice(-99), cv]);
      setFuture([]);
      onChange(next);
    },
    [cv, onChange]
  );

  // Structural changes (toolbar toggles, AI-generated content, cvType
  // switch) — these replace content the currently-focused field doesn't
  // own, so force a remount to refresh every field's displayed HTML.
  const external = (next: CvData) => {
    setPast((p) => [...p.slice(-99), cv]);
    setFuture([]);
    onChange(next);
    setRevision((r) => r + 1);
  };

  const handleUndo = () => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [cv, ...f]);
    onChange(prev);
    setRevision((r) => r + 1);
  };
  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, cv]);
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

  // None of the resume's bullets are real <ul>/<li> elements (each line is
  // its own single-line editable field with a hand-drawn "•"), so the
  // browser's insertUnorderedList/insertOrderedList commands have nothing
  // valid to act on. Instead, find which bullet group the caret is currently
  // in (data-bullet-group, set in CvPreview) and flip its marker style.
  // Work Experience entries each have their own growable list ("we-<i>"), so
  // the style is per-entry; Projects/Workshops/Additional render one bullet
  // per item with no per-entry sub-list, so their style is per-section.
  const setBulletStyleAtFocus = (style: 'bullet' | 'number') => {
    const group = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('[data-bullet-group]');
    const key = group?.dataset.bulletGroup;
    if (!key) return;
    if (key.startsWith('we-')) {
      const idx = Number(key.slice(3));
      if (Number.isNaN(idx)) return;
      external({
        ...cv,
        workExperience: cv.workExperience.map((w, i) => (i === idx ? { ...w, bulletStyle: style } : w)),
      });
    } else if (key === 'projects') {
      external({ ...cv, projectsBulletStyle: style });
    } else if (key === 'workshops') {
      external({ ...cv, workshopsBulletStyle: style });
    } else if (key === 'additional') {
      external({ ...cv, additional: { ...cv.additional, bulletStyle: style } });
    }
  };

  // Saved resumes — persisted per account (Postgres, via /api/resumes),
  // shown in the "Resume" dropdown at the top of the canvas.
  interface SavedResumeMeta { id: string; name: string; createdAt: string }
  const [resumeMenuOpen, setResumeMenuOpen] = useState(false);
  const [savedResumes, setSavedResumes] = useState<SavedResumeMeta[] | null>(null); // null = not fetched yet
  const [saveNameInput, setSaveNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingSavedId, setLoadingSavedId] = useState<string | null>(null);
  const [deletingSavedId, setDeletingSavedId] = useState<string | null>(null);

  const fetchSavedResumes = async () => {
    try {
      const res = await fetch('/api/resumes');
      const json = await res.json();
      setSavedResumes(res.ok ? json.versions ?? [] : []);
    } catch {
      setSavedResumes([]);
    }
  };

  const toggleResumeMenu = () => {
    if (!isLoggedIn) { onRequireAuth(); return; }
    setResumeMenuOpen((open) => {
      const next = !open;
      if (next && savedResumes === null) fetchSavedResumes();
      return next;
    });
  };

  const handleSaveResume = async () => {
    const name = saveNameInput.trim() || fieldLabel || 'Untitled resume';
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data: cv }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error || 'Failed to save.');
        return;
      }
      setSaveNameInput('');
      fetchSavedResumes();
    } catch {
      setSaveError('Failed to save — check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSavedResume = async (id: string) => {
    setLoadingSavedId(id);
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) {
        // A resume saved before the Projects/Workshops field merge would
        // still have the old { title, technologies, description } shape —
        // cvMarkdownToHtml migrates that into the new single `content`
        // field (it's a no-op on already-migrated data), so an old save
        // doesn't break or silently lose its projects/workshops on load.
        external(cvMarkdownToHtml(json.data as CvData));
        setResumeMenuOpen(false);
      }
    } finally {
      setLoadingSavedId(null);
    }
  };

  const handleDeleteSavedResume = async (id: string) => {
    setDeletingSavedId(id);
    try {
      await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      setSavedResumes((prev) => (prev ?? []).filter((r) => r.id !== id));
    } finally {
      setDeletingSavedId(null);
    }
  };

  // Real, AI-scored ATS rating (see /api/ats-score) — replaces what used to
  // be a hardcoded "94". Cached against the exact `cv` object it was scored
  // for, so re-opening the popover without editing anything doesn't spend
  // another OpenAI call; only re-scores on a fresh click after real edits.
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsBreakdown, setAtsBreakdown] = useState<string[]>([]);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsPopoverOpen, setAtsPopoverOpen] = useState(false);
  const [atsError, setAtsError] = useState<string | null>(null);
  const atsScoredCvRef = useRef<CvData | null>(null);

  const handleCheckAts = async () => {
    if (!isLoggedIn) { onRequireAuth(); return; }
    if (atsScore !== null && atsScoredCvRef.current === cv) {
      setAtsPopoverOpen((o) => !o);
      return;
    }
    setAtsLoading(true);
    setAtsError(null);
    setAtsPopoverOpen(true);
    try {
      const res = await fetch('/api/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAtsError(json.error || 'Failed to calculate score.');
        return;
      }
      setAtsScore(json.score);
      setAtsBreakdown(json.breakdown ?? []);
      atsScoredCvRef.current = cv;
    } catch {
      setAtsError('Failed to calculate score — check your connection.');
    } finally {
      setAtsLoading(false);
    }
  };

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
        const canvasCtx = canvas.getContext('2d');
        const snapRange = Math.round(40 * scaleY); // ~40 CSS px search window
        // Snap each break to the nearest real blank row in the RENDERED canvas
        // — html-to-image can shift a text line a few px from where the live
        // DOM measured it, so cutting at the raw DOM coordinate can still
        // slice through a line even though the block-boundary math is right.
        const cuts = [
          ...cutsCss.map((y) => {
            const target = y * scaleY;
            return canvasCtx
              ? nearestBlankRow(canvasCtx, canvas.width, canvas.height, target, snapRange)
              : Math.round(target);
          }),
          canvas.height,
        ];

        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pdfW = pdf.internal.pageSize.getWidth();
        const ptPerCssPx = pdfW / el.offsetWidth;
        // Same PAGE_MARGIN_PX reserved by computePageBreaks — placing each
        // continuation page's image this far down leaves real blank space at
        // the top instead of starting flush against the page edge.
        const marginPt = PAGE_MARGIN_PX * ptPerCssPx;

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
          pdf.addImage(img, 'PNG', 0, idx > 0 ? marginPt : 0, pdfW, imgH);
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

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    if (!isLoggedIn) { onRequireAuth(); return; }
    const nextMessages: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    if (overrideText === undefined) setInput('');
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

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) send(initialPrompt);
    // Run once on mount only — this is a one-time "prompt typed before
    // entering the Studio" hand-off, not something to repeat on re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="w-full lg:w-[380px] xl:w-[420px] 2xl:w-[460px] flex flex-col bg-white border-r border-slate-200 shrink-0 h-full overflow-hidden">
        
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
        </div>

        {/* Chat Scroll Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-white text-sm">
          {messages.length === 0 && !loading && (
            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Try asking</p>
              <div className="flex flex-col gap-2">
                {[
                  'Update my contact details (phone, email, LinkedIn, GitHub)',
                  'Add another work experience or project',
                  'Make my bullet points sound more senior and impactful',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => send(suggestion)}
                    className="text-left px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-end gap-2 focus-within:border-slate-400 focus-within:bg-white transition-all">
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
              className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none font-normal"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="w-7 h-7 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* COLUMN 3 (RESUME CANVAS - RIGHT) */}
      <div className="flex-1 flex flex-col bg-slate-100/90 h-full overflow-hidden relative">
        
        {/* MacOS Window Single Unified Toolbar Header */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 text-xs shadow-2xs overflow-x-auto">
          
          {/* Left Controls Group */}
          <div className="flex items-center gap-2 shrink-0">
            {/* MacOS Traffic Light Dots */}
            <div className="flex items-center gap-1.5 pr-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>

            {/* Resume Save/Load Dropdown */}
            <div className="relative">
              <button
                onClick={toggleResumeMenu}
                className="h-7 px-3 rounded-lg bg-slate-100 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors border border-slate-200/80 flex items-center justify-center gap-1.5 leading-none cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="leading-none">Saved Resumes</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {resumeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setResumeMenuOpen(false)} />
                  <div className="absolute left-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden text-xs">
                    <div className="p-3 border-b border-slate-100 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={saveNameInput}
                          onChange={(e) => setSaveNameInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveResume(); }}
                          placeholder={fieldLabel || 'Name this resume…'}
                          className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400"
                        />
                        <button
                          onClick={handleSaveResume}
                          disabled={saving}
                          className="h-7 px-3 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center leading-none"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                        </button>
                      </div>
                      {saveError && <p className="text-red-600 font-medium">{saveError}</p>}
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {savedResumes === null ? (
                        <div className="px-3.5 py-4 text-slate-400 flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading saved resumes…</span>
                        </div>
                      ) : savedResumes.length === 0 ? (
                        <div className="px-3.5 py-4 text-slate-400">No saved resumes yet.</div>
                      ) : (
                        savedResumes.map((r) => (
                          <div key={r.id} className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 group">
                            <button
                              onClick={() => handleLoadSavedResume(r.id)}
                              disabled={loadingSavedId === r.id}
                              className="flex-1 min-w-0 text-left"
                            >
                              <div className="font-semibold text-slate-800 truncate">{r.name}</div>
                              <div className="text-slate-400 text-[10px]">{new Date(r.createdAt).toLocaleDateString()}</div>
                            </button>
                            <div className="flex items-center gap-1 shrink-0 pl-2">
                              {loadingSavedId === r.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                              <button
                                onClick={() => handleDeleteSavedResume(r.id)}
                                disabled={deletingSavedId === r.id}
                                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete"
                              >
                                {deletingSavedId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5">
              <button
                title="Undo"
                onMouseDown={(e) => { e.preventDefault(); handleUndo(); }}
                disabled={past.length === 0}
                className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${past.length === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                title="Redo"
                onMouseDown={(e) => { e.preventDefault(); handleRedo(); }}
                disabled={future.length === 0}
                className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${future.length === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            {/* Font Family Dropdown */}
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                document.execCommand('fontName', false, e.target.value);
              }}
              className="h-7 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-800 focus:outline-none flex items-center justify-center leading-none cursor-pointer"
            >
              <option value="Times New Roman">Times New Roman</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Garamond">Garamond</option>
              <option value="Calibri">Calibri</option>
            </select>

            <div className="h-4 w-px bg-slate-200 mx-0.5" />

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
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    fmt[cmd as keyof typeof fmt]
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            {/* Lists */}
            <div className="flex items-center gap-0.5">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setBulletStyleAtFocus('bullet');
                }}
                className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setBulletStyleAtFocus('number');
                }}
                className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Controls Group */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Professional / Student Pill */}
            <div className="h-7 flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              {(['professional', 'student'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => external({ ...cv, cvType: t })}
                  className={`h-6 px-2.5 rounded-md text-[10px] font-bold capitalize transition-colors flex items-center justify-center leading-none text-center cursor-pointer ${
                    (cv.cvType ?? 'professional') === t
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Download Action */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDlMenu((o) => !o)}
                disabled={!!downloading}
                className="h-7 px-3.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 leading-none text-center cursor-pointer disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span className="leading-none">
                  {downloading ? (downloading === 'pdf' ? 'PDF…' : 'PNG…') : 'Download'}
                </span>
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

        </div>

        {/* Live Resume Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex justify-center items-start">
          {/* Accent border lives on this wrapper, not exportRef itself —
              exportRef is captured pixel-for-pixel for PDF/PNG export, and
              this stripe is an editor-only cue, not part of the resume. */}
          <div className="w-full max-w-[820px] my-2 rounded-sm" style={{ borderTop: `4px solid ${accent}` }}>
            <div ref={exportRef} className="relative w-full bg-white shadow-xl rounded-b-sm">
              <CvPreview key={revision} data={cv} onChange={recordChange} />
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

        {/* Floating ATS Score Badge — click to calculate a real, AI-scored
            rating for the current resume content (see /api/ats-score). */}
        <div className="fixed bottom-6 right-8 z-30">
          <button
            onClick={handleCheckAts}
            disabled={atsLoading}
            className="bg-white border-2 border-emerald-500 rounded-full w-14 h-14 shadow-2xl flex flex-col items-center justify-center text-center font-bold hover:scale-105 transition-transform cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
          >
            {atsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <>
                <span className="text-sm font-black text-slate-900 leading-none">{atsScore ?? '–'}</span>
                <span className="text-[8px] font-extrabold text-emerald-600 uppercase tracking-tighter">ATS</span>
              </>
            )}
          </button>

          {atsPopoverOpen && !atsLoading && (atsScore !== null || atsError) && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAtsPopoverOpen(false)} />
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-3.5 text-xs">
                {atsError ? (
                  <p className="text-red-600 font-medium">{atsError}</p>
                ) : (
                  <>
                    <div className="font-bold text-slate-900 mb-2">ATS Score: {atsScore}</div>
                    <ul className="space-y-1.5 text-slate-600">
                      {atsBreakdown.map((b, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span className="shrink-0">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
