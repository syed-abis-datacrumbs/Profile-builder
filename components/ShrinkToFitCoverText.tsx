'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

// Character counts (maxLength) don't tell you how many lines a string wraps
// to — that depends on real word lengths and the box's actual pixel width,
// neither of which a character-count ratio knows about. This measures the
// ACTUAL rendered height at full size, in the DOM, and steps the font down
// until the real content fits within `maxLines` — the only way to guarantee
// a fit instead of guessing one.
const MIN_SCALE = 0.55;
const STEP = 0.04;

interface ShrinkToFitCoverTextProps {
  text: string;
  maxLines?: number;
  fontSizePx: number;
  lineHeightPx?: number;
  canvasWidthPx: number;
  cqw: (px: number, canvasWidthPx: number) => string;
  color: string;
  fontWeight: number;
  fontFamily?: string;
  textAlign: 'left' | 'center' | 'right';
  editable?: boolean;
  placeholder?: string;
  onCommit?: (v: string) => void;
}

export const ShrinkToFitCoverText: React.FC<ShrinkToFitCoverTextProps> = ({
  text,
  maxLines,
  fontSizePx,
  lineHeightPx,
  canvasWidthPx,
  cqw,
  color,
  fontWeight,
  fontFamily,
  textAlign,
  editable,
  placeholder,
  onCommit,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const baseLineHeight = lineHeightPx ?? fontSizePx * 1.25;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !maxLines) {
      setScale(1);
      return;
    }

    const measure = () => {
      // Strip clamping/overflow constraints for measurement — with
      // -webkit-line-clamp active, scrollHeight reports the CLAMPED height
      // in most browsers, not the true content height, which would make
      // this comparison useless. The final render (after setScale below)
      // re-adds the clamp for the actual clipped/ellipsis visual.
      el.style.webkitLineClamp = 'unset';
      el.style.display = 'block';
      el.style.overflow = 'visible';
      el.style.maxHeight = 'none';

      let s = 1;
      const apply = (v: number) => {
        el.style.fontSize = cqw(fontSizePx * v, canvasWidthPx);
        el.style.lineHeight = cqw(baseLineHeight * v, canvasWidthPx);
      };
      apply(1);
      const resolvedLineHeight = () => parseFloat(getComputedStyle(el).lineHeight) || fontSizePx * 1.25;
      let allowedHeight = resolvedLineHeight() * maxLines;
      while (el.scrollHeight > allowedHeight + 1 && s > MIN_SCALE) {
        s = Math.max(MIN_SCALE, s - STEP);
        apply(s);
        allowedHeight = resolvedLineHeight() * maxLines;
      }
      setScale(s);
    };

    measure();

    // A field using a custom webfont (e.g. Bricolage Grotesque for `name`)
    // may still be mid-download the instant this first measurement runs —
    // that first pass then measures against the FALLBACK font's metrics,
    // not the real one, and can reach the wrong fit/no-fit conclusion.
    // Fields on a plain system font (no download, no swap) never hit this.
    // Re-measuring once every requested webfont is confirmed loaded fixes
    // that without guessing which fields are affected.
    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    return () => {
      cancelled = true;
    };
  }, [text, maxLines, fontSizePx, baseLineHeight, canvasWidthPx, cqw]);

  const style: React.CSSProperties = {
    color,
    fontWeight,
    fontFamily,
    textAlign,
    whiteSpace: 'pre-line',
    fontSize: cqw(fontSizePx * scale, canvasWidthPx),
    lineHeight: cqw(baseLineHeight * scale, canvasWidthPx),
    ...(maxLines
      ? { display: '-webkit-box', WebkitLineClamp: maxLines, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }
      : {}),
  };

  if (editable) {
    return (
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-ph={placeholder}
        className="outline-none cursor-text empty:before:content-[attr(data-ph)] empty:before:opacity-50"
        style={style}
        onBlur={(e) => {
          const v = e.currentTarget.textContent ?? '';
          if (v !== text) onCommit?.(v);
        }}
      >
        {text}
      </div>
    );
  }

  return (
    <div ref={ref} style={style}>
      {text}
    </div>
  );
};
