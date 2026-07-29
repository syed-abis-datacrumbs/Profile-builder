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
  /** One of COVER_ART_ORDER — which of the 8 real LMS cover designs is active. */
  coverTemplateId: string;
  /** Editable copy of that cover's baked-on text, keyed by CoverArtField.id. */
  coverFieldValues: Record<string, string | string[]>;
  /** One of gradient-1..gradient-10 — the avatar's backdrop. */
  pfpGradientId: string;
  /** Object URL (user-uploaded) or the shared dummy headshot path. */
  headshotUrl: string;
}

export const PFP_GRADIENT_IDS = Array.from({ length: 10 }, (_, i) => `gradient-${i + 1}`);

export const DEFAULT_HEADSHOT_URL = '/images/linkedin-templates/pfp/sample-headshot.png';

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
    coverTemplateId,
    coverFieldValues: buildCoverFieldValues(coverTemplateId, identity),
    pfpGradientId,
    headshotUrl: DEFAULT_HEADSHOT_URL,
  };
}

export { COVER_ART, COVER_ART_ORDER };
