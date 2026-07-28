'use client';

import React from 'react';
import { Bell, Sparkles, UserCheck } from 'lucide-react';

interface ImagineHeaderProps {
  onOpenUpgrade: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  userEmail?: string;
}

export const ImagineHeader: React.FC<ImagineHeaderProps> = ({
  onOpenUpgrade,
  onOpenAuth,
  isLoggedIn,
  userEmail
}) => {
  return (
    <header className="w-full flex items-center justify-end p-4 gap-3 bg-transparent">
      
      {/* Bell Notification */}
      <button className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs">
        <Bell className="w-4 h-4" />
      </button>

      {/* Upgrade Button */}
      <button
        onClick={onOpenUpgrade}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-bold transition-all shadow-2xs"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Upgrade</span>
      </button>


      {/* Auth Account Button */}
      <button
        onClick={onOpenAuth}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-slate-300 text-xs font-semibold transition-all shadow-2xs"
      >
        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
        <span>{isLoggedIn ? userEmail?.split('@')[0] || 'Account' : 'Sign In'}</span>
      </button>

    </header>
  );
};
