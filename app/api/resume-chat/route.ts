import OpenAI from 'openai';
import type { CvData } from '../../../lib/cvTypes';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are an expert resume-writing assistant helping a student build their CV in a live editor. You are given their current resume as JSON plus a conversation. Apply the user's request, then reply.

Respond with ONLY a JSON object (no markdown, no prose outside it):
{
  "reply": "<a short, friendly chat message describing what you changed, or a clarifying question>",
  "cv": <the FULL updated resume JSON, in the EXACT schema below>
}

Resume JSON schema (keep this exact shape and keys):
{
  "cvType": "professional" | "student",
  "personalInfo": { "fullName": "", "phone": "", "email": "", "linkedin": "", "linkedinLabel": "Linkedin", "github": "", "githubLabel": "GitHub", "kaggle": "", "kaggleLabel": "Kaggle" },
  "education": [ { "institution": "", "degree": "", "start": "", "end": "" } ],
  "workExperience": [ { "company": "", "title": "", "start": "", "end": "", "bullets": "one bullet per line\\nseparated by newlines" } ],
  "workshops": [ { "title": "", "description": "" } ],
  "projects": [ { "title": "", "technologies": "", "description": "" } ],
  "certifications": [ { "name": "", "organization": "" } ],
  "additional": { "skills": "", "interests": "" }
}

Rules:
- Return the WHOLE cv every time; preserve every field the user did not ask to change.
- Write concise, quantified, professional resume content. For emphasis inside bullets/descriptions use inline HTML tags — <strong>…</strong> for bold, <em>…</em> for italic, <u>…</u> for underline. Do NOT use markdown "**".
- "workExperience" bullets: one bullet per line, newline-separated (no leading "-" or "•").
- If asked to switch to a student resume, set "cvType":"student" (student layout shows Workshops instead of Work Experience); professional shows Work Experience.
- Never fabricate real contact details — keep whatever placeholders already exist.
- Output valid JSON only.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
    const cv = body.cv ?? {};

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: `The student's CURRENT resume as JSON:\n${JSON.stringify(cv)}` },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    return Response.json({
      reply: typeof parsed.reply === 'string' ? parsed.reply : 'Done — updated your resume.',
      cv: parsed.cv ?? cv,
    });
  } catch {
    return Response.json({ error: 'The AI request failed. Check your API key / connection and try again.' });
  }
}
