// The editable profile shape used by the template Edit flow (LinkedinChatStudio) —
// distinct from the app's generic `LinkedinProfileData` (types/index.ts, used by
// the plain "Open Optimizer Editor" and the general AI Assistant tab). Kept
// separate so this richer, template-driven schema never has to touch those
// unrelated flows.

import { linkedinCovers, getDefaultPfpGradientId } from './linkedinCovers';
import {
  linkedinTemplateSamples,
  LinkedinTemplateSampleExperience,
  LinkedinTemplateSampleEducation,
  LinkedinTemplateSampleCertification,
  LinkedinTemplateSampleProject,
  LinkedinTemplateSampleAward,
  LinkedinActivityPost,
  LinkedinRecommendation,
  DEFAULT_SAMPLE_ACTIVITY,
  DEFAULT_SAMPLE_RECOMMENDATIONS,
} from './linkedinTemplateSamples';
import { COVER_ART, COVER_ART_ORDER, CoverArtField, getCoverArtId } from './linkedinCoverArt';

export interface LinkedinRichProfile {
  fullName: string;
  title: string;
  headline: string;
  location: string;
  currentCompany: string;
  school: string;
  about: string;
  skills: string[];
  experience: LinkedinTemplateSampleExperience[];
  education: LinkedinTemplateSampleEducation[];
  certifications: LinkedinTemplateSampleCertification[];
  projects: LinkedinTemplateSampleProject[];
  awards: LinkedinTemplateSampleAward[];
  followersCount: string;
  activity: LinkedinActivityPost[];
  recommendations: LinkedinRecommendation[];
  /** One of COVER_ART_ORDER — which of the 8 real LMS cover designs is active. */
  coverTemplateId: string;
  /** Editable copy of that cover's baked-on text, keyed by CoverArtField.id. */
  coverFieldValues: Record<string, string | string[]>;
  /** One of gradient-1..gradient-10 — the avatar's backdrop. */
  pfpGradientId: string;
  /** Object URL (user-uploaded) or the shared dummy headshot path. */
  headshotUrl: string;
  /** Custom user-uploaded cover banner image URL (base64 or blob URL). */
  customCoverUrl?: string;
}

export const PFP_GRADIENT_IDS = Array.from({ length: 10 }, (_, i) => `gradient-${i + 1}`);

export const FEMALE_HEADSHOT_URL = '/images/linkedin-templates/pfp/sample-headshot.png';
export const MALE_HEADSHOT_URL = '/images/github-profile/git-profile-1.png';
export const DEFAULT_HEADSHOT_URL = FEMALE_HEADSHOT_URL;

export function isMaleName(name: string): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  
  const femaleKeywords = [
    'zoya', 'areeba', 'hira', 'kiran', 'rimsha', 'nimra', 'laiba', 
    'maryam', 'marium', 'sadia', 'anum', 'ayesha', 'sana', 'mahnoor', 
    'fatima', 'zainab', 'ananya', 'iqra', 'kinza', 'alishba', 'bisma', 
    'hadiya', 'fabiha', 'esha', 'bushra', 'sumaira', 'sidra', 'samra', 
    'komal', 'mehak', 'amna', 'maria', 'natasha', 'alizeh', 'saman', 
    'rabia', 'maham', 'tuba', 'farah', 'nida', 'fariha', 'hafsa', 
    'tayyaba', 'aliza', 'fiza', 'yumna', 'umme', 'sobia', 'nadia', 
    'uzma', 'samina', 'shazia', 'rubab', 'rida', 'hina', 'asma', 
    'sehar', 'tania', 'sarah', 'emily', 'jessica', 'amanda', 
    'sophia', 'jane', 'alice', 'hannah', 'chloe', 'emma', 'olivia', 
    'ava', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn', 
    'abigail', 'ella', 'elizabeth', 'camila', 'luna', 'sofia', 'avery', 
    'mila', 'aria', 'scarlett', 'penelope', 'layla', 'victoria', 
    'madison', 'eleanor', 'grace', 'nora', 'riley', 'zoey', 'hazel', 
    'lily', 'ellie', 'violet', 'lillian', 'zoe', 'stella', 'aurora', 
    'natalie', 'emilia', 'everly', 'leah', 'aubrey', 'willow', 'addison', 
    'lucy', 'audrey', 'bella', 'nova', 'claire', 'skylar', 'peyton', 
    'sadie', 'hailey', 'eva', 'naomi', 'elena', 'mary', 'patricia', 
    'jennifer', 'linda', 'barbara', 'susan', 'karen', 'lisa', 'nancy', 
    'betty', 'margaret', 'sandra', 'ashley', 'kimberly', 'donna', 
    'michelle', 'carol', 'dorothy', 'melissa', 'deborah', 'stephanie', 
    'rebecca', 'sharon', 'laura', 'cynthia', 'kathleen', 'amy', 'angela', 
    'shirley', 'anna', 'brenda', 'pamela', 'nicole'
  ];

  for (const femaleName of femaleKeywords) {
    if (new RegExp(`\\b${femaleName}\\b`, 'i').test(lower)) {
      return false;
    }
  }

  return true;
}

