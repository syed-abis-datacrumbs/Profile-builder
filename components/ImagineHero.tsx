'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown,
  FileText, 
  Bot, 
  Globe, 
  Sliders, 
  Send,
  Layers,
  Award
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';
import { ActiveTab } from '../types';

interface ImagineHeroProps {
  userName?: string;
  onSelectTab: (tab: ActiveTab) => void;
  onSubmitPrompt: (text: string) => void;
}

const PLACEHOLDERS = [
  "Describe your target role or paste job details for ATS optimization...",
  "Build a full Senior Architect resume with quantified metric bullets...",
  "Craft a sleek GitHub README bio with dynamic badges & stats...",
  "Write a high-impact LinkedIn headline & executive summary...",
  "Ask ProfileArchitect AI to generate bullet points tailored for top tech roles..."
];

export const ImagineHero: React.FC<ImagineHeroProps> = ({
  userName = "Abis",
  onSelectTab,
  onSubmitPrompt,
}) => {
  const [promptText, setPromptText] = useState('');
  
  // Animated Placeholder Typing State
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetText = PLACEHOLDERS[placeholderIndex];
    const typingSpeed = isDeleting ? 30 : 50;

    const timer = setTimeout(() => {
      if (!isDeleting && currentText.length < targetText.length) {
        // Typing letters forward
        setCurrentText(targetText.slice(0, currentText.length + 1));
      } else if (!isDeleting && currentText.length === targetText.length) {
        // Pause when full sentence is typed
        setTimeout(() => setIsDeleting(true), 2200);
      } else if (isDeleting && currentText.length > 0) {
        // Deleting letters backward
        setCurrentText(targetText.slice(0, currentText.length - 1));
      } else if (isDeleting && currentText.length === 0) {
        // Move to next placeholder string
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, placeholderIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    onSubmitPrompt(promptText);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center pt-8 pb-12 px-4 space-y-6">
      
      {/* NEW Opus Announcement Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs hover:bg-slate-200/60 transition-all cursor-pointer">
        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-extrabold text-[10px] uppercase">
          NEW
        </span>
        <span>Introducing Opus 5 💥</span>
        <span className="text-slate-300">|</span>
        <span className="text-blue-600 font-semibold hover:underline">Try now</span>
      </div>

      {/* Hero Greeting */}
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 text-center">
        Let's make today count, {userName.split(' ')[0]}.
      </h1>

      {/* Main Floating Input Box */}
      <div className="w-full space-y-3">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl bg-white border border-slate-200 shadow-md p-4 space-y-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all"
        >
          {/* Animated Textarea */}
          <textarea
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder={currentText || "Describe your career role, experience, or GitHub profile..."}
            className="w-full text-sm font-normal text-slate-800 placeholder-slate-400 focus:outline-none resize-none bg-transparent"
          />

          {/* Bottom Tool Row Inside Box */}
          <div className="flex items-center justify-end border-t border-slate-100 pt-3">
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Feature Tool Chips Below Input */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          onClick={() => onSelectTab('assistant')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold shadow-xs hover:shadow-md transition-all"
        >
          <Bot className="w-3.5 h-3.5 text-slate-500" />
          <span>Chat Agent</span>
        </button>

        <button
          onClick={() => onSelectTab('resume')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold shadow-xs hover:shadow-md transition-all"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Resume Builder</span>
        </button>

        <button
          onClick={() => onSelectTab('github')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold shadow-xs hover:shadow-md transition-all"
        >
          <GithubIcon className="w-3.5 h-3.5 text-slate-800" />
          <span>GitHub README</span>
        </button>

        <button
          onClick={() => onSelectTab('linkedin')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold shadow-xs hover:shadow-md transition-all"
        >
          <LinkedinIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>LinkedIn Profile</span>
        </button>

        <button
          onClick={() => onSelectTab('resume')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold shadow-xs hover:shadow-md transition-all"
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>ATS Score</span>
        </button>

        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-semibold shadow-xs">
          <span>More</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
