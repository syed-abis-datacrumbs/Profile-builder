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
}

export interface CvWorkExperience {
  company: string;
  title: string;
  start: string;
  end: string;
  /** One bullet per line ("\n"-separated); "**bold**" is the only markup. */
  bullets: string;
}

export interface CvProject {
  title: string;
  technologies: string;
  description: string;
}

export interface CvCertification {
  name: string;
  organization: string;
}

/** Student-layout-only: a workshop/training — title + one descriptive line. */
export interface CvWorkshop {
  title: string;
  description: string;
}

export interface CvData {
  resumeName?: string;
  /** Absent = professional (back-compat with the LMS). */
  cvType?: CvType;
  personalInfo: CvPersonalInfo;
  education: CvEducation[];
  workExperience: CvWorkExperience[];
  /** Only rendered for the "student" layout. */
  workshops?: CvWorkshop[];
  projects: CvProject[];
  certifications: CvCertification[];
  additional: {
    skills: string;
    interests: string;
  };
}

// The ported LMS samples store bold as "**markdown**". The Studio edits/renders
// rich text as HTML, so convert those to <strong> once on load.
const mdBoldToHtml = (s: string): string =>
  (s || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

/** Converts a sample CV's "**bold**" markdown to <strong> HTML in the fields
 *  that use it (bullets, descriptions, skills/interests). */
export function cvMarkdownToHtml(cv: CvData): CvData {
  return {
    ...cv,
    workExperience: (cv.workExperience || []).map((w) => ({ ...w, bullets: mdBoldToHtml(w.bullets) })),
    projects: (cv.projects || []).map((p) => ({ ...p, description: mdBoldToHtml(p.description) })),
    workshops: (cv.workshops || []).map((w) => ({ ...w, description: mdBoldToHtml(w.description) })),
    additional: {
      skills: mdBoldToHtml(cv.additional?.skills || ''),
      interests: mdBoldToHtml(cv.additional?.interests || ''),
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
