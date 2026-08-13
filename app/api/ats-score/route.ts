import OpenAI from 'openai';
import type { CvData } from '../../../lib/cvTypes';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) resume scoring expert. Given a resume as JSON, score how well it would parse and rank in ATS systems like Workday, Greenhouse, and Lever, on a scale of 0-100.

Consider: quantified achievements/metrics in bullets, keyword/skill density for the target role, standard section structure, contact completeness (email, LinkedIn/GitHub), bullet clarity and strong action verbs, and overall completeness (placeholders/empty sections hurt the score).

Respond with ONLY a JSON object (no markdown, no prose outside it):
{
  "score": <integer 0-100>,
  "breakdown": ["<short point>", "<short point>", "<short point>"]
}

Rules:
- "breakdown" is 2-3 short, specific, actionable points (max ~90 characters each) about what's actually helping or hurting THIS resume — not generic advice.
- Be honest and varied: a sparse or placeholder-heavy resume should score low; a strong, complete, metric-rich resume should score high. Do not default to a fixed number.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'OPENAI_API_KEY is not set.' }, { status: 500 });
  }

  try {
    const body = (await request.json()) as { cv?: CvData; jobDescription?: string };
    if (!body.cv) return Response.json({ error: 'Missing resume data' }, { status: 400 });

    let finalPrompt = SYSTEM_PROMPT;
    if (body.jobDescription && body.jobDescription.trim().length > 0) {
      finalPrompt += `\n\nCRITICAL TARGET JOB REQUIREMENT:\nThe user is applying for the following specific job description:\n"""\n${body.jobDescription}\n"""\nYou MUST aggressively score the resume against THIS specific job description. If the resume is missing core hard skills, soft skills, or tools mentioned in the job description, lower the score significantly. In the "breakdown", explicitly list the most critical missing keywords/skills that the user needs to inject to pass the ATS.`;
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: finalPrompt },
        { role: 'user', content: `Resume JSON:\n${JSON.stringify(body.cv)}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    const breakdown = Array.isArray(parsed.breakdown) ? parsed.breakdown.filter((b: unknown) => typeof b === 'string').slice(0, 3) : [];

    return Response.json({ score, breakdown });
  } catch {
    return Response.json({ error: 'ATS scoring failed. Check your API key / connection and try again.' }, { status: 500 });
  }
}
