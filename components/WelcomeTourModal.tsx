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
  Sliders,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  FileCode,
  Rocket
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface TourSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  graphic: 'welcome' | 'chat-ai' | 'mode-toggle' | 'live-canvas' | 'github-studio';
  bullets: {
    icon: React.ElementType;
    title: string;
    desc: string;
  }[];
}

export const TOUR_SLIDES: TourSlide[] = [
  {
    id: 'welcome-to-momentum',
    badge: 'Step 1 of 5 · Welcome to MOMENTUM',
    title: 'Welcome to MOMENTUM',
    description: 'Your AI-powered career co-pilot for building ATS-compliant resumes, recruiter-optimized LinkedIn profiles, and GitHub portfolios.',
    graphic: 'welcome',
    bullets: [
      {
        icon: Rocket,
        title: 'All-in-One Suite',
        desc: 'Build resumes, LinkedIn bios, and portfolios in one place.',
      },
      {
        icon: Zap,
        title: 'Real-Time AI',
        desc: 'Refine work experience, metrics, and key job roles live.',
      },
      {
        icon: ShieldCheck,
        title: 'ATS & Fast Export',
        desc: 'HR-tested layouts with instant PDF & PNG downloads.',
      },
    ],
  },
  {
    id: 'talk-to-profile',
    badge: 'Step 2 of 5 · Conversational AI Studio',
    title: 'Talk to Your Profile',
    description: 'Chat naturally with AI to craft, rewrite, and surgically refine your resume and portfolio in real-time.',
    graphic: 'chat-ai',
    bullets: [
      {
        icon: Bot,
        title: 'Bullet Editing',
        desc: 'Polish specific points without altering your full CV.',
      },
      {
        icon: Zap,
        title: 'Impact Metrics',
        desc: 'Auto-generate numbers that impress hiring managers.',
      },
      {
        icon: Sliders,
        title: 'Role Tailoring',
        desc: 'Match job descriptions for higher ATS match scores.',
      },
    ],
  },
  {
    id: 'professional-vs-student',
    badge: 'Step 3 of 5 · Smart Resume Layout Modes',
    title: 'Professional vs. Student Toggle',
    description: 'Switch seamlessly between Professional mode (work experience priority) and Student mode (education & workshop focus).',
    graphic: 'mode-toggle',
    bullets: [
      {
        icon: Briefcase,
        title: 'Professional Mode',
        desc: 'Prioritizes work experience, leadership & key metrics.',
      },
      {
        icon: GraduationCap,
        title: 'Student Mode',
        desc: 'Highlights education first & hands-on tech workshops.',
      },
      {
        icon: Layers,
        title: '1-Click Reorder',
        desc: 'Switch canvas layouts instantly with zero data loss.',
      },
    ],
  },
  {
    id: 'live-ats-canvas',
    badge: 'Step 4 of 5 · Live ATS Canvas & Export',
    title: 'Real-Time Live Canvas',
    description: 'Watch your ATS-compliant resume update dynamically with full history controls and single-click exports.',
    graphic: 'live-canvas',
    bullets: [
      {
        icon: ShieldCheck,
        title: 'ATS Formatting',
        desc: 'Clean typography designed for recruiter ATS filters.',
      },
      {
        icon: Undo,
        title: 'Undo & Redo',
        desc: 'Revert or advance edits with total confidence.',
      },
      {
        icon: Download,
        title: 'Multi-Format Export',
        desc: 'Download crisp PDF & PNG files ready for applications.',
      },
    ],
  },
  {
    id: 'github-readme-studio',
    badge: 'Step 5 of 5 · GitHub Developer Portfolio',
    title: 'GitHub README Studio',
    description: 'Build high-converting developer profiles with dynamic tech stack badges, live activity stats, and avatar cropping.',
    graphic: 'github-studio',
    bullets: [
      {
        icon: Code2,
        title: 'Tech Stack Badges',
        desc: 'SVG badges for React, Python, Docker, and 40+ skills.',
      },
      {
        icon: Sparkles,
        title: 'Live GitHub Stats',
        desc: 'Display commit streaks, stats & repo stars live.',
      },
      {
        icon: FileCode,
        title: 'Markdown Export',
        desc: 'Download .md files or copy Markdown for your repo.',
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
      fetch('/api/user/tour-status', { method: 'POST' }).catch(() => {});
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
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
                  <div className={`rounded-2xl p-4 relative overflow-hidden transition-all duration-300 ${
                    currentSlide.graphic === 'github-studio'
                      ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white shadow-inner border border-slate-800'
                      : 'bg-gradient-to-br from-indigo-50/60 via-slate-50 to-blue-50/60 shadow-sm border border-slate-200/90'
                  }`}>
                    {/* Subtle Background Glow */}
                    {currentSlide.graphic === 'github-studio' ? (
                      <>
                        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
                      </>
                    ) : (
                      <>
                        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-200/40 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-200/35 rounded-full blur-2xl pointer-events-none" />
                      </>
                    )}

                    {currentSlide.graphic === 'welcome' && (
                      /* Slide 1 Graphic: Welcome Hero Banner */
                      <div className="space-y-3 relative z-10 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.png" alt="MOMENTUM Logo" className="w-5 h-5 object-contain" />
                            <span className="font-black text-slate-900 tracking-tight text-xs uppercase">MOMENTUM Suite</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200/80 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600 animate-pulse" /> AI Powered
                          </span>
                        </div>

                        {/* 3 Studio Cards Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-0.5">
                          {/* Resume Card */}
                          <div className="bg-white border border-indigo-200/90 rounded-xl p-2.5 space-y-1 shadow-2xs text-center">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-100">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="font-bold text-[10px] text-slate-900">Resume Studio</div>
                            <div className="text-[9px] text-slate-500 leading-tight">ATS Score & Templates</div>
                          </div>

                          {/* LinkedIn Card */}
                          <div className="bg-white border border-sky-200/90 rounded-xl p-2.5 space-y-1 shadow-2xs text-center">
                            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 mx-auto flex items-center justify-center border border-sky-100">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div className="font-bold text-[10px] text-slate-900">LinkedIn Studio</div>
                            <div className="text-[9px] text-slate-500 leading-tight">Headlines & Cover Letters</div>
                          </div>

                          {/* GitHub Card */}
                          <div className="bg-white border border-purple-200/90 rounded-xl p-2.5 space-y-1 shadow-2xs text-center">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 mx-auto flex items-center justify-center border border-purple-100">
                              <Code2 className="w-3.5 h-3.5" />
                            </div>
                            <div className="font-bold text-[10px] text-slate-900">GitHub README</div>
                            <div className="text-[9px] text-slate-500 leading-tight">Badges & Live Stats</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSlide.graphic === 'chat-ai' && (
                      /* Slide 1 Graphic: Conversational AI Mockup */
                      <div className="space-y-3 relative z-10 text-xs">
                        {/* User message */}
                        <div className="flex items-start justify-end gap-2">
                          <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-2xl rounded-tr-xs shadow-xs max-w-[85%]">
                            <p className="font-medium text-[11px]">
                              Add my RAG knowledge assistant project with Python & FastAPI
                            </p>
                          </div>
                        </div>

                        {/* AI Response Card */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-3 space-y-1.5 flex-1 shadow-xs">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold border-b border-slate-100 pb-1">
                              <span className="text-indigo-700 flex items-center gap-1 font-bold">
                                <Sparkles className="w-3 h-3 text-indigo-600" /> AI Assistant · Project Updated
                              </span>
                              <span className="text-emerald-700 font-mono text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">+Applied to CV</span>
                            </div>
                            <p className="text-[11px] text-slate-700 leading-snug">
                              <strong className="text-slate-900 font-bold">Enterprise RAG Assistant</strong> (Python, FastAPI, FAISS) – Built document search pipeline indexing 10,000+ records, cutting research latency by 55%.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSlide.graphic === 'mode-toggle' && (
                      /* Slide 2 Graphic: Professional vs Student Mode Toggle Mockup */
                      <div className="space-y-3 relative z-10 text-xs">
                        {/* Toggle Bar */}
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Layout Switcher
                          </span>
                          <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80 border border-slate-300/70">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-indigo-700 shadow-2xs flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-indigo-600" /> Professional
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-slate-500" /> Student
                            </span>
                          </div>
                        </div>

                        {/* Mode comparison cards */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-white border border-indigo-200/90 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[10px]">
                              <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Professional Mode
                            </div>
                            <div className="space-y-1 text-[9px] text-slate-600 leading-tight">
                              <div className="bg-indigo-50/80 p-1 rounded font-semibold text-indigo-900 border border-indigo-100">
                                1. Work Experience (Top Priority)
                              </div>
                              <div className="p-1 text-slate-500">2. Key Skills & Impact</div>
                              <div className="p-1 text-slate-500">3. Education & Degrees</div>
                            </div>
                          </div>

                          <div className="bg-white border border-emerald-200/90 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px]">
                              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Student Mode
                            </div>
                            <div className="space-y-1 text-[9px] text-slate-600 leading-tight">
                              <div className="bg-emerald-50/80 p-1 rounded font-semibold text-emerald-900 border border-emerald-100">
                                1. Education & Academics (Top)
                              </div>
                              <div className="bg-emerald-50/40 p-1 rounded text-emerald-800 font-medium border border-emerald-100/60">
                                2. Technical Workshops & Training
                              </div>
                              <div className="p-1 text-slate-500">3. Academic Projects</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSlide.graphic === 'live-canvas' && (
                      /* Slide 3 Graphic: Live ATS Canvas & Export Mockup */
                      <div className="space-y-3 relative z-10 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span className="ml-2 text-[10px] text-slate-600 font-mono font-medium">ATS Resume Preview · Live</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5 bg-white shadow-2xs">
                              <div
                                title="Undo (Ctrl+Z)"
                                className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <Undo className="w-3 h-3" />
                              </div>
                              <div
                                title="Redo (Ctrl+Y)"
                                className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <Redo className="w-3 h-3" />
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-[10px] text-white font-bold flex items-center gap-1 shadow-2xs">
                              <Download className="w-3 h-3" /> PDF Export
                            </span>
                          </div>
                        </div>

                        {/* Mini Resume Canvas Sheet */}
                        <div className="bg-white text-slate-900 rounded-xl p-3 shadow-sm border border-slate-200/90 space-y-1.5 font-sans">
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

                    {currentSlide.graphic === 'github-studio' && (
                      /* Slide 4 Graphic: GitHub README Studio Mockup (Dark Theme matching GitHub Chat) */
                      <div className="space-y-3 relative z-10 text-xs text-white">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-1.5 text-slate-100 font-bold">
                            <FolderGit2 className="w-4 h-4 text-indigo-400" />
                            <span>GitHub Profile README</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white font-bold flex items-center gap-1 shadow-xs transition-colors">
                            <FileCode className="w-3 h-3" /> Download .md
                          </span>
                        </div>

                        {/* README Header Card (Dark Theme) */}
                        <div className="bg-slate-900/90 rounded-xl p-3 shadow-md border border-slate-800 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-indigo-400/30">
                              ZS
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-100">Hi 👋, I'm Zoya Siddiqui</div>
                              <div className="text-[9px] text-slate-400">Senior AI Engineer & Open Source Contributor</div>
                            </div>
                          </div>

                          {/* Tech Stack Badges */}
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[9px] font-medium flex items-center gap-1">
                              <Code2 className="w-2.5 h-2.5 text-cyan-400" /> React
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/80 font-mono text-[9px] font-medium">
                              Python
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono text-[9px] font-medium">
                              FastAPI
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/80 font-mono text-[9px] font-medium">
                              PyTorch
                            </span>
                          </div>

                          {/* Live GitHub Stats Card */}
                          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2 flex items-center justify-between text-[9px] text-slate-300 font-mono shadow-inner">
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>Stars: <strong className="text-white font-bold">142</strong></span>
                            </div>
                            <div>Commits: <strong className="text-emerald-400 font-bold">840+</strong></div>
                            <div className="text-indigo-400 font-bold">Grade: A+</div>
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
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 h-full"
                        >
                          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[11px] font-bold text-slate-900 leading-snug">
                              {b.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
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
                  className="h-9 px-4 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
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
