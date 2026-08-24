'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, SquarePen } from 'lucide-react';
import { motion } from 'framer-motion';
import { LmsResumeSample } from '../lib/resumeSamples';
import { getResumeAccentColor } from '../lib/resumeHelpers';
import { CvData, cvMarkdownToHtml } from '../lib/cvTypes';
import { CvPreview } from './CvPreview';

const DESIGN_WIDTH = 794;

interface ResumeTemplatePreviewProps {
  sample: LmsResumeSample;
  clerkFullName?: string;
  onUse: () => void;
  onClose: () => void;
}

// Full preview of the actual resume UI (real CvPreview, not a scaled-down
// peek or a hand-built mockup) before committing to it. Scaled to always
// fill the panel's full width — a short resume just leaves blank space
// below, a long one scrolls vertically inside the panel.
//
// Combining transform:scale with a scrollable container needs care: scale
// only changes how content PAINTS, not its layout box, so the scaled div's
// own box stays at its full unscaled height. Left alone, the scroll
// container would size its scrollbar off that unscaled height instead of
// the visually-shrunk one. The spacer div below is explicitly sized to
// naturalHeight * scale — the real visual height — so the scroll area
// always matches what's actually on screen.
export const ResumeTemplatePreview: React.FC<ResumeTemplatePreviewProps> = ({ sample, clerkFullName, onUse, onClose }) => {
  const cv = cvMarkdownToHtml(sample.data as CvData);
  if (clerkFullName && cv.personalInfo) {
    cv.personalInfo.fullName = clerkFullName;
  }
  const accent = getResumeAccentColor(sample);

  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);

  const measure = useCallback(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;
    setScale(panel.clientWidth / DESIGN_WIDTH);
    setNaturalHeight(content.scrollHeight);
  }, []);

  useLayoutEffect(() => {
    measure();
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;
    const ro = new ResizeObserver(measure);
    ro.observe(panel);
    ro.observe(content);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center p-4 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl flex flex-col min-h-0 h-full max-h-[92vh]"
      >
        {/* Top toolbar */}
        <div className="shrink-0 bg-white rounded-2xl shadow-xl px-4 sm:px-5 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to templates</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-sm text-slate-500 hidden sm:inline">
              Preset: <span className="font-bold text-slate-900">{sample.label}</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 whitespace-nowrap">
              98% ATS Match
            </span>
            <button
              onClick={onUse}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              <SquarePen className="w-3.5 h-3.5" />
              <span>Use Template</span>
            </button>
          </div>
        </div>

        {/* Resume panel — always fills the full width; scrolls vertically
            only if the resume is taller than the panel at that width. */}
        <div
          ref={panelRef}
          className="flex-1 min-h-0 bg-white rounded-t-2xl shadow-2xl overflow-y-auto hide-scrollbar"
          style={{ borderTop: `4px solid ${accent}` }}
        >
          <div style={{ height: naturalHeight * scale, visibility: scale ? 'visible' : 'hidden' }}>
            <div style={{ width: DESIGN_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <div ref={contentRef}>
                <CvPreview data={cv} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
