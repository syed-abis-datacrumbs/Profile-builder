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
- CRITICAL — UNIVERSAL ROLE TRANSFORMATION RULE:
  When the user asks to transform, convert, build, rewrite, switch, or adapt the profile for ANY target role (e.g. "Transform the git for full stack developer", "Make this for backend engineer", "Build AI/ML profile", "Frontend developer README", "DevOps engineer", "Data Engineer"):
  1. THIS IS A COMPLETE PROFILE RE-ALIGNMENT: YOU MUST OVERWRITE AND REGENERATE ALL SECTIONS IN THE RETURNED JSON TO MATCH THE TARGET ROLE!
  2. TITLE: Set the title directly to the target role (e.g. "Full Stack Developer", "Backend Engineer", "Senior DevOps Engineer").
  3. ABOUT ME: Completely replace previous text with a rich, authoritative, 2-paragraph summary tailored strictly to that role.
  4. TECH STACK: Completely replace all badges with the modern standard stack for that role (e.g. for Full Stack: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express", "PostgreSQL", "MongoDB", "Docker", "Tailwind CSS", "Git", "REST APIs", "AWS"]).
  5. EXPERTISE SECTION: Overwrite/replace the "💡 Expertise" entry inside 'customSections' with 4 comprehensive technical bullet points for that target domain.
  6. FEATURED PROJECTS: Overwrite/replace the "🚀 Featured Projects" entry inside 'customSections' with 3-4 rich, realistic, role-aligned projects describing architecture, tools, and quantified metrics!
     - NEVER preserve old mismatched projects (such as keeping Data Science/ML projects like Demand Forecasting, Feature Store, LightGBM, Feast when switching to Full Stack)!
     - For Full Stack Developer, generate rich projects such as:
       • [E-Commerce Microservices Platform](https://github.com/username/ecommerce-platform): Full-stack shopping application with Next.js, Node.js, Express, PostgreSQL, and Stripe payment workflows.
       • [Real-Time Collaborative Workspace](https://github.com/username/collab-workspace): Live multi-user document editor built with React, WebSockets, Redis pub/sub, and Tailwind CSS.
       • [Enterprise SaaS Analytics Dashboard](https://github.com/username/saas-analytics): Full-stack metrics aggregator with TypeScript, Next.js App Router, Prisma ORM, and Docker deployment.
  7. NEVER send a chat reply claiming you updated projects, expertise, or tech stack without actually replacing them in the returned 'github' JSON object!

- CRITICAL — PROJECT TRANSFORMATION & REWRITING ("Transform my projects as per my full stack profile", "rewrite projects for backend", "give me full stack projects", "update projects for my role"):
  1. DISCARD ALL OLD MISMATCHED PROJECT NAMES & TOPICS:
     - When the user asks to adapt, rewrite, or transform projects to match a target domain (such as Full Stack):
     - NEVER retain old project titles (such as "Churn Uplift Model", "Demand Forecasting", "LightGBM", "Feature Store") and simply append web buzzwords to them!
     - YOU MUST COMPLETELY REPLACE them with 3 brand-new, authentic, domain-standard projects with realistic GitHub repo links and rich 2-line descriptions!
  2. Domain-Specific Project Standard:
     - For Full Stack Developer:
       • [E-Commerce Microservices Platform](https://github.com/username/ecommerce-platform): Developed a high-throughput multi-vendor marketplace with Next.js 14 App Router, TypeScript, Node.js microservices, PostgreSQL with Prisma ORM, and Stripe webhook workflows.
       • [Real-Time Collaborative Workspace](https://github.com/username/collab-workspace): Built a low-latency collaborative document workspace with React, Tailwind CSS, WebSockets, Redis cache layer, and end-to-end operational transformation.
       • [Enterprise SaaS Analytics Dashboard](https://github.com/username/saas-analytics): Full-stack metrics aggregator with TypeScript, Next.js App Router, Prisma ORM, and Docker deployment.
     - For Backend Engineer:
       • [Distributed REST & gRPC API Gateway](https://github.com/username/grpc-gateway): High-throughput API gateway with Node.js, Express, Redis caching, and PostgreSQL.
       • [Multi-Tenant Microservices Orchestrator](https://github.com/username/microservices-engine): Distributed async event-driven architecture using Kafka, Docker, and MongoDB.
     - For Frontend Developer:
       • [Modern Component Design System](https://github.com/username/design-system): Highly accessible component library built with React, TypeScript, Storybook, and Tailwind CSS.
       • [Interactive Financial SaaS Portal](https://github.com/username/finance-portal): Responsive dashboard with Next.js, Framer Motion, and Chart.js.
  3. When the user asks to transform only the projects, preserve all other sections (title, about, badges, links) and overwrite ONLY the "🚀 Featured Projects" entry in 'customSections' with the new domain-specific projects!

- CRITICAL — Incorporating User's Real Projects: When the user describes specific projects (e.g. face recognition door lock, AI post generator, 3D jacket website, YOLO detection, WhatsApp restaurant bot):
  1. YOU MUST REPLACE all generic placeholder projects in the "🚀 Featured Projects" section with the user's EXACT projects!
  2. Write rich, professional, 2-line technical descriptions for EVERY project mentioned by the user with tools and architectural details.
  3. Format each project with markdown link syntax:
     • [Project Name](https://github.com/username/repo-name): Detailed 2-line description highlighting technologies used, architecture, and impact.
- CRITICAL — Tech Stack Updating: When the user mentions technologies, tools, or frameworks (e.g. Next.js, React, Docker, Arduino, YOLO, Node.js, Python), IMMEDIATELY ADD THEM to the 'techStack' badges array!
- CRITICAL — Social & Platform Links: When the user asks to add or update ANY connection link (e.g. Vercel, Portfolio, Discord, YouTube, Kaggle, Medium, Hashnode, LeetCode, GitHub, LinkedIn, Twitter/X, Website, Email):
  1. YOU MUST update the 'socialLinks' object in the returned 'github' object! E.g. { ...github.socialLinks, vercel: "https://vercel.com/username" }.
  2. If no specific URL was provided, construct a sensible platform URL (e.g. "https://vercel.com/username").
  3. NEVER claim you added a connection or link in your reply without placing the key-value pair in 'github.socialLinks'!
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

- CRITICAL — STRICT SECTION ISOLATION FOR FOCUSED SURGICAL EDITS:
  1. FOCUSED EDITS vs. ROLE TRANSFORMATION:
     - ONLY transform the whole profile when the user explicitly requests a role switch/transformation (e.g. "transform for full stack developer").
     - For ALL OTHER isolated requests (e.g. "remove AWS and Docker from tech stack", "add React badge", "remove the last project", "change username", "update social link", "edit about me", "add section"):
       * ONLY modify that exact requested field or section!
       * PRESERVE all other sections and fields verbatim from 'The developer's CURRENT GitHub profile as JSON'!
       * NEVER rewrite, drop, shorten, re-generate, or alter customSections (like "💡 Expertise" or "🚀 Featured Projects") when editing another part of the profile!
  2. TECH STACK SURGERY: When adding or removing badges (e.g. "remove aws and docker from tech stack"):
     - Filter out the specified items from the 'techStack' array.
     - DO NOT TOUCH or regenerate any projects, about text, custom sections, or links! Keep them completely identical to the input JSON.
  3. PROJECT SURGERY (Add / Remove / Edit Projects):
     - When the user asks to "remove the last project", "remove the second project", or "add a project", ONLY modify the matching item inside the "🚀 Featured Projects" section in 'customSections'.
     - DO NOT touch or regenerate the other projects in that section or touch the tech stack, about me, or expertise!
     - Slicing/Removing: If there are 3 projects and user says "remove the last project", the resulting "🚀 Featured Projects" section must retain the first 2 projects verbatim and drop only the last one.

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
    const github: Partial<GithubProfileData> = body.github ?? {};
    const sessionId = body.sessionId || 'unknown';
    const builderType = body.builderType || 'github';
    const userMessage = messages[messages.length - 1]?.content || '';

    // ── Direct Fast & Deterministic Field Handlers ─────────────────────────
    const userMsg = userMessage.trim();

    // 1. Direct Username Handler ("change username to ahmerkhanak", "my github is ahmerkhanak", etc.)
    const usernameMatch =
      userMsg.match(/\b(?:change|update|set)?\s*(?:the\s+)?(?:github\s+)?(?:user\s*name|username|handle)\s*(?:to|:|=)?\s*([a-zA-Z0-9_\-\.]+)\b/i) ||
      userMsg.match(/\b(?:my\s+github\s+is|my\s+username\s+is|github\.com\/)\s*([a-zA-Z0-9_\-\.]+)\b/i) ||
      userMsg.match(/\b(?:username|handle):\s*([a-zA-Z0-9_\-\.]+)\b/i);

    if (usernameMatch && usernameMatch[1]) {
      const cleanUsername = usernameMatch[1].trim().replace(/^@/, '').replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
      if (cleanUsername) {
        const updatedGithub: GithubProfileData = {
          ...github as GithubProfileData,
          username: cleanUsername,
        };
        if (Array.isArray(updatedGithub.customSections)) {
          updatedGithub.customSections = updatedGithub.customSections.map((sec) => ({
            ...sec,
            content: sec.content ? sec.content.replace(/github\.com\/(?:alex-rivera-dev|your-username|username|alexrivera-ai)/g, `github.com/${cleanUsername}`) : sec.content,
          }));
        }
        if (sessionId !== 'unknown') {
          await db.profileBuilderChatLog.create({
            data: {
              sessionId,
              builderType,
              userId: user?.id,
              userMessage,
              aiReply: `Done — I've updated your GitHub username to "${cleanUsername}".`,
              isAutoFit: false,
            },
          });
        }
        return Response.json({
          reply: `Done — I've updated your GitHub username to "${cleanUsername}".`,
          github: updatedGithub,
        });
      }
    }

    // 2. Direct Social Connections Removal ("remove all connects from my git", "remove social links", etc.)
    const isRemoveAllConnects = /\b(?:remove|delete|clear)\s+(?:all\s+)?(?:connects|connections|social\s*links|socials|links)\b/i.test(userMsg);
    if (isRemoveAllConnects) {
      const updatedGithub: GithubProfileData = {
        ...github as GithubProfileData,
        socialLinks: {},
      };
      if (sessionId !== 'unknown') {
        await db.profileBuilderChatLog.create({
          data: {
            sessionId,
            builderType,
            userId: user?.id,
            userMessage,
            aiReply: "I've removed all social connections from your profile.",
            isAutoFit: false,
          },
        });
      }
      return Response.json({
        reply: "I've removed all social connections from your profile.",
        github: updatedGithub,
      });
    }

    // 3. Direct Banner Removal ("remove banner", "delete cover", etc.)
    const isRemoveBanner = /\b(?:remove|delete|clear)\s+(?:banner|cover|header)\b/i.test(userMsg);
    if (isRemoveBanner) {
      const updatedGithub: GithubProfileData = {
        ...github as GithubProfileData,
        bannerUrl: '',
      };
      if (sessionId !== 'unknown') {
        await db.profileBuilderChatLog.create({
          data: {
            sessionId,
            builderType,
            userId: user?.id,
            userMessage,
            aiReply: "I've removed the cover banner from your README.",
            isAutoFit: false,
          },
        });
      }
      return Response.json({
        reply: "I've removed the cover banner from your README.",
        github: updatedGithub,
      });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
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

    const updatedGithub: GithubProfileData = (parsed.github && typeof parsed.github === 'object') ? parsed.github : github;
    if (updatedGithub && !updatedGithub.avatarUrl) {
      updatedGithub.avatarUrl = github?.avatarUrl || '/images/github-profile/git-profile-1.png';
    }

    return Response.json({
      reply,
      github: updatedGithub,
    });
  } catch (err: any) {
    console.error('[GitHub AI Error]:', err);
    return Response.json({
      error: err?.message || 'The AI request failed. Check your API key / connection and try again.',
    });
  }
}
