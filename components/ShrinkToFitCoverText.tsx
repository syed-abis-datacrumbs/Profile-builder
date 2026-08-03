'use client';

import React from 'react';
import { computeFitScale, coverFontSize } from '../lib/linkedinCoverArt';

// Renders one cover-banner text field at the template's exact geometry,
// shrinking the font only when the text runs past that field's calibrated
// maxLength (see computeFitScale for why the ratio preserves line count).
//
// Deliberately NOT measuring the DOM: an earlier version rendered the text,
// compared scrollHeight against maxLines, and stepped the font down until it
// fit. That looked principled but behaved worse — it optimized for a fit
// target the per-field calibration never promised (those maxLength numbers
// were tuned against placeholders carrying explicit "\n" breaks, not against
// free auto-wrapping), so it routinely bottomed out at its floor and shrank
// text far more than the overage justified. It also depended on measuring
// mid-webfont-load and on temporarily stripping the line clamp to measure,
// which had to be restored by a re-render React skips when the scale doesn't
// change — leaving overflow:visible stuck on the element and letting text
// escape its box. A pure ratio has none of those failure modes.
interface ShrinkToFitCoverTextProps {
  text: string;
  /** The field's calibrated character budget — the shrink trigger. */
  maxLength?: number;
  maxLines?: number;
  fontSizePx: number;
  lineHeightPx?: number;
  canvasWidthPx: number;
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
  maxLength,
  maxLines,
  fontSizePx,
  lineHeightPx,
  canvasWidthPx,
  color,
  fontWeight,
  fontFamily,
  textAlign,
  editable,
  placeholder,
  onCommit,
}) => {
  const scale = computeFitScale(text.length, maxLength);
  const baseLineHeight = lineHeightPx ?? fontSizePx * 1.25;

  const style: React.CSSProperties = {
    color,
    fontWeight,
    fontFamily,
    textAlign,
    whiteSpace: 'pre-line',
    fontSize: coverFontSize(fontSizePx * scale, canvasWidthPx),
    // em, so it tracks whichever size coverFontSize settles on — a cqw
    // line-height would collapse onto a floored font size.
    lineHeight: baseLineHeight / fontSizePx,
    ...(maxLines
      ? { display: '-webkit-box', WebkitLineClamp: maxLines, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }
      : {}),
  };

  if (editable) {
    return (
      <div
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

  return <div style={style}>{text}</div>;
};
