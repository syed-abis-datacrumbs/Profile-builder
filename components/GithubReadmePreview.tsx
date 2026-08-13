'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { GithubProfileData } from '../types';

const BADGE_COLORS: Record<string, string> = {
  python: '3776AB', typescript: '3178C6', javascript: 'F7DF1E', react: '61DAFB',
  'next.js': '000000', nextjs: '000000', 'node.js': '339933', nodejs: '339933',
  fastapi: '009688', pytorch: 'EE4C2C', tensorflow: 'FF6F00', docker: '2496ED',
  kubernetes: '326CE5', postgresql: '4169E1', mysql: '4479A1', redis: 'DC382D',
  tailwindcss: '06B6D4', git: 'F05032', aws: 'FF9900', go: '00ADD8', rust: '000000',
  'scikit-learn': 'F7931E', pandas: '150458', numpy: '013243', graphql: 'E10098',
};
export const badgeColor = (name: string) => BADGE_COLORS[name.toLowerCase()] ?? '6366f1';

export function Edit({
  value,
  onCommit,
  className,
  placeholder,
  block,
  readOnly,
}: {
  value: string;
  onCommit?: (v: string) => void;
  className?: string;
  placeholder?: string;
  block?: boolean;
  readOnly?: boolean;
}) {
  const Tag = (block ? 'div' : 'span') as 'div';
  if (readOnly) {
    return <Tag className={`${className || ''} whitespace-pre-wrap`}>{value || <span className="text-slate-500">{placeholder}</span>}</Tag>;
  }
  return (
    <Tag
      key={value}
      contentEditable
      suppressContentEditableWarning
      data-ph={placeholder}
      className={`${className || ''} outline-none rounded hover:bg-white/5 focus:bg-white/10 cursor-text whitespace-pre-wrap empty:before:content-[attr(data-ph)] empty:before:text-slate-500`}
      onBlur={(e) => {
        const v = e.currentTarget.textContent ?? '';
        if (v !== value && onCommit) onCommit(v);
      }}
    >
      {value}
    </Tag>
  );
}

export const GithubReadmePreview: React.FC<{
  github: GithubProfileData;
  editable?: boolean;
  onSet?: (patch: Partial<GithubProfileData>) => void;
  onSetSection?: (index: number, patch: Partial<GithubProfileData['customSections'][number]>) => void;
  onShowBannerPicker?: () => void;
}> = ({ github, editable = false, onSet, onSetSection, onShowBannerPicker }) => {
  return (
    <div className="w-full max-w-[820px] bg-slate-950 text-slate-200 rounded-xl border border-slate-800 overflow-hidden font-sans mx-auto shadow-2xl">
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
            {editable && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={onShowBannerPicker}
                  className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur text-white text-xs font-bold hover:bg-white/30 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
                  Change
                </button>
                <button
                  onClick={() => onSet?.({ bannerUrl: undefined })}
                  className="px-3 py-1.5 rounded-lg bg-red-500/30 backdrop-blur text-white text-xs font-bold hover:bg-red-500/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5 inline mr-1" />
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Placeholder when no banner */
          <div className="h-32 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center">
            {editable && (
              <button
                onClick={onShowBannerPicker}
                className="px-4 py-2 border-2 border-dashed border-slate-600 rounded-lg text-slate-500 hover:text-slate-300 hover:border-slate-400 transition-colors text-xs font-semibold flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Add a cover banner
              </button>
            )}
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
            {editable && (
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-default">
                <span className="text-white text-[10px] font-semibold">Preview</span>
              </div>
            )}
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
          <Edit block readOnly={!editable} value={github.title} placeholder="# Hi, I'm …" onCommit={(v) => onSet?.({ title: v })} className="text-2xl font-extrabold text-white tracking-tight" />
          <Edit block readOnly={!editable} value={github.about} placeholder="Write your About Me…" onCommit={(v) => onSet?.({ about: v })} className="text-sm text-slate-300 mt-2 leading-relaxed" />
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
            <Edit readOnly={!editable} value={sec.title} placeholder="Section title" onCommit={(v) => onSetSection?.(i, { title: v })} className="text-sm font-bold text-white" block />
            <Edit readOnly={!editable} value={sec.content} placeholder="Section content…" onCommit={(v) => onSetSection?.(i, { content: v })} className="text-sm text-slate-300 leading-relaxed" block />
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
  );
};

const PLACEHOLDER_USERNAMES = new Set(['', 'alexrivera-ai', 'your-username']);
function isRealUsername(u: string): boolean {
  return !!u.trim() && !PLACEHOLDER_USERNAMES.has(u.trim());
}

function StatImg({ src, alt, fallback }: { src: string; alt: string; fallback?: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

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
        <div className="text-lg font-bold text-orange-400 tabular-nums">164</div>
        <div className="text-[10px] text-slate-500 leading-tight">Longest Streak</div>
        <div className="text-[9px] text-slate-600">Dec 1 – May 14</div>
      </div>
    </div>
  );
}
