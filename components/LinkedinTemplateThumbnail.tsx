'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { linkedinCovers, getDefaultPfpGradientId } from '../lib/linkedinCovers';
import { linkedinTemplateSamples } from '../lib/linkedinTemplateSamples';
import { COVER_ART, CoverArtField, getCoverArtId, computeFitScale, coverFontSize } from '../lib/linkedinCoverArt';

// Gallery card preview, rendered live from the same template data the real
// preview uses — not a screenshot. The screenshots this replaces were captures
// of the profile header that included surrounding page background, and since
// each was a fixed bitmap cropped to the card, faces and names were being cut
// off at whatever the card's aspect happened to be. Rendering the markup means
// the framing is exact at any card size, and a template's copy/name can never
// drift out of sync with its thumbnail.
//
// Laid out at a fixed design width, then scaled to whatever the card gives us,
// so every card is a faithful miniature rather than a reflowed layout.
const DESIGN_WIDTH = 780;
const DESIGN_HEIGHT = 420;

const cqw = (px: number, canvasWidthPx: number) => `${((px / canvasWidthPx) * 100).toFixed(3)}cqw`;

export const LinkedinTemplateThumbnail: React.FC<{ templateId: string; index: number }> = ({ templateId, index }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  const measure = useCallback(() => {
    const el = wrapRef.current;
    if (el) setScale(el.clientWidth / DESIGN_WIDTH);
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const cover = linkedinCovers.find((c) => c.id === templateId) ?? linkedinCovers[0];
  const sample = linkedinTemplateSamples[cover.id] ?? linkedinTemplateSamples[linkedinCovers[0].id];
  const art = COVER_ART[cover.id] ?? COVER_ART[getCoverArtId(index)];
  const gradientId = getDefaultPfpGradientId(index);

  const resolve = (field: CoverArtField): string | string[] => {
    if (field.defaultFrom === 'fullName') return sample.fullName;
    if (field.defaultFrom === 'currentPosition') return sample.title;
    if (field.defaultFrom === 'currentCompany') return sample.currentCompany;
    return field.placeholder;
  };

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden bg-white" style={{ aspectRatio: `${DESIGN_WIDTH}/${DESIGN_HEIGHT}` }}>
      <div
        // Hidden until measured so the full-size layout never flashes.
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        {/* Cover */}
        <div
          className="relative w-full bg-slate-900 overflow-hidden"
          style={{ aspectRatio: '1584/396', containerType: 'inline-size' } as React.CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art.backgroundUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />

          {/* Text fields commented out for now as requested */}
          {/*
          {art.fields.map((field) => {
            const value = resolve(field);
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
                    const s = computeFitScale(p.length, field.pillMaxLengths?.[i] ?? 32);
                    return (
                      <span
                        key={i}
                        style={{
                          color: field.geometry.color,
                          fontWeight: field.geometry.fontWeight,
                          fontFamily: field.geometry.fontFamily,
                          fontSize: coverFontSize(field.geometry.fontSizePx * s, art.canvasWidthPx),
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
            const s = computeFitScale(text.length, field.maxLength);
            const baseLineHeight = field.geometry.lineHeightPx ?? field.geometry.fontSizePx * 1.25;
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
                <div
                  style={{
                    color: field.geometry.color,
                    fontWeight: field.geometry.fontWeight,
                    fontFamily: field.geometry.fontFamily,
                    textAlign: align,
                    whiteSpace: 'pre-line',
                    fontSize: coverFontSize(field.geometry.fontSizePx * s, art.canvasWidthPx),
                    lineHeight: baseLineHeight / field.geometry.fontSizePx,
                    ...(field.geometry.maxLines
                      ? { display: '-webkit-box', WebkitLineClamp: field.geometry.maxLines, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }
                      : {}),
                  }}
                >
                  {text}
                </div>
              </div>
            );
          })}
          */}
        </div>

        {/* Profile header body */}
        <div className="px-6 pb-5">
          <div className="-mt-12 w-[104px] h-[104px] rounded-full border-4 border-white overflow-hidden relative bg-slate-200 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/linkedin-templates/pfp/${gradientId}/background.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/linkedin-templates/pfp/sample-headshot.png" alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
          </div>

          <div className="flex items-start justify-between gap-4 mt-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[22px] font-bold text-[#191919] leading-tight tracking-tight truncate">{sample.fullName}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/featured-thumbnail/verified badge image.png" alt="" className="w-[22px] h-[22px] object-contain shrink-0" />
                <span className="text-[12px] text-slate-500 shrink-0">· 2nd</span>
              </div>
              <p className="text-[14px] text-[#191919] mt-1 leading-snug line-clamp-2">{sample.headline}</p>
              <p className="text-[12px] text-slate-500 mt-1.5">
                {sample.location} · <span className="text-[#0A66C2] font-semibold">Contact info</span>
              </p>
              <p className="text-[12px] text-[#0A66C2] font-semibold mt-0.5">500+ connections</p>
            </div>

            <div className="flex flex-col gap-2 shrink-0 pt-0.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/featured-thumbnail/company logo.jfif" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-semibold text-[#191919] leading-tight max-w-[150px] line-clamp-2">{sample.currentCompany}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/featured-thumbnail/education logo.jpg" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-semibold text-[#191919] leading-tight max-w-[150px] line-clamp-2">
                  {sample.education[0]?.school ?? sample.school}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3.5">
            <span className="bg-[#0A66C2] text-white font-semibold text-[13px] px-4 py-1.5 rounded-full">+ Connect</span>
            <span className="border border-[#0A66C2] text-[#0A66C2] font-semibold text-[13px] px-4 py-1.5 rounded-full">Message</span>
            <span className="border border-slate-400 text-slate-600 text-[13px] w-8 h-8 rounded-full flex items-center justify-center">···</span>
          </div>
        </div>
      </div>
    </div>
  );
};
