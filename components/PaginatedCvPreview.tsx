'use client';

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CvPreview } from './CvPreview';
import {
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
  paginateCvSmart,
  measureBlocks,
  type CvPage,
} from '../lib/cvPagination';
import type { CvData } from '../lib/cvTypes';

interface PaginatedCvPreviewProps {
  data: CvData;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  accentColor?: string;
  onChange?: (data: CvData) => void;
  children?: React.ReactNode;
}

function samePages(a: CvPage[], b: CvPage[]): boolean {
  return a.length === b.length && a.every((p, i) => p.sliceStart === b[i].sliceStart);
}

function isCvDataEqual(a?: CvData, b?: CvData): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.theme !== b.theme || a.summary !== b.summary || a.cvType !== b.cvType) return false;
  if (a.projectsBulletStyle !== b.projectsBulletStyle || a.workshopsBulletStyle !== b.workshopsBulletStyle) return false;
  if (a.additional?.bulletStyle !== b.additional?.bulletStyle) return false;
  if (a.additional?.skills !== b.additional?.skills || a.additional?.interests !== b.additional?.interests) return false;
  
  // Fast length checks
  if (a.education?.length !== b.education?.length) return false;
  if (a.workExperience?.length !== b.workExperience?.length) return false;
  if (a.projects?.length !== b.projects?.length) return false;
  if (a.certifications?.length !== b.certifications?.length) return false;
  if (a.workshops?.length !== b.workshops?.length) return false;

  // Personal info
  const pA = a.personalInfo;
  const pB = b.personalInfo;
  if (pA?.fullName !== pB?.fullName || pA?.phone !== pB?.phone || pA?.email !== pB?.email ||
      pA?.linkedin !== pB?.linkedin || pA?.linkedinLabel !== pB?.linkedinLabel ||
      pA?.github !== pB?.github || pA?.githubLabel !== pB?.githubLabel ||
      pA?.kaggle !== pB?.kaggle || pA?.kaggleLabel !== pB?.kaggleLabel) {
    return false;
  }

  // Work experience
  for (let i = 0; i < (a.workExperience?.length || 0); i++) {
    const wA = a.workExperience[i];
    const wB = b.workExperience[i];
    if (wA.company !== wB.company || wA.title !== wB.title || wA.start !== wB.start ||
        wA.end !== wB.end || wA.location !== wB.location || wA.bullets !== wB.bullets ||
        wA.bulletStyle !== wB.bulletStyle) return false;
  }

  // Education
  for (let i = 0; i < (a.education?.length || 0); i++) {
    const eA = a.education[i];
    const eB = b.education[i];
    if (eA.institution !== eB.institution || eA.degree !== eB.degree || eA.start !== eB.start ||
        eA.end !== eB.end || eA.location !== eB.location) return false;
  }

  // Projects
  for (let i = 0; i < (a.projects?.length || 0); i++) {
    const prA = a.projects[i];
    const prB = b.projects[i];
    if (prA.content !== prB.content || prA.title !== prB.title || prA.technologies !== prB.technologies ||
        prA.date !== prB.date || prA.bullets !== prB.bullets) return false;
  }

  // Certifications
  for (let i = 0; i < (a.certifications?.length || 0); i++) {
    if (a.certifications[i].name !== b.certifications[i].name ||
        a.certifications[i].organization !== b.certifications[i].organization) return false;
  }

  return true;
}

/**
 * Renders the resume as separate A4 page boxes — exactly like Google Docs /
 * the LMS CV builder — while keeping a hidden full-height copy as the source
 * that Puppeteer PDF export captures. Because BOTH use the same paginateCvSmart
 * algorithm, the editor page breaks and PDF page breaks are always identical.
 */
