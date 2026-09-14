'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Download,
  Sparkles,
  Briefcase,
  User,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { LinkedinRichProfile } from '../lib/linkedinRichProfile';
import { COVER_ART } from '../lib/linkedinCoverArt';

interface LinkedinCopyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: LinkedinRichProfile | null;
}

export function LinkedinCopyDrawer({ isOpen, onClose, profile }: LinkedinCopyDrawerProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const headline = profile?.headline || profile?.title || '';
  const about = profile?.about || '';
  const experiences = profile?.experience || [];
  const activeCover = profile?.coverTemplateId ? COVER_ART[profile.coverTemplateId] : null;
  const bannerUrl = (profile?.customCoverUrl || activeCover?.backgroundUrl) || null;

  const headlineLength = headline.length;
  const headlineStatusColor =
    headlineLength === 0
      ? 'text-slate-400'
      : headlineLength > 220
      ? 'text-rose-500'
      : headlineLength >= 100
      ? 'text-emerald-500'
      : 'text-amber-500';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Slide-over Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-lg h-full bg-white shadow-2xl z-10 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                in
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  1-Click LinkedIn Package
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                    Ready
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Copy sections directly into your LinkedIn profile fields
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Top Banner */}
          <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <span className="font-medium">Ready to update your live LinkedIn?</span>
            <a
              href="https://www.linkedin.com/in/me/edit/intro/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Open LinkedIn Editor
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Headline Card */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Headline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono font-medium ${headlineStatusColor}`}>
                    {headlineLength} / 220 chars
                  </span>
                  <button
                    onClick={() => handleCopy(headline, 'headline')}
                    disabled={!headline}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {copiedKey === 'headline' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 leading-relaxed font-sans select-all">
                {headline || 'No headline available.'}
              </div>
            </div>

            {/* 2. About Section Card */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>About / Summary</span>
                </div>
                <button
                  onClick={() => handleCopy(about, 'about')}
                  disabled={!about}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {copiedKey === 'about' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy About</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto select-all">
                {about || 'No about summary available.'}
              </div>
            </div>

            {/* 3. Work Experience Highlights */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Experience Bullets ({experiences.length})</span>
                </div>
                {experiences.length > 0 && (
                  <button
                    onClick={() => {
                      const allBullets = experiences
                        .map(
                          (exp) =>
                            `Role: ${exp.title} at ${exp.company} (${exp.start} - ${exp.end})\n` +
                            (exp.description || '')
                        )
                        .join('\n\n');
                      handleCopy(allBullets, 'all_experience');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all active:scale-95 cursor-pointer"
                  >
                    {copiedKey === 'all_experience' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>All Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy All Roles</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {experiences.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No work experiences added yet.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {experiences.map((exp, idx) => {
                    const bullets = (exp.description || '')
                      .split('\n')
                      .map((b: string) => b.replace(/^[•\-\*]\s*/, '').trim())
                      .filter(Boolean);

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900">{exp.title}</div>
                            <div className="text-[11px] text-slate-500">
                              {exp.company} • {exp.start} - {exp.end}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              handleCopy(exp.description || '', `exp_${idx}`);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Copy text for this role"
                          >
                            {copiedKey === `exp_${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {bullets.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                            {bullets.map((bullet: string, bIdx: number) => (
                              <li key={bIdx}>{bullet}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-600 text-[11px] whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Banner Art Card */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Cover Banner (1584 × 396)</span>
                </div>
                {bannerUrl ? (
                  <a
                    href={bannerUrl}
                    download="linkedin-banner-1584x396.png"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </a>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg select-none">
                    No Banner Set
                  </span>
                )}
              </div>

              {bannerUrl ? (
                <>
                  <div className="rounded-xl overflow-hidden border border-slate-200 aspect-[1584/396] bg-slate-100">
                    <img src={bannerUrl} alt="LinkedIn Banner" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pre-formatted to LinkedIn's official desktop & mobile dimensions with zero cropping.
                  </p>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 aspect-[1584/396] bg-slate-50/70 flex flex-col items-center justify-center gap-1.5 p-4 text-center select-none">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">No cover banner selected</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Choose a template or upload a custom cover photo in LinkedIn Studio to preview and download here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All items formatted for LinkedIn</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
