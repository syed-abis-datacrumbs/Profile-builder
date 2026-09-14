'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useClerk } from '@clerk/nextjs';
import { 
  FlaskConical, 
  LogOut, 
  Loader2,
  Mail
} from 'lucide-react';

interface TestingPhaseModalProps {
  userEmail?: string;
}

export function TestingPhaseModal({
  userEmail,
}: TestingPhaseModalProps) {
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('[SignOut Error]:', err);
      window.location.href = '/';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="testing-phase-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 text-center shadow-2xl border border-slate-200/90 overflow-hidden"
      >
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-amber-400/20 to-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-400/15 to-rose-400/15 rounded-full blur-2xl pointer-events-none" />

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-bold tracking-wide uppercase mb-5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Private Testing Phase</span>
        </div>

        {/* Center Icon Box */}
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-900/15 border border-slate-800 relative">
          <FlaskConical className="w-8 h-8 text-amber-400" />
        </div>

        {/* Title */}
        <h2 
          id="testing-phase-title"
          className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2"
        >
          Application in Testing Phase
        </h2>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
          Momentum is currently in a private testing phase. Access is temporarily restricted to authorized administrators while we test updates and improvements.
        </p>

        {/* User Account Info Pill */}
        {userEmail && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mb-6 flex items-center justify-between text-left gap-2 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-600">Logged in as</div>
                <div className="font-bold text-slate-800 truncate text-[11px] sm:text-xs">{userEmail}</div>
              </div>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-200/60">
              Not Admin
            </span>
          </div>
        )}

        {/* Sign Out Action Button */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSigningOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>Sign Out</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