function PaginatedCvPreviewBase({
  data,
  exportRef,
  accentColor = '#4f46e5',
  onChange,
  children,
}: PaginatedCvPreviewProps) {
  const widthRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<CvPage[]>([
    { sliceStart: 0, sliceHeight: PAGE_HEIGHT_PX, topOffset: 0 },
  ]);
  const [scale, setScale] = useState(1);

  // Memoize static (measurement/export) and editable contents so child trees
  // don't re-create or reconcile when PaginatedCvPreview re-evaluates slice sizes.
  const staticContent = useMemo(() => {
    if (children) return <>{children}</>;
    return <CvPreview data={data} />;
  }, [children, data]);

  const editableContent = useMemo(() => {
    if (children) return <>{children}</>;
    return <CvPreview data={data} onChange={onChange} />;
  }, [children, data, onChange]);

  useLayoutEffect(() => {
    let frame = 0;

    const recalc = () => {
      const root = contentRef.current;
      const contentHeight = root?.offsetHeight ?? PAGE_HEIGHT_PX;
      const blocks = root ? measureBlocks(root) : [];
      const nextPages = paginateCvSmart(contentHeight, blocks);
      setPages((prev) => (samePages(prev, nextPages) ? prev : nextPages));

      const availableWidth = widthRef.current?.offsetWidth ?? PAGE_WIDTH_PX;
      const nextScale = Math.min(1, availableWidth / PAGE_WIDTH_PX);
      setScale((prev) => (prev === nextScale ? prev : nextScale));
    };

    const scheduleRecalc = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(recalc);
    };

    scheduleRecalc();
    const ro = new ResizeObserver(scheduleRecalc);
    if (widthRef.current) ro.observe(widthRef.current);
    if (contentRef.current) ro.observe(contentRef.current);

    // Re-measure after fonts settle (prevents mid-entry breaks from stale reads)
    document.fonts?.ready.then(scheduleRecalc).catch(() => {});
    const t1 = setTimeout(scheduleRecalc, 150);
    const t2 = setTimeout(scheduleRecalc, 500);
    const t3 = setTimeout(scheduleRecalc, 1200);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [data]);

  const scaledWidth = PAGE_WIDTH_PX * scale;
  const scaledHeight = PAGE_HEIGHT_PX * scale;

  return (
    <div className="w-full">
      {/* Zero-height width sentinel — gives us column width without feedback loop */}
      <div ref={widthRef} className="w-full h-0" />

      {/* Hidden MEASUREMENT copy — off-screen, fixed width, used for block measurement */}
      <div
        ref={contentRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '-99999px',
          width: PAGE_WIDTH_PX,
          pointerEvents: 'none',
        }}
      >
        {staticContent}
      </div>

      {/* Hidden EXPORT copy — captured by Puppeteer PDF export */}
      <div
        ref={exportRef as React.RefObject<HTMLDivElement>}
        style={{
          position: 'fixed',
          top: 0,
          left: '-99999px',
          width: PAGE_WIDTH_PX,
          pointerEvents: 'none',
        }}
      >
        {staticContent}
      </div>

      {/* Visible paginated preview — one A4 box per page */}
      <div className="space-y-8">
        {pages.map((page, pageIndex) => (
          <div key={pageIndex}>
            {pages.length > 1 && (
              <p className="text-[10px] text-slate-500 mb-1.5 text-center font-medium">
                Page {pageIndex + 1} of {pages.length}
              </p>
            )}
            {/* A4 page box */}
            <div
              className="rounded-sm overflow-hidden shadow-2xl bg-white mx-auto"
              style={{
                width: scaledWidth,
                height: scaledHeight,
                borderTop: pageIndex === 0 ? `4px solid ${accentColor}` : undefined,
              }}
            >
              {/* Scaled canvas — renders the full resume but clips to this page's slice */}
              <div
                className="bg-white relative overflow-hidden"
                style={{
                  width: PAGE_WIDTH_PX,
                  height: PAGE_HEIGHT_PX,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                {/* Clip window: shows only this page's content slice */}
                <div
                  className="absolute left-0 overflow-hidden"
                  style={{
                    top: page.topOffset,
                    width: PAGE_WIDTH_PX,
                    height: page.sliceHeight,
                  }}
                >
                  <div style={{ transform: `translateY(${-page.sliceStart}px)` }}>
                    {editableContent}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function arePaginatedCvPreviewPropsEqual(
  prev: PaginatedCvPreviewProps,
  next: PaginatedCvPreviewProps
): boolean {
  if (prev.accentColor !== next.accentColor) return false;
  if (prev.exportRef !== next.exportRef) return false;
  if (prev.onChange !== next.onChange) return false;
  if (prev.children !== next.children) return false;
  return isCvDataEqual(prev.data, next.data);
}

export const PaginatedCvPreview = React.memo(
  PaginatedCvPreviewBase,
  arePaginatedCvPreviewPropsEqual
);
