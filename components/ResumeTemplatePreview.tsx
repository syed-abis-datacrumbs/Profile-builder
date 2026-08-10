'use client';

import React from 'react';
import { ArrowLeft, PenSquare, Sparkles } from 'lucide-react';
import { LmsResumeSample } from '../lib/resumeSamples';
import { cvMarkdownToHtml, CvData } from '../lib/cvTypes';
import { CvPreview } from './CvPreview';

interface ResumeTemplatePreviewProps {
  sample: LmsResumeSample;
  accentColor?: string;
  onBack: () => void;
  onEdit: () => void;
}

export const ResumeTemplatePreview: React.FC<ResumeTemplatePreviewProps> = ({
  sample,
  onBack,
  onEdit
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-12 font-sans">
      
      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-3.5 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to templates</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Preset: <strong className="text-slate-800">{sample.label}</strong></span>
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-mono">
              98% ATS Match
            </span>
          </div>

          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full px-5 py-2 transition-all shadow-sm cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Use Template</span>
          </button>
        </div>
      </div>

      {/* ── ATS badge, shown above the real resume preview ── */}
      <div className="flex items-center justify-end gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-medium text-slate-700">ATS Score Ready</span>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">98/100</span>
      </div>

      {/* ── Actual CV preview — same rendering as the real Chat Studio, so
          this popup never looks different from what you actually get. ── */}
      <div className="w-full bg-white shadow-2xl rounded-sm overflow-hidden">
        <CvPreview data={cvMarkdownToHtml(sample.data as CvData)} />
      </div>

      {/* Bottom CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Load this structured ATS resume into the AI Studio to customize with your own experience.
        </div>
        <button
          onClick={onEdit}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-2.5 transition-all shadow-md cursor-pointer"
        >
          <PenSquare className="w-4 h-4" />
          <span>Use This Template & Open Editor</span>
        </button>
      </div>

    </div>
  );
};
