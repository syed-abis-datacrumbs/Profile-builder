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
  Globe,
  DollarSign,
  Star,
  FileCode,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

interface FreelancingLandingViewProps {
  userName?: string;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
}

export const FreelancingLandingView: React.FC<FreelancingLandingViewProps> = ({
  userName = "Abis",
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
    "Write a winning Upwork proposal for $5,000 Next.js web app project...",
    "Calculate my hourly freelance rate based on $150k target income...",
    "Draft a client contract & scope of work proposal template...",
    "Optimize my Fiverr gig title & tags for AI Consulting..."
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
      title: "Upwork Proposal Generator",
      prompt: "Draft a high-converting Upwork proposal for a $3,500 Full-Stack Web Development project emphasizing fast delivery & clean code."
    },
    {
      title: "Freelance Rate Calculator Script",
      prompt: "Calculate my recommended freelance hourly & fixed-project rate targeting $140,000 net income with 25 billable hours per week."
    },
    {
      title: "Client Cold Pitch Template",
      prompt: "Write a high-converting cold email pitch to SaaS founders offering custom AI integrations and UI redesigns."
    },
    {
      title: "Fiverr / Toptal Bio Optimizer",
      prompt: "Generate a top-rated seller bio & gig description for a Senior React & Next.js Consultant."
    }
  ];

  const contractTemplates = [
    {
      title: "Full-Stack SaaS MVP Build",
      clientType: "Fintech Startup",
      estimatedValue: "$8,500 fixed",
      winRate: "92% Win Rate",
      description: "Custom Next.js 15, Supabase, Tailwind, & Stripe Integration proposal template."
    },
    {
      title: "Enterprise AI Chatbot Integration",
      clientType: "E-Commerce Brand",
      estimatedValue: "$5,000 fixed",
      winRate: "96% Win Rate",
      description: "RAG architecture, OpenAI API, vectors & automated customer support workflow."
    },
    {
      title: "Retainer Senior Dev Advisor",
      clientType: "Digital Agency",
      estimatedValue: "$4,000 / month",
      winRate: "89% Win Rate",
      description: "20 hours/month code reviews, architecture guidance & team mentorship contract."
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
          Freelancing & Client Proposal AI, {userName.split(' ')[0]}.
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
            placeholder={animatedPlaceholder || "Write proposals or calculate client pricing..."}
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

              {/* Freelancing Pill */}
              <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-white" />
                <span>Freelancing Copilot</span>
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
          Proposal & Client Pitch Tools
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

      {/* Section 2: High-Converting Proposal Templates */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span>High-Converting Proposal & Contract Templates</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
              Top Rated
            </span>
          </h3>
          <button
            onClick={onOpenEditorDirectly}
            className="text-xs font-semibold text-purple-600 hover:underline"
          >
            Create Proposal →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {contractTemplates.map((template, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold text-sm">
                    <DollarSign className="w-5 h-5 text-amber-300" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-bold">
                    {template.winRate}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                    {template.title}
                  </h4>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">
                    Target: {template.clientType}
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">{template.estimatedValue}</span>
                <button className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs">
                  Use Proposal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
