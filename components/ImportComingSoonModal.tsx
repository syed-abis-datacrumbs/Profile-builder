'use client';

import React, { useEffect } from 'react';
import { Upload, Sparkles, X, FileText, Zap } from 'lucide-react';
import { GithubIcon } from './icons';

interface ImportComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportComingSoonModal: React.FC<ImportComingSoonModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-center animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Icon Badge */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/25 ring-8 ring-blue-50 mb-5">
          <Upload className="w-8 h-8" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        {/* Coming Soon Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Zap className="w-3 h-3 fill-blue-600 text-blue-600" />
          Feature Coming Soon
        </div>

        {/* Heading & Subtitle */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
          Resume & Profile Import
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
          We’re currently fine-tuning our AI-powered resume parsing and GitHub profile sync in private testing. This feature will be rolled out to all users very soon!
        </p>

        {/* Preview of capabilities */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            What you’ll be able to do:
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span>Auto-extract experience, skills & projects from any PDF</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <GithubIcon className="w-3.5 h-3.5" />
            </div>
            <span>Sync public repositories & bio directly into your profile</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98]"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
