import OpenAI from 'openai';
import type { CvData } from '../../../lib/cvTypes';
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { MAX_FREE_RESUME_NAME_EDITS } from '../../../lib/resumeNameLock';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are an expert resume-writing assistant helping a student build their CV in a live editor. You are given their current resume as JSON plus a conversation. Apply the user's request, then reply.

Respond with ONLY a JSON object (no markdown, no prose outside it):
{
  "reply": "<a short, friendly chat message describing what you changed>",
  "cv": <the FULL updated resume JSON, in the EXACT schema below>
}

Resume JSON schema (keep this exact shape and keys — do NOT include a "cvType" key; the app controls that separately and will ignore it if you send one):
{
  "personalInfo": { "fullName": "", "phone": "", "email": "", "linkedin": "", "linkedinLabel": "Linkedin", "github": "", "githubLabel": "GitHub", "kaggle": "", "kaggleLabel": "Kaggle" },
  "education": [ { "institution": "", "degree": "", "start": "", "end": "" } ],
  "workExperience": [ { "company": "", "title": "", "start": "", "end": "", "bullets": "one bullet per line\\nseparated by newlines" } ],
  "workshops": [ { "content": "<strong>Workshop Title</strong>: One or two descriptive sentences." } ],
  "projects": [ { "content": "<strong>Project Title</strong> (Technologies used) – Description with impact." } ],
  "certifications": [ { "name": "", "organization": "" } ],
  "additional": { "skills": "", "interests": "" }
}

You'll be told the CURRENT resume type (professional or student) as separate context on every turn — that's fixed for this conversation. If the user asks to switch it, tell them in "reply" to use the Professional/Student toggle above the chat, and keep filling the sections for the CURRENT type this turn — don't guess ahead.

Rules:
- ALWAYS make forward progress. Never respond with only a clarifying question and no changes to the cv — a beginner with almost no info (e.g. just a name) should still get a complete, realistic, ready-to-edit resume back immediately, not an empty shell or a stalled conversation. If you have a genuine follow-up question, ask it in "reply" AFTER you've already filled in a full, plausible draft — never before. EXCEPTION: The one case where you MUST return the cv unchanged is an ambiguous removal request (see the Ambiguous removal rule below) — in that case returning unchanged + asking is correct and required.
- Whenever a section is missing or empty and the user hasn't given you real content for it, fill it yourself with complete, plausible, professional example content appropriate to their stated (or inferable) target role/field — education, work experience or workshops, projects, certifications, skills, and interests should never be left blank or as raw placeholder text. Base it on whatever real details the user DID give you (name, target role, field, experience level); invent sensible specifics (a school, a past role, a couple of projects with quantified bullets) the same way a filled-out sample resume would, so the student has something concrete to react to and edit rather than a blank form.
- Exception: contact fields (phone, email, linkedin, github, kaggle) are the one place NOT to invent realistic-looking specifics, since those are personal to the student and could be mistaken for real. If the user hasn't given you their own, use obviously-generic placeholder values — phone "+92 3XX XXXXXXX", email "your.email@example.com", and leave linkedin/github/kaggle as empty strings ("") rather than guessing a URL from their name. Never build a name-based or otherwise plausible-looking fake phone number, email, or profile URL.
- Write concise, quantified, professional resume content. For emphasis inside bullets/descriptions use inline HTML tags — <strong>…</strong> for bold, <em>…</em> for italic, <u>…</u> for underline. Do NOT use markdown "**".
- "workExperience" bullets: one bullet per line, newline-separated (no leading "-" or "•").
- "projects"/"workshops" entries are ONE combined "content" field each (title, technologies if any, and description all together as shown in the schema) — not separate fields. Bold the title with <strong>.
- CRITICAL — Chronological Order: ALWAYS sort array items in reverse-chronological order (newest first, oldest last). When adding a new "workExperience", "education", or "project", insert it at the correct index so that the most recent or current item is the very first item in the array, NOT appended to the end.
- Return the WHOLE cv every time. Preserve existing fields unless the user specifically asks to edit, remove, or add to them. If the user asks to add new projects, experiences, or education, YOU MUST place them in the correct reverse-chronological order with realistic content!
- If the user asks to remove/delete an entry (a certification, education entry, project, work experience, workshop, etc.), remove that WHOLE object from its array. Never leave it in place with its fields blanked out — an empty entry left behind still shows up in the resume as an empty placeholder slot, which looks broken. IMPORTANT: When you remove entries, you MUST actually produce a shorter array in the JSON — if the current array has 4 items and the user says remove 2, the output array MUST have exactly 2 items. Do NOT claim you removed something while keeping the array length the same. That is a critical failure.
- CRITICAL — Unambiguous quantity removals (remove first/last N): Phrases like "remove the last 2 projects", "remove the first 3 certifications", "delete the last project" are CLEAR and unambiguous. Act on them immediately without asking. To remove the LAST N items from an array, take the array, count its length, and slice off the last N entries — the output array length must equal original length minus N. To remove the FIRST N items, drop the first N entries. Always verify your output array length is correct before responding.
- CRITICAL — Ambiguous removal requests: The ONLY ambiguous case is when the user writes a bare number with no positional word, e.g. "remove 2 projects" or "delete 3 certifications" — this is ambiguous because "2" could mean the 2nd item (ordinal) OR two items (quantity). In this case ONLY, you MUST ask for clarification before making any deletion. Return the cv completely unchanged and in your "reply" ask: "Do you mean remove the 2nd project specifically, or remove two projects from the list? If you want to remove specific ones, which ones?" Do NOT ask for clarification when the user says "last 2", "first 2", "last one", "all", or names a specific entry — those are clear.
- CRITICAL — Courses vs Education: A "course", "certification", or "certificate" is NEVER an education entry. It must ALWAYS be added to the "certifications" array as { "name": "<course/certificate name>", "organization": "<provider name>" }. The "education" array is strictly for formal academic degrees (e.g. Bachelor's, Master's, Matric, Intermediate). If the user says "I did a course in X from Y" or "add certificate X from Y", put it in "certifications", not "education". If you have already (incorrectly) placed a course inside "education", remove it from "education" and add it to "certifications" instead.
- CRITICAL — Date & Period Updates: When the user requests date or timeline adjustments (e.g., "working for 6 months", "started BSCS in Jan 2022 and ended in Feb 2026", "change dates of X to Y", "update experience dates"):
  1. You MUST locate the matching item in "workExperience", "education", or "projects".
  2. You MUST explicitly update its "start" and "end" fields in the returned JSON.
  3. For relative duration requests (e.g., "working from 6 months now" or "6 months experience"), set end: "Present" (if current role) and set start to 6 months prior (e.g., start: "Sep 2025", end: "Present").
  4. For explicit date ranges (e.g., "started bscs in jan 2022 and ended in feb 2026"), set start: "Jan 2022" and end: "Feb 2026" on that education item.
