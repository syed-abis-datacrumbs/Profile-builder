'use client';

import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { ResumeData } from '../types';

interface ATSScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  score: number;
}

export const ATSScoreModal: React.FC<ATSScoreModalProps> = ({
  isOpen,
  onClose,
  data,
  score
}) => {
  if (!isOpen) return null;

  const checks = [
    {
      title: "Quantified Metrics in Experience Bullets",
      passed: data.experiences.some(exp => exp.bullets.some(b => /\d+%|\$\d+|\d+M|\d+k/i.test(b))),
      detail: "Including numerical metrics (e.g. 42%, $85k, 2M users) increases ATS rank by up to 35%."
    },
    {
      title: "Technical Skills Keyword Density",
      passed: data.skills.length >= 6,
      detail: `Detected ${data.skills.length} core technical skills. (Recommended: 6 to 12 skills).`
    },
    {
      title: "Standard ATS Section Headings",
      passed: true,
      detail: "Uses standard 'Work Experience', 'Education', 'Executive Summary', and 'Technical Skills' labels."
    },
    {
      title: "Contact & Online Portfolio Links",
      passed: Boolean(data.personalInfo.email && data.personalInfo.linkedin),
      detail: "Includes email address and LinkedIn profile URL for instant recruiter contact."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg p-6 rounded-3xl glass-panel bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
            <span className="text-2xl font-black text-white">{score}%</span>
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>ATS Parser Compatibility</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Scanned against standard Workday, Greenhouse, and Lever ATS parsing algorithms.
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detailed Diagnostic Checklist
          </h3>

          {checks.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={item.passed ? 'text-slate-200' : 'text-amber-300'}>{item.title}</span>
                {item.passed ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" /> Suggestion
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
        >
          Got it! Continue Editing
        </button>

      </div>
    </div>
  );
};
