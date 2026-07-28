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
import { LinkedinIcon } from './icons';

interface LinkedinLandingViewProps {
  userName?: string;
  onSelectTemplate: () => void;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
}

export const LinkedinLandingView: React.FC<LinkedinLandingViewProps> = ({
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
    "Optimize my LinkedIn headline for Senior Product Manager...",
    "Generate a viral LinkedIn About summary with keywords...",
    "Build high-converting experience bullet points for Tech Leads...",
    "Audit my profile strength for recruiter search visibility..."
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
      title: "High-impact headline for Staff Engineers",
      prompt: "Craft a high-converting LinkedIn headline for a Staff Engineer specializing in Distributed Systems and Cloud Architecture."
    },
    {
      title: "Storyteller About section for Product Managers",
      prompt: "Write a compelling 1st-person storytelling LinkedIn About section for a Senior Product Manager with startup growth metrics."
    },
    {
      title: "Recruiter-optimized summary for Executive Leaders",
      prompt: "Generate an executive LinkedIn summary targeting Fortune 500 recruiters for a VP of Engineering role."
    },
    {
      title: "Thought leadership post generator",
      prompt: "Create an engaging LinkedIn post outline discussing modern AI career trends and developer productivity."
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
          Optimize your LinkedIn Profile, {userName.split(' ')[0]}.
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
            placeholder={animatedPlaceholder || "Ask anything about LinkedIn optimization..."}
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

              {/* LinkedIn Pill */}
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <LinkedinIcon className="w-3.5 h-3.5 text-white" />
                <span>LinkedIn Optimizer</span>
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

      {/* Section 2: Try a Profile Preset */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Try a LinkedIn Profile Preset
          </h3>
          <button
            onClick={onOpenEditorDirectly}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Open Optimizer Editor →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Preset Card 1: Tech Leadership */}
          <div
            onClick={onSelectTemplate}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-50 text-slate-800 rounded-xl overflow-hidden relative font-sans text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-slate-200">
              <div className="bg-blue-900 h-16 relative">
                <div className="absolute -bottom-4 left-3 w-10 h-10 rounded-full bg-teal-700 border-2 border-white text-white font-bold text-xs flex items-center justify-center">
                  A
                </div>
              </div>
              <div className="pt-3 px-3 space-y-1">
                <div className="font-extrabold text-xs text-slate-900">Abis Hussain Syed</div>
                <div className="text-[8.5px] font-semibold text-slate-700 leading-tight">
                  Senior Staff Software Engineer | Ex-Google | Distributed Systems & AI Systems Architect
                </div>
                <div className="text-[8px] text-slate-400">Greater Seattle Area • 500+ connections</div>
                <div className="pt-1 flex flex-wrap gap-1">
                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-semibold text-[7.5px]">#OpenToWork</span>
                  <span className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded text-[7.5px]">Distributed AI</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Tech Leadership Archetype</div>
                <div className="text-[11px] text-slate-500">Recruiter Keyword Indexing 98%</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Preset →</span>
            </div>
          </div>

          {/* Preset Card 2: Product & UX Strategist */}
          <div
            onClick={onSelectTemplate}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-50 text-slate-800 rounded-xl overflow-hidden relative font-sans text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-slate-200">
              <div className="bg-indigo-900 h-16 relative">
                <div className="absolute -bottom-4 left-3 w-10 h-10 rounded-full bg-purple-700 border-2 border-white text-white font-bold text-xs flex items-center justify-center">
                  S
                </div>
              </div>
              <div className="pt-3 px-3 space-y-1">
                <div className="font-extrabold text-xs text-slate-900">Sarah Jenkins</div>
                <div className="text-[8.5px] font-semibold text-slate-700 leading-tight">
                  Lead Product Strategist @ Stripe • Scaling 0→1 B2B Fintech Products
                </div>
                <div className="text-[8px] text-slate-400">San Francisco, CA • 500+ connections</div>
                <div className="pt-1 text-slate-600 leading-tight">
                  Building intuitive user experiences driving $40M ARR growth...
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Product & UX Storyteller</div>
                <div className="text-[11px] text-slate-500">Storytelling About & Metrics</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Preset →</span>
            </div>
          </div>

          {/* Preset Card 3: Executive VP */}
          <div
            onClick={onSelectTemplate}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-50 text-slate-800 rounded-xl overflow-hidden relative font-sans text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-slate-200">
              <div className="bg-slate-900 h-16 relative">
                <div className="absolute -bottom-4 left-3 w-10 h-10 rounded-full bg-amber-600 border-2 border-white text-white font-bold text-xs flex items-center justify-center">
                  R
                </div>
              </div>
              <div className="pt-3 px-3 space-y-1">
                <div className="font-extrabold text-xs text-slate-900">Robert Vance</div>
                <div className="text-[8.5px] font-semibold text-slate-700 leading-tight">
                  VP of Global Operations • Angel Investor & Board Member
                </div>
                <div className="text-[8px] text-slate-400">New York, NY • 1,200+ connections</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Executive & Board Member</div>
                <div className="text-[11px] text-slate-500">High-Impact Executive Portfolio</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Preset →</span>
            </div>
          </div>

          {/* Preset Card 4: Growth Marketer */}
          <div
            onClick={onSelectTemplate}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-50 text-slate-800 rounded-xl overflow-hidden relative font-sans text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-slate-200">
              <div className="bg-emerald-900 h-16 relative">
                <div className="absolute -bottom-4 left-3 w-10 h-10 rounded-full bg-emerald-600 border-2 border-white text-white font-bold text-xs flex items-center justify-center">
                  M
                </div>
              </div>
              <div className="pt-3 px-3 space-y-1">
                <div className="font-extrabold text-xs text-slate-900">Maya Lin</div>
                <div className="text-[8.5px] font-semibold text-slate-700 leading-tight">
                  Director of Growth Marketing • Performance & Paid Acquisition Specialist
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Growth Marketer</div>
                <div className="text-[11px] text-slate-500">Quantified ROI Bullet Points</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Preset →</span>
            </div>
          </div>

          {/* Preset Card 5: AI Research Scientist */}
          <div
            onClick={onSelectTemplate}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-50 text-slate-800 rounded-xl overflow-hidden relative font-sans text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-slate-200">
              <div className="bg-purple-900 h-16 relative">
                <div className="absolute -bottom-4 left-3 w-10 h-10 rounded-full bg-purple-600 border-2 border-white text-white font-bold text-xs flex items-center justify-center">
                  D
                </div>
              </div>
              <div className="pt-3 px-3 space-y-1">
                <div className="font-extrabold text-xs text-slate-900">Dr. David Zhang</div>
                <div className="text-[8.5px] font-semibold text-slate-700 leading-tight">
                  Principal AI Scientist @ DeepMind • LLM Research & Reinforcement Learning
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">AI Research Scientist</div>
                <div className="text-[11px] text-slate-500">Publications & Patent Badges</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Preset →</span>
            </div>
          </div>

          {/* Preset Card 6: Creative Director */}
          <div
            onClick={onSelectTemplate}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-full h-56 bg-slate-50 text-slate-800 rounded-xl overflow-hidden relative font-sans text-[9px] space-y-2 group-hover:scale-[1.01] transition-transform border border-slate-200">
              <div className="bg-rose-900 h-16 relative">
                <div className="absolute -bottom-4 left-3 w-10 h-10 rounded-full bg-rose-600 border-2 border-white text-white font-bold text-xs flex items-center justify-center">
                  C
                </div>
              </div>
              <div className="pt-3 px-3 space-y-1">
                <div className="font-extrabold text-xs text-slate-900">Clara Moreau</div>
                <div className="text-[8.5px] font-semibold text-slate-700 leading-tight">
                  Global Creative Director • Brand Identity & Design Systems
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="font-bold text-xs text-slate-900">Creative Director</div>
                <div className="text-[11px] text-slate-500">Featured Media & Design Portfolio</div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Preset →</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