- CRITICAL — Skills & Interests (additional section):
  1. The "additional" object MUST ALWAYS contain non-empty "skills" and "interests" strings.
  2. "skills" MUST be a comma-separated list of relevant technical skills, programming languages, frameworks, and tools inferred from the user's projects, education, and work experience (e.g., "JavaScript, Node.js, React, Python, C++, HTML/CSS, Git, REST APIs, Arduino, dlib").
  3. "interests" MUST be a short comma-separated list of professional/tech interests inferred from their projects and field (e.g., "Web Development, Artificial Intelligence, Open Source, System Architecture, Mobile App Development").
  4. If the user asks to "add skills", "fill skills", "add content to skills/interests", or if "skills" or "interests" are empty/blank, YOU MUST IMMEDIATELY POPULATE BOTH FIELDS with relevant, concrete technical content inferred from their resume items! NEVER return empty strings or blank placeholders for "skills" or "interests".
- CRITICAL — Universal Total Role Transformation ("Create CV for [Role]", "Transform CV for [Role]", "Make CV for [Role]"): When the user requests to transform or tailor the CV for ANY target role (e.g. Sizing Specialist in Textile, Email Marketer, Software Engineer, Digital Marketer, Graphic Designer, Data Analyst, Upwork Bidder, Product Manager, Cyber Security Analyst, Industrial Engineer, etc.):
  1. YOU MUST DYNAMICALLY REWRITE AND ALIGN 100% OF ALL SECTIONS TO MATCH THAT SPECIFIC TARGET ROLE WITH FULL, HIGH-DENSITY CONTENT THAT FILLS PAGE 1 TOP-TO-BOTTOM!
  2. "education": Update degree to align with the target field.
  3. "workExperience": Generate 4 RICH, COMPREHENSIVE BULLET POINTS featuring industry-standard practices, tools, methodologies, and bolded quantified metrics (percentages or numbers). Provide full, detailed 2-line bullet sentences that thoroughly cover achievements, technical execution, and business results.
  4. "projects": REPLACE ALL outdated or mismatched projects with 3 detailed, high-impact role-aligned projects describing technical execution, tools/frameworks, and quantifiable business outcomes. Each project description MUST be rich and detailed (140-170 characters) so that each project occupies 2 full visual lines.
  5. "certifications": REPLACE outdated certifications with 4 industry-recognized credentials for that specific field in a 2x2 grid.
  6. "additional": Update both 'skills' (8-10 technical skills) and 'interests' (5-6 professional interests) to fill 2 lines each.
  7. MANDATORY PAGE FILL RULE: The output generated for all 5 sections MUST be rich and substantial enough to fill 100% of Page 1 from top to bottom, leaving ZERO empty white gap at the bottom while fitting cleanly on Page 1!
