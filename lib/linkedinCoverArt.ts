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
  geometry: CoverArtFieldGeometry;
};

export type CoverArtTemplate = {
  id: string;
  backgroundUrl: string;
  canvasWidthPx: number;
  canvasHeightPx: number;
  fields: CoverArtField[];
};

// The order the LMS's 8 real templates cycle onto the 28 career-track cards
// (see lib/linkedinCovers.ts) — index % 8 into this array picks which art +
// field layout a given card's preview renders.
export const COVER_ART_ORDER = [
  'ideas-inspire',
  'lets-work-together',
  'helping-businesses',
  'stunning-websites',
  'purple-geometric',
  'blue-blocks',
  'yellow-wave',
  'ai-engineer-badge',
] as const;

export function getCoverArtId(index: number): string {
  const n = COVER_ART_ORDER.length;
  return COVER_ART_ORDER[((index % n) + n) % n];
}

export const COVER_ART: Record<string, CoverArtTemplate> = {
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
        geometry: { xPct: 0.615, yPct: 0.26, maxWidthPct: 0.37, align: 'left', fontSizePx: 46, fontWeight: 600, color: '#ffffff', fontFamily: FONT_POPPINS, lineHeightPx: 62 },
      },
      {
        id: 'caption',
        kind: 'text',
        placeholder: 'DATACRUMBS.ORG',
        geometry: { xPct: 0.615, yPct: 0.68, maxWidthPct: 0.37, align: 'left', fontSizePx: 15, fontWeight: 700, color: '#e5e7eb' },
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
        geometry: { xPct: 0.02, yPct: 0.29, maxWidthPct: 0.24, align: 'left', fontSizePx: 33, fontWeight: 400, color: '#ffffff', fontFamily: FONT_POPPINS, maxLines: 1 },
      },
      {
        id: 'phone',
        kind: 'text',
        staticLabel: 'Phone Number:',
        staticLabelFontSizePx: 12.6,
        staticLabelFontFamily: FONT_POPPINS,
        placeholder: '+123-456-7890',
        geometry: { xPct: 0.075, yPct: 0.44, maxWidthPct: 0.17, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff' },
      },
      {
        id: 'email',
        kind: 'text',
        staticLabel: 'Email Address:',
        staticLabelFontSizePx: 12.6,
        staticLabelFontFamily: FONT_POPPINS,
        placeholder: 'support@datacrumbs.org',
        geometry: { xPct: 0.075, yPct: 0.565, maxWidthPct: 0.17, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff' },
      },
      {
        id: 'website',
        kind: 'text',
        staticLabel: 'Website:',
        staticLabelFontSizePx: 12.6,
        staticLabelFontFamily: FONT_POPPINS,
        placeholder: 'www.datacrumbs.org',
        geometry: { xPct: 0.075, yPct: 0.69, maxWidthPct: 0.17, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff' },
      },
      {
        id: 'name',
        kind: 'text',
        defaultFrom: 'fullName',
        placeholder: 'Your Name',
        geometry: { xPct: 0.685, yPct: 0.22, maxWidthPct: 0.22, align: 'left', fontSizePx: 79, fontWeight: 400, color: '#ffffff', fontFamily: FONT_BRICOLAGE, lineHeightPx: 70, maxLines: 2 },
      },
      {
        id: 'title',
        kind: 'text',
        defaultFrom: 'currentPosition',
        placeholder: 'Your Title',
        geometry: { xPct: 0.685, yPct: 0.58, maxWidthPct: 0.22, align: 'left', fontSizePx: 38, fontWeight: 400, color: '#ffffff', maxLines: 1 },
      },
    ],
  },
  'helping-businesses': {
    id: 'helping-businesses',
    backgroundUrl: '/images/linkedin-templates/cover/helping-businesses/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'headline',
        kind: 'text',
        placeholder: 'Helping Businesses Scale\nThrough Paid Marketing',
        geometry: { xPct: 0.395, yPct: 0.18, maxWidthPct: 0.56, align: 'left', fontSizePx: 53, fontWeight: 800, color: '#ffffff', fontFamily: FONT_POPPINS, lineHeightPx: 50 },
      },
      {
        id: 'pills',
        kind: 'pills',
        placeholder: ['Email Lead Generation', 'Social Media Ads', 'SEO'],
        geometry: { xPct: 0.595, yPct: 0.6, maxWidthPct: 0.44, align: 'center', fontSizePx: 16, fontWeight: 500, color: '#ffffff', fontFamily: FONT_POPPINS, pillBg: 'rgba(0,0,0,0.35)', pillGapPx: 14 },
      },
      {
        id: 'caption',
        kind: 'text',
        placeholder: 'DATACRUMBS.ORG',
        geometry: { xPct: 0.83, yPct: 0.82, maxWidthPct: 0.15, align: 'right', fontSizePx: 13, fontWeight: 700, color: '#ffffff', fontFamily: FONT_POPPINS },
      },
    ],
  },
  'stunning-websites': {
    id: 'stunning-websites',
    backgroundUrl: '/images/linkedin-templates/cover/stunning-websites/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'headline',
        kind: 'text',
        placeholder: 'Helping Brands Build\nStunning Websites',
        geometry: { xPct: 0.395, yPct: 0.16, maxWidthPct: 0.56, align: 'left', fontSizePx: 50, fontWeight: 800, color: '#ffffff', fontFamily: FONT_POPPINS, lineHeightPx: 52 },
      },
      {
        id: 'pills',
        kind: 'pills',
        placeholder: ['WordPress Website Development', 'Website Design', 'Web Services', 'Website Strategy', 'Web SEO Optimization'],
        geometry: { xPct: 0.395, yPct: 0.5, maxWidthPct: 0.56, align: 'left', fontSizePx: 14, fontWeight: 600, color: '#ffffff', fontFamily: FONT_POPPINS, pillBg: '#0e7490', pillGapPx: 12 },
      },
      {
        id: 'banner',
        kind: 'pills',
        placeholder: ['Trusted by 200+ Satisfied Clients Worldwide'],
        geometry: { xPct: 0.395, yPct: 0.78, maxWidthPct: 0.56, align: 'left', fontSizePx: 15, fontWeight: 700, color: '#ffffff', fontFamily: FONT_POPPINS, pillBg: '#06b6d4' },
      },
    ],
  },
  'purple-geometric': {
    id: 'purple-geometric',
    backgroundUrl: '/images/linkedin-templates/cover/purple-geometric/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'name',
        kind: 'text',
        defaultFrom: 'fullName',
        placeholder: 'Mahnoor Khan',
        geometry: { xPct: 0.685, yPct: 0.3, maxWidthPct: 0.28, align: 'left', fontSizePx: 46, fontWeight: 550, color: '#ffffff', fontFamily: FONT_DANCING_SCRIPT, lineHeightPx: 52, maxLines: 1 },
      },
      {
        id: 'title',
        kind: 'text',
        defaultFrom: 'currentPosition',
        placeholder: 'Graphic Designer',
        geometry: { xPct: 0.685, yPct: 0.43, maxWidthPct: 0.28, align: 'left', fontSizePx: 24, fontWeight: 400, color: '#ffffff', fontFamily: FONT_POPPINS, maxLines: 1 },
      },
      {
        id: 'phone',
        kind: 'text',
        placeholder: '123-456-7890',
        geometry: { xPct: 0.685, yPct: 0.57, maxWidthPct: 0.28, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff', fontFamily: FONT_POPPINS },
      },
      {
        id: 'email',
        kind: 'text',
        placeholder: 'support@datacrumbs.org',
        geometry: { xPct: 0.685, yPct: 0.65, maxWidthPct: 0.28, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff', fontFamily: FONT_POPPINS },
      },
      {
        id: 'website',
        kind: 'text',
        placeholder: 'datacrumbs.org',
        geometry: { xPct: 0.685, yPct: 0.73, maxWidthPct: 0.28, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#ffffff', fontFamily: FONT_POPPINS },
      },
    ],
  },
  'blue-blocks': {
    id: 'blue-blocks',
    backgroundUrl: '/images/linkedin-templates/cover/blue-blocks/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'headline',
        kind: 'text',
        placeholder: 'Helping brands\nspeak, sell, and\nscale with words.',
        geometry: { xPct: 0.565, yPct: 0.2, maxWidthPct: 0.3, align: 'left', fontSizePx: 50, fontWeight: 900, color: '#16215c', fontFamily: FONT_PLAYFAIR, lineHeightPx: 50 },
      },
      {
        id: 'phone',
        kind: 'text',
        placeholder: '123-456-7890',
        geometry: { xPct: 0.63, yPct: 0.643, maxWidthPct: 0.38, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#16215c' },
      },
      {
        id: 'email',
        kind: 'text',
        placeholder: 'support@datacrumbs.org',
        geometry: { xPct: 0.63, yPct: 0.74, maxWidthPct: 0.38, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#16215c' },
      },
      {
        id: 'website',
        kind: 'text',
        placeholder: 'lms.datacrumbs.org',
        geometry: { xPct: 0.63, yPct: 0.843, maxWidthPct: 0.38, align: 'left', fontSizePx: 16, fontWeight: 400, color: '#16215c' },
      },
    ],
  },
  'yellow-wave': {
    id: 'yellow-wave',
    backgroundUrl: '/images/linkedin-templates/cover/yellow-wave/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'name',
        kind: 'text',
        defaultFrom: 'fullName',
        placeholder: 'Aun Ali',
        geometry: { xPct: 0.685, yPct: 0.28, maxWidthPct: 0.28, align: 'left', fontSizePx: 68, fontWeight: 700, color: '#1a1a2e', fontFamily: FONT_POPPINS, maxLines: 1 },
      },
      {
        id: 'title',
        kind: 'text',
        defaultFrom: 'currentPosition',
        placeholder: 'Graphic Designer',
        geometry: { xPct: 0.685, yPct: 0.49, maxWidthPct: 0.28, align: 'left', fontSizePx: 22, fontWeight: 400, color: '#1a1a2e', fontFamily: FONT_POPPINS, maxLines: 1 },
      },
      {
        id: 'website',
        kind: 'text',
        placeholder: 'datacrumbs.org',
        geometry: { xPct: 0.685, yPct: 0.6, maxWidthPct: 0.28, align: 'left', fontSizePx: 18, fontWeight: 400, color: '#1a1a2e' },
      },
    ],
  },
  'ai-engineer-badge': {
    id: 'ai-engineer-badge',
    backgroundUrl: '/images/linkedin-templates/cover/ai-engineer-badge/background.png',
    canvasWidthPx: 1584,
    canvasHeightPx: 396,
    fields: [
      {
        id: 'title',
        kind: 'text',
        defaultFrom: 'currentPosition',
        placeholder: 'AI Engineer',
        geometry: { xPct: 0.58, yPct: 0.3, maxWidthPct: 0.39, align: 'left', fontSizePx: 72, fontWeight: 800, color: '#ffffff', fontFamily: FONT_POPPINS, lineHeightPx: 64, maxLines: 2 },
      },
      {
        id: 'company',
        kind: 'text',
        defaultFrom: 'currentCompany',
        placeholder: 'DATACRUMBS',
        geometry: { xPct: 0.586, yPct: 0.7, maxWidthPct: 0.39, align: 'left', fontSizePx: 32, fontWeight: 600, color: '#dbb3d2', fontFamily: FONT_POPPINS, maxLines: 1 },
      },
    ],
  },
};
