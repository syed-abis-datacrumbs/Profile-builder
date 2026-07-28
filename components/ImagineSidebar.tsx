'use client';

import React from 'react';
import { 
  Sparkles, 
  Plus, 
  ChevronRight, 
  Settings,
  FileText,
  Bot,
  MessageSquare,
  Home
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';
import { ActiveTab } from '../types';

interface ImagineSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewChat: () => void;
  userName?: string;
  planName?: string;
  onOpenUpgrade?: () => void;
}

export const ImagineSidebar: React.FC<ImagineSidebarProps> = ({
  activeTab,
  setActiveTab,
  onNewChat,
  userName = "Abis Hussain Syed",
  planName = "Free Plan",
  onOpenUpgrade
}) => {
  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col h-screen border-r border-slate-200 bg-[#FAFAFA] p-3 text-slate-800 justify-between select-none">
      
      <div className="space-y-4">
        
        {/* Brand Header (Clickable Logo to open homepage) */}
        <div 
          onClick={() => {
            setActiveTab('home');
            onNewChat();
          }}
          className="flex items-center justify-between px-2 pt-1 pb-1 cursor-pointer group hover:bg-slate-200/50 rounded-xl transition-all"
          title="Go to Homepage"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src="/logo.png" 
              alt="MOMENTUM Logo" 
              className="w-8 h-8 object-contain shrink-0 rounded-md group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight uppercase group-hover:text-blue-600 transition-colors">
                MOMENTUM
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-tight truncate">
                Accelerate your career journey.
              </span>
            </div>
          </div>
          <button 
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200/60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
        </div>

        {/* Main Nav Items */}
        <nav className="space-y-0.5 text-xs font-medium px-1">

          <button
            onClick={() => {
              setActiveTab('home');
              onNewChat();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-slate-700" />
              <span>Home</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
              activeTab === 'resume'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Resume Builder</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
              activeTab === 'github'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GithubIcon className="w-4 h-4 text-slate-800" />
              <span>GitHub README</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('linkedin')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
              activeTab === 'linkedin'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LinkedinIcon className="w-4 h-4 text-blue-600" />
              <span>LinkedIn Optimizer</span>
            </div>
          </button>

        </nav>

        {/* Projects Section */}
        <div className="px-2 pt-2 border-t border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Projects</span>
            <button className="hover:text-slate-600 text-sm">+</button>
          </div>
          <button className="w-full flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 py-1 font-medium">
            <span>📂</span>
            <span>New Project</span>
          </button>
        </div>

      </div>

      {/* Bottom Ask Expert Card & User Footer */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        
        {/* Ask Expert Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-blue-50/50 to-indigo-50/50 border border-blue-100 space-y-2">
          <div>
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask Expert</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
              Get 1-on-1 AI advice & live review on your career assets
            </p>
          </div>
          <button
            onClick={onOpenUpgrade}
            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all text-center"
          >
            Ask Expert
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-1 space-y-1">
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
            <span>Get started</span>
            <span>8% done</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-[8%] h-full bg-blue-600 rounded-full" />
          </div>
        </div>

        {/* User Profile Bar */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              A
            </div>
            <div className="truncate">
              <div className="font-bold text-xs text-slate-900 truncate">
                {userName}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {planName}
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>

    </aside>
  );
};
