'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Folder, 
  PenTool, 
  Check, 
  ChevronDown, 
  ArrowUpRight, 
  Send
} from 'lucide-react';
import { GithubIcon } from './icons';

interface GithubLandingViewProps {
  userName?: string;
  /** Opens the "which field?" role picker (from the Minimal template card). */
  onOpenRolePicker: () => void;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
}

export const GithubLandingView: React.FC<GithubLandingViewProps> = ({
  userName = "Abis",
  onOpenRolePicker,
  onUsePrompt,
  onOpenEditorDirectly
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('Flash');

  // Typewriter Animation
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const placeholders = [
    "Generate a developer bio for my GitHub README...",
    "Add dynamic tech stack badges & live GitHub stats...",
    "Create a dark cyberpunk README theme for my profile...",
    "Showcase my top open-source projects & contributions..."
  ];

  useEffect(() => {
    const currentText = placeholders[placeholderIndex];
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setAnimatedPlaceholder(currentText.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        if (charIndex + 1 === currentText.length) {
          setTimeout(() => setIsDeleting(true), 2200);
        }
      } else {
        setAnimatedPlaceholder(currentText.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }
      }
    }, isDeleting ? 25 : 50);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, placeholderIndex]);

  const starterPrompts = [
    {
      title: "Full-stack engineer README with live stats",
      prompt: "Generate a full-stack engineer GitHub README with tech badges, active streak counter, and pinned projects."
    },
    {
      title: "Cyberpunk aesthetic dev profile",
      prompt: "Create a cyberpunk neon themed GitHub bio with glowing skill badges and terminal banner style."
    },
    {
      title: "Minimalist open-source maintainer README",
      prompt: "Draft a clean minimalist README for an open-source maintainer focusing on repo metrics and sponsor links."
    },
    {
      title: "Data Science & Machine Learning portfolio",
      prompt: "Build an ML engineer GitHub profile featuring PyTorch badges, Kaggle accomplishments, and paper citations."
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptInput.trim()) {
      onUsePrompt(promptInput);
    } else {
      onOpenEditorDirectly();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-300">
      
      {/* Title Greeting */}
      <div className="text-center pt-2">
        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-slate-900">
          Elevate your GitHub Profile, {userName.split(' ')[0]}.
        </h1>
      </div>

      {/* Central Input Box */}
      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white border border-slate-200 rounded-3xl p-4 shadow-sm focus-within:shadow-md focus-within:border-slate-400 transition-all space-y-3"
        >
          <textarea
            rows={2}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder={animatedPlaceholder || "Ask anything about your GitHub profile..."}
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none bg-transparent"
          />

          {/* Bottom Bar inside Prompt Box */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            
            {/* Left Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                title="Attach file"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                title="Browse docs"
              >
                <Folder className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                title="Format style"
              >
                <PenTool className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              {/* Auto Pill */}
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 border border-slate-200/60">
                <Check className="w-3 h-3 text-slate-500" />
                <span>Auto</span>
              </span>

              {/* GitHub Pill */}
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <GithubIcon className="w-3.5 h-3.5 text-white" />
                <span>GitHub README</span>
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1 border border-slate-200/80 transition-colors"
              >
                <span>{selectedModel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* Section 1: Starter Prompts */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">
          Starter Prompts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {starterPrompts.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onUsePrompt(item.prompt)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between h-20 group"
            >
              <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 leading-snug pr-2">
                {item.title}
              </span>
              <div className="shrink-0">
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Try a README Template */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Try a GitHub README Template
          </h3>
          <button
            onClick={onOpenEditorDirectly}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Open README Editor →
          </button>
        </div>

        {/* The single design template the LMS ships: "Minimal". Clicking it
            opens the "which field?" picker, then loads that role's README. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={onOpenRolePicker}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-950 text-slate-100 rounded-xl p-4 overflow-hidden flex flex-col items-center justify-center text-center gap-2 group-hover:scale-[1.01] transition-transform border border-slate-800">
              <div className="font-bold text-sm text-white">Hi, I&apos;m Your Name 👋</div>
              <div className="text-[9px] text-slate-400">Data Scientist · Turning data into decisions</div>
              <div className="flex flex-wrap gap-1 justify-center pt-1">
                <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[8px]">Python</span>
                <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[8px]">PyTorch</span>
                <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[8px]">SQL</span>
              </div>
              <div className="text-[8px] text-slate-500 pt-1">📊 GitHub Stats · 🔥 Streak</div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Minimal</div>
                <div className="text-[11px] text-slate-500">Data Science · Clean, centered, to the point</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Template →</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
