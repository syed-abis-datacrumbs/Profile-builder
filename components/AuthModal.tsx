'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @clerk/nextjs v7 defaults useSignIn/useSignUp to a new signal-based
// "future" API; /legacy re-exports the classic Promise-based resource shape
// (.create(), .prepareFirstFactor(), etc.) that this file uses — same shape
// the LMS's own SignInForm.tsx is built on, just on @clerk/nextjs v5 there.
import { useSignIn, useSignUp } from '@clerk/nextjs/legacy';
import { 
  X, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = 'signIn' | 'signUp';
type Step = 'form' | 'verify' | 'forgotRequest' | 'forgotVerify';

const companyLogos = [
  {
    name: 'Google',
    icon: (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
    )
  },
  {
    name: 'Microsoft',
    icon: (
      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 23 23">
        <path fill="#f35325" d="M1 1h10v10H1z"/>
        <path fill="#81bc06" d="M12 1h10v10H1z"/>
        <path fill="#05a6f0" d="M1 12h10v10H1z"/>
        <path fill="#ffba08" d="M12 12h10v10H12z"/>
      </svg>
    )
  },
  {
    name: 'Meta',
    icon: (
      <svg className="h-3.5 w-auto text-[#0081FB] fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-1.78-.36-3.47-1.02-4.99-.78-1.79-1.95-3.23-3.41-4.22C16.64 2.02 14.88 1.5 13 1.5s-3.64.52-5.13 1.54C6.41 4.03 5.24 5.47 4.46 7.26c-.66 1.52-1.02 3.21-1.02 4.99s.36 3.47 1.02 4.99c.78 1.79 1.95 3.23 3.41 4.22C9.36 22.48 11.12 23 13 23s3.64-.52 5.13-1.54c1.46-.99 2.63-2.43 3.41-4.22.66-1.52 1.02-3.21 1.02-4.99z"/>
      </svg>
    )
  },
  {
    name: 'Amazon',
    icon: (
      <svg className="h-4 w-auto text-amber-400 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M13.92 11.08c-1.3 0-2.3.36-2.98 1.08v-3.7H9.2v9.42h1.74v-1.1c.66.8 1.68 1.28 2.98 1.28 2.34 0 4.14-1.8 4.14-4.5s-1.8-4.48-4.14-4.48zm-.3 7.34c-1.5 0-2.68-1.1-2.68-2.86s1.18-2.86 2.68-2.86c1.48 0 2.66 1.1 2.66 2.86s-1.18 2.86-2.66 2.86zm10.32 1.98C22.68 21.46 20.2 22 17.5 22c-4.2 0-7.8-1.5-10.24-3.92l.98-1.26c2.14 2.12 5.3 3.46 9.06 3.46 2.38 0 4.54-.48 5.76-1.14l.88 1.26z"/>
      </svg>
    )
  },
  {
    name: 'Apple',
    icon: (
      <svg className="h-3.5 w-auto fill-white shrink-0" viewBox="0 0 170 170">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.1-3.26-2.63-7.14-7.23-11.66-13.8-6.09-8.86-10.96-18.7-14.61-29.53-3.65-10.82-5.48-21.2-5.48-31.13 0-14.7 3.75-26.68 11.25-35.95 7.5-9.27 16.92-13.97 28.26-14.1 4.58 0 9.77 1.2 15.57 3.6 5.8 2.4 9.69 3.66 11.67 3.78 1.54 0 5.48-1.28 11.83-3.84 6.34-2.56 11.6-3.72 15.77-3.48 11.58.95 20.73 5.45 27.46 13.5-9.87 5.96-14.7 14.12-14.5 24.47.2 8.04 3.26 15.02 9.17 20.93 5.91 5.91 12.97 9.1 21.19 9.57-2.3 6.78-5.29 13.68-8.98 20.71zM119.22 31.84c0-6.42 2.3-12.44 6.89-18.06 4.59-5.62 10.45-9.15 17.58-10.58.4 2.8.31 5.68-.28 8.64-.59 2.96-1.78 5.76-3.57 8.4-1.78 2.64-4.08 4.88-6.9 6.72-2.82 1.84-5.87 3.01-9.15 3.52-.39-2.81-.58-5.69-.57-8.64z"/>
      </svg>
    )
  },
  {
    name: 'Netflix',
    icon: (
      <svg className="h-4 w-auto text-[#E50914] fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M5.398 0v24l4.577-2.561V14.61l4.627 9.39 4.6-2.568V0h-4.606v9.39L9.975 0H5.398z"/>
      </svg>
    )
  },
  {
    name: 'Spotify',
    icon: (
      <svg className="h-4 w-4 shrink-0 text-[#1DB954] fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-.1.2-.241-1.02-.361-.18-.6-.36-1.02.18-1.24 4.14-1.38 11.28-1.08 15.6 1.14.6.18.84.78.66 1.38-.18.6-.78.84-1.38 .66z"/>
      </svg>
    )
  },
  {
    name: 'Uber',
    icon: (
      <span className="text-[11px] font-black tracking-tighter text-white font-mono shrink-0">
        UBER
      </span>
    )
  }
];

/**
 * Real Clerk-backed auth (same Clerk app as the LMS — lms.datacrumbs.org),
 * so an email that already has an LMS account signs straight in here, and a
 * fresh signup here works on the LMS too. Two modes (sign in / sign up)
 * against the same identity.
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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState(0);

  // Animated score counter for ATS card
  useEffect(() => {
    if (isOpen) {
      setScore(0);
      const interval = setInterval(() => {
        setScore((prev) => {
          if (prev >= 98) {
            clearInterval(interval);
            return 98;
          }
          return prev + 2;
        });
      }, 18);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open to prevent double scrollbars
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Typewriter effect for left card
  const typewriterPhrases = [
    'AI Resume Architect',
    'GitHub README Builder',
    'LinkedIn Profile Optimizer',
    '1-on-1 Career Mentorship'
  ];
  
  const [typewriterText, setTypewriterText] = useState(typewriterPhrases[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

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
    setFullName('');
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
          setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Could not sign in. Please try again.');
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
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName
      });

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
        setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Could not create your account. Please try again.');
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
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded || !signIn) return;
    setError(null);
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      
      const firstFactor = signInAttempt.supportedFirstFactors?.find(
        (factor: any) => factor.strategy === 'reset_password_email_code'
      ) as any;

      if (firstFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'reset_password_email_code',
          emailAddressId: firstFactor.emailAddressId,
        });
        setStep('forgotVerify');
      } else {
        setError('Password reset is not supported for this account.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded || !signIn) return;
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      if (result.status === 'complete') {
        await finishWithSession(result.createdSessionId);
      } else {
        setError('Failed to complete reset. Please try again.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">

        {/* Backdrop Fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="relative w-full max-w-4xl bg-white rounded-[32px] p-3 sm:p-4 shadow-2xl overflow-hidden flex flex-col md:flex-row gap-4 sm:gap-6 border border-slate-200/80 z-10 max-h-[92vh] overflow-y-auto hide-scrollbar"
        >

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-5 right-5 z-30 text-slate-400 hover:text-slate-900 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </motion.button>

          {/* LEFT COLUMN: Dark Visual Banner */}
          <div className="hidden md:flex w-full md:w-[48%] bg-slate-950 rounded-2xl p-6 sm:p-8 text-white flex-col justify-between relative overflow-hidden min-h-[440px] border border-slate-800/80">

            {/* Background Ambient Glows & Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-600/30 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            </div>

            {/* Hero Text & Floating Interactive Glass Audit Card */}
            <div className="relative z-10 space-y-4 my-auto pt-2">

              {/* Title & Typewriter */}
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                  Your all-in-one
                </h3>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-blue-400 leading-tight flex items-center min-h-[32px]">
                  <span>{typewriterText}</span>
                  <span className="w-0.5 h-6 bg-blue-400 ml-1 animate-pulse" />
                </h3>
              </div>

              {/* FLOATING GLASS ATS PROOF CARD WITH RICH ANIMATIONS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-xl space-y-3 relative overflow-hidden"
              >
                {/* Audit Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-100">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    </motion.div>
                    <span>Live ATS Optimization Audit</span>
                  </div>

                  <motion.span
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                    className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[10px] shadow-sm shadow-emerald-500/20"
                  >
                    PASSED
                  </motion.span>
                </div>

                {/* ATS Score Progress Bar & Count-up Number */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                    <span>Optimization Score</span>
                    <motion.span
                      key={score}
                      initial={{ scale: 1.25 }}
                      animate={{ scale: 1 }}
                      className="text-emerald-400 font-bold font-mono"
                    >
                      {score} / 100
                    </motion.span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-800/90 overflow-hidden relative border border-white/5">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-teal-300 rounded-full relative overflow-hidden"
                    >
                      {/* Shimmer Sheen Light Animation */}
                      <motion.div
                        animate={{ x: ['-100%', '250%'] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Staggered Audit Highlights Checklist */}
                <div className="space-y-2 pt-1 text-[11px] text-slate-300">
                  {[
                    'High-impact action verbs & metrics optimized',
                    'Recruiter search keywords matched',
                    'Clean single-column ATS structure',
                  ].map((text, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.15, duration: 0.3 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2 cursor-default group"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 + idx * 0.15, type: 'spring', stiffness: 400 }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                      </motion.div>
                      <span className="group-hover:text-white transition-colors">{text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Company Trust Ticker with Continuous Infinite Marquee Loop */}
              <div className="pt-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Candidates hired at top companies
                </div>

                {/* Seamless Infinite Marquee Container */}
                <div className="relative w-full overflow-hidden rounded-xl">
                  {/* Left & Right Gradient Blur Fade Edges */}
                  <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

                  <motion.div
                    className="flex items-center gap-3 w-max"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
                  >
                    {/* Array duplicated twice for infinite seamless loop */}
                    {[...companyLogos, ...companyLogos].map((item, idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xs shrink-0 hover:bg-white/10 transition-colors"
                        title={item.name}
                      >
                        {item.icon}
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Auth Form */}
          <div className="w-full md:w-[52%] p-5 sm:p-7 flex flex-col justify-center space-y-4 text-slate-900 bg-white">

            {/* Logo Icon Header */}
            <div className="text-center pt-1">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mx-auto mb-2 shrink-0 border border-slate-800"
              >
                <div className="w-6 h-6 rounded-xl border-2 border-white flex items-center justify-center p-0.5">
                  <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                </div>
              </motion.div>

              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {step === 'verify'
                  ? 'Check your email'
                  : step === 'forgotRequest'
                  ? 'Reset Password'
                  : step === 'forgotVerify'
                  ? 'Set New Password'
                  : mode === 'signIn'
                  ? 'Welcome Back!'
                  : 'Create Account!'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {step === 'verify'
                  ? `Enter the 6-digit verification code sent to ${email}.`
                  : step === 'forgotRequest'
                  ? 'Enter your email to receive a password reset code.'
                  : step === 'forgotVerify'
                  ? `Enter the code sent to ${email} and your new password.`
                  : mode === 'signIn'
                  ? 'Please enter your login details.'
                  : 'Please enter your details to sign up.'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 bg-red-50 border border-red-200/80 rounded-xl px-3.5 py-2.5 text-center font-medium"
              >
                {error}
              </motion.div>
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100/90 text-slate-900 placeholder-slate-400 text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/15 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading || code.trim().length < 6}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                    code.trim().length >= 6
                      ? 'bg-slate-900 hover:bg-black text-white cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => resetToForm(mode)}
                  className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
                >
                  ← Back to form
                </button>
              </form>
            ) : step === 'forgotRequest' ? (
              <form onSubmit={handleForgotRequestSubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-900 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johnwick123@gmail.com"
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/15 border-0 text-slate-900 text-xs font-medium placeholder-slate-400 transition-all outline-none"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3.5 rounded-2xl bg-[#2a2a2e] hover:bg-black text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-white" /> : 'Send Reset Code'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => resetToForm('signIn')}
                  className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold mt-2"
                >
                  ← Back to Login
                </button>
              </form>
            ) : step === 'forgotVerify' ? (
              <form onSubmit={handleForgotVerifySubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-900 block">Verification Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/90 text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/15 transition-all text-center tracking-widest font-mono"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-900 block">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                      className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/15 border-0 text-slate-900 text-xs font-medium placeholder-slate-400 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="w-10 h-10 flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors p-1 bg-transparent border-0 outline-none hover:bg-transparent shadow-none focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading || !code.trim() || password.length < 8}
                  className="w-full py-3.5 rounded-2xl bg-[#2a2a2e] hover:bg-black text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-white" /> : 'Reset Password'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => resetToForm('signIn')}
                  className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold mt-2"
                >
                  ← Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                
                {/* Full Name Field (Sign Up mode only) */}
                {mode === 'signUp' && (
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-900 block">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Wick"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/15 border-0 text-slate-900 text-xs font-medium placeholder-slate-400 transition-all outline-none"
                    />
                  </div>
                )}

                {/* Email Field with Label Above */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-900 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johnwick123@gmail.com"
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/15 border-0 text-slate-900 text-xs font-medium placeholder-slate-400 transition-all outline-none"
                  />
                </div>

                {/* Password Field with Label Above & Eye Toggle */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-900 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      required
                      minLength={8}
                      className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/15 border-0 text-slate-900 text-xs font-medium placeholder-slate-400 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="w-10 h-10 flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors p-1 bg-transparent border-0 outline-none hover:bg-transparent shadow-none focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'signIn' && (
                    <div className="text-right pt-0.5">
                      <button
                        type="button"
                        onClick={() => setStep('forgotRequest')}
                        className="text-xs font-bold text-slate-900 hover:underline transition-all cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {/* Primary CTA Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-[#2a2a2e] hover:bg-black text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-white" />
                  ) : mode === 'signIn' ? (
                    'Login'
                  ) : (
                    'Register'
                  )}
                </motion.button>

                {/* Footer Switcher */}
                <div className="text-xs text-center text-slate-500 font-medium pt-2">
                  {mode === 'signIn' ? (
                    <span>
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => resetToForm('signUp')}
                        className="font-extrabold text-slate-900 hover:text-black hover:underline transition-colors cursor-pointer"
                      >
                        Register now
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => resetToForm('signIn')}
                        className="font-extrabold text-slate-900 hover:text-black hover:underline transition-colors cursor-pointer"
                      >
                        Sign in now
                      </button>
                    </span>
                  )}
                </div>

              </form>
            )}

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
