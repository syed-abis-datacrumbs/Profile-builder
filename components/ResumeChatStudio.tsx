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
  Target,
  X,
  Bug,
  LayoutTemplate,
  AlertTriangle,
} from 'lucide-react';
import { CvData, cvMarkdownToHtml } from '../lib/cvTypes';
import { getResumeAccentColor } from '../lib/resumeHelpers';
import { LMS_RESUME_SAMPLES } from '../lib/resumeSamples';
import { CvPreview } from './CvPreview';
import { PaginatedCvPreview } from './PaginatedCvPreview';
import { measureBlocks, paginateCvSmart, PAGE_WIDTH_PX } from '../lib/cvPagination';
import { PaymentModal } from './PaymentModal';
import { MobileChatWidget } from './MobileChatWidget';
import toast from '@/lib/toast';

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
  isPro?: boolean;
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
  isPro,
}) => {
  // Same accent stripe the template's grid card and preview popup show —
  // derived from fieldLabel (the loaded template's name), so it stays
  // consistent everywhere without threading a colour prop around.
  const accent = getResumeAccentColor(fieldLabel ? { label: fieldLabel } : null);

  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('profile_builder_resume_chat');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profile_builder_resume_chat', JSON.stringify(messages));
    }
  }, [messages]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [targetJob, setTargetJob] = useState('');
  const [targetJobModalOpen, setTargetJobModalOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [issueImage, setIssueImage] = useState<string | null>(null);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success', duration = 1750) => {
    if (type === 'error') {
      toast.error(msg, duration);
    } else {
      toast.success(msg, duration);
    }
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSentInitialPromptRef = useRef(false);

  const [revision, setRevision] = useState(0);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
      setAtsScore(null);
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
    setAtsScore(null);
  };

  const handleReportIssue = async () => {
    if (!issueText.trim()) return;
    setIsSubmittingIssue(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: issueText, imageBase64: issueImage, category: 'resume' }),
      });
      if (!res.ok) throw new Error('Failed to submit issue');
      showToast('Issue reported successfully. Thank you!');
      setReportIssueModalOpen(false);
      setIssueText('');
      setIssueImage(null);
    } catch (e: any) {
      showToast('Failed to submit issue: ' + e.message, 'error');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [cv, ...f]);
    onChange(prev);
    setRevision((r) => r + 1);
  }, [past, cv, onChange]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, cv]);
    onChange(next);
    setRevision((r) => r + 1);
  }, [future, cv, onChange]);

  // Keyboard shortcut listener (Ctrl+Z / Ctrl+Y / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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
        if (!data.fullName && !cv.personalInfo?.fullName && clerkName) {
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

  const handleCheckAts = async (autoTriggered = false, overrideJob?: string) => {
    if (!isLoggedIn) { onRequireAuth(); return; }
    const activeJob = overrideJob !== undefined ? overrideJob : targetJob;
    setAtsLoading(true);
    setAtsError(null);
    try {
      const res = await fetch('/api/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jobDescription: activeJob }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAtsError(json.error || 'Failed to calculate score.');
        return;
      }
      const scoreNum = json.score;
      setAtsScore(scoreNum);
      setAtsBreakdown(json.breakdown ?? []);
      atsScoredCvRef.current = cv;
      atsScoredJobRef.current = activeJob;

      // Post latest analysis & recommended actions directly to chat
      if (Array.isArray(json.breakdown) && json.breakdown.length > 0) {
        const breakdownItems = (json.breakdown as string[]).map((item) => `• ${item}`).join('\n');
        const recMsg = scoreNum >= 95
          ? `🎯 **Target Job ATS Match Score: ${scoreNum}%** (Target: 95%+)\n\n**Analysis & Breakdown:**\n${breakdownItems}\n\n✨ *Outstanding! Your resume achieves a 95%+ ATS compatibility score.*`
          : `🎯 **Target Job ATS Match Score: ${scoreNum}%** (Target: 95%+)\n\n**Analysis & Recommended Actions:**\n${breakdownItems}\n\n💡 *Ask me to optimize your resume or click "Auto-Inject ATS Keywords" below to reach 95%+ match!*`;

        setMessages((prev) => [...prev, { role: 'assistant', content: recMsg }]);
      }
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
  const [unlocked, setUnlocked] = useState<boolean | null>(isPro ?? null);
  const [aiMessagesUsed, setAiMessagesUsed] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const refreshPaymentStatus = useCallback(() => {
    fetch('/api/payment/status')
      .then((r) => r.json())
      .then((d: { unlocked: boolean; aiMessagesUsed: number }) => {
        setUnlocked(d.unlocked);
        setAiMessagesUsed(d.aiMessagesUsed || 0);
      })
      .catch(() => setUnlocked(false));
  }, []);

  useEffect(() => {
    refreshPaymentStatus();
    window.addEventListener('focus', refreshPaymentStatus);
    window.addEventListener('profile_builder_unlocked', refreshPaymentStatus);
    return () => {
      window.removeEventListener('focus', refreshPaymentStatus);
      window.removeEventListener('profile_builder_unlocked', refreshPaymentStatus);
    };
  }, [refreshPaymentStatus]);

  useEffect(() => {
    if (typeof isPro === 'boolean') {
      setUnlocked(isPro);
    }
  }, [isPro]);

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
      showToast('Could not verify download limits. Please check your connection.', 'error');
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
      showToast(`Download failed: ${err.message || 'Please try again.'}`, 'error');
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
    if (initialPrompt && initialPrompt.trim() && !hasSentInitialPromptRef.current) {
      hasSentInitialPromptRef.current = true;
      send(initialPrompt);
    }
    // Run once on mount only — this is a one-time "prompt typed before
    // entering the Studio" hand-off, not something to repeat on re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-100 overflow-hidden font-sans border-0 rounded-none relative">

      {/* COLUMN 2 (AI CHAT - LEFT: Visible only on Desktop lg screens and up) */}
      <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] 2xl:w-[460px] flex-col bg-white border-r border-slate-200 shrink-0 h-full overflow-hidden">

        {/* Top Header of Chat Column */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Back to templates"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-800 truncate">
              {fieldLabel || 'Resume Studio'}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                sessionIdRef.current = crypto.randomUUID();
                setMessages([]);
              }}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Start a new chat session"
            >
              New chat
            </button>
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => send("make it in one page please")}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Fit in 1 Page
            </button>
            {targetJob.trim() ? (
              <button
                onClick={() => send("Please analyze my resume against my target job description. Rewrite my bullet points and add missing keywords to perfectly match the ATS requirements.")}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                Auto-Inject ATS Keywords
              </button>
            ) : (
              <button
                onClick={() => send("Please optimize and enhance my resume: rewrite bullet points with strong action verbs and quantified metrics, improve keyword density, and polish overall formatting.")}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                Optimize & Enhance Resume
              </button>
            )}
          </div>
          {aiMessagesUsed >= 5 && !unlocked ? (
            <button
              onClick={() => {
                if (!isLoggedIn) { onRequireAuth(); return; }
                setShowPaymentModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 transition-all shadow-2xs group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
                  AI Limit Reached (5/5 Free Prompts Used)
                </span>
              </div>
              <span className="shrink-0 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-full shadow-xs transition-colors">
                Upgrade to Pro →
              </span>
            </button>
          ) : (
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
                placeholder="Ask anything..."
                className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none font-normal max-h-32 leading-snug py-0.5"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 3 (RESUME CANVAS - RIGHT: Full screen on Mobile) */}
      <div className="w-full h-full lg:flex-1 shrink-0 lg:h-full flex flex-col bg-slate-100/90 overflow-hidden relative">

        {/* MacOS Window Single Unified Toolbar Header */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-2 sm:px-4 py-2 flex items-center justify-between gap-1 text-xs shadow-2xs z-30 whitespace-nowrap min-w-0">

          {/* Left Controls Group */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* MacOS Traffic Light Dots */}
            <div className="hidden sm:flex items-center gap-1.5 pr-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>

            {/* Resume Templates Button */}
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="h-7 px-1.5 sm:px-2 rounded-lg bg-slate-100 text-[11px] sm:text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors border border-slate-200/80 flex items-center justify-center gap-1 leading-none cursor-pointer"
              title="Change Resume Template"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-slate-800 shrink-0" />
              <span className="leading-none hidden xs:inline">Templates</span>
            </button>

            {/* Remove Template Button with Confirmation Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowClearConfirm((v) => !v)}
                className="h-7 px-1.5 sm:px-2 rounded-lg bg-rose-50 text-[11px] sm:text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200 flex items-center justify-center gap-1 leading-none cursor-pointer shadow-2xs"
                title="Remove template and clear resume data"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="leading-none hidden xs:inline">Remove Template</span>
              </button>

              {showClearConfirm && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowClearConfirm(false)} />
                  <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] p-3.5 space-y-3 text-xs whitespace-normal animate-in fade-in zoom-in-95">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-xs">Clear everything?</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                          Are you sure you want to clear all sections and reset your content?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowClearConfirm(false);
                          external({
                            cvType: cv.cvType || 'professional',
                            personalInfo: {
                              fullName: '',
                              phone: '',
                              email: '',
                              linkedin: '',
                              linkedinLabel: '',
                              github: '',
                              githubLabel: '',
                              kaggle: '',
                              kaggleLabel: '',
                            },
                            education: [],
                            workExperience: [],
                            workshops: [],
                            projects: [],
                            certifications: [],
                            additional: {
                              skills: '',
                              interests: '',
                            },
                          });
                          showToast('Template removed');
                        }}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs"
                      >
                        Yes, Clear
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Resume Save/Load Dropdown */}
            <div className="relative">
              <button
                onClick={toggleResumeMenu}
                className="h-7 px-1.5 sm:px-2 rounded-lg bg-slate-100 text-[11px] sm:text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors border border-slate-200/80 flex items-center justify-center gap-1 leading-none cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                <span className="leading-none">Resumes</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {resumeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setResumeMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-[285px] max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden text-xs">
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
            <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                type="button"
                title="Undo (Ctrl+Z)"
                onMouseDown={(e) => { e.preventDefault(); handleUndo(); }}
                disabled={past.length === 0}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${past.length === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
              >
                <Undo className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                type="button"
                title="Redo (Ctrl+Y)"
                onMouseDown={(e) => { e.preventDefault(); handleRedo(); }}
                disabled={future.length === 0}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${future.length === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
              >
                <Redo className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>

            <div className="hidden sm:block h-4 w-px bg-slate-200 mx-0.5" />

            {/* Formatting Icons */}
            <div className="hidden sm:flex items-center gap-0">
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
                      ? 'bg-slate-200 text-slate-900 font-semibold'
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

            {/* Professional / Student Pill */}
            <div className="h-7 flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
              {(['professional', 'student'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => external({ ...cv, cvType: t })}
                  className={`h-6 px-1.5 sm:px-2.5 rounded-md text-[10px] font-bold capitalize transition-colors flex items-center justify-center leading-none text-center cursor-pointer ${(cv.cvType ?? 'professional') === t
                      ? 'bg-slate-900 text-white shadow-xs'
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
                className="h-7 px-2 sm:px-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-1 leading-none text-center cursor-pointer disabled:opacity-70 shrink-0"
              >
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span className="leading-none hidden sm:inline">
                  {downloading ? (downloading === 'pdf' ? 'PDF…' : 'PNG…') : 'Download'}
                </span>
              </button>

              {dlMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDlMenu(false)} />
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs">
                    <button
                      onClick={() => download('pdf')}
                      disabled={!!downloading}
                      className="w-full text-left px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold border-b border-slate-100 flex items-center justify-between cursor-pointer disabled:opacity-60"
                    >
                      <span>Download PDF</span>
                      {downloading === 'pdf' && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900 shrink-0" />}
                    </button>
                    <button
                      onClick={() => download('png')}
                      disabled={!!downloading}
                      className="w-full text-left px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold flex items-center justify-between cursor-pointer disabled:opacity-60"
                    >
                      <span>Download PNG</span>
                      {downloading === 'png' && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900 shrink-0" />}
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
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex justify-center items-start relative">
          <PaginatedCvPreview
            data={cv}
            exportRef={exportRef}
            accentColor={accent}
            onChange={recordChange}
          />

          {/* Floating Support Button & ATS Badge Widget (Bottom-Right) */}
          <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 flex flex-col items-end gap-3 select-none">
            {/* Report Issue Circle */}
            <button
              onClick={() => setReportIssueModalOpen(true)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-100 text-rose-600 shadow-xl flex items-center justify-center hover:bg-rose-200 transition-all cursor-pointer hover:scale-105 active:scale-95 mr-0 md:mr-2"
              title="Report an Issue"
            >
              <Bug className="w-5 h-5" />
            </button>
            
            <div className="hidden md:flex items-center">
              {/* Left Pill: Clicking opens Target Job Modal */}
            <button
              onClick={() => setTargetJobModalOpen(true)}
              className="h-14 pl-5 pr-7 rounded-l-full bg-white border border-r-0 border-slate-200 shadow-2xl text-base font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${targetJob.trim() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                <Target className="w-4 h-4" />
              </div>
              <span className="text-xs truncate max-w-[140px]">{targetJob.trim() ? 'Target Job Active' : 'Set Target Job'}</span>
            </button>

            {/* Right Circle: Clicking Recalculates Score and Sends Recommendations */}
            <div className="relative">
              <button
                onClick={() => handleCheckAts()}
                disabled={atsLoading}
                className="w-16 h-16 rounded-full bg-slate-950 text-white shadow-2xl flex items-center justify-center relative z-20 border-[3px] border-white transition-all hover:bg-black hover:scale-105 cursor-pointer disabled:opacity-75"
                title="Click to Recalculate ATS Score"
              >
                {atsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                ) : (
                  <div className="flex flex-col items-center justify-center leading-none">
                    <span className="text-base font-black text-white">{atsScore ?? '–'}</span>
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">ATS</span>
                  </div>
                )}

                {/* Green indicator badge if target job active */}
                {targetJob.trim() && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                )}
              </button>
            </div>
            </div>
          </div>
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
                onClick={() => {
                  setTargetJobModalOpen(false);
                  if (targetJob.trim()) {
                    handleCheckAts(true, targetJob);
                  }
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                {targetJob.trim() ? 'Save Target Job' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {reportIssueModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setReportIssueModalOpen(false)} />
          <div className="relative w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-500" />
                Report an Issue
              </h3>
              <button onClick={() => setReportIssueModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Found a bug or have a problem? Describe it below and optionally attach a screenshot to help us fix it faster.
              </p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Description</label>
                <textarea
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="E.g., The preview cuts off my name..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none font-sans text-slate-900 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attach Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setIssueImage(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                />
                {issueImage && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-200">
                    <img src={issueImage} alt="Issue screenshot" className="w-full max-h-32 object-cover bg-slate-50" />
                    <button 
                      onClick={() => setIssueImage(null)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/75 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setReportIssueModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!issueText.trim() || isSubmittingIssue}
                onClick={handleReportIssue}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
              >
                {isSubmittingIssue && <Loader2 className="w-3 h-3 animate-spin" />}
                {isSubmittingIssue ? 'Submitting...' : 'Submit Issue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Required for HTML2Canvas to rasterize icons without CSP blocking local 
          SVGs inside data: URLs. These are safely hidden and exclusively read by 
          the export process. */}

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
        onNewChat={() => {
          sessionIdRef.current = crypto.randomUUID();
          setMessages([]);
        }}
        badgeAction={
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => send("make it in one page please")}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Fit in 1 Page
            </button>
            {targetJob.trim() ? (
              <button
                onClick={() => send("Please analyze my resume against my target job description. Rewrite my bullet points and add missing keywords to perfectly match the ATS requirements.")}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                Auto-Inject ATS Keywords
              </button>
            ) : (
              <button
                onClick={() => send("Please optimize and enhance my resume: rewrite bullet points with strong action verbs and quantified metrics, improve keyword density, and polish overall formatting.")}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                Optimize & Enhance Resume
              </button>
            )}
          </div>
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

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTemplateModal(false);
          }}
        >
          <div className="w-full max-w-4xl max-h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/90 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-blue-600" />
                  Choose a Resume Template
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Select any career-track sample to apply tailored work experiences, bullet points, skills, and projects.
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LMS_RESUME_SAMPLES.map((sample, idx) => {
                const sampleCv = cvMarkdownToHtml(sample.data);
                const roleTitle = sample.label;
                const sampleName = sampleCv.personalInfo?.fullName || 'Zoya Siddiqui';
                const skillsText = sampleCv.additional?.skills || '';

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      const newCv = cvMarkdownToHtml(sample.data);
                      external(newCv);
                      setShowTemplateModal(false);
                      showToast(`Applied ${roleTitle} template!`);
                    }}
                    className="group relative rounded-xl border-2 border-slate-200 hover:border-blue-500 bg-white p-4 cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col justify-between text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                          CV
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          1 Page
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                        {roleTitle}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        Sample by <strong className="text-slate-700">{sampleName}</strong>
                      </p>
                      {skillsText && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {skillsText.split(',').slice(0, 3).map((s, si) => (
                            <span key={si} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium truncate max-w-[100px]">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 transition-colors cursor-pointer"
                    >
                      Use This Template
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
};
