'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Inter } from 'next/font/google';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Loader2,
  MapPin,
  FolderGit2,
  ExternalLink,
  Plus,
  MessageSquare,
  MoreHorizontal,
  ChevronRight,
  Award,
  Palette,
  Camera,
  Pencil,
  X,
  Check,
  ChevronDown,
  Bug,
} from 'lucide-react';
import toast from '@/lib/toast';
import {
  LinkedinRichProfile,
  COVER_ART,
  COVER_ART_ORDER,
  PFP_GRADIENT_IDS,
  buildCoverFieldValues,
} from '../lib/linkedinRichProfile';
import { CoverArtField, computeFitScale, coverFontSize, overageCeiling } from '../lib/linkedinCoverArt';
import { PfpCropModal } from './PfpCropModal';
import { ShrinkToFitCoverText } from './ShrinkToFitCoverText';
import { LinkedinTemplateSampleExperience, LinkedinTemplateSampleEducation, LinkedinTemplateSampleCertification, LinkedinTemplateSampleProject } from '../lib/linkedinTemplateSamples';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

const featuredItems = [
  {
    type: 'Post',
    title: 'The Future of AI in SaaS',
    description: 'A deep dive into how generative AI is transforming B2B software products.',
    image: '/images/featured-thumbnail/certificate logo.png'
  },
  {
    type: 'Article',
    title: 'Scaling Node.js to 1M Users',
    description: 'My experience re-architecting our monolithic backend into microservices.',
    image: '/images/featured-thumbnail/project thumbnail.png'
  }
];

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

/** Inline plain-text edit. Commits on blur. Same pattern/behavior everywhere
 *  in this studio so any piece of copy from the preview can be clicked and
 *  typed into directly. */
function Edit({
  value,
  onCommit,
  className,
  placeholder,
  block,
}: {
  value: string;
  onCommit: (v: string) => void;
  className?: string;
  placeholder?: string;
  block?: boolean;
}) {
  const Tag = (block ? 'div' : 'span') as 'div';
  return (
    <Tag
      key={value}
      contentEditable
      suppressContentEditableWarning
      data-ph={placeholder}
      className={`${className || ''} outline-none rounded hover:bg-blue-50/60 focus:bg-blue-50 cursor-text whitespace-pre-wrap empty:before:content-[attr(data-ph)] empty:before:text-slate-300`}
      onBlur={(e) => {
        const v = e.currentTarget.textContent ?? '';
        if (v !== value) onCommit(v);
      }}
    >
      {value}
    </Tag>
  );
}

const cqw = (px: number, canvasWidthPx: number) => `${((px / canvasWidthPx) * 100).toFixed(3)}cqw`;

const MAX_PILL_CHARS = 32;
const truncateText = (value: string, max: number | undefined) => {
  if (!max) return value;
  const ceiling = overageCeiling(max);
  if (value.length <= ceiling) return value;
  const cut = value.slice(0, ceiling);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 0 ? cut.slice(0, lastSpace).trimEnd() : cut;
};

function PickerOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-slate-800">{title}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const LinkedinChatStudio: React.FC<{
  profile: LinkedinRichProfile;
  onChange: (p: LinkedinRichProfile) => void;
  onBack: () => void;
  isLoggedIn: boolean;
  onRequireAuth: () => void;
  /** Prompt typed on the landing page (after template selection) — sent to
   *  the AI automatically once, on mount. */
  initialPrompt?: string;
}> = ({ profile, onChange, onBack, isLoggedIn, onRequireAuth, initialPrompt }) => {
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('profile_builder_linkedin_chat');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        role: 'assistant',
        content:
          'Loaded your profile from the template. Click any text on the right to edit it directly, or ask me — e.g. "make my headline more keyword-rich", "add a bullet about leading a team", or "add Python to skills".',
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profile_builder_linkedin_chat', JSON.stringify(messages));
    }
  }, [messages]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showPfpPicker, setShowPfpPicker] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
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
        body: JSON.stringify({ text: issueText, imageBase64: issueImage, category: 'linkedin' }),
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionIdRef.current) sessionIdRef.current = crypto.randomUUID();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    if (!isLoggedIn) { onRequireAuth(); return; }
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    if (overrideText === undefined) setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/linkedin-rich-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: next, 
          profile,
          sessionId: sessionIdRef.current,
          builderType: 'linkedin'
        }),
      });
      const data = await res.json();
      if (data.error) setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${data.error}` }]);
      else {
        if (data.profile) updateProfile(data.profile as LinkedinRichProfile);
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

  const updateProfile = (next: LinkedinRichProfile) => {
    const identityChanged =
      next.fullName !== profile.fullName || next.title !== profile.title || next.currentCompany !== profile.currentCompany;
    const art = COVER_ART[next.coverTemplateId];
    if (!identityChanged || !art) {
      onChange(next);
      return;
    }
    const resyncedCoverFieldValues = { ...next.coverFieldValues };
    for (const field of art.fields) {
      if (field.defaultFrom === 'fullName') resyncedCoverFieldValues[field.id] = next.fullName;
      else if (field.defaultFrom === 'currentPosition') resyncedCoverFieldValues[field.id] = next.title;
      else if (field.defaultFrom === 'currentCompany') resyncedCoverFieldValues[field.id] = next.currentCompany;
    }
    onChange({ ...next, coverFieldValues: resyncedCoverFieldValues });
  };

  const set = (patch: Partial<LinkedinRichProfile>) => updateProfile({ ...profile, ...patch });

  const setSkill = (i: number, v: string) => set({ skills: profile.skills.map((s, j) => (j === i ? v : s)) });

  const setExperience = (i: number, patch: Partial<LinkedinTemplateSampleExperience>) =>
    set({ experience: profile.experience.map((e, j) => (j === i ? { ...e, ...patch } : e)) });

  const setExperienceBullet = (expIdx: number, bulletIdx: number, v: string) => {
    const bullets = profile.experience[expIdx].description.split('\n').filter(Boolean);
    bullets[bulletIdx] = v;
    setExperience(expIdx, { description: bullets.join('\n') });
  };

  const setEducation = (i: number, patch: Partial<LinkedinTemplateSampleEducation>) =>
    set({ education: profile.education.map((e, j) => (j === i ? { ...e, ...patch } : e)) });

  const setCertification = (i: number, patch: Partial<LinkedinTemplateSampleCertification>) =>
    set({ certifications: profile.certifications.map((c, j) => (j === i ? { ...c, ...patch } : c)) });

  const setProject = (i: number, patch: Partial<LinkedinTemplateSampleProject>) =>
    set({ projects: profile.projects.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  const setCoverFieldValue = (fieldId: string, v: string | string[]) =>
    set({ coverFieldValues: { ...profile.coverFieldValues, [fieldId]: v } });

  const selectCoverTemplate = (id: string) => {
    set({ coverTemplateId: id, coverFieldValues: buildCoverFieldValues(id, profile) });
    setShowCoverPicker(false);
  };

  const selectPfpGradient = (id: string) => {
    set({ pfpGradientId: id });
    setShowPfpPicker(false);
  };

  const handleHeadshotFile = (file: File | null) => {
    if (!file) return;
    setCropSourceUrl(URL.createObjectURL(file));
  };

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
      const res = await fetch('/api/linkedin-saves');
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
      const res = await fetch('/api/linkedin-saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data: profile }),
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
      const res = await fetch(`/api/linkedin-saves/${id}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) {
        set(json.data);
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
      const res = await fetch(`/api/linkedin-saves/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSavedProfiles();
    } catch {
    } finally {
      setDeletingSavedId(null);
    }
  };

  const art = COVER_ART[profile.coverTemplateId];
  const primarySchool = profile.education[0]?.school ?? profile.school;

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans border-0 rounded-none">
      
      {/* COLUMN 2 (AI CHAT - LEFT) */}
      <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[420px] xl:w-[480px] 2xl:w-[520px] flex-col bg-white border-r border-slate-200 shrink-0 h-full overflow-hidden`}>
        
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
            {/* Tab Title (Save Menu) */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleProfileMenu}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-bold text-slate-800 border border-slate-200/80"
              >
                <div className="w-4 h-4 rounded-sm bg-[#0A66C2] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold leading-none">in</span>
                </div>
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
                          placeholder="My LinkedIn Profile"
                          className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                        />
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="px-3.5 py-1.5 rounded-lg bg-[#0A66C2] text-white text-sm font-bold hover:bg-[#004182] disabled:opacity-50 transition-colors"
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
                                {loadingSavedId === s.id && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
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

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMobileTab('preview')}
              className="lg:hidden px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View Profile
            </button>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold">
              Interface
            </span>
            <button
              onClick={() => setMessages([{ role: 'assistant', content: 'Started a new chat session. How can I optimize your LinkedIn profile?' }])}
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
                <span>Generating AI profile updates…</span>
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

      {/* COLUMN 3 (LINKEDIN PREVIEW - RIGHT) */}
      <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-[#F3F2EF] h-full overflow-hidden relative`}>
        
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileTab('chat')}
              className="lg:hidden px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors mr-1"
            >
              ← Chat
            </button>
            {/* MacOS Traffic Light Dots */}
            <div className="hidden sm:flex items-center gap-1.5 pr-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>

            {/* Tab Title */}
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200/80">
              <span className="w-3.5 h-3.5 rounded bg-[#0A66C2] text-white flex items-center justify-center text-[9px] font-bold">in</span>
              <span>LinkedIn Profile</span>
              {/* <ChevronDown className="w-3 h-3 text-slate-400" /> */}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs font-bold text-slate-700">Live Profile Editor</span>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${inter.className}`}>
          <div className="w-full max-w-3xl mx-auto space-y-4">
            {/* ── CARD 1: Profile Header ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Cover banner */}
              <div
                className="relative w-full bg-slate-900 overflow-hidden group"
                style={{ aspectRatio: '1584/396', containerType: 'inline-size' } as React.CSSProperties}
              >
                {art && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={art.backgroundUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
                )}

                {art?.fields && art.fields.map((field: CoverArtField) => {
                  const value = profile.coverFieldValues[field.id] ?? field.placeholder;
                  const align = field.geometry.align;
                  const left = field.geometry.xPct;

                  if (field.kind === 'pills') {
                    const pills = Array.isArray(value) ? value : [value];
                    return (
                      <div
                        key={field.id}
                        style={{
                          position: 'absolute',
                          top: `${field.geometry.yPct * 100}%`,
                          left: `${left * 100}%`,
                          width: `${field.geometry.maxWidthPct * 100}%`,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: cqw(field.geometry.pillGapPx ?? 12, art.canvasWidthPx),
                          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {pills.map((p, i) => {
                          const scale = computeFitScale(p.length, field.pillMaxLengths?.[i] ?? MAX_PILL_CHARS);
                          const chipFontSize = field.geometry.fontSizePx * scale;
                          return (
                            <span
                              key={i}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const raw = e.currentTarget.textContent ?? '';
                                const v = truncateText(raw, field.pillMaxLengths?.[i] ?? MAX_PILL_CHARS);
                                if (v === p) return;
                                setCoverFieldValue(field.id, pills.map((pp, j) => (j === i ? v : pp)));
                              }}
                              className="outline-none cursor-text"
                              style={{
                                color: field.geometry.color,
                                fontWeight: field.geometry.fontWeight,
                                fontFamily: field.geometry.fontFamily,
                                fontSize: coverFontSize(chipFontSize, art.canvasWidthPx),
                                background: field.geometry.pillBg ?? 'rgba(0,0,0,0.35)',
                                borderRadius: 9999,
                                padding: '0.45em 0.9em',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {p}
                            </span>
                          );
                        })}
                      </div>
                    );
                  }

                  const text = Array.isArray(value) ? value.join('\n') : value;
                  return (
                    <div
                      key={field.id}
                      style={{
                        position: 'absolute',
                        top: `${field.geometry.yPct * 100}%`,
                        left: `${left * 100}%`,
                        width: `${field.geometry.maxWidthPct * 100}%`,
                      }}
                    >
                      {field.staticLabel && (
                        <div
                          style={{
                            fontSize: coverFontSize(field.staticLabelFontSizePx ?? field.geometry.fontSizePx * 0.65, art.canvasWidthPx),
                            fontFamily: field.staticLabelFontFamily,
                            fontWeight: 600,
                            color: field.geometry.color,
                            opacity: 0.85,
                            marginBottom: '0.15em',
                          }}
                        >
                          {field.staticLabel}
                        </div>
                      )}
                      <ShrinkToFitCoverText
                        text={text}
                        maxLength={field.maxLength}
                        maxLines={field.geometry.maxLines}
                        fontSizePx={field.geometry.fontSizePx}
                        lineHeightPx={field.geometry.lineHeightPx}
                        canvasWidthPx={art.canvasWidthPx}
                        color={field.geometry.color}
                        fontWeight={field.geometry.fontWeight}
                        fontFamily={field.geometry.fontFamily}
                        textAlign={align}
                        editable
                        placeholder={field.placeholder as string}
                        onCommit={(v) => setCoverFieldValue(field.id, truncateText(v, field.maxLength))}
                      />
                    </div>
                  );
                })}

                {/* Cover edit affordance. Always visible rather than
                    hover-revealed: a touch device has no hover, so on a phone
                    the old pill was unreachable and the cover template could
                    not be changed at all. */}
                <button
                  onClick={() => setShowCoverPicker(true)}
                  title="Change cover template"
                  aria-label="Change cover template"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-md ring-1 ring-black/10 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Profile Card Body */}
              <div className="px-6 pb-6 pt-0">
                {/* Avatar row */}
                <div className="flex items-start justify-between">
                  {/* The badge has to live outside the clipped circle, so the
                      avatar is wrapped rather than positioned against itself. */}
                  <div className="relative -mt-14 sm:-mt-20 shrink-0">
                    <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-full border-[4px] border-white overflow-hidden relative bg-slate-200 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/linkedin-templates/pfp/${profile.pfpGradientId}/background.jpg`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.headshotUrl}
                        alt={profile.fullName}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    </div>

                    {/* Same reasoning as the cover pencil: the two actions used
                        to be a hover-only overlay, which a phone can never
                        reach. One persistent badge opens both. */}
                    <button
                      onClick={() => setShowPhotoMenu((v) => !v)}
                      title="Edit profile photo"
                      aria-label="Edit profile photo"
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {showPhotoMenu && (
                      <>
                        {/* Click-away catcher */}
                        <div className="fixed inset-0 z-20" onClick={() => setShowPhotoMenu(false)} />
                        <div className="absolute z-30 top-full left-0 mt-1.5 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-1 text-xs font-semibold text-slate-700">
                          <button
                            onClick={() => {
                              setShowPhotoMenu(false);
                              fileInputRef.current?.click();
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left"
                          >
                            <Camera className="w-4 h-4 text-slate-500 shrink-0" />
                            <span>Upload a photo</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowPhotoMenu(false);
                              setShowPfpPicker(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left"
                          >
                            <Palette className="w-4 h-4 text-slate-500 shrink-0" />
                            <span>Change photo background</span>
                          </button>
                        </div>
                      </>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleHeadshotFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>

                {/* Main Info Row (Side-by-side: Name/Headline left, Company/School right) */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mt-3">
                  {/* LEFT COLUMN: Name, headline, location, connection, actions */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Edit value={profile.fullName} onCommit={(v) => set({ fullName: v })} placeholder="Your name" className="text-[24px] font-bold text-[#191919] leading-tight tracking-tight" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/featured-thumbnail/verified badge image.png" alt="Verified" className="w-[25px] h-[25px] object-contain shrink-0" />
                      <span className="text-[13px] text-slate-500 font-normal">· 2nd</span>
                    </div>

                    <Edit block value={profile.headline} onCommit={(v) => set({ headline: v })} placeholder="Your headline…" className="text-[15px] font-normal text-[#191919] mt-1 leading-snug" />

                    <div className="text-[13px] text-slate-500 mt-2 flex flex-wrap items-center gap-x-1.5">
                      <MapPin className="w-3 h-3" />
                      <Edit value={profile.location} onCommit={(v) => set({ location: v })} placeholder="Location" />
                      <span>·</span>
                      <span className="text-[#0A66C2] font-semibold hover:underline cursor-pointer">Contact info</span>
                    </div>

                    <p className="text-[13px] text-[#0A66C2] font-semibold mt-1 hover:underline cursor-pointer">500+ connections</p>

                    {/* Mutual connections */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex -space-x-2 overflow-hidden">
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-300 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/images/featured-thumbnail/mutual connection.png" alt="Dileep" className="h-full w-full object-cover" />
                        </div>
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-300 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/images/featured-thumbnail/mutual connection 2.png" alt="Mutual Connection" className="h-full w-full object-cover" />
                        </div>
                      </div>
                      <span className="text-[12px] text-slate-600 font-normal">
                        <strong className="font-semibold text-slate-800">Dileep</strong> and 1 other mutual connection
                      </span>
                    </div>

                    {/* Action Buttons */}
                    {/* Kept on a single row: LinkedIn never wraps the overflow
                        button below Connect/Message. The three at full padding
                        are marginally wider than a phone-width card, so the
                        pills carry tighter padding on small screens instead of
                        being allowed to wrap. */}
                    <div className="flex items-center gap-2 mt-4">
                      <button className="bg-[#0A66C2] hover:bg-[#084e96] text-white font-semibold text-sm px-3.5 sm:px-5 py-1.5 rounded-full flex items-center gap-1.5 transition shadow-2xs shrink-0 whitespace-nowrap">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        Connect
                      </button>
                      <button className="border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50/60 font-semibold text-sm px-3.5 sm:px-5 py-1.5 rounded-full flex items-center gap-1.5 transition shrink-0 whitespace-nowrap">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                      <button className="border border-slate-500 text-slate-700 hover:bg-slate-100 w-9 h-9 rounded-full flex items-center justify-center transition shrink-0">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Company & School badges — desktop only.
                      Real LinkedIn drops these from the mobile header and
                      surfaces them in the Experience/Education sections
                      instead; stacked under the action buttons on a phone
                      they read as duplicate content. */}
                  <div className="hidden sm:flex flex-col gap-3 shrink-0 pt-1">
                    <div className="flex items-center gap-2.5 group cursor-pointer">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/featured-thumbnail/company logo.jfif" alt="" className="w-full h-full object-cover" />
                      </div>
                      <Edit
                        value={profile.currentCompany}
                        onCommit={(v) => set({ currentCompany: v })}
                        placeholder="Current company"
                        className="text-[13px] font-semibold text-[#191919] leading-tight max-w-[190px]"
                      />
                    </div>
                    <div className="flex items-center gap-2.5 group cursor-pointer">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/featured-thumbnail/education logo.jpg" alt="" className="w-full h-full object-cover" />
                      </div>
                      <Edit
                        value={primarySchool}
                        onCommit={(v) => (profile.education[0] ? setEducation(0, { school: v }) : set({ school: v }))}
                        placeholder="School"
                        className="text-[13px] font-semibold text-[#191919] leading-tight max-w-[190px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD 2: About ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#191919] mb-2.5">About</h2>
              <Edit block value={profile.about} onCommit={(v) => set({ about: v })} placeholder="Write your About section…" className="text-[14px] text-slate-800 leading-[1.6]" />
            </div>

            {/* ── CARD 3: Featured ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-[#191919]">Featured</h2>
              </div>
              {/* Mobile: horizontal snap carousel, like LinkedIn's own app —
                  each card keeps its own bounds inside the section's padding
                  (no negative-margin bleed, which clipped the first card
                  against the section's rounded corner), sized so the next one
                  peeks and reads as swipeable. Scrollbar hidden: the peeking
                  card is the affordance. Reverts to the grid from sm up. */}
              <div className="flex snap-x snap-mandatory overflow-x-auto gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-3">
                {featuredItems.map((item, idx) => (
                  <div key={idx} className="snap-start shrink-0 w-[85%] sm:w-auto border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs flex flex-col">
                    <div className="h-[135px] w-full relative overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[12px] text-slate-500 font-medium">{item.type}</span>
                        <h3 className="text-[14px] font-semibold text-[#191919] leading-snug line-clamp-2 mt-1">{item.title}</h3>
                        <p className="text-[12px] text-slate-600 line-clamp-2 mt-1.5 leading-normal">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CARD 4: Experience ── */}
            {profile.experience.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-5">Experience</h2>
                <div className="space-y-6">
                  {profile.experience.map((exp, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/featured-thumbnail/company logo.jfif" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Edit block value={exp.title} onCommit={(v) => setExperience(i, { title: v })} placeholder="Job title" className="text-[16px] font-semibold text-[#191919] leading-tight" />
                        <Edit block value={exp.company} onCommit={(v) => setExperience(i, { company: v })} placeholder="Company" className="text-[14px] font-medium text-slate-800 mt-0.5" />
                        <div className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Edit value={exp.start} onCommit={(v) => setExperience(i, { start: v })} placeholder="Start" />
                          <span>–</span>
                          <Edit value={exp.end} onCommit={(v) => setExperience(i, { end: v })} placeholder="End" />
                        </div>
                        <ul className="mt-2.5 space-y-1.5 text-[13px] text-slate-700 leading-relaxed list-disc list-outside marker:text-slate-400 pl-4">
                          {exp.description.split('\n').filter(Boolean).map((bullet, bIdx) => (
                            <li key={bIdx}>
                              <Edit value={bullet} onCommit={(v) => setExperienceBullet(i, bIdx, v)} placeholder="Bullet point" />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CARD 5: Education ── */}
            {profile.education.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-5">Education</h2>
                <div className="space-y-6">
                  {profile.education.map((edu, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/featured-thumbnail/education logo.jpg" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Edit block value={edu.school} onCommit={(v) => setEducation(i, { school: v })} placeholder="School" className="text-[16px] font-semibold text-[#191919] leading-tight" />
                        {/* flex-wrap so degree and field wrap as whole units;
                            without it flex shrinks each one and their text
                            wraps internally, splitting into ragged columns. */}
                        <div className="text-[14px] font-medium text-slate-800 mt-0.5 flex flex-wrap items-center gap-x-1">
                          <Edit value={edu.degree} onCommit={(v) => setEducation(i, { degree: v })} placeholder="Degree" />
                          <span>·</span>
                          <Edit value={edu.fieldOfStudy} onCommit={(v) => setEducation(i, { fieldOfStudy: v })} placeholder="Field of study" />
                        </div>
                        <div className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Edit value={edu.start} onCommit={(v) => setEducation(i, { start: v })} placeholder="Start" />
                          <span>–</span>
                          <Edit value={edu.end} onCommit={(v) => setEducation(i, { end: v })} placeholder="End" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CARD 6: Licenses & Certifications ── */}
            {profile.certifications.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-5">Licenses &amp; Certifications</h2>
                <div className="space-y-6">
                  {profile.certifications.map((cert, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={idx % 2 === 0 ? '/images/featured-thumbnail/certificate logo.png' : '/images/featured-thumbnail/certificate logo 2.png'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Edit block value={cert.name} onCommit={(v) => setCertification(idx, { name: v })} placeholder="Certification name" className="text-[16px] font-semibold text-[#191919] leading-tight" />
                        <Edit block value={cert.organization} onCommit={(v) => setCertification(idx, { organization: v })} placeholder="Organization" className="text-[14px] font-medium text-slate-800 mt-0.5" />
                        <div className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span>Issued</span>
                          <Edit value={cert.date} onCommit={(v) => setCertification(idx, { date: v })} placeholder="Date" />
                        </div>
                        <button className="inline-flex items-center gap-1.5 border border-slate-400 text-slate-700 font-semibold text-[13px] px-4 py-1.5 rounded-full mt-3 hover:bg-slate-50 transition">
                          Show credential
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CARD 7: Projects ── */}
            {profile.projects.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-5">Projects</h2>
                <div className="space-y-6">
                  {profile.projects.map((proj, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FolderGit2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Edit block value={proj.title} onCommit={(v) => setProject(i, { title: v })} placeholder="Project title" className="text-[16px] font-semibold text-[#191919] leading-tight" />
                        <Edit block value={proj.description} onCommit={(v) => setProject(i, { description: v })} placeholder="Project description" className="text-[14px] text-slate-700 mt-1 leading-relaxed" />

                        {/* Attached Project Media Thumbnail Card */}
                        <div className="mt-3.5 border border-slate-200 rounded-xl p-2.5 bg-slate-50/80 flex items-center gap-3 max-w-md">
                          <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/featured-thumbnail/project thumbnail.png" alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-[#191919] line-clamp-1">{proj.title} Demo &amp; Code Repo</p>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <ExternalLink className="w-3 h-3" /> github.com / live app
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CARD 8: Skills ── */}
            {profile.skills.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-4">Skills</h2>
                <div className="space-y-4 divide-y divide-slate-100">
                  {profile.skills.slice(0, 4).map((skill, i) => (
                    <div key={i} className={i > 0 ? 'pt-3' : ''}>
                      <Edit value={skill} onCommit={(v) => setSkill(i, v)} placeholder="Skill" className="text-[15px] font-semibold text-[#191919]" />
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">DC</div>
                        <span className="text-[13px] text-slate-600">Endorsed by colleagues at {profile.currentCompany}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {profile.skills.length > 4 && (
                  <div className="border-t border-slate-100 pt-4 mt-5 text-center">
                    <button className="text-[14px] font-semibold text-[#0A66C2] hover:underline flex items-center justify-center gap-1 w-full">
                      Show all {profile.skills.length} skills
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── CARD 9: Honors & Awards ── */}
            {profile.awards.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-5">Honors &amp; Awards</h2>
                <div className="space-y-5">
                  {profile.awards.map((award, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[16px] font-semibold text-[#191919] leading-tight block">{award.title}</span>
                        <span className="text-[13px] text-slate-600 mt-0.5">{award.issuer} · Issued {award.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCoverPicker && (
        <PickerOverlay title="Choose a cover template" onClose={() => setShowCoverPicker(false)}>
          <div className="grid grid-cols-2 gap-3">
            {COVER_ART_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => selectCoverTemplate(id)}
                className={`relative rounded-lg overflow-hidden border-2 transition ${id === profile.coverTemplateId ? 'border-[#0A66C2]' : 'border-transparent hover:border-slate-300'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={COVER_ART[id].backgroundUrl} alt={id} className="w-full aspect-1584/396 object-cover" />
                {id === profile.coverTemplateId && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </PickerOverlay>
      )}

      {showPfpPicker && (
        <PickerOverlay title="Choose a background" onClose={() => setShowPfpPicker(false)}>
          <div className="grid grid-cols-4 gap-3">
            {PFP_GRADIENT_IDS.map((id) => (
              <button
                key={id}
                onClick={() => selectPfpGradient(id)}
                className={`relative rounded-full overflow-hidden border-2 aspect-square transition ${id === profile.pfpGradientId ? 'border-[#0A66C2]' : 'border-transparent hover:border-slate-300'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/linkedin-templates/pfp/${id}/background.jpg`} alt={id} className="w-full h-full object-cover" />
                {id === profile.pfpGradientId && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </PickerOverlay>
      )}

      {cropSourceUrl && (
        <PfpCropModal
          key={cropSourceUrl}
          imageUrl={cropSourceUrl}
          onCancel={() => setCropSourceUrl(null)}
          onChangePhoto={(file) => setCropSourceUrl(URL.createObjectURL(file))}
          onConfirm={(dataUrl) => {
            set({ headshotUrl: dataUrl });
            setCropSourceUrl(null);
          }}
        />
      )}

      {/* Floating Report Issue Button */}
      <div className="hidden md:flex fixed bottom-8 right-8 z-40 flex-col items-end gap-3 select-none">
        <button
          onClick={() => setReportIssueModalOpen(true)}
          className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 shadow-xl flex items-center justify-center hover:bg-rose-200 transition-colors mr-2 cursor-pointer"
          title="Report an Issue"
        >
          <Bug className="w-5 h-5" />
        </button>
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
                Found a bug or have feedback on the LinkedIn Profile & Cover generator? Describe it below and optionally attach a screenshot.
              </p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Description</label>
                <textarea
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="E.g., The cover banner text alignment..."
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
    </div>
  );
};
