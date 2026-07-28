'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Folder, 
  PenTool, 
  Check, 
  ChevronDown, 
  ArrowUpRight, 
  Send,
  Code,
  Terminal
} from 'lucide-react';
import { GithubIcon } from './icons';

interface GithubLandingViewProps {
  userName?: string;
  onSelectTemplate: (styleId: 'modern' | 'cyberpunk' | 'minimalist') => void;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
}

export const GithubLandingView: React.FC<GithubLandingViewProps> = ({
  userName = "Abis",
  onSelectTemplate,
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Template Card 1: Modern Developer */}
          <div
            onClick={() => onSelectTemplate('modern')}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-950 text-slate-100 rounded-xl p-4 overflow-hidden relative font-mono text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-slate-800">
              <div className="border-b border-slate-800 pb-1">
                <div className="font-bold text-xs text-blue-400"># Hi there, I'm Abis 👋</div>
                <div className="text-[8px] text-slate-400">Senior Full-Stack Engineer • Open Source Enthusiast</div>
              </div>
              <div className="space-y-1">
                <div className="text-emerald-400 font-semibold">## 🛠️ Tech Stack</div>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-blue-900/80 text-blue-200 px-1 py-0.5 rounded border border-blue-700">React</span>
                  <span className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">Next.js</span>
                  <span className="bg-cyan-900/80 text-cyan-200 px-1 py-0.5 rounded border border-cyan-700">TypeScript</span>
                </div>
              </div>
              <div className="pt-1">
                <div className="text-purple-400 font-semibold">## 📊 GitHub Stats</div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-[8px] text-slate-300">
                  ⚡ Total Commits: 1,420 • Stars: 380 • Streak: 42 days
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Modern Full-Stack</div>
                <div className="text-[11px] text-slate-500">Live Badges & Streak Counter</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Template →</span>
            </div>
          </div>

          {/* Template Card 2: Cyberpunk Glow */}
          <div
            onClick={() => onSelectTemplate('cyberpunk')}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-900 text-slate-100 rounded-xl p-4 overflow-hidden relative font-mono text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-cyan-500/30">
              <div className="border-b border-cyan-500/40 pb-1">
                <div className="font-bold text-xs text-cyan-400 drop-shadow-sm">⚡ SYSTEM_ONLINE // ABIS_DEV</div>
                <div className="text-[8px] text-pink-400">[CYBERPUNK NEON EDITION]</div>
              </div>
              <div className="space-y-1">
                <div className="text-pink-400 font-semibold">&gt; STACK_MATRIX:</div>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-pink-950 text-pink-300 px-1 py-0.5 rounded border border-pink-500">Rust</span>
                  <span className="bg-cyan-950 text-cyan-300 px-1 py-0.5 rounded border border-cyan-500">WebAssembly</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Cyberpunk Dark</div>
                <div className="text-[11px] text-slate-500">Neon Glowing Terminal Style</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Template →</span>
            </div>
          </div>

          {/* Template Card 3: Minimalist Clean */}
          <div
            onClick={() => onSelectTemplate('minimalist')}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-50 text-slate-800 rounded-xl p-4 overflow-hidden relative font-serif text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-slate-200">
              <div className="border-b border-slate-300 pb-1 text-center">
                <div className="font-serif font-bold text-sm text-slate-900">Abis Hussain Syed</div>
                <div className="text-[8px] text-slate-500 font-sans">Software Architect & Researcher</div>
              </div>
              <div className="space-y-1 font-sans">
                <div className="font-bold text-[8px] uppercase tracking-wider text-slate-700">About Me</div>
                <div className="text-slate-600 text-[8.5px] leading-tight">Building distributed systems and open-source developer tooling.</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Minimalist Academic</div>
                <div className="text-[11px] text-slate-500">Serif Header & Centered Bio</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Template →</span>
            </div>
          </div>

          {/* Template Card 4: Open Source Architect */}
          <div
            onClick={() => onSelectTemplate('modern')}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-900 text-slate-200 rounded-xl p-4 overflow-hidden relative font-mono text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-slate-700">
              <div className="border-b border-slate-700 pb-1">
                <div className="font-bold text-xs text-emerald-400">🚀 Open Source Architect</div>
                <div className="text-[8px] text-slate-400">Maintainer of 5+ popular npm packages</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-300 font-semibold">📌 Featured Repositories</div>
                <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-[8px]">
                  ⭐ 2.4k stars • react-fast-state
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Open Source Maintainer</div>
                <div className="text-[11px] text-slate-500">Featured Repos & Metrics Grid</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Template →</span>
            </div>
          </div>

          {/* Template Card 5: AI & Machine Learning */}
          <div
            onClick={() => onSelectTemplate('modern')}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-950 text-purple-200 rounded-xl p-4 overflow-hidden relative font-mono text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-purple-900/50">
              <div className="border-b border-purple-800 pb-1">
                <div className="font-bold text-xs text-purple-400">🧠 AI & ML Research Engineer</div>
                <div className="text-[8px] text-slate-400">Deep Learning • LLM Infrastructure</div>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="bg-purple-900 text-purple-200 px-1 py-0.5 rounded border border-purple-700">PyTorch</span>
                <span className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">HuggingFace</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">AI & ML Engineer</div>
                <div className="text-[11px] text-slate-500">PyTorch Badges & Research Papers</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Template →</span>
            </div>
          </div>

          {/* Template Card 6: Executive Tech Lead */}
          <div
            onClick={() => onSelectTemplate('cyberpunk')}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-900 text-slate-100 rounded-xl p-4 overflow-hidden relative font-mono text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-amber-500/30">
              <div className="bg-amber-900/40 text-amber-300 p-2 rounded border border-amber-600/40">
                <div className="font-bold text-xs">👑 VP of Engineering</div>
                <div className="text-[8px] text-amber-200">Scaling Engineering Teams & Cloud Infrastructure</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Executive Tech Lead</div>
                <div className="text-[11px] text-slate-500">Architecture & Leadership Metrics</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Template →</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
