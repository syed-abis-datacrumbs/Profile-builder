// Ported from the DataCrumbs LMS's COVER_TEMPLATES (src/lib/linkedin-templates.ts)
// — the 8 real cover designs, each with its background art plus the exact
// text-field positions/styling the LMS bakes onto that art (name, title,
// tagline, contact info, tag pills, etc). Icon ligatures are dropped (this
// preview uses lucide icons instead) but every field's fontFamily is ported
// as-is — omitted in the LMS source means it falls back to plain
// "sans-serif" there too (see linkedinExport.ts's `g.fontFamily || "sans-serif"`),
// so an absent fontFamily below is intentional, not a gap.
//
// `defaultFrom` mirrors the LMS field exactly: it's the only thing that ties
// a field's rendered value to the selected sample profile (lib/
// linkedinTemplateSamples.ts). Fields without it are decorative copy baked
// into that specific cover's design and stay fixed regardless of which
// career track is loaded onto it — exactly like the LMS's own templates.

// Maps the LMS's raw fontFamily strings to the CSS vars app/layout.tsx
// registers via next/font/google, keeping the same fallback stack.
const FONT_POPPINS = "var(--font-poppins), Arial, sans-serif";
const FONT_BRICOLAGE = "var(--font-bricolage-grotesque), Arial, sans-serif";
const FONT_DANCING_SCRIPT = "var(--font-dancing-script), cursive";
const FONT_PLAYFAIR = "var(--font-playfair-display), Georgia, serif";

export type CoverArtFieldGeometry = {
  xPct: number;
  yPct: number;
  maxWidthPct: number;
  align: 'left' | 'center' | 'right';
  fontSizePx: number;
  fontWeight: number;
  color: string;
  fontFamily?: string;
  lineHeightPx?: number;
  pillBg?: string;
  pillGapPx?: number;
  maxLines?: number;
};

export type CoverArtField = {
  id: string;
  kind: 'text' | 'pills';
  defaultFrom?: 'fullName' | 'currentPosition' | 'currentCompany';
  placeholder: string | string[];
  staticLabel?: string;
  staticLabelFontSizePx?: number;
  staticLabelFontFamily?: string;
  /** Ported straight from the LMS's CoverTextField.maxLength — the box this
   *  field renders in is a FIXED size (no auto-shrink for fields without
   *  `maxLines`, e.g. `helping-businesses.headline`), so text past this
   *  length overflows into whatever sits below it rather than wrapping
   *  safely. Enforced server-side (chat) and on manual edit, not just
   *  suggested to the AI — see linkedin-rich-chat/route.ts. */
  maxLength?: number;
  /** kind:"pills" only — ported from the LMS's CoverTextField.maxPills. */
  maxPills?: number;
  /** kind:"pills" only — per-chip character cap, index-matched to
   *  `placeholder`/the live chip array (chip 0's cap, chip 1's cap, ...).
   *  Calibrated by hand against the real background art (each chip's
   *  available row width differs), so this is more accurate than one
   *  uniform per-chip cap. Falls back to a flat default when a chip index
   *  has no entry here — see MAX_PILL_CHARS in linkedin-rich-chat/route.ts. */
  pillMaxLengths?: number[];
  geometry: CoverArtFieldGeometry;
};

export type CoverArtTemplate = {
  id: string;
  backgroundUrl: string;
  canvasWidthPx: number;
  canvasHeightPx: number;
  fields: CoverArtField[];
};

// Shared between the server (linkedin-rich-chat route, deciding how much
// overage to let through untrimmed) and the renderers (LinkedinChatStudio /
// LinkedinTemplatePreview, deciding how far to shrink text to absorb that
// overage). Overage past the allowance is trimmed server-side rather than
// shrunk further — below MIN_FONT_SCALE the text stops matching the
// template's look, which matters more than fitting every last word.
//
// The allowance is a RATIO of each field's own budget, not a flat character
// count: a flat "+20 chars" is 36% of a 55-char headline but 154% of a
// 13-char name, so small fields were being handed far more overage than any
// bounded shrink could absorb — which is exactly how text ended up
// ellipsized instead of fitted. MIN_FONT_SCALE is the exact reciprocal of
// the allowance so the two always cancel: at the worst permitted overage,
// `length * scale` lands back on `max`, guaranteeing a fit.
export const OVERAGE_ALLOWANCE_RATIO = 0.25;
export const MIN_FONT_SCALE = 1 / (1 + OVERAGE_ALLOWANCE_RATIO); // 0.8

/** The longest string this field may hold before the text itself is trimmed
 *  — beyond this, shrinking alone can no longer keep it inside the box. */
