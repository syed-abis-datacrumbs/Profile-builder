'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ResumeLandingView } from './ResumeLandingView';
import { ResumeEditor } from './ResumeEditor';
import { ResumeChatStudio } from './ResumeChatStudio';
import { ResumeTemplatePreview } from './ResumeTemplatePreview';
import { ATSScoreModal } from './ATSScoreModal';
import { ImportModal } from './ImportModal';
import { LmsResumeSample } from '../lib/resumeSamples';
import { CvData, cvMarkdownToHtml } from '../lib/cvTypes';
import { DEFAULT_PLACEHOLDER_CV } from '../lib/defaultData';
import { useWorkspace } from '../context/WorkspaceContext';

export function ResumeRoute() {
  const {
    mobileHeaderRight,
    setMobileHeaderRight,
    mainContentRef,
    setIsFullBleed,
    isLoggedIn,
    firstName,
    displayFullName,
    clerkFullName,
    unlocked,
    resumeData,
    setResumeData,
    setIsAuthOpen,
    navigateToAssistant,
  } = useWorkspace();

  const [resumeMode, setResumeMode] = useState<'landing' | 'preview' | 'editor' | 'studio'>('landing');
  const [resumePreviewSample, setResumePreviewSample] = useState<LmsResumeSample | null>(null);
  const [attachedResumeTemplate, setAttachedResumeTemplate] = useState<LmsResumeSample | null>(null);
  const [resumeInitialPrompt, setResumeInitialPrompt] = useState('');

  const [studioCv, setStudioCv] = useState<CvData | null>(null);
  const [studioLabel, setStudioLabel] = useState<string>('');

  const [isATSOpen, setIsATSOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Sync isFullBleed with workspace shell
  useEffect(() => {
    setIsFullBleed(resumeMode === 'studio');
    return () => setIsFullBleed(false);
  }, [resumeMode, setIsFullBleed]);

  // Safe client-side hydration from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('profile_builder_resume_mode');
      if (savedMode && ['landing', 'preview', 'editor', 'studio'].includes(savedMode)) {
        setResumeMode(savedMode as any);
      }
      const savedStudioCv = localStorage.getItem('profile_builder_studio_cv');
      if (savedStudioCv) setStudioCv(JSON.parse(savedStudioCv));

      const savedStudioLabel = localStorage.getItem('profile_builder_studio_label');
      if (savedStudioLabel) setStudioLabel(savedStudioLabel);
    } catch (e) {
      console.error('[Resume hydration error]:', e);
    }
  }, []);

  // Persist mode & studio data
  useEffect(() => {
    try {
      localStorage.setItem('profile_builder_resume_mode', resumeMode);
    } catch {}
  }, [resumeMode]);

  useEffect(() => {
    try {
      if (studioCv) localStorage.setItem('profile_builder_studio_cv', JSON.stringify(studioCv));
      else localStorage.removeItem('profile_builder_studio_cv');
      localStorage.setItem('profile_builder_studio_label', studioLabel);
    } catch {}
  }, [studioCv, studioLabel]);

  // Reset to landing event listener
  useEffect(() => {
    const handleReset = () => {
      setResumeMode('landing');
      mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('workspace_reset_landing', handleReset);
    return () => window.removeEventListener('workspace_reset_landing', handleReset);
  }, [mainContentRef]);

  const loadResumeField = (sample: LmsResumeSample, initialPromptText?: string) => {
    if (!isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }
    setStudioCv(cvMarkdownToHtml(sample.data as CvData));
    setStudioLabel(sample.label);
    setResumeInitialPrompt(initialPromptText ?? '');
    setResumeMode('studio');
  };

  const calculateATSScore = () => {
    let score = 72;
    if (resumeData.personalInfo.bio.length > 50) score += 10;
    if (resumeData.skills.length >= 6) score += 10;
    if (resumeData.experiences.some((exp) => exp.bullets.some((b) => /\d+/i.test(b)))) score += 6;
    return Math.min(score, 98);
  };

  const atsScore = calculateATSScore();

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={`resume-mode-${resumeMode === 'preview' ? 'landing' : resumeMode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-h-0 flex flex-col"
        >
          {resumeMode === 'studio' && studioCv ? (
            <ResumeChatStudio
              cv={studioCv}
              onChange={(v) => setStudioCv(v)}
              fieldLabel={studioLabel}
              onBack={() => setResumeMode('landing')}
              isLoggedIn={isLoggedIn}
              onRequireAuth={() => setIsAuthOpen(true)}
              initialPrompt={resumeInitialPrompt}
              setMobileHeaderRight={setMobileHeaderRight}
              clerkName={clerkFullName || undefined}
              isPro={unlocked ?? false}
            />
          ) : resumeMode === 'editor' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between no-print">
                <button
                  onClick={() => setResumeMode('landing')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Resume Templates & Prompts</span>
                </button>
              </div>
              <ResumeEditor
                data={resumeData}
                onChange={setResumeData}
                onAIRefine={(f) => {
                  navigateToAssistant(`Optimize my ${f}`);
                }}
              />
            </div>
          ) : (
            <ResumeLandingView
              userName={firstName}
              clerkFullName={displayFullName}
              onSelectField={(sample) => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
                  return;
                }
                loadResumeField(sample);
              }}
              onSelectTemplate={(sample) => {
                setResumePreviewSample(sample);
                setResumeMode('preview');
              }}
              attachedTemplate={attachedResumeTemplate}
              onClearAttachedTemplate={() => setAttachedResumeTemplate(null)}
              onUsePrompt={(promptText) => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
                  return;
                }
                const cleanPrompt = promptText.trim();
                setResumeInitialPrompt(cleanPrompt);
                if (attachedResumeTemplate) {
                  loadResumeField(attachedResumeTemplate, cleanPrompt);
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('profile_builder_resume_chat');
                  }
                } else {
                  const baseCv: CvData = {
                    ...DEFAULT_PLACEHOLDER_CV,
                    personalInfo: {
                      ...DEFAULT_PLACEHOLDER_CV.personalInfo,
                      fullName: displayFullName || 'Your Name',
                    },
                  };
                  setStudioCv(cvMarkdownToHtml(baseCv));
                  setStudioLabel('Your Resume');
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('profile_builder_resume_chat');
                  }
                  setResumeMode('studio');
                }
                setAttachedResumeTemplate(null);
              }}
              onOpenEditorDirectly={() => {
                if (!isLoggedIn) {
                  setIsAuthOpen(true);
                  return;
                }
                setResumeMode(studioCv ? 'studio' : 'editor');
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Resume Preview Modal */}
      <AnimatePresence>
        {resumeMode === 'preview' && resumePreviewSample && (
          <ResumeTemplatePreview
            key="preview-modal-resume"
            sample={resumePreviewSample}
            clerkFullName={displayFullName}
            onUse={() => {
              setAttachedResumeTemplate(resumePreviewSample);
              setResumeMode('landing');
              mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onClose={() => setResumeMode('landing')}
          />
        )}
      </AnimatePresence>

      <ATSScoreModal
        isOpen={isATSOpen}
        onClose={() => setIsATSOpen(false)}
        data={resumeData}
        score={atsScore}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={(partial) => {
          setResumeData((prev) => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, ...partial.personalInfo },
            skills: partial.skills || prev.skills,
          }));
        }}
      />
    </div>
  );
}