export function getHeadshotForName(fullName: string): string {
  return isMaleName(fullName) ? MALE_HEADSHOT_URL : FEMALE_HEADSHOT_URL;
}

function resolveFieldValue(
  field: CoverArtField,
  identity: Pick<LinkedinRichProfile, 'fullName' | 'title' | 'currentCompany'>
): string | string[] {
  if (field.defaultFrom === 'fullName') return identity.fullName;
  if (field.defaultFrom === 'currentPosition') return identity.title;
  if (field.defaultFrom === 'currentCompany') return identity.currentCompany;
  return field.placeholder;
}

/** Default field values for a given cover template, seeded from the profile's
 *  name/title/company for the fields bound to them — used both on initial
 *  load and whenever the user switches to a different cover template. */
export function buildCoverFieldValues(
  coverTemplateId: string,
  identity: Pick<LinkedinRichProfile, 'fullName' | 'title' | 'currentCompany'>
): Record<string, string | string[]> {
  const art = COVER_ART[coverTemplateId];
  const values: Record<string, string | string[]> = {};
  if (!art) return values;
  for (const field of art.fields) {
    values[field.id] = resolveFieldValue(field, identity);
  }
  return values;
}

export function resolveCoverTemplateId(templateId: string): string {
  const index = linkedinCovers.findIndex((c) => c.id === templateId);
  const validIndex = Math.max(0, index);
  const cover = linkedinCovers[validIndex];
  return COVER_ART[cover.id] ? cover.id : getCoverArtId(validIndex);
}

/** Seeds a fresh editable profile from a gallery template selection — mirrors
 *  exactly what LinkedinTemplatePreview shows, so "Edit this profile" opens
 *  with the same content the user just previewed. */
export function buildInitialRichProfile(templateId: string): LinkedinRichProfile {
  const index = linkedinCovers.findIndex((c) => c.id === templateId);
  const validIndex = Math.max(0, index);
  const cover = linkedinCovers[validIndex];
  const sample = linkedinTemplateSamples[cover.id] ?? linkedinTemplateSamples[linkedinCovers[0].id];
  const coverTemplateId = resolveCoverTemplateId(templateId);
  const pfpGradientId = getDefaultPfpGradientId(validIndex);

  const identity = { fullName: sample.fullName, title: sample.title, currentCompany: sample.currentCompany };

  return {
    fullName: sample.fullName,
    title: sample.title,
    headline: sample.headline,
    location: sample.location,
    currentCompany: sample.currentCompany,
    school: sample.school,
    about: sample.about,
    skills: [...sample.skills],
    experience: sample.experience.map((e) => ({ ...e })),
    education: sample.education.map((e) => ({ ...e })),
    certifications: sample.certifications.map((c) => ({ ...c })),
    projects: sample.projects.map((p) => ({ ...p })),
    awards: sample.awards.map((a) => ({ ...a })),
    followersCount: '1,280',
    activity: sample.activity ? sample.activity.map((a) => ({ ...a })) : [...DEFAULT_SAMPLE_ACTIVITY],
    recommendations: sample.recommendations ? sample.recommendations.map((r) => ({ ...r })) : [...DEFAULT_SAMPLE_RECOMMENDATIONS],
    coverTemplateId,
    coverFieldValues: buildCoverFieldValues(coverTemplateId, identity),
    pfpGradientId,
    headshotUrl: getHeadshotForName(sample.fullName),
  };
}

/** Returns the default rich profile, seeded with all sections from the first cover template. */
export function buildDefaultRichProfile(userName?: string): LinkedinRichProfile {
  const profile = buildInitialRichProfile(linkedinCovers[0].id);
  if (userName && userName.trim()) {
    profile.fullName = userName.trim();
    profile.headshotUrl = getHeadshotForName(userName.trim());
  }
  return profile;
}

export const PLACEHOLDER_EXPERIENCE = [
  {
    title: '',
    company: '',
    start: '',
    end: '',
    description: '',
  },
];

