import OpenAI from 'openai';
import type { LinkedinRichProfile } from '../../../lib/linkedinRichProfile';
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { COVER_ART, DEFAULT_HEADSHOT_URL } from '../../../lib/linkedinRichProfile';
import { overageCeiling } from '../../../lib/linkedinCoverArt';

export const runtime = 'nodejs';

// coverTemplateId, pfpGradientId, and headshotUrl are structural/asset
// choices — picker/upload-only, never sent to or trusted from the model.
// coverFieldValues IS something the model can edit (the user should be able
// to ask the chat to change the cover banner's wording), but only for the
// CURRENT template's non-defaultFrom fields — the name/title/company fields
// are kept in sync separately (client-side, from the profile's own
// fullName/title/currentCompany) precisely so the model never has to get
// those right. Constraining it to a known id allowlist per-request, rather
// than accepting an arbitrary object back, is what keeps this safe — see
// mergeCoverFieldValues below.
type LinkedinContentProfile = Omit<
  LinkedinRichProfile,
  'coverTemplateId' | 'pfpGradientId' | 'headshotUrl' | 'customCoverUrl' | 'activity' | 'followersCount'
>;

const PROTECTED_KEYS = [
  'coverTemplateId',
  'pfpGradientId',
  'headshotUrl',
  'customCoverUrl',
  'activity',
  'followersCount',
] as const;

function toContentProfile(profile: Partial<LinkedinRichProfile>): Partial<LinkedinContentProfile> {
  const copy: Partial<LinkedinRichProfile> = { ...profile };
  for (const key of PROTECTED_KEYS) delete (copy as Record<string, unknown>)[key];
  return copy;
}

