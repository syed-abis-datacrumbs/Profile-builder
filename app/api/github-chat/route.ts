import OpenAI from 'openai';
import type { GithubProfileData } from '../../../types';
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are an expert technical resume & GitHub README specialist helping a developer craft their GitHub profile README in a live editor. You are given the current profile as JSON plus a conversation. Apply the user's request, then reply.

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
  "bannerUrl": "",             // full-width cover image URL at the top of the README (set to "" or omit to remove)
  "techStack": ["Python", "React", ...],   // readable tech names -> rendered as badges
  "showStatsCard": true,       // GitHub stats card
  "showStreakCard": true,      // streak card
  "showTopLangsCard": true,    // top languages card
  "theme": "dark" | "tokyonight" | "radial" | "dracula" | "cyberpunk",
  "socialLinks": { "linkedin": "", "twitter": "", "email": "", "website": "" },
  "customSections": [ { "title": "", "content": "" } ]   // extra README sections (Markdown content ok)
}

CRITICAL CONTENT QUALITY RULES:
- NEVER output generic placeholder text like "Add your projects here", "Insert description here", or "Fill in details".
- When asked to add projects or content (e.g., "add sample projects on LLMs", "add AI/ML projects", "add experience section"), ALWAYS generate 2 to 4 complete, realistic, production-grade project descriptions with concrete names, metrics, architectures, and tech stacks.
- Format project items cleanly in Markdown:
  **Project Name** — Detailed technical summary explaining what was built, technologies used (e.g., PyTorch, LangChain, vLLM, QLoRA, RAG), and realistic performance/business impact (e.g., "reduced p99 latency by 45%", "achieved 92% retrieval accuracy on 10k docs").
- If the user asks to add projects or custom sections, append or update the entry in \`customSections\` with full, rich Markdown content.

General Rules:
- Return the WHOLE github object every time; preserve every field the user did not ask to change.
- "add my github: <username>", "my github is <username>", or "change username to <x>" -> set the "username" field to the handle (e.g. "syed-abis-datacrumbs"). If a URL like "https://github.com/username" is given, extract just the handle "username".
- "add/remove a badge" -> edit techStack (use clean readable names like "Python", "TypeScript", "Docker").
- "enable/disable the streak/stats/top-languages card" -> toggle the matching boolean.
- "use the <x> theme" -> set theme to one of the allowed values.
- "add my LinkedIn/Twitter/email/website <value>" -> set the matching socialLinks entry.
- "change/set/add banner" -> set bannerUrl to the user's image URL. If the user says "remove banner", set bannerUrl to "".
- Keep the writing sharp, authoritative, and professional. Output valid JSON only.`;

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
    const body = (await request.json()) as { messages?: ChatMessage[]; github?: GithubProfileData; sessionId?: string; builderType?: string };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const github = body.github ?? {};
    const sessionId = body.sessionId || 'unknown';
    const builderType = body.builderType || 'github';
    const userMessage = messages[messages.length - 1]?.content || '';

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
    const reply = typeof parsed.reply === 'string' ? parsed.reply : 'Done — updated your README.';

    const user = await currentUser();
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
      github: parsed.github ?? github,
    });
  } catch (err) {
    return Response.json({ error: 'The AI request failed. Check your API key / connection and try again.' });
  }
}
