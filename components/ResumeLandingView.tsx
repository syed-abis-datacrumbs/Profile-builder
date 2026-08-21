'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  Send,
  X
} from 'lucide-react';
import { LMS_RESUME_SAMPLES, LmsResumeSample } from '../lib/resumeSamples';
import { getResumeAccentColor } from '../lib/resumeHelpers';
import { ResumeTemplateThumbnail } from './ResumeTemplateThumbnail';

interface ResumeLandingViewProps {
  userName?: string;
  clerkFullName?: string;
  /** Loads the chosen field's ready-made resume directly. */
  onSelectField: (sample: LmsResumeSample) => void;
  /** Triggers template preview popup modal before editing. */
  onSelectTemplate?: (sample: LmsResumeSample) => void;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
  /** Set after "Use Template" is clicked in the preview popup — shown as a
   *  removable chip; carried into the Studio on send along with whatever
   *  (if anything) was typed in the box. */
  attachedTemplate?: LmsResumeSample | null;
  onClearAttachedTemplate?: () => void;
}

export const ResumeLandingView: React.FC<ResumeLandingViewProps> = ({
  userName = "",
  clerkFullName = "",
  onSelectField,
  onSelectTemplate,
  onUsePrompt,
  onOpenEditorDirectly,
  attachedTemplate,
  onClearAttachedTemplate
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('Flash');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // "Use Template" closes the popup and attaches the chip here, but never
  // moves focus into the box — so pressing Enter right away (without first
  // clicking in) had nowhere to go. Focusing on attach means Enter with no
  // typed text works immediately, matching the Send button.
  useEffect(() => {
    if (attachedTemplate) textareaRef.current?.focus();
  }, [attachedTemplate]);

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

  const submitPrompt = () => {
    onUsePrompt(promptInput.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPrompt();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl mx-auto py-8 px-4 space-y-10"
    >
      
      {/* Title Greeting */}
      <div className="text-center pt-2">
        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-slate-900">
          Let AI build your next career move{userName ? `, ${userName.split(' ')[0]}` : ''}.
        </h1>
      </div>

      {/* Central Input Box */}
      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white border border-slate-200 rounded-3xl p-4 shadow-sm focus-within:shadow-md focus-within:border-slate-400 transition-all space-y-3"
        >
          <textarea
            ref={textareaRef}
            rows={2}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitPrompt();
              }
            }}
            placeholder={
              attachedTemplate
                ? `Add instructions for "${attachedTemplate.label}" (optional)…`
                : animatedPlaceholder || "Ask anything..."
            }
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none bg-transparent"
          />

          {/* Bottom Bar inside Prompt Box */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
            
            {/* Left Controls */}
            <div className="flex items-center gap-1.5 min-w-0">
              {attachedTemplate ? (
                <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs min-w-0 max-w-full">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-none">{attachedTemplate.label}</span>
                  <button
                    type="button"
                    onClick={onClearAttachedTemplate}
                    className="w-4 h-4 rounded-full hover:bg-blue-100 flex items-center justify-center transition-colors shrink-0"
                    title="Remove attached template"
                  >
                    <X className="w-2.5 h-2.5 text-blue-700" />
                  </button>
                </span>
              ) : (
                /* Default Resume Pill */
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs shrink-0">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Resume</span>
                </span>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1 border border-slate-200/80 transition-colors shrink-0"
              >
                <span>{selectedModel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-8 h-8 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-all shadow-sm shrink-0"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>

          </div>
        </form>
      </div>

      {/* Section 1: Starter Prompts */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">
          Starter Prompts
        </h3>

        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
          {starterPrompts.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onUsePrompt(item.prompt)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between h-20 group shrink-0 w-[260px] sm:w-auto snap-start"
            >
              <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 leading-snug pr-2">
                {item.title}
              </span>
              <div className="shrink-0">
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section 2: Field templates */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Try a Template <span className="text-slate-400 font-normal">({LMS_RESUME_SAMPLES.length} fields)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LMS_RESUME_SAMPLES.map((sample, i) => {
            const accent = getResumeAccentColor(sample);
            const fullName = (sample.data.personalInfo && sample.data.personalInfo.fullName) || 'Your Name';
            const isSelected = attachedTemplate?.label === sample.label;
            return (
              <motion.div
                key={sample.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => (onSelectTemplate ? onSelectTemplate(sample) : onSelectField(sample))}
                className={`rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group ${
                  isSelected
                    ? 'bg-blue-50/30 border-2 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white border border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Real resume preview, scaled down to card size */}
                <div className="rounded-xl overflow-hidden border border-slate-200 group-hover:scale-[1.01] transition-transform">
                  <ResumeTemplateThumbnail sample={sample} accentColor={accent} clerkFullName={clerkFullName} />
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{sample.label}</div>
                    <div className="text-[11px] text-slate-500 truncate">{fullName}</div>
                  </div>
                  <span className={`text-xs font-semibold shrink-0 ml-2 transition-transform ${
                    isSelected ? 'text-blue-700 font-bold' : 'text-blue-600 group-hover:translate-x-0.5'
                  }`}>
                    {isSelected ? '✓ Selected' : 'Use Template →'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </motion.div>
  );
};
