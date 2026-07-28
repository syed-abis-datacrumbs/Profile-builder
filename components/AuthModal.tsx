'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';

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

  // Typewriter effect for left card
  const [typewriterText, setTypewriterText] = useState('AI assistant for docs');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  const typewriterPhrases = [
    'AI assistant for docs',
    'career resume architect',
    'GitHub README builder',
    'LinkedIn profile optimizer'
  ];

  useEffect(() => {
    if (!isOpen) return;
    const currentPhrase = typewriterPhrases[textIndex];
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setTypewriterText(currentPhrase.substring(0, typewriterText.length + 1));
        if (typewriterText.length + 1 === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 2500);
        }
      } else {
        setTypewriterText(currentPhrase.substring(0, typewriterText.length - 1));
        if (typewriterText.length - 1 === 0) {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % typewriterPhrases.length);
        }
      }
    }, isDeleting ? 30 : 60);

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, textIndex, isOpen]);

  if (!isOpen) return null;

  const handleLogin = (providerEmail?: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(providerEmail || email || 'abis.hussain@datacrumbs.io');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] p-3 sm:p-4 shadow-2xl overflow-hidden flex flex-col md:flex-row gap-4 sm:gap-6 border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-30 text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Dark Visual Banner */}
        <div className="w-full md:w-[48%] bg-black rounded-2xl p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden min-h-[440px]">
          
          {/* Background Graphic Art */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img 
              src="/auth_art.png" 
              alt="3D Abstract AI Sculpture" 
              className="w-full h-full object-cover opacity-70 transform scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>

          {/* Top spacer */}
          <div className="relative z-10" />

          {/* Bottom Content overlay */}
          <div className="relative z-10 space-y-4">
            
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Your all-in-one
              </h3>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-200 leading-tight flex items-center">
                <span>{typewriterText}</span>
                <span className="w-0.5 h-7 bg-white ml-0.5 animate-pulse" />
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Chat with AI, conduct intelligent web searches, design, generate images, and create documents effortlessly.
            </p>

            {/* AI Models Chips Pill Row */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  Ø
                </span>
                <span className="w-6 h-6 rounded-full bg-blue-600 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  ✦
                </span>
                <span className="w-6 h-6 rounded-full bg-orange-600 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  A\
                </span>
                <span className="w-6 h-6 rounded-full bg-emerald-600 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  K
                </span>
                <span className="w-6 h-6 rounded-full bg-purple-600 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  Ω
                </span>
              </div>

              <span className="bg-white/10 text-white rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-md border border-white/20">
                +49 more AI Models
              </span>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Auth Form */}
        <div className="w-full md:w-[52%] p-3 sm:p-6 flex flex-col justify-center space-y-5 text-slate-900">
          
          {/* Header */}
          <div className="text-center space-y-1.5 pt-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Log in or sign up
            </h2>
            <p className="text-xs text-slate-500 leading-normal px-2">
              You will get smarter responses, can upload files, generate images and more.
            </p>
          </div>

          {/* Social OAuth Buttons */}
          <div className="space-y-2.5">
            
            {/* Google */}
            <button
              onClick={() => handleLogin('abis.google@gmail.com')}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-black text-white hover:bg-slate-800 font-semibold text-sm transition-all shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Apple */}
            <button
              onClick={() => handleLogin('abis.apple@icloud.com')}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-[#F0F0F2] text-slate-900 hover:bg-slate-200 font-semibold text-sm transition-all"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.64-.78 1.08-1.85.96-2.92-.93.04-2.07.62-2.74 1.4-.59.69-1.11 1.78-.97 2.84 1.05.08 2.11-.53 2.75-1.32z"/>
              </svg>
              <span>Continue with Apple</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleLogin('abis.fb@facebook.com')}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-[#F0F0F2] text-slate-900 hover:bg-slate-200 font-semibold text-sm transition-all"
            >
              <svg className="w-4.5 h-4.5 text-[#1877F2] fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>

          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute px-3 bg-white text-xs text-slate-400 font-medium">
              or
            </span>
          </div>

          {/* Email Input & Submit */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) handleLogin();
            }}
            className="space-y-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-5 py-3 rounded-full border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-400 transition-colors"
            />

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all shadow-xs ${
                email.trim()
                  ? 'bg-black text-white hover:bg-slate-800 cursor-pointer'
                  : 'bg-[#F0F0F2] text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Authenticating...' : 'Continue with Email'}
            </button>
          </form>

          {/* Footer Legal Privacy Disclaimer */}
          <div className="text-[11px] text-center text-slate-400 leading-normal space-y-1 pt-1">
            <div className="flex items-center justify-center gap-1 text-slate-500 font-medium">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Your data is safe, secure and fully private.</span>
            </div>
            <p>
              By continuing, you agree to our{' '}
              <a href="#" className="underline hover:text-slate-600">Terms of Use</a> and{' '}
              <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>, and to receive product updates and promotions.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
