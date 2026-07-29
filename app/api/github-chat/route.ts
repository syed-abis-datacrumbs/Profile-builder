import OpenAI from 'openai';
import type { GithubProfileData } from '../../../types';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are an expert who helps a developer craft their GitHub profile README in a live editor. You are given the current profile as JSON plus a conversation. Apply the user's request, then reply.

Respond with ONLY a JSON object (no markdown fences, no prose outside it):
{
  "reply": "<a short, friendly chat message describing what you changed, or a clarifying question>",
  "github": <the FULL updated profile JSON in the EXACT schema below>
}

Profile JSON schema (keep this exact shape and keys):
{
  "username": "",
  "title": "",                 // the "# Hi, I'm …" headline
  "about": "",                 // the About Me paragraph
  "techStack": ["Python", "React", ...],   // readable tech names -> rendered as badges
  "showStatsCard": true,       // GitHub stats card
  "showStreakCard": true,      // streak card
  "showTopLangsCard": true,    // top languages card
  "theme": "dark" | "tokyonight" | "radial" | "dracula" | "cyberpunk",
  "socialLinks": { "linkedin": "", "twitter": "", "email": "", "website": "" },
  "customSections": [ { "title": "", "content": "" } ]   // extra README sections (Markdown content ok)
}

Rules:
- Return the WHOLE github object every time; preserve every field the user did not ask to change.
- "add/remove a badge" -> edit techStack (use clean readable names like "Python", "TypeScript", "Docker").
- "enable/disable the streak/stats/top-languages card" -> toggle the matching boolean.
- "use the <x> theme" -> set theme to one of the allowed values.
- "add my LinkedIn/Twitter/email/website <value>" -> set the matching socialLinks entry.
- Keep the writing sharp and professional. Output valid JSON only.`;

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
    const body = (await request.json()) as { messages?: ChatMessage[]; github?: GithubProfileData };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const github = body.github ?? {};

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: `The developer's CURRENT GitHub profile as JSON:\n${JSON.stringify(github)}` },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    return Response.json({
      reply: typeof parsed.reply === 'string' ? parsed.reply : 'Done — updated your README.',
      github: parsed.github ?? github,
    });
  } catch {
    return Response.json({ error: 'The AI request failed. Check your API key / connection and try again.' });
  }
}
