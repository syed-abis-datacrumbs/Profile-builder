'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import confetti from 'canvas-confetti';
import { ImagineSidebar, MobileNavBar } from '../components/ImagineSidebar';
import { ImagineHeader } from '../components/ImagineHeader';
import { ResumeLandingView } from '../components/ResumeLandingView';
import { ResumeEditor } from '../components/ResumeEditor';
import { GithubLandingView, GithubTemplateCard } from '../components/GithubLandingView';
import { GithubEditor } from '../components/GithubEditor';
import { LinkedinLandingView } from '../components/LinkedinLandingView';
import { LinkedinEditor } from '../components/LinkedinEditor';
import { LinkedinTemplatePreview } from '../components/LinkedinTemplatePreview';
import { ResumeTemplatePreview } from '../components/ResumeTemplatePreview';
import { GithubTemplatePreview } from '../components/GithubTemplatePreview';
import { JobHuntingLandingView } from '../components/JobHuntingLandingView';
import { FreelancingLandingView } from '../components/FreelancingLandingView';
import { InterviewPrepView } from '../components/InterviewPrepView';
import { AIChatStudio } from '../components/AIChatStudio';
import { AuthModal } from '../components/AuthModal';
import { ATSScoreModal } from '../components/ATSScoreModal';
import { ImportModal } from '../components/ImportModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { AskExpertModal } from '../components/AskExpertModal';
import { GithubChatStudio } from '../components/GithubChatStudio';
import { LinkedinChatStudio } from '../components/LinkedinChatStudio';
import { LinkedinRichProfile, buildInitialRichProfile } from '../lib/linkedinRichProfile';

