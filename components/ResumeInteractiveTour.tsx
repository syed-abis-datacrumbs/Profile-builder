'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Briefcase, 
  LayoutTemplate, 
  Undo, 
  Sparkles, 
  FileText, 
  X, 
  ArrowRight, 
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface ResumeTourStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  icon: React.ElementType;
  preferredPlacement: 'top' | 'bottom' | 'left' | 'right';
}

export const RESUME_TOUR_STEPS: ResumeTourStep[] = [
  {
    id: 'prompt-input',
    targetId: 'tour-prompt-input',
    title: 'AI Prompt Input',
    description: 'Type any request here to ask AI to rewrite bullet points, add work experience or projects, and polish formatting in real time.',
    icon: MessageSquare,
    preferredPlacement: 'top',
  },
  {
    id: 'target-job',
    targetId: 'tour-target-job',
    title: 'Target Job Matcher',
    description: 'Paste your target job description here. Our AI will analyze requirements and optimize your resume for high ATS match scores.',
    icon: Target,
    preferredPlacement: 'top',
  },
  {
    id: 'mode-toggle',
    targetId: 'tour-mode-toggle',
    title: 'Professional / Student Mode',
    description: 'Switch between Professional mode (work experience priority) and Student mode (education & workshop focus) with one click.',
    icon: Briefcase,
    preferredPlacement: 'bottom',
  },
  {
    id: 'templates',
    targetId: 'tour-templates',
    title: 'Resume Templates',
    description: 'Browse and switch between recruiter-tested, ATS-compliant single-column templates without losing any of your entered data.',
    icon: LayoutTemplate,
    preferredPlacement: 'bottom',
  },
  {
    id: 'undo-redo',
    targetId: 'tour-undo-redo',
    title: 'Undo / Redo History',
    description: 'Experiment with total confidence—easily revert or restore any change or AI edit in single-click steps.',
    icon: Undo,
    preferredPlacement: 'bottom',
  },
  {
    id: 'ats-score',
    targetId: 'tour-ats-score',
    title: 'ATS Score & Audit',
    description: 'Recalculate your real-time optimization score and get tailored recommendations to pass enterprise HR filters.',
    icon: Sparkles,
    preferredPlacement: 'left',
  },
  {
    id: 'save-resume',
    targetId: 'tour-save-resume',
    title: 'Save & Manage Resumes',
    description: 'Save multiple resume versions, update active drafts, and load saved profiles whenever you need them.',
    icon: FileText,
    preferredPlacement: 'bottom',
  },
];

interface ResumeInteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

