'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { LinkedinLandingView } from './LinkedinLandingView';
import { LinkedinEditor } from './LinkedinEditor';
import { LinkedinChatStudio } from './LinkedinChatStudio';
import { LinkedinTemplatePreview } from './LinkedinTemplatePreview';
import { TemplatePickerModal } from './TemplatePickerModal';
import { LinkedinTemplateThumbnail } from './LinkedinTemplateThumbnail';
import { linkedinCovers } from '../lib/linkedinCovers';
import {
  LinkedinRichProfile,
  buildInitialRichProfile,
  buildEmptyRichProfile,
  removeTemplateFromRichProfile,
} from '../lib/linkedinRichProfile';
import { toast } from '../lib/toast';
import { useWorkspace } from '../context/WorkspaceContext';

export function LinkedinRoute() {
  const {
    linkedinData,
    setLinkedinData,
    isLoggedIn,
    isAuthorized,
    firstName,
    unlocked,
    setIsAuthOpen,
    setShowBlockModal,
    mainContentRef,
    setIsFullBleed,
    navigateToAssistant,
  } = useWorkspace();

  const [linkedinMode, setLinkedinMode] = useState<'landing' | 'preview' | 'editor' | 'studio'>('landing');
  const [linkedinPreviewTemplateId, setLinkedinPreviewTemplateId] = useState<string | null>(null);
  const [attachedLinkedinTemplate, setAttachedLinkedinTemplate] = useState<string | null>(null);
  const [linkedinRichProfile, setLinkedinRichProfile] = useState<LinkedinRichProfile | null>(null);
  const [linkedinInitialPrompt, setLinkedinInitialPrompt] = useState('');
  const [pendingPrompt] = useState('');
  const [showLinkedinTemplatePicker, setShowLinkedinTemplatePicker] = useState(false);

  // Sync isFullBleed with workspace shell
  useEffect(() => {
    setIsFullBleed(linkedinMode === 'studio');
    return () => setIsFullBleed(false);
  }, [linkedinMode, setIsFullBleed]);

  // Safe client-side hydration from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('profile_builder_linkedin_mode');
      if (savedMode && ['landing', 'preview', 'editor', 'studio'].includes(savedMode)) {
        setLinkedinMode(savedMode as any);
      }
      const savedProfile = localStorage.getItem('profile_builder_linkedin_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed && ((parsed.experience?.length ?? 0) > 0 || parsed.headline || parsed.about)) {
          setLinkedinRichProfile(parsed);
        }
      }
    } catch (e) {
      console.error('[LinkedIn hydration error]:', e);
    }
  }, []);

  // Persist mode & profile
  useEffect(() => {
    try {
      localStorage.setItem('profile_builder_linkedin_mode', linkedinMode);
    } catch {}
  }, [linkedinMode]);

  useEffect(() => {
    try {
      if (linkedinRichProfile) {
        localStorage.setItem('profile_builder_linkedin_profile', JSON.stringify(linkedinRichProfile));
      } else {
        localStorage.removeItem('profile_builder_linkedin_profile');
      }
    } catch {}
  }, [linkedinRichProfile]);

  // Reset to landing event listener
  useEffect(() => {
    const handleReset = () => {
      setLinkedinMode('landing');
      mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('workspace_reset_landing', handleReset);
    return () => window.removeEventListener('workspace_reset_landing', handleReset);
  }, [mainContentRef]);

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={`linkedin-mode-${linkedinMode === 'preview' ? 'landing' : linkedinMode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full flex flex-col"
        >
          {linkedinMode === 'editor' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between no-print">
                <button
                  onClick={() => setLinkedinMode('landing')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to LinkedIn Presets & Prompts</span>
                </button>
              </div>
              <LinkedinEditor
                data={linkedinData}
                onChange={setLinkedinData}
                onAIRefine={(f) => {
                  navigateToAssistant(`Optimize LinkedIn ${f}`);
                }}
              />
            </div>
          ) : linkedinMode === 'studio' ? (
            <LinkedinChatStudio
              profile={linkedinRichProfile || buildEmptyRichProfile()}
              onChange={setLinkedinRichProfile}
              onBack={() => setLinkedinMode('landing')}
              isLoggedIn={isLoggedIn}
              onRequireAuth={() => setIsAuthOpen(true)}
              initialPrompt={linkedinInitialPrompt}
              isPro={unlocked ?? false}
            />
          ) : (
            <LinkedinLandingView
              userName={firstName || undefined}
              attachedTemplate={attachedLinkedinTemplate}
              onClearAttachedTemplate={() => {
                setAttachedLinkedinTemplate(null);
                setLinkedinRichProfile((prev) => (prev ? removeTemplateFromRichProfile(prev) : buildEmptyRichProfile()));
              }}
              onSelectTemplate={(tid) => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
                  return;
                }
                if (!isAuthorized) {
                  setShowBlockModal(true);
                  return;
                }
                setLinkedinPreviewTemplateId(tid);
                setLinkedinMode('preview');
              }}
              onUsePrompt={(promptText) => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
                  return;
                }
                if (!isAuthorized) {
                  setShowBlockModal(true);
                  return;
                }
                const cleanPrompt = promptText.trim();
                setLinkedinInitialPrompt(cleanPrompt);
                if (attachedLinkedinTemplate) {
                  setLinkedinRichProfile(buildInitialRichProfile(attachedLinkedinTemplate));
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('profile_builder_linkedin_chat');
                  }
                } else {
                  setLinkedinRichProfile(buildEmptyRichProfile());
                }
                setLinkedinMode('studio');
                setAttachedLinkedinTemplate(null);
              }}
              onOpenEditorDirectly={() => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
                  return;
                }
                if (!isAuthorized) {
                  setShowBlockModal(true);
                  return;
                }
                if (attachedLinkedinTemplate) {
                  setLinkedinRichProfile(buildInitialRichProfile(attachedLinkedinTemplate));
                } else {
                  setLinkedinRichProfile(buildEmptyRichProfile());
                }
                setLinkedinMode('studio');
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {linkedinMode === 'preview' && linkedinPreviewTemplateId && (
          <LinkedinTemplatePreview
            key="preview-modal-linkedin"
            templateId={linkedinPreviewTemplateId}
            isApplied={
              attachedLinkedinTemplate === linkedinPreviewTemplateId ||
              (linkedinRichProfile?.coverTemplateId === linkedinPreviewTemplateId &&
                (linkedinRichProfile?.experience?.length ?? 0) > 0)
            }
            onBack={() => setLinkedinMode('landing')}
            onEdit={() => {
              setAttachedLinkedinTemplate(linkedinPreviewTemplateId);
              setLinkedinRichProfile(buildInitialRichProfile(linkedinPreviewTemplateId));
              setLinkedinMode('landing');
              mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRemove={() => {
              setAttachedLinkedinTemplate(null);
              setLinkedinRichProfile((prev) => (prev ? removeTemplateFromRichProfile(prev) : buildEmptyRichProfile()));
              setLinkedinMode('landing');
              toast.success('Template removed');
            }}
          />
        )}
      </AnimatePresence>

      {showLinkedinTemplatePicker && (
        <TemplatePickerModal
          title="Choose a LinkedIn Cover Template"
          subtitle="Pick a design and I'll apply it, then get started on your request."
          onClose={() => setShowLinkedinTemplatePicker(false)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {linkedinCovers.map((cover, index) => (
              <button
                key={cover.id}
                onClick={() => {
                  setShowLinkedinTemplatePicker(false);
                  setLinkedinRichProfile(buildInitialRichProfile(cover.id));
                  setLinkedinInitialPrompt(pendingPrompt);
                  setLinkedinMode('studio');
                }}
                className="text-left p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all space-y-2"
              >
                <div className="w-full bg-white rounded-xl overflow-hidden border border-slate-200">
                  <LinkedinTemplateThumbnail templateId={cover.id} index={index} />
                </div>
                <div className="font-bold text-xs text-slate-900">{cover.name}</div>
                <div className="text-[11px] text-slate-500">{cover.desc}</div>
              </button>
            ))}
          </div>
        </TemplatePickerModal>
      )}
    </div>
  );
}
