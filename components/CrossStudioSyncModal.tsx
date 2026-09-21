'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Check, ArrowRight, Sparkles, Briefcase, FileText } from 'lucide-react';
import { GithubIcon } from './icons';
import { CvData } from '../lib/cvTypes';
import { useWorkspace } from '../context/WorkspaceContext';
import { toast } from '../lib/toast';
import { LinkedinRichProfile, buildEmptyRichProfile } from '../lib/linkedinRichProfile';
import { GithubProfileData } from '../types';

interface CrossStudioSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: CvData | null;
}

export function CrossStudioSyncModal({ isOpen, onClose, cv }: CrossStudioSyncModalProps) {
  const {
    githubData,
    setGithubData,
    linkedinData,
    setLinkedinData,
  } = useWorkspace();

  const [syncHeadline, setSyncHeadline] = useState(true);
  const [syncExperience, setSyncExperience] = useState(true);
  const [syncProjects, setSyncProjects] = useState(true);
  const [syncSkills, setSyncSkills] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen || !cv) return null;

  // Extract skills
  const parsedSkills = (cv.additional?.skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Suggested headline
  const topRole = cv.workExperience?.[0]?.title || 'Software Engineer';
  const topSkillsSummary = parsedSkills.slice(0, 3).join(', ');
  const suggestedHeadline = topSkillsSummary
    ? `${topRole} | ${topSkillsSummary} | Driving High-Impact Solutions`
    : `${topRole} | Building Scalable Modern Systems`;

  const handleApplySync = () => {
    setIsApplying(true);

    try {
      // 1. Sync to LinkedIn
      if (syncHeadline || syncExperience || syncSkills) {
        setLinkedinData((prev) => ({
          ...prev,
          headline: syncHeadline ? suggestedHeadline : prev.headline,
          about: cv.summary || prev.about,
          keySkills: syncSkills ? parsedSkills.slice(0, 15) : prev.keySkills,
          targetRole: cv.workExperience?.[0]?.title || prev.targetRole,
        }));

        // Comprehensive sync to linkedinRichProfile in localStorage
        try {
          const savedRich = localStorage.getItem('profile_builder_linkedin_profile');
          const rich: LinkedinRichProfile = savedRich ? JSON.parse(savedRich) : buildEmptyRichProfile();

          if (cv.personalInfo?.fullName) rich.fullName = cv.personalInfo.fullName;
          if (syncHeadline) rich.headline = suggestedHeadline;
          if (cv.workExperience?.[0]?.title) rich.title = cv.workExperience[0].title;
          if (cv.workExperience?.[0]?.company) rich.currentCompany = cv.workExperience[0].company;
          if (cv.workExperience?.[0]?.location) rich.location = cv.workExperience[0].location;
          if (cv.education?.[0]?.institution) rich.school = cv.education[0].institution;
          if (cv.summary) rich.about = cv.summary;

          if (syncSkills) {
            rich.skills = Array.from(new Set([...(rich.skills || []), ...parsedSkills])).slice(0, 15);
          }

          if (syncExperience && cv.workExperience?.length) {
            rich.experience = cv.workExperience.map((we) => ({
              title: we.title,
              company: we.company,
              start: we.start,
              end: we.end,
              description: we.bullets
                ? we.bullets
                    .replace(/^[•\-\*]\s*/gm, '')
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .trim()
                : '',
            }));
          }

          if (cv.education?.length) {
            rich.education = cv.education.map((ed) => ({
              school: ed.institution,
              degree: ed.degree,
              fieldOfStudy: '',
              start: ed.start,
              end: ed.end,
            }));
          }

          if (cv.certifications?.length) {
            rich.certifications = cv.certifications.map((c) => ({
              name: c.name,
              organization: c.organization,
              date: '',
            }));
          }

          localStorage.setItem('profile_builder_linkedin_profile', JSON.stringify(rich));
          localStorage.setItem('profile_builder_linkedin_mode', 'studio');
        } catch (e) {
          console.error('[Sync Rich Profile Error]:', e);
        }
      }

      // 2. Sync to GitHub
      if (syncProjects || syncSkills || syncExperience) {
        setGithubData((prev) => {
          const updatedTech = syncSkills
            ? Array.from(new Set([...(prev.techStack || []), ...parsedSkills])).slice(0, 15)
            : prev.techStack;

          let updatedCustomSections = [...(prev.customSections || [])];

          // 2a. Sync Featured Projects
          if (syncProjects && cv.projects?.length) {
            const projectsMd = cv.projects
              .map((p) => {
                const cleanContent = p.content.replace(/<[^>]*>/g, '').trim();
                const linkMd = p.link ? ` | [Live Link](${p.link})` : '';
                return `### ${cleanContent}${linkMd}\n`;
              })
              .join('\n');

            const sectionIndex = updatedCustomSections.findIndex((s) =>
              /featured\s*projects|projects/i.test(s.title)
            );
            if (sectionIndex >= 0) {
              updatedCustomSections[sectionIndex].content = projectsMd;
            } else {
              updatedCustomSections.push({
                title: '🚀 Featured Projects',
                content: projectsMd,
              });
            }
          }

          // 2b. Sync Work Experience
          if (syncExperience && cv.workExperience?.length) {
            const expMd = cv.workExperience
              .map((w) => {
                const cleanBullets = w.bullets
                  ? w.bullets
                      .split('\n')
                      .map((b) => b.trim())
                      .filter(Boolean)
                      .map((b) => `- ${b.replace(/^[•\-\*]\s*/, '')}`)
                      .join('\n')
                  : '';
                return `### ${w.title} @ ${w.company} (${w.start} - ${w.end})\n${cleanBullets}\n`;
              })
              .join('\n');

            const expIndex = updatedCustomSections.findIndex((s) =>
              /experience|career/i.test(s.title)
            );
            if (expIndex >= 0) {
              updatedCustomSections[expIndex].content = expMd;
            } else {
              updatedCustomSections.push({
                title: '💼 Experience Highlights',
                content: expMd,
              });
            }
          }

          const updated: GithubProfileData = {
            ...prev,
            name: cv.personalInfo?.fullName || prev.name,
            title: cv.workExperience?.[0]?.title
              ? `🚀 ${cv.workExperience[0].title} | Open Source & Full Stack Builder`
              : prev.title,
            about: cv.summary || prev.about,
            techStack: updatedTech,
            customSections: updatedCustomSections,
          };

          try {
            localStorage.setItem('profile_builder_github_data', JSON.stringify(updated));
            localStorage.setItem('profile_builder_github_mode', 'studio');
          } catch {}

          return updated;
        });
      }

      toast.success('Synced Master Profile to LinkedIn & GitHub!');
      onClose();
    } catch (err: any) {
      console.error('[Sync Error]:', err);
      toast.error('Failed to apply sync.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Sync to LinkedIn & GitHub</h3>
                <p className="text-xs text-slate-500">
                  Propagate your active resume improvements into other career studios
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sync Options Checklist */}
          <div className="py-5 space-y-3 text-xs">
            {/* LinkedIn Headline */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncHeadline}
                onChange={(e) => setSyncHeadline(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <div className="flex-1 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-blue-600 font-bold">in</span>
                  <span>Update LinkedIn Headline</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Generates a punchy headline: &ldquo;{suggestedHeadline}&rdquo;
                </p>
              </div>
            </label>

            {/* LinkedIn Experience */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncExperience}
                onChange={(e) => setSyncExperience(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <div className="flex-1 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sync {cv.workExperience?.length || 0} Work Roles to LinkedIn Experience</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Imports latest company names, job titles, and metric bullet points.
                </p>
              </div>
            </label>

            {/* GitHub Projects */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncProjects}
                onChange={(e) => setSyncProjects(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500"
              />
              <div className="flex-1 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <GithubIcon className="w-3.5 h-3.5 fill-current text-purple-600" />
                  <span>Sync {cv.projects?.length || 0} Projects to GitHub README Showcase</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Formats resume projects into markdown cards for your developer profile.
                </p>
              </div>
            </label>

            {/* Skills & Badges */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncSkills}
                onChange={(e) => setSyncSkills(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <div className="flex-1 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sync Technical Skills ({parsedSkills.length} skills)</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Updates GitHub tech stack badges and LinkedIn pinned endorsements.
                </p>
              </div>
            </label>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApplySync}
              disabled={isApplying || (!syncHeadline && !syncExperience && !syncProjects && !syncSkills)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isApplying ? 'animate-spin' : ''}`} />
              <span>{isApplying ? 'Applying Sync...' : 'Apply Sync'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