export const ResumeInteractiveTour: React.FC<ResumeInteractiveTourProps> = ({
  isOpen,
  onClose,
  initialStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState(210);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
    }
  }, [isOpen, initialStep]);

  const step = RESUME_TOUR_STEPS[currentStep] || RESUME_TOUR_STEPS[0];

  const updateTargetRect = () => {
    if (!isOpen || !step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }

    if (cardRef.current) {
      const h = cardRef.current.getBoundingClientRect().height;
      if (h > 0) setCardHeight(h);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    updateTargetRect();

    // Continuously measure target rect to handle smooth layout transitions, font loading, or DOM mounts
    const pollInterval = setInterval(updateTargetRect, 100);

    const handleResizeOrScroll = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      updateTargetRect();
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen, currentStep]);

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

  if (!isOpen) return null;

  const isLast = currentStep === RESUME_TOUR_STEPS.length - 1;

  const handleDismiss = () => {
    try {
      localStorage.setItem('profile_builder_resume_tour_seen', 'true');
    } catch {}
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#6366F1', '#10B981', '#F59E0B'],
        });
      } catch {}
      handleDismiss();
    } else {
      setCurrentStep((s) => Math.min(s + 1, RESUME_TOUR_STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => Math.max(s - 1, 0));
    }
  };

  const Icon = step.icon;

  // Compute Card position with generous offset so card NEVER overlaps highlighted button
  let cardTop = 140;
  let cardLeft = 140;
  const cardWidth = Math.min(320, windowSize.width - 32);
  const actualCardHeight = cardHeight || 210;
  let placement: 'top' | 'bottom' | 'left' | 'right' = step.preferredPlacement || 'bottom';

  if (targetRect) {
    const gap = 28; // Clear 28px gap ensuring zero overlap with button
    placement = step.preferredPlacement;

    // Check bounds & adjust placement if clipping screen
    if (placement === 'top' && targetRect.top - actualCardHeight - gap < 12) {
      placement = 'bottom';
    }
    if (placement === 'bottom' && targetRect.bottom + actualCardHeight + gap > windowSize.height - 12) {
      placement = 'top';
    }
    if (placement === 'left' && targetRect.left - cardWidth - gap < 12) {
      placement = 'top';
    }
    if (placement === 'right' && targetRect.right + cardWidth + gap > windowSize.width - 12) {
      placement = 'left';
    }

    if (placement === 'top') {
      cardTop = Math.max(12, targetRect.top - actualCardHeight - gap);
      cardLeft = Math.min(
        Math.max(16, targetRect.left + targetRect.width / 2 - cardWidth / 2),
        windowSize.width - cardWidth - 16
      );
    } else if (placement === 'bottom') {
      cardTop = Math.min(windowSize.height - actualCardHeight - 12, targetRect.bottom + gap);
      cardLeft = Math.min(
        Math.max(16, targetRect.left + targetRect.width / 2 - cardWidth / 2),
        windowSize.width - cardWidth - 16
      );
    } else if (placement === 'left') {
      cardTop = Math.min(
        Math.max(12, targetRect.top + targetRect.height / 2 - actualCardHeight / 2),
        windowSize.height - actualCardHeight - 12
      );
      cardLeft = Math.max(16, targetRect.left - cardWidth - gap);
    } else {
      // placement === 'right'
      cardTop = Math.min(
        Math.max(12, targetRect.top + targetRect.height / 2 - actualCardHeight / 2),
        windowSize.height - actualCardHeight - 12
      );
      cardLeft = Math.min(windowSize.width - cardWidth - 16, targetRect.right + gap);
    }
  } else {
    cardTop = Math.max(60, windowSize.height / 2 - 95);
    cardLeft = Math.max(16, windowSize.width / 2 - cardWidth / 2);
  }

  // Calculate full-screen SVG curved arrow coordinates
  let arrowStartX = 0;
  let arrowStartY = 0;
  let arrowEndX = 0;
  let arrowEndY = 0;
  let arrowControlX = 0;
  let arrowControlY = 0;

  if (targetRect) {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    if (placement === 'top') {
      arrowStartX = cardLeft + cardWidth / 2;
      arrowStartY = cardTop + actualCardHeight;
      arrowEndX = targetCenterX;
      arrowEndY = targetRect.top - 6;

      arrowControlX = (arrowStartX + arrowEndX) / 2 + (arrowStartX < arrowEndX ? 30 : -30);
      arrowControlY = (arrowStartY + arrowEndY) / 2;
    } else if (placement === 'bottom') {
      arrowStartX = cardLeft + cardWidth / 2;
      arrowStartY = cardTop;
      arrowEndX = targetCenterX;
      arrowEndY = targetRect.bottom + 6;

      arrowControlX = (arrowStartX + arrowEndX) / 2 + (arrowStartX < arrowEndX ? 30 : -30);
      arrowControlY = (arrowStartY + arrowEndY) / 2;
    } else if (placement === 'left') {
      arrowStartX = cardLeft + cardWidth;
      arrowStartY = cardTop + actualCardHeight / 2;
      arrowEndX = targetRect.left - 6;
      arrowEndY = targetCenterY;

      arrowControlX = (arrowStartX + arrowEndX) / 2;
      arrowControlY = (arrowStartY + arrowEndY) / 2 + (arrowStartY < arrowEndY ? 30 : -30);
    } else {
      // placement === 'right'
      arrowStartX = cardLeft;
      arrowStartY = cardTop + actualCardHeight / 2;
      arrowEndX = targetRect.right + 6;
      arrowEndY = targetCenterY;

      arrowControlX = (arrowStartX + arrowEndX) / 2;
      arrowControlY = (arrowStartY + arrowEndY) / 2 + (arrowStartY < arrowEndY ? 30 : -30);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-auto select-none">
        {/* SVG Spotlight Mask & Dark Overlay */}
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-[100]">
          <defs>
            <mask id="tour-spotlight-mask">
              {/* White rect = dark overlay everywhere */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black rect = 100% clear cutout hole over target button */}
              {targetRect && (
                <rect
                  x={targetRect.left - 6}
                  y={targetRect.top - 6}
                  width={targetRect.width + 12}
                  height={targetRect.height + 12}
                  rx="10"
                  ry="10"
                  fill="black"
                />
              )}
            </mask>
          </defs>

          {/* Dark backdrop overlay with spotlight cutout mask */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="#0f172a"
            fillOpacity="0.55"
            mask="url(#tour-spotlight-mask)"
            style={{ pointerEvents: 'auto' }}
            onClick={handleDismiss}
          />
        </svg>

        {/* Full Screen SVG Curved Arrow Layer */}
        {targetRect && (
          <svg className="fixed inset-0 w-full h-full pointer-events-none z-[102]">
            <defs>
              <marker
                id="tour-arrowhead"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366F1" />
              </marker>
            </defs>
            <path
              d={`M ${arrowStartX} ${arrowStartY} Q ${arrowControlX} ${arrowControlY} ${arrowEndX} ${arrowEndY}`}
              fill="none"
              stroke="#6366F1"
              strokeWidth="3"
              strokeDasharray="6,4"
              markerEnd="url(#tour-arrowhead)"
            />
          </svg>
        )}

        {/* Target Element Spotlight Focus Ring (around the clear cutout) */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
            className="rounded-xl border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.85)] pointer-events-none z-[101] ring-4 ring-indigo-500/40 animate-pulse"
          />
        )}

        {/* Floating Tooltip Popover Card */}
        <motion.div
          key={step.id}
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          style={{
            position: 'fixed',
            top: cardTop,
            left: cardLeft,
            width: cardWidth,
          }}
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200/90 z-[103] space-y-3 relative text-slate-900"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] font-extrabold">
              <Icon className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentStep + 1} of {RESUME_TOUR_STEPS.length}</span>
            </span>

            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
              {step.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Action Navigation Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDismiss}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Skip
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="h-8 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isLast ? 'Got it!' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
