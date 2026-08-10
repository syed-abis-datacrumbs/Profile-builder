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

const BADGE_COLORS: Record<string, string> = {
  python: '3776AB', typescript: '3178C6', javascript: 'F7DF1E', react: '61DAFB',
  'next.js': '000000', nextjs: '000000', 'node.js': '339933', nodejs: '339933',
  fastapi: '009688', pytorch: 'EE4C2C', tensorflow: 'FF6F00', docker: '2496ED',
  kubernetes: '326CE5', postgresql: '4169E1', mysql: '4479A1', redis: 'DC382D',
  tailwindcss: '06B6D4', git: 'F05032', aws: 'FF9900', go: '00ADD8', rust: '000000',
  'scikit-learn': 'F7931E', pandas: '150458', numpy: '013243', graphql: 'E10098',
};
const badgeColor = (name: string) => BADGE_COLORS[name.toLowerCase()] ?? '6366f1';

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

/** Inline plain-text edit (title / about / section text). Commits on blur. */
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
      className={`${className || ''} outline-none rounded hover:bg-white/5 focus:bg-white/10 cursor-text whitespace-pre-wrap empty:before:content-[attr(data-ph)] empty:before:text-slate-500`}
      onBlur={(e) => {
        const v = e.currentTarget.textContent ?? '';
        if (v !== value) onCommit(v);
      }}
    >
      {value}
    </Tag>
  );
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [customBannerInput, setCustomBannerInput] = useState('');

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
      const res = await fetch('/api/github-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, github }),
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
    await navigator.clipboard.writeText(generateGithubMarkdown(github));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const set = (patch: Partial<GithubProfileData>) => onChange({ ...github, ...patch });
  const setSection = (i: number, patch: Partial<GithubProfileData['customSections'][number]>) =>
    set({ customSections: github.customSections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

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
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-800 truncate">
              Creating GitHub README...
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold">
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
                <span>Generating AI README updates…</span>
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
              <div className="flex items-center gap-1.5">
                <button type="button" className="w-6 h-6 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs">
                  +
                </button>
                <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[10px] font-semibold flex items-center gap-1 border border-slate-300/50">
                  <Check className="w-2.5 h-2.5 text-slate-500" />
                  <span>Auto</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-600 border border-slate-200">
                  Flash
                </span>
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
        </div>
      </div>

      {/* COLUMN 3 (README PREVIEW - RIGHT) */}
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
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200/80">
              <GithubIcon className="w-3.5 h-3.5 text-slate-800" />
              <span>README.md</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
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
              onClick={downloadReadme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              README.md
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="w-full max-w-[820px] bg-slate-950 text-slate-200 rounded-xl border border-slate-800 overflow-hidden font-sans">
            {/* ── Banner + Avatar (LinkedIn-style) ── */}
            <div className="relative">
              {/* Banner */}
              {github.bannerUrl ? (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={github.bannerUrl}
                    alt="Banner"
                    className="w-full object-cover"
                    style={{ height: 200 }}
                  />
                  {/* Quick-change overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setShowBannerPicker(true)}
                      className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur text-white text-xs font-bold hover:bg-white/30 transition-colors"
                    >
                      <Image className="w-3.5 h-3.5 inline mr-1" />
                      Change
                    </button>
                    <button
                      onClick={() => set({ bannerUrl: undefined })}
                      className="px-3 py-1.5 rounded-lg bg-red-500/30 backdrop-blur text-white text-xs font-bold hover:bg-red-500/50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 inline mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* Placeholder when no banner */
                <div className="h-32 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center">
                  <button
                    onClick={() => setShowBannerPicker(true)}
                    className="px-4 py-2 border-2 border-dashed border-slate-600 rounded-lg text-slate-500 hover:text-slate-300 hover:border-slate-400 transition-colors text-xs font-semibold flex items-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    Add a cover banner
                  </button>
                </div>
              )}

              {/* Profile picture — overlaps bottom of banner, LinkedIn-style */}
              <div className="absolute -bottom-12 left-6">
                <div className="relative group/avatar">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-950 overflow-hidden bg-slate-800 shadow-xl">
                    {github.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={github.avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-500">
                        {(github.username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Camera overlay on hover */}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-default">
                    <span className="text-white text-[10px] font-semibold">Preview</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer for the avatar overflow + name/username row */}
            <div className="pt-14 px-6 pb-2 flex items-end justify-between">
              <div>
                <div className="text-lg font-bold text-white">{github.username ? github.username : 'your-username'}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-3 py-1 rounded-full border border-slate-700 text-[11px] font-semibold text-slate-400">Follow</span>
                <span className="text-[11px] text-slate-600">·</span>
                <span className="text-[11px] text-slate-500">0 followers · 0 following</span>
              </div>
            </div>

            {/* ── README content ── */}
            <div className="p-6 pt-2 space-y-6">

              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <Edit block value={github.title} placeholder="# Hi, I'm …" onCommit={(v) => set({ title: v })} className="text-2xl font-extrabold text-white tracking-tight" />
                <Edit block value={github.about} placeholder="Write your About Me…" onCommit={(v) => set({ about: v })} className="text-sm text-slate-300 mt-2 leading-relaxed" />
              </div>

              {/* Tech badges */}
              {github.techStack.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">🛠️ Tech Stack</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {github.techStack.map((tech) => (
                      <span key={tech} className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: `#${badgeColor(tech)}` }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics cards */}
              {(github.showStatsCard || github.showStreakCard || github.showTopLangsCard) && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">📊 GitHub Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {github.showStatsCard && (
                      isRealUsername(github.username)
                        ? <StatImg src={`https://github-readme-stats-ten-kohl-77.vercel.app/api?username=${encodeURIComponent(github.username)}&show_icons=true&theme=${github.theme}`} alt="GitHub Stats" fallback={<DummyStatsCard />} />
                        : <DummyStatsCard />
                    )}
                    {github.showTopLangsCard && (
                      isRealUsername(github.username)
                        ? <StatImg src={`https://github-readme-stats-ten-kohl-77.vercel.app/api/top-langs/?username=${encodeURIComponent(github.username)}&layout=compact&theme=${github.theme}`} alt="Top Languages" fallback={<DummyTopLangsCard />} />
                        : <DummyTopLangsCard />
                    )}
                    {github.showStreakCard && (
                      isRealUsername(github.username)
                        ? <StatImg src={`https://github-readme-streak-stats.herokuapp.com/?user=${encodeURIComponent(github.username)}&theme=${github.theme}`} alt="GitHub Streak" fallback={<DummyStreakCard />} />
                        : <DummyStreakCard />
                    )}
                  </div>
                  {!isRealUsername(github.username) && (
                    <p className="text-[10px] text-slate-600 italic">
                      Showing sample data — enter your real GitHub username to load your live stats.
                    </p>
                  )}
                </div>
              )}

              {/* Custom sections */}
              {github.customSections.map((sec, i) => (
                <div key={i} className="space-y-1.5 pt-3 border-t border-slate-800">
                  <Edit value={sec.title} placeholder="Section title" onCommit={(v) => setSection(i, { title: v })} className="text-sm font-bold text-white" block />
                  <Edit value={sec.content} placeholder="Section content…" onCommit={(v) => setSection(i, { content: v })} className="text-sm text-slate-300 leading-relaxed" block />
                </div>
              ))}

              {/* Socials */}
              {(github.socialLinks.linkedin || github.socialLinks.twitter || github.socialLinks.email || github.socialLinks.website) && (
                <div className="pt-3 border-t border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">🌐 Connect</h3>
                  <div className="flex flex-wrap gap-2">
                    {github.socialLinks.linkedin && <Social label="LinkedIn" color="0077B5" />}
                    {github.socialLinks.twitter && <Social label="Twitter" color="1DA1F2" />}
                    {github.socialLinks.email && <Social label="Email" color="D14836" />}
                    {github.socialLinks.website && <Social label="Website" color="4338CA" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Placeholder usernames that shouldn't hit the live API. */
const PLACEHOLDER_USERNAMES = new Set(['', 'alexrivera-ai', 'your-username']);
function isRealUsername(u: string): boolean {
  return !!u.trim() && !PLACEHOLDER_USERNAMES.has(u.trim());
}

/**
 * Live stats image with graceful fallback. If the external API image fails to
 * load (Heroku cold-start, network timeout, invalid user) OR takes longer than
 * 15 seconds, it renders the fallback with a retry option.
 */
function StatImg({ src, alt, fallback }: { src: string; alt: string; fallback?: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  // Timeout: if the image hasn't loaded in 15s, give up and show the fallback.
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setTimeout(() => setStatus('error'), 15000);
    return () => clearTimeout(timer);
  }, [status, attempt]);

  const retry = () => {
    setAttempt((a) => a + 1);
    setStatus('loading');
  };

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
        <span className="text-[11px] text-slate-500">Stats API didn't respond</span>
        <button
          onClick={retry}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {status === 'loading' && (
        <div className="absolute inset-0 rounded-lg border border-slate-800 bg-slate-900 animate-pulse flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={attempt}
        src={attempt > 0 ? `${src}&_r=${attempt}` : src}
        alt={alt}
        loading="lazy"
        className={`w-full rounded-lg border border-slate-800 bg-slate-900 ${status === 'loading' ? 'invisible' : ''}`}
        onLoad={() => setStatus('ok')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}

function Social({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold text-white" style={{ backgroundColor: `#${color}` }}>
      {label}
    </span>
  );
}

/* ── Dummy stat cards ── styled to look like real github-readme-stats cards ── */

function DummyStatsCard() {
  const stats = [
    { label: 'Total Stars Earned', value: '142' },
    { label: 'Total Commits (2025)', value: '1,247' },
    { label: 'Total PRs', value: '89' },
    { label: 'Total Issues', value: '34' },
    { label: 'Contributed to', value: '12' },
  ];
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2.5">
      <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
        <span className="text-indigo-400">⚡</span> GitHub Stats
      </div>
      {stats.map((s) => (
        <div key={s.label} className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{s.label}</span>
          <span className="text-[11px] font-bold text-slate-300 tabular-nums">{s.value}</span>
        </div>
      ))}
      <div className="pt-1.5 mt-1 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">Rank:</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '68%' }} />
          </div>
          <span className="text-[10px] font-bold text-indigo-400">A+</span>
        </div>
      </div>
    </div>
  );
}

function DummyTopLangsCard() {
  const langs = [
    { name: 'TypeScript', pct: 38, color: '#3178C6' },
    { name: 'Python', pct: 28, color: '#3776AB' },
    { name: 'JavaScript', pct: 18, color: '#F7DF1E' },
    { name: 'CSS', pct: 9, color: '#563D7C' },
    { name: 'Other', pct: 7, color: '#6366f1' },
  ];
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2.5">
      <div className="text-xs font-bold text-slate-300">Most Used Languages</div>
      {/* Compact bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden">
        {langs.map((l) => (
          <div key={l.name} style={{ width: `${l.pct}%`, backgroundColor: l.color }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {langs.map((l) => (
          <div key={l.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-[11px] text-slate-400">{l.name}</span>
            <span className="text-[10px] text-slate-600 ml-auto tabular-nums">{l.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DummyStreakCard() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 flex items-center justify-around text-center">
      <div>
        <div className="text-lg font-bold text-orange-400 tabular-nums">1,247</div>
        <div className="text-[10px] text-slate-500">Total Contributions</div>
      </div>
      <div className="w-px h-10 bg-slate-800" />
      <div>
        <div className="text-lg font-bold text-orange-400 tabular-nums">16</div>
        <div className="text-[10px] text-slate-500 leading-tight">Current Streak</div>
        <div className="text-[9px] text-slate-600">Jul 14 – Jul 30</div>
      </div>
      <div className="w-px h-10 bg-slate-800" />
      <div>
        <div className="text-lg font-bold text-orange-400 tabular-nums">42</div>
        <div className="text-[10px] text-slate-500">Longest Streak</div>
        <div className="text-[9px] text-slate-600">Mar 1 – Apr 11</div>
      </div>
    </div>
  );
}