const SYSTEM_PROMPT_BASE = `You are an expert LinkedIn coach helping a professional optimize their full LinkedIn profile (headline, about, experience, education, certifications, projects, skills, awards, recommendations) AND the wording on their cover banner image, in a live editor. You are given the current profile as JSON plus a conversation. Apply the user's request, then reply.

The user will often paste in raw, unstructured facts about themselves (job history, projects, education, location) all at once, expecting you to restructure ALL of it into the right fields in one pass — do not skip or summarize away any fact they gave you; if they describe multiple projects, add ALL of them as separate entries in "projects", not just one.

Respond with ONLY a JSON object (no markdown fences, no prose outside it):
{
  "reply": "<a short, friendly chat message describing what you changed, or a clarifying question>",
  "profile": <the FULL updated profile JSON in the EXACT schema below>
}

Profile JSON schema (keep this exact shape and keys):
{
  "fullName": "",
  "title": "",                  // short current job title, e.g. "AI Engineer" or "Data Engineer"
  "headline": "",                // ~220-char keyword-rich LinkedIn headline
  "location": "",
  "currentCompany": "",
  "school": "",
  "about": "",                   // About section, first person, concise 1 punchy paragraph
  "skills": ["", ...],
  "experience": [{ "title": "", "company": "", "start": "", "end": "", "description": "" }, ...],
  "education": [{ "school": "", "degree": "", "fieldOfStudy": "", "start": "", "end": "" }, ...],
  "certifications": [{ "name": "", "organization": "", "date": "" }, ...],
  "projects": [{ "title": "", "description": "" }, ...],
  "awards": [{ "title": "", "issuer": "", "date": "" }, ...],
  "recommendations": [{ "id": "rec-1", "recommenderName": "", "recommenderAvatar": "/images/featured-thumbnail/mutual connection.png", "recommenderTitle": "", "relationship": "", "text": "" }, ...],
  "coverFieldValues": { }         // OPTIONAL — see the cover-banner section below
}

Rules:
- Return the WHOLE profile object every time; preserve every field and array item the user did not ask to change.
- CRITICAL — EXPERIENCE BULLET POINTS GENERATION:
  Whenever the user asks to add an experience role (e.g. "add experience as an AI Engineer at XYZ", "Data Engineer at ABC", "Software Engineer at ..."), YOU MUST NEVER leave "description" empty or with just one generic sentence.
  Always generate 3 to 4 domain-relevant, highly professional accomplishment bullet points separated by "\\n" (one impactful sentence per line). Highlight key technical skills, architectural workflows, tools, and quantified impact (e.g. for AI Engineer: designing LLM/RAG pipelines, model fine-tuning with PyTorch/HuggingFace, reducing inference latency by 35%, deploying Dockerized ML APIs; for Data Engineer: building ETL/ELT pipelines in Airflow/Spark, data warehousing in Snowflake/BigQuery, reducing query runtimes, data modeling with dbt).
  If the experience list contains a blank placeholder entry (empty title/company), replace it with this new position instead of keeping an empty placeholder.
- CRITICAL — ABOUT SECTION UPDATES & HALF-CAPACITY LENGTH:
  Whenever the user asks to add or change an experience role, or states their profession/field (e.g. AI Engineer, Data Engineer), YOU MUST ALSO update the "about" section to align with this field, even if they did not explicitly mention "about".
  Keep the "about" section at roughly HALF the capacity of a traditional long multi-paragraph biography — exactly ONE crisp, punchy, engaging paragraph (~45–65 words / ~300–450 characters) in a confident first-person voice summarizing their core domain expertise, technologies, and the business/engineering value they deliver. Always overwrite any existing Lorem Ipsum or generic placeholder text.
- CRITICAL — LICENSES & CERTIFICATIONS POPULATION:
  Whenever the user adds a role/experience or specifies their domain (e.g. AI Engineer, Data Engineer, Cloud Architect), YOU MUST ALSO populate "certifications" with 2–3 authentic, prestigious industry certifications matching their field (e.g. for AI Engineer: "AWS Certified Machine Learning - Specialty" from "Amazon Web Services (AWS)", "Deep Learning Specialization" from "DeepLearning.AI", "TensorFlow Developer Certificate" from "Google"; for Data Engineer: "Databricks Certified Data Engineer Professional" from "Databricks", "AWS Certified Data Analytics - Specialty" from "Amazon Web Services (AWS)", "SnowPro Core Certification" from "Snowflake"). If existing certifications are empty or blank placeholders (empty name), replace them with these domain-specific credentials.
- CRITICAL — RECOMMENDATIONS POPULATION:
  Whenever the user adds a role/experience or specifies their domain, YOU MUST ALSO populate "recommendations" with 1–2 authentic, glowing professional testimonials from a supervisor or tech lead (e.g. Director of Engineering, VP of Technology, or Principal Architect) specifically praising the user's technical accomplishments, delivery, and problem-solving impact in that target domain. Set "recommenderAvatar" to "/images/featured-thumbnail/mutual connection.png" and "relationship" to a realistic supervisor or colleague note (e.g. "Managed directly" or "Worked together on the core engineering team"). If existing recommendations are empty or blank placeholders, replace them with this tailored recommendation.
- MANDATORY FULL-PROFILE ROLE SYNCHRONIZATION:
  When the user mentions their current company or role (e.g. "I work as an AI Engineer at DataCrumbs starting 1-2-25", "Data Engineer at XYZ", "Full Stack Developer at ..."):
  YOU MUST SYNCHRONIZE AND POPULATE ALL 5 OF THE FOLLOWING SECTIONS SIMULTANEOUSLY IN THE RETURNED JSON:
  1. "title" (e.g. "AI Engineer"), "currentCompany" (e.g. "DataCrumbs"), and "headline" (e.g. "AI Engineer at DataCrumbs | Building Production ML & LLM Systems").
  2. "experience": 1st entry with the role title, company ("DataCrumbs"), start date (e.g. "Feb 2025" or "1-2-25"), end date ("Present"), and 3-4 professional domain accomplishment bullet points in "description" separated by "\\n".
  3. "about": 1 crisp, punchy first-person paragraph (~45–65 words) summarizing their domain expertise and tech stack.
  4. "certifications": 2-3 prestigious domain credentials (e.g. for AI Engineer: AWS Certified Machine Learning, Deep Learning Specialization).
  5. "recommendations": 1-2 glowing supervisor/director recommendations praising their work in this field.
  NEVER return empty certifications or empty recommendations when the user has provided a job role!
- "add a skill" -> append to skills (dedupe against existing skills, case-insensitively). "add an education / certification / project / award / recommendation" -> append a new well-formed entry to that array; if the user replaces their whole background in one message, replace the array's contents to match rather than appending duplicates of old placeholder entries.
- Every project the user describes becomes its own entry in "projects" with a clear title and a 1-2 sentence description covering what it does and the tech used.
- When the user mentions their school or university, update "school" AND ALSO ensure there is a corresponding entry in "education" for that school.
- Keep the headline within ~220 characters. Output valid JSON only.`;

