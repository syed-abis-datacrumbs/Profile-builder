export interface LinkedinCoverTemplate {
  id: string;
  name: string;
  desc: string;
  thumbnail?: string;
  defaultPfpId?: string;
}

// Same convention the LMS itself follows: each cover template was designed
// off one of the numbered "Gradient N" reference mockups (datacrumbs-lms's
// `cover templates/Gradient N.png`), and by default pairs with the PFP
// template of that same number (`pfp/gradient-N`) — not sequential array
// order. Verified by visually matching each Gradient N.png mockup's baked-in
// sample copy against our 8 template ids:
//   Gradient 1 "Let's Work Together" -> lets-work-together
//   Gradient 2 "Helping Businesses Scale" -> helping-businesses
//   Gradient 3 "Stunning Websites" -> stunning-websites
//   Gradient 4 "Ideas that inspire" -> ideas-inspire
//   Gradient 5 "Mahnoor Khan / Graphic Designer" (cursive) -> purple-geometric
//   Gradient 6 "Helping brands speak..." (blue blocks) -> blue-blocks
//   Gradient 7 "Aun Ali / Graphic Designer" (yellow wave) -> yellow-wave
//   Gradient 8 "AI Engineer / Datacrumbs" -> ai-engineer-badge
const COVER_INDEX_TO_PFP_GRADIENT = [
  'gradient-4', // index 0: banner-1
  'gradient-1', // index 1: banner-2
  'gradient-2', // index 2: banner-3
  'gradient-3', // index 3: banner-4
  'gradient-5', // index 4: banner-5
  'gradient-6', // index 5: banner-6
  'gradient-7', // index 6: banner-7
];

/** Helper function returning the exact matching default PFP gradient template ID for each cover template */
export function getDefaultPfpGradientId(index: number): string {
  const safeIndex = Math.max(0, index);
  return COVER_INDEX_TO_PFP_GRADIENT[safeIndex % COVER_INDEX_TO_PFP_GRADIENT.length];
}

