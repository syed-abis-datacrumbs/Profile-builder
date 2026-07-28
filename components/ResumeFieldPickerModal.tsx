'use client';

import React from 'react';
import { X, FileText, ArrowRight } from 'lucide-react';
import { LMS_RESUME_SAMPLES, LmsResumeSample } from '../lib/resumeSamples';

interface ResumeFieldPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sample: LmsResumeSample) => void;
}

/**
 * Asks the student which field they're in, then loads that field's ready-made
 * resume (the SAME 30 field templates the LMS CV builder ships).
 */
export const ResumeFieldPickerModal: React.FC<ResumeFieldPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Choose your field</h2>
            <p className="text-xs text-slate-500">
              We&apos;ll load a ready-made resume for that field — the same content as the LMS.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {LMS_RESUME_SAMPLES.map((sample) => (
              <button
                key={sample.label}
                onClick={() => onSelect(sample)}
                className="text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-slate-800 group-hover:text-blue-700 leading-tight">
                    {sample.label}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
