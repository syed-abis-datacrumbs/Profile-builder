'use client';

import React from 'react';
import { 
  ArrowLeft, 
  PenSquare, 
  Mail, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Award, 
  FolderGit2, 
  CheckCircle2, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { LinkedinIcon, GithubIcon } from './icons';
import { LmsResumeSample } from '../lib/resumeSamples';

interface ResumeTemplatePreviewProps {
  sample: LmsResumeSample;
  accentColor?: string;
  onBack: () => void;
  onEdit: () => void;
}

export const ResumeTemplatePreview: React.FC<ResumeTemplatePreviewProps> = ({
  sample,
  accentColor = '#1e3a8a',
  onBack,
  onEdit
}) => {
  const d = sample.data || {};
  const personal = d.personalInfo || {};
  const experiences = d.workExperience || [];
  const education = d.education || [];
  const projects = d.projects || [];
  const certifications = d.certifications || [];
  const skills = d.additional?.skills ? d.additional.skills.split(',').map((s: string) => s.trim()) : [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-12 font-sans">
      
      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-3.5 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to templates</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Preset: <strong className="text-slate-800">{sample.label}</strong></span>
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-mono">
              98% ATS Match
            </span>
          </div>

          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full px-5 py-2 transition-all shadow-sm cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Use Template</span>
          </button>
        </div>
      </div>

      {/* ── Paper Resume Visual Preview ── */}
      <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-12 shadow-2xl text-slate-800 space-y-8 relative overflow-hidden">
        
        {/* Top Header Section */}
        <div className="border-b border-slate-200 pb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ color: accentColor }}>
                {personal.fullName || "Candidate Name"}
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-0.5">
                {sample.label.split('(')[0]} Professional
              </p>
            </div>

            {/* ATS Score Indicator */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-700">ATS Score Ready</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">98/100</span>
            </div>
          </div>

          {/* Contact Details Bar */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 pt-1 font-medium">
            {personal.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {personal.email}
              </span>
            )}
            {personal.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {personal.phone}
              </span>
            )}
            {personal.linkedin && (
              <span className="flex items-center gap-1 text-blue-600">
                <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn Profile
              </span>
            )}
            {personal.github && (
              <span className="flex items-center gap-1 text-slate-800">
                <GithubIcon className="w-3.5 h-3.5" /> {personal.githubLabel || "GitHub"}
              </span>
            )}
          </div>
        </div>

        {/* 1. Professional Experience Section */}
        {experiences.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2 border-b border-slate-100 pb-2">
              <Briefcase className="w-4 h-4" style={{ color: accentColor }} />
              <span>Work Experience</span>
            </h2>

            <div className="space-y-6">
              {experiences.map((exp: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{exp.title}</h3>
                      <p className="text-xs font-semibold text-slate-700">{exp.company}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
                      {exp.start} – {exp.end}
                    </span>
                  </div>

                  {exp.bullets && (
                    <ul className="space-y-1.5 text-xs text-slate-700 pl-4 list-disc marker:text-slate-400 leading-relaxed">
                      {exp.bullets.split('\n').filter(Boolean).map((b: string, i: number) => (
                        <li key={i}>{b.replace(/\*\*/g, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Key Skills Section */}
        {skills.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCheck className="w-4 h-4" style={{ color: accentColor }} />
              <span>Technical & Core Skills</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-800 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 3. Featured Projects */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2 border-b border-slate-100 pb-2">
              <FolderGit2 className="w-4 h-4" style={{ color: accentColor }} />
              <span>Key Projects</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((proj: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{proj.title}</h3>
                    {proj.technologies && (
                      <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {proj.technologies}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {proj.description.replace(/\*\*/g, '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Education & Certifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {education.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2 border-b border-slate-100 pb-2">
                <GraduationCap className="w-4 h-4" style={{ color: accentColor }} />
                <span>Education</span>
              </h2>

              <div className="space-y-3 text-xs">
                {education.map((edu: any, idx: number) => (
                  <div key={idx}>
                    <h3 className="font-bold text-slate-900">{edu.institution}</h3>
                    <p className="text-slate-600">{edu.degree}</p>
                    <span className="text-[11px] font-mono text-slate-400">{edu.start} – {edu.end}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2 border-b border-slate-100 pb-2">
                <Award className="w-4 h-4" style={{ color: accentColor }} />
                <span>Certifications</span>
              </h2>

              <div className="space-y-2 text-xs">
                {certifications.map((cert: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">{cert.name}</span>
                      <span className="text-slate-500"> ({cert.organization})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Load this structured ATS resume into the AI Studio to customize with your own experience.
          </div>
          <button
            onClick={onEdit}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-2.5 transition-all shadow-md cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Use This Template & Open Editor</span>
          </button>
        </div>

      </div>

    </div>
  );
};