const DOMAIN_CERTIFICATIONS: Record<string, { name: string; organization: string; date: string }[]> = {
  ai: [
    { name: 'AWS Certified Machine Learning - Specialty', organization: 'Amazon Web Services (AWS)', date: '2024' },
    { name: 'Deep Learning Specialization', organization: 'DeepLearning.AI', date: '2023' },
    { name: 'TensorFlow Developer Certificate', organization: 'Google', date: '2023' },
  ],
  data: [
    { name: 'Databricks Certified Data Engineer Professional', organization: 'Databricks', date: '2024' },
    { name: 'AWS Certified Data Analytics - Specialty', organization: 'Amazon Web Services (AWS)', date: '2023' },
    { name: 'SnowPro Core Certification', organization: 'Snowflake', date: '2023' },
  ],
  software: [
    { name: 'AWS Certified Solutions Architect - Associate', organization: 'Amazon Web Services (AWS)', date: '2024' },
    { name: 'Meta Full-Stack Engineer Certificate', organization: 'Meta', date: '2023' },
    { name: 'Docker Certified Associate (DCA)', organization: 'Docker', date: '2023' },
  ],
  devops: [
    { name: 'Certified Kubernetes Administrator (CKA)', organization: 'Cloud Native Computing Foundation (CNCF)', date: '2024' },
    { name: 'AWS Certified DevOps Engineer - Professional', organization: 'Amazon Web Services (AWS)', date: '2023' },
    { name: 'HashiCorp Certified: Terraform Associate', organization: 'HashiCorp', date: '2023' },
  ],
};

const DOMAIN_RECOMMENDATIONS: Record<string, { id: string; recommenderName: string; recommenderAvatar: string; recommenderTitle: string; relationship: string; text: string }[]> = {
  ai: [
    {
      id: 'rec-1',
      recommenderName: 'Sarah Jenkins',
      recommenderAvatar: '/images/featured-thumbnail/mutual connection.png',
      recommenderTitle: 'Director of Engineering • AI Systems & Research',
      relationship: 'Sarah managed directly',
      text: 'An exceptional AI Engineer with a rare ability to bridge cutting-edge research models with resilient production systems. Their work optimizing model inference, fine-tuning LLMs, and building robust retrieval pipelines delivered remarkable performance gains for our team.',
    },
    {
      id: 'rec-2',
      recommenderName: 'David Chen',
      recommenderAvatar: '/images/featured-thumbnail/mutual connection 2.png',
      recommenderTitle: 'Principal Architect & Technology Strategist',
      relationship: 'David worked with on the same team',
      text: 'A brilliant team player with phenomenal problem-solving capabilities in machine learning and distributed systems. Their deep expertise in MLOps and collaborative spirit elevated our entire engineering department.',
    },
  ],
  data: [
    {
      id: 'rec-1',
      recommenderName: 'Sarah Jenkins',
      recommenderAvatar: '/images/featured-thumbnail/mutual connection.png',
      recommenderTitle: 'Head of Data & Analytics Platform',
      relationship: 'Sarah managed directly',
      text: 'A top-tier Data Engineer who architected distributed data pipelines with pristine reliability and zero downtime. Outstanding technical mastery across distributed systems, streaming architectures, and data modeling.',
    },
  ],
  software: [
    {
      id: 'rec-1',
      recommenderName: 'Marcus Vance',
      recommenderAvatar: '/images/featured-thumbnail/mutual connection.png',
      recommenderTitle: 'VP of Engineering',
      relationship: 'Marcus managed directly',
      text: 'One of the most driven and talented software engineers I have worked alongside. Consistently delivers clean, maintainable, and high-performance architecture on critical project deadlines.',
    },
  ],
  devops: [
    {
      id: 'rec-1',
      recommenderName: 'Marcus Vance',
      recommenderAvatar: '/images/featured-thumbnail/mutual connection.png',
      recommenderTitle: 'Head of Cloud Infrastructure & SRE',
      relationship: 'Marcus managed directly',
      text: 'An outstanding DevOps engineer who spearheaded our Kubernetes migration and automated CI/CD workflows, boosting developer velocity while maintaining 99.99% system availability.',
    },
  ],
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function isValidContentProfile(value: unknown): value is Partial<LinkedinContentProfile> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.fullName === 'string' ||
    typeof v.headline === 'string' ||
    typeof v.title === 'string' ||
    typeof v.about === 'string' ||
    Array.isArray(v.skills) ||
    Array.isArray(v.experience) ||
    Array.isArray(v.education) ||
    Array.isArray(v.certifications) ||
    Array.isArray(v.recommendations)
  );
}

