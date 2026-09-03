'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Briefcase, 
  User, 
  Award, 
  Share2, 
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Globe,
  Zap,
  Bell,
} from 'lucide-react';
import { LinkedinIcon, LinkedinPremiumBadge } from './icons';
import { LinkedinProfileData } from '../types';

interface LinkedinEditorProps {
  data: LinkedinProfileData;
  onChange: (newData: LinkedinProfileData) => void;
  onAIRefine: (field: string) => void;
}

export const LinkedinEditor: React.FC<LinkedinEditorProps> = ({
  data,
  onChange,
  onAIRefine
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      
      {/* Left Input & AI Controls */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        <div className="glass-panel p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
              <LinkedinIcon className="w-4 h-4 text-blue-400" />
              <span>LinkedIn Profile Architect</span>
            </div>
            <button
              onClick={() => onAIRefine('linkedin_headline')}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Optimiser</span>
            </button>
          </div>

          {/* Headline Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-400">
                LinkedIn High-Impact Headline
              </label>
              <button
                onClick={() => copyToClipboard(data.headline, 'headline')}
                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedField === 'headline' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                <span>{copiedField === 'headline' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={data.headline}
              onChange={(e) => onChange({ ...data, headline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none leading-relaxed"
              placeholder="e.g. Senior AI Architect | Building Next.js Apps | Ex-Nexus AI"
            />
          </div>

          {/* Target Role & Industry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Target Role</label>
              <input
                type="text"
                value={data.targetRole}
                onChange={(e) => onChange({ ...data, targetRole: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Industry Niche</label>
              <input
                type="text"
                value={data.industry}
                onChange={(e) => onChange({ ...data, industry: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Open To Work Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">#OpenToWork Badge</div>
              <div className="text-[10px] text-slate-400">Display recruiter signal badge on profile header</div>
            </div>
            <input
              type="checkbox"
              checked={data.openToWork}
              onChange={(e) => onChange({ ...data, openToWork: e.target.checked })}
              className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* About Section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-400">About / Executive Bio</label>
              <button
                onClick={() => copyToClipboard(data.about, 'about')}
                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedField === 'about' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                <span>{copiedField === 'about' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={data.about}
              onChange={(e) => onChange({ ...data, about: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Featured Post Generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-400">Featured Launch Post</label>
              <button
                onClick={() => copyToClipboard(data.featuredPost, 'post')}
                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedField === 'post' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                <span>{copiedField === 'post' ? 'Copied' : 'Copy Post'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={data.featuredPost}
              onChange={(e) => onChange({ ...data, featuredPost: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none leading-relaxed"
            />
          </div>

        </div>

      </div>

      {/* Right Studio Live LinkedIn Profile Card Mock */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <LinkedinIcon className="w-4 h-4 text-blue-400" />
            <span>LinkedIn Desktop Profile Mockup</span>
          </div>

          <button
            onClick={() => copyToClipboard(`${data.headline}\n\nABOUT:\n${data.about}`, 'all')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
          >
            {copiedField === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedField === 'all' ? 'Copied All Content' : 'Copy Entire LinkedIn Kit'}</span>
          </button>
        </div>

        {/* Live Mock Card Container */}
        <div className="flex-1 p-4 bg-slate-950 rounded-2xl border border-slate-800 overflow-y-auto max-h-[calc(100vh-210px)] space-y-4">
          
          {/* Main LinkedIn Header Banner Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            {/* Banner Background */}
            <div className="h-32 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
            </div>

            <div className="px-6 pb-6 pt-0 relative">
              {/* Profile Avatar & Badge */}
              <div className="flex justify-between items-end -mt-14 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-2xl font-bold text-white shadow-xl bg-gradient-to-tr from-indigo-600 to-blue-500">
                    AR
                  </div>
                  {data.openToWork && (
                    <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider shadow-lg border-2 border-slate-900">
                      #OpenToWork
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <LinkedinPremiumBadge className="w-5 h-5" />
                  <button className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition" title="Notifications">
                    <Bell className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md">
                    Connect
                  </button>
                  <button className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700">
                    Message
                  </button>
                </div>
              </div>

              {/* Name & Headline */}
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Alex Rivera</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                    500+ Connections
                  </span>
                </h2>
                <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                  {data.headline}
                </p>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-3">
                  <span>{data.industry}</span>
                  <span>•</span>
                  <span className="text-blue-400 font-semibold">{data.targetRole}</span>
                </div>
              </div>
            </div>
          </div>

          {/* About Section Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
              <span>About</span>
              <button
                onClick={() => copyToClipboard(data.about, 'about_card')}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-normal"
              >
                <Copy className="w-3 h-3" /> Copy Text
              </button>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {data.about}
            </p>
          </div>

          {/* Key Skills Endorsements Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Skills & Endorsements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.keySkills.map((skill, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{skill}</span>
                  <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                    99+ Endorsements
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Post Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Featured Post Preview</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3">
              <p className="leading-relaxed">{data.featuredPost}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                <span className="flex items-center gap-1 text-blue-400 font-bold">
                  <ThumbsUp className="w-3.5 h-3.5" /> 142 Likes
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> 38 Comments
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
