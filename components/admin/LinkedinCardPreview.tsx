'use client';

import React from 'react';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  FolderGit2, 
  ExternalLink, 
  Building2, 
  Sparkles, 
  ThumbsUp, 
  MessageSquare, 
  Share2,
  Send
} from 'lucide-react';
import { LinkedinIcon } from '@/components/icons';
import type { NormalizedLinkedinProfile } from '@/lib/admin/previewNormalizers';

interface Props {
  profile: NormalizedLinkedinProfile;
}

export function LinkedinCardPreview({ profile }: Props) {
  const initials = (profile.fullName || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 text-slate-900 select-text font-sans">
      {/* 1. Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative overflow-hidden">
          {profile.customCoverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.customCoverUrl} alt="Cover Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
          )}
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar Row */}
          <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
            <div className="relative">
              {profile.headshotUrl && profile.headshotUrl !== '/images/linkedin-templates/pfp/sample-headshot.png' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.headshotUrl}
                  alt={profile.fullName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl font-extrabold text-white bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600">
                  {initials || 'IN'}
                </div>
              )}

              {profile.openToWork && (
                <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md border-2 border-white">
                  #OpenToWork
                </div>
              )}
            </div>

            {/* Quick Action Badges (Display Only) */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                <LinkedinIcon className="w-3.5 h-3.5" />
                Preview Mode
              </span>
            </div>
          </div>

          {/* Name & Headline */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {profile.fullName || 'Unnamed Professional'}
              </h1>
            </div>

            {profile.headline && (
              <p className="text-sm sm:text-base text-slate-700 leading-snug font-medium max-w-2xl">
                {profile.headline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 pt-1">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profile.location}
                </span>
              )}
              {profile.currentCompany && (
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {profile.currentCompany}
                </span>
              )}
              {profile.school && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {profile.school}
                </span>
              )}
              {profile.followersCount && (
                <span className="text-blue-600 font-semibold">{profile.followersCount} followers</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. About Section */}
      {profile.about && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
          <h2 className="text-base font-bold text-slate-900">About</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {profile.about}
          </p>
        </div>
      )}

      {/* 3. Featured Post (if generated) */}
      {profile.featuredPost && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Featured Launch Post
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Generated by AI</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {profile.featuredPost}
          </div>

          <div className="flex items-center gap-4 pt-1 text-slate-400 text-xs border-t border-slate-100">
            <span className="flex items-center gap-1 hover:text-slate-600 cursor-default">
              <ThumbsUp className="w-3.5 h-3.5" /> Like
            </span>
            <span className="flex items-center gap-1 hover:text-slate-600 cursor-default">
              <MessageSquare className="w-3.5 h-3.5" /> Comment
            </span>
            <span className="flex items-center gap-1 hover:text-slate-600 cursor-default">
              <Share2 className="w-3.5 h-3.5" /> Repost
            </span>
            <span className="flex items-center gap-1 hover:text-slate-600 cursor-default ml-auto">
              <Send className="w-3.5 h-3.5" /> Send
            </span>
          </div>
        </div>
      )}

      {/* 4. Experience Section */}
      {profile.experience && profile.experience.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            Experience
          </h2>

          <div className="divide-y divide-slate-100 space-y-3">
            {profile.experience.map((exp, i) => (
              <div key={i} className={`space-y-1.5 ${i > 0 ? 'pt-3' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{exp.title}</h3>
                    <p className="text-xs font-semibold text-slate-700">{exp.company}</p>
                  </div>
                  {(exp.start || exp.end) && (
                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                      {exp.start} {exp.start && exp.end ? '–' : ''} {exp.end}
                    </span>
                  )}
                </div>

                {exp.description && (
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {exp.description}
                  </p>
                )}

                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-600 pl-1">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Projects Section */}
      {profile.projects && profile.projects.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
            Projects
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {profile.projects.map((proj, i) => (
              <div key={i} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{proj.title}</span>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {proj.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Education Section */}
      {profile.education && profile.education.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            Education
          </h2>

          <div className="divide-y divide-slate-100 space-y-3">
            {profile.education.map((edu, i) => (
              <div key={i} className={`space-y-0.5 ${i > 0 ? 'pt-3' : ''}`}>
                <div className="flex items-start justify-between">
                  <h3 className="text-xs font-bold text-slate-900">{edu.school}</h3>
                  {(edu.start || edu.end) && (
                    <span className="text-[11px] text-slate-400">
                      {edu.start} {edu.start && edu.end ? '–' : ''} {edu.end}
                    </span>
                  )}
                </div>
                {(edu.degree || edu.fieldOfStudy) && (
                  <p className="text-xs text-slate-600">
                    {edu.degree} {edu.degree && edu.fieldOfStudy ? '·' : ''} {edu.fieldOfStudy}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Skills & Certifications */}
      {((profile.skills && profile.skills.length > 0) || (profile.certifications && profile.certifications.length > 0)) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.certifications && profile.certifications.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Certifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {profile.certifications.map((cert, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                    <p className="font-bold text-slate-900">{cert.name}</p>
                    {cert.organization && <p className="text-slate-500">{cert.organization}</p>}
                    {cert.date && <p className="text-[10px] text-slate-400">{cert.date}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
