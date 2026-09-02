'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { LmsResumeSample } from '../lib/resumeSamples';
import { CvData, cvMarkdownToHtml } from '../lib/cvTypes';
import { CvPreview } from './CvPreview';

// Gallery card preview, rendered live from the real CvPreview — not a
// separate hand-built mini-design. Laid out at a fixed design width, then
// scaled to whatever the card gives us (same technique as
// LinkedinTemplateThumbnail), so the card can never drift out of sync with
// what the student actually gets. The card height is fixed and clips
// overflow, so this is intentionally a cropped "peek" at the top of the
// resume (header + first section), not the whole page squeezed in.
const DESIGN_WIDTH = 794;

export const ResumeTemplateThumbnail: React.FC<{ sample: LmsResumeSample; accentColor: string; clerkFullName?: string }> = ({
  sample,
  accentColor,
  clerkFullName,
}) => {
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

  const cv = cvMarkdownToHtml(sample.data as CvData);

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-56 overflow-hidden bg-white"
      style={{ borderTop: `4px solid ${accentColor}` }}
    >
      <div
        style={{
          width: DESIGN_WIDTH,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        <CvPreview data={cv} />
      </div>
    </div>
  );
};
