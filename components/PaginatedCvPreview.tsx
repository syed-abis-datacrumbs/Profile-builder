'use client';

import { useLayoutEffect, useRef, useState } from 'react';
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

/**
 * Renders the resume as separate A4 page boxes — exactly like Google Docs /
 * the LMS CV builder — while keeping a hidden full-height copy as the source
 * that Puppeteer PDF export captures. Because BOTH use the same paginateCvSmart
 * algorithm, the editor page breaks and PDF page breaks are always identical.
 */
export function PaginatedCvPreview({
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

  const renderContent = () => {
    if (children) return <>{children}</>;
    return <CvPreview data={data!} onChange={onChange} />;
  };

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
        {renderContent()}
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
        {renderContent()}
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
                    {renderContent()}
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