// The LinkedIn COVER (banner) templates the DataCrumbs (LMS) builder actually
// offers — its LinkedIn tool is a cover + profile-picture studio. The real
// banner artwork + gradient profile-picture backdrops were copied from the LMS
// into public/images/linkedin-templates/, so these previews use the actual
// assets: cover banner = cover/<id>/background.png, sample avatar = a pfp
// gradient.
//
// Names below are the student career-track labels the LMS LinkedIn Builder
// uses for its sample profiles (src/app/student/linkedin-builder/
// sampleLinkedInProfiles.ts), so this gallery reads as "one card per track"
// like the LMS does. Every track now has its own gallery-card thumbnail at
// public/images/linkedin-templates/thumbnails/<id>.png (only the first 8
// tracks have unique cover-art/text-field designs behind the "Use Template"
// preview — see lib/linkedinCoverArt.ts — the rest cycle through those same
// 8 layouts, but the gallery card thumbnail itself is unique per track).
// Shared between the landing gallery and the template preview screen — see
// lib/linkedinTemplateSamples.ts for the matching per-track sample profile copy.
export const linkedinCovers: LinkedinCoverTemplate[] = [
  { id: 'ideas-inspire', name: 'AI/ML Engineer', desc: 'Tagline & caption cover template', thumbnail: '/images/linkedin-templates/thumbnails/ideas-inspire.png' },
  { id: 'lets-work-together', name: 'Data Science', desc: 'Contact info & name cover template', thumbnail: '/images/linkedin-templates/thumbnails/lets-work-together.png' },
  { id: 'helping-businesses', name: 'Full Stack Developer', desc: 'Headline & tag pills cover template', thumbnail: '/images/linkedin-templates/thumbnails/helping-businesses.png' },
  { id: 'stunning-websites', name: 'Frontend Developer', desc: 'Portfolio & website cover template', thumbnail: '/images/linkedin-templates/thumbnails/stunning-websites.png' },
  { id: 'purple-geometric', name: 'Software Engineer', desc: 'Creative name & title cover template', thumbnail: '/images/linkedin-templates/thumbnails/purple-geometric.png' },
  { id: 'blue-blocks', name: 'Data Analytics', desc: 'Headline & contact details cover template', thumbnail: '/images/linkedin-templates/thumbnails/blue-blocks.png' },
  { id: 'yellow-wave', name: 'Cyber Security', desc: 'Bold title & website cover template', thumbnail: '/images/linkedin-templates/thumbnails/yellow-wave.png' },
  { id: 'ai-engineer-badge', name: 'Digital Marketing', desc: 'Badge & company name cover template', thumbnail: '/images/linkedin-templates/thumbnails/ai-engineer-badge.png' },
  { id: 'data-engineer', name: 'Data Engineer', desc: 'Tagline & caption cover template', thumbnail: '/images/linkedin-templates/thumbnails/data-engineer.png' },
  { id: 'devops-engineer', name: 'DevOps Engineer', desc: 'Contact info & name cover template', thumbnail: '/images/linkedin-templates/thumbnails/devops-engineer.png' },
  { id: 'mobile-app-developer', name: 'Mobile App Developer', desc: 'Headline & tag pills cover template', thumbnail: '/images/linkedin-templates/thumbnails/mobile-app-developer.png' },
  { id: 'ui-ux-designer', name: 'UI/UX Designer', desc: 'Portfolio & website cover template', thumbnail: '/images/linkedin-templates/thumbnails/ui-ux-designer.png' },
  { id: 'graphic-designer', name: 'Graphic Designer', desc: 'Creative name & title cover template', thumbnail: '/images/linkedin-templates/thumbnails/graphic-designer.png' },
  { id: 'video-editor', name: 'Video Editor', desc: 'Headline & contact details cover template', thumbnail: '/images/linkedin-templates/thumbnails/video-editor.png' },
  { id: 'backend-developer', name: 'Backend Developer', desc: 'Bold title & website cover template', thumbnail: '/images/linkedin-templates/thumbnails/backend-developer.png' },
  { id: 'cloud-engineer', name: 'Cloud Engineer', desc: 'Badge & company name cover template', thumbnail: '/images/linkedin-templates/thumbnails/cloud-engineer.png' },
  { id: 'qa-test-automation', name: 'QA & Test Automation', desc: 'Tagline & caption cover template', thumbnail: '/images/linkedin-templates/thumbnails/qa-test-automation.png' },
  { id: 'game-developer', name: 'Game Developer', desc: 'Contact info & name cover template', thumbnail: '/images/linkedin-templates/thumbnails/game-developer.png' },
  { id: 'mlops-engineer', name: 'MLOps Engineer', desc: 'Headline & tag pills cover template', thumbnail: '/images/linkedin-templates/thumbnails/mlops-engineer.png' },
  { id: 'business-intelligence-analyst', name: 'Business Intelligence Analyst', desc: 'Portfolio & website cover template', thumbnail: '/images/linkedin-templates/thumbnails/business-intelligence-analyst.png' },
  { id: 'computer-vision-engineer', name: 'Computer Vision Engineer', desc: 'Creative name & title cover template', thumbnail: '/images/linkedin-templates/thumbnails/computer-vision-engineer.png' },
  { id: 'blockchain-web3-developer', name: 'Blockchain/Web3 Developer', desc: 'Headline & contact details cover template', thumbnail: '/images/linkedin-templates/thumbnails/blockchain-web3-developer.png' },
  { id: 'embedded-iot-engineer', name: 'Embedded/IoT Engineer', desc: 'Bold title & website cover template', thumbnail: '/images/linkedin-templates/thumbnails/embedded-iot-engineer.png' },
  { id: 'product-manager-tech', name: 'Product Manager (Tech)', desc: 'Badge & company name cover template', thumbnail: '/images/linkedin-templates/thumbnails/product-manager-tech.png' },
  { id: 'business-analyst-it', name: 'Business Analyst (IT)', desc: 'Tagline & caption cover template', thumbnail: '/images/linkedin-templates/thumbnails/business-analyst-it.png' },
  { id: 'technical-writer', name: 'Technical Writer', desc: 'Contact info & name cover template', thumbnail: '/images/linkedin-templates/thumbnails/technical-writer.png' },
  { id: 'network-engineer', name: 'Network Engineer', desc: 'Headline & tag pills cover template', thumbnail: '/images/linkedin-templates/thumbnails/network-engineer.png' },
  { id: 'database-administrator', name: 'Database Administrator', desc: 'Portfolio & website cover template', thumbnail: '/images/linkedin-templates/thumbnails/database-administrator.png' },
];
