'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ImagineSidebar } from '../components/ImagineSidebar';
import { ImagineHeader } from '../components/ImagineHeader';
import { ImagineHero } from '../components/ImagineHero';
import { ResumeLandingView } from '../components/ResumeLandingView';
import { ResumeEditor } from '../components/ResumeEditor';
import { GithubLandingView } from '../components/GithubLandingView';
import { GithubEditor } from '../components/GithubEditor';
import { LinkedinLandingView } from '../components/LinkedinLandingView';
import { LinkedinEditor } from '../components/LinkedinEditor';
import { JobHuntingLandingView } from '../components/JobHuntingLandingView';
import { FreelancingLandingView } from '../components/FreelancingLandingView';
import { AIChatStudio } from '../components/AIChatStudio';
import { AuthModal } from '../components/AuthModal';
import { ATSScoreModal } from '../components/ATSScoreModal';
import { ImportModal } from '../components/ImportModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { AskExpertModal } from '../components/AskExpertModal';

import { ActiveTab, ResumeData, GithubProfileData, LinkedinProfileData, SavedProfile } from '../types';
import { defaultResumeData, defaultGithubData, defaultLinkedinData } from '../lib/defaultData';
import { ArrowLeft, Sparkles, FileText, Download, Award } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/icons';

export default function Home() {
  const [viewMode, setViewMode] = useState<'home' | 'studio'>('home');
  const [activeTab, setActiveTab] = useState<ActiveTab>('resume');
  const [resumeMode, setResumeMode] = useState<'landing' | 'editor'>('landing');
  const [githubMode, setGithubMode] = useState<'landing' | 'editor'>('landing');
  const [linkedinMode, setLinkedinMode] = useState<'landing' | 'editor'>('landing');
  const [selectedModel, setSelectedModel] = useState('Flash');
  
  // Profile Data State
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [githubData, setGithubData] = useState<GithubProfileData>(defaultGithubData);
  const [linkedinData, setLinkedinData] = useState<LinkedinProfileData>(defaultLinkedinData);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isATSOpen, setIsATSOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isAskExpertOpen, setIsAskExpertOpen] = useState(false);

  // User Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>();
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

  const handleSelectTabFromHero = (tab: ActiveTab) => {
    setActiveTab(tab);
    setViewMode('studio');
  };

  const handleSubmitPromptFromHero = (promptText: string) => {
    setAssistantPrompt(promptText);
    setActiveTab('assistant');
    setViewMode('studio');
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
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setViewMode('studio');
        }}
        onNewChat={() => setViewMode('home')}
        userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis Hussain Syed" : "Abis Hussain Syed"}
        planName={isLoggedIn ? "Pro Plan" : "Free Plan"}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenAskExpert={() => setIsAskExpertOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header */}
        <ImagineHeader
          onOpenUpgrade={() => setIsUpgradeOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
        />

        {/* Home Screen OR Studio Workspace View */}
        {viewMode === 'home' ? (
          <div className="flex-1 flex items-center justify-center">
            <ImagineHero
              userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis" : "Abis"}
              onSelectTab={handleSelectTabFromHero}
              onSubmitPrompt={handleSubmitPromptFromHero}
            />
          </div>
        ) : (
          <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 max-w-7xl w-full mx-auto">
            {/* Active Editor Component */}

            {/* Active Editor Component */}
            <div className="flex-1">
              {activeTab === 'resume' && (
                resumeMode === 'landing' ? (
                  <ResumeLandingView
                    userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis" : "Abis"}
                    onSelectTemplate={(templateId) => {
                      setResumeData(prev => ({ ...prev, template: templateId }));
                      setResumeMode('editor');
                    }}
                    onUsePrompt={(promptText) => {
                      setAssistantPrompt(promptText);
                      setActiveTab('assistant');
                    }}
                    onOpenEditorDirectly={() => setResumeMode('editor')}
                  />
                ) : (
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
                )
              )}

              {activeTab === 'github' && (
                githubMode === 'landing' ? (
                  <GithubLandingView
                    userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis" : "Abis"}
                    onSelectTemplate={(styleId) => {
                      setGithubData(prev => ({ ...prev, style: styleId }));
                      setGithubMode('editor');
                    }}
                    onUsePrompt={(promptText) => {
                      setAssistantPrompt(promptText);
                      setActiveTab('assistant');
                    }}
                    onOpenEditorDirectly={() => setGithubMode('editor')}
                  />
                ) : (
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
                    />
                  </div>
                )
              )}

              {activeTab === 'linkedin' && (
                linkedinMode === 'landing' ? (
                  <LinkedinLandingView
                    userName={isLoggedIn ? userEmail?.split('@')[0] || "Abis" : "Abis"}
                    onSelectTemplate={() => setLinkedinMode('editor')}
                    onUsePrompt={(promptText) => {
                      setAssistantPrompt(promptText);
                      setActiveTab('assistant');
                    }}
                    onOpenEditorDirectly={() => setLinkedinMode('editor')}
                  />
                ) : (
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
                )
              )}

              {activeTab === 'jobhunting' && (
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
                />
              )}

              {activeTab === 'freelancing' && (
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
                />
              )}

              {activeTab === 'assistant' && (
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
              )}
            </div>

          </div>
        )}

      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(email) => {
          setIsLoggedIn(true);
          setUserEmail(email);
        }}
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
