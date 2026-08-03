'use client';

import React, { useState, useEffect } from 'react';
// @clerk/nextjs v7 defaults useSignIn/useSignUp to a new signal-based
// "future" API; /legacy re-exports the classic Promise-based resource shape
// (.create(), .prepareFirstFactor(), etc.) that this file uses — same shape
// the LMS's own SignInForm.tsx is built on, just on @clerk/nextjs v5 there.
import { useSignIn, useSignUp } from '@clerk/nextjs/legacy';
import { X, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = 'signIn' | 'signUp';
type Step = 'form' | 'verify';

/**
 * Real Clerk-backed auth (same Clerk app as the LMS — lms.datacrumbs.org),
 * so an email that already has an LMS account signs straight in here, and a
 * fresh signup here works on the LMS too. Two modes (sign in / sign up)
 * against the same identity, matching how the LMS's own SignInForm talks to
 * Clerk (email+password, with an email-code verification/2FA step) rather
 * than Clerk's default hosted UI, so this keeps the existing visual design.
 */
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();

  const [mode, setMode] = useState<Mode>('signIn');
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const resetToForm = (nextMode: Mode) => {
    setMode(nextMode);
    setStep('form');
    setCode('');
    setError(null);
  };

  const finishWithSession = async (sessionId: string | null | undefined) => {
    if (!sessionId || !setActive) return;
    await setActive({ session: sessionId });
    onSuccess();
    onClose();
  };

  const handleOAuth = (strategy: 'oauth_google' | 'oauth_facebook') => {
    if (!signInLoaded || !signIn) return;
    setLoading(true);
    // Clerk resolves new-vs-existing accounts itself during the OAuth
    // callback — same call works whether this email already exists or not.
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signIn') {
      if (!signInLoaded || !signIn) return;
      setLoading(true);
      try {
        const result = await signIn.create({ identifier: email, password });

        if (result.status === 'complete') {
          await finishWithSession(result.createdSessionId);
        } else if (result.status === 'needs_second_factor') {
          setStep('verify');
        } else if (result.status === 'needs_first_factor') {
          const firstFactor = result.supportedFirstFactors?.find(
            (f: any) => f.strategy === 'email_code'
          );
          if (firstFactor) {
            await signIn.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId: (firstFactor as any).emailAddressId,
            });
            setStep('verify');
          } else {
            setError('Additional verification is required for this account.');
          }
        }
      } catch (err: any) {
        const errCode = err?.errors?.[0]?.code;
        if (errCode === 'form_identifier_not_found') {
          setError('No account with that email yet — switch to Sign up below.');
        } else {
          setError(err?.errors?.[0]?.message || 'Could not sign in. Please try again.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // mode === 'signUp'
    if (!signUpLoaded || !signUp) return;
    setLoading(true);
    try {
      const result = await signUp.create({ emailAddress: email, password });

      if (result.status === 'complete') {
        await finishWithSession(result.createdSessionId);
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setStep('verify');
      }
    } catch (err: any) {
      const errCode = err?.errors?.[0]?.code;
      if (errCode === 'form_identifier_exists') {
        setMode('signIn');
        setError('You already have an account with that email — sign in instead.');
      } else {
        setError(err?.errors?.[0]?.message || 'Could not create your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signUp') {
        if (!signUp) return;
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === 'complete') {
          await finishWithSession(result.createdSessionId);
        } else {
          setError('Invalid code. Please try again.');
        }
      } else {
        if (!signIn) return;
        let result;
        try {
          result = await signIn.attemptFirstFactor({ strategy: 'email_code', code });
        } catch {
          result = await signIn.attemptSecondFactor({ strategy: 'totp', code });
        }
        if (result.status === 'complete') {
          await finishWithSession(result.createdSessionId);
        } else {
          setError('Invalid code. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
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
              {step === 'verify' ? 'Check your email' : mode === 'signIn' ? 'Log in' : 'Create your account'}
            </h2>
            <p className="text-xs text-slate-500 leading-normal px-2">
              {step === 'verify'
                ? `Enter the 6-digit code we sent to ${email}.`
                : 'Same account as your DataCrumbs LMS login — sign in or sign up below.'}
            </p>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-center">
              {error}
            </div>
          )}

          {step === 'verify' ? (
            <form onSubmit={handleVerifySubmit} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                autoFocus
                className="w-full px-5 py-3 rounded-full border border-slate-200 text-slate-900 placeholder-slate-400 text-sm text-center tracking-[0.3em] focus:outline-none focus:border-slate-400 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || code.trim().length < 6}
                className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all shadow-xs ${
                  code.trim().length >= 6
                    ? 'bg-black text-white hover:bg-slate-800 cursor-pointer'
                    : 'bg-[#F0F0F2] text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Verifying...' : 'Verify & continue'}
              </button>
              <button
                type="button"
                onClick={() => resetToForm(mode)}
                className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Back
              </button>
            </form>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex items-center justify-center gap-1 bg-slate-100 rounded-full p-1 max-w-[240px] mx-auto w-full">
                <button
                  type="button"
                  onClick={() => resetToForm('signIn')}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-colors ${
                    mode === 'signIn' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => resetToForm('signUp')}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-colors ${
                    mode === 'signUp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Sign up
                </button>
              </div>

              {/* Social OAuth Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => handleOAuth('oauth_google')}
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

                <button
                  onClick={() => handleOAuth('oauth_facebook')}
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

              {/* Email + Password */}
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-5 py-3 rounded-full border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-400 transition-colors"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={8}
                  className="w-full px-5 py-3 rounded-full border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-400 transition-colors"
                />

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password.trim()}
                  className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all shadow-xs ${
                    email.trim() && password.trim()
                      ? 'bg-black text-white hover:bg-slate-800 cursor-pointer'
                      : 'bg-[#F0F0F2] text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Please wait...' : mode === 'signIn' ? 'Sign in' : 'Create account'}
                </button>
              </form>
            </>
          )}

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
