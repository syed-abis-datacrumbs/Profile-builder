'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  FileText, 
  Undo, 
  Redo, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Bot, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface TourSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  graphic: 'chat-ai' | 'live-canvas';
  bullets: {
    icon: React.ElementType;
    title: string;
    desc: string;
  }[];
}

export const TOUR_SLIDES: TourSlide[] = [
  {
    id: 'talk-to-profile',
    badge: 'Step 1 of 2 · Conversational AI Studio',
    title: 'Talk to Your Profile',
    description: 'Chat naturally with Luna AI to craft, rewrite, and surgically refine your resume and portfolio in real-time.',
    graphic: 'chat-ai',
    bullets: [
      {
        icon: Bot,
        title: 'Surgical Bullet Editing',
        desc: 'Request specific improvements to work experience or projects without rewriting your whole CV.',
      },
      {
        icon: Zap,
        title: 'Quantified Impact Metrics',
        desc: 'Automatically generates industry-tailored numbers, percentages, and metrics that impress hiring managers.',
      },
      {
        icon: Sliders,
        title: 'Instant Role Tailoring',
        desc: 'Paste any job description to match target keywords and optimize for high ATS match scores.',
      },
    ],
  },
  {
    id: 'live-ats-canvas',
    badge: 'Step 2 of 2 · Live ATS Canvas & Export',
    title: 'Real-Time Live Canvas',
    description: 'Watch your ATS-compliant resume update dynamically with full history controls and single-click exports.',
    graphic: 'live-canvas',
    bullets: [
      {
        icon: ShieldCheck,
        title: 'ATS-Tested Formatting',
        desc: 'Clean, parseable typography and layout engineered to sail through enterprise ATS filters.',
      },
      {
        icon: Undo,
        title: 'Full Undo & Redo History',
        desc: 'Experiment with confidence—easily revert or advance through any revision in one click.',
      },
      {
        icon: Download,
        title: '1-Click Multi-Format Export',
        desc: 'Download crisp, high-resolution PDF or PNG files ready to send directly to recruiters.',
      },
    ],
  },
];

interface WelcomeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

export const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({
  isOpen,
  onClose,
  initialStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);

  // Sync step if reopened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
    }
  }, [isOpen, initialStep]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const currentSlide = TOUR_SLIDES[currentStep] || TOUR_SLIDES[0];
  const isLast = currentStep === TOUR_SLIDES.length - 1;

  const handleDismiss = () => {
    try {
      localStorage.setItem('profile_builder_tour_seen', 'true');
    } catch {}
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      // Fire celebratory confetti on finish
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#4F46E5', '#06B6D4', '#10B981', '#3B82F6'],
        });
      } catch {}
      handleDismiss();
    } else {
      setDirection(1);
      setCurrentStep((s) => Math.min(s + 1, TOUR_SLIDES.length - 1));
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => Math.max(s - 1, 0));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 my-auto"
        >
          {/* Top Banner Bar */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] font-bold tracking-wide">
              <Sparkles className="w-3 h-3 text-indigo-600 animate-pulse" />
              <span>{currentSlide.badge}</span>
            </span>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Slide Carousel Area */}
          <div className="px-6 sm:px-8 py-2 overflow-hidden min-h-[360px] flex flex-col justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.24, ease: 'easeInOut' }}
                className="space-y-6"
              >
                {/* Title & Subtitle */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {currentSlide.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    {currentSlide.description}
                  </p>
                </div>

                {/* Interactive Visual Graphic */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-white shadow-inner border border-slate-800 relative overflow-hidden">
                  {/* Subtle Background Glow */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

                  {currentSlide.graphic === 'chat-ai' ? (
                    /* Slide 1 Graphic: Conversational AI Mockup */
                    <div className="space-y-3 relative z-10 text-xs">
                      {/* User message */}
                      <div className="flex items-start justify-end gap-2">
                        <div className="bg-indigo-600/90 text-white px-3 py-1.5 rounded-2xl rounded-tr-xs shadow-xs max-w-[85%]">
                          <p className="font-medium text-[11px]">
                            Add my RAG knowledge assistant project with Python & FastAPI
                          </p>
                        </div>
                      </div>

                      {/* AI Response Card */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl rounded-tl-xs p-3 space-y-1.5 flex-1 shadow-xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold border-b border-slate-700/60 pb-1">
                            <span className="text-indigo-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-400" /> Luna AI · Project Updated
                            </span>
                            <span className="text-emerald-400 font-mono text-[9px]">+Applied to CV</span>
                          </div>
                          <p className="text-[11px] text-slate-200 leading-snug">
                            <strong>Enterprise RAG Assistant</strong> (Python, FastAPI, FAISS) – Built document search pipeline indexing 10,000+ records, cutting research latency by 55%.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Slide 2 Graphic: Live ATS Canvas & Export Mockup */
                    <div className="space-y-3 relative z-10 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          <span className="ml-2 text-[10px] text-slate-400 font-mono font-medium">ATS Resume Preview · Live</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold border border-slate-700">
                            Undo (Ctrl+Z)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-600 text-[10px] text-white font-bold flex items-center gap-1">
                            <Download className="w-3 h-3" /> PDF Export
                          </span>
                        </div>
                      </div>

                      {/* Mini Resume Canvas Sheet */}
                      <div className="bg-white text-slate-900 rounded-xl p-3 shadow-md border border-slate-200 space-y-1.5 font-sans">
                        <div className="flex items-baseline justify-between border-b border-slate-200 pb-1">
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">Zoya Siddiqui</div>
                            <div className="text-[9px] text-slate-600">Full-Stack AI Engineer · San Francisco, CA</div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ATS Score: 98/100
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-700 leading-tight">
                          <span className="font-semibold text-slate-900">Experience:</span> Automated data workflows and deployed fine-tuned LLMs achieving a 45% latency reduction across production services.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3 Quick Benefit Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {currentSlide.bullets.map((b, idx) => {
                    const Icon = b.icon;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5"
                      >
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-bold text-slate-900 truncate">
                            {b.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                            {b.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls Bar */}
          <div className="px-6 sm:px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
            {/* Slide Indicators */}
            <div className="flex items-center gap-1.5">
              {TOUR_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setDirection(index > currentStep ? 1 : -1);
                    setCurrentStep(index);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    index === currentStep
                      ? 'w-6 bg-indigo-600'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Skip Tour
              </button>

              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="h-9 px-4 sm:px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isLast ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
