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

// The 10 curated banner artworks (7 new banners + 3 kept old banners: helping-businesses, ideas-inspire, lets-work-together)
export const COVER_ART_ORDER = [
  'banner-2',            // Intelligent AI Solutions (AI/ML)
  'lets-work-together',  // Let's Work Together (Data Science & Consulting)
  'banner-1',            // Built For Impact - Launch Market-Ready Apps (Full Stack / Mobile / Web)
  'banner-6',            // Software Engineer & Developer Grid
  'banner-7',            // BI Enthusiast & Data-Driven Decisions
  'ideas-inspire',       // Ideas that inspire, Solutions that last (Design / UI / UX)
  'banner-4',            // Performance Marketing Built For Scale (Digital Marketing)
  'paid-marketing',      // Helping Businesses Scale Through Paid Marketing
  'banner-3',            // Connecting Talent, Scaling Teams (HR & Talent Acquisition)
  'banner-5',            // Modern Cloud & Infrastructure Architecture
] as const;

export function getCoverArtId(index: number): string {
  const n = COVER_ART_ORDER.length;
  return COVER_ART_ORDER[((index % n) + n) % n];
}

export const COVER_ART: Record<string, CoverArtTemplate> = {
  // 7 New Banners
  'banner-1': { id: 'banner-1', backgroundUrl: '/images/linkedin-banners/banner-1.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'banner-2': { id: 'banner-2', backgroundUrl: '/images/linkedin-banners/banner-2.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'banner-3': { id: 'banner-3', backgroundUrl: '/images/linkedin-banners/banner-3.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'banner-4': { id: 'banner-4', backgroundUrl: '/images/linkedin-banners/banner-4.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'banner-5': { id: 'banner-5', backgroundUrl: '/images/linkedin-banners/banner-5.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'banner-6': { id: 'banner-6', backgroundUrl: '/images/linkedin-banners/banner-6.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'banner-7': { id: 'banner-7', backgroundUrl: '/images/linkedin-banners/banner-7.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },

  // Full Stack Developer -> "Built For Impact - Helping businesses launch market-ready apps"
  'helping-businesses': { id: 'helping-businesses', backgroundUrl: '/images/linkedin-banners/banner-1.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },

  // Paid Marketing Cover (used for Digital / Performance Marketing)
  'paid-marketing': {
    id: 'paid-marketing',
    backgroundUrl: '/images/linkedin-templates/cover/helping-businesses/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'headline',
        kind: 'text',
        placeholder: 'Helping Businesses Scale\nThrough Paid Marketing',
        maxLength: 55,
        geometry: { xPct: 0.395, yPct: 0.18, maxWidthPct: 0.56, align: 'left', fontSizePx: 53, fontWeight: 800, color: '#ffffff', fontFamily: FONT_POPPINS, lineHeightPx: 50, maxLines: 2 },
      },
      {
        id: 'pills',
        kind: 'pills',
        placeholder: ['Email Lead Generation', 'Social Media Ads', 'SEO'],
        maxPills: 5,
        pillMaxLengths: [30, 16, 4],
        geometry: { xPct: 0.595, yPct: 0.6, maxWidthPct: 0.44, align: 'center', fontSizePx: 16, fontWeight: 500, color: '#ffffff', fontFamily: FONT_POPPINS, pillBg: 'rgba(0,0,0,0.35)', pillGapPx: 14 },
      },
      {
        id: 'caption',
        kind: 'text',
        placeholder: 'DATACRUMBS.ORG',
        maxLength: 27,
        geometry: { xPct: 0.83, yPct: 0.82, maxWidthPct: 0.15, align: 'right', fontSizePx: 13, fontWeight: 700, color: '#ffffff', fontFamily: FONT_POPPINS, maxLines: 1 },
      },
    ],
  },
  'ideas-inspire': {
    id: 'ideas-inspire',
    backgroundUrl: '/images/linkedin-templates/cover/ideas-inspire/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'tagline',
        kind: 'text',
        placeholder: 'Ideas that inspire.\nSolutions that last.',
        maxLength: 80,
        geometry: { xPct: 0.615, yPct: 0.26, maxWidthPct: 0.37, align: 'left', fontSizePx: 46, fontWeight: 600, color: '#ffffff', fontFamily: FONT_POPPINS, lineHeightPx: 62, maxLines: 2 },
      },
      {
        id: 'caption',
        kind: 'text',
        placeholder: 'DATACRUMBS.ORG',
        maxLength: 40,
        geometry: { xPct: 0.615, yPct: 0.68, maxWidthPct: 0.37, align: 'left', fontSizePx: 15, fontWeight: 700, color: '#e5e7eb', maxLines: 1 },
      },
    ],
  },
  'lets-work-together': {
    id: 'lets-work-together',
    backgroundUrl: '/images/linkedin-templates/cover/lets-work-together/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'heading',
        kind: 'text',
        placeholder: "Let's Work Together",
        maxLength: 22,
        geometry: { xPct: 0.02, yPct: 0.29, maxWidthPct: 0.24, align: 'left', fontSizePx: 33, fontWeight: 400, color: '#ffffff', fontFamily: FONT_POPPINS, maxLines: 1 },
      },
      {
        id: 'phone',
        kind: 'text',
        staticLabel: 'Phone Number:',
        staticLabelFontSizePx: 12.6,
        staticLabelFontFamily: FONT_POPPINS,
        placeholder: '+123-456-7890',
        maxLength: 30,
        geometry: { xPct: 0.075, yPct: 0.44, maxWidthPct: 0.17, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff', maxLines: 1 },
      },
      {
        id: 'email',
        kind: 'text',
        staticLabel: 'Email Address:',
        staticLabelFontSizePx: 12.6,
        staticLabelFontFamily: FONT_POPPINS,
        placeholder: 'support@datacrumbs.org',
        maxLength: 40,
        geometry: { xPct: 0.075, yPct: 0.565, maxWidthPct: 0.17, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff', maxLines: 1 },
      },
      {
        id: 'website',
        kind: 'text',
        staticLabel: 'Website:',
        staticLabelFontSizePx: 12.6,
        staticLabelFontFamily: FONT_POPPINS,
        placeholder: 'www.datacrumbs.org',
        maxLength: 40,
        geometry: { xPct: 0.075, yPct: 0.69, maxWidthPct: 0.17, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff', maxLines: 1 },
      },
      {
        id: 'name',
        kind: 'text',
        defaultFrom: 'fullName',
        placeholder: 'Your Name',
        maxLength: 13,
        geometry: { xPct: 0.685, yPct: 0.22, maxWidthPct: 0.22, align: 'left', fontSizePx: 79, fontWeight: 400, color: '#ffffff', fontFamily: FONT_BRICOLAGE, lineHeightPx: 70, maxLines: 2 },
      },
      {
        id: 'title',
        kind: 'text',
        defaultFrom: 'currentPosition',
        placeholder: 'Your Title',
        maxLength: 18,
        geometry: { xPct: 0.685, yPct: 0.58, maxWidthPct: 0.22, align: 'left', fontSizePx: 38, fontWeight: 400, color: '#ffffff', maxLines: 1 },
      },
    ],
  },

  // Role-Synced Cover Mappings
  'stunning-websites': { id: 'stunning-websites', backgroundUrl: '/images/linkedin-banners/banner-1.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'purple-geometric': { id: 'purple-geometric', backgroundUrl: '/images/linkedin-banners/banner-6.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'blue-blocks': { id: 'blue-blocks', backgroundUrl: '/images/linkedin-banners/banner-7.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'yellow-wave': {
    id: 'yellow-wave',
    backgroundUrl: '/images/linkedin-templates/cover/ideas-inspire/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'tagline',
        kind: 'text',
        placeholder: 'Ideas that inspire.\nSolutions that last.',
        maxLength: 80,
        geometry: { xPct: 0.615, yPct: 0.26, maxWidthPct: 0.37, align: 'left', fontSizePx: 46, fontWeight: 600, color: '#ffffff', fontFamily: FONT_POPPINS, lineHeightPx: 62, maxLines: 2 },
      },
      {
        id: 'caption',
        kind: 'text',
        placeholder: 'DATACRUMBS.ORG',
        maxLength: 40,
        geometry: { xPct: 0.615, yPct: 0.68, maxWidthPct: 0.37, align: 'left', fontSizePx: 15, fontWeight: 700, color: '#e5e7eb', maxLines: 1 },
      },
    ],
  },
  'ai-engineer-badge': { id: 'ai-engineer-badge', backgroundUrl: '/images/linkedin-banners/banner-4.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },

  'data-engineer': { id: 'data-engineer', backgroundUrl: '/images/linkedin-banners/banner-6.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'devops-engineer': { id: 'devops-engineer', backgroundUrl: '/images/linkedin-banners/banner-5.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'mobile-app-developer': { id: 'mobile-app-developer', backgroundUrl: '/images/linkedin-banners/banner-1.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'ui-ux-designer': {
    id: 'ui-ux-designer',
    backgroundUrl: '/images/linkedin-templates/cover/ideas-inspire/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'tagline',
        kind: 'text',
        placeholder: 'Ideas that inspire.\nSolutions that last.',
        maxLength: 80,
        geometry: { xPct: 0.615, yPct: 0.26, maxWidthPct: 0.37, align: 'left', fontSizePx: 46, fontWeight: 600, color: '#ffffff', fontFamily: FONT_POPPINS, lineHeightPx: 62, maxLines: 2 },
      },
      {
        id: 'caption',
        kind: 'text',
        placeholder: 'DATACRUMBS.ORG',
        maxLength: 40,
        geometry: { xPct: 0.615, yPct: 0.68, maxWidthPct: 0.37, align: 'left', fontSizePx: 15, fontWeight: 700, color: '#e5e7eb', maxLines: 1 },
      },
    ],
  },
  'graphic-designer': {
    id: 'graphic-designer',
    backgroundUrl: '/images/linkedin-templates/cover/ideas-inspire/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'tagline',
        kind: 'text',
        placeholder: 'Ideas that inspire.\nSolutions that last.',
        maxLength: 80,
        geometry: { xPct: 0.615, yPct: 0.26, maxWidthPct: 0.37, align: 'left', fontSizePx: 46, fontWeight: 600, color: '#ffffff', fontFamily: FONT_POPPINS, lineHeightPx: 62, maxLines: 2 },
      },
      {
        id: 'caption',
        kind: 'text',
        placeholder: 'DATACRUMBS.ORG',
        maxLength: 40,
        geometry: { xPct: 0.615, yPct: 0.68, maxWidthPct: 0.37, align: 'left', fontSizePx: 15, fontWeight: 700, color: '#e5e7eb', maxLines: 1 },
      },
    ],
  },
  'video-editor': {
    id: 'video-editor',
    backgroundUrl: '/images/linkedin-templates/cover/ideas-inspire/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'tagline',
        kind: 'text',
        placeholder: 'Ideas that inspire.\nSolutions that last.',
        maxLength: 80,
        geometry: { xPct: 0.615, yPct: 0.26, maxWidthPct: 0.37, align: 'left', fontSizePx: 46, fontWeight: 600, color: '#ffffff', fontFamily: FONT_POPPINS, lineHeightPx: 62, maxLines: 2 },
      },
      {
        id: 'caption',
        kind: 'text',
        placeholder: 'DATACRUMBS.ORG',
        maxLength: 40,
        geometry: { xPct: 0.615, yPct: 0.68, maxWidthPct: 0.37, align: 'left', fontSizePx: 15, fontWeight: 700, color: '#e5e7eb', maxLines: 1 },
      },
    ],
  },
  'backend-developer': { id: 'backend-developer', backgroundUrl: '/images/linkedin-banners/banner-6.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'cloud-engineer': { id: 'cloud-engineer', backgroundUrl: '/images/linkedin-banners/banner-5.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'qa-test-automation': { id: 'qa-test-automation', backgroundUrl: '/images/linkedin-banners/banner-1.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'game-developer': { id: 'game-developer', backgroundUrl: '/images/linkedin-banners/banner-1.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'mlops-engineer': { id: 'mlops-engineer', backgroundUrl: '/images/linkedin-banners/banner-2.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'business-intelligence-analyst': { id: 'business-intelligence-analyst', backgroundUrl: '/images/linkedin-banners/banner-7.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'computer-vision-engineer': { id: 'computer-vision-engineer', backgroundUrl: '/images/linkedin-banners/banner-2.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'blockchain-web3-developer': { id: 'blockchain-web3-developer', backgroundUrl: '/images/linkedin-banners/banner-5.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'embedded-iot-engineer': { id: 'embedded-iot-engineer', backgroundUrl: '/images/linkedin-banners/banner-6.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'product-manager-tech': { id: 'product-manager-tech', backgroundUrl: '/images/linkedin-banners/banner-3.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'hr-talent-acquisition': { id: 'hr-talent-acquisition', backgroundUrl: '/images/linkedin-banners/banner-3.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'business-analyst-it': { id: 'business-analyst-it', backgroundUrl: '/images/linkedin-banners/banner-7.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'technical-writer': {
    id: 'technical-writer',
    backgroundUrl: '/images/linkedin-templates/cover/lets-work-together/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'heading',
        kind: 'text',
        placeholder: "Let's Work Together",
        maxLength: 22,
        geometry: { xPct: 0.02, yPct: 0.29, maxWidthPct: 0.24, align: 'left', fontSizePx: 33, fontWeight: 400, color: '#ffffff', fontFamily: FONT_POPPINS, maxLines: 1 },
      },
      {
        id: 'phone',
        kind: 'text',
        staticLabel: 'Phone Number:',
        staticLabelFontSizePx: 12.6,
        staticLabelFontFamily: FONT_POPPINS,
        placeholder: '+123-456-7890',
        maxLength: 30,
        geometry: { xPct: 0.075, yPct: 0.44, maxWidthPct: 0.17, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff', maxLines: 1 },
      },
      {
        id: 'email',
        kind: 'text',
        staticLabel: 'Email Address:',
        staticLabelFontSizePx: 12.6,
        staticLabelFontFamily: FONT_POPPINS,
        placeholder: 'support@datacrumbs.org',
        maxLength: 40,
        geometry: { xPct: 0.075, yPct: 0.565, maxWidthPct: 0.17, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff', maxLines: 1 },
      },
      {
        id: 'website',
        kind: 'text',
        staticLabel: 'Website:',
        staticLabelFontSizePx: 12.6,
        staticLabelFontFamily: FONT_POPPINS,
        placeholder: 'www.datacrumbs.org',
        maxLength: 40,
        geometry: { xPct: 0.075, yPct: 0.69, maxWidthPct: 0.17, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff', maxLines: 1 },
      },
      {
        id: 'name',
        kind: 'text',
        defaultFrom: 'fullName',
        placeholder: 'Your Name',
        maxLength: 13,
        geometry: { xPct: 0.685, yPct: 0.22, maxWidthPct: 0.22, align: 'left', fontSizePx: 79, fontWeight: 400, color: '#ffffff', fontFamily: FONT_BRICOLAGE, lineHeightPx: 70, maxLines: 2 },
      },
      {
        id: 'title',
        kind: 'text',
        defaultFrom: 'currentPosition',
        placeholder: 'Your Title',
        maxLength: 18,
        geometry: { xPct: 0.685, yPct: 0.58, maxWidthPct: 0.22, align: 'left', fontSizePx: 38, fontWeight: 400, color: '#ffffff', maxLines: 1 },
      },
    ],
  },
  'network-engineer': { id: 'network-engineer', backgroundUrl: '/images/linkedin-banners/banner-5.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
  'database-administrator': { id: 'database-administrator', backgroundUrl: '/images/linkedin-banners/banner-6.png', canvasWidthPx: 1584, canvasHeightPx: 396, fields: [] },
};
