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
  Sparkles,
  Layers,
  Terminal,
  Code,
  X
} from 'lucide-react';
import { GithubIcon } from './icons';
import { GITHUB_ROLE_PRESETS, GithubRolePreset } from '../lib/githubRolePresets';
import { GithubProfileData } from '../types';

interface GithubLandingViewProps {
  userName?: string;
  /** Opens the "which field?" role picker modal. */
  onOpenRolePicker: () => void;
  /** Selects a specific preset and theme directly to launch editor. */
  onSelectPreset?: (preset: GithubRolePreset, theme?: GithubProfileData['theme'], avatarUrl?: string) => void;
  attachedTemplate: GithubTemplateCard | null;
  onClearAttachedTemplate: () => void;
  onSelectTemplate?: (template: GithubTemplateCard) => void;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
}

export interface GithubTemplateCard {
  id: string;
  presetId: string;
  category: 'all' | 'data-ai' | 'web' | 'devops' | 'mobile';
  name: string;
  tagline: string;
  badge: string;
  theme: GithubProfileData['theme'];
  bgClass: string;
  borderClass: string;
  accentText: string;
  badges: string[];
  features: string[];
  headline: string;
  subhead: string;
  avatarUrl?: string;
}

export const GITHUB_TEMPLATES: GithubTemplateCard[] = [
  {
    id: 'minimal-ds',
    presetId: 'data-science',
    category: 'data-ai',
    name: 'Minimalist Data Science',
    tagline: 'Clean, centered & to the point',
    badge: 'Popular',
    theme: 'dark',
    bgClass: 'bg-slate-950',
    borderClass: 'border-slate-800',
    accentText: 'text-indigo-400',
    badges: ['Python', 'PyTorch', 'SQL'],
    features: ['📊 GitHub Stats', '🔥 Streak Counter'],
    headline: "Hi, I'm Your Name 👋",
    subhead: 'Data Scientist · Turning data into decisions',
  },
  {
    id: 'cyberpunk-ai',
    presetId: 'ai-ml-engineer',
    category: 'data-ai',
    name: 'Cyberpunk Neon AI',
    tagline: 'Futuristic terminal & neon badges',
    badge: 'Trending',
    theme: 'cyberpunk',
    bgClass: 'bg-gradient-to-br from-yellow-950/60 via-slate-950 to-cyan-950/60',
    borderClass: 'border-cyan-500/40 shadow-cyan-500/10',
    accentText: 'text-cyan-400',
    badges: ['PyTorch', 'TensorFlow', 'FastAPI', 'CUDA'],
    features: ['⚡ Neon Badges', '🤖 LLM Benchmarks', '🔥 Cyber Streak'],
    headline: '> root@cyber-dev:~$ bio',
    subhead: 'AI/ML Engineer · Quantized models & Triton serving',
  },
  {
    id: 'fullstack-showcase',
    presetId: 'full-stack',
    category: 'web',
    name: 'Full-Stack Showcase',
    tagline: 'Rich tech grid & project showcases',
    badge: 'Featured',
    theme: 'tokyonight',
    bgClass: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950',
    borderClass: 'border-indigo-500/30 shadow-indigo-500/10',
    accentText: 'text-indigo-400',
    badges: ['TypeScript', 'Next.js', 'React', 'PostgreSQL'],
    features: ['🛠️ Tech Badges', '🚀 Featured Projects', '📈 Top Languages'],
    headline: 'Full-Stack Software Engineer 🚀',
    subhead: 'Building scalable web products & distributed services',
  },
  {
    id: 'cloud-devops',
    presetId: 'mlops-engineer',
    category: 'devops',
    name: 'Cloud & DevOps Architect',
    tagline: 'Infrastructure as Code & CI/CD workflows',
    badge: 'Infrastructure',
    theme: 'radial',
    bgClass: 'bg-gradient-to-br from-emerald-950/60 via-slate-950 to-teal-950/60',
    borderClass: 'border-emerald-500/30 shadow-emerald-500/10',
    accentText: 'text-emerald-400',
    badges: ['Terraform', 'Kubernetes', 'AWS', 'Docker'],
    features: ['☁️ Cloud Badges', '⚙️ CI/CD Status', '📊 Infra Metrics'],
    headline: 'DevOps & Cloud Systems Lead ☁️',
    subhead: 'Automating multi-cloud platforms & K8s clusters',
  },
  {
    id: 'opensource-maintainer',
    presetId: 'backend',
    category: 'devops',
    name: 'Backend Developer',
    tagline: 'High-performance APIs & microservices',
    badge: 'Backend',
    theme: 'dracula',
    bgClass: 'bg-gradient-to-br from-purple-950/60 via-slate-950 to-pink-950/50',
    borderClass: 'border-purple-500/30 shadow-purple-500/10',
    accentText: 'text-pink-400',
    badges: ['Go', 'Node.js', 'Redis', 'Kafka'],
    features: ['💖 Sponsor Button', '📦 Package Stats', '📊 Contributor Graph'],
    headline: 'Backend Engineer ⚡',
    subhead: 'Building high-throughput backend services & tools',
  },
  {
    id: 'vision-edge-ai',
    presetId: 'computer-vision',
    category: 'data-ai',
    name: 'Vision & Edge AI',
    tagline: 'Real-time models, OpenCV & TensorRT',
    badge: 'Specialized',
    theme: 'dark',
    bgClass: 'bg-gradient-to-br from-blue-950/60 via-slate-950 to-slate-900',
    borderClass: 'border-blue-500/30 shadow-blue-500/10',
    accentText: 'text-blue-400',
    badges: ['C++', 'PyTorch', 'OpenCV', 'TensorRT'],
    features: ['👁️ Vision Demos', '⚡ Edge FPS Benchmarks', '📊 Live Stats'],
    headline: 'Computer Vision Engineer 👁️',
    subhead: 'Edge model optimization & 3D camera geometry',
  },
  {
    id: 'mobile-app-dev',
    presetId: 'frontend',
    category: 'mobile',
    name: 'Mobile App Specialist',
    tagline: 'iOS & Android native & cross-platform',
    badge: 'Mobile',
    theme: 'tokyonight',
    bgClass: 'bg-gradient-to-br from-sky-950/60 via-slate-950 to-indigo-950/50',
    borderClass: 'border-sky-500/30 shadow-sky-500/10',
    accentText: 'text-sky-400',
    badges: ['Swift', 'Kotlin', 'Flutter', 'React Native'],
    features: ['📱 App Store Badges', '📲 TestFlight Links', '🔥 Streak Counter'],
    headline: 'Mobile Product Developer 📱',
    subhead: 'Native Swift/Kotlin & Flutter apps for store releases',
  },
  {
    id: 'executive-lead',
    presetId: 'full-stack',
    category: 'web',
    name: 'Software Engineering Lead',
    tagline: 'System architecture & team impact',
    badge: 'Staff/Lead',
    theme: 'radial',
    bgClass: 'bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900',
    borderClass: 'border-slate-700/60 shadow-slate-700/10',
    accentText: 'text-amber-400',
    badges: ['TypeScript', 'Python', 'Kubernetes', 'PostgreSQL'],
    features: ['🏛️ System Architecture', '📈 Impact Metrics', '🌐 Connect Badges'],
    headline: 'Staff Software Engineer & Lead 🏛️',
    subhead: 'Architecting resilient cloud systems & leading dev teams',
    avatarUrl: 'https://images.unsplash.com/photo-1737574821698-862e77f044c1?q=80&w=627&auto=format&fit=crop'
  }
];