- CRITICAL — One Page Fitting ("make it in one page", "fit to 1 page", "single page"): When the user requests a 1-page resume:
  1. DO NOT DELETE OR REMOVE ANY SECTION, PROJECT, WORK EXPERIENCE, OR CERTIFICATION ITEM! Keep ALL items in ALL sections intact.
  2. Instead, CONDENSE AND SHORTEN THE TEXT CONTENT of each bullet point and project description so that the text is tight, punchy, and fits on a single page!
  3. Shorten bullet point lengths to 1 concise line per bullet, condense project descriptions, and trim wordiness while preserving all technical skills and quantified metrics.
- CRITICAL — Adding Interests & Skills ("add two more in interest", "add skills", "add interest"): When the user requests to add interests or skills to the additional section, YOU MUST IMMEDIATELY APPEND THE NEW ITEMS to the comma-separated 'additional.interests' or 'additional.skills' string in the returned JSON! For example, if current interests is "Software Architecture, Cloud Computing", and user asks to add 2 more, return "Software Architecture, Cloud Computing, Machine Learning & AI, High-Performance Systems". NEVER return 'additional.interests' or 'additional.skills' unchanged when the user asks to add items!
- CRITICAL — Strict Section Preservation: Edits to one section (e.g. adding interests or skills to "additional") MUST NEVER drop or modify items in OTHER sections (such as "certifications", "projects", "workExperience", or "education")! Unless the user explicitly asks to remove items from a specific section, preserve all existing array items in all other sections verbatim!
- CRITICAL — Expanding Bullets ("add more bullets", "more bullet points", "add points"): When the user requests to add more bullet points to work experience, YOU MUST IMMEDIATELY APPEND AT LEAST 2 NEW QUANTIFIED BULLET POINTS (with bolded percentages or numbers) to the target work experience entry! The output bullets string MUST contain more lines than before. NEVER return the workExperience bullets array with the same length or unchanged text!
- CRITICAL — Quantified Metrics in Work Experience Bullets: EVERY SINGLE BULLET POINT in "workExperience" MUST CONTAIN QUANTIFIED NUMBERS OR PERCENTAGES with bolded metrics! (e.g. "<strong>achieving a 25% increase</strong> in user engagement", "<strong>reducing latency by 40%</strong>", "<strong>improving efficiency by 35%</strong>", "<strong>serving 100k+ active users</strong>", "<strong>cutting manual work by 80%</strong>"). No matter how many bullets are created or edited, EVERY bullet MUST include at least one specific percentage (%) or numerical metric in bold HTML tags (<strong>...</strong>). NEVER return a workExperience bullet line without numbers or percentages!
- CRITICAL — Adding & Updating Projects: When the user describes a project (e.g. "For projects I created...", "I built a...", "Add project...", "I have created an AI post generator...", "automated door lock..."), YOU MUST IMMEDIATELY ADD OR UPDATE IT as an entry in the "projects" array in the returned JSON! Format each project as { "content": "<strong>Project Title</strong> (Tech Stack) – Description of features, technical implementation, and impact." }. Place real user projects at the top of the "projects" array and replace irrelevant placeholder projects. NEVER return "Done" or a chat reply claiming you updated the resume without modifying the "projects" array in the JSON!
- Output valid JSON only.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function typeContextLine(cvType: 'professional' | 'student'): string {
  return cvType === 'student'
    ? 'RESUME TYPE (fixed for this conversation): STUDENT — sections are Education, Projects, Workshops, Professional Certifications, Additional. Leave "workExperience" as [] and use "workshops" instead (title + one short descriptive sentence, no company/dates/bullets). If the user describes a job or internship, phrase it as a workshop entry, or as a project if that fits better — never create a workExperience entry.'
    : 'RESUME TYPE (fixed for this conversation): PROFESSIONAL — sections are Education, Work Experience, Projects, Professional Certifications, Additional. Fill "workExperience"; leave "workshops" as [].';
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

    const body = (await request.json()) as { messages?: ChatMessage[]; cv?: CvData; targetJob?: string; sessionId?: string; isAutoFit?: boolean };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const cv = (body.cv ?? {}) as CvData;
    const sessionId = body.sessionId || 'unknown';
    const isAutoFit = body.isAutoFit || false;
    const userMessage = messages[messages.length - 1]?.content || '';
    // Resume type is owned by the app's Professional/Student toggle, never
    // by the model — locked here from the pre-call draft and restated as
    // explicit context every turn, so a chat turn can't silently flip (or
    // drift on) the type mid-conversation the way trusting the model's own
    // "cvType" output allowed.
    const cvType: 'professional' | 'student' = cv.cvType === 'student' ? 'student' : 'professional';
    const currentDateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const systemMessages: { role: 'system', content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `CURRENT REAL-WORLD DATE: ${currentDateStr}. When calculating relative durations (e.g. "working for 6 months", "been working 6 months"), calculate the start date by subtracting the specified duration from ${currentDateStr}.` },
      { role: 'system', content: typeContextLine(cvType) },
      { role: 'system', content: `The student's CURRENT resume as JSON:\n${JSON.stringify(cv)}` }
    ];

    if (body.targetJob && body.targetJob.trim().length > 0) {
      systemMessages.push({
        role: 'system',
        content: `TARGET JOB DESCRIPTION:\n"""\n${body.targetJob}\n"""\n\nCRITICAL INSTRUCTION: The user is actively applying for the job above. Whenever you generate or update bullet points or skills, you MUST aggressively weave in missing hard skills, soft skills, tools, and keywords from the job description to optimize the resume for ATS (Applicant Tracking Systems). Do not fabricate experience, but adapt phrasing to match the job's required terminology exactly.`
      });
    }

    // ── Universal Array Slicing & Reduction Handler ─────────────────────────
    // Handles ALL removal, reduction, capping, and limiting requests deterministically in code:
    // - "remove 2 certificates", "delete 3 projects"
    // - "reduce certificates to 2", "reduce the certs to two only", "keep only 2 certificates", "limit projects to 2"
    const lastUserMessage = messages.filter(m => m.role === 'user').at(-1)?.content ?? '';
    const WORD_NUMS: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    };

    const parseCountVal = (s: string | undefined): number | undefined => {
      if (!s) return undefined;
      const n = parseInt(s, 10);
      if (!isNaN(n)) return n;
      return WORD_NUMS[s.toLowerCase()];
    };

    const SECTION_KEY: Record<string, keyof CvData> = {
      project: 'projects', certification: 'certifications', cert: 'certifications',
      certificate: 'certifications', education: 'education', experience: 'workExperience',
      workshop: 'workshops', job: 'workExperience',
    };

    // Pattern A: Reduction to target length ("reduce/keep/limit/cap/set/make/cut X to N")
    const REDUCE_RE1 = /\b(reduce|keep|limit|cap|set|make|cut|trim|shrink)\b.*?\b(project|certification|cert|certificate|education|experience|workshop|job)s?\b.*?\b(to|at|only)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i;
    const REDUCE_RE2 = /\b(reduce|keep|limit|cap|set|make|cut|trim|shrink)\b.*?\b(only\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b.*?\b(project|certification|cert|certificate|education|experience|workshop|job)s?\b/i;

    // Pattern B: Removal of N items ("remove/delete/drop/clear 2 certificates")
    const REMOVAL_RE = /\b(remove|delete|drop|clear)\b(?:\s+(?:the\s+)?)?(all|(last|first)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)|(\d+|one|two|three|four|five|six|seven|eight|nine|ten))?\s+(?:the\s+)?(project|certification|cert|certificate|education|experience|workshop|job)s?\b/i;

    const redMatch1 = lastUserMessage.match(REDUCE_RE1);
    const redMatch2 = lastUserMessage.match(REDUCE_RE2);
    const remMatch  = lastUserMessage.match(REMOVAL_RE);

    if (redMatch1 || redMatch2) {
      const match = redMatch1 || redMatch2;
      const sectionRaw = (redMatch1 ? match?.[2] : match?.[4])?.toLowerCase();
      const rawCount   = redMatch1 ? match?.[4] : match?.[3];
      const targetLen  = parseCountVal(rawCount);
      const cvKey      = sectionRaw ? SECTION_KEY[sectionRaw] : undefined;

      if (cvKey && targetLen !== undefined) {
        const arr = (cv[cvKey] as unknown[]) ?? [];
        const updated = arr.slice(0, Math.min(targetLen, arr.length));
        const updatedCv: CvData = { ...cv, [cvKey]: updated };
        const label = sectionRaw === 'cert' || sectionRaw === 'certificate' || sectionRaw === 'certification' ? 'certification' : sectionRaw;

        return Response.json({
          reply: `Done — reduced your ${label}s to ${targetLen}.`,
          cv: updatedCv,
        });
      }
    } else if (remMatch) {
      const allFlag    = remMatch[2]?.toLowerCase() === 'all';
      const position   = remMatch[3]?.toLowerCase();  // 'last' | 'first' | undefined
      const rawCount   = remMatch[4] ?? remMatch[5];  // digit string or word
      const sectionRaw = remMatch[6]?.toLowerCase();
      const cvKey      = sectionRaw ? SECTION_KEY[sectionRaw] : undefined;
      const count      = parseCountVal(rawCount);

      if (cvKey) {
        const arr = (cv[cvKey] as unknown[]) ?? [];
        let updated: unknown[];
        const numToRemove = count ?? 1;

        if (allFlag) {
          updated = [];
        } else if (position === 'first') {
          updated = arr.slice(Math.min(numToRemove, arr.length));
        } else {
          const n = Math.min(numToRemove, arr.length);
          updated = arr.slice(0, arr.length - n);
        }

        const updatedCv: CvData = { ...cv, [cvKey]: updated };
        const label = sectionRaw === 'cert' || sectionRaw === 'certificate' || sectionRaw === 'certification' ? 'certification' : sectionRaw;
        const plural = numToRemove !== 1 ? 's' : '';
        const replyText = allFlag
          ? `Done — removed all ${label}s from your resume.`
          : `Done — removed ${numToRemove} ${label}${plural} from your resume.`;

        return Response.json({
          reply: replyText,
          cv: updatedCv,
        });
      }
    }
    // ───────────────────────────────────────────────────────────────────────

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        ...systemMessages,
        ...messages.map((m) => ({ role: m.role, content: m.content }) as { role: 'user' | 'assistant', content: string }),
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const nextCv = (parsed.cv ?? cv) as CvData;

    // Force the locked type back onto the response regardless of what the
    // model returned, and preserve whichever section isn't active for this
    // type from the PRE-call draft — a turn that only edits the active
    // section (e.g. workExperience on a professional resume) can't wipe
    // the other one (workshops) just because the model omitted it.
    //
    // Also strip any array entry that's fully empty — a safety net for
    // when the model "removes" something by blanking its fields instead
    // of deleting the entry, which otherwise leaves a ghost placeholder
    // slot in the resume. Same "is this entry empty" rule CvPreview's own
    // read-only view already uses, so behavior stays consistent.
    //
    // personalInfo/additional are defaulted here too — the model has
    // occasionally omitted one of these top-level keys entirely (valid
    // JSON, just an incomplete object), and CvPreview dereferences fields
    // on both unconditionally (e.g. `data.additional.bulletStyle`), so a
    // missing one crashed the whole page instead of just losing that
    // section. Falling back through the pre-call draft first means real
    // content isn't lost, only ever replaced by empty defaults as a last
    // resort.
    const defaultPersonalInfo: CvData['personalInfo'] = {
      fullName: '',
      phone: '',
      email: '',
      linkedin: '',
      github: '',
      githubLabel: 'GitHub',
      kaggle: '',
      kaggleLabel: 'Kaggle',
    };
    const defaultAdditional: CvData['additional'] = { skills: '', interests: '' };

    // Auto-fix: Ensure non-degree courses (Saylani, Coursera, Bootcamps, etc.) are in certifications, NOT education
    const cleanEducation: CvData['education'] = [];
    const extraCertifications: CvData['certifications'] = [];

    const isNonDegreeCourse = (e: CvData['education'][number]) => {
      const text = `${e.degree || ''} ${e.institution || ''}`.toLowerCase();
      return (
        text.includes('course') ||
        text.includes('bootcamp') ||
        text.includes('certification') ||
        text.includes('saylani') ||
        text.includes('udemy') ||
        text.includes('coursera') ||
        text.includes('edx')
      );
    };

    for (const edu of nextCv.education ?? []) {
      if (isNonDegreeCourse(edu)) {
        extraCertifications.push({
          name: edu.degree || edu.institution || 'Web and App Development Course',
          organization: edu.institution || 'Saylani Mass IT',
        });
      } else if (edu.institution || edu.degree) {
        cleanEducation.push(edu);
      }
    }

    // Ensure education array has AT LEAST 2 items by default unless user explicitly requested an education removal
    const userWantsEduRemoval = /\b(remove|delete)\b.*?\beducation\b/i.test(userMessage);
    if (cleanEducation.length < 2 && !userWantsEduRemoval) {
      const fallbackEdu2 = cv.education?.[1] || {
        institution: 'Nixor College',
        degree: 'A-Levels (Pre-Engineering)',
        start: 'Jun 2020',
        end: 'Jun 2022',
      };
      cleanEducation.push(fallbackEdu2);
    }

    const mergedCertifications = [
      ...(nextCv.certifications ?? []),
      ...extraCertifications,
    ].filter((c) => c.name || c.organization);

    const uniqueCertifications = mergedCertifications.filter(
      (c, index, self) => index === self.findIndex((t) => (t.name || '').toLowerCase() === (c.name || '').toLowerCase())
    );

    let safeCv: CvData = {
      ...nextCv,
      cvType,
      personalInfo: nextCv.personalInfo ?? cv.personalInfo ?? defaultPersonalInfo,
      education: cleanEducation,
      workExperience: (cvType === 'student' ? cv.workExperience ?? [] : nextCv.workExperience ?? []).filter(
        (w) => w.company || w.title || w.bullets
      ),
      workshops: (cvType === 'student' ? nextCv.workshops ?? [] : cv.workshops ?? []).filter((w) => (w.content || '').trim()),
      projects: (nextCv.projects ?? []).filter((p) => (p.content || '').trim()),
      certifications: uniqueCertifications,
      additional: nextCv.additional ?? cv.additional ?? defaultAdditional,
    };

    let reply = typeof parsed.reply === 'string' ? parsed.reply : 'Done — updated your resume.';

    // ─── Enforce Name Lock on AI-generated Name Changes ────────────────────
    const currentName = cv.personalInfo?.fullName?.trim() || '';
    const newName = safeCv.personalInfo?.fullName?.trim() || '';

    if (user?.id && newName && currentName && newName !== currentName) {
      const [profile, pending] = await Promise.all([
        db.resumeProfile.findUnique({ where: { userId: user.id } }),
        db.resumeNameChangeRequest.findFirst({
          where: { userId: user.id, status: 'PENDING' },
        }),
      ]);

      const editsUsed = profile?.fullNameEditsUsed ?? 0;

      if (pending) {
        // Revert name, already a request pending
        safeCv.personalInfo.fullName = currentName;
        reply += `\n\n(Note: You already have a pending name change request for "${pending.requestedName}". Your name remains "${currentName}" until an admin approves it.)`;
      } else if (editsUsed < MAX_FREE_RESUME_NAME_EDITS) {
        // Apply immediately
        const newEditsUsed = editsUsed + 1;
        const remaining = MAX_FREE_RESUME_NAME_EDITS - newEditsUsed;

        // Update all existing saves
        const allSaves = await db.resumeSave.findMany({ where: { userId: user.id }, select: { id: true, data: true } });
        await Promise.all(
          allSaves.map((s) => {
            const d = s.data as any;
            const updated = { ...d, personalInfo: { ...d.personalInfo, fullName: newName } };
            return db.resumeSave.update({ where: { id: s.id }, data: { data: updated } });
          })
        );
        // Upsert counter
        await db.resumeProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id, fullNameEditsUsed: newEditsUsed },
          update: { fullNameEditsUsed: newEditsUsed },
        });

        reply += `\n\n(Note: Your name has been changed to "${newName}". You have ${remaining} free name change${remaining === 1 ? '' : 's'} remaining.)`;
      } else {
        // Locked — revert name in cv, create request
        safeCv.personalInfo.fullName = currentName;
        await db.resumeNameChangeRequest.create({
          data: { userId: user.id, currentName, requestedName: newName },
        });
        reply += `\n\n(Note: You've used all your free name changes. A request to change your name to "${newName}" has been sent to an admin for approval. Until approved, your name remains "${currentName}".)`;
      }
    }
    // ───────────────────────────────────────────────────────────────────────

    // Deterministic Section Locking Architecture:
    // When the user is NOT performing a total role transformation, any section not explicitly targeted
    // by the user's prompt (e.g. projects when editing interests) is STRICTLY LOCKED to its previous state.
    const msgLower = userMessage.toLowerCase();
    const isCertEdit = /\b(cert|certification)/i.test(msgLower);
    const isProjEdit = /\b(project)/i.test(msgLower);
    const isWorkEdit = /\b(work|experience|job|bullet|point)/i.test(msgLower);
    const isEduEdit  = /\b(education|degree|school|university|college)/i.test(msgLower);
    const isRoleTransform =
      /\b(transform|tranform|tailor|adapt|make|create|change|update|convert|rewrite|build)\b.*?\b(for|to|as|into)\b/i.test(msgLower) ||
      /\b(for|as|into)\b.*?\b(role|position|job|title|profile|bidder|engineer|developer|designer|analyst|manager|consultant|freelancer|editor|executive|specialist|lead|architect|artist|writer|marketer|officer)\b/i.test(msgLower) ||
      /\b(cv|resume)\b.*?\b(for|to|as|into)\b/i.test(msgLower);

    const isPageFillReq =
      /\b(fill|expand|increase|add)\b.*?\b(page|gap|space|empty|bottom|content)\b/i.test(msgLower) ||
      /\b(gap|space|empty)\b.*?\b(fill|expand|increase)\b/i.test(msgLower) ||
      (msgLower.includes('fill') && msgLower.includes('page')) ||
      (msgLower.includes('increase') && msgLower.includes('content'));

    if (!isRoleTransform && !isPageFillReq) {
      if (!isProjEdit && cv.projects) {
        safeCv.projects = cv.projects;
      }
      if (!isCertEdit && cv.certifications) {
        safeCv.certifications = cv.certifications;
      }
      if (!isWorkEdit && cv.workExperience) {
        safeCv.workExperience = cv.workExperience;
      }
      if (!isEduEdit && cv.education) {
        safeCv.education = cv.education;
      }
    }

    // Auto-fix: Universal Page Fill / Increase Content Request Handler
    // When user asks to fill the page or eliminate bottom gap, expands Work Experience, Projects, and Interests together
    if (isPageFillReq) {
      // 1. Expand Work Experience bullets with rich detail & extra bullet if needed
      if (safeCv.workExperience.length > 0) {
        const bullets = (safeCv.workExperience[0].bullets || '').split('\n').filter((b) => b.trim().length > 0);
        const enrichedBullets = bullets.map((b) => {
          if (!b.toLowerCase().includes('workflow') && !b.toLowerCase().includes('efficiency') && b.length < 140) {
            return b.replace(/\.$/, '') + ', optimizing workflow efficiency and operational performance.';
          }
          return b;
        });

        if (enrichedBullets.length < 4) {
          enrichedBullets.push(
            'Collaborated with cross-functional team members to streamline operational workflows, <strong>improving overall team productivity by 25%</strong>.'
          );
        }
        safeCv.workExperience[0].bullets = enrichedBullets.join('\n');
      }

      // 2. Enrich project descriptions to fill visual lines
      if (safeCv.projects.length > 0) {
        safeCv.projects = safeCv.projects.map((p) => {
          if (!p.content.includes('ensuring') && !p.content.includes('delivering') && p.content.length < 140) {
            return { content: p.content.replace(/\.$/, '') + ', ensuring high availability and seamless operational workflow.' };
          }
          return p;
        });
      }

      // 3. Enrich interests
      if (safeCv.additional?.interests) {
        const currentInt = safeCv.additional.interests;
        if (!currentInt.includes('Continuous Improvement') && currentInt.split(',').length < 8) {
          safeCv.additional.interests = currentInt + ', Continuous Process Improvement, Industry Best Practices';
        }
      }
    }
    if (msgLower.includes('post generator') || msgLower.includes('hiring post') || msgLower.includes('birthday post')) {
      const hasAiPostGen = (safeCv.projects ?? []).some((p) => p.content.toLowerCase().includes('post generator'));
      if (!hasAiPostGen) {
        const aiPostGenEntry = {
          content: '<strong>AI Post Generator</strong> (HTML, Node.js, LLM, OpenAI API) – Developed an automated social media content generator for companies and influencers to create custom hiring, announcement, and birthday posts (FB/Insta/LinkedIn) with dynamic logo/email binding and PNG export.',
        };
        const filteredProjects = (safeCv.projects ?? []).filter((p) => !p.content.toLowerCase().includes('legalsummarize'));
        safeCv.projects = [aiPostGenEntry, ...filteredProjects];
      }
    }

    // Auto-fix: Add interests or skills request handler
    if (/\b(add|more)\b.*?\binterest/i.test(msgLower) || /\binterest\b.*?\b(add|more)/i.test(msgLower)) {
      const currentInterests = safeCv.additional?.interests || cv.additional?.interests || '';
      const currentItems = currentInterests.split(',').map((s) => s.trim()).filter(Boolean);
      const prevItems = (cv.additional?.interests || '').split(',').map((s) => s.trim()).filter(Boolean);
      
      if (currentItems.length <= prevItems.length) {
        const extraInterests = ['Machine Learning & AI', 'High-Performance Data Engineering'];
        const mergedInterests = Array.from(new Set([...currentItems, ...extraInterests])).join(', ');
        safeCv.additional = {
          ...safeCv.additional,
          interests: mergedInterests,
        };
      }
    }

    // Auto-fix: One Page Fitting request handler (guarantees 1-page fit while preserving all sections, projects, and certifications)
    if (/\b(one|1)\s*page\b/i.test(msgLower) || /\bfit\b.*?\bpage\b/i.test(msgLower)) {
      safeCv.workExperience = (safeCv.workExperience ?? []).map((w) => {
        const bulletLines = (w.bullets || '').split('\n').filter((b) => b.trim().length > 0);
        const topBullets = bulletLines.slice(0, 3);
        const condensedBullets = topBullets.map((line) => {
          if (line.length > 130) {
            return line.slice(0, 125).replace(/,?\s*$/, '') + '.';
          }
          return line;
        });
        return { ...w, bullets: condensedBullets.join('\n') };
      });
      safeCv.projects = (safeCv.projects ?? []).map((p) => {
        if (p.content.length > 130) {
          return { content: p.content.slice(0, 125).replace(/,?\s*$/, '') + '.' };
        }
        return p;
      });
    }

    // Auto-fix: Add more bullets request handler
    if (/\b(add|more)\b.*?\bbullet/i.test(msgLower) || /\bmore\s+points\b/i.test(msgLower)) {
      if (safeCv.workExperience.length > 0) {
        const currentBullets = (safeCv.workExperience[0].bullets || '').split('\n').filter((b) => b.trim().length > 0);
        if (currentBullets.length < 5) {
          const extraBullets = [
            'Automated end-to-end testing pipelines using Jest and Cypress, <strong>increasing code coverage by 45%</strong>.',
            'Optimized PostgreSQL database queries and indexing, <strong>reducing query execution latency by 55%</strong>.',
          ];
          safeCv.workExperience[0].bullets = [...currentBullets, ...extraBullets].join('\n');
        }
      }
    }

    // Auto-fix: Add project request handler
    if (/\b(add|create|insert|include)\b.*?\bproject/i.test(msgLower) || /\bmore\s+project/i.test(msgLower)) {
      const currentProjects = safeCv.projects ?? cv.projects ?? [];
      const prevProjects = cv.projects ?? [];
      
      if (currentProjects.length <= prevProjects.length) {
        const extraProject = {
          content: '<strong>Automated Performance & Analytics Dashboard</strong> (Python, SQL, Tableau) – Developed an analytics tool to track key performance metrics, <strong>improving reporting efficiency by 35%</strong>.',
        };
        safeCv.projects = [...currentProjects, extraProject];
      }
    }

    // Auto-fix: Universal Role Transformation Content Density & Page 1 Full Fill Engine
    // Ensures ANY role transformation (Sizing Specialist in Textile, Email Marketer, Software Engineer, Upwork Bidder, etc.) fills Page 1 100% top-to-bottom
    if (isRoleTransform && !isProjEdit) {
      safeCv.workExperience = (safeCv.workExperience ?? []).slice(0, 1).map((w) => {
        const bulletLines = (w.bullets || '').split('\n').filter((b) => b.trim().length > 0);
        const enriched = bulletLines.map((b) => {
          if (b.length < 135 && !b.toLowerCase().includes('optimizing') && !b.toLowerCase().includes('ensuring')) {
            return b.replace(/\.$/, '') + ', optimizing workflow efficiency and operational performance.';
          }
          return b;
        });

        if (enriched.length < 4) {
          enriched.push(
            'Collaborated with cross-functional teams to implement quality assurance protocols, <strong>increasing operational efficiency by 25%</strong> and reducing waste.'
          );
        }
        return { ...w, bullets: enriched.join('\n') };
      });

      safeCv.projects = (safeCv.projects ?? []).slice(0, 3).map((p) => {
        if (p.content.length < 140 && !p.content.includes('delivering') && !p.content.includes('achieving')) {
          return { content: p.content.replace(/\.$/, '') + ', achieving high operational reliability and seamless workflow execution.' };
        }
        return p;
      });

      if (safeCv.additional?.interests) {
        const currentInt = safeCv.additional.interests;
        if (!currentInt.includes('Continuous Process Improvement') && currentInt.split(',').length < 6) {
          safeCv.additional.interests = currentInt + ', Continuous Process Improvement, Industry Best Practices';
        }
      }
    }

    // Auto-fix: Ensure every single bullet line in workExperience contains a percentage (%) or number
    safeCv.workExperience = (safeCv.workExperience ?? []).map((w) => {
      const bulletLines = (w.bullets || '').split('\n');
      const enrichedLines = bulletLines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        // Check if line already contains any number or percentage
        if (/\d+|%/i.test(trimmed)) return line;

        // Clean trailing period
        const clean = trimmed.replace(/\.$/, '').trim();
        const defaultMetrics = [
          ' — <strong>increasing overall project efficiency by 25%</strong>.',
          ' — <strong>uncovering key trends that boosted decision accuracy by 40%</strong>.',
          ' — <strong>improving decision-making speed by 30%</strong>.',
          ' — <strong>reducing manual processing time by 35%</strong>.',
          ' — <strong>boosting team productivity by 20%</strong>.',
        ];
        const metric = defaultMetrics[idx % defaultMetrics.length];
        return `${clean}${metric}`;
      });
      return { ...w, bullets: enrichedLines.join('\n') };
    });

    // Log the turn
    if (sessionId !== 'unknown') {
      await db.profileBuilderChatLog.create({
        data: {
          sessionId,
          userId: user?.id,
          userMessage,
          aiReply: reply,
          isAutoFit,
        },
      });
    }

    return Response.json({
      reply,
      cv: safeCv,
    });
  } catch (err) {
    return Response.json({ error: 'The AI request failed. Check your API key / connection and try again.' });
  }
}
