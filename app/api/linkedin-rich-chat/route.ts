import OpenAI from 'openai';
import type { LinkedinRichProfile } from '../../../lib/linkedinRichProfile';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are an expert LinkedIn coach helping a professional optimize their full LinkedIn profile (headline, about, experience, education, certifications, projects, skills, awards) in a live editor. You are given the current profile as JSON plus a conversation. Apply the user's request, then reply.

Respond with ONLY a JSON object (no markdown fences, no prose outside it):
{
  "reply": "<a short, friendly chat message describing what you changed, or a clarifying question>",
  "profile": <the FULL updated profile JSON in the EXACT schema below>
}

Profile JSON schema (keep this exact shape and keys):
{
  "fullName": "",
  "title": "",                  // short current job title, e.g. "Data Scientist"
  "headline": "",                // ~220-char keyword-rich LinkedIn headline
  "location": "",
  "currentCompany": "",
  "school": "",
  "about": "",                   // About section, first person, 2 short paragraphs
  "skills": ["", ...],
  "experience": [{ "title": "", "company": "", "start": "", "end": "", "description": "" }, ...],
  "education": [{ "school": "", "degree": "", "fieldOfStudy": "", "start": "", "end": "" }, ...],
  "certifications": [{ "name": "", "organization": "", "date": "" }, ...],
  "projects": [{ "title": "", "description": "" }, ...],
  "awards": [{ "title": "", "issuer": "", "date": "" }, ...],
  "coverTemplateId": "",          // do NOT change — controlled by a separate template picker
  "coverFieldValues": {},         // do NOT change — controlled by a separate template picker
  "pfpGradientId": "",            // do NOT change — controlled by a separate picker
  "headshotUrl": ""               // do NOT change — controlled by a separate photo upload
}

Rules:
- Return the WHOLE profile object every time; preserve every field and array item the user did not ask to change — including coverTemplateId, coverFieldValues, pfpGradientId, and headshotUrl EXACTLY as given, character for character. Those four are never yours to edit.
- "experience[].description" is a set of bullet points joined with "\\n" (one sentence per line) — when asked to add a bullet to a role, append a new "\\n"-joined line; when rewriting, keep it as short punchy lines, not a paragraph.
- Write "about" in a confident, professional first-person voice; quantify achievements where possible; keep it to 2 short paragraphs separated by "\\n\\n".
- "add a skill" -> append to skills. "add an education / certification / project / award" -> append a new well-formed entry to that array.
- Keep the headline within ~220 characters. Output valid JSON only.`;

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
    const body = (await request.json()) as { messages?: ChatMessage[]; profile?: LinkedinRichProfile };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const profile = body.profile ?? {};

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: `The professional's CURRENT profile as JSON:\n${JSON.stringify(profile)}` },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    return Response.json({
      reply: typeof parsed.reply === 'string' ? parsed.reply : 'Done — updated your profile.',
      profile: parsed.profile ?? profile,
    });
  } catch {
    return Response.json({ error: 'The AI request failed. Check your API key / connection and try again.' });
  }
}
