'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Sparkles, Loader2, Download, Check, Image, X, ChevronDown } from 'lucide-react';
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

/** Curated banner options — a mix of a Cloudinary-hosted photo banner (same as
 *  the LMS) and capsule-render dynamic gradient headers. */
const BANNER_PRESETS: { label: string; url: string; thumb: string }[] = [
  {
    label: 'DataCrumbs',
    url: 'https://res.cloudinary.com/dnqk2jlds/image/upload/f_auto,q_auto,w_1400/v1784892308/lms-assets/github-builder-banner.png',
    thumb: 'https://res.cloudinary.com/dnqk2jlds/image/upload/f_auto,q_auto,w_400,h_80,c_fill/v1784892308/lms-assets/github-builder-banner.png',
  },
  {
    label: 'Wave Blue',
    url: 'https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,100:16213e&height=200&section=header&text=&fontSize=1',
    thumb: 'https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,100:16213e&height=60&section=header&text=&fontSize=1',
  },
  {
    label: 'Gradient Purple',
    url: 'https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:a855f7&height=200&section=header&text=&fontSize=1',
    thumb: 'https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:a855f7&height=60&section=header&text=&fontSize=1',
  },
  {
    label: 'Sunset',
    url: 'https://capsule-render.vercel.app/api?type=waving&color=0:f97316,100:ef4444&height=200&section=header&text=&fontSize=1',
    thumb: 'https://capsule-render.vercel.app/api?type=waving&color=0:f97316,100:ef4444&height=60&section=header&text=&fontSize=1',
  },
  {
    label: 'Ocean Teal',
    url: 'https://capsule-render.vercel.app/api?type=waving&color=0:0d9488,100:06b6d4&height=200&section=header&text=&fontSize=1',
    thumb: 'https://capsule-render.vercel.app/api?type=waving&color=0:0d9488,100:06b6d4&height=60&section=header&text=&fontSize=1',
  },
  {
    label: 'Emerald',
    url: 'https://capsule-render.vercel.app/api?type=waving&color=0:059669,100:10b981&height=200&section=header&text=&fontSize=1',
    thumb: 'https://capsule-render.vercel.app/api?type=waving&color=0:059669,100:10b981&height=60&section=header&text=&fontSize=1',
  },
  {
    label: 'Cyber',
    url: 'https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:22d3ee&height=200&section=header&text=&fontSize=1',
    thumb: 'https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:22d3ee&height=60&section=header&text=&fontSize=1',
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
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'Loaded your README. Edit the text directly on the right, or ask me for anything — e.g. "add a Python badge", "enable the streak card", "use the tokyonight theme", "change the banner", or "add my LinkedIn https://…".',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
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
  const [saveNameInput, setSaveNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingSavedId, setLoadingSavedId] = useState<string | null>(null);
  const [deletingSavedId, setDeletingSavedId] = useState<string | null>(null);

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

  const handleSaveProfile = async () => {
    const name = saveNameInput.trim() || 'Untitled profile';
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/github-saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data: github }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error || 'Failed to save.');
        return;
      }
      setSaveNameInput('');
      fetchSavedProfiles();
    } catch {
      setSaveError('Failed to save — check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSavedProfile = async (id: string) => {
    setLoadingSavedId(id);
    try {
      const res = await fetch(`/api/github-saves/${id}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) {
        onChange(json.data as GithubProfileData);
      }
      setProfileMenuOpen(false);
    } catch {
    } finally {
      setLoadingSavedId(null);
    }
  };

  const handleDeleteSavedProfile = async (id: string) => {
    setDeletingSavedId(id);
    try {
      const res = await fetch(`/api/github-saves/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSavedProfiles();
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
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-100 overflow-hidden font-sans border-0 rounded-none">
      {/* COLUMN 2 (AI CHAT - LEFT) */}
      <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[500px] xl:w-[560px] 2xl:w-[600px] flex-col bg-white border-r border-slate-200 shrink-0 h-full overflow-hidden`}>

        {/* Top Header of Chat Column */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-800 truncate">
              Creating GitHub README...
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden lg:block" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMobileTab('preview')}
              className="lg:hidden px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View README
            </button>
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold hidden sm:inline-block">
              Interface
            </span>
            <button
              onClick={() => setMessages([{ role: 'assistant', content: 'Started a new chat session. How can I help with your GitHub README?' }])}
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

      {/* COLUMN 3 (README PREVIEW - RIGHT) */}
      <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-slate-100/90 h-full overflow-hidden relative`}>

        {/* MacOS Window Top Header Bar */}
        <div className="shrink-0 bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileTab('chat')}
              className="lg:hidden px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors mr-1"
            >
              ← Chat
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
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={saveNameInput}
                          onChange={(e) => setSaveNameInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveProfile(); }}
                          placeholder="My GitHub Profile"
                          className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                        />
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                        </button>
                      </div>
                      {saveError && <div className="mt-2 text-xs text-red-500 font-medium">{saveError}</div>}
                    </div>

                    <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                      {savedProfiles === null ? (
                        <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 text-slate-400 animate-spin" /></div>
                      ) : savedProfiles.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">No saved profiles yet.</div>
                      ) : (
                        savedProfiles.map((s) => (
                          <div key={s.id} className="group relative rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
                            <button
                              onClick={() => handleLoadSavedProfile(s.id)}
                              disabled={loadingSavedId !== null || deletingSavedId !== null}
                              className="w-full text-left px-3 py-2.5 flex flex-col"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800 text-sm truncate">{s.name}</span>
                                {loadingSavedId === s.id && <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />}
                              </div>
                              <span className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSavedProfile(s.id); }}
                              disabled={deletingSavedId !== null}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                              title="Delete this save"
                            >
                              {deletingSavedId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Banner picker toggle */}
            <div className="relative">
              <button
                onClick={() => setShowBannerPicker((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${showBannerPicker
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <Image className="w-3.5 h-3.5" />
                Banner
                <ChevronDown className={`w-3 h-3 transition-transform ${showBannerPicker ? 'rotate-180' : ''}`} />
              </button>

              {/* Banner picker dropdown */}
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={b.thumb} alt={b.label} className="w-full h-10 object-cover" />
                          <span className="block text-[10px] font-semibold text-slate-600 py-1">{b.label}</span>
                        </button>
                      ))}
                    </div>
                    {/* Custom URL input */}
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
