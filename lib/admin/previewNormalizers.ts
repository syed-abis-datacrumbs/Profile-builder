import type { CvData, CvPersonalInfo, CvEducation, CvWorkExperience, CvProject, CvCertification, CvWorkshop } from '@/lib/cvTypes';
import { cvMarkdownToHtml } from '@/lib/cvTypes';
import type { GithubProfileData } from '@/types';

export interface NormalizedLinkedinProfile {
  fullName: string;
  title: string;
  headline: string;
  location: string;
  currentCompany: string;
  school: string;
  about: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    start?: string;
    end?: string;
    description?: string;
    bullets?: string[];
  }[];
  education: {
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    start?: string;
    end?: string;
  }[];
  projects: {
    title: string;
    description: string;
    link?: string;
  }[];
  certifications: {
    name: string;
    organization: string;
    date?: string;
  }[];
  featuredPost?: string;
  openToWork: boolean;
  headshotUrl?: string;
  customCoverUrl?: string;
  coverTemplateId?: string;
  pfpGradientId?: string;
  followersCount?: string;
}

/** Converts markdown bold (**text**) to HTML <strong>text</strong> */
function mdToHtml(str: string): string {
  if (!str) return '';
  return str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Merges older project fields { title, technologies, description } into single content string */
function safeMergeProject(p: any): string {
  if (typeof p?.content === 'string' && p.content.trim()) return p.content;
  const title = mdToHtml(String(p?.title || ''));
  const tech = mdToHtml(String(p?.technologies || p?.tech || ''));
  const desc = mdToHtml(String(p?.description || ''));
  let out = title ? `<strong>${title}</strong>` : '';
  if (tech) out += out ? ` (${tech})` : `(${tech})`;
  if (desc) out += out ? ` – ${desc}` : desc;
  return out || 'Untitled Project';
}

/** Normalizes any raw/legacy resume object into a fully-backfilled CvData shape */
export function normalizeCvData(raw: any): CvData {
  if (!raw || typeof raw !== 'object') {
    return {
      cvType: 'professional',
      personalInfo: {
        fullName: 'Sample Candidate',
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
      projects: [],
      certifications: [],
      additional: { skills: '', interests: '' },
    };
  }

  const pRaw = raw.personalInfo || raw;
  const personalInfo: CvPersonalInfo = {
    fullName: String(pRaw.fullName || pRaw.name || ''),
    phone: String(pRaw.phone || ''),
    email: String(pRaw.email || ''),
    linkedin: String(pRaw.linkedin || ''),
    linkedinLabel: pRaw.linkedinLabel ? String(pRaw.linkedinLabel) : undefined,
    github: String(pRaw.github || ''),
    githubLabel: String(pRaw.githubLabel || 'GitHub'),
    kaggle: String(pRaw.kaggle || ''),
    kaggleLabel: String(pRaw.kaggleLabel || 'Kaggle'),
  };

  const rawEdu = Array.isArray(raw.education) ? raw.education : [];
  const education: CvEducation[] = rawEdu.map((e: any) => ({
    institution: String(e?.institution || e?.school || e?.college || ''),
    degree: String(e?.degree || e?.field || ''),
    start: String(e?.start || e?.startDate || ''),
    end: String(e?.end || e?.endDate || ''),
  }));

  const rawWork = Array.isArray(raw.workExperience)
    ? raw.workExperience
    : Array.isArray(raw.experiences)
    ? raw.experiences
    : [];
  const workExperience: CvWorkExperience[] = rawWork.map((w: any) => {
    let bulletsStr = '';
    if (Array.isArray(w?.bullets)) {
      bulletsStr = w.bullets.map((b: any) => String(b || '')).join('\n');
    } else if (typeof w?.bullets === 'string') {
      bulletsStr = w.bullets;
    } else if (typeof w?.description === 'string') {
      bulletsStr = w.description;
    }

    return {
      company: String(w?.company || w?.organization || ''),
      title: String(w?.title || w?.role || w?.position || ''),
      start: String(w?.start || w?.startDate || ''),
      end: String(w?.end || w?.endDate || ''),
      bullets: bulletsStr,
      bulletStyle: w?.bulletStyle === 'number' ? 'number' : 'bullet',
    };
  });

  const rawProjects = Array.isArray(raw.projects) ? raw.projects : [];
  const projects: CvProject[] = rawProjects.map((p: any) => ({
    content: safeMergeProject(p),
    link: p?.link || p?.url ? String(p.link || p.url) : undefined,
    linkLabel: p?.linkLabel ? String(p.linkLabel) : undefined,
  }));

  const rawCerts = Array.isArray(raw.certifications) ? raw.certifications : [];
  const certifications: CvCertification[] = rawCerts.map((c: any) => {
    if (typeof c === 'string') {
      return { name: c, organization: '' };
    }
    return {
      name: String(c?.name || c?.title || ''),
      organization: String(c?.organization || c?.issuer || ''),
    };
  });

  const rawWorkshops = Array.isArray(raw.workshops) ? raw.workshops : [];
  const workshops: CvWorkshop[] = rawWorkshops.map((ws: any) => {
    if (typeof ws?.content === 'string') return { content: ws.content };
    const title = mdToHtml(String(ws?.title || ''));
    const desc = mdToHtml(String(ws?.description || ''));
    return { content: title ? `<strong>${title}</strong>: ${desc}` : desc };
  });

  let skillsStr = '';
  if (typeof raw.additional?.skills === 'string') {
    skillsStr = raw.additional.skills;
  } else if (Array.isArray(raw.skills)) {
    skillsStr = raw.skills.join(', ');
  } else if (typeof raw.skills === 'string') {
    skillsStr = raw.skills;
  }

  const cv: CvData = {
    cvType: raw.cvType === 'student' ? 'student' : 'professional',
    personalInfo,
    education,
    workExperience,
    projects,
    certifications,
    workshops: workshops.length > 0 ? workshops : undefined,
    additional: {
      skills: skillsStr,
      interests: String(raw.additional?.interests || raw.interests || ''),
      bulletStyle: raw.additional?.bulletStyle === 'number' ? 'number' : 'bullet',
    },
  };

  return cvMarkdownToHtml(cv);
}

/** Normalizes any raw/legacy GitHub profile object into a fully-backfilled GithubProfileData */
export function normalizeGithubData(raw: any): GithubProfileData {
  if (!raw || typeof raw !== 'object') {
    return {
      username: 'developer',
      title: 'Full Stack Engineer',
      about: '',
      techStack: [],
      showStatsCard: true,
      showStreakCard: true,
      showTopLangsCard: true,
      theme: 'dark',
      socialLinks: {},
      customSections: [],
    };
  }

  const techStack = Array.isArray(raw.techStack)
    ? raw.techStack.map((t: any) => String(t || '')).filter(Boolean)
    : Array.isArray(raw.skills)
    ? raw.skills.map((s: any) => String(s || '')).filter(Boolean)
    : [];

  const rawSections = Array.isArray(raw.customSections) ? raw.customSections : [];
  const customSections = rawSections.map((cs: any) => ({
    title: String(cs?.title || 'Section'),
    content: String(cs?.content || ''),
  }));

  const validThemes = ['dark', 'tokyonight', 'radial', 'dracula', 'cyberpunk'] as const;
  const theme = validThemes.includes(raw.theme) ? raw.theme : 'dark';

  return {
    username: String(raw.username || 'developer'),
    name: raw?.name ? String(raw.name) : undefined,
    title: String(raw.title || raw.role || ''),
    about: String(raw.about || raw.bio || ''),
    bannerUrl: raw.bannerUrl ? String(raw.bannerUrl) : undefined,
    avatarUrl: raw.avatarUrl ? String(raw.avatarUrl) : undefined,
    techStack,
    showStatsCard: Boolean(raw.showStatsCard ?? true),
    showStreakCard: Boolean(raw.showStreakCard ?? true),
    showTopLangsCard: Boolean(raw.showTopLangsCard ?? true),
    theme,
    socialLinks: raw.socialLinks && typeof raw.socialLinks === 'object' ? raw.socialLinks : {},
    customSections,
  };
}

/** Normalizes any LinkedIn payload (rich profile or plain profile) into a NormalizedLinkedinProfile */
export function normalizeLinkedinData(raw: any): NormalizedLinkedinProfile {
  if (!raw || typeof raw !== 'object') {
    return {
      fullName: 'LinkedIn Professional',
      title: 'Professional',
      headline: '',
      location: 'Worldwide',
      currentCompany: '',
      school: '',
      about: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      openToWork: true,
    };
  }

  // Handle experience across rich template & standard optimizer shapes
  let experience: NormalizedLinkedinProfile['experience'] = [];
  if (Array.isArray(raw.experience)) {
    experience = raw.experience.map((e: any) => ({
      title: String(e?.title || e?.role || 'Role'),
      company: String(e?.company || 'Company'),
      start: e?.start ? String(e.start) : undefined,
      end: e?.end ? String(e.end) : undefined,
      description: e?.description ? String(e.description) : undefined,
      bullets: Array.isArray(e?.bullets) ? e.bullets.map(String) : undefined,
    }));
  } else if (Array.isArray(raw.experienceHighlights)) {
    experience = raw.experienceHighlights.map((eh: any) => ({
      title: 'Experience Highlight',
      company: '',
      description: String(eh || ''),
    }));
  }

  const rawEdu = Array.isArray(raw.education) ? raw.education : [];
  const education = rawEdu.map((ed: any) => ({
    school: String(ed?.school || ed?.institution || 'Institution'),
    degree: ed?.degree ? String(ed.degree) : undefined,
    fieldOfStudy: ed?.fieldOfStudy || ed?.field ? String(ed.fieldOfStudy || ed.field) : undefined,
    start: ed?.start ? String(ed.start) : undefined,
    end: ed?.end ? String(ed.end) : undefined,
  }));

  const rawProjects = Array.isArray(raw.projects) ? raw.projects : [];
  const projects = rawProjects.map((p: any) => ({
    title: String(p?.title || 'Project'),
    description: String(p?.description || p?.content || ''),
    link: p?.link || p?.url ? String(p.link || p.url) : undefined,
  }));

  const rawCerts = Array.isArray(raw.certifications) ? raw.certifications : [];
  const certifications = rawCerts.map((c: any) => ({
    name: String(c?.name || c?.title || 'Certificate'),
    organization: String(c?.organization || c?.issuer || ''),
    date: c?.date ? String(c.date) : undefined,
  }));

  const skills = Array.isArray(raw.skills)
    ? raw.skills.map(String)
    : Array.isArray(raw.keySkills)
    ? raw.keySkills.map(String)
    : [];

  return {
    fullName: String(raw.fullName || raw.name || 'LinkedIn Member'),
    title: String(raw.title || raw.targetRole || raw.headline || ''),
    headline: String(raw.headline || raw.title || ''),
    location: String(raw.location || 'Worldwide'),
    currentCompany: String(raw.currentCompany || (experience[0]?.company ?? '')),
    school: String(raw.school || (education[0]?.school ?? '')),
    about: String(raw.about || ''),
    skills,
    experience,
    education,
    projects,
    certifications,
    featuredPost: raw.featuredPost ? String(raw.featuredPost) : undefined,
    openToWork: Boolean(raw.openToWork ?? true),
    headshotUrl: raw.headshotUrl ? String(raw.headshotUrl) : undefined,
    customCoverUrl: raw.customCoverUrl ? String(raw.customCoverUrl) : undefined,
    coverTemplateId: raw.coverTemplateId ? String(raw.coverTemplateId) : undefined,
    pfpGradientId: raw.pfpGradientId ? String(raw.pfpGradientId) : undefined,
    followersCount: raw.followersCount ? String(raw.followersCount) : undefined,
  };
}