export function overageCeiling(max: number): number {
  // floor, not ceil: rounding UP here would admit one more character than
  // MIN_FONT_SCALE can shrink away, reintroducing the ellipsis this pairing
  // exists to prevent.
  return Math.floor(max * (1 + OVERAGE_ALLOWANCE_RATIO));
}

/** Smallest on-screen size cover text may render at, in real CSS px. */
export const MIN_READABLE_PX = 11;

/** Font size for a cover field, as a CSS value.
 *
 *  Sizes are authored against the 1584px export canvas, but the banner is
 *  displayed at profile width (~half that), so anything authored small —
 *  tag pills at 16px, captions and contact lines at 13-16px — lands at
 *  6-8px on screen: fine in the 1:1 calibration tool, unreadable where it's
 *  actually seen. `max()` keeps the design's proportional sizing wherever
 *  there's room and only takes over once a field would drop below what
 *  anyone can read, so large fields (headlines, names) are never affected.
 *  Pair with em-based padding so chip boxes track the size that wins. */
export function coverFontSize(px: number, canvasWidthPx: number): string {
  return `max(${MIN_READABLE_PX}px, ${((px / canvasWidthPx) * 100).toFixed(3)}cqw)`;
}

/** How much to shrink a field whose text runs past its calibrated
 *  `maxLength`. Returns exactly 1 when it fits — a field within budget must
 *  render pixel-identical to the template, never "close enough".
 *
 *  The ratio `max / length` is the whole trick: characters-per-line is
 *  inversely proportional to font size, so if `max` characters were
 *  calibrated to fill N lines at full size, `length` characters fill those
 *  same N lines at `max / length` of that size. That keeps the text block's
 *  line count — and therefore the template's alignment and spacing —
 *  unchanged, which measuring-and-shrinking-until-it-fits did not: that
 *  approach chased a fit target the calibration never promised and could
 *  bottom out far smaller than the overage warranted. */
export function computeFitScale(length: number, max: number | undefined): number {
  if (!max || length <= max) return 1;
  return Math.max(MIN_FONT_SCALE, max / length);
}

// The 7 clean banner artworks from the user's Linkedin Banners collection
export const COVER_ART_ORDER = [
  'banner-1',
  'banner-2',
  'banner-3',
  'banner-4',
  'banner-5',
  'banner-6',
  'banner-7',
] as const;

export function getCoverArtId(index: number): string {
  const n = COVER_ART_ORDER.length;
  return COVER_ART_ORDER[((index % n) + n) % n];
}

export const COVER_ART: Record<string, CoverArtTemplate> = {
  'banner-1': {
    id: 'banner-1',
    backgroundUrl: '/images/linkedin-banners/banner-1.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [],
  },
  'banner-2': {
    id: 'banner-2',
    backgroundUrl: '/images/linkedin-banners/banner-2.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [],
  },
  'banner-3': {
    id: 'banner-3',
    backgroundUrl: '/images/linkedin-banners/banner-3.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [],
  },
  'banner-4': {
    id: 'banner-4',
    backgroundUrl: '/images/linkedin-banners/banner-4.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [],
  },
  'banner-5': {
    id: 'banner-5',
    backgroundUrl: '/images/linkedin-banners/banner-5.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [],
  },
  'banner-6': {
    id: 'banner-6',
    backgroundUrl: '/images/linkedin-banners/banner-6.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [],
  },
  'banner-7': {
    id: 'banner-7',
    backgroundUrl: '/images/linkedin-banners/banner-7.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [],
  },
  // Legacy / track template aliases mapping into the 7 new banner assets
  'ideas-inspire': { id: 'ideas-inspire', backgroundUrl: '/images/linkedin-banners/banner-1.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'lets-work-together': { id: 'lets-work-together', backgroundUrl: '/images/linkedin-banners/banner-2.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'helping-businesses': { id: 'helping-businesses', backgroundUrl: '/images/linkedin-banners/banner-3.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'stunning-websites': { id: 'stunning-websites', backgroundUrl: '/images/linkedin-banners/banner-4.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'purple-geometric': { id: 'purple-geometric', backgroundUrl: '/images/linkedin-banners/banner-5.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'blue-blocks': { id: 'blue-blocks', backgroundUrl: '/images/linkedin-banners/banner-6.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'yellow-wave': { id: 'yellow-wave', backgroundUrl: '/images/linkedin-banners/banner-7.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'ai-engineer-badge': { id: 'ai-engineer-badge', backgroundUrl: '/images/linkedin-banners/banner-1.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
};
