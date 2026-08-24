'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  PenSquare,
  Award,
  FolderGit2,
  ExternalLink,
  Plus,
  MessageSquare,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';
import { linkedinCovers, getDefaultPfpGradientId } from '../lib/linkedinCovers';
import { linkedinTemplateSamples, LinkedinTemplateSample, LinkedinTemplateFeaturedItem } from '../lib/linkedinTemplateSamples';
import { COVER_ART, CoverArtField, getCoverArtId, computeFitScale, coverFontSize } from '../lib/linkedinCoverArt';
import { ShrinkToFitCoverText } from './ShrinkToFitCoverText';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface LinkedinTemplatePreviewProps {
  templateId: string;
  onBack: () => void;
  onEdit: () => void;
}

/** px is tuned against the LMS's 1584px-wide canvas — cqw keeps it
 *  proportional to the cover's actual rendered width at any screen size. */
const cqw = (px: number, canvasWidthPx: number) => `${((px / canvasWidthPx) * 100).toFixed(3)}cqw`;

function resolveFieldValue(field: CoverArtField, sample: LinkedinTemplateSample): string | string[] {
  if (field.defaultFrom === 'fullName') return sample.fullName;
  if (field.defaultFrom === 'currentPosition') return sample.title;
  if (field.defaultFrom === 'currentCompany') return sample.currentCompany;
  return field.placeholder;
}

// Default thumbnails for featured section and media attachments
const DUMMY_THUMBNAILS = [
  '/images/linkedin-templates/thumbnails/First.PNG',
  '/images/linkedin-templates/thumbnails/Second.png',
  '/images/linkedin-templates/thumbnails/third.png',
  '/images/linkedin-templates/thumbnails/fourth.png',
  '/images/linkedin-templates/thumbnails/fifth.png',
  '/images/linkedin-templates/thumbnails/sixth.png',
];