import { ActiveTab, ResumeData, GithubProfileData, LinkedinProfileData, SavedProfile } from '../types';
import { defaultResumeData, defaultGithubData, defaultLinkedinData } from '../lib/defaultData';
import { applyRolePresetToGithub, GithubRolePreset, GITHUB_ROLE_PRESETS } from '../lib/githubRolePresets';
import { LmsResumeSample } from '../lib/resumeSamples';
import { CvData, cvMarkdownToHtml } from '../lib/cvTypes';
import { ResumeChatStudio } from '../components/ResumeChatStudio';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, FileText, Download, Award } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/icons';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('resume');
  const [resumeMode, setResumeMode] = useState<'landing' | 'preview' | 'editor' | 'studio'>('landing');
  const [resumePreviewSample, setResumePreviewSample] = useState<LmsResumeSample | null>(null);
  const [githubMode, setGithubMode] = useState<'landing' | 'preview' | 'editor' | 'studio'>('landing');
  const [githubPreviewTemplate, setGithubPreviewTemplate] = useState<GithubTemplateCard | null>(null);
  const [linkedinMode, setLinkedinMode] = useState<'landing' | 'preview' | 'editor' | 'studio'>('landing');
  const [linkedinPreviewTemplateId, setLinkedinPreviewTemplateId] = useState<string | null>(null);
  const [linkedinRichProfile, setLinkedinRichProfile] = useState<LinkedinRichProfile | null>(null);
  const [selectedModel, setSelectedModel] = useState('Flash');
  // Mobile nav drawer — the sidebar rail is desktop-only, so on a phone this
  // is the only way to move between builders.
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Profile Data State
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  // Resume Studio (chat + live LMS-format CV) works in the LMS CvData shape.
  const [studioCv, setStudioCv] = useState<CvData | null>(null);
  const [studioLabel, setStudioLabel] = useState('');
  const [githubData, setGithubData] = useState<GithubProfileData>(defaultGithubData);
  const [linkedinData, setLinkedinData] = useState<LinkedinProfileData>(defaultLinkedinData);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isATSOpen, setIsATSOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isAskExpertOpen, setIsAskExpertOpen] = useState(false);

  // User Auth State — real Clerk session, same account as the LMS
  // (lms.datacrumbs.org shares this Clerk app), so this is one source of
  // truth rather than locally-tracked login state.
  const { isSignedIn, user } = useUser();
  const isLoggedIn = isSignedIn ?? false;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const [assistantPrompt, setAssistantPrompt] = useState('');

  // Calculate ATS Score
  const calculateATSScore = () => {
    let score = 72;
    if (resumeData.personalInfo.bio.length > 50) score += 10;
    if (resumeData.skills.length >= 6) score += 10;
    if (resumeData.experiences.some(exp => exp.bullets.some(b => /\d+/i.test(b)))) score += 6;
    return Math.min(score, 98);
  };

  const atsScore = calculateATSScore();

  // Loads a role's ready-made README (from the picker popup or a role chip)
  // onto the GitHub data, then jumps into the editor.
  // Loads a preset's content into the GitHub data and opens the chat Studio.
  const openGithubStudio = (preset: GithubRolePreset, theme?: GithubProfileData['theme']) => {
    setGithubData((prev) => {
      const g = applyRolePresetToGithub(prev, preset);
      return {
        ...g,
        theme: theme || prev.theme,
        // LMS presets mark headings with **bold**; the README preview renders
        // plain text, so drop the markers instead of showing raw "**".
        customSections: g.customSections.map((s) => ({ ...s, content: s.content.replace(/\*\*/g, '') })),
      };
    });
    setGithubMode('studio');
  };

  // Loads a field's ready-made resume (LMS CvData) into the chat Studio.
  const loadResumeField = (sample: LmsResumeSample) => {
    setStudioCv(cvMarkdownToHtml(sample.data as CvData));
    setStudioLabel(sample.label);
    setResumeMode('studio');
  };

  const handleExportAll = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] text-slate-900 font-sans">
      
      {/* ImagineArt Style Left Sidebar */}
      <ImagineSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewChat={() => {
          if (activeTab === 'resume') setResumeMode('landing');
          else if (activeTab === 'github') setGithubMode('landing');
          else if (activeTab === 'linkedin') setLinkedinMode('landing');
        }}
        userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis Hussain Syed" : "Abis Hussain Syed"}
        planName={isLoggedIn ? "Pro Plan" : "Free Plan"}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenAskExpert={() => setIsAskExpertOpen(true)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen ${
        (activeTab === 'resume' && resumeMode === 'studio') ||
        (activeTab === 'linkedin' && linkedinMode === 'studio') ||
        (activeTab === 'github' && githubMode === 'studio')
          ? 'overflow-hidden' : 'overflow-y-auto'
      }`}>

        {/* Mobile menu bar — rendered in every mode, including full-bleed
            Studio, since it is the only nav a phone gets. */}
        <MobileNavBar onOpenMenu={() => setIsMobileNavOpen(true)} />

        {/* Top Header - hidden in full-bleed Studio mode */}
        {!(
          (activeTab === 'resume' && resumeMode === 'studio') ||
          (activeTab === 'linkedin' && linkedinMode === 'studio') ||
          (activeTab === 'github' && githubMode === 'studio')
        ) && (
          <ImagineHeader
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            isLoggedIn={isLoggedIn}
            userEmail={userEmail}
          />
        )}

        {/* Studio Workspace View */}
        <AnimatePresence mode="wait">
            <motion.div
              key={`studio-view-${activeTab}`}
              initial={{ opacity: 0, y: 14, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`flex-1 flex flex-col w-full mx-auto ${
                (activeTab === 'resume' && resumeMode === 'studio') ||
                (activeTab === 'linkedin' && linkedinMode === 'studio') ||
                (activeTab === 'github' && githubMode === 'studio')
                  ? 'p-0 max-w-none h-full'
                  : 'p-4 sm:p-6 gap-4 max-w-7xl'
              }`}
            >
              {/* Active Editor Component */}
              <div className="flex-1 h-full">
                <AnimatePresence mode="wait">
                  {activeTab === 'resume' && (
                    <motion.div
                      key={`tab-resume-${resumeMode}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="h-full flex flex-col"
                    >
                      {resumeMode === 'studio' && studioCv ? (
                        <ResumeChatStudio
                          cv={studioCv}
                          onChange={(v) => setStudioCv(v)}
                          fieldLabel={studioLabel}
                          onBack={() => setResumeMode('landing')}
                          isLoggedIn={isLoggedIn}
                          onRequireAuth={() => setIsAuthOpen(true)}
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
                              setActiveTab('assistant');
                              setAssistantPrompt(`Optimize my ${f}`);
                            }}
                          />
                        </div>
                      ) : (
                        <>
                          <ResumeLandingView
                            userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis" : "Abis"}
                            onSelectField={loadResumeField}
                            onSelectTemplate={(sample) => {
                              setResumePreviewSample(sample);
                              setResumeMode('preview');
                            }}
                            onUsePrompt={(promptText) => {
                              setAssistantPrompt(promptText);
                              setActiveTab('assistant');
                            }}
                            onOpenEditorDirectly={() => setResumeMode('editor')}
                          />

                          <AnimatePresence>
                            {resumeMode === 'preview' && resumePreviewSample && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:p-8"
                                onClick={(e) => {
                                  if (e.target === e.currentTarget) setResumeMode('landing');
                                }}
                              >
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                  className="w-full max-w-4xl mx-auto my-4"
                                >
                                  <ResumeTemplatePreview
                                    sample={resumePreviewSample}
                                    onBack={() => setResumeMode('landing')}
                                    onEdit={() => {
                                      loadResumeField(resumePreviewSample);
                                    }}
                                  />
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'github' && (
                    <motion.div
                      key={`tab-github-${githubMode}`}
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
                              setActiveTab('assistant');
                              setAssistantPrompt("Generate a cyberpunk GitHub README bio");
                            }}
                            isLoggedIn={isLoggedIn}
                            onRequireAuth={() => setIsAuthOpen(true)}
                          />
                        </div>
                      ) : (
                        <>
                          <GithubLandingView
                            userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis" : "Abis"}
                            onOpenRolePicker={() => openGithubStudio(GITHUB_ROLE_PRESETS[0])}
                            onSelectPreset={(preset, theme) => openGithubStudio(preset, theme)}
                            onSelectTemplate={(template) => {
                              setGithubPreviewTemplate(template);
                              setGithubMode('preview');
                            }}
                            onUsePrompt={(promptText) => {
                              setAssistantPrompt(promptText);
                              setActiveTab('assistant');
                            }}
                            onOpenEditorDirectly={() => setGithubMode('editor')}
                          />

                          <AnimatePresence>
                            {githubMode === 'preview' && githubPreviewTemplate && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:p-8"
                                onClick={(e) => {
                                  if (e.target === e.currentTarget) setGithubMode('landing');
                                }}
                              >
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                  className="w-full max-w-4xl mx-auto my-4"
                                >
                                  <GithubTemplatePreview
                                    template={githubPreviewTemplate}
                                    onBack={() => setGithubMode('landing')}
                                    onEdit={() => {
                                      const preset = GITHUB_ROLE_PRESETS.find((p) => p.id === githubPreviewTemplate.presetId) || GITHUB_ROLE_PRESETS[0];
                                      openGithubStudio(preset, githubPreviewTemplate.theme);
                                    }}
                                  />
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'linkedin' && (
                    <motion.div
                      key={`tab-linkedin-${linkedinMode}`}
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
                              setActiveTab('assistant');
                              setAssistantPrompt(`Optimize LinkedIn ${f}`);
                            }}
                          />
                        </div>
                      ) : linkedinMode === 'studio' && linkedinRichProfile ? (
                        <LinkedinChatStudio
                          profile={linkedinRichProfile}
                          onChange={setLinkedinRichProfile}
                          onBack={() => setLinkedinMode('landing')}
                          isLoggedIn={isLoggedIn}
                          onRequireAuth={() => setIsAuthOpen(true)}
                        />
                      ) : (
                        <>
                          <LinkedinLandingView
                            userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis" : "Abis"}
                            onSelectTemplate={(templateId) => {
                              setLinkedinPreviewTemplateId(templateId);
                              setLinkedinMode('preview');
                            }}
                            onUsePrompt={(promptText) => {
                              setAssistantPrompt(promptText);
                              setActiveTab('assistant');
                            }}
                            onOpenEditorDirectly={() => setLinkedinMode('editor')}
                          />

                          <AnimatePresence>
                            {linkedinMode === 'preview' && linkedinPreviewTemplateId && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:p-8"
                                onClick={(e) => {
                                  if (e.target === e.currentTarget) setLinkedinMode('landing');
                                }}
                              >
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                  className="w-full max-w-3xl mx-auto my-4"
                                >
                                  <LinkedinTemplatePreview
                                    templateId={linkedinPreviewTemplateId}
                                    onBack={() => setLinkedinMode('landing')}
                                    onEdit={() => {
                                      setLinkedinRichProfile(buildInitialRichProfile(linkedinPreviewTemplateId));
                                      setLinkedinMode('studio');
                                    }}
                                  />
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'jobhunting' && (
                    <motion.div
                      key="tab-jobhunting"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <JobHuntingLandingView
                        userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis" : "Abis"}
                        onUsePrompt={(promptText) => {
                          setAssistantPrompt(promptText);
                          setActiveTab('assistant');
                        }}
                        onOpenEditorDirectly={() => {
                          setActiveTab('assistant');
                          setAssistantPrompt("Find top tech jobs & auto-apply");
                        }}
                        onNavigateToTab={(tab) => setActiveTab(tab)}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'freelancing' && (
                    <motion.div
                      key="tab-freelancing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FreelancingLandingView
                        userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis" : "Abis"}
                        onUsePrompt={(promptText) => {
                          setAssistantPrompt(promptText);
                          setActiveTab('assistant');
                        }}
                        onOpenEditorDirectly={() => {
                          setActiveTab('assistant');
                          setAssistantPrompt("Generate client proposal contract");
                        }}
                        onNavigateToTab={(tab) => setActiveTab(tab)}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'interview' && (
                    <motion.div
                      key="tab-interview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <InterviewPrepView
                        userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis" : "Abis"}
                        onUsePrompt={(promptText) => {
                          setAssistantPrompt(promptText);
                          setActiveTab('assistant');
                        }}
                        onLaunchMockInterview={(role, jdText) => {
                          setActiveTab('assistant');
                          setAssistantPrompt(`Act as a Hiring Manager at a top tech company interviewing me for the ${role} position. Here is the job context: ${jdText}. Start by asking me the first technical or behavioral question.`);
                        }}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'assistant' && (
                    <motion.div
                      key="tab-assistant"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AIChatStudio
                        resumeData={resumeData}
                        setResumeData={setResumeData}
                        githubData={githubData}
                        setGithubData={setGithubData}
                        linkedinData={linkedinData}
                        setLinkedinData={setLinkedinData}
                        onApplyPromptText={assistantPrompt}
                        selectedModel={selectedModel}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
        </AnimatePresence>

      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />

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
          setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, ...partial.personalInfo },
            skills: partial.skills || prev.skills
          }));
        }}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />

      <AskExpertModal
        isOpen={isAskExpertOpen}
        onClose={() => setIsAskExpertOpen(false)}
      />

    </div>
  );
}
