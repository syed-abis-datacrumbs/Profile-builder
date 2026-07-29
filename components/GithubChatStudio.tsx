'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Sparkles, Loader2, Download, Check } from 'lucide-react';
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
}> = ({ github, onChange, onBack }) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'Loaded your README. Edit the text directly on the right, or ask me for anything structured — e.g. "add a Python badge", "enable the streak card", "use the tokyonight theme", or "add my LinkedIn https://…".',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
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
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-150px)]">
      {/* LEFT — chat */}
      <div className="lg:w-[34%] xl:w-[30%] flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <button onClick={onBack} className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center" title="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="font-bold text-sm text-slate-800">AI README Assistant</span>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
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
              placeholder="Ask the AI to edit your README…"
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none max-h-24"
            />
            <button onClick={send} disabled={loading || !input.trim()} className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT — editable README preview */}
      <div className="lg:flex-1 flex flex-col bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white border-b border-slate-200">
          <GithubIcon className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-bold text-slate-700 truncate">github.com/{github.username || 'your-username'}</span>
          <span className="hidden lg:block text-[11px] text-slate-400">Click text to edit · badges & cards via chat</span>
          <div className="ml-auto flex items-center gap-2">
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
          <div className="w-full max-w-[820px] bg-slate-950 text-slate-200 rounded-xl border border-slate-800 p-6 space-y-6 font-sans">
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

            {/* Analytics cards — live github-readme-stats images (need a real
                GitHub username to resolve). */}
            {(github.showStatsCard || github.showStreakCard || github.showTopLangsCard) && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">📊 GitHub Analytics</h3>
                {github.username ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {github.showStatsCard && (
                      <StatImg src={`https://github-readme-stats-ten-kohl-77.vercel.app/api?username=${encodeURIComponent(github.username)}&show_icons=true&theme=${github.theme}`} alt="GitHub Stats" />
                    )}
                    {github.showTopLangsCard && (
                      <StatImg src={`https://github-readme-stats-ten-kohl-77.vercel.app/api/top-langs/?username=${encodeURIComponent(github.username)}&layout=compact&theme=${github.theme}`} alt="Top Languages" />
                    )}
                    {github.showStreakCard && (
                      <StatImg src={`https://github-readme-streak-stats.herokuapp.com/?user=${encodeURIComponent(github.username)}&theme=${github.theme}`} alt="GitHub Streak" />
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Add your GitHub username (ask the chat: &quot;my username is …&quot;) to load your live stats cards.
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
  );
};

function StatImg({ src, alt }: { src: string; alt: string }) {
  // Live github-readme-stats image — renders the user's real stats.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className="w-full rounded-lg border border-slate-800 bg-slate-900" />;
}

function Social({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold text-white" style={{ backgroundColor: `#${color}` }}>
      {label}
    </span>
  );
}
