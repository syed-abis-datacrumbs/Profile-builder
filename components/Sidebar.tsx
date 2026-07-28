'use client';

import React from 'react';
import { 
  FileText, 
  Bot, 
  Sparkles, 
  CheckSquare, 
  History, 
  TrendingUp, 
  Lightbulb, 
  FileCode, 
  Award,
  BookOpen,
  Plus
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';
import { ActiveTab, SavedProfile } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onApplyPrompt: (prompt: string) => void;
  savedProfiles: SavedProfile[];
  onLoadProfile: (profile: SavedProfile) => void;
  onNewProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onApplyPrompt,
  savedProfiles,
  onLoadProfile,
  onNewProfile
}) => {
  // Starter prompts categorized by active workspace
  const getStarterPrompts = () => {
    switch (activeTab) {
      case 'resume':
        return [
          { text: "Senior Software Engineer with Next.js & PyTorch experience", label: "Senior Eng" },
          { text: "Healthcare Nurse resume with Patient Care & ICU metrics", label: "Healthcare" },
          { text: "Product Manager resume focusing on KPI growth & Agile", label: "Product Lead" },
          { text: "Entry-level Data Scientist with Machine Learning projects", label: "Data Science" }
        ];
      case 'github':
        return [
          { text: "Minimalist Dev Portfolio README with dynamic stats card", label: "Minimalist" },
          { text: "Dark Cyberpunk themed GitHub Bio with tech stack badges", label: "Cyberpunk" },
          { text: "Open Source Contributor README with streak metrics", label: "Open Source" },
          { text: "Full-Stack Dev README with social badges & repo showcase", label: "Full Stack" }
        ];
      case 'linkedin':
        return [
          { text: "High-impact Executive Tech Leader Headline & About summary", label: "Executive" },
          { text: "Career Switcher Story: Non-tech to AI Solutions Architect", label: "Career Pivot" },
          { text: "High-Converting Sales & Growth Engineer LinkedIn profile", label: "Growth Tech" },
          { text: "Clean Freelance Consultant & Developer Profile", label: "Consultant" }
        ];
      default:
        return [
          { text: "Build a complete career kit for a Lead AI Systems Engineer", label: "Lead AI Eng" },
          { text: "Generate ATS optimized resume & GitHub bio for Full-Stack Dev", label: "Full Stack Kit" },
          { text: "Optimize my LinkedIn headline and experience bullet points", label: "LinkedIn Boost" }
        ];
    }
  };

  const starterPrompts = getStarterPrompts();

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-5 p-4 rounded-2xl glass-panel bg-slate-950/70 border border-slate-800/80">
      
      {/* Quick Workspace Selection */}
      <div className="space-y-1">
        <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Career Workspace
        </h3>
        
        <button
          onClick={() => setActiveTab('resume')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'resume'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Resume Builder</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            ATS 94%
          </span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'github'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <GithubIcon className="w-4 h-4 text-slate-300" />
            <span>GitHub README</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            Markdown
          </span>
        </button>

        <button
          onClick={() => setActiveTab('linkedin')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'linkedin'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LinkedinIcon className="w-4 h-4 text-blue-400" />
            <span>LinkedIn Profile</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            Optimizer
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'assistant'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>AI Studio Agent</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
            Interactive
          </span>
        </button>
      </div>

      {/* Starter Prompts */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Starter Prompts</span>
          </div>
          <span className="text-[10px] text-slate-400">Click to run</span>
        </div>

        <div className="space-y-1.5">
          {starterPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onApplyPrompt(item.text)}
              className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-indigo-950/20 group transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {item.label}
                </span>
                <Sparkles className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
              <p className="text-[11px] text-slate-300 group-hover:text-white line-clamp-2 leading-relaxed">
                "{item.text}"
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Saved Drafts / History */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Saved Profiles ({savedProfiles.length})</span>
          </div>
          <button
            onClick={onNewProfile}
            className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {savedProfiles.length === 0 ? (
            <div className="p-3 text-center rounded-xl bg-slate-900/40 border border-slate-800/60 text-slate-500 text-xs">
              No saved profiles yet.
            </div>
          ) : (
            savedProfiles.map((prof) => (
              <button
                key={prof.id}
                onClick={() => onLoadProfile(prof)}
                className="w-full text-left p-2 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 hover:border-indigo-500/40 transition-all"
              >
                <div className="font-semibold text-xs text-slate-200 truncate">
                  {prof.name}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                  <span>{prof.resume.personalInfo.jobTitle || 'Tech Professional'}</span>
                  <span>{prof.updatedAt}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Bottom Pro Tip */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>ATS Optimization Tip</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Include quantified metric bullets (e.g. "Reduced latency by 42%") to boost recruiter response by 3.5x.
        </p>
      </div>

    </aside>
  );
};
