'use client';

import React from 'react';
import { ArrowLeft, SquarePen } from 'lucide-react';
import { GithubTemplateCard } from './GithubLandingView';
import { GITHUB_ROLE_PRESETS } from '../lib/githubRolePresets';
import { applyRolePresetToGithub } from '../lib/githubRolePresets';
import { defaultGithubData } from '../lib/defaultData';
import { GithubReadmePreview } from './GithubReadmePreview';

interface GithubTemplatePreviewProps {
  template: GithubTemplateCard;
  onBack: () => void;
  onEdit: () => void;
}

export const GithubTemplatePreview: React.FC<GithubTemplatePreviewProps> = ({
  template,
  onBack,
  onEdit
}) => {
  const preset = GITHUB_ROLE_PRESETS.find((p) => p.id === template.presetId) || GITHUB_ROLE_PRESETS[0];
  
  // Generate the mockup data just for this preview overlay
  let mockupData = applyRolePresetToGithub(defaultGithubData, preset);
  mockupData.theme = template.theme;
  // Apply visual theme aspects
  mockupData.customSections = mockupData.customSections.map((s) => ({ ...s, content: s.content.replace(/\*\*/g, '') }));

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center p-4 sm:p-6 font-sans">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onBack} />

      <div className="relative w-full max-w-[820px] flex flex-col min-h-0 h-full max-h-[92vh]">
        {/* Top toolbar */}
        <div className="shrink-0 bg-white rounded-2xl shadow-xl px-4 sm:px-5 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to templates</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-sm text-slate-500 hidden sm:inline">
              Template: <span className="font-bold text-slate-900">{template.name}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 uppercase tracking-wider">
              {template.theme}
            </span>
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              <SquarePen className="w-3.5 h-3.5" />
              <span>Use Template</span>
            </button>
          </div>
        </div>

        {/* README panel */}
        <div className="flex-1 min-h-0 overflow-y-auto w-full pt-4">
          <GithubReadmePreview github={mockupData} editable={false} />
        </div>
      </div>
    </div>
  );
};
