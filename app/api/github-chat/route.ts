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
  "avatarUrl": "",             // the user's profile picture URL (PRESERVE THIS EXACTLY)
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
- ALWAYS generate comprehensive, highly detailed, and lengthy content (2-3 full paragraphs or extensive bullet points) to ensure the profile looks rich and professional. Do NOT generate short, one-sentence sections.
- When asked to add projects or content, ALWAYS generate 2 to 4 complete, realistic, production-grade project descriptions with concrete names, metrics, architectures, and tech stacks.
- CRITICAL FORMATTING RULE: DO NOT use markdown headers (like #, ##, ###) or bold/italic syntax (like ** or *) inside ANY text fields.
- HOWEVER, YOU MUST USE markdown link syntax for project titles or references (e.g. [Project Name](https://github.com/username/repo)). The visual builder supports clickable links.
- Format lists or projects cleanly with plain text bullets (e.g. "• ") and use spacing instead of bolding:
  • [Vulnerability Assessment Tool](https://github.com/yourname/vuln-tool): Developed a comprehensive vulnerability assessment tool...
- If the user asks to add projects or custom sections, append or update the entry in 'customSections' with full, rich plain-text content.
- ALWAYS generate "💡 Expertise" and "🚀 Featured Projects" custom sections by default when creating a profile from scratch.
- ALWAYS assign a 'bannerUrl' by randomly selecting ONE of the following exact URLs when creating a profile from scratch (do NOT use any other URLs):
  1. "https://media2.dev.to/dynamic/image/width=800,height=200,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F4e0d816kuzyu700pdbjn.png"
  2. "https://github.blog/wp-content/uploads/2023/10/Security-DarkMode-4.png?fit=800%2C200"
  3. "https://github.blog/wp-content/uploads/2024/04/Enterprise-DarkMode-2-3.png?fit=800%2C200"
  4. "https://github.blog/wp-content/uploads/2024/01/Productivity-DarkMode-3.png?fit=800%2C200"
  5. "https://res.cloudinary.com/dnqk2jlds/image/upload/f_auto,q_auto,w_800,h_200,c_fill/v1784892308/lms-assets/github-builder-banner.png"
  6. "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx3gQYfcsXGDOlHkID72zyJVRqRDFFgDVrBu362KeYVQ&s=10"

General Rules:
- Return the WHOLE github object every time; preserve every field the user did not ask to change.
- NEVER invent or hallucinate a fake name (like "Alex Rivera") if the user does not provide one. Use a generic greeting like "Hi 👋" for the title if no name is known.
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
