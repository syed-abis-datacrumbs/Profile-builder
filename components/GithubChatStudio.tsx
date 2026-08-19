'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Sparkles, Loader2, Download, Check, Image, X, ChevronDown, Plus, Edit2 } from 'lucide-react';
import { GithubProfileData } from '../types';
import { GithubIcon } from './icons';
import { generateGithubMarkdown } from '../lib/githubMarkdown';

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
    label: 'Abstract Tech',
    url: 'https://t3.ftcdn.net/jpg/20/51/12/90/360_F_2051129030_uod7m0OoRgOBN03AcYRzK9ESwAAAnXdt.jpg',
    thumb: 'https://t3.ftcdn.net/jpg/20/51/12/90/360_F_2051129030_uod7m0OoRgOBN03AcYRzK9ESwAAAnXdt.jpg',
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
}> = ({ github, onChange, onBack, isLoggedIn, onRequireAuth, initialPrompt }) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [customBannerInput, setCustomBannerInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

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

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    if (!isLoggedIn) { onRequireAuth(); return; }
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
        if (data.github) onChange(data.github as GithubProfileData);
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
    if (unlocked === false) {
      setShowPaymentModal(true);
      return;
    }
    await navigator.clipboard.writeText(generateGithubMarkdown(github));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const set = (patch: Partial<GithubProfileData>) => onChange({ ...github, ...patch });
  const setSection = (i: number, patch: Partial<GithubProfileData['customSections'][number]>) =>
    set({ customSections: github.customSections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

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

  const handleHeadshotFile = (file: File | null) => {
    if (!file) return;
    setCropSourceUrl(URL.createObjectURL(file));
  };

  const handleDownloadImage = async (url: string) => {
    if (unlocked === false) {
      setShowPaymentModal(true);
      return;
    }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.includes('banner') || url.includes('capsule-render') ? 'cover-photo.png' : 'profile-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
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

          <div className="flex items-center gap-2 shrink-0">
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
              placeholder={aiMessagesUsed >= 5 && !unlocked ? "AI Limit Reached. Upgrade to Pro." : "Ask anything..."}
              disabled={aiMessagesUsed >= 5 && !unlocked}
              className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none font-normal disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading || (aiMessagesUsed >= 5 && !unlocked)}
              className="w-7 h-7 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* COLUMN 1 (PREVIEW - RIGHT) */}
      <div className={`flex-1 flex flex-col bg-slate-100 min-w-0 h-full overflow-hidden`}>
        {/* Top Header of Preview Column */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
          <div className="flex items-center min-w-0">
            <button
              onClick={onBack}
              className="lg:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors mr-2"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {/* MacOS Traffic Light Dots */}
            <div className="flex items-center gap-1.5 pr-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>

            {/* Tab Title (Save Menu) */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleProfileMenu}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-bold text-slate-800 border border-slate-200/80"
              >
                <GithubIcon className="w-4 h-4 text-slate-800" />
                <span>Profiles</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
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
            <button
              onClick={copyReadme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : null}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={() => {
                if (!isLoggedIn) { onRequireAuth(); return; }
                if (unlocked === false) { setShowPaymentModal(true); return; }
                downloadReadme();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              {unlocked === false ? <Sparkles className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              {unlocked === false ? 'Unlock Download' : 'README.md'}
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
          />
        </div>

      </div>

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
    </div>
  );
};
