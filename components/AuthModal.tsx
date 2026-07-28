'use client';

import React, { useState } from 'react';
import { X, Sparkles, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (providerEmail?: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(providerEmail || email || 'alex.rivera@techcraft.io');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 mb-1">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Sign in to ProfileArchitect
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            You will get smarter AI responses, can save multiple profile drafts, export high-res PDFs, and access custom GitHub README themes.
          </p>
        </div>

        {/* Social Auth Buttons (Inspired by Imagine.art) */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleLogin('user.google@gmail.com')}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => handleLogin('user.apple@icloud.com')}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700 hover:bg-slate-700 transition-all"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.64-.78 1.08-1.85.96-2.92-.93.04-2.07.62-2.74 1.4-.59.69-1.11 1.78-.97 2.84 1.05.08 2.11-.53 2.75-1.32z"/>
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="absolute px-3 bg-slate-900 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            or continue with email
          </span>
        </div>

        {/* Email Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            className="w-full px-4 py-2.5 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Continue with Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Your data is encrypted, secure, and fully private.</span>
        </div>

      </div>
    </div>
  );
};
