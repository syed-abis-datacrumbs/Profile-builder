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
  Send
} from 'lucide-react';
import { LinkedinIcon } from './icons';
import { linkedinCovers, getDefaultPfpGradientId } from '../lib/linkedinCovers';

interface LinkedinLandingViewProps {
  userName?: string;
  onSelectTemplate: (templateId: string) => void;
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl mx-auto py-8 px-4 space-y-10"
    >
      
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {starterPrompts.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onUsePrompt(item.prompt)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between h-20 group"
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Try a LinkedIn Cover Template
          </h3>
          <button
            onClick={onOpenEditorDirectly}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Open Optimizer Editor →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              {/* Template Thumbnail Graphic */}
              <div className="w-full h-56 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 group-hover:scale-[1.01] transition-transform flex flex-col relative">
                {cover.thumbnail ? (
                  <div className="w-full h-full relative bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover.thumbnail}
                      alt={cover.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 relative overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/linkedin-templates/thumbnails/${cover.id}.png`}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.dataset.fallbackTried) {
                            target.dataset.fallbackTried = 'true';
                            target.src = `/images/linkedin-templates/cover/${cover.id}/thumbnail.png`;
                          } else if (target.dataset.fallbackTried === 'true') {
                            target.dataset.fallbackTried = 'done';
                            target.src = `/images/linkedin-templates/cover/${cover.id}/background.png`;
                          }
                        }}
                        alt={cover.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-white px-3 pb-3 pt-0 relative">
                      <div className="absolute -top-5 left-3 w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/images/linkedin-templates/pfp/${getDefaultPfpGradientId(index)}/background.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="pt-6 space-y-1.5">
                        <div className="h-2 bg-slate-200 rounded-full w-1/2" />
                        <div className="h-1.5 bg-slate-100 rounded-full w-3/4" />
                      </div>
                    </div>
                  </>
                )}
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