export const PLACEHOLDER_EDUCATION = [
  {
    school: '',
    degree: '',
    fieldOfStudy: '',
    start: '',
    end: '',
  },
];

export const PLACEHOLDER_CERTIFICATIONS = [
  {
    name: '',
    organization: '',
    date: '',
  },
];

export const PLACEHOLDER_PROJECTS = [
  {
    title: '',
    description: '',
  },
];

export const PLACEHOLDER_ACTIVITY: LinkedinActivityPost[] = [
  {
    id: 'post-ph-1',
    timeAgo: 'Just now',
    content: '',
    likes: 0,
    comments: 0,
  },
];

export const PLACEHOLDER_RECOMMENDATIONS: LinkedinRecommendation[] = [
  {
    id: 'rec-ph-1',
    recommenderName: '',
    recommenderAvatar: '/images/featured-thumbnail/mutual connection.png',
    recommenderTitle: '',
    relationship: '',
    text: '',
  },
];

export const LOREM_IPSUM_ABOUT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

/** Removes the active template from a profile, returning it to the default placeholder state ("Your name", blank avatar, etc.)
 *  with the About section filled with Lorem Ipsum, and all sections persisting with placeholder text. */
export function removeTemplateFromRichProfile(_profile?: LinkedinRichProfile): LinkedinRichProfile {
  return {
    fullName: '',
    title: '',
    headline: '',
    location: '',
    currentCompany: '',
    school: '',
    about: LOREM_IPSUM_ABOUT,
    skills: [],
    experience: [{ title: '', company: '', start: '', end: '', description: '' }],
    education: [{ school: '', degree: '', fieldOfStudy: '', start: '', end: '' }],
    certifications: [{ name: '', organization: '', date: '' }],
    projects: [{ title: '', description: '' }],
    awards: [],
    followersCount: '500+',
    activity: [{ id: 'post-ph-1', timeAgo: 'Just now', content: '', likes: 0, comments: 0 }],
    recommendations: [{ id: 'rec-ph-1', recommenderName: '', recommenderAvatar: '/images/featured-thumbnail/mutual connection.png', recommenderTitle: '', relationship: '', text: '' }],
    coverTemplateId: '',
    coverFieldValues: {},
    pfpGradientId: '',
    headshotUrl: '',
    customCoverUrl: '',
  };
}

/** Removes HTML tags, entity references, and markdown bold/bullet formatting for plain text fields like LinkedIn. */
export function cleanPlainText(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/^[•\-\*]\s*/gm, '')
    .trim();
}

/** Cleans all HTML/markdown bold tags (like <strong>) from all text fields in a LinkedinRichProfile. */
export function sanitizeRichProfile(profile: LinkedinRichProfile): LinkedinRichProfile {
  if (!profile) return profile;
  return {
    ...profile,
    fullName: cleanPlainText(profile.fullName),
    title: cleanPlainText(profile.title),
    headline: cleanPlainText(profile.headline),
    location: cleanPlainText(profile.location),
    currentCompany: cleanPlainText(profile.currentCompany),
    school: cleanPlainText(profile.school),
    about: cleanPlainText(profile.about),
    skills: (profile.skills || []).map((s) => cleanPlainText(s)).filter(Boolean),
    experience: (profile.experience || []).map((exp) => ({
      ...exp,
      title: cleanPlainText(exp.title),
      company: cleanPlainText(exp.company),
      start: cleanPlainText(exp.start),
      end: cleanPlainText(exp.end),
      description: exp.description
        ? exp.description
            .split('\n')
            .map((line) => cleanPlainText(line))
            .join('\n')
        : '',
    })),
    education: (profile.education || []).map((edu) => ({
      ...edu,
      school: cleanPlainText(edu.school),
      degree: cleanPlainText(edu.degree),
      fieldOfStudy: cleanPlainText(edu.fieldOfStudy),
      start: cleanPlainText(edu.start),
      end: cleanPlainText(edu.end),
    })),
    certifications: (profile.certifications || []).map((cert) => ({
      ...cert,
      name: cleanPlainText(cert.name),
      organization: cleanPlainText(cert.organization),
      date: cleanPlainText(cert.date),
    })),
    projects: (profile.projects || []).map((proj) => ({
      ...proj,
      title: cleanPlainText(proj.title),
      description: cleanPlainText(proj.description),
    })),
  };
}

/** Returns a blank/initial profile with "Your name" placeholder state and Lorem Ipsum in About. */
export function buildEmptyRichProfile(): LinkedinRichProfile {
  return removeTemplateFromRichProfile();
}

export { COVER_ART, COVER_ART_ORDER };
