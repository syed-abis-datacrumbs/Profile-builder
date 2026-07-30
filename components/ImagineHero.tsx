'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center pt-8 pb-12 px-4 space-y-6"
    >
      
      {/* NEW Opus Announcement Pill */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs hover:bg-slate-200/60 transition-all cursor-pointer"
      >
        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-extrabold text-[10px] uppercase">
          NEW
        </span>
        <span>Introducing Opus 5 💥</span>
        <span className="text-slate-300">|</span>
        <span className="text-blue-600 font-semibold hover:underline">Try now</span>
      </motion.div>

      {/* Hero Greeting */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 text-center"
      >
        Let's make today count, {userName.split(' ')[0]}.
      </motion.h1>

      {/* Main Floating Input Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="w-full space-y-3"
      >
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
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-8 h-8 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Feature Tool Chips Below Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="flex flex-wrap items-center justify-center gap-2 pt-2"
      >
        {[
          { tab: 'assistant', label: 'Chat Agent', icon: Bot, iconColor: 'text-slate-500' },
          { tab: 'resume', label: 'Resume Builder', icon: FileText, iconColor: 'text-blue-600' },
          { tab: 'github', label: 'GitHub README', icon: GithubIcon, iconColor: 'text-slate-800' },
          { tab: 'linkedin', label: 'LinkedIn Profile', icon: LinkedinIcon, iconColor: 'text-blue-600' },
          { tab: 'resume', label: 'ATS Score', icon: Award, iconColor: 'text-amber-500' },
        ].map((chip, idx) => {
          const ChipIcon = chip.icon;
          return (
            <motion.button
              key={idx}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectTab(chip.tab as ActiveTab)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <ChipIcon className={`w-3.5 h-3.5 ${chip.iconColor}`} />
              <span>{chip.label}</span>
            </motion.button>
          );
        })}

        <motion.button
          whileHover={{ y: -2 }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-semibold shadow-xs"
        >
          <span>More</span>
          <ChevronDown className="w-3 h-3" />
        </motion.button>
      </motion.div>

    </motion.div>
  );
};
