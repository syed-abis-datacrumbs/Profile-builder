import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { extractText } from 'unpdf';
import { CvData } from '../../../../lib/cvTypes';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'OPENAI_API_KEY is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const cvType = (formData.get('cvType') as string) || 'professional';

    if (!file) {
      return Response.json({ error: 'No PDF file provided.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    let rawText = '';
    try {
      const extracted = await extractText(uint8, { mergePages: true });
      rawText = (extracted?.text || '').trim();
    } catch (parseErr: any) {
      console.error('[PDF Parse error]:', parseErr);
      return Response.json(
        { error: 'Failed to extract text from PDF. Ensure the file is not password-protected or corrupted.' },
        { status: 422 }
      );
    }

    if (!rawText || rawText.length < 30) {
      return Response.json(
        {
          error:
            'No selectable text could be found in this PDF. It may be an image scan. Please upload a PDF with selectable text.',
        },
        { status: 422 }
      );
    }

    // Limit text to avoid token blowout
    const truncatedText = rawText.slice(0, 15000);

    const openai = new OpenAI({ apiKey });

    const prompt = `
You are an expert ATS Resume and Executive Career Parser.
Analyze the following extracted text from a candidate's resume or profile PDF and extract it into a structured JSON representation.

RAW PDF TEXT:
"""
${truncatedText}
"""

OUTPUT REQUIREMENTS:
You must return a valid JSON object matching EXACTLY this structure:
{
  "cvData": {
    "personalInfo": {
      "fullName": string (candidate full name),
      "phone": string (formatted phone number),
      "email": string (email address),
      "linkedin": string (clean LinkedIn URL or empty string),
      "linkedinLabel": "LinkedIn",
      "github": string (clean GitHub URL or empty string),
      "githubLabel": "GitHub",
      "kaggle": string (clean Kaggle URL or empty string),
      "kaggleLabel": "Kaggle"
    },
    "summary": string (2-3 sentence high-impact professional summary or executive intro),
    "education": [
      {
        "institution": string (university or college name),
        "degree": string (degree title and major),
        "start": string (e.g. "Sep 2020"),
        "end": string (e.g. "Jun 2024" or "Present"),
        "location": string (city, country or state)
      }
    ],
    "workExperience": [
      {
        "company": string (company/organization name),
        "title": string (job title/role),
        "start": string (e.g. "Jan 2022"),
        "end": string (e.g. "Present" or "Dec 2023"),
        "location": string (city, state/country or "Remote"),
        "bullets": string (Multiple bullet points separated by newline characters "\\n". Every bullet MUST start with an action verb and bold key metrics or technologies using "**bold**" syntax, e.g. "• Spearheaded the migration of **50+ microservices** to Kubernetes, reducing latency by **35%**.")
      }
    ],
    "projects": [
      {
        "content": string (Format strictly as: "<strong>Project Title</strong> (Key Technologies) – Concise 1-2 sentence description highlighting impact and architecture."),
        "link": string (optional live demo or repository URL if found, else ""),
        "linkLabel": string (e.g. "[Live Demo]" or "[GitHub]" or "")
      }
    ],
    "certifications": [
      {
        "name": string (certification name),
        "organization": string (issuing organization)
      }
    ],
    "additional": {
      "skills": string (Comma-separated categorized list of technical skills, frameworks, languages, tools, e.g. "TypeScript, React, Next.js, Node.js, PostgreSQL, Docker, AWS, Git"),
      "interests": string (Interests or domains of passion, e.g. "Open Source, Distributed Systems, AI Engineering")
    }
  },
  "linkedinData": {
    "headline": string (A high-impact LinkedIn headline under 200 characters with role, USP, and top stack, e.g. "Full Stack Engineer | React, Next.js & Cloud Architecture | Building Scalable Web Products"),
    "about": string (A compelling, first-person narrative summary suitable for LinkedIn About section, structured into 2-3 engaging paragraphs with whitespace),
    "keySkills": string[] (Array of 8-12 top keyword skills),
    "experienceHighlights": string[] (Array of 3-5 punchy achievement bullets formatted for LinkedIn)
  }
}

CRITICAL RULES:
1. Do not hallucinate fake names or employers. Extract only what is present or reasonably inferred.
2. If certain links or fields are missing in the PDF, use clean empty strings "" rather than placeholders like "N/A" or "None".
3. Return ONLY the JSON object.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are an accurate, strict JSON resume extractor that always returns valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const rawJson = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(rawJson);

    if (!parsed.cvData || !parsed.cvData.personalInfo) {
      return Response.json(
        { error: 'AI was unable to extract structured resume data from this document.' },
        { status: 422 }
      );
    }

    // Ensure cvType is attached
    parsed.cvData.cvType = cvType === 'student' ? 'student' : 'professional';

    return Response.json({
      success: true,
      cvData: parsed.cvData as CvData,
      linkedinData: parsed.linkedinData || null,
      rawTextSnippet: rawText.slice(0, 300),
    });
  } catch (err: any) {
    console.error('[PDF Import API Error]:', err);
    return Response.json(
      { error: err.message || 'An unexpected error occurred while parsing the resume.' },
      { status: 500 }
    );
  }
}
