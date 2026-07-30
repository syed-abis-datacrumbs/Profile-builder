'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Inter } from 'next/font/google';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Loader2,
  MapPin,
  FolderGit2,
  ExternalLink,
  Plus,
  MessageSquare,
  MoreHorizontal,
  ChevronRight,
  Award,
  Image as ImageIcon,
  Palette,
  Camera,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  LinkedinRichProfile,
  COVER_ART,
  COVER_ART_ORDER,
  PFP_GRADIENT_IDS,
  buildCoverFieldValues,
} from '../lib/linkedinRichProfile';
import { CoverArtField, computeFitScale, OVERAGE_ALLOWANCE_CHARS } from '../lib/linkedinCoverArt';
import { PfpCropModal } from './PfpCropModal';
import { ShrinkToFitCoverText } from './ShrinkToFitCoverText';
import { LinkedinTemplateSampleExperience, LinkedinTemplateSampleEducation, LinkedinTemplateSampleCertification, LinkedinTemplateSampleProject } from '../lib/linkedinTemplateSamples';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

/** Inline plain-text edit. Commits on blur. Same pattern/behavior everywhere
 *  in this studio so any piece of copy from the preview can be clicked and
 *  typed into directly. */
function Edit({
  value,
  onCommit,
  className,
  placeholder,
  block,
}: {
  value: string;
  onCommit: (v: string) => void;
  className?: string;
  placeholder?: string;
  block?: boolean;
}) {
  const Tag = (block ? 'div' : 'span') as 'div';
  return (
    <Tag
      key={value}
      contentEditable
      suppressContentEditableWarning
      data-ph={placeholder}
      className={`${className || ''} outline-none rounded hover:bg-blue-50/60 focus:bg-blue-50 cursor-text whitespace-pre-wrap empty:before:content-[attr(data-ph)] empty:before:text-slate-300`}
      onBlur={(e) => {
        const v = e.currentTarget.textContent ?? '';
        if (v !== value) onCommit(v);
      }}
    >
      {value}
    </Tag>
  );
}

const cqw = (px: number, canvasWidthPx: number) => `${((px / canvasWidthPx) * 100).toFixed(3)}cqw`;

const MAX_PILL_CHARS = 32;
const truncateText = (value: string, max: number | undefined) => {
  if (!max) return value;
  const ceiling = max + OVERAGE_ALLOWANCE_CHARS;
  if (value.length <= ceiling) return value;
  const cut = value.slice(0, ceiling);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 0 ? cut.slice(0, lastSpace).trimEnd() : cut;
};

function PickerOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-slate-800">{title}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const LinkedinChatStudio: React.FC<{
  profile: LinkedinRichProfile;
  onChange: (p: LinkedinRichProfile) => void;
  onBack: () => void;
}> = ({ profile, onChange, onBack }) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'Loaded your profile from the template. Click any text on the right to edit it directly, or ask me — e.g. "make my headline more keyword-rich", "add a bullet about leading a team", or "add Python to skills".',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showPfpPicker, setShowPfpPicker] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/linkedin-rich-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, profile }),
      });
      const data = await res.json();
      if (data.error) setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${data.error}` }]);
      else {
        if (data.profile) updateProfile(data.profile as LinkedinRichProfile);
        setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'Done.' }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (next: LinkedinRichProfile) => {
    const identityChanged =
      next.fullName !== profile.fullName || next.title !== profile.title || next.currentCompany !== profile.currentCompany;
    const art = COVER_ART[next.coverTemplateId];
    if (!identityChanged || !art) {
      onChange(next);
      return;
    }
    const resyncedCoverFieldValues = { ...next.coverFieldValues };
    for (const field of art.fields) {
      if (field.defaultFrom === 'fullName') resyncedCoverFieldValues[field.id] = next.fullName;
      else if (field.defaultFrom === 'currentPosition') resyncedCoverFieldValues[field.id] = next.title;
      else if (field.defaultFrom === 'currentCompany') resyncedCoverFieldValues[field.id] = next.currentCompany;
    }
    onChange({ ...next, coverFieldValues: resyncedCoverFieldValues });
  };

  const set = (patch: Partial<LinkedinRichProfile>) => updateProfile({ ...profile, ...patch });

  const setSkill = (i: number, v: string) => set({ skills: profile.skills.map((s, j) => (j === i ? v : s)) });

  const setExperience = (i: number, patch: Partial<LinkedinTemplateSampleExperience>) =>
    set({ experience: profile.experience.map((e, j) => (j === i ? { ...e, ...patch } : e)) });

  const setExperienceBullet = (expIdx: number, bulletIdx: number, v: string) => {
    const bullets = profile.experience[expIdx].description.split('\n').filter(Boolean);
    bullets[bulletIdx] = v;
    setExperience(expIdx, { description: bullets.join('\n') });
  };

  const setEducation = (i: number, patch: Partial<LinkedinTemplateSampleEducation>) =>
    set({ education: profile.education.map((e, j) => (j === i ? { ...e, ...patch } : e)) });

  const setCertification = (i: number, patch: Partial<LinkedinTemplateSampleCertification>) =>
    set({ certifications: profile.certifications.map((c, j) => (j === i ? { ...c, ...patch } : c)) });

  const setProject = (i: number, patch: Partial<LinkedinTemplateSampleProject>) =>
    set({ projects: profile.projects.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  const setCoverFieldValue = (fieldId: string, v: string | string[]) =>
    set({ coverFieldValues: { ...profile.coverFieldValues, [fieldId]: v } });

  const selectCoverTemplate = (id: string) => {
    set({ coverTemplateId: id, coverFieldValues: buildCoverFieldValues(id, profile) });
    setShowCoverPicker(false);
  };

  const selectPfpGradient = (id: string) => {
    set({ pfpGradientId: id });
    setShowPfpPicker(false);
  };

  const handleHeadshotFile = (file: File | null) => {
    if (!file) return;
    setCropSourceUrl(URL.createObjectURL(file));
  };

  const art = COVER_ART[profile.coverTemplateId];
  const primarySchool = profile.education[0]?.school ?? profile.school;

  const featuredItems = [
    {
      type: 'Post • 1,240 reactions',
      title: `Key Architecture Patterns for ${profile.title}`,
      description: `Deep dive into modern software engineering, scalable design principles, and deployment strategies for ${profile.title} roles.`,
      image: '/images/featured-thumbnail/featured thumbnail 1.png',
    },
    {
      type: 'Article',
      title: `Building End-to-End Solutions with ${profile.skills[0] || 'Modern Tech'}`,
      description: 'A comprehensive guide to building, optimizing, and deploying high-performance applications in production.',
      image: '/images/featured-thumbnail/featured thumbnail 2.png',
    },
    {
      type: 'Link',
      title: `${profile.title} Portfolio & Open Source Case Studies`,
      description: 'Production repositories, benchmark results, and system design documentation.',
      image: '/images/featured-thumbnail/featured thumbnail 3.png',
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-100 overflow-hidden font-sans border-0 rounded-none">
      {/* COLUMN 2 (AI CHAT - LEFT) */}
      <div className="w-full lg:w-[500px] xl:w-[560px] 2xl:w-[600px] flex flex-col bg-white border-r border-slate-200 shrink-0 h-full overflow-hidden">
        
        {/* Top Header of Chat Column */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-800 truncate">
              Optimizing LinkedIn Profile...
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold">
              Interface
            </span>
            <button
              onClick={() => setMessages([{ role: 'assistant', content: 'Started a new chat session. How can I optimize your LinkedIn profile?' }])}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              New chat
            </button>
          </div>
        </div>

        {/* Chat Scroll Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-white text-sm">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-2xl text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-slate-100 text-slate-900 border border-slate-200/80 px-4 py-3 max-w-[85%] font-medium'
                    : 'bg-white text-slate-800 p-4.5 max-w-[98%] border border-slate-200/60 shadow-2xs space-y-2'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl px-4 py-2.5 text-sm font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Generating AI profile updates…</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="shrink-0 p-3.5 bg-white border-t border-slate-200">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 focus-within:border-slate-400 focus-within:bg-white transition-all">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none font-normal"
            />

            {/* Bottom Bar inside Input Box */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <div className="flex items-center gap-1.5">
                <button type="button" className="w-6 h-6 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs">
                  +
                </button>
                <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[10px] font-semibold flex items-center gap-1 border border-slate-300/50">
                  <Check className="w-2.5 h-2.5 text-slate-500" />
                  <span>Auto</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-600 border border-slate-200">
                  Flash
                </span>
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-7 h-7 rounded-full bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 3 (LINKEDIN PREVIEW - RIGHT) */}
      <div className="flex-1 flex flex-col bg-slate-100/90 h-full overflow-hidden relative">
        
        {/* MacOS Window Top Header Bar */}
        <div className="shrink-0 bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            {/* MacOS Traffic Light Dots */}
            <div className="flex items-center gap-1.5 pr-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>

            {/* Tab Title */}
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200/80">
              <span className="w-3.5 h-3.5 rounded bg-[#0A66C2] text-white flex items-center justify-center text-[9px] font-bold">in</span>
              <span>LinkedIn Profile</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Live Profile Editor</span>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${inter.className}`}>
          <div className="w-full max-w-3xl mx-auto space-y-4">
            {/* ── CARD 1: Profile Header ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Cover banner */}
              <div
                className="relative w-full bg-slate-900 overflow-hidden group"
                style={{ aspectRatio: '1584/396', containerType: 'inline-size' } as React.CSSProperties}
              >
                {art && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={art.backgroundUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
                )}

                {art?.fields.map((field: CoverArtField) => {
                  const value = profile.coverFieldValues[field.id] ?? field.placeholder;
                  const align = field.geometry.align;
                  // xPct is always the box's LEFT edge, for every alignment —
                  // matches the LMS's own canvas renderer (drawTextField/
                  // drawPillsField: `x = g.xPct * W` used as-is, with
                  // centering computed as an anchor WITHIN [x, x+maxWidth],
                  // never by shifting the box itself). text-align/
                  // justify-content below do that centering for us.
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
                          // A pill a bit over its own budget shrinks to keep
                          // fitting instead of getting chopped — same idea as
                          // the text-field scale below, per chip.
                          const scale = computeFitScale(p.length, field.pillMaxLengths?.[i] ?? MAX_PILL_CHARS);
                          const chipFontSize = field.geometry.fontSizePx * scale;
                          return (
                            <span
                              key={i}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const raw = e.currentTarget.textContent ?? '';
                                const v = truncateText(raw, field.pillMaxLengths?.[i] ?? MAX_PILL_CHARS);
                                if (v === p) return;
                                setCoverFieldValue(field.id, pills.map((pp, j) => (j === i ? v : pp)));
                              }}
                              className="outline-none cursor-text"
                              style={{
                                color: field.geometry.color,
                                fontWeight: field.geometry.fontWeight,
                                fontFamily: field.geometry.fontFamily,
                                fontSize: cqw(chipFontSize, art.canvasWidthPx),
                                background: field.geometry.pillBg ?? 'rgba(0,0,0,0.35)',
                                borderRadius: 9999,
                                padding: `${cqw(chipFontSize * 0.45, art.canvasWidthPx)} ${cqw(chipFontSize * 0.9, art.canvasWidthPx)}`,
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
                            fontSize: cqw(field.staticLabelFontSizePx ?? field.geometry.fontSizePx * 0.65, art.canvasWidthPx),
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
                        maxLines={field.geometry.maxLines}
                        fontSizePx={field.geometry.fontSizePx}
                        lineHeightPx={field.geometry.lineHeightPx}
                        canvasWidthPx={art.canvasWidthPx}
                        cqw={cqw}
                        color={field.geometry.color}
                        fontWeight={field.geometry.fontWeight}
                        fontFamily={field.geometry.fontFamily}
                        textAlign={align}
                        editable
                        placeholder={field.placeholder as string}
                        onCommit={(v) => setCoverFieldValue(field.id, truncateText(v, field.maxLength))}
                      />
                    </div>
                  );
                })}

                <button
                  onClick={() => setShowCoverPicker(true)}
                  className="absolute top-2 right-2 flex items-center gap-1.5 bg-white/90 hover:bg-white text-slate-700 text-[11px] font-semibold rounded-full px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <ImageIcon className="w-3 h-3" />
                  Change cover
                </button>
              </div>

              {/* Profile Card Body */}
              <div className="px-6 pb-6 pt-0">
                {/* Avatar row */}
                <div className="flex items-start justify-between">
                  <div className="-mt-14 sm:-mt-20 w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-full border-[4px] border-white overflow-hidden relative bg-slate-200 shadow-md shrink-0 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/linkedin-templates/pfp/${profile.pfpGradientId}/background.jpg`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.headshotUrl}
                      alt={profile.fullName}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setShowPfpPicker(true)} title="Change background" className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center">
                        <Palette className="w-4 h-4 text-slate-700" />
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} title="Change photo" className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center">
                        <Camera className="w-4 h-4 text-slate-700" />
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleHeadshotFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>

                {/* Main Info Row (Side-by-side: Name/Headline left, Company/School right) */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mt-3">
                  {/* LEFT COLUMN: Name, headline, location, connection, actions */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Edit value={profile.fullName} onCommit={(v) => set({ fullName: v })} placeholder="Your name" className="text-[24px] font-bold text-[#191919] leading-tight tracking-tight" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/featured-thumbnail/verified badge image.png" alt="Verified" className="w-[25px] h-[25px] object-contain shrink-0" />
                      <span className="text-[13px] text-slate-500 font-normal">· 2nd</span>
                    </div>

                    <Edit block value={profile.headline} onCommit={(v) => set({ headline: v })} placeholder="Your headline…" className="text-[15px] font-normal text-[#191919] mt-1 leading-snug" />

                    <div className="text-[13px] text-slate-500 mt-2 flex flex-wrap items-center gap-x-1.5">
                      <MapPin className="w-3 h-3" />
                      <Edit value={profile.location} onCommit={(v) => set({ location: v })} placeholder="Location" />
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
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <button className="bg-[#0A66C2] hover:bg-[#084e96] text-white font-semibold text-sm px-5 py-1.5 rounded-full flex items-center gap-1.5 transition shadow-2xs">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        Connect
                      </button>
                      <button className="border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50/60 font-semibold text-sm px-5 py-1.5 rounded-full flex items-center gap-1.5 transition">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                      <button className="border border-slate-500 text-slate-700 hover:bg-slate-100 w-9 h-9 rounded-full flex items-center justify-center transition">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Company & School badges */}
                  <div className="flex flex-col gap-3 shrink-0 pt-1">
                    <div className="flex items-center gap-2.5 group cursor-pointer">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/featured-thumbnail/company logo.jfif" alt="" className="w-full h-full object-cover" />
                      </div>
                      <Edit
                        value={profile.currentCompany}
                        onCommit={(v) => set({ currentCompany: v })}
                        placeholder="Current company"
                        className="text-[13px] font-semibold text-[#191919] leading-tight max-w-[190px]"
                      />
                    </div>
                    <div className="flex items-center gap-2.5 group cursor-pointer">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/featured-thumbnail/education logo.jpg" alt="" className="w-full h-full object-cover" />
                      </div>
                      <Edit
                        value={primarySchool}
                        onCommit={(v) => (profile.education[0] ? setEducation(0, { school: v }) : set({ school: v }))}
                        placeholder="School"
                        className="text-[13px] font-semibold text-[#191919] leading-tight max-w-[190px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD 2: About ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#191919] mb-2.5">About</h2>
              <Edit block value={profile.about} onCommit={(v) => set({ about: v })} placeholder="Write your About section…" className="text-[14px] text-slate-800 leading-[1.6]" />
            </div>

            {/* ── CARD 3: Featured ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-[#191919]">Featured</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredItems.map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs flex flex-col">
                    <div className="h-[135px] w-full relative overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[12px] text-slate-500 font-medium">{item.type}</span>
                        <h3 className="text-[14px] font-semibold text-[#191919] leading-snug line-clamp-2 mt-1">{item.title}</h3>
                        <p className="text-[12px] text-slate-600 line-clamp-2 mt-1.5 leading-normal">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CARD 4: Experience ── */}
            {profile.experience.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-5">Experience</h2>
                <div className="space-y-6">
                  {profile.experience.map((exp, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/featured-thumbnail/company logo.jfif" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Edit value={exp.title} onCommit={(v) => setExperience(i, { title: v })} placeholder="Job title" className="text-[16px] font-semibold text-[#191919] leading-tight" />
                        <Edit value={exp.company} onCommit={(v) => setExperience(i, { company: v })} placeholder="Company" className="text-[14px] font-medium text-slate-800 mt-0.5" />
                        <div className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Edit value={exp.start} onCommit={(v) => setExperience(i, { start: v })} placeholder="Start" />
                          <span>–</span>
                          <Edit value={exp.end} onCommit={(v) => setExperience(i, { end: v })} placeholder="End" />
                        </div>
                        <ul className="mt-2.5 space-y-1.5 text-[13px] text-slate-700 leading-relaxed list-disc list-outside marker:text-slate-400 pl-4">
                          {exp.description.split('\n').filter(Boolean).map((bullet, bIdx) => (
                            <li key={bIdx}>
                              <Edit value={bullet} onCommit={(v) => setExperienceBullet(i, bIdx, v)} placeholder="Bullet point" />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CARD 5: Education ── */}
            {profile.education.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-5">Education</h2>
                <div className="space-y-6">
                  {profile.education.map((edu, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/featured-thumbnail/education logo.jpg" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Edit value={edu.school} onCommit={(v) => setEducation(i, { school: v })} placeholder="School" className="text-[16px] font-semibold text-[#191919] leading-tight" />
                        <div className="text-[14px] font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                          <Edit value={edu.degree} onCommit={(v) => setEducation(i, { degree: v })} placeholder="Degree" />
                          <span>·</span>
                          <Edit value={edu.fieldOfStudy} onCommit={(v) => setEducation(i, { fieldOfStudy: v })} placeholder="Field of study" />
                        </div>
                        <div className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Edit value={edu.start} onCommit={(v) => setEducation(i, { start: v })} placeholder="Start" />
                          <span>–</span>
                          <Edit value={edu.end} onCommit={(v) => setEducation(i, { end: v })} placeholder="End" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CARD 6: Licenses & Certifications ── */}
            {profile.certifications.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-5">Licenses &amp; Certifications</h2>
                <div className="space-y-6">
                  {profile.certifications.map((cert, idx) => (
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
                        <Edit value={cert.name} onCommit={(v) => setCertification(idx, { name: v })} placeholder="Certification name" className="text-[16px] font-semibold text-[#191919] leading-tight" />
                        <Edit value={cert.organization} onCommit={(v) => setCertification(idx, { organization: v })} placeholder="Organization" className="text-[14px] font-medium text-slate-800 mt-0.5" />
                        <div className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span>Issued</span>
                          <Edit value={cert.date} onCommit={(v) => setCertification(idx, { date: v })} placeholder="Date" />
                        </div>
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
            {profile.projects.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-5">Projects</h2>
                <div className="space-y-6">
                  {profile.projects.map((proj, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FolderGit2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Edit value={proj.title} onCommit={(v) => setProject(i, { title: v })} placeholder="Project title" className="text-[16px] font-semibold text-[#191919] leading-tight" />
                        <Edit block value={proj.description} onCommit={(v) => setProject(i, { description: v })} placeholder="Project description" className="text-[14px] text-slate-700 mt-1 leading-relaxed" />

                        {/* Attached Project Media Thumbnail Card */}
                        <div className="mt-3.5 border border-slate-200 rounded-xl p-2.5 bg-slate-50/80 flex items-center gap-3 max-w-md">
                          <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/featured-thumbnail/project thumbnail.png" alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-[#191919] line-clamp-1">{proj.title} Demo &amp; Code Repo</p>
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
            {profile.skills.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-4">Skills</h2>
                <div className="space-y-4 divide-y divide-slate-100">
                  {profile.skills.slice(0, 4).map((skill, i) => (
                    <div key={i} className={i > 0 ? 'pt-3' : ''}>
                      <Edit value={skill} onCommit={(v) => setSkill(i, v)} placeholder="Skill" className="text-[15px] font-semibold text-[#191919]" />
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">DC</div>
                        <span className="text-[13px] text-slate-600">Endorsed by colleagues at {profile.currentCompany}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {profile.skills.length > 4 && (
                  <div className="border-t border-slate-100 pt-4 mt-5 text-center">
                    <button className="text-[14px] font-semibold text-[#0A66C2] hover:underline flex items-center justify-center gap-1 w-full">
                      Show all {profile.skills.length} skills
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── CARD 9: Honors & Awards ── */}
            {profile.awards.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#191919] mb-5">Honors &amp; Awards</h2>
                <div className="space-y-5">
                  {profile.awards.map((award, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[16px] font-semibold text-[#191919] leading-tight block">{award.title}</span>
                        <span className="text-[13px] text-slate-600 mt-0.5">{award.issuer} · Issued {award.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCoverPicker && (
        <PickerOverlay title="Choose a cover template" onClose={() => setShowCoverPicker(false)}>
          <div className="grid grid-cols-2 gap-3">
            {COVER_ART_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => selectCoverTemplate(id)}
                className={`relative rounded-lg overflow-hidden border-2 transition ${id === profile.coverTemplateId ? 'border-[#0A66C2]' : 'border-transparent hover:border-slate-300'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={COVER_ART[id].backgroundUrl} alt={id} className="w-full aspect-1584/396 object-cover" />
                {id === profile.coverTemplateId && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </PickerOverlay>
      )}

      {showPfpPicker && (
        <PickerOverlay title="Choose a background" onClose={() => setShowPfpPicker(false)}>
          <div className="grid grid-cols-4 gap-3">
            {PFP_GRADIENT_IDS.map((id) => (
              <button
                key={id}
                onClick={() => selectPfpGradient(id)}
                className={`relative rounded-full overflow-hidden border-2 aspect-square transition ${id === profile.pfpGradientId ? 'border-[#0A66C2]' : 'border-transparent hover:border-slate-300'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/linkedin-templates/pfp/${id}/background.jpg`} alt={id} className="w-full h-full object-cover" />
                {id === profile.pfpGradientId && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </PickerOverlay>
      )}

      {cropSourceUrl && (
        <PfpCropModal
          key={cropSourceUrl}
          imageUrl={cropSourceUrl}
          onCancel={() => setCropSourceUrl(null)}
          onChangePhoto={(file) => setCropSourceUrl(URL.createObjectURL(file))}
          onConfirm={(dataUrl) => {
            set({ headshotUrl: dataUrl });
            setCropSourceUrl(null);
          }}
        />
      )}
    </div>
  );
};
