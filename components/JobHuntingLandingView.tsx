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
  Briefcase,
  Search,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  Filter,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface JobHuntingLandingViewProps {
  userName?: string;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
}

export const JobHuntingLandingView: React.FC<JobHuntingLandingViewProps> = ({
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
    "Find remote Senior Frontend Engineer roles paying $140k+...",
    "Draft a high-converting recruiter cold email for Google...",
    "Generate ATS-optimized cover letter for Staff Architect...",
    "Search top hiring tech companies with 1-click auto-apply..."
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
      title: "Recruiter Outreach Email",
      prompt: "Draft a concise, high-converting cold email to a tech recruiter at Microsoft pitching my Senior Full Stack experience."
    },
    {
      title: "Salary Negotiation Script",
      prompt: "Generate a confident salary negotiation email script responding to an initial offer of $150k asking for $175k + equity."
    },
    {
      title: "Target Company Tracker",
      prompt: "Create a structured strategy list for target hiring tech startups in AI, Cloud Computing, and DevTools."
    },
    {
      title: "Interview Prep Q&A",
      prompt: "Generate the top 10 behavioral & system design interview questions for Senior Staff Engineer candidates with answer frameworks."
    }
  ];

  const jobFeeds = [
    {
      title: "Senior AI Software Engineer",
      company: "Anthropic",
      location: "San Francisco, CA (Hybrid)",
      salary: "$180,000 - $240,000",
      type: "Full-time",
      matchScore: "98% ATS Match",
      tags: ["Python", "PyTorch", "LLM", "Distributed Systems"]
    },
    {
      title: "Lead Frontend Architect",
      company: "Vercel",
      location: "Remote (Global)",
      salary: "$160,000 - $210,000",
      type: "Full-time",
      matchScore: "95% ATS Match",
      tags: ["Next.js", "React", "TypeScript", "Performance"]
    },
    {
      title: "Principal Cloud Systems Engineer",
      company: "Stripe",
      location: "Seattle, WA (Remote)",
      salary: "$195,000 - $260,000",
      type: "Full-time",
      matchScore: "94% ATS Match",
      tags: ["Kubernetes", "Go", "AWS", "Infrastructure"]
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
          Job Hunting & Recruiter Copilot, {userName.split(' ')[0]}.
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
            placeholder={animatedPlaceholder || "Search jobs or ask for recruiter outreach strategy..."}
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

              {/* Job Hunting Pill */}
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <Briefcase className="w-3.5 h-3.5 text-white" />
                <span>Job Hunting AI</span>
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
          Starter Prompts & Strategies
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

      {/* Section 2: Live High-Match Job Opportunities */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span>High ATS Match Job Opportunities</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Live Feed
            </span>
          </h3>
          <button
            onClick={onOpenEditorDirectly}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            Explore All 140+ Positions →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {jobFeeds.map((job, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {job.company[0]}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                    {job.matchScore}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {job.title}
                  </h4>
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.company}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {job.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Updated 2h ago</span>
                <button className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs">
                  Apply via AI
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