export const GithubLandingView: React.FC<GithubLandingViewProps> = ({
  userName = "",
  onOpenRolePicker,
  onSelectPreset,
  attachedTemplate,
  onClearAttachedTemplate,
  onSelectTemplate,
  onUsePrompt,
  onOpenEditorDirectly
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('Flash');
  const [activeCategory, setActiveCategory] = useState<'all' | 'data-ai' | 'web' | 'devops' | 'mobile'>('all');

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

  const filteredTemplates = GITHUB_TEMPLATES.filter(
    (tmpl) => activeCategory === 'all' || tmpl.category === activeCategory
  );

  const handleSelectTemplate = (template: GithubTemplateCard) => {
    if (onSelectTemplate) return onSelectTemplate(template);
    const preset = GITHUB_ROLE_PRESETS.find((p) => p.id === template.presetId);
    if (preset && onSelectPreset) {
      onSelectPreset(preset, template.theme, template.avatarUrl);
    } else {
      onOpenRolePicker();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUsePrompt(promptInput.trim());
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
          Elevate your GitHub Profile{userName ? `, ${userName.split(' ')[0]}` : ''}.
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
                ? `Add instructions for "${attachedTemplate.name}" (optional)…`
                : animatedPlaceholder || "Ask anything about your GitHub profile..."
            }
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none bg-transparent"
          />

          {/* Bottom Bar inside Prompt Box */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
            
            {/* Left Controls */}
            <div className="flex items-center gap-1.5 min-w-0">
              {attachedTemplate ? (
                <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-2xs min-w-0 max-w-full">
                  <GithubIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-none">{attachedTemplate.name}</span>
                  <button
                    type="button"
                    onClick={onClearAttachedTemplate}
                    className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
                    title="Remove attached template"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs shrink-0">
                  <GithubIcon className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>GitHub README</span>
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

      {/* Section 2: Try a GitHub README Template */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <span>Try a GitHub README Template</span>
              <span className="sm:hidden text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                {GITHUB_TEMPLATES.length} Designs
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a visual README layout preset tailored to your developer persona.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              {GITHUB_TEMPLATES.length} Designs
            </span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { id: 'all', label: 'All Templates' },
            { id: 'data-ai', label: 'Data Science & AI' },
            { id: 'web', label: 'Web & Full Stack' },
            { id: 'devops', label: 'DevOps & Systems' },
            { id: 'mobile', label: 'Mobile App' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectTemplate(template)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
            >
              {/* Card Code/README Graphic Preview */}
              <div className={`w-full h-52 ${template.bgClass} text-slate-100 rounded-xl p-4 overflow-hidden flex flex-col items-center justify-between text-center gap-2 group-hover:scale-[1.01] transition-transform border ${template.borderClass} relative`}>
                
                {/* Theme Tag Header */}
                <div className="w-full flex items-center justify-between border-b border-white/10 pb-2 text-[10px]">
                  <span className="flex items-center gap-1 text-slate-400 font-mono">
                    <Terminal className="w-3 h-3 text-slate-400" />
                    <span>README.md</span>
                  </span>
                  <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider text-[8px]">
                    {template.theme} theme
                  </span>
                </div>

                {/* Content Preview */}
                <div className="my-auto space-y-2 max-w-xs">
                  <div className="font-bold text-sm text-white tracking-tight leading-snug">
                    {template.headline}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {template.subhead}
                  </div>
                  
                  {/* Badges Preview */}
                  <div className="flex flex-wrap gap-1 justify-center pt-1">
                    {template.badges.map((b) => (
                      <span
                        key={b}
                        className="bg-slate-900/80 border border-slate-700/60 text-slate-200 px-2 py-0.5 rounded text-[9px] font-mono shadow-2xs"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features Footer Pill */}
                <div className="w-full pt-1 text-[9px] text-slate-400 font-mono border-t border-white/5 flex items-center justify-center gap-3">
                  {template.features.map((feat, idx2) => (
                    <span key={idx2}>{feat}</span>
                  ))}
                </div>
              </div>

              {/* Card Meta & CTA */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{template.name}</span>
                    <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {template.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{template.tagline}</div>
                </div>
                <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                  Use Template →
                </span>
              </div>

            </motion.div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