// Fallback for any pills field/chip index without a hand-calibrated entry in
// its own `pillMaxLengths` (see lib/linkedinCoverArt.ts) — every pills field
// we actually ship one for today, so this is just a safety net.
const MAX_PILL_CHARS = 32;

/** A moderate overshoot (up to OVERAGE_ALLOWANCE_CHARS past `max`) is passed
 *  through UNTRIMMED — the renderer (computeFitScale, lib/linkedinCoverArt.ts)
 *  shrinks that field's font to compensate instead of losing words, which
 *  reads far better than either chopping mid-word or rejecting the edit
 *  outright. Only overage beyond that allowance — where shrinking would make
 *  the text illegibly small — gets backed off to the last COMPLETE word that
 *  fits within `max + allowance`, never a chopped mid-word ("Aut…"). Falls
 *  back to `fallback` (the field's prior value) only when even the FIRST
 *  word alone doesn't fit that ceiling — e.g. a 4-char pill budget can't
 *  hold "Automation" no matter where you cut it, so there's no safe partial
 *  to show. */
function fitToLimit(value: string, max: number, fallback: string): string {
  const trimmed = value.trim();
  const ceiling = overageCeiling(max);
  if (trimmed.length <= ceiling) return trimmed;
  const cut = trimmed.slice(0, ceiling);
  const lastSpace = cut.lastIndexOf(' ');
  const wholeWords = lastSpace > 0 ? cut.slice(0, lastSpace).trimEnd() : '';
  return wholeWords || fallback;
}

/** Only lets through cover-field edits for ids that actually belong to the
 *  CURRENT template's freely-editable (non-defaultFrom) fields — anything
 *  else the model returns (an unknown id, a name/title/company-bound field
 *  it shouldn't touch, a malformed value) is silently dropped rather than
 *  trusted, so a bad response can only ever no-op the cover, never corrupt
 *  it. Also HARD-enforces each field's maxLength/maxPills (ported from the
 *  LMS's own CoverTextField definitions) via fitToLimit above — these boxes
 *  don't auto-shrink to fit (no `maxLines`-equivalent behavior for fields
 *  without one), so oversized text would otherwise overflow into whatever
 *  sits below it on the banner. */
