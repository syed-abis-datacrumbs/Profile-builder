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
  "workshops": [ { "title": "", "description": "" } ],
  "projects": [ { "title": "", "technologies": "", "description": "" } ],
  "certifications": [ { "name": "", "organization": "" } ],
  "additional": { "skills": "", "interests": "" }
}

You'll be told the CURRENT resume type (professional or student) as separate context on every turn — that's fixed for this conversation. If the user asks to switch it, tell them in "reply" to use the Professional/Student toggle above the chat, and keep filling the sections for the CURRENT type this turn — don't guess ahead.

Rules:
- ALWAYS make forward progress. Never respond with only a clarifying question and no changes to the cv — a beginner with almost no info (e.g. just a name) should still get a complete, realistic, ready-to-edit resume back immediately, not an empty shell or a stalled conversation. If you have a genuine follow-up question, ask it in "reply" AFTER you've already filled in a full, plausible draft — never before.
- Whenever a section is missing or empty and the user hasn't given you real content for it, fill it yourself with complete, plausible, professional example content appropriate to their stated (or inferable) target role/field — education, work experience or workshops, projects, certifications, skills, and interests should never be left blank or as raw placeholder text. Base it on whatever real details the user DID give you (name, target role, field, experience level); invent sensible specifics (a school, a past role, a couple of projects with quantified bullets) the same way a filled-out sample resume would, so the student has something concrete to react to and edit rather than a blank form.
- Exception: contact fields (phone, email, linkedin, github, kaggle) are the one place NOT to invent realistic-looking specifics, since those are personal to the student and could be mistaken for real. If the user hasn't given you their own, use obviously-generic placeholder values — phone "+92 3XX XXXXXXX", email "your.email@example.com", and leave linkedin/github/kaggle as empty strings ("") rather than guessing a URL from their name. Never build a name-based or otherwise plausible-looking fake phone number, email, or profile URL.
- Write concise, quantified, professional resume content. For emphasis inside bullets/descriptions use inline HTML tags — <strong>…</strong> for bold, <em>…</em> for italic, <u>…</u> for underline. Do NOT use markdown "**".
- "workExperience" bullets: one bullet per line, newline-separated (no leading "-" or "•").
- Return the WHOLE cv every time; preserve every field the user already gave real content for — only fill in what's genuinely still missing.
- If the user asks to remove/delete an entry (a certification, education entry, project, work experience, workshop, etc.), remove that WHOLE object from its array. Never leave it in place with its fields blanked out — an empty entry left behind still shows up in the resume as an empty placeholder slot, which looks broken.
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
    const body = (await request.json()) as { messages?: ChatMessage[]; cv?: CvData };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const cv = (body.cv ?? {}) as CvData;
    // Resume type is owned by the app's Professional/Student toggle, never
    // by the model — locked here from the pre-call draft and restated as
    // explicit context every turn, so a chat turn can't silently flip (or
    // drift on) the type mid-conversation the way trusting the model's own
    // "cvType" output allowed.
    const cvType: 'professional' | 'student' = cv.cvType === 'student' ? 'student' : 'professional';

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: typeContextLine(cvType) },
        { role: 'system', content: `The student's CURRENT resume as JSON:\n${JSON.stringify(cv)}` },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
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
    const safeCv: CvData = {
      ...nextCv,
      cvType,
      education: (nextCv.education ?? []).filter((e) => e.institution || e.degree),
      workExperience: (cvType === 'student' ? cv.workExperience ?? [] : nextCv.workExperience ?? []).filter(
        (w) => w.company || w.title || w.bullets
      ),
      workshops: (cvType === 'student' ? nextCv.workshops ?? [] : cv.workshops ?? []).filter(
        (w) => w.title || w.description
      ),
      projects: (nextCv.projects ?? []).filter((p) => p.title || p.description),
      certifications: (nextCv.certifications ?? []).filter((c) => c.name || c.organization),
    };

    return Response.json({
      reply: typeof parsed.reply === 'string' ? parsed.reply : 'Done — updated your resume.',
      cv: safeCv,
    });
  } catch {
    return Response.json({ error: 'The AI request failed. Check your API key / connection and try again.' });
  }
}