export const LinkedinTemplatePreview: React.FC<LinkedinTemplatePreviewProps> = ({ templateId, onBack, onEdit }) => {
  const coverIndex = linkedinCovers.findIndex((c) => c.id === templateId);
  const validIndex = Math.max(0, coverIndex);
  const template = linkedinCovers[validIndex];
  const sample = linkedinTemplateSamples[template.id] ?? linkedinTemplateSamples[linkedinCovers[0].id];

  const art = COVER_ART[template.id] ?? COVER_ART[getCoverArtId(validIndex)];
  const gradientId = getDefaultPfpGradientId(validIndex);

  // Featured items using user-provided featured thumbnails
  const featuredItems: LinkedinTemplateFeaturedItem[] = [
    {
      type: 'Post • 1,240 reactions',
      title: `Key Architecture Patterns for ${sample.title}`,
      description: `Deep dive into modern software engineering, scalable design principles, and deployment strategies for ${sample.title} roles.`,
      image: '/images/featured-thumbnail/featured thumbnail 1.png',
    },
    {
      type: 'Article',
      title: `Building End-to-End Solutions with ${sample.skills[0] || 'Modern Tech'}`,
      description: `A comprehensive guide to building, optimizing, and deploying high-performance applications in production.`,
      image: '/images/featured-thumbnail/featured thumbnail 2.png',
    },
    {
      type: 'Link',
      title: `${sample.title} Portfolio & Open Source Case Studies`,
      description: `Production repositories, benchmark results, and system design documentation.`,
      image: '/images/featured-thumbnail/featured thumbnail 3.png',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`fixed inset-0 z-50 flex flex-col items-center p-4 sm:p-6 ${inter.className}`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onBack}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[820px] flex flex-col min-h-0 h-full max-h-[92vh]"
      >
        {/* ── Top Navigation Bar ── */}
        <div className="shrink-0 bg-white rounded-2xl shadow-xl px-4 sm:px-5 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-3 relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to templates</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-sm text-slate-500 hidden md:inline-block truncate">
              Template: <span className="font-bold text-slate-900">{template.name}</span>
            </span>
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0A66C2] hover:bg-[#0958A8] text-white text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Use Template</span>
            </button>
          </div>
        </div>

        {/* ── LinkedIn Panel ── */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-12 w-full max-w-[820px] mx-auto hide-scrollbar">
          {/* ── CARD 1: Profile Header ── */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Cover banner */}
            <div
              className="relative w-full bg-slate-900 overflow-hidden"
              style={{ aspectRatio: '1584/396', containerType: 'inline-size' } as React.CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={art.backgroundUrl} alt={`${template.name} cover`} className="absolute inset-0 w-full h-full object-cover" />

              {art.fields && art.fields.map((field) => {
                const value = resolveFieldValue(field, sample);
                const align = field.geometry.align;
                const left = field.geometry.xPct;

                if (field.kind === 'pills') {
                  const pills = Array.isArray(value) ? value : [value];
                  return (
                    <div
                      key={field.id}
                      style={{
                        position: 'absolute',
                        top: `${field.geometry.yPct * 100}%`,
                        left: `${left * 100}%`,
                        width: `${field.geometry.maxWidthPct * 100}%`,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: cqw(field.geometry.pillGapPx ?? 12, art.canvasWidthPx),
                        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {pills.map((p, i) => {
                        const scale = computeFitScale(p.length, field.pillMaxLengths?.[i] ?? 32);
                        const chipFontSize = field.geometry.fontSizePx * scale;
                        return (
                          <span
                            key={i}
                            style={{
                              color: field.geometry.color,
                              fontWeight: field.geometry.fontWeight,
                              fontFamily: field.geometry.fontFamily,
                              fontSize: coverFontSize(chipFontSize, art.canvasWidthPx),
                              background: field.geometry.pillBg ?? 'rgba(0,0,0,0.35)',
                              borderRadius: 9999,
                              padding: '0.45em 0.9em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p}
                          </span>
                        );
                      })}
                    </div>
                  );
                }

                const text = Array.isArray(value) ? value.join('\n') : value;
                return (
                  <div
                    key={field.id}
                    style={{
                      position: 'absolute',
                      top: `${field.geometry.yPct * 100}%`,
                      left: `${left * 100}%`,
                      width: `${field.geometry.maxWidthPct * 100}%`,
                    }}
                  >
                    {field.staticLabel && (
                      <div
                        style={{
                          fontSize: coverFontSize(field.staticLabelFontSizePx ?? field.geometry.fontSizePx * 0.65, art.canvasWidthPx),
                          fontFamily: field.staticLabelFontFamily,
                          fontWeight: 600,
                          color: field.geometry.color,
                          opacity: 0.85,
                          marginBottom: '0.15em',
                        }}
                      >
                        {field.staticLabel}
                      </div>
                    )}
                    <ShrinkToFitCoverText
                      text={text}
                      maxLength={field.maxLength}
                      maxLines={field.geometry.maxLines}
                      fontSizePx={field.geometry.fontSizePx}
                      lineHeightPx={field.geometry.lineHeightPx}
                      canvasWidthPx={art.canvasWidthPx}
                      color={field.geometry.color}
                      fontWeight={field.geometry.fontWeight}
                      fontFamily={field.geometry.fontFamily}
                      textAlign={align}
                    />
                  </div>
                );
              })}
            </div>

            {/* Profile Card Body */}
            <div className="px-6 pb-6 pt-0">
              {/* Avatar row */}
              <div className="flex items-start justify-between">
                <div className="-mt-14 sm:-mt-20 w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-full border-[4px] border-white overflow-hidden relative bg-slate-200 shadow-md shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/linkedin-templates/pfp/${gradientId}/background.jpg`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/linkedin-templates/pfp/sample-headshot.png"
                    alt={sample.fullName}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Main Info Row (Side-by-side: Name/Headline left, Company/School right) */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mt-3">
                {/* LEFT COLUMN: Name, headline, location, connection, actions */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-[24px] font-bold text-[#191919] leading-tight tracking-tight">{sample.fullName}</h1>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/featured-thumbnail/verified badge image.png" alt="Verified" className="w-[25px] h-[25px] object-contain shrink-0" />
                    <span className="text-[13px] text-slate-500 font-normal">· 2nd</span>
                  </div>

                  <p className="text-[15px] font-normal text-[#191919] mt-1 leading-snug">{sample.headline}</p>

                  <div className="text-[13px] text-slate-500 mt-2 flex flex-wrap items-center gap-x-1.5">
                    <span>{sample.location}</span>
                    <span>·</span>
                    <span className="text-[#0A66C2] font-semibold hover:underline cursor-pointer">Contact info</span>
                  </div>

                  <p className="text-[13px] text-[#0A66C2] font-semibold mt-1 hover:underline cursor-pointer">500+ connections</p>

                  {/* Mutual connections */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <div className="flex -space-x-2 overflow-hidden">
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-300 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/featured-thumbnail/mutual connection.png" alt="Dileep" className="h-full w-full object-cover" />
                      </div>
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-300 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/featured-thumbnail/mutual connection 2.png" alt="Mutual Connection" className="h-full w-full object-cover" />
                      </div>
                    </div>
                    <span className="text-[12px] text-slate-600 font-normal">
                      <strong className="font-semibold text-slate-800">Dileep</strong> and 1 other mutual connection
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {/* Kept on a single row — see the matching note in
                      LinkedinChatStudio; the overflow button must not wrap. */}
                  <div className="flex items-center gap-2 mt-4">
                    <button className="bg-[#0A66C2] hover:bg-[#084e96] text-white font-semibold text-sm px-3.5 sm:px-5 py-1.5 rounded-full flex items-center gap-1.5 transition shadow-2xs shrink-0 whitespace-nowrap">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      Connect
                    </button>
                    <button className="border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50/60 font-semibold text-sm px-3.5 sm:px-5 py-1.5 rounded-full flex items-center gap-1.5 transition shrink-0 whitespace-nowrap">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    <button className="border border-slate-500 text-slate-700 hover:bg-slate-100 w-9 h-9 rounded-full flex items-center justify-center transition shrink-0">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Company & School badges — desktop only, matching
                    real LinkedIn, which drops these from the mobile header and
                    shows them in the Experience/Education sections instead. */}
                <div className="hidden sm:flex flex-col gap-3 shrink-0 pt-1">
                  <div className="flex items-center gap-2.5 group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/featured-thumbnail/company logo.jfif" alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[13px] font-semibold text-[#191919] group-hover:text-[#0A66C2] group-hover:underline leading-tight max-w-[190px]">
                      {sample.currentCompany}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/featured-thumbnail/education logo.jpg" alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[13px] font-semibold text-[#191919] group-hover:text-[#0A66C2] group-hover:underline leading-tight max-w-[190px]">
                      {sample.education[0]?.school || sample.school}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: About ── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[18px] font-bold text-[#191919] mb-2.5">About</h2>
            <p className="text-[14px] text-slate-800 leading-[1.6] whitespace-pre-line">{sample.about}</p>
          </div>

          {/* ── CARD 3: Featured ── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-[#191919]">Featured</h2>
            </div>
            {/* Mobile: horizontal snap carousel matching LinkedIn's app — see the
                matching block in LinkedinChatStudio for the layout rationale. */}
            <div className="flex snap-x snap-mandatory overflow-x-auto gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item, idx) => (
                <div
                  key={idx}
                  className="snap-start shrink-0 w-[85%] sm:w-auto border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs hover:shadow-md transition flex flex-col group cursor-pointer"
                >
                  <div className="h-[135px] w-full relative overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[12px] text-slate-500 font-medium">{item.type}</span>
                      <h3 className="text-[14px] font-semibold text-[#191919] leading-snug line-clamp-2 mt-1 group-hover:text-[#0A66C2]">
                        {item.title}
                      </h3>
                      <p className="text-[12px] text-slate-600 line-clamp-2 mt-1.5 leading-normal">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CARD 4: Experience ── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[18px] font-bold text-[#191919] mb-5">Experience</h2>
            <div className="space-y-6">
              {sample.experience.map((exp, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/featured-thumbnail/company logo.jfif" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-semibold text-[#191919] leading-tight">{exp.title}</h3>
                    <p className="text-[14px] font-medium text-slate-800 mt-0.5">{exp.company}</p>
                    <p className="text-[13px] text-slate-500 mt-0.5">{exp.start} – {exp.end}</p>
                    <ul className="mt-2.5 space-y-1.5 text-[13px] text-slate-700 leading-relaxed list-disc list-outside marker:text-slate-400 pl-4">
                      {exp.description.split('\n').filter(Boolean).map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CARD 5: Education ── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[18px] font-bold text-[#191919] mb-5">Education</h2>
            <div className="space-y-6">
              {sample.education.map((edu, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/featured-thumbnail/education logo.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-semibold text-[#191919] leading-tight">{edu.school}</h3>
                    <p className="text-[14px] font-medium text-slate-800 mt-0.5">{edu.degree} · {edu.fieldOfStudy}</p>
                    <p className="text-[13px] text-slate-500 mt-0.5">{edu.start} – {edu.end}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CARD 6: Licenses & Certifications ── */}
          {sample.certifications.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#191919] mb-5">Licenses &amp; Certifications</h2>
              <div className="space-y-6">
                {sample.certifications.map((cert, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={idx % 2 === 0 ? '/images/featured-thumbnail/certificate logo.png' : '/images/featured-thumbnail/certificate logo 2.png'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-semibold text-[#191919] leading-tight">{cert.name}</h3>
                      <p className="text-[14px] font-medium text-slate-800 mt-0.5">{cert.organization}</p>
                      <p className="text-[13px] text-slate-500 mt-0.5">Issued {cert.date}</p>
                      <button className="inline-flex items-center gap-1.5 border border-slate-400 text-slate-700 font-semibold text-[13px] px-4 py-1.5 rounded-full mt-3 hover:bg-slate-50 transition">
                        Show credential
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CARD 7: Projects ── */}
          {sample.projects.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#191919] mb-5">Projects</h2>
              <div className="space-y-6">
                {sample.projects.map((proj, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <FolderGit2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-semibold text-[#191919] leading-tight">{proj.title}</h3>
                      <p className="text-[14px] text-slate-700 mt-1 leading-relaxed">{proj.description}</p>

                      {/* Attached Project Media Thumbnail Card */}
                      <div className="mt-3.5 border border-slate-200 rounded-xl p-2.5 bg-slate-50/80 hover:bg-slate-100/80 transition flex items-center gap-3 max-w-md cursor-pointer group">
                        <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/images/featured-thumbnail/project thumbnail.png" alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[#191919] group-hover:text-[#0A66C2] line-clamp-1">
                            {proj.title} Demo &amp; Code Repo
                          </p>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <ExternalLink className="w-3 h-3" /> github.com / live app
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CARD 8: Skills ── */}
          {sample.skills.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#191919] mb-4">Skills</h2>
              <div className="space-y-4 divide-y divide-slate-100">
                {sample.skills.slice(0, 4).map((skill, idx) => (
                  <div key={idx} className={idx > 0 ? 'pt-3' : ''}>
                    <h3 className="text-[15px] font-semibold text-[#191919]">{skill}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                        DC
                      </div>
                      <span className="text-[13px] text-slate-600">Endorsed by colleagues at {sample.currentCompany}</span>
                    </div>
                  </div>
                ))}
              </div>
              {sample.skills.length > 4 && (
                <div className="border-t border-slate-100 pt-4 mt-5 text-center">
                  <button className="text-[14px] font-semibold text-[#0A66C2] hover:underline flex items-center justify-center gap-1 w-full">
                    Show all {sample.skills.length} skills
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── CARD 9: Honors & Awards ── */}
          {sample.awards.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#191919] mb-5">Honors &amp; Awards</h2>
              <div className="space-y-5">
                {sample.awards.map((award, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-semibold text-[#191919] leading-tight">{award.title}</h3>
                      <p className="text-[13px] text-slate-600 mt-0.5">{award.issuer} · Issued {award.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 pt-2">
            This is a preview with sample content for the &quot;{template.name}&quot; template — click Edit to personalize it with your own details.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
