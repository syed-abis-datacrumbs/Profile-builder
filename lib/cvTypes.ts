// CV data model — ported from the DataCrumbs LMS (cv-actions.ts) so the Resume
// Studio renders the SAME format and carries the SAME content (professional &
// student). The ported field samples in resumeSamples.ts are already this shape.

export type CvType = 'professional' | 'student';

export interface CvPersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  linkedin: string;
  linkedinLabel?: string;
  github: string;
  githubLabel: string;
  kaggle: string;
  kaggleLabel: string;
}

export interface CvEducation {
  institution: string;
  degree: string;
  start: string;
  end: string;
  location?: string;
}

export interface CvWorkExperience {
  company: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  /** One bullet per line ("\n"-separated); "**bold**" is the only markup. */
  bullets: string;
  /** Marker style for the bullets above. Absent = 'bullet' (back-compat). */
  bulletStyle?: 'bullet' | 'number';
}

export interface CvProject {
  /** One combined HTML field ("<strong>Title</strong> (Technologies) –
   *  Description") — a single editable region, not three glued together.
   *  Kept as one field (same pattern as CvWorkExperience.bullets) so a text
   *  selection can span the whole entry: browsers refuse to let a
   *  selection cross between two separate contentEditable elements, which
   *  is exactly what silently broke "select and delete" when title/
   *  technologies/description were three adjacent fields on one line. */
  content: string;
  title?: string;
  technologies?: string;
  date?: string;
  bullets?: string;
  /** Optional attached project URL (e.g. GitHub repo, live demo). */
  link?: string;
  /** Optional display label for the project link (e.g. '[Live Demo]', '[GitHub]'). */
  linkLabel?: string;
}

export interface CvCertification {
  name: string;
  organization: string;
}

/** Student-layout-only: a workshop/training. */
export interface CvWorkshop {
  /** One combined HTML field ("<strong>Title</strong>: Description") — see
   *  CvProject.content for why this is a single field, not two. */
  content: string;
}

export type CvTheme = 'classic' | 'latex-ats';

export interface CvData {
  resumeName?: string;
  /** Visual layout style. Absent = classic ATS serif. */
  theme?: CvTheme;
  /** Professional summary / executive statement. */
  summary?: string;
  /** Absent = professional (back-compat with the LMS). */
  cvType?: CvType;
  personalInfo: CvPersonalInfo;
  education: CvEducation[];
  workExperience: CvWorkExperience[];
  /** Only rendered for the "student" layout. */
  workshops?: CvWorkshop[];
  /** Marker style for the workshop list above. Absent = 'bullet'. */
  workshopsBulletStyle?: 'bullet' | 'number';
  projects: CvProject[];
  /** Marker style for the project list above. Absent = 'bullet'. */
  projectsBulletStyle?: 'bullet' | 'number';
  certifications: CvCertification[];
  additional: {
    skills: string;
    interests: string;
    /** Marker style for the Skills/Interests bullets. Absent = 'bullet'. */
    bulletStyle?: 'bullet' | 'number';
  };
}

// Strips leading bullet symbols (e.g. "•", "-", "*", "–", "—") and leading whitespace from a line.
export const cleanSingleBulletLine = (line: string): string => {
  if (!line) return '';
  return line
    .replace(/^(?:[\s\u2022\u2023\u2043\u25aa\u25b8\u25cf\u25cb\u25e6\u00b7\*\u2013\u2014]|-(?=\s|$))+/, '')
    .trim();
};

// Strips leading bullet symbols from multiline string bullet blocks.
export const cleanBulletText = (text: string): string => {
  if (!text) return '';
  return text
    .split('\n')
    .map(cleanSingleBulletLine)
    .join('\n');
};

// Converts markdown bold syntax ("**bold**" or "__bold__") to <strong> HTML.
export const mdBoldToHtml = (s: string): string =>
  (s || '')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>');

// Merges older project shapes into a single `content` field while converting markdown bold & stripping leading bullets.
function mergeProjectShape(raw: any): string {
  if (typeof raw?.content === 'string') {
    return cleanSingleBulletLine(mdBoldToHtml(raw.content));
  }
  const title = mdBoldToHtml(cleanSingleBulletLine(raw?.title || ''));
  const tech = mdBoldToHtml(raw?.technologies || '');
  const desc = mdBoldToHtml(cleanSingleBulletLine(raw?.description || ''));
  let out = title ? `<strong>${title}</strong>` : '';
  if (tech) out += out ? ` (${tech})` : `(${tech})`;
  if (desc) out += out ? ` – ${desc}` : desc;
  return cleanSingleBulletLine(out);
}

function mergeWorkshopShape(raw: any): string {
  if (typeof raw?.content === 'string') {
    return cleanSingleBulletLine(mdBoldToHtml(raw.content));
  }
  const title = mdBoldToHtml(cleanSingleBulletLine(raw?.title || ''));
  const desc = mdBoldToHtml(cleanSingleBulletLine(raw?.description || ''));
  let out = title ? `<strong>${title}</strong>` : '';
  if (desc) out += out ? `: ${desc}` : desc;
  return cleanSingleBulletLine(out);
}

/** Converts a sample CV's "**bold**" markdown to <strong> HTML in the fields
 *  that use it (bullets, descriptions, skills/interests), strips leading bullet symbols,
 *  and migrates older-shape projects/workshops into their single merged `content` field. */
export function cvMarkdownToHtml(cv: CvData): CvData {
  return {
    ...cv,
    summary: cv.summary ? cleanBulletText(mdBoldToHtml(cv.summary)) : undefined,
    workExperience: (cv.workExperience || []).map((w) => ({
      ...w,
      bullets: cleanBulletText(mdBoldToHtml(w.bullets || '')),
    })),
    projects: (cv.projects || []).map((p) => ({
      ...p,
      content: mergeProjectShape(p),
      bullets: p.bullets ? cleanBulletText(mdBoldToHtml(p.bullets)) : undefined,
    })),
    workshops: (cv.workshops || []).map((w) => ({
      ...w,
      content: mergeWorkshopShape(w),
    })),
    additional: {
      skills: mdBoldToHtml(cv.additional?.skills || ''),
      interests: mdBoldToHtml(cv.additional?.interests || ''),
      bulletStyle: cv.additional?.bulletStyle,
    },
  };
}

/** A blank CV — used as a safe fallback / "start from scratch". */
export const emptyCvData: CvData = {
  cvType: 'professional',
  personalInfo: {
    fullName: '',
    phone: '',
    email: '',
    linkedin: '',
    github: '',
    githubLabel: 'GitHub',
    kaggle: '',
    kaggleLabel: 'Kaggle',
  },
  education: [],
  workExperience: [],
  workshops: [],
  projects: [],
  certifications: [],
  additional: { skills: '', interests: '' },
};
