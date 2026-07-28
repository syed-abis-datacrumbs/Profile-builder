'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Upload, 
  Paperclip, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';
import { ResumeData, GithubProfileData, LinkedinProfileData } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionTaken?: string;
}

interface AIChatStudioProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  githubData: GithubProfileData;
  setGithubData: (data: GithubProfileData) => void;
  linkedinData: LinkedinProfileData;
  setLinkedinData: (data: LinkedinProfileData) => void;
  onApplyPromptText?: string;
  selectedModel: string;
}

export const AIChatStudio: React.FC<AIChatStudioProps> = ({
  resumeData,
  setResumeData,
  githubData,
  setGithubData,
  linkedinData,
  setLinkedinData,
  onApplyPromptText,
  selectedModel
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: "👋 Hello! I am ProfileArchitect AI. Ask me to generate an ATS-optimized resume, write a dark-mode GitHub README, or craft a high-converting LinkedIn profile headline and bio.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState(onApplyPromptText || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = (userText?: string) => {
    const textToSend = userText || inputText;
    if (!textToSend.trim() || isGenerating) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!userText) setInputText('');
    setIsGenerating(true);

    // Simulate AI synthesis & update state based on intent
    setTimeout(() => {
      let aiResponseText = "";
      let actionLabel = "";
      const lower = textToSend.toLowerCase();

      if (lower.includes("nurse") || lower.includes("healthcare")) {
        setResumeData({
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            fullName: "Sarah Jenkins, RN",
            jobTitle: "Senior ICU Critical Care Nurse",
            bio: "Dedicated Registered Nurse with 6+ years in high-acuity Intensive Care Units and Emergency Trauma centers. Proven track record managing complex ventilator care, critical medication administration, and patient advocacy."
          },
          skills: ["Critical Care (ICU)", "Ventilator Management", "Trauma Life Support (ACLS)", "Patient Advocacy", "EHR System (Epic)", "Telemetry"]
        });
        aiResponseText = "✨ Successfully generated a specialized Healthcare & ICU Nurse Resume kit! Updated professional summary, ICU experience metrics, and ACLS skills in your Resume Workspace.";
        actionLabel = "Updated Resume Workspace to ICU Nurse Profile";

      } else if (lower.includes("github") || lower.includes("readme") || lower.includes("cyberpunk")) {
        setGithubData({
          ...githubData,
          title: "⚡ Cyberpunk & AI Systems Architect",
          about: "👾 Crafting autonomous AI tools, reactive web applications, and vector neural engines. Powered by Next.js, Python, and PyTorch.",
          theme: "cyberpunk",
          showStreakCard: true,
          showStatsCard: true
        });
        aiResponseText = "🚀 Generated a Cyberpunk Cyber-themed GitHub README bio! Added dynamic shields, streak stats, and tech stack badges in your GitHub Workspace.";
        actionLabel = "Updated GitHub README to Cyberpunk Theme";

      } else if (lower.includes("linkedin") || lower.includes("executive")) {
        setLinkedinData({
          ...linkedinData,
          headline: "Executive VP of Engineering & AI Solutions | Scaling High-Growth Tech Teams | Next.js & Cloud Architect",
          about: "Visionary engineering executive with 10+ years driving product strategy, cloud architecture, and high-performance engineering culture.\n\nProven leader scaling engineering organizations from pre-revenue to $50M+ ARR while deploying cutting-edge AI infrastructure.",
          targetRole: "VP of Engineering / CTO"
        });
        aiResponseText = "💼 Optimized your LinkedIn Profile for Executive Leadership! Generated high-impact headline, executive summary, and target CTO positioning.";
        actionLabel = "Updated LinkedIn Profile Workspace";

      } else {
        // Generic AI enhancement
        setResumeData({
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            jobTitle: textToSend.length < 40 ? textToSend : resumeData.personalInfo.jobTitle,
            bio: `Results-oriented tech professional with extensive hands-on expertise executing high-impact initiatives in ${textToSend}. Proven capability delivering scalable web architectures and quantitative business outcomes.`
          }
        });
        aiResponseText = `🤖 Analyzed your request ("${textToSend}"). Processed with ${selectedModel}. Enhanced your Resume bullet points, ATS keywords, and career bio!`;
        actionLabel = "Enhanced Career Kit Assets";
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTaken: actionLabel
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] glass-panel bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>ProfileArchitect AI Agent</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                {selectedModel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Ask natural language requests to auto-build Resume, GitHub & LinkedIn profiles
            </p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? 'You' : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-xl'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              
              {msg.actionTaken && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{msg.actionTaken}</span>
                </div>
              )}

              <div className="text-[10px] text-right opacity-60">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-indigo-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Synthesizing career assets with {selectedModel}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type prompt: e.g. 'Build a Senior Full-Stack Engineer resume with Next.js & PyTorch'..."
            className="flex-1 px-4 py-2.5 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isGenerating}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
