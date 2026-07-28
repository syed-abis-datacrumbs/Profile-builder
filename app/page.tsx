'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ImagineSidebar } from '../components/ImagineSidebar';
import { ImagineHeader } from '../components/ImagineHeader';
import { ImagineHero } from '../components/ImagineHero';
import { ResumeEditor } from '../components/ResumeEditor';
import { GithubEditor } from '../components/GithubEditor';
import { LinkedinEditor } from '../components/LinkedinEditor';
import { AIChatStudio } from '../components/AIChatStudio';
import { AuthModal } from '../components/AuthModal';
import { ATSScoreModal } from '../components/ATSScoreModal';
import { ImportModal } from '../components/ImportModal';

import { ActiveTab, ResumeData, GithubProfileData, LinkedinProfileData, SavedProfile } from '../types';
import { defaultResumeData, defaultGithubData, defaultLinkedinData } from '../lib/defaultData';
import { ArrowLeft, Sparkles, FileText, Download, Award } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/icons';

export default function Home() {
  const [viewMode, setViewMode] = useState<'home' | 'studio'>('home');
  const [activeTab, setActiveTab] = useState<ActiveTab>('resume');
  const [selectedModel, setSelectedModel] = useState('Flash');
  
  // Profile Data State
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [githubData, setGithubData] = useState<GithubProfileData>(defaultGithubData);
  const [linkedinData, setLinkedinData] = useState<LinkedinProfileData>(defaultLinkedinData);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isATSOpen, setIsATSOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

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
        onOpenUpgrade={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header */}
        <ImagineHeader
          onOpenUpgrade={() => setIsAuthOpen(true)}
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
            
            {/* Studio Workspace Header Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('home')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setActiveTab('resume')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'resume' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Resume</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('github')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'github' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GithubIcon className="w-3.5 h-3.5 text-slate-800" />
                    <span>GitHub README</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('linkedin')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'linkedin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LinkedinIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('assistant')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'assistant' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Studio</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsATSOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ATS {atsScore}%</span>
                </button>

                <button
                  onClick={handleExportAll}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Active Editor Component */}
            <div className="flex-1">
              {activeTab === 'resume' && (
                <ResumeEditor
                  data={resumeData}
                  onChange={setResumeData}
                  onAIRefine={(f) => {
                    setActiveTab('assistant');
                    setAssistantPrompt(`Optimize my ${f}`);
                  }}
                />
              )}

              {activeTab === 'github' && (
                <GithubEditor
                  data={githubData}
                  onChange={setGithubData}
                  onAIRefine={() => {
                    setActiveTab('assistant');
                    setAssistantPrompt("Generate a cyberpunk GitHub README bio");
                  }}
                />
              )}

              {activeTab === 'linkedin' && (
                <LinkedinEditor
                  data={linkedinData}
                  onChange={setLinkedinData}
                  onAIRefine={(f) => {
                    setActiveTab('assistant');
                    setAssistantPrompt(`Optimize LinkedIn ${f}`);
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

    </div>
  );
}
