'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Bot, 
  Download, 
  Upload, 
  Award, 
  UserCheck, 
  ChevronDown,
  Layers,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
  onOpenATS: () => void;
  onOpenImport: () => void;
  onExportAll: () => void;
  atsScore: number;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isLoggedIn: boolean;
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenATS,
  onOpenImport,
  onExportAll,
  atsScore,
  selectedModel,
  setSelectedModel,
  isLoggedIn,
  userEmail
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const models = [
    { id: 'flash-3.5', name: 'ProfileArchitect Flash 3.5', desc: 'Ultra-fast formatting & resume tuning', badge: 'Fastest' },
    { id: 'omni-pro', name: 'Omni Career Pro 4.0', desc: 'Deep industry keywords & LinkedIn polish', badge: 'Recommended' },
    { id: 'ats-max', name: 'ATS Optimizer Engine', desc: 'Maximum ATS parser compatibility & keyword density', badge: 'High Match' }
  ];

  const currentModelObj = models.find(m => m.id === selectedModel) || models[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 glass-panel bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                  ProfileArchitect
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI Workspace
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                AI Career Builder for Tech Professionals
              </p>
            </div>
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-all shadow-inner"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentModelObj.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                {currentModelObj.badge}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {modelDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Select Intelligence Engine
                </div>
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-start justify-between gap-2 ${
                      selectedModel === m.id
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{m.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                    </div>
                    {selectedModel === m.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('resume')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'resume'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resume</span>
            </button>

            <button
              onClick={() => setActiveTab('github')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'github'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub Bio</span>
            </button>

            <button
              onClick={() => setActiveTab('linkedin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'linkedin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">LinkedIn</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'assistant'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">AI Studio</span>
            </button>
          </nav>

          {/* Action Center & User Account */}
          <div className="flex items-center gap-2">
            
            {/* ATS Score Indicator Button */}
            <button
              onClick={onOpenATS}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
              title="Click to view ATS Score breakdown"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>ATS {atsScore}%</span>
            </button>

            {/* Import Resume Button */}
            <button
              onClick={onOpenImport}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import</span>
            </button>

            {/* Export Button */}
            <button
              onClick={onExportAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Auth Button */}
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isLoggedIn
                  ? 'bg-slate-900 text-indigo-400 border-indigo-500/40 hover:border-indigo-400'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">
                {isLoggedIn ? userEmail?.split('@')[0] || 'Account' : 'Sign In'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
