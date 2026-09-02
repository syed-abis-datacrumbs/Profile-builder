'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Send, Sparkles, Loader2, Download, Check, Image, X, ChevronDown, Plus, Edit2, Undo, Redo, Bug, Copy, LayoutTemplate, Trash2 } from 'lucide-react';
import toast from '@/lib/toast';
import { GithubProfileData } from '../types';
import { GithubIcon } from './icons';
import { generateGithubMarkdown } from '../lib/githubMarkdown';
import { GITHUB_ROLE_PRESETS, applyRolePresetToGithub } from '../lib/githubRolePresets';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

import { GithubReadmePreview } from './GithubReadmePreview';
import { PaymentModal } from './PaymentModal';
import { PfpCropModal } from './PfpCropModal';
import { MobileChatWidget } from './MobileChatWidget';

/** Curated banner options — a mix of a Cloudinary-hosted photo banner (same as
 *  the LMS) and capsule-render dynamic gradient headers. */
const BANNER_PRESETS: { label: string; url: string; thumb: string }[] = [
  {
    label: 'Dev.to Tech',
    url: 'https://media2.dev.to/dynamic/image/width=800,height=200,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F4e0d816kuzyu700pdbjn.png',
    thumb: 'https://media2.dev.to/dynamic/image/width=800,height=200,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F4e0d816kuzyu700pdbjn.png',
  },
  {
    label: 'GitHub Security',
    url: 'https://github.blog/wp-content/uploads/2023/10/Security-DarkMode-4.png?fit=800%2C200',
    thumb: 'https://github.blog/wp-content/uploads/2023/10/Security-DarkMode-4.png?fit=800%2C200',
  },
  {
    label: 'GitHub Enterprise',
    url: 'https://github.blog/wp-content/uploads/2024/04/Enterprise-DarkMode-2-3.png?fit=800%2C200',
    thumb: 'https://github.blog/wp-content/uploads/2024/04/Enterprise-DarkMode-2-3.png?fit=800%2C200',
  },
  {
    label: 'GitHub Productivity',
    url: 'https://github.blog/wp-content/uploads/2024/01/Productivity-DarkMode-3.png?fit=800%2C200',
    thumb: 'https://github.blog/wp-content/uploads/2024/01/Productivity-DarkMode-3.png?fit=800%2C200',
  },
  {
    label: 'DataCrumbs Space',
    url: 'https://res.cloudinary.com/dnqk2jlds/image/upload/f_auto,q_auto,w_800,h_200,c_fill/v1784892308/lms-assets/github-builder-banner.png',
    thumb: 'https://res.cloudinary.com/dnqk2jlds/image/upload/f_auto,q_auto,w_400,h_80,c_fill/v1784892308/lms-assets/github-builder-banner.png',
  },
  {
    label: 'LinkedIn Tech',
    url: 'https://media.licdn.com/dms/image/v2/D4D22AQFdDNT0wF7QeA/feedshare-shrink_800/B4DZnTiPJ.HsAg-/0/1760190592128?e=2147483647&v=beta&t=TIR7gw8DvhVlNvj430XoNRE2szOwVuPZACPAR7O6mww',
    thumb: 'https://media.licdn.com/dms/image/v2/D4D22AQFdDNT0wF7QeA/feedshare-shrink_800/B4DZnTiPJ.HsAg-/0/1760190592128?e=2147483647&v=beta&t=TIR7gw8DvhVlNvj430XoNRE2szOwVuPZACPAR7O6mww',
  },
  {
    label: 'GitHub Security Alt',
    url: 'https://github.blog/wp-content/uploads/2023/10/Security-DarkMode-4.png?fit=800%2C200',
    thumb: 'https://github.blog/wp-content/uploads/2023/10/Security-DarkMode-4.png?fit=800%2C200',
  },
  {
    label: 'Minimal Graphic',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx3gQYfcsXGDOlHkID72zyJVRqRDFFgDVrBu362KeYVQ&s=10',
    thumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx3gQYfcsXGDOlHkID72zyJVRqRDFFgDVrBu362KeYVQ&s=10',
  },
];

