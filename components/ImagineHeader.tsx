'use client';

import React, { useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { Bell, Sparkles, UserCheck, LogOut } from 'lucide-react';

interface ImagineHeaderProps {
  onOpenUpgrade: () => void;
  onOpenAuth: () => void;
}

export const ImagineHeader: React.FC<ImagineHeaderProps> = ({
  onOpenUpgrade,
  onOpenAuth
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const isLoggedIn = !!user;
  const userEmail = user?.primaryEmailAddress?.emailAddress || undefined;

  const handleButtonClick = () => {
    if (isLoggedIn) {
      setIsMenuOpen(!isMenuOpen);
    } else {
      onOpenAuth();
    }
  };

  return (
    <header className="w-full hidden md:flex items-center justify-end p-4 gap-3 bg-transparent relative z-40">
      
      {/* Bell Notification */}
      {/* <button className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs">
        <Bell className="w-4 h-4" />
      </button> */}

      {/* Upgrade Button */}
      {/* <button
        onClick={onOpenUpgrade}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-bold transition-all shadow-2xs"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Upgrade</span>
      </button> */}


      {/* Auth Account Button */}
      <div className="relative">
        <button
          onClick={handleButtonClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-slate-300 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {isLoggedIn
              ? user?.firstName || user?.fullName?.split(' ')[0] || userEmail?.split('@')[0] || 'Account'
              : 'Sign In'}
          </span>
        </button>

        {isLoggedIn && isMenuOpen && (
          <>
            {/* Click Outside Overlay */}
            <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl p-2 shadow-lg z-40 flex flex-col space-y-1">
              <div className="px-2.5 py-2 border-b border-slate-100 text-[10px] text-slate-400 font-medium truncate">
                {userEmail}
              </div>
              <button
                onClick={async () => {
                  setIsMenuOpen(false);
                  await signOut();
                  window.location.href = '/';
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors text-left text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          </>
        )}
      </div>

    </header>
  );
};
