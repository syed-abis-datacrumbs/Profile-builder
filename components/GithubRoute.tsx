'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Terminal } from 'lucide-react';
import { GithubLandingView, GithubTemplateCard, GITHUB_TEMPLATES } from './GithubLandingView';
import { GithubEditor } from './GithubEditor';
import { GithubChatStudio } from './GithubChatStudio';
import { GithubTemplatePreview } from './GithubTemplatePreview';
import { TemplatePickerModal } from './TemplatePickerModal';
import { applyRolePresetToGithub, GithubRolePreset, GITHUB_ROLE_PRESETS } from '../lib/githubRolePresets';
import { defaultGithubData } from '../lib/defaultData';
import { GithubProfileData } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';

export function GithubRoute() {
  const {
    githubData,
    setGithubData,
    isLoggedIn,
    firstName,
    unlocked,
    setIsAuthOpen,
    mainContentRef,
    setIsFullBleed,
    navigateToAssistant,
  } = useWorkspace();

  const [githubMode, setGithubMode] = useState<'landing' | 'preview' | 'editor' | 'studio'>('landing');
  const [githubPreviewTemplate, setGithubPreviewTemplate] = useState<GithubTemplateCard | null>(null);
  const [attachedGithubTemplate, setAttachedGithubTemplate] = useState<GithubTemplateCard | null>(null);
  const [githubInitialPrompt, setGithubInitialPrompt] = useState('');
  const [pendingPrompt, setPendingPrompt] = useState('');
  const [showGithubTemplatePicker, setShowGithubTemplatePicker] = useState(false);

  // Sync isFullBleed with workspace shell
  useEffect(() => {
    setIsFullBleed(githubMode === 'studio');
    return () => setIsFullBleed(false);
  }, [githubMode, setIsFullBleed]);

  // Safe client-side hydration from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('profile_builder_github_mode');
      if (savedMode && ['landing', 'preview', 'editor', 'studio'].includes(savedMode)) {
        setGithubMode(savedMode as any);
      }
    } catch (e) {
      console.error('[GitHub hydration error]:', e);
    }
  }, []);

  // Persist mode
  useEffect(() => {
    try {
      localStorage.setItem('profile_builder_github_mode', githubMode);
    } catch {}
  }, [githubMode]);

  // Reset to landing event listener
  useEffect(() => {
    const handleReset = () => {
      setGithubMode('landing');
      mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('workspace_reset_landing', handleReset);
    return () => window.removeEventListener('workspace_reset_landing', handleReset);
  }, [mainContentRef]);

  const openGithubStudio = (preset: GithubRolePreset, theme?: GithubProfileData['theme'], avatarUrl?: string, bannerUrl?: string) => {
    if (!isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }
    const g = applyRolePresetToGithub(defaultGithubData, preset);
    setGithubData({
      ...g,
      theme: theme || defaultGithubData.theme,
      avatarUrl: avatarUrl || defaultGithubData.avatarUrl,
      bannerUrl: bannerUrl || g.bannerUrl || defaultGithubData.bannerUrl,
      customSections: g.customSections.map((s) => ({ ...s, content: s.content.replace(/\*\*/g, '') })),
    });
    setGithubInitialPrompt('');
    setGithubMode('studio');
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={`github-mode-${githubMode === 'preview' ? 'landing' : githubMode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full flex flex-col"
        >
          {githubMode === 'studio' ? (
            <GithubChatStudio
              github={githubData}
              onChange={setGithubData}
              onBack={() => setGithubMode('landing')}
              isLoggedIn={isLoggedIn}
              onRequireAuth={() => setIsAuthOpen(true)}
              initialPrompt={githubInitialPrompt}
              isPro={unlocked ?? false}
            />
          ) : githubMode === 'editor' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between no-print">
                <button
                  onClick={() => setGithubMode('landing')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to GitHub README Templates & Prompts</span>
                </button>
              </div>
              <GithubEditor
                data={githubData}
                onChange={setGithubData}
                onAIRefine={() => {
                  navigateToAssistant('Optimize and enhance my GitHub README bio with dynamic stats');
                }}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() => setIsAuthOpen(true)}
              />
            </div>
          ) : (
            <GithubLandingView
              userName={firstName || undefined}
              onOpenRolePicker={() => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
                  return;
                }
                setShowGithubTemplatePicker(true);
              }}
              onSelectPreset={(preset, theme, avatarUrl, bannerUrl) => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
                  return;
                }
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('profile_builder_github_chat');
                }
                openGithubStudio(preset, theme, avatarUrl, bannerUrl);
              }}
              attachedTemplate={attachedGithubTemplate}
              onClearAttachedTemplate={() => setAttachedGithubTemplate(null)}
              onSelectTemplate={(t) => {
                setGithubPreviewTemplate(t);
                setGithubMode('preview');
              }}
              onUsePrompt={(promptText) => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
                  return;
                }
                const cleanPrompt = promptText.trim();
                setGithubInitialPrompt(cleanPrompt);
                if (attachedGithubTemplate) {
                  const t = attachedGithubTemplate;
                  const basePreset = GITHUB_ROLE_PRESETS.find((p) => p.id === t.presetId) || GITHUB_ROLE_PRESETS[0];
                  const preset = { ...basePreset, label: t.name };
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('profile_builder_github_chat');
                  }
                  openGithubStudio(preset, t.theme, t.avatarUrl || '/images/github-profile/git-profile-1.png', t.bannerUrl);
                } else if (!githubData || !githubData.title || githubData.title === 'Minimalist Data Science' || !githubData.avatarUrl) {
                  const defaultPreset = GITHUB_ROLE_PRESETS[0];
                  const defaultTemplate = GITHUB_TEMPLATES[0];
                  openGithubStudio(defaultPreset, 'dark', '/images/github-profile/git-profile-1.png', defaultTemplate.bannerUrl);
                } else {
                  setGithubMode('studio');
                }
                setAttachedGithubTemplate(null);
              }}
              onOpenEditorDirectly={() => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
                  return;
                }
                setGithubMode('studio');
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {githubMode === 'preview' && githubPreviewTemplate && (
          <GithubTemplatePreview
            key="preview-modal-github"
            template={githubPreviewTemplate}
            onBack={() => setGithubMode('landing')}
            onEdit={() => {
              setAttachedGithubTemplate(githubPreviewTemplate);
              setGithubMode('landing');
              mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </AnimatePresence>

      {showGithubTemplatePicker && (
        <TemplatePickerModal
          title="Choose a GitHub README Template"
          subtitle="Pick a design and I'll apply it, then get started on your request."
          onClose={() => setShowGithubTemplatePicker(false)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {GITHUB_TEMPLATES.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setShowGithubTemplatePicker(false);
                  const basePreset = GITHUB_ROLE_PRESETS.find((p) => p.id === t.presetId) || GITHUB_ROLE_PRESETS[0];
                  const preset = { ...basePreset, label: t.name };
                  openGithubStudio(preset, t.theme, t.avatarUrl || '/images/github-profile/git-profile-1.png');
                  setGithubInitialPrompt(pendingPrompt);
                }}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
              >
                <div className={`w-full h-52 ${t.bgClass} text-slate-100 rounded-xl p-4 overflow-hidden flex flex-col items-center justify-between text-center gap-2 group-hover:scale-[1.01] transition-transform border ${t.borderClass} relative`}>
                  <div className="w-full flex items-center justify-between border-b border-white/10 pb-2 text-[10px]">
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Terminal className="w-3 h-3 text-slate-400" />
                      <span>README.md</span>
                    </span>
                    <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider text-[8px]">
                      {t.theme} theme
                    </span>
                  </div>

                  <div className="my-auto space-y-2 max-w-xs">
                    <div className="font-bold text-sm text-white tracking-tight leading-snug">
                      {t.headline}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {t.subhead}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center pt-1">
                      {t.badges.map((b) => (
                        <span
                          key={b}
                          className="bg-slate-900/80 border border-slate-700/60 text-slate-200 px-2 py-0.5 rounded text-[9px] font-mono shadow-2xs"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full pt-1 text-[9px] text-slate-400 font-mono border-t border-white/5 flex items-center justify-center gap-3">
                    {t.features.map((feat, idx2) => (
                      <span key={idx2}>{feat}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between px-1 pt-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{t.name}</span>
                      <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {t.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{t.tagline}</div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Use Template →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TemplatePickerModal>
      )}
    </div>
  );
}
