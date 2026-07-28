'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  ChevronRight, 
  Settings,
  FileText,
  Bot,
  MessageSquare,
  Home,
  DollarSign,
  Briefcase,
  Globe,
  Brain,
  Palette,
  HelpCircle,
  LogOut,
  CreditCard
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
  onOpenAskExpert?: () => void;
}

export const ImagineSidebar: React.FC<ImagineSidebarProps> = ({
  activeTab,
  setActiveTab,
  onNewChat,
  userName = "Abis Hussain Syed",
  planName = "Free Plan",
  onOpenUpgrade,
  onOpenAskExpert
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

          <button
            onClick={() => setActiveTab('jobhunting')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
              activeTab === 'jobhunting'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Job Hunting</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('freelancing')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
              activeTab === 'freelancing'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-purple-600" />
              <span>Freelancing</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('interview')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
              activeTab === 'interview'
                ? 'bg-slate-200/80 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Brain className="w-4 h-4 text-amber-600" />
              <span>Interview Prep</span>
            </div>
          </button>

        </nav>

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
            onClick={onOpenAskExpert || onOpenUpgrade}
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

        {/* User Profile Bar & Popover */}
        <div className="relative w-full">
          
          {/* Settings Popover Dropdown (Width set to w-full matching sidebar padding) */}
          {isSettingsOpen && (
            <div className="absolute bottom-full mb-2 left-0 right-0 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-3 z-50 animate-in fade-in slide-in-from-bottom-2 text-slate-900">
              
              {/* Account Info Header */}
              <div>
                <div 
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      AH
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        Abishussainsyed&apos;s Personal
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {planName}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    if (onOpenUpgrade) onOpenUpgrade();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs transition-colors text-center"
                >
                  Upgrade
                </button>
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    if (onOpenAskExpert) {
                      onOpenAskExpert();
                    } else if (onOpenUpgrade) {
                      onOpenUpgrade();
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-900 font-semibold text-xs transition-colors text-center truncate"
                >
                  Support
                </button>
              </div>

              {/* Menu List: Theme, Help Center, Log out */}
              <div className="pt-2 border-t border-slate-200 space-y-0.5 text-xs font-semibold text-slate-700">
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Palette className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Theme</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Help Center</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    alert('Successfully logged out.');
                  }}
                  className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log out</span>
                </button>
              </div>

            </div>
          )}

          {/* User Profile Bar (Trigger) */}
          <div 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
          >
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
            <button 
              type="button"
              className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </aside>
  );
};
