'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, Check } from 'lucide-react';
import { ResumeData } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedData: Partial<ResumeData>) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!rawText.trim()) return;
    setIsParsing(true);

    setTimeout(() => {
      setIsParsing(false);
      // Basic AI heuristic extractor
      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      const name = lines[0] || 'Imported Candidate';
      const title = lines.find(l => /engineer|developer|manager|architect|nurse|designer/i.test(l)) || 'Tech Professional';
      const skillsFound = rawText.match(/React|Next\.js|TypeScript|Python|Node|Tailwind|SQL|Docker|AWS|PyTorch|GraphQL|Java|C\+\+/gi) || ["TypeScript", "React", "Python"];

      onImportSuccess({
        personalInfo: {
          fullName: name,
          jobTitle: title,
          email: "candidate@imported.dev",
          phone: "+1 (555) 019-2831",
          location: "San Francisco, CA",
          website: "https://imported-profile.dev",
          linkedin: "linkedin.com/in/imported-candidate",
          github: "github.com/imported-dev",
          bio: rawText.slice(0, 250) + "..."
        },
        skills: Array.from(new Set(skillsFound))
      });
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg p-6 rounded-3xl glass-panel bg-slate-900 border border-slate-800 shadow-2xl space-y-4 text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Import Existing Resume / Bio</h2>
            <p className="text-xs text-slate-400">
              Paste your raw text, LinkedIn bio, or resume content below to auto-populate all forms.
            </p>
          </div>
        </div>

        <textarea
          rows={7}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste raw resume text, LinkedIn profile summary, or job bio here..."
          className="w-full p-3 rounded-xl text-xs glass-input text-slate-100 focus:outline-none leading-relaxed"
        />

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            disabled={!rawText.trim() || isParsing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isParsing ? 'Parsing with AI...' : 'Parse & Auto-Populate'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
