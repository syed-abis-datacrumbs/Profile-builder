'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Folder, 
  PenTool, 
  Check, 
  ChevronDown, 
  Mic, 
  ArrowUpRight, 
  Sparkles,
  Sliders,
  Send
} from 'lucide-react';
import { LMS_RESUME_SAMPLES, LmsResumeSample } from '../lib/resumeSamples';

// Accent colours cycled across the preview cards (like the original design).
const ACCENTS = ['#dc2626', '#1e3a8a', '#059669', '#7c3aed', '#d97706', '#0891b2', '#db2777', '#4338ca'];

interface ResumeLandingViewProps {
  userName?: string;
  /** Loads the chosen field's ready-made resume. */
  onSelectField: (sample: LmsResumeSample) => void;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
}

export const ResumeLandingView: React.FC<ResumeLandingViewProps> = ({
  userName = "Abis",
  onSelectField,
  onUsePrompt,
  onOpenEditorDirectly
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('Flash');

  // Animated Typewriter Placeholder State
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const placeholders = [
    "Ask anything or type a prompt...",
    "Build a staff software engineer resume for Google...",
    "Tailor my resume for a Senior Product Manager role...",
    "Audit my ATS keyword density against job descriptions...",
    "Generate an executive resume for VP of Engineering..."
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
      title: "New grad resume, no experience",
      prompt: "Create an entry-level software engineer resume for a recent CS graduate highlighting academic projects and hackathons."
    },
    {
      title: "ATS-optimized marketing resume",
      prompt: "Build an ATS-friendly senior marketing manager resume with quantified campaign ROI & lead generation metrics."
    },
    {
      title: "Executive resume for VP of Sales",
      prompt: "Generate an executive VP of Sales resume detailing multi-million ARR growth, team leadership, and enterprise deals."
    },
    {
      title: "Career switch to product management",
      prompt: "Craft a transition resume pivoting from software engineering to technical product management."
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
          Plenty of day left, {userName.split(' ')[0]}.
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
            placeholder={animatedPlaceholder || "Ask anything..."}
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

              {/* Resume Pill */}
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
                <span>Resume</span>
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

      {/* Section 2: Field templates — pick a field, load its ready-made resume
          (shown directly here, no popup). Switch Professional/Student in the editor. */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Try a Template <span className="text-slate-400 font-normal">({LMS_RESUME_SAMPLES.length} fields)</span>
          </h3>
          <button
            onClick={onOpenEditorDirectly}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Open Form Editor →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LMS_RESUME_SAMPLES.map((sample, i) => {
            const cv = sample.data;
            const accent = ACCENTS[i % ACCENTS.length];
            const jobTitle = sample.label.replace(/\s*\(\d+\s*pages?\)\s*$/i, '').trim();
            const exp = (cv.workExperience || [])[0];
            const firstBullet = exp && exp.bullets
              ? String(exp.bullets).split('\n')[0].replace(/\*\*/g, '').trim()
              : '';
            const skills: string[] = ((cv.additional && cv.additional.skills) || '')
              .split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 4);
            const fullName = (cv.personalInfo && cv.personalInfo.fullName) || 'Your Name';
            return (
              <div
                key={sample.label}
                onClick={() => onSelectField(sample)}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
              >
                {/* Mini resume preview, filled from this field's real content */}
                <div className="w-full h-56 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-hidden font-sans text-[9px] text-slate-600 space-y-2 group-hover:scale-[1.01] transition-transform">
                  <div className="border-b-2 pb-1" style={{ borderColor: accent }}>
                    <div className="font-extrabold text-xs" style={{ color: accent }}>{fullName}</div>
                    <div className="text-[9px] font-semibold text-slate-700">{jobTitle}</div>
                    <div className="text-[8px] text-slate-400 truncate">
                      {(cv.personalInfo && cv.personalInfo.email) || ''}
                      {cv.personalInfo && cv.personalInfo.phone ? ` • ${cv.personalInfo.phone}` : ''}
                    </div>
                  </div>
                  {exp && (
                    <div className="space-y-1">
                      <div className="font-bold text-[8px] uppercase text-slate-800 border-b border-slate-200 pb-0.5">Experience</div>
                      <div className="font-bold text-slate-800">{exp.title}{exp.company ? ` — ${exp.company}` : ''}</div>
                      {firstBullet && <div className="text-slate-500 leading-tight line-clamp-2">{firstBullet}</div>}
                    </div>
                  )}
                  {skills.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-bold text-[8px] uppercase text-slate-800 border-b border-slate-200 pb-0.5">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((s, k) => (
                          <span key={k} className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{fullName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{sample.label}</div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">Use Template →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