export const GithubChatStudio: React.FC<{
  github: GithubProfileData;
  onChange: (g: GithubProfileData) => void;
  onBack: () => void;
  isLoggedIn: boolean;
  onRequireAuth: () => void;
  /** Prompt typed on the landing page (after template selection) — sent to
   *  the AI automatically once, on mount. */
  initialPrompt?: string;
  isPro?: boolean;
}> = ({ github, onChange, onBack, isLoggedIn, onRequireAuth, initialPrompt, isPro }) => {
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('profile_builder_github_chat');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profile_builder_github_chat', JSON.stringify(messages));
    }
  }, [messages]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [customBannerInput, setCustomBannerInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);

  // Report Issue State
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [issueImage, setIssueImage] = useState<string | null>(null);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const handleReportIssue = async () => {
    if (!issueText.trim()) return;
    setIsSubmittingIssue(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: issueText, imageBase64: issueImage, category: 'github' }),
      });
      if (!res.ok) throw new Error('Failed to submit issue');
      toast.success('Issue reported successfully. Thank you!');
      setReportIssueModalOpen(false);
      setIssueText('');
      setIssueImage(null);
    } catch (e: any) {
      toast.error('Failed to submit issue: ' + e.message);
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  // Undo / Redo history
  const [past, setPast] = useState<GithubProfileData[]>([]);
  const [future, setFuture] = useState<GithubProfileData[]>([]);

  const recordChange = useCallback(
    (next: GithubProfileData) => {
      setPast((p) => [...p.slice(-99), github]);
      setFuture([]);
      onChange(next);
    },
    [github, onChange]
  );

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [github, ...f]);
    onChange(prev);
  }, [past, github, onChange]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, github]);
    onChange(next);
  }, [future, github, onChange]);

  const set = useCallback((patch: Partial<GithubProfileData>) => {
    const updated = { ...github, ...patch };
    recordChange(updated);
  }, [github, recordChange]);

  const setSection = useCallback((index: number, patch: Partial<GithubProfileData['customSections'][number]>) => {
    const next = [...(github.customSections || [])];
    next[index] = { ...next[index], ...patch };
    recordChange({ ...github, customSections: next });
  }, [github, recordChange]);

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

  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

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

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    if (!isLoggedIn) { onRequireAuth(); return; }
    if (aiMessagesUsed >= 5 && !unlocked) {
      setShowPaymentModal(true);
      return;
    }
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    if (overrideText === undefined) setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/github-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          github,
          sessionId: sessionIdRef.current,
          builderType: 'github'
        }),
      });
      const data = await res.json();
      if (data.error) setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${data.error}` }]);
      else {
        if (!unlocked) setAiMessagesUsed((prev) => prev + 1);
        if (data.github) recordChange(data.github as GithubProfileData);
        setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'Done.' }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const hasSentInitialPromptRef = useRef(false);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && !hasSentInitialPromptRef.current) {
      hasSentInitialPromptRef.current = true;
      send(initialPrompt);
    }
    // Run once on mount only — one-time hand-off from the template picker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [copied, setCopied] = useState(false);
  const downloadReadme = () => {
    if (unlocked === false) {
      setShowPaymentModal(true);
      return;
    }
    const md = generateGithubMarkdown(github);
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyReadme = async () => {
    if (!isLoggedIn) { onRequireAuth(); return; }
    if (unlocked === false) {
      setShowPaymentModal(true);
      return;
    }
    await navigator.clipboard.writeText(generateGithubMarkdown(github));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  interface SavedProfileMeta { id: string; name: string; createdAt: string }
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfileMeta[] | null>(null);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [activeSavedName, setActiveSavedName] = useState<string | null>(null);
  const [saveNameInput, setSaveNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingSavedId, setLoadingSavedId] = useState<string | null>(null);
  const [deletingSavedId, setDeletingSavedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState<string>('');

  const fetchSavedProfiles = async () => {
    try {
      const res = await fetch('/api/github-saves');
      const json = await res.json();
      setSavedProfiles(res.ok ? json.versions ?? [] : []);
    } catch {
      setSavedProfiles([]);
    }
  };

  const toggleProfileMenu = () => {
    if (!isLoggedIn) { onRequireAuth(); return; }
    setProfileMenuOpen((open) => {
      const next = !open;
      if (next && savedProfiles === null) fetchSavedProfiles();
      return next;
    });
  };

  const handleSaveProfile = async (forceNew = false) => {
    const targetId = forceNew ? undefined : (activeSavedId || undefined);
    const name = saveNameInput.trim() || activeSavedName || github.username || 'Untitled profile';
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/github-saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId, name, data: github }),
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
      fetchSavedProfiles();
    } catch {
      setSaveError('Failed to save — check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSavedProfile = async (id: string, name?: string) => {
    setLoadingSavedId(id);
    try {
      const res = await fetch(`/api/github-saves/${id}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) {
        onChange(json.data as GithubProfileData);
        setActiveSavedId(id);
        const resolvedName = name || savedProfiles?.find(s => s.id === id)?.name || '';
        setActiveSavedName(resolvedName);
        setSaveNameInput(resolvedName);
      }
      setProfileMenuOpen(false);
    } catch {
    } finally {
      setLoadingSavedId(null);
    }
  };

  const handleRenameProfile = async (id: string, newName: string) => {
    if (!newName.trim()) { setRenamingId(null); return; }
    try {
      const res = await fetch(`/api/github-saves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setSavedProfiles((prev) =>
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

  const handleDeleteSavedProfile = async (id: string) => {
    setDeletingSavedId(id);
    try {
      const res = await fetch(`/api/github-saves/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSavedProfiles();
        if (activeSavedId === id) {
          setActiveSavedId(null);
          setActiveSavedName(null);
        }
      }
    } catch {
    } finally {
      setDeletingSavedId(null);
    }
  };

  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const handleHeadshotFile = (file: File | null) => {
    if (!file) return;
    setCropSourceUrl(URL.createObjectURL(file));
  };

  const handleBannerFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    set({ bannerUrl: url });
    toast.success('Custom banner uploaded!');
  };

  const handleDownloadImage = async (url: string, filename?: string) => {
    if (unlocked === false) {
      setShowPaymentModal(true);
      return;
    }
    const downloadName = filename || (url.includes('banner') || url.includes('capsule-render') ? 'cover-photo.png' : 'profile-photo.jpg');
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`Downloaded ${downloadName}`);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-100 overflow-hidden font-sans border-0 rounded-none relative">

      {/* COLUMN 2 (AI CHAT - LEFT) — Desktop only */}
      <div className={`hidden lg:flex w-full lg:w-[500px] xl:w-[560px] 2xl:w-[600px] flex-col bg-white border-r border-slate-200 shrink-0 h-full overflow-hidden`}>

        {/* Top Header of Chat Column */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors hidden lg:block"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileChatOpen(false)}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-800 truncate">
              Creating GitHub README...
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
                  'Add a Python and Next.js badge',
                  'Add more expertise and skills',
                  'I want to add a new project to my profile',
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
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl px-4 py-2.5 text-sm font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Generating AI README updates…</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="shrink-0 p-3.5 bg-white border-t border-slate-200">
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

      {/* COLUMN 1 (PREVIEW - RIGHT) */}
      <div className={`flex-1 flex flex-col bg-slate-100 min-w-0 h-full overflow-hidden`}>
        {/* Top Header of Preview Column */}
        <div className="shrink-0 flex items-center justify-between px-2 sm:px-4 py-2.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={onBack}
              className="lg:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors mr-1 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {/* MacOS Traffic Light Dots (Hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-1.5 pr-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>

            {/* Templates Button */}
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-bold text-slate-800 border border-slate-200/80 cursor-pointer shadow-2xs"
              title="Change Role Template"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xs:inline">Templates</span>
            </button>

            {/* Remove Template Button */}
            <button
              type="button"
              onClick={() => {
                recordChange({
                  username: '',
                  title: '',
                  about: '',
                  bannerUrl: undefined,
                  avatarUrl: undefined,
                  techStack: [],
                  showStatsCard: false,
                  showStreakCard: false,
                  showTopLangsCard: false,
                  theme: 'dark',
                  socialLinks: {},
                  customSections: [],
                });
                toast.success('Template removed. Profile cleared to blank slate.');
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
              title="Remove template and clear profile data"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Remove Template</span>
            </button>

            {/* Tab Title (Save Menu) */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleProfileMenu}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-xs sm:text-sm font-bold text-slate-800 border border-slate-200/80 cursor-pointer"
              >
                <GithubIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800" />
                <span>Profiles</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-[285px] max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                          Saved Profiles
                        </span>
                        {activeSavedId && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                            Editing Active
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        value={saveNameInput}
                        onChange={(e) => setSaveNameInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveProfile(!activeSavedId); }}
                        placeholder={github.username || 'My GitHub Profile'}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white shadow-2xs"
                      />

                      <div className="flex items-center gap-1.5 pt-0.5">
                        {activeSavedId ? (
                          <>
                            <button
                              onClick={() => handleSaveProfile(false)}
                              disabled={saving}
                              className="flex-1 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update Active'}
                            </button>
                            <button
                              onClick={() => handleSaveProfile(true)}
                              disabled={saving}
                              className="h-7 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Save as a new separate profile copy"
                            >
                              <Plus className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Save New</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleSaveProfile(true)}
                            disabled={saving}
                            className="w-full h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save New Profile'}
                          </button>
                        )}
                      </div>
                      {saveError && <div className="mt-2 text-xs text-red-500 font-medium">{saveError}</div>}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {savedProfiles === null ? (
                        <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 text-slate-400 animate-spin" /></div>
                      ) : savedProfiles.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">No saved profiles yet.</div>
                      ) : (
                        savedProfiles.map((s) => {
                          const isSelected = activeSavedId === s.id;
                          const isRenaming = renamingId === s.id;

                          return (
                            <div
                              key={s.id}
                              className={`flex items-center justify-between px-3 py-2 transition-colors group ${
                                isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                              }`}
                            >
                              {isRenaming ? (
                                <div className="flex items-center gap-1 flex-1 min-w-0 pr-1">
                                  <input
                                    type="text"
                                    value={renameInput}
                                    onChange={(e) => setRenameInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleRenameProfile(s.id, renameInput);
                                      if (e.key === 'Escape') setRenamingId(null);
                                    }}
                                    autoFocus
                                    className="flex-1 px-1.5 py-0.5 border border-indigo-400 rounded text-xs text-slate-900 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleRenameProfile(s.id, renameInput)}
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
                                    onClick={() => handleLoadSavedProfile(s.id, s.name)}
                                    disabled={loadingSavedId === s.id}
                                    className="flex-1 min-w-0 text-left cursor-pointer"
                                  >
                                    <div className="font-semibold text-slate-800 text-sm truncate flex items-center gap-1.5">
                                      <span className="truncate">{s.name}</span>
                                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />}
                                    </div>
                                    <div className="text-slate-400 text-[10px]">
                                      {new Date(s.createdAt).toLocaleDateString()}
                                    </div>
                                  </button>
                                  
                                  <div className="flex items-center gap-0.5 shrink-0 pl-1">
                                    {loadingSavedId === s.id && (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRenamingId(s.id);
                                        setRenameInput(s.name);
                                      }}
                                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                      title="Rename"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSavedProfile(s.id);
                                      }}
                                      disabled={deletingSavedId === s.id}
                                      className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 cursor-pointer"
                                      title="Delete this save"
                                    >
                                      {deletingSavedId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
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
          </div>

          <div className="flex items-center gap-2">
            {/* Banner picker popup (opened via pencil button) */}
            <div className="relative">
              {showBannerPicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowBannerPicker(false)} />
                  <div className="absolute right-0 mt-2 w-[340px] bg-white border border-slate-200 rounded-xl shadow-2xl z-20 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Choose a Banner</span>
                      {github.bannerUrl && (
                        <button
                          onClick={() => { set({ bannerUrl: undefined }); setShowBannerPicker(false); }}
                          className="text-[10px] font-semibold text-red-500 hover:text-red-700 flex items-center gap-0.5"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {BANNER_PRESETS.map((b) => (
                        <button
                          key={b.label}
                          onClick={() => { set({ bannerUrl: b.url }); setShowBannerPicker(false); }}
                          className={`rounded-lg border-2 overflow-hidden transition-all hover:scale-[1.03] ${github.bannerUrl === b.url ? 'border-indigo-500 shadow-md' : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <img src={b.thumb} alt={b.label} className="w-full h-10 object-cover" />
                          <span className="block text-[10px] font-semibold text-slate-600 py-1">{b.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customBannerInput}
                        onChange={(e) => setCustomBannerInput(e.target.value)}
                        placeholder="Paste custom image URL…"
                        className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 text-slate-700 placeholder-slate-400"
                      />
                      <button
                        onClick={() => {
                          if (customBannerInput.trim()) {
                            set({ bannerUrl: customBannerInput.trim() });
                            setCustomBannerInput('');
                            setShowBannerPicker(false);
                          }
                        }}
                        disabled={!customBannerInput.trim()}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold disabled:opacity-40 hover:bg-indigo-500 transition-colors"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
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

            <button
              onClick={copyReadme}
              title="Copy Markdown"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => {
                if (!isLoggedIn) { onRequireAuth(); return; }
                if (unlocked === false) { setShowPaymentModal(true); return; }
                downloadReadme();
              }}
              title="Download README.md"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              {unlocked === false ? <Sparkles className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{unlocked === false ? 'Unlock Download' : 'README.md'}</span>
            </button>
          </div>
        </div>

        {showPaymentModal && (
          <PaymentModal
            reason="Unlock your README.md download"
            onApproved={() => {
              setUnlocked(true);
              setShowPaymentModal(false);
            }}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <GithubReadmePreview
            github={github}
            editable={true}
            onSet={set}
            onSetSection={setSection}
            onShowBannerPicker={() => setShowBannerPicker(true)}
            onDownloadImage={handleDownloadImage}
            onUploadAvatarClick={() => fileInputRef.current?.click()}
            onUploadBannerClick={() => bannerFileInputRef.current?.click()}
          />
        </div>

        {/* Floating Report Issue Button */}
        <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 flex flex-col items-end gap-3 select-none">
          <button
            onClick={() => setReportIssueModalOpen(true)}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-100 text-rose-600 shadow-xl flex items-center justify-center hover:bg-rose-200 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Report an Issue"
          >
            <Bug className="w-5 h-5" />
          </button>
        </div>

      </div>

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
                Found a bug or have feedback on the GitHub README generator? Describe it below and optionally attach a screenshot.
              </p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Description</label>
                <textarea
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="E.g., The tech stack badges don't render..."
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

      {/* Mobile Floating Chat Widget */}
      <MobileChatWidget
        isOpen={isMobileChatOpen}
        onToggle={() => setIsMobileChatOpen((prev) => !prev)}
        messages={messages}
        input={input}
        setInput={setInput}
        loading={loading}
        onSend={send}
        title="Creating GitHub README..."
        suggestions={[
          'Add more tech stack badges',
          'Make my bio sound more professional',
          'Add a GitHub streak card',
        ]}
        onBack={() => setIsMobileChatOpen(false)}
        unlocked={unlocked === true}
        aiMessagesUsed={aiMessagesUsed}
      />

      {/* Hidden file input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleHeadshotFile(e.target.files?.[0] ?? null)}
      />

      {/* Hidden file input for Banner Upload */}
      <input
        ref={bannerFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleBannerFile(e.target.files?.[0] ?? null)}
      />

      {cropSourceUrl && (
        <PfpCropModal
          key={cropSourceUrl}
          imageUrl={cropSourceUrl}
          onCancel={() => setCropSourceUrl(null)}
          onChangePhoto={(file) => setCropSourceUrl(URL.createObjectURL(file))}
          onConfirm={(dataUrl) => {
            set({ avatarUrl: dataUrl });
            setCropSourceUrl(null);
          }}
        />
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
                  <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                  Choose a GitHub Profile Template
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Select any developer role to apply tailored bio, tech stack badges, and project sections.
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
              {GITHUB_ROLE_PRESETS.map((preset) => {
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      const updated = applyRolePresetToGithub(github, preset);
                      recordChange(updated);
                      setShowTemplateModal(false);
                      toast.success(`Applied ${preset.label} template!`);
                    }}
                    className="group relative rounded-xl border-2 border-slate-200 hover:border-indigo-500 bg-white p-4 cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col justify-between text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          GH
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Preset
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                        {preset.label}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {preset.about}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {preset.techStack.slice(0, 4).map((tech, ti) => (
                          <span key={ti} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold truncate max-w-[90px]">
                            {tech}
                          </span>
                        ))}
                        {preset.techStack.length > 4 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 font-medium">
                            +{preset.techStack.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 transition-colors cursor-pointer"
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
  );
};
