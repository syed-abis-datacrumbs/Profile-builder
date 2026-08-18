'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Folder, 
  PenTool, 
  Check, 
  ChevronDown, 
  ArrowUpRight, 
  Send,
  X
} from 'lucide-react';
import { LinkedinIcon } from './icons';
import { linkedinCovers } from '../lib/linkedinCovers';
import { LinkedinTemplateThumbnail } from './LinkedinTemplateThumbnail';

interface LinkedinLandingViewProps {
  userName?: string;
  attachedTemplate: string | null;
  onClearAttachedTemplate: () => void;
  onSelectTemplate: (templateId: string) => void;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
}

export const LinkedinLandingView: React.FC<LinkedinLandingViewProps> = ({
  userName = "Abis",
  attachedTemplate,
  onClearAttachedTemplate,
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
    onUsePrompt(promptInput.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl mx-auto py-6 sm:py-8 px-4 space-y-8 sm:space-y-10"
    >

      {/* Title Greeting */}
      <div className="text-center pt-2">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif tracking-tight text-slate-900 text-balance">
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            placeholder={
              attachedTemplate
                ? `Add instructions for template "${attachedTemplate}" (optional)…`
                : animatedPlaceholder || "Ask anything about LinkedIn optimization..."
            }
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none bg-transparent"
          />

          {/* Bottom Bar inside Prompt Box */}
          <div className="flex items-center justify-between gap-2 flex-wrap border-t border-slate-100 pt-3">

            {/* Left Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {attachedTemplate ? (
                <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-2xs">
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  <span>{linkedinCovers.find(c => c.id === attachedTemplate)?.name || attachedTemplate}</span>
                  <button
                    type="button"
                    onClick={onClearAttachedTemplate}
                    className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    title="Remove attached template"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs shrink-0">
                  <LinkedinIcon className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="sm:hidden">LinkedIn</span>
                  <span className="hidden sm:inline">LinkedIn Optimizer</span>
                </span>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 ml-auto shrink-0">
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1 border border-slate-200/80 transition-colors"
              >
                <span>{selectedModel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-8 h-8 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-all shadow-sm"
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

      {/* Section 2: Try a Profile Preset */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-700">
            Try a LinkedIn Cover Template
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {linkedinCovers.map((cover, index) => (
            <motion.div
              key={cover.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTemplate(cover.id)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
            >
              {/* Template thumbnail — rendered live from the template's own
                  data rather than a screenshot, so the framing is exact at
                  any card size and can never drift from the template's copy. */}
              <div className="w-full bg-white rounded-xl overflow-hidden border border-slate-200 group-hover:scale-[1.01] transition-transform">
                <LinkedinTemplateThumbnail templateId={cover.id} index={index} />
              </div>

              <div className="flex items-center justify-between px-1">
                <div>
                  <div className="font-bold text-xs text-slate-900">{cover.name}</div>
                  <div className="text-[11px] text-slate-500">{cover.desc}</div>
                </div>
                <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">Use Template →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
