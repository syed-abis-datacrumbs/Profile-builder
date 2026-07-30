'use client';

import React from 'react';
import { 
  ArrowLeft, 
  PenSquare, 
  Terminal, 
  Sparkles, 
  Star, 
  GitFork, 
  FolderGit2, 
  Flame, 
  Activity, 
  CheckCircle2, 
  Layers, 
  Cpu
} from 'lucide-react';
import { GithubTemplateCard } from './GithubLandingView';
import { GITHUB_ROLE_PRESETS } from '../lib/githubRolePresets';

interface GithubTemplatePreviewProps {
  template: GithubTemplateCard;
  onBack: () => void;
  onEdit: () => void;
}

export const GithubTemplatePreview: React.FC<GithubTemplatePreviewProps> = ({
  template,
  onBack,
  onEdit
}) => {
  const preset = GITHUB_ROLE_PRESETS.find((p) => p.id === template.presetId) || GITHUB_ROLE_PRESETS[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-12 font-sans">
      
      {/* ── Top Modal Navigation Header ── */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-3.5 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to templates</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Template: <strong className="text-slate-800">{template.name}</strong></span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 text-[10px] uppercase font-mono">
              {template.theme}
            </span>
          </div>

          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-full px-5 py-2 transition-all shadow-sm cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Use Template</span>
          </button>
        </div>
      </div>

      {/* ── Full README Visual Mockup Canvas ── */}
      <div className={`w-full ${template.bgClass} border ${template.borderClass} rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-100 space-y-8 relative overflow-hidden`}>
        
        {/* Subtle Ambient Glow Effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* README File Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200 font-bold">README.md</span>
            <span>•</span>
            <span>preview mode</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Profile Theme
            </span>
          </div>
        </div>

        {/* 1. Header Banner & Intro */}
        <div className="space-y-4 text-center sm:text-left border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{template.headline}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {preset.label} Architect
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {template.subhead}
          </p>

          {/* Social Badges / Links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
            <span className="bg-blue-600/30 border border-blue-500/40 text-blue-300 px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5">
              <span>🌐 Portfolio</span>
            </span>
            <span className="bg-sky-600/30 border border-sky-500/40 text-sky-300 px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5">
              <span>💼 LinkedIn</span>
            </span>
            <span className="bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5">
              <span>⚡ Open for Hire</span>
            </span>
          </div>
        </div>

        {/* 2. Tech Stack & Badges */}
        <div className="space-y-3 border-b border-white/10 pb-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Technologies & Tools</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {preset.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="bg-slate-900/90 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm hover:border-slate-500 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {tech.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* 3. GitHub Stats & Activity Cards Mockup */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Live GitHub Metrics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stats Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>GitHub Stats</span>
                <Star className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between"><span>Total Stars:</span><span className="font-bold text-white">480+</span></div>
                <div className="flex justify-between"><span>Commits (2026):</span><span className="font-bold text-white">1,240</span></div>
                <div className="flex justify-between"><span>PRs Merged:</span><span className="font-bold text-white">142</span></div>
                <div className="flex justify-between"><span>Contributed to:</span><span className="font-bold text-white">38 repos</span></div>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>Streak Counter</span>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between"><span>Current Streak:</span><span className="font-bold text-orange-400">42 Days 🔥</span></div>
                <div className="flex justify-between"><span>Longest Streak:</span><span className="font-bold text-white">186 Days</span></div>
                <div className="flex justify-between"><span>Active Days:</span><span className="font-bold text-white">94%</span></div>
              </div>
            </div>

            {/* Top Languages */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>Top Languages</span>
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-cyan-400 h-full w-[55%]" />
                  <div className="bg-purple-400 h-full w-[30%]" />
                  <div className="bg-amber-400 h-full w-[15%]" />
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-cyan-400">Python 55%</span>
                  <span className="text-purple-400">TypeScript 30%</span>
                  <span className="text-amber-400">Go 15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Featured Projects Section */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-purple-400" />
            <span>Featured Open-Source Repositories</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {preset.projects.slice(0, 4).map((proj, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-2 text-xs transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-white text-sm flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-blue-400" />
                    {proj.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full">
                    Public
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {proj.desc}
                </p>
                <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono pt-1">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {85 + idx * 34}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-slate-400" /> {12 + idx * 4}</span>
                  <span className="text-slate-500">Updated 2 days ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Detailed Developer About / Philosophy */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            💡 Developer Bio & Engineering Philosophy
          </h3>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
            {preset.about}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
          <div className="text-xs text-slate-400">
            Ready to personalize this README for your GitHub profile?
          </div>
          <button
            onClick={onEdit}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl px-6 py-2.5 transition-all shadow-md cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Use This Template & Open Editor</span>
          </button>
        </div>

      </div>

    </div>
  );
};
