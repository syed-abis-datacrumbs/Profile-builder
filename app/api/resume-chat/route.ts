import OpenAI from 'openai';
import type { CvData } from '../../../lib/cvTypes';

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
- Return the WHOLE cv every time. Preserve existing fields unless the user specifically asks to edit, remove, or add to them. If the user asks to add new projects, experiences, or education, YOU MUST append new entries to the corresponding array with realistic content!
- If the user asks to remove/delete an entry (a certification, education entry, project, work experience, workshop, etc.), remove that WHOLE object from its array. Never leave it in place with its fields blanked out — an empty entry left behind still shows up in the resume as an empty placeholder slot, which looks broken. IMPORTANT: When you remove entries, you MUST actually produce a shorter array in the JSON — if the current array has 4 items and the user says remove 2, the output array MUST have exactly 2 items. Do NOT claim you removed something while keeping the array length the same. That is a critical failure.
- CRITICAL — Unambiguous quantity removals (remove first/last N): Phrases like "remove the last 2 projects", "remove the first 3 certifications", "delete the last project" are CLEAR and unambiguous. Act on them immediately without asking. To remove the LAST N items from an array, take the array, count its length, and slice off the last N entries — the output array length must equal original length minus N. To remove the FIRST N items, drop the first N entries. Always verify your output array length is correct before responding.
- CRITICAL — Ambiguous removal requests: The ONLY ambiguous case is when the user writes a bare number with no positional word, e.g. "remove 2 projects" or "delete 3 certifications" — this is ambiguous because "2" could mean the 2nd item (ordinal) OR two items (quantity). In this case ONLY, you MUST ask for clarification before making any deletion. Return the cv completely unchanged and in your "reply" ask: "Do you mean remove the 2nd project specifically, or remove two projects from the list? If you want to remove specific ones, which ones?" Do NOT ask for clarification when the user says "last 2", "first 2", "last one", "all", or names a specific entry — those are clear.
- CRITICAL — Courses vs Education: A "course", "certification", or "certificate" is NEVER an education entry. It must ALWAYS be added to the "certifications" array as { "name": "<course/certificate name>", "organization": "<provider name>" }. The "education" array is strictly for formal academic degrees (e.g. Bachelor's, Master's, Matric, Intermediate). If the user says "I did a course in X from Y" or "add certificate X from Y", put it in "certifications", not "education". If you have already (incorrectly) placed a course inside "education", remove it from "education" and add it to "certifications" instead.
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
    const body = (await request.json()) as { messages?: ChatMessage[]; cv?: CvData; targetJob?: string };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const cv = (body.cv ?? {}) as CvData;
    // Resume type is owned by the app's Professional/Student toggle, never
    // by the model — locked here from the pre-call draft and restated as
    // explicit context every turn, so a chat turn can't silently flip (or
    // drift on) the type mid-conversation the way trusting the model's own
    // "cvType" output allowed.
    const cvType: 'professional' | 'student' = cv.cvType === 'student' ? 'student' : 'professional';

    const systemMessages: { role: 'system', content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: typeContextLine(cvType) },
      { role: 'system', content: `The student's CURRENT resume as JSON:\n${JSON.stringify(cv)}` }
    ];

    if (body.targetJob && body.targetJob.trim().length > 0) {
      systemMessages.push({
        role: 'system',
        content: `TARGET JOB DESCRIPTION:\n"""\n${body.targetJob}\n"""\n\nCRITICAL INSTRUCTION: The user is actively applying for the job above. Whenever you generate or update bullet points or skills, you MUST aggressively weave in missing hard skills, soft skills, tools, and keywords from the job description to optimize the resume for ATS (Applicant Tracking Systems). Do not fabricate experience, but adapt phrasing to match the job's required terminology exactly.`
      });
    }

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

    const safeCv: CvData = {
      ...nextCv,
      cvType,
      personalInfo: nextCv.personalInfo ?? cv.personalInfo ?? defaultPersonalInfo,
      education: (nextCv.education ?? []).filter((e) => e.institution || e.degree),
      workExperience: (cvType === 'student' ? cv.workExperience ?? [] : nextCv.workExperience ?? []).filter(
        (w) => w.company || w.title || w.bullets
      ),
      workshops: (cvType === 'student' ? nextCv.workshops ?? [] : cv.workshops ?? []).filter((w) => (w.content || '').trim()),
      projects: (nextCv.projects ?? []).filter((p) => (p.content || '').trim()),
      certifications: (nextCv.certifications ?? []).filter((c) => c.name || c.organization),
      additional: nextCv.additional ?? cv.additional ?? defaultAdditional,
    };

    return Response.json({
      reply: typeof parsed.reply === 'string' ? parsed.reply : 'Done — updated your resume.',
      cv: safeCv,
    });
  } catch {
    return Response.json({ error: 'The AI request failed. Check your API key / connection and try again.' });
  }
}
