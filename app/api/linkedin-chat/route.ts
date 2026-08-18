import OpenAI from 'openai';
import type { LinkedinProfileData } from '../../../types';
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are an expert LinkedIn coach helping a professional optimize their LinkedIn profile in a live editor. You are given the current profile as JSON plus a conversation. Apply the user's request, then reply.

Respond with ONLY a JSON object (no markdown fences, no prose outside it):
{
  "reply": "<a short, friendly chat message describing what you changed, or a clarifying question>",
  "linkedin": <the FULL updated profile JSON in the EXACT schema below>
}

Profile JSON schema (keep this exact shape and keys):
{
  "headline": "",                    // the ~220-char keyword-rich headline
  "about": "",                       // the About section (first person, a few short paragraphs)
  "industry": "",
  "targetRole": "",
  "experienceHighlights": ["", ...], // 3-5 punchy, quantified highlight bullets
  "keySkills": ["", ...],            // skills / keywords
  "featuredPost": "",                // a sample featured post
  "openToWork": true
}

Rules:
- Return the WHOLE linkedin object every time; preserve every field the user did not ask to change.
- Write in a confident, professional first-person voice; quantify achievements where possible.
- "toggle open to work" -> set openToWork accordingly.
- "add a skill / highlight" -> append to keySkills / experienceHighlights.
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
    const body = (await request.json()) as { messages?: ChatMessage[]; linkedin?: LinkedinProfileData; sessionId?: string; builderType?: string };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const linkedin = body.linkedin ?? {};
    const sessionId = body.sessionId || 'unknown';
    const builderType = body.builderType || 'linkedin';
    const userMessage = messages[messages.length - 1]?.content || '';

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: `The professional's CURRENT LinkedIn profile as JSON:\n${JSON.stringify(linkedin)}` },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const reply = typeof parsed.reply === 'string' ? parsed.reply : 'Done — updated your profile.';

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
      linkedin: parsed.linkedin ?? linkedin,
    });
  } catch (err) {
    return Response.json({ error: 'The AI request failed. Check your API key / connection and try again.' });
  }
}
