'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import confetti from 'canvas-confetti';
import { ImagineSidebar, MobileNavBar } from '../components/ImagineSidebar';
import { ImagineHeader } from '../components/ImagineHeader';
import { ResumeLandingView } from '../components/ResumeLandingView';
import { ResumeEditor } from '../components/ResumeEditor';
import { GithubLandingView, GithubTemplateCard, GITHUB_TEMPLATES } from '../components/GithubLandingView';
import { TemplatePickerModal } from '../components/TemplatePickerModal';
import { LinkedinTemplateThumbnail } from '../components/LinkedinTemplateThumbnail';
import { linkedinCovers } from '../lib/linkedinCovers';
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
import { matchResumeSampleToPrompt } from '../lib/resumeHelpers';
import { CvData, cvMarkdownToHtml } from '../lib/cvTypes';
import { ResumeChatStudio } from '../components/ResumeChatStudio';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, FileText, Download, Award, Terminal } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/icons';

export default function Home() {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('resume');
  const [resumeMode, setResumeMode] = useState<'landing' | 'preview' | 'editor' | 'studio'>('landing');
  const [resumePreviewSample, setResumePreviewSample] = useState<LmsResumeSample | null>(null);
  // Set when "Use Template" is clicked in the preview popup — instead of
  // jumping straight into the Studio, the popup closes back to the landing
  // page with this attached, so the user can add an instruction (or just
  // send empty to use it as-is) before entering the Studio.
  const [attachedResumeTemplate, setAttachedResumeTemplate] = useState<LmsResumeSample | null>(null);
  const [githubMode, setGithubMode] = useState<'landing' | 'preview' | 'editor' | 'studio'>('landing');
  const [githubPreviewTemplate, setGithubPreviewTemplate] = useState<GithubTemplateCard | null>(null);
  const [linkedinMode, setLinkedinMode] = useState<'landing' | 'preview' | 'editor' | 'studio'>('landing');
  const [linkedinPreviewTemplateId, setLinkedinPreviewTemplateId] = useState<string | null>(null);
  const [linkedinRichProfile, setLinkedinRichProfile] = useState<LinkedinRichProfile | null>(null);
  const [selectedModel, setSelectedModel] = useState('Flash');

  // Prompt typed on a landing page, sent to the AI once the matching Chat
  // Studio has mounted. Resume skips template selection entirely; GitHub and
  // LinkedIn hold the prompt here while the user picks a template first.
  const [resumeInitialPrompt, setResumeInitialPrompt] = useState('');
  const [githubInitialPrompt, setGithubInitialPrompt] = useState('');
  const [linkedinInitialPrompt, setLinkedinInitialPrompt] = useState('');
  const [pendingPrompt, setPendingPrompt] = useState('');
  const [showGithubTemplatePicker, setShowGithubTemplatePicker] = useState(false);
  const [showLinkedinTemplatePicker, setShowLinkedinTemplatePicker] = useState(false);
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
    setGithubInitialPrompt('');
    setGithubMode('studio');
  };

  // Loads a field's ready-made resume (LMS CvData) into the chat Studio.
  const loadResumeField = (sample: LmsResumeSample) => {
    setStudioCv(cvMarkdownToHtml(sample.data as CvData));
    setStudioLabel(sample.label);
    setResumeInitialPrompt('');
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
      <div ref={mainContentRef} className={`flex-1 flex flex-col min-w-0 h-screen ${
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
                      key={`tab-resume-${resumeMode === 'preview' ? 'landing' : resumeMode}`}
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
                          initialPrompt={resumeInitialPrompt}
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
                            attachedTemplate={attachedResumeTemplate}
                            onClearAttachedTemplate={() => setAttachedResumeTemplate(null)}
                            onUsePrompt={(promptText) => {
                              // If a template was attached via "Use Template"
                              // in the preview popup, that's the base — an
                              // explicit user choice beats the closest-match
                              // guess. Otherwise (typed straight into the
                              // landing box) auto-pick the closest matching
                              // field so the AI has a sensible base to work
                              // from rather than always the same one.
                              const sample = attachedResumeTemplate ?? matchResumeSampleToPrompt(promptText);
                              loadResumeField(sample);
                              if (promptText.trim()) setResumeInitialPrompt(promptText);
                              setAttachedResumeTemplate(null);
                            }}
                            onOpenEditorDirectly={() => setResumeMode('editor')}
                          />
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
                          initialPrompt={githubInitialPrompt}
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
                              // GitHub needs a template pick first — hold the
                              // prompt and show the picker; the AI runs once
                              // a template is chosen (see the modal below).
                              setPendingPrompt(promptText);
                              setShowGithubTemplatePicker(true);
                            }}
                            onOpenEditorDirectly={() => setGithubMode('editor')}
                          />


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
                          initialPrompt={linkedinInitialPrompt}
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
                              // LinkedIn also needs a template pick first —
                              // same hand-off pattern as GitHub above.
                              setPendingPrompt(promptText);
                              setShowLinkedinTemplatePicker(true);
                            }}
                            onOpenEditorDirectly={() => setLinkedinMode('editor')}
                          />

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

      {/* Full resume preview before committing — rendered here at the top
          level (not nested inside the resume tab's motion.div) so its
          "fixed inset-0" backdrop is positioned against the real viewport.
          Nesting it inside an animating motion.div was the actual root
          cause of the earlier blink/jump bug: Framer Motion keeps a
          `transform` style on that element, which makes it the containing
          block for any `position: fixed` descendant, so the backdrop was
          boxed into just the tab content's area and only "caught up" to
          cover the full screen once that transform settled a beat later. */}
      {resumeMode === 'preview' && resumePreviewSample && (
        <ResumeTemplatePreview
          sample={resumePreviewSample}
          onUse={() => {
            // Doesn't jump into the Studio directly — closes back to the
            // landing page with this attached, so the user can add an
            // instruction (or just send empty to use it as-is) first.
            // Scrolls back to the top so the attached-template chip above
            // the prompt box is immediately visible — the user clicked this
            // from a template card that can be scrolled well below it.
            setAttachedResumeTemplate(resumePreviewSample);
            setResumeMode('landing');
            mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onClose={() => setResumeMode('landing')}
        />
      )}

      {/* Same as Resume, place Github and Linkedin preview modals at the root 
          so they are not nested inside Framer Motion transforms that might trap
          their fixed positioning. */}
      {githubMode === 'preview' && githubPreviewTemplate && (
        <GithubTemplatePreview
          template={githubPreviewTemplate}
          onBack={() => setGithubMode('landing')}
          onEdit={() => {
            const preset = GITHUB_ROLE_PRESETS.find((p) => p.id === githubPreviewTemplate.presetId) || GITHUB_ROLE_PRESETS[0];
            openGithubStudio(preset, githubPreviewTemplate.theme);
          }}
        />
      )}

      {linkedinMode === 'preview' && linkedinPreviewTemplateId && (
        <LinkedinTemplatePreview
          templateId={linkedinPreviewTemplateId}
          onBack={() => setLinkedinMode('landing')}
          onEdit={() => {
            setLinkedinRichProfile(buildInitialRichProfile(linkedinPreviewTemplateId));
            setLinkedinInitialPrompt('');
            setLinkedinMode('studio');
          }}
        />
      )}

      {/* Prompt was typed on the GitHub landing page — pick a template, then
          the AI runs the prompt on top of it inside the Chat Studio. */}
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
                  const preset = GITHUB_ROLE_PRESETS.find((p) => p.id === t.presetId) || GITHUB_ROLE_PRESETS[0];
                  openGithubStudio(preset, t.theme);
                  setGithubInitialPrompt(pendingPrompt);
                }}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
              >
                {/* Card Code/README Graphic Preview */}
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

                {/* Card Meta & CTA */}
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

      {/* Same hand-off pattern for LinkedIn. */}
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
