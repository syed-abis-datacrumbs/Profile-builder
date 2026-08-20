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
- CRITICAL — Content expansion & space filling requests: When the user asks to "increase content", "add more content", "expand", "fill the gap", "fill space", "fill empty space", "make it longer", "add more detail", or similar:
  1. You MUST produce text in the VERY FIRST TURN itself that is MEASURABLY AND VISIBLY LONGER than what was there before.
  2. Add at least 2–3 new, detailed bullet lines to workExperience items.
  3. Add extra technical sentences and impact details to project descriptions.
  4. Expand additional.skills and additional.interests with more comprehensive relevant tools and tech.
  5. CRITICAL: Never return the JSON with unchanged text or say "Done" without expanding the JSON content immediately in ONE GO on the first request!
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

    // ── Server-side removal handler ─────────────────────────────────────────
    // Handles ALL removal requests deterministically in code so the model
    // can never lie about having removed something.
    //
    // Word-number → integer map (covers typical resume quantities)
    const lastUserMessage = messages.filter(m => m.role === 'user').at(-1)?.content ?? '';
    const WORD_NUMS: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    };

    // Regex captures: position? (last/first/all) + count (digit or word) + section
    const REMOVAL_RE = /\b(remove|delete)\b(?:\s+(?:the\s+)?)?(all|(last|first)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)|(\d+|one|two|three|four|five|six|seven|eight|nine|ten))?\s+(?:the\s+)?(project|certification|cert|education|experience|workshop)s?\b/i;
    const remMatch = lastUserMessage.match(REMOVAL_RE);

    if (remMatch) {
      const allFlag    = remMatch[2]?.toLowerCase() === 'all';
      const position   = remMatch[3]?.toLowerCase();  // 'last' | 'first' | undefined
      const rawCount   = remMatch[4] ?? remMatch[5];  // digit string or word
      const sectionRaw = remMatch[6]?.toLowerCase();

      // Map section keyword → CV key
      const SECTION_KEY: Record<string, keyof CvData> = {
        project: 'projects', certification: 'certifications', cert: 'certifications',
        education: 'education', experience: 'workExperience', workshop: 'workshops',
      };
      const cvKey = sectionRaw ? SECTION_KEY[sectionRaw] : undefined;

      const parseCount = (s: string | undefined): number | undefined => {
        if (!s) return undefined;
        const n = parseInt(s, 10);
        if (!isNaN(n)) return n;
        return WORD_NUMS[s.toLowerCase()];
      };
      const count = parseCount(rawCount);

      // ── Ambiguous: bare number with no position word → ask for clarification
      if (cvKey && count !== undefined && !position && !allFlag) {
        const ordinal = count === 1 ? '1st' : count === 2 ? '2nd' : count === 3 ? '3rd' : `${count}th`;
        return Response.json({
          reply: `Just to clarify — do you mean remove the ${ordinal} ${sectionRaw} specifically, or remove ${count} ${sectionRaw}s from the list? If you want specific ones removed, let me know which ones (by name or position).`,
          cv,
        });
      }

      // ── Unambiguous: perform the removal server-side ─────────────────────
      if (cvKey && (allFlag || position)) {
        const arr = (cv[cvKey] as unknown[]) ?? [];
        let updated: unknown[];
        if (allFlag) {
          updated = [];
        } else if (position === 'last') {
          const n = Math.min(count ?? 1, arr.length);
          updated = arr.slice(0, arr.length - n);
        } else { // first
          const n = Math.min(count ?? 1, arr.length);
          updated = arr.slice(n);
        }
        const countWord = allFlag ? 'all' : `${count ?? 1}`;
        const posWord   = allFlag ? '' : ` ${position}`;
        const updatedCv: CvData = { ...cv, [cvKey]: updated };
        return Response.json({
          reply: `Done — removed${posWord} ${countWord} ${sectionRaw}${(count ?? 1) !== 1 ? 's' : ''} from your resume.`,
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

    const mergedCertifications = [
      ...(nextCv.certifications ?? []),
      ...extraCertifications,
    ].filter((c) => c.name || c.organization);

    const uniqueCertifications = mergedCertifications.filter(
      (c, index, self) => index === self.findIndex((t) => (t.name || '').toLowerCase() === (c.name || '').toLowerCase())
    );

    const safeCv: CvData = {
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