function mergeCoverFieldValues(
  coverTemplateId: string,
  current: Record<string, string | string[]>,
  proposed: unknown
): Record<string, string | string[]> {
  const art = COVER_ART[coverTemplateId];
  if (!art || !proposed || typeof proposed !== 'object') return current;
  const editableFields = new Map(art.fields.filter((f) => !f.defaultFrom).map((f) => [f.id, f]));
  const merged = { ...current };
  for (const [id, value] of Object.entries(proposed as Record<string, unknown>)) {
    const field = editableFields.get(id);
    if (!field) continue;
    if (field.kind === 'pills') {
      if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
        const capped = field.maxPills ? value.slice(0, field.maxPills) : value;
        const currentChips = Array.isArray(current[id]) ? (current[id] as string[]) : [];
        merged[id] = capped.map((chip, i) => {
          const max = field.pillMaxLengths?.[i] ?? MAX_PILL_CHARS;
          const fallback = currentChips[i] ?? chip.slice(0, max);
          return fitToLimit(chip, max, fallback);
        });
      }
    } else if (typeof value === 'string') {
      const fallback = typeof current[id] === 'string' ? (current[id] as string) : value;
      merged[id] = field.maxLength ? fitToLimit(value, field.maxLength, fallback) : value;
    }
  }
  return merged;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({
      error: 'OPENAI_API_KEY is not set. Add it to Profile-builder/.env.local and restart the dev server.',
    });
  }

  try {
    const user = await currentUser();
    const userId = user?.id;
    if (userId) {
      const unlock = await db.paymentUnlock.findUnique({ where: { userId } });
      if (!unlock) {
        const usage = await db.profileBuilderAiUsage.findUnique({ where: { userId } });
        const used = usage?.usedCount || 0;
        if (used >= 5) {
          return Response.json({
            reply: '🔒 **AI Limit Reached.** You have used your 5 free AI messages. Upgrade to Pro to unlock unlimited AI editing and exports!',
          });
        }
        await db.profileBuilderAiUsage.upsert({
          where: { userId },
          update: { usedCount: { increment: 1 } },
          create: { userId, usedCount: 1 }
        });
      }
    }

    const body = (await request.json()) as {
      messages?: ChatMessage[];
      linkedin?: Partial<LinkedinRichProfile>;
      profile?: Partial<LinkedinRichProfile>;
      userRole?: string;
      sessionId?: string;
      builderType?: string;
    };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const fullProfile = ((body.profile ?? body.linkedin) ?? {}) as LinkedinRichProfile;
    const sessionId = body.sessionId || 'unknown';
    const builderType = body.builderType || 'linkedin';
    const userMessage = messages[messages.length - 1]?.content || '';
    const contentProfile = toContentProfile(fullProfile);

    const coverTemplateId = fullProfile.coverTemplateId || 'template-1';
    const art = COVER_ART[coverTemplateId];
    const editableCoverFields = (art?.fields ?? [])
      .filter((f) => !f.defaultFrom)
      .map((f) => ({
        id: f.id,
        kind: f.kind,
        currentValue: fullProfile.coverFieldValues?.[f.id] ?? f.placeholder,
        ...(f.kind === 'text' && f.maxLength ? { maxLength: f.maxLength } : {}),
        ...(f.kind === 'pills'
          ? { maxPills: f.maxPills, maxCharsPerChip: f.pillMaxLengths ?? MAX_PILL_CHARS }
          : {}),
      }));

    const coverSection = editableCoverFields.length
      ? `\n\nThe cover banner image currently shows this baked-on text — these are the ONLY fields you may propose changes for, via an OPTIONAL "coverFieldValues" object in your JSON response, keyed by these exact ids:\n${JSON.stringify(editableCoverFields)}\n\nHARD RULE, not a suggestion: "maxLength" (and per-chip "maxCharsPerChip" for pills — either one number for every chip, or an array index-matched to each chip's own position when they differ) is the character budget INCLUDING spaces and punctuation — treat it as the real ceiling, not a rough guide. Count your characters before writing the field. Going a few characters over shrinks that field's text to keep it fitting (readable but smaller), so it's not catastrophic — but going WAY over (more than ~15-20 characters past the limit) gets cut back to the last whole word within reach, permanently losing whatever came after. So: aim to land AT or UNDER the limit every time: a value that's on-budget always looks best; a value that's wildly over loses content. Never rely on the overage margin on purpose.\nSome of these budgets are extremely tight (a handful of characters, matching a short original chip like "SEO" or "AI") — full sentences or phrases physically cannot fit. For anything under ~10 characters, use a single short word, acronym, or abbreviation (e.g. "AI", "3D", "Web", "SEO", "UX") instead of trying to cram in a phrase and going over. It is always better to write a short, on-topic word that fits than a longer, more descriptive one that gets rejected.\nThese values are stock template copy, NOT the user's — they were written for whoever the template was designed around (a marketing agency, a web studio), so treat them as placeholders to replace, not content to protect. Whenever the user tells you their role/skills/what they build, rewrite EVERY one of these fields that reads as generic or off-topic for them, in the SAME response, even if they never said the word "cover" or "banner" — this is expected, not presumptuous. Headline/tagline/heading-style fields should describe THEIR work; pills should be their actual skills or technologies. Do not leave copy like "Helping Businesses Scale Through Paid Marketing" or "Let's Work Together" sitting on a software developer's banner just because it isn't strictly wrong — if it isn't specifically about this user, replace it.
The ONLY fields to leave untouched are literal contact details you have no real data for — phone number, email address, website URL. Never invent those. Everything else is fair game and should be personalized. Never invent ids not in this list; pills fields take an array of short chip strings, everything else takes a plain string.`
      : '';

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_BASE + coverSection },
        { role: 'system', content: `The professional's CURRENT profile as JSON:\n${JSON.stringify(contentProfile)}` },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const choice = completion.choices[0];
    const raw = choice?.message?.content ?? '';
    if (!raw) {
      return Response.json({ error: 'The AI returned an empty response. Please try again.' });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return Response.json({ error: "The AI's response wasn't valid — please try rephrasing or send it again." });
    }

    const parsedObj = (parsed ?? {}) as { reply?: unknown; profile?: unknown };
    if (!isValidContentProfile(parsedObj.profile)) {
      // Don't silently report success while leaving the profile untouched —
      // that's the exact bug where the chat says "Done" but nothing changed.
      return Response.json({
        error: "The AI's response didn't match the expected profile shape, so nothing was changed — please try again, or try breaking your request into smaller pieces.",
      });
    }

    // The model is told to preserve fields the user didn't ask about, but it
    // routinely drops or blanks ones the latest message simply didn't mention
    // (e.g. wiping `location` when the user only talked about their job
    // history). Silently keeping the prior value is always the right call:
    // clearing a field is never something a user asks for implicitly, and an
    // empty scalar renders as a bare placeholder on the profile.
    const preserved = { ...(parsedObj.profile as Record<string, unknown>) };
    for (const key of ['fullName', 'title', 'headline', 'location', 'currentCompany', 'school', 'about'] as const) {
      const next = preserved[key];
      const prev = (fullProfile as unknown as Record<string, unknown>)[key];
      const isPlaceholderLorem = key === 'about' && typeof prev === 'string' && prev.includes('Lorem ipsum');
      if (!isPlaceholderLorem && (typeof next !== 'string' || !next.trim()) && typeof prev === 'string' && prev.trim()) {
        preserved[key] = prev;
      }
    }

    // Preserve arrays if the model returned an empty list or omitted them,
    // unless the user specifically asked to clear/delete them.
    for (const key of ['experience', 'education', 'certifications', 'projects', 'skills', 'awards', 'recommendations'] as const) {
      const next = preserved[key];
      const prev = (fullProfile as unknown as Record<string, unknown>)[key];
      const userAskedToClear = /\b(clear|remove|delete|reset|wipe)\b/i.test(userMessage) &&
        new RegExp(`\\b(${key}|all|everything)\\b`, 'i').test(userMessage);

      // Check if prev was purely blank placeholders
      const isBlankPlaceholderArray = Array.isArray(prev) && prev.length > 0 && prev.every((item: any) => {
        if (!item || typeof item !== 'object') return true;
        if (key === 'certifications') return !item.name?.trim();
        if (key === 'recommendations') return !item.recommenderName?.trim() && !item.text?.trim();
        if (key === 'experience') return !item.title?.trim() && !item.company?.trim();
        if (key === 'education') return !item.school?.trim();
        if (key === 'projects') return !item.title?.trim();
        return false;
      });

      if (!userAskedToClear && Array.isArray(prev) && prev.length > 0 && !isBlankPlaceholderArray && (!Array.isArray(next) || next.length === 0)) {
        preserved[key] = prev;
      }
    }

    const proposedCoverFieldValues = (parsedObj.profile as { coverFieldValues?: unknown }).coverFieldValues;
    const userMentionsCover = /\b(cover|banner|header\s+image|banner\s+text|cover\s+tagline|cover\s+headline)\b/i.test(userMessage);
    const finalCoverFieldValues = userMentionsCover
      ? mergeCoverFieldValues(coverTemplateId, fullProfile.coverFieldValues ?? {}, proposedCoverFieldValues)
      : (fullProfile.coverFieldValues ?? {});

    // If user specified or works in a domain, ensure certifications and recommendations are never left empty or placeholder
    const effectiveRoleText = [
      typeof preserved.title === 'string' ? preserved.title : '',
      Array.isArray(preserved.experience) && preserved.experience[0]?.title ? preserved.experience[0].title : '',
      userMessage,
    ].join(' ').toLowerCase();

    let detectedDomain: 'ai' | 'data' | 'software' | 'devops' | null = null;
    if (/\b(ai|machine\s+learning|ml|deep\s+learning|nlp|llm|computer\s+vision|artificial\s+intelligence)\b/i.test(effectiveRoleText)) {
      detectedDomain = 'ai';
    } else if (/\b(data\s+engineer|data\s+science|data\s+scientist|data\s+analyst|etl|big\s+data|analytics)\b/i.test(effectiveRoleText)) {
      detectedDomain = 'data';
    } else if (/\b(devops|cloud|sre|kubernetes|platform|infrastructure)\b/i.test(effectiveRoleText)) {
      detectedDomain = 'devops';
    } else if (/\b(full\s+stack|software|frontend|backend|developer|web|engineer)\b/i.test(effectiveRoleText)) {
      detectedDomain = 'software';
    }

    if (detectedDomain) {
      // Auto-populate certifications if empty or purely placeholder
      const currentCerts = Array.isArray(preserved.certifications) ? preserved.certifications : [];
      const certsAreEmpty = currentCerts.length === 0 || currentCerts.every((c: any) => !c?.name?.trim());
      if (certsAreEmpty) {
        preserved.certifications = DOMAIN_CERTIFICATIONS[detectedDomain];
      }

      // Auto-populate recommendations if empty or purely placeholder
      const currentRecs = Array.isArray(preserved.recommendations) ? preserved.recommendations : [];
      const recsAreEmpty = currentRecs.length === 0 || currentRecs.every((r: any) => !r?.recommenderName?.trim() && !r?.text?.trim());
      if (recsAreEmpty) {
        preserved.recommendations = DOMAIN_RECOMMENDATIONS[detectedDomain];
      }
    }

    const mergedProfile: LinkedinRichProfile = {
      ...fullProfile,
      ...(preserved as unknown as Partial<LinkedinRichProfile>),
      coverTemplateId: fullProfile.coverTemplateId ?? '',
      pfpGradientId: fullProfile.pfpGradientId || 'gradient-1',
      headshotUrl: fullProfile.headshotUrl ?? '',
      customCoverUrl: fullProfile.customCoverUrl ?? '',
      followersCount: fullProfile.followersCount || '500+',
      activity: fullProfile.activity ?? [],
      recommendations: (Array.isArray(preserved.recommendations) && preserved.recommendations.length > 0)
        ? (preserved.recommendations as any)
        : (fullProfile.recommendations ?? []),
      coverFieldValues: finalCoverFieldValues,
    };

    const reply = typeof parsedObj.reply === 'string' ? parsedObj.reply : 'Done — updated your profile.';
    if (sessionId !== 'unknown') {
      await db.profileBuilderChatLog.create({
        data: {
          sessionId,
          builderType,
          userId: user?.id,
          userMessage,
          aiReply: reply,
          isAutoFit: false,
        },
      });
    }

    return Response.json({
      reply,
      profile: mergedProfile,
    });
  } catch (err: any) {
    console.error('[LinkedIn AI Error]:', err);
    return Response.json({
      error: err?.message || 'The AI request failed. Check your API key / connection and try again.',
    });
  }
}
