'use client';

import React, { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import {
  ChevronRight,
  Settings,
  FileText,
  MessageSquare,
  Briefcase,
  Globe,
  Brain,
  Palette,
  HelpCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  /** Mobile drawer visibility — owned by the page so the top bar can toggle it. */
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  { id: 'resume', label: 'Resume Builder', icon: FileText, color: 'text-blue-600' },
  { id: 'github', label: 'GitHub README', icon: GithubIcon, color: 'text-slate-800' },
  { id: 'linkedin', label: 'LinkedIn Optimizer', icon: LinkedinIcon, color: 'text-blue-600' },
  { id: 'jobhunting', label: 'Job Hunting', icon: Briefcase, color: 'text-emerald-600' },
  { id: 'freelancing', label: 'Freelancing', icon: Globe, color: 'text-purple-600' },
  { id: 'interview', label: 'Interview Prep', icon: Brain, color: 'text-amber-600' },
] as const;

interface SidebarBodyProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewChat: () => void;
  userName: string;
  planName: string;
  onOpenUpgrade?: () => void;
  onOpenAskExpert?: () => void;
  /** The desktop rail and the mobile drawer are both mounted at once, so the
      active-pill layout animation needs a distinct id per instance — sharing
      one would make framer-motion try to tween between the two sidebars. */
  layoutIdSuffix: string;
}

// The nav itself, rendered identically in the desktop rail and the mobile
// drawer so the two can never drift apart.
const SidebarBody: React.FC<SidebarBodyProps> = ({
  activeTab,
  onSelectTab,
  onNewChat,
  userName,
  planName,
  onOpenUpgrade,
  onOpenAskExpert,
  layoutIdSuffix
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { signOut } = useClerk();

  // Real initials from the signed-in (or fallback placeholder) name, instead
  // of the previously-hardcoded "AH" — e.g. "Abis Hussain" -> "AH".
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <>
      <div className="space-y-4">

        {/* Brand Header (click resets the current builder to its landing view) */}
        <div
          onClick={onNewChat}
          className="flex items-center justify-between px-2 pt-1 pb-1 cursor-pointer group hover:bg-slate-200/50 rounded-xl transition-all"
          title="Reset to landing"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectTab(item.id as ActiveTab)}
                className={`relative w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId={`activeTabBg-${layoutIdSuffix}`}
                    className="absolute inset-0 bg-slate-200/80 rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                </div>
              </motion.button>
            );
          })}
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
                      {initials}
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
                    signOut();
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
                {initials}
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
    </>
  );
};

export const ImagineSidebar: React.FC<ImagineSidebarProps> = ({
  activeTab,
  setActiveTab,
  onNewChat,
  userName = "Abis Hussain Syed",
  planName = "Free Plan",
  onOpenUpgrade,
  onOpenAskExpert,
  isMobileOpen = false,
  onCloseMobile
}) => {
  // The drawer sits over the page, so the page behind it must not scroll —
  // otherwise a swipe on the backdrop scrolls the builder underneath.
  useEffect(() => {
    if (!isMobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileOpen]);

  const shared = {
    activeTab,
    onNewChat,
    userName,
    planName,
    onOpenUpgrade,
    onOpenAskExpert,
  };

  return (
    <>
      {/* Desktop rail */}
      <aside className="w-64 shrink-0 hidden md:flex flex-col h-screen border-r border-slate-200 bg-[#FAFAFA] p-3 text-slate-800 justify-between select-none">
        <SidebarBody {...shared} onSelectTab={setActiveTab} layoutIdSuffix="desktop" />
      </aside>

      {/* Mobile drawer — same nav, slid in over the content */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div key="mobile-nav" className="md:hidden fixed inset-0 z-[60] flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="relative w-[17rem] max-w-[85vw] h-full flex flex-col border-r border-slate-200 bg-[#FAFAFA] p-3 text-slate-800 justify-between select-none overflow-y-auto shadow-2xl"
            >
              <button
                onClick={onCloseMobile}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarBody
                {...shared}
                layoutIdSuffix="mobile"
                onNewChat={() => {
                  onNewChat();
                  onCloseMobile?.();
                }}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                  onCloseMobile?.();
                }}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * Mobile-only top bar. Lives at the top of the content column rather than
 * floating over it, so it never covers a view's own back button — the LinkedIn
 * and GitHub studios both put one in their top-left corner.
 */
export const MobileNavBar: React.FC<{ onOpenMenu: () => void }> = ({ onOpenMenu }) => (
  <div className="md:hidden shrink-0 flex items-center gap-2.5 px-3 py-2 border-b border-slate-200 bg-[#FAFAFA]">
    <button
      onClick={onOpenMenu}
      className="p-1.5 -ml-1 rounded-lg text-slate-700 hover:bg-slate-200/70 transition-colors"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5" />
    </button>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logo.png" alt="" className="w-6 h-6 object-contain rounded shrink-0" />
    <span className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">
      MOMENTUM
    </span>
  </div>
);
