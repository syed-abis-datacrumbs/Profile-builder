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
  Trash2,
  Edit2,
  Check,
  Plus,
  X
} from 'lucide-react';
import { CvData, cvMarkdownToHtml } from '../lib/cvTypes';
import { getResumeAccentColor } from '../lib/resumeHelpers';
import { CvPreview } from './CvPreview';
import { PaginatedCvPreview } from './PaginatedCvPreview';
import { measureBlocks, paginateCvSmart, PAGE_WIDTH_PX } from '../lib/cvPagination';
import { PaymentModal } from './PaymentModal';
import { MobileChatWidget } from './MobileChatWidget';

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

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

interface NameStatus {
  fullName: string;
  editsUsed: number;
  editsRemaining: number;
  pendingRequest: { id: string; requestedName: string; createdAt: string } | null;
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
  setMobileHeaderRight?: (node: React.ReactNode) => void;
  /** Full name from Clerk registration — auto-seeds the locked name on a
   *  user's very first visit (no need to type it manually). */
  clerkName?: string;
}

export const ResumeChatStudio: React.FC<ResumeChatStudioProps> = ({
  cv,
  onChange,
  fieldLabel,
  onBack,
  isLoggedIn,
  onRequireAuth,
  initialPrompt,
  setMobileHeaderRight,
  clerkName,
}) => {
  // Same accent stripe the template's grid card and preview popup show —
  // derived from fieldLabel (the loaded template's name), so it stays
  // consistent everywhere without threading a colour prop around.
  const accent = getResumeAccentColor(fieldLabel ? { label: fieldLabel } : null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [targetJob, setTargetJob] = useState('');
  const [targetJobModalOpen, setTargetJobModalOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
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
    } catch { }
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

  // ─── Download Name Limit State ───────────────────────────────────────────
  const [downloadLimitData, setDownloadLimitData] = useState<{
    requestedName: string;
    downloadedNames: string[];
    pendingRequest: { requestedName: string; createdAt: string } | null;
  } | null>(null);
  const [downloadLimitSubmitting, setDownloadLimitSubmitting] = useState(false);

  // Fetch the user's name-lock status on mount (authenticated only).
  // We still do this to auto-seed the Clerk name if they have no saves yet.
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('/api/resumes/name')
      .then((r) => r.json())
      .then(async (data) => {
        // Auto-seed: first-time user has no locked name yet, but we have the
        // Clerk registration name — apply it silently so their first resume has a name.
        if (!data.fullName && clerkName) {
          onChange({ ...cv, personalInfo: { ...cv.personalInfo, fullName: clerkName } });
        }
      })
      .catch(() => {/* silent */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Request admin approval to add a new name to the allowed downloads list
  const requestDownloadName = async (typedName: string) => {
    const trimmed = typedName.trim();
    if (!trimmed || downloadLimitSubmitting) return;
    setDownloadLimitSubmitting(true);
    try {
      const res = await fetch('/api/resumes/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: trimmed }),
      });
      const result = await res.json();
      if (result.status === 'pendingCreated' || result.status === 'pending') {
        setDownloadLimitData((prev) => prev ? { 
          ...prev, 
          pendingRequest: { requestedName: trimmed, createdAt: new Date().toISOString() } 
        } : prev);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadLimitSubmitting(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Saved resumes — persisted per account (Postgres, via /api/resumes),
  // shown in the "Resume" dropdown at the top of the canvas.
  interface SavedResumeMeta { id: string; name: string; createdAt: string }
  const [resumeMenuOpen, setResumeMenuOpen] = useState(false);
  const [savedResumes, setSavedResumes] = useState<SavedResumeMeta[] | null>(null); // null = not fetched yet
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [activeSavedName, setActiveSavedName] = useState<string | null>(null);
  const [saveNameInput, setSaveNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingSavedId, setLoadingSavedId] = useState<string | null>(null);
  const [deletingSavedId, setDeletingSavedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState<string>('');
  const chatTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!input && chatTextareaRef.current) {
      chatTextareaRef.current.style.height = 'auto';
    }
  }, [input]);

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

  const handleSaveResume = async (forceNew = false) => {
    const targetId = forceNew ? undefined : (activeSavedId || undefined);
    const name = saveNameInput.trim() || activeSavedName || fieldLabel || 'Untitled resume';
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId, name, data: cv }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error || 'Failed to save.');
        return;
      }
      if (json.id) {
        setActiveSavedId(json.id);
        setActiveSavedName(json.name || name);
        setSaveNameInput(json.name || name);
      }
      fetchSavedResumes();
    } catch {
      setSaveError('Failed to save — check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSavedResume = async (r: SavedResumeMeta) => {
    setLoadingSavedId(r.id);
    try {
      const res = await fetch(`/api/resumes/${r.id}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) {
        external(cvMarkdownToHtml(json.data as CvData));
        setActiveSavedId(r.id);
        setActiveSavedName(r.name);
        setSaveNameInput(r.name);
        setResumeMenuOpen(false);
      }
    } finally {
      setLoadingSavedId(null);
    }
  };

  const handleRenameSavedResume = async (id: string, newName: string) => {
    if (!newName.trim()) { setRenamingId(null); return; }
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setSavedResumes((prev) =>
          (prev ?? []).map((item) => (item.id === id ? { ...item, name: newName.trim() } : item))
        );
        if (activeSavedId === id) {
          setActiveSavedName(newName.trim());
          setSaveNameInput(newName.trim());
        }
      }
    } finally {
      setRenamingId(null);
    }
  };

  const handleDeleteSavedResume = async (id: string) => {
    setDeletingSavedId(id);
    try {
      await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      setSavedResumes((prev) => (prev ?? []).filter((r) => r.id !== id));
      if (activeSavedId === id) {
        setActiveSavedId(null);
        setActiveSavedName(null);
      }
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
  const atsScoredJobRef = useRef<string>('');

  const handleCheckAts = async () => {
    if (!isLoggedIn) { onRequireAuth(); return; }
    // Always re-score — never use cache if job description or cv changed
    const cvChanged = atsScoredCvRef.current !== cv;
    const jobChanged = atsScoredJobRef.current !== targetJob;
    if (atsScore !== null && !cvChanged && !jobChanged) {
      // Nothing changed — just toggle the popover open/closed
      setAtsPopoverOpen((o) => !o);
      return;
    }
    // Something changed (cv or job description) — always fire fresh API call
    setAtsLoading(true);
    setAtsError(null);
    setAtsPopoverOpen(true);
    try {
      const res = await fetch('/api/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jobDescription: targetJob }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAtsError(json.error || 'Failed to calculate score.');
        return;
      }
      setAtsScore(json.score);
      setAtsBreakdown(json.breakdown ?? []);
      atsScoredCvRef.current = cv;
      atsScoredJobRef.current = targetJob;
    } catch {
      setAtsError('Failed to calculate score — check your connection.');
    } finally {
      setAtsLoading(false);
    }
  };

  const handleCheckAtsRef = useRef(handleCheckAts);
  handleCheckAtsRef.current = handleCheckAts;

  // Safely register ATS score badge & Target Job button into top mobile navbar
  useEffect(() => {
    if (!setMobileHeaderRight) return;
    setMobileHeaderRight(
      <div className="flex items-center gap-1.5 shrink-0">
        {/* ATS Score Badge */}
        <div className="relative shrink-0">
          <button
            onClick={() => handleCheckAtsRef.current()}
            disabled={atsLoading}
            className="h-7 px-2 rounded-lg bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/80 text-slate-900 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-70 shadow-2xs"
            title="Check ATS Score"
          >
            {atsLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <>
                <span className="font-black text-slate-900 text-xs">{atsScore ?? '–'}</span>
                <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-tight">ATS</span>
              </>
            )}
          </button>

          {atsPopoverOpen && !atsLoading && (atsScore !== null || atsError) && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setAtsPopoverOpen(false)} />
              <div className="absolute top-9 right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3.5 text-xs text-left">
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

        {/* Target Job Match Button */}
        <div className="relative shrink-0">
          <button
            onClick={() => setTargetJobModalOpen(true)}
            className={`h-7 px-2.5 rounded-full text-[11px] font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer border ${
              targetJob.trim()
                ? 'bg-emerald-50 text-emerald-700 border-emerald-400 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${targetJob.trim() ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>Target Job</span>
          </button>
        </div>
      </div>
    );
    return () => setMobileHeaderRight(null);
  }, [setMobileHeaderRight, atsScore, atsLoading, atsPopoverOpen, atsError, targetJob]);

  const exportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<null | 'pdf' | 'png'>(null);
  const [dlMenu, setDlMenu] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
    }
  }, []);

  // Whether this account has paid to remove the watermark — null until the
  // first status check resolves. Same one-time-payment model as LMS's CV
  // Builder ("everyone can build/export for free; paying removes a
  // watermark baked into the exported file, download itself is never
  // blocked"). Re-checked on mount only; the PaymentModal flips this to
  // true directly on approval rather than re-fetching.
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [aiMessagesUsed, setAiMessagesUsed] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetch('/api/payment/status')
      .then((r) => r.json())
      .then((d: { unlocked: boolean, aiMessagesUsed: number }) => {
        setUnlocked(d.unlocked);
        setAiMessagesUsed(d.aiMessagesUsed || 0);
      })
      .catch(() => setUnlocked(false));
  }, []);

  // Temporarily injects rotated, translucent "Momentum" watermark divs into
  // the live export DOM, positioned absolutely (so they scroll with content,
  // tiled one per page-height band) — removed again right after export.
  const injectWatermarks = (el: HTMLElement): HTMLElement[] => {
    const injected: HTMLElement[] = [];
    const contentWidth = el.scrollWidth || el.offsetWidth;
    const contentHeight = el.scrollHeight || el.offsetHeight;
    const pageHeight = Math.round(contentWidth * 1.4142);
    for (let y = pageHeight / 2; y < contentHeight + pageHeight; y += pageHeight) {
      const div = document.createElement('div');
      div.setAttribute('data-watermark', 'true');
      Object.assign(div.style, {
        position: 'absolute',
        left: '0',
        top: `${y}px`,
        width: '100%',
        textAlign: 'center',
        transform: 'translateY(-50%) rotate(-30deg)',
        fontSize: `${Math.round(contentWidth * 0.1)}px`,
        fontWeight: '700',
        fontFamily: 'Arial, sans-serif',
        color: 'rgba(15, 23, 42, 0.12)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: '9999',
      });
      div.textContent = 'Momentum';
      el.appendChild(div);
      injected.push(div);
    }
    return injected;
  };
  const removeWatermarks = (injected: HTMLElement[]) => injected.forEach((n) => n.remove());

  const download = async (format: 'pdf' | 'png') => {
    const el = exportRef.current;
    if (!el || downloading) return;

    // Check Name Download Lock
    try {
      const res = await fetch('/api/resumes/download-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedName: cv.personalInfo?.fullName || '' }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to check download limits');
      }
      if (!result.allowed) {
        setDownloadLimitData({
          requestedName: result.requestedName || '',
          downloadedNames: result.downloadedNames || [],
          pendingRequest: result.pendingRequest || null,
        });
        return; // Block download
      }
    } catch (e) {
      console.error('Download check failed:', e);
      // Fail safe:
      alert('Could not verify download limits. Please check your connection.');
      return;
    }

    const watermarkNodes = unlocked ? [] : injectWatermarks(el);
    try {
      setDownloading(format);
      const name = (cv.personalInfo.fullName || 'Resume').replace(/[^a-z0-9]/gi, '_');

      if (format === 'png') {
        const { toPng } = await import('html-to-image');
        const origPosition = el.style.position;
        const origLeft = el.style.left;
        const origTop = el.style.top;
        const origZIndex = el.style.zIndex;

        el.style.position = 'fixed';
        el.style.top = '0px';
        el.style.left = '0px';
        el.style.zIndex = '-9999';

        try {
          const opts = {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            cacheBust: true,
            filter: (n: HTMLElement) => n?.dataset?.pageBreak !== 'true',
          };
          const dataUrl = await toPng(el, opts);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `${name}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } finally {
          el.style.position = origPosition;
          el.style.left = origLeft;
          el.style.top = origTop;
          el.style.zIndex = origZIndex;
        }
      } else {
        // Server-side PDF via Puppeteer — no print popup, fully selectable text.
        // We send the JS-calculated slice positions so Puppeteer clips each page
        // to EXACTLY the same range as the editor's paginated preview.
        const inlineStyles = Array.from(document.querySelectorAll('style'))
          .map((s) => s.textContent ?? '')
          .join('\n');

        // Measure the hidden export copy (same DOM the paginated preview uses)
        const contentHeight = el.offsetHeight;
        const blocks = measureBlocks(el);
        const pages = paginateCvSmart(contentHeight, blocks);

        const res = await fetch('/api/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            html: el.innerHTML,
            css: inlineStyles,
            name,
            pages,          // exact slice positions from paginateCvSmart
            contentWidth: PAGE_WIDTH_PX,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail ?? 'PDF generation failed');
        }

        const blob = await res.blob();
        if (blob.size === 0) {
          throw new Error('Server returned an empty PDF.');
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    } catch (err: any) {
      console.error('Resume download failed', err);
      alert(`Download failed: ${err.message || 'Please try again.'}`);
    } finally {
      removeWatermarks(watermarkNodes);
      setDownloading(null);
      setDlMenu(false);
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
        body: JSON.stringify({ 
          messages: nextMessages, 
          cv, 
          targetJob,
          sessionId: sessionIdRef.current,
          isAutoFit: overrideText !== undefined 
        }),
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



  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-100 overflow-hidden font-sans border-0 rounded-none relative">

      {/* COLUMN 2 (AI CHAT - LEFT: Visible only on Desktop lg screens and up) */}
      <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] 2xl:w-[460px] flex-col bg-white border-r border-slate-200 shrink-0 h-full overflow-hidden">

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
            {/* <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden lg:block" /> */}
          </div>
        </div>

        {/* Chat Scroll Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-white text-sm">
          {messages.length === 0 && !loading && (
            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Try asking</p>
              <div className="flex flex-row lg:flex-col gap-3 lg:gap-2 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 -mx-5 px-5 lg:mx-0 lg:px-0 snap-x lg:snap-none hide-scrollbar">
                {[
                  'Update my contact details (phone, email, LinkedIn, GitHub)',
                  'Add another work experience or project',
                  'Make my bullet points sound more senior and impactful',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => send(suggestion)}
                    className="shrink-0 snap-start w-[240px] lg:w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:border-slate-300 hover:bg-slate-50 transition-colors whitespace-normal"
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
                className={`rounded-2xl text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${m.role === 'user'
                    ? 'bg-slate-100 text-slate-900 border border-slate-200/80 px-4 py-3 max-w-[85%] font-medium'
                    : 'bg-white text-slate-800 p-4.5 max-w-[98%] border border-slate-200/60 shadow-2xs space-y-2'
                  }`}
              >
                {(() => {
                  if (!m.content.includes('**')) return m.content;
                  const parts = m.content.split(/(\*\*.*?\*\*)/g);
                  return parts.map((part, idx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={idx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  });
                })()}
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
        <div className="shrink-0 p-3.5 bg-white border-t border-slate-200 flex flex-col gap-2">
          {targetJob.trim() && (
            <button
              onClick={() => send("Please analyze my resume against my target job description. Rewrite my bullet points and add missing keywords to perfectly match the ATS requirements.")}
              disabled={loading}
              className="self-start text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Inject ATS Keywords
            </button>
          )}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 focus-within:border-slate-400 focus-within:bg-white transition-all shadow-2xs">
            <textarea
              ref={chatTextareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={aiMessagesUsed >= 5 && !unlocked ? "AI Limit Reached. Upgrade to Pro." : "Ask anything..."}
              disabled={aiMessagesUsed >= 5 && !unlocked}
              className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none font-normal disabled:opacity-50 disabled:cursor-not-allowed max-h-32 leading-snug py-0.5"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading || (aiMessagesUsed >= 5 && !unlocked)}
              className="w-8 h-8 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* COLUMN 3 (RESUME CANVAS - RIGHT: Full screen on Mobile) */}
      <div className="w-full h-full lg:flex-1 shrink-0 lg:h-full flex flex-col bg-slate-100/90 overflow-hidden relative">

        {/* MacOS Window Single Unified Toolbar Header */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-2.5 py-1.5 flex items-center justify-between gap-1 text-xs shadow-2xs overflow-x-auto hide-scrollbar z-30 whitespace-nowrap min-w-0">

          {/* Left Controls Group */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* MacOS Traffic Light Dots */}
            <div className="hidden sm:flex items-center gap-1.5 pr-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>

            {/* Resume Save/Load Dropdown */}
            <div className="relative">
              <button
                onClick={toggleResumeMenu}
                className="h-7 px-1.5 sm:px-2 rounded-lg bg-slate-100 text-[11px] sm:text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors border border-slate-200/80 flex items-center justify-center gap-1 leading-none cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="leading-none">Resumes</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {resumeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setResumeMenuOpen(false)} />
                  <div className="fixed top-12 left-3 sm:left-auto w-[285px] max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden text-xs">
                    {/* Top Action Header */}
                    <div className="p-3 bg-slate-50/90 border-b border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                          Saved Resumes
                        </span>
                        {activeSavedId && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                            Editing Active
                          </span>
                        )}
                      </div>

                      {/* Full-width Name Input */}
                      <input
                        type="text"
                        value={saveNameInput}
                        onChange={(e) => setSaveNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveResume(!activeSavedId);
                        }}
                        placeholder={fieldLabel || 'Resume title (e.g. Software Engineer)…'}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 bg-white shadow-2xs"
                      />

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {activeSavedId ? (
                          <>
                            <button
                              onClick={() => handleSaveResume(false)}
                              disabled={saving}
                              className="flex-1 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update Active'}
                            </button>
                            <button
                              onClick={() => handleSaveResume(true)}
                              disabled={saving}
                              className="h-7 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Save as a new separate resume copy"
                            >
                              <Plus className="w-3.5 h-3.5 text-blue-600" />
                              <span>Save New</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleSaveResume(true)}
                            disabled={saving}
                            className="w-full h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save New Resume'}
                          </button>
                        )}
                      </div>
                    </div>
                    {saveError && <div className="px-2.5 py-1 bg-rose-50 text-rose-600 font-medium text-[10px] border-b border-rose-100">{saveError}</div>}

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {savedResumes === null ? (
                        <div className="px-3.5 py-4 text-slate-400 flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading saved resumes…</span>
                        </div>
                      ) : savedResumes.length === 0 ? (
                        <div className="px-3.5 py-4 text-slate-400 text-center">No saved resumes yet.</div>
                      ) : (
                        savedResumes.map((r) => {
                          const isSelected = activeSavedId === r.id;
                          const isRenaming = renamingId === r.id;

                          return (
                            <div
                              key={r.id}
                              className={`flex items-center justify-between px-3 py-2 transition-colors group ${
                                isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                              }`}
                            >
                              {isRenaming ? (
                                <div className="flex items-center gap-1 flex-1 min-w-0 pr-1">
                                  <input
                                    type="text"
                                    value={renameInput}
                                    onChange={(e) => setRenameInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleRenameSavedResume(r.id, renameInput);
                                      if (e.key === 'Escape') setRenamingId(null);
                                    }}
                                    autoFocus
                                    className="flex-1 px-1.5 py-0.5 border border-blue-400 rounded text-xs text-slate-900 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleRenameSavedResume(r.id, renameInput)}
                                    className="p-1 rounded text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                    title="Save name"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setRenamingId(null)}
                                    className="p-1 rounded text-slate-400 hover:bg-slate-100 cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleLoadSavedResume(r)}
                                    disabled={loadingSavedId === r.id}
                                    className="flex-1 min-w-0 text-left cursor-pointer"
                                  >
                                    <div className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                                      <span className="truncate">{r.name}</span>
                                      {isSelected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                      )}
                                    </div>
                                    <div className="text-slate-400 text-[10px]">
                                      {new Date(r.createdAt).toLocaleDateString()}
                                    </div>
                                  </button>

                                  <div className="flex items-center gap-0.5 shrink-0 pl-1">
                                    {loadingSavedId === r.id && (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRenamingId(r.id);
                                        setRenameInput(r.name);
                                      }}
                                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      title="Rename"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSavedResume(r.id);
                                      }}
                                      disabled={deletingSavedId === r.id}
                                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Delete"
                                    >
                                      {deletingSavedId === r.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      )}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="hidden sm:block h-4 w-px bg-slate-200" />

            {/* Undo / Redo */}
            <div className="hidden 2xl:flex items-center gap-0.5">
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

            {/* Formatting Icons */}
            <div className="flex items-center gap-0">
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
                  className={`w-6 sm:w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${fmt[cmd as keyof typeof fmt]
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Controls Group */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">

            {/* ATS Score Badge in Toolbar (Desktop only) */}
            <div className="relative shrink-0 hidden xl:block">
              <button
                onClick={handleCheckAts}
                disabled={atsLoading}
                className="h-7 px-1.5 sm:px-2 rounded-lg bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/80 text-slate-900 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-70 shadow-2xs"
                title="Check ATS Score"
              >
                {atsLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <>
                    <span className="font-black text-slate-900 text-xs">{atsScore ?? '–'}</span>
                    <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-tight">ATS</span>
                  </>
                )}
              </button>

              {atsPopoverOpen && !atsLoading && (atsScore !== null || atsError) && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAtsPopoverOpen(false)} />
                  <div className="absolute top-9 right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3.5 text-xs text-left">
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

            {/* Target Job Match Button (Desktop only) */}
            <div className="relative shrink-0 hidden xl:block">
              <button
                onClick={() => setTargetJobModalOpen(!targetJobModalOpen)}
                className={`h-7 px-2 sm:px-2.5 rounded-full text-[11px] font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer border ${
                  targetJob.trim()
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-400 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${targetJob.trim() ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>Target Job Match</span>
              </button>
            </div>

            {/* Professional / Student Pill */}
            <div className="h-7 flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
              {(['professional', 'student'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => external({ ...cv, cvType: t })}
                  className={`h-6 px-1.5 sm:px-2.5 rounded-md text-[10px] font-bold capitalize transition-colors flex items-center justify-center leading-none text-center cursor-pointer ${(cv.cvType ?? 'professional') === t
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Download Action */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDlMenu((o) => !o)}
                disabled={!!downloading}
                className="h-7 px-2 sm:px-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-1 leading-none text-center cursor-pointer disabled:opacity-70 shrink-0"
              >
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span className="leading-none hidden sm:inline">
                  {downloading ? (downloading === 'pdf' ? 'PDF…' : 'PNG…') : 'Download'}
                </span>
              </button>

              {dlMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDlMenu(false)} />
                  <div className="fixed top-12 right-4 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs">
                    <button
                      onClick={() => download('pdf')}
                      disabled={!!downloading}
                      className="w-full text-left px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold border-b border-slate-100 flex items-center justify-between cursor-pointer disabled:opacity-60"
                    >
                      <span>Download PDF</span>
                      {downloading === 'pdf' && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />}
                    </button>
                    <button
                      onClick={() => download('png')}
                      disabled={!!downloading}
                      className="w-full text-left px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold flex items-center justify-between cursor-pointer disabled:opacity-60"
                    >
                      <span>Download PNG</span>
                      {downloading === 'png' && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />}
                    </button>
                    {unlocked === false && (
                      <button
                        onClick={() => {
                          setDlMenu(false);
                          if (!isLoggedIn) { onRequireAuth(); return; }
                          setShowPaymentModal(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold border-t border-amber-200/80 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Upgrade to remove watermark</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {showPaymentModal && (
            <PaymentModal
              reason="Remove the watermark from your Resume downloads"
              onApproved={() => {
                setUnlocked(true);
                setShowPaymentModal(false);
              }}
              onClose={() => setShowPaymentModal(false)}
            />
          )}

        </div>

        {/* Live Resume Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex justify-center items-start">
          <PaginatedCvPreview
            data={cv}
            exportRef={exportRef}
            accentColor={accent}
            onChange={recordChange}
          />
        </div>

      {/* Target Job Matcher Centered Pop-up Modal */}
      {targetJobModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setTargetJobModalOpen(false)} />
          <div className="relative w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                🎯 Target Job Matcher
              </h3>
              <button onClick={() => setTargetJobModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-3 min-h-0">
              <p className="text-[11px] text-slate-500 leading-relaxed text-left">
                Paste the raw text of the job description you are applying for. The ATS score and AI Chat will automatically adapt to aggressively optimize your resume for these specific requirements.
              </p>
              <textarea
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="Paste job description here..."
                className="flex-1 min-h-[200px] w-full resize-none p-3 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-left"
              />
            </div>
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  setTargetJob('');
                  setTargetJobModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setTargetJobModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                {targetJob.trim() ? 'Save Target Job' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Reusable Floating Mobile Chatbot Widget */}
      <MobileChatWidget
        isOpen={isMobileChatOpen}
        onToggle={() => setIsMobileChatOpen((prev) => !prev)}
        messages={messages}
        input={input}
        setInput={setInput}
        loading={loading}
        onSend={send}
        title="Creating a Professional Resume..."
        suggestions={[
          'Update my contact details (phone, email, LinkedIn, GitHub)',
          'Add another work experience or project',
          'Make my bullet points sound more senior and impactful',
        ]}
        onBack={() => setIsMobileChatOpen(false)}
        isLoggedIn={isLoggedIn}
        onRequireAuth={onRequireAuth}
        badgeAction={
          targetJob.trim() ? (
            <button
              onClick={() => send("Please analyze my resume against my target job description. Rewrite my bullet points and add missing keywords to perfectly match the ATS requirements.")}
              disabled={loading}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Inject ATS Keywords
            </button>
          ) : undefined
        }
      />

      {/* ── Download Limit: Notification Dialog ────────────────────── */}
      {downloadLimitData && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 mx-auto bg-amber-50 border border-amber-200">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            </div>
            
            <h3 className="text-base font-bold text-slate-900 text-center mb-2">Maximum Download Names Reached</h3>
            <p className="text-xs text-slate-600 text-center mb-4 leading-relaxed">
              You have already downloaded resumes using 4 different names. To download a resume as <strong>"{downloadLimitData.requestedName}"</strong>, you must request admin approval.
            </p>

            <div className="mb-5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Previously Downloaded Names</p>
              <div className="flex flex-wrap gap-1.5">
                {downloadLimitData.downloadedNames.map((n, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">{n}</span>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 leading-snug">
                You can freely download resumes using any of these previously approved names.
              </p>
            </div>

            {downloadLimitData.pendingRequest ? (
              <div className="w-full text-center px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-3">
                Your request for "{downloadLimitData.pendingRequest.requestedName}" is currently pending admin approval.
              </div>
            ) : (
              <button
                onClick={() => requestDownloadName(downloadLimitData.requestedName)}
                disabled={downloadLimitSubmitting}
                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors cursor-pointer mb-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloadLimitSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Request Approval
              </button>
            )}

            <button
              onClick={() => setDownloadLimitData(null)}
              className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
