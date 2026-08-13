import { LMS_RESUME_SAMPLES, LmsResumeSample } from './resumeSamples';

export const FIELD_KEYWORDS: Record<string, string[]> = {
  'AI/ML Engineer': ['ai', 'machine learning', 'ml', 'artificial intelligence', 'nlp', 'deep learning'],
  'Data Science': ['data science', 'data scientist', 'python', 'r', 'pandas', 'analytics'],
  'Full Stack Developer': ['full stack', 'fullstack', 'react', 'node', 'django', 'mern', 'mean'],
  'Frontend Developer': ['frontend', 'front end', 'react', 'vue', 'angular', 'ui', 'ux'],
  'Software Engineer': ['software engineer', 'backend', 'java', 'c++', 'go', 'spring'],
  'Data Analytics': ['data analyst', 'analytics', 'sql', 'excel', 'powerbi', 'tableau'],
  'Cyber Security': ['security', 'cyber', 'pentest', 'infosec', 'ethical hacking', 'ceh'],
  'Digital Marketing': ['marketing', 'seo', 'digital', 'sem', 'social media', 'content'],
  'Data Engineer': ['data engineer', 'pipeline', 'etl', 'spark', 'kafka', 'hadoop'],
  'DevOps Engineer': ['devops', 'kubernetes', 'docker', 'ci/cd', 'aws', 'terraform'],
  'Mobile App Developer': ['mobile', 'ios', 'android', 'flutter', 'react native', 'swift', 'kotlin'],
  'UI/UX Design': ['ui/ux', 'design', 'figma', 'sketch', 'adobe xd', 'user interface'],
  'Cloud Engineer': ['cloud', 'aws', 'azure', 'gcp', 'cloud architecture', 'sysadmin'],
  'Quality Assurance': ['qa', 'testing', 'selenium', 'cypress', 'automation tester'],
  'Web Developer': ['web developer', 'html', 'css', 'javascript', 'php', 'wordpress'],
  'System Administrator': ['sysadmin', 'linux', 'windows server', 'networking', 'active directory'],
  'Game Developer': ['game dev', 'unity', 'unreal engine', 'game design'],
  'MLOps Engineer': ['mlops', 'ml ops', 'ml infrastructure', 'ml pipeline'],
  'Business Intelligence Analyst': ['business intelligence', 'bi analyst', 'power bi', 'tableau'],
  'Computer Vision Engineer': ['computer vision', 'cv engineer', 'image recognition', 'opencv'],
  'Blockchain / Web3 Developer': ['blockchain', 'web3', 'smart contract', 'solidity', 'crypto'],
  'Embedded / IoT Engineer': ['embedded', 'iot', 'firmware', 'microcontroller'],
  'Product Manager (Tech)': ['product manager', 'product management', 'tpm'],
  'Business Analyst (IT)': ['business analyst', 'requirements analyst'],
  'Technical Writer': ['technical writ', 'documentation specialist', 'tech writer'],
  'Network Engineer': ['network engineer', 'networking', 'ccna', 'cisco'],
  'Database Administrator': ['dba', 'database admin'],
};

/** Picks the LMS resume sample whose field keywords best match a free-typed
 *  prompt, falling back to the generic Software Engineer field when nothing
 *  matches (or that field is missing, the first sample overall). */
export function matchResumeSampleToPrompt(prompt: string): LmsResumeSample {
  const lower = prompt.toLowerCase();
  let best: LmsResumeSample | null = null;
  let bestScore = 0;

  for (const sample of LMS_RESUME_SAMPLES) {
    const field = sample.label.replace(/\s*\(\d+\s*pages?\)\s*$/i, '').trim();
    const keywords = FIELD_KEYWORDS[field];
    if (!keywords) continue;
    const score = keywords.reduce((n, kw) => (lower.includes(kw) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = sample;
    }
  }

  if (best) return best;
  return (
    LMS_RESUME_SAMPLES.find((s) => s.label.startsWith('Software Engineer')) ||
    LMS_RESUME_SAMPLES[0]
  );
}

// Single source of truth for a template's accent colour, cycled by its
// position in LMS_RESUME_SAMPLES — so the same template always gets the
// same colour everywhere it's shown (grid card, preview popup, Studio
// canvas) without threading the colour through props at every call site.
export const RESUME_TEMPLATE_ACCENTS = ['#dc2626', '#1e3a8a', '#059669', '#7c3aed', '#d97706', '#0891b2', '#db2777', '#4338ca'];

export function getResumeAccentColor(sample?: { label: string } | null): string {
  const idx = sample ? LMS_RESUME_SAMPLES.findIndex((s) => s.label === sample.label) : -1;
  return RESUME_TEMPLATE_ACCENTS[(idx < 0 ? 0 : idx) % RESUME_TEMPLATE_ACCENTS.length];
}
