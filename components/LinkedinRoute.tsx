'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { LinkedinLandingView } from './LinkedinLandingView';
import { LinkedinEditor } from './LinkedinEditor';
import { LinkedinChatStudio } from './LinkedinChatStudio';
import { LinkedinTemplatePreview } from './LinkedinTemplatePreview';
import { LinkedinCopyDrawer } from './LinkedinCopyDrawer';
import { ImportModal } from './ImportModal';
import {
  LinkedinRichProfile,
  buildInitialRichProfile,
  buildEmptyRichProfile,
  removeTemplateFromRichProfile,
  sanitizeRichProfile,
  cleanPlainText,
} from '../lib/linkedinRichProfile';
import { toast } from '../lib/toast';
import { useWorkspace } from '../context/WorkspaceContext';

export function LinkedinRoute() {
  const {
    linkedinData,
    setLinkedinData,
    isLoggedIn,
    firstName,
    unlocked,
    setIsAuthOpen,
    mainContentRef,
    setIsFullBleed,
    navigateToAssistant,
    isAdmin,
    setIsImportComingSoonOpen,
  } = useWorkspace();

  const [linkedinMode, setLinkedinMode] = useState<'landing' | 'preview' | 'editor' | 'studio'>(() => {
    if (typeof window === 'undefined' || !isLoggedIn) return 'landing';
    try {
      const savedMode = localStorage.getItem('profile_builder_linkedin_mode');
      if (savedMode && ['landing', 'preview', 'editor', 'studio'].includes(savedMode)) {
        return savedMode as any;
      }
    } catch {}
    return 'landing';
  });
  const [linkedinPreviewTemplateId, setLinkedinPreviewTemplateId] = useState<string | null>(null);
  const [attachedLinkedinTemplate, setAttachedLinkedinTemplate] = useState<string | null>(null);
  const [linkedinRichProfile, setLinkedinRichProfile] = useState<LinkedinRichProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const savedProfile = localStorage.getItem('profile_builder_linkedin_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed && ((parsed.experience?.length ?? 0) > 0 || parsed.headline || parsed.about)) {
          return sanitizeRichProfile(parsed);
        }
      }
    } catch {}
    return null;
  });
  const [linkedinInitialPrompt, setLinkedinInitialPrompt] = useState('');
  const [isCopyDrawerOpen, setIsCopyDrawerOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Sync isFullBleed with workspace shell
  useEffect(() => {
    setIsFullBleed(linkedinMode === 'studio');
    return () => setIsFullBleed(false);
  }, [linkedinMode, setIsFullBleed]);

  // Safe client-side hydration from localStorage
  useEffect(() => {
    if (!isLoggedIn) {
      setLinkedinMode('landing');
      return;
    }
    try {
      const savedMode = localStorage.getItem('profile_builder_linkedin_mode');
      if (savedMode && ['landing', 'preview', 'editor', 'studio'].includes(savedMode)) {
        setLinkedinMode(savedMode as any);
      }
    } catch (e) {
      console.error('[LinkedIn hydration error]:', e);
    }
  }, [isLoggedIn]);

  // Persist mode & profile safely only when authenticated
  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      localStorage.setItem('profile_builder_linkedin_mode', linkedinMode);
    } catch {}
  }, [linkedinMode, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      if (linkedinRichProfile) {
        localStorage.setItem('profile_builder_linkedin_profile', JSON.stringify(linkedinRichProfile));
      }
    } catch {}
  }, [linkedinRichProfile, isLoggedIn]);

  // Force landing mode if user logs out
  useEffect(() => {
    if (!isLoggedIn && (linkedinMode === 'studio' || linkedinMode === 'editor')) {
      setLinkedinMode('landing');
    }
  }, [isLoggedIn, linkedinMode]);

  // Reset to landing event listener
  useEffect(() => {
    const handleReset = () => {
      setLinkedinMode('landing');
      mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('workspace_reset_landing', handleReset);
    return () => window.removeEventListener('workspace_reset_landing', handleReset);
  }, [mainContentRef]);

  const handleOpenImport = () => {
    if (isAdmin) {
      setIsImportOpen(true);
    } else {
      setIsImportComingSoonOpen(true);
    }
  };

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
              onOpenCopyDrawer={() => setIsCopyDrawerOpen(true)}
              onOpenImport={handleOpenImport}
            />
          ) : (
            <LinkedinLandingView
              userName={firstName || undefined}
              onOpenImport={handleOpenImport}
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
                setLinkedinPreviewTemplateId(tid);
                setLinkedinMode('preview');
              }}
              onUsePrompt={(promptText) => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
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


      {/* 1-Click LinkedIn Copy Package Drawer */}
      <LinkedinCopyDrawer
        isOpen={isCopyDrawerOpen}
        onClose={() => setIsCopyDrawerOpen(false)}
        profile={linkedinRichProfile}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={(imported) => {
          if (!isLoggedIn) {
            setIsAuthOpen(true);
            return;
          }
          if (imported.cvData) {
            const cv = imported.cvData;
            const rich = buildEmptyRichProfile();
            if (cv.personalInfo?.fullName) rich.fullName = cleanPlainText(cv.personalInfo.fullName);
            if (imported.linkedinData?.headline) rich.headline = cleanPlainText(imported.linkedinData.headline);
            else if (cv.summary) rich.headline = cleanPlainText(cv.summary).slice(0, 200);

            if (cv.workExperience?.[0]?.title) rich.title = cleanPlainText(cv.workExperience[0].title);
            if (cv.workExperience?.[0]?.company) rich.currentCompany = cleanPlainText(cv.workExperience[0].company);
            if (cv.workExperience?.[0]?.location) rich.location = cleanPlainText(cv.workExperience[0].location);
            if (cv.education?.[0]?.institution) rich.school = cleanPlainText(cv.education[0].institution);

            if (imported.linkedinData?.about) rich.about = cleanPlainText(imported.linkedinData.about);
            else if (cv.summary) rich.about = cleanPlainText(cv.summary);

            if (cv.additional?.skills) {
              rich.skills = cv.additional.skills
                .split(',')
                .map((s) => cleanPlainText(s))
                .filter(Boolean)
                .slice(0, 15);
            }
            if (cv.workExperience?.length) {
              rich.experience = cv.workExperience.map((we) => ({
                title: cleanPlainText(we.title),
                company: cleanPlainText(we.company),
                start: cleanPlainText(we.start),
                end: cleanPlainText(we.end),
                description: we.bullets
                  ? we.bullets
                      .split('\n')
                      .map((line) => cleanPlainText(line))
                      .filter(Boolean)
                      .join('\n')
                  : '',
              }));
            }
            if (cv.education?.length) {
              rich.education = cv.education.map((ed) => ({
                school: cleanPlainText(ed.institution),
                degree: cleanPlainText(ed.degree),
                fieldOfStudy: '',
                start: cleanPlainText(ed.start),
                end: cleanPlainText(ed.end),
              }));
            }
            const cleanRich = sanitizeRichProfile(rich);
            setLinkedinRichProfile(cleanRich);
            try {
              localStorage.setItem('profile_builder_linkedin_profile', JSON.stringify(cleanRich));
              localStorage.setItem('profile_builder_linkedin_mode', 'studio');
            } catch {}
            setLinkedinMode('studio');
          } else if (imported.linkedinData) {
            setLinkedinData((prev) => ({
              ...prev,
              headline: cleanPlainText(imported.linkedinData.headline) || prev.headline,
              about: cleanPlainText(imported.linkedinData.about) || prev.about,
              keySkills: (imported.linkedinData.keySkills || []).map((s: string) => cleanPlainText(s)),
            }));
            setLinkedinMode('studio');
          }
        }}
      />
    </div>
  );
}
