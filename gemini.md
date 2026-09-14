# MOMENTUM (Profile Builder) — Developer & Agent Guide

<!-- 
=============================================================================
🤖 AGENT MANDATORY DIRECTIVE: READ & SELF-UPDATE
=============================================================================
This file is the living single source of truth for the MOMENTUM codebase.
1. Any AI agent operating in this repository MUST read and adhere to all rules,
   architecture patterns, and constraints defined in this file.
2. CONTINUOUS LEARNING / SELF-UPDATE: Whenever you solve a bug, receive a
   correction from the user, discover a Next.js / library gotcha, or implement
   new conventions, you MUST update this file (gemini.md) during your turn to
   persist that knowledge for subsequent sessions.
=============================================================================
-->

## 0. AI Agent Protocol & Self-Update Instructions

> [!IMPORTANT]
> **Operating Directives for AI Agents:**
> - **Package Manager Strictness:** ALWAYS use `bun` and `bunx`. Never use `npm`, `npx`, or `yarn`.
> - **Read Before Acting:** Consult this document before editing layouts, fonts, analytics, styles, or AI prompts.
> - **Self-Update Requirement:** Whenever you:
>   - Receive a correction or preference from the user.
>   - Fix a non-obvious bug or framework gotcha (e.g., Next.js font preloading, GA4 routing, React 19 / Turbopack nuances).
>   - Add or change an API route, studio feature, or database model.
>   You **MUST update this `gemini.md` document** in the appropriate section (or append to the Solved Gotchas / Knowledge Base) before concluding your turn so that future agent instances retain this context.
> - **Preserve Existing Rules:** Do not delete past rules or constraints when updating; append new gotchas and refine existing sections.

---

## 1. Running the Project with Bun

This project uses **Bun** as its primary JavaScript runtime and package manager.

### Prerequisites
- [Bun](https://bun.sh/) (v1.1+ recommended)
- Node.js runtime environment (Next.js Turbopack)
- PostgreSQL database (Neon serverless or local Postgres)

### Commands
```bash
# 1. Install dependencies
bun install

# 2. Generate Prisma ORM client
bunx prisma generate

# 3. Push database schema changes (if modifying schema.prisma)
bunx prisma db push

# 4. Start local development server (Turbopack on http://localhost:3000)
bun run dev

# 5. Run typecheck without emitting files
bun x tsc --noEmit

# 6. Run production build
bun run build

# 7. Start production server locally
bun run start
```

### Environment Variables (`.env`)
Ensure the following keys exist in your `.env` file for local development:
- `OPENAI_API_KEY`: API key for GPT-4o-mini powering the AI Chat Studios.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`: Clerk user authentication.
- `DATABASE_URL`: PostgreSQL connection string (Neon / pooling connection).
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloud image asset storage.
- `ADMIN_EMAILS`: Comma-separated admin emails allowed into `/admin`.

> [!IMPORTANT]
> Next.js loads environment variables when the server starts. If you modify `.env`, you **must restart** the local server (`Ctrl + C` then `bun run dev`).

---

## 2. System Architecture & Workspaces

MOMENTUM is an all-in-one career document builder with three main studio workflows plus an administrative hub:

1. **Resume Studio (`/components/ResumeChatStudio.tsx`)**:
   - Live interactive A4 document editor with rich-text toolbar (Bold, Italic, Underline, Bullet lists).
   - Real-time side-by-side AI chat for rewriting bullet points, ATS formatting, and tailoring.
   - Named version saving (`/api/resumes`), PDF generation (`/api/pdf`), and template gallery.
2. **GitHub README Studio (`/components/GithubChatStudio.tsx`, `/components/GithubReadmePreview.tsx`)**:
   - Visual profile preview with dynamic shields badges, streak cards, and repo highlights.
   - Dedicated pencil action menus on Cover Banner and Avatar (upload, choose preset, download, remove).
   - Named profile versions (`/api/github-saves`).
3. **LinkedIn Studio (`/components/LinkedinChatStudio.tsx`)**:
   - Interactive profile card and rich feed simulator.
   - 1-Click "Copy to LinkedIn" package drawer (`components/LinkedinCopyDrawer.tsx`) with headline, about, bullets, and high-res banner download.
   - Streamlined saved profile version drawer (`/api/linkedin-saves`).
4. **Universal Importer (`/api/import/pdf` & `/api/import/github`)**:
   - Unified import modal (`components/ImportModal.tsx`) accessible across Resume, LinkedIn, and GitHub studios.
   - Workerless server-side PDF extraction via `unpdf` paired with OpenAI JSON schema extraction.
   - Direct GitHub API ingest from username, `@handle`, or full profile URL.
5. **Admin Suite (`/app/admin/...`)**:
   - Manages user accounts, payment receipts, coupon codes, reported issue logs, and real-time live traffic stats (`/app/admin/traffic`).
   - Protected by `isUserAdmin(user)` and `requireAdmin()` verifying against both `BUILDER_ACCESS_EMAILS` and `ADMIN_EMAILS`.
6. **Proxy / Middleware (`/proxy.ts`)**:
   - Note: Next.js 16 uses `proxy.ts` rather than `middleware.ts` convention for Clerk authentication.

---

## 3. Critical Do's & Don'ts

### 🎨 Template Personas & Names
- **DO NOT** overwrite template sample author names (e.g., `"Zoya Siddiqui"`, `"Alex Rivera"`) with the logged-in Clerk user's account name.
- **DO** keep sample persona names intact on landing cards, thumbnails, preview modals, and initial studio loads so templates display their authentic sample identity.

### 📄 Blank Slate vs. Template Initialization
- **DO NOT** auto-load the first template (e.g., `buildDefaultRichProfile()` or AI/ML template) when a user opens a studio directly or types a prompt from the landing page.
- **DO** initialize with **`buildEmptyRichProfile()`** (blank placeholders for Name, Headline, About, Experience, Education) unless the user explicitly selected a template card from the gallery.

### 🗑️ Studio Delete Action & Confirmation Popover
- **DO** display **ONLY the bin logo (`[ 🗑 ]`)** on the delete button across all 3 studios with no trailing words like "Clear" or "Delete".
- **DO** keep the confirmation popover compact and anchored directly beneath the bin button (`absolute top-full left-0 mt-2 w-64 sm:w-72 z-[100]`).
- **DO NOT** convert this into a centered full-screen modal overlay or alter the button's layout.
- **DO** keep the parent toolbar wrapper set to `overflow-visible` so the dropdown popover renders over the canvas without being clipped.

### 🖼️ LinkedIn Cover Banner State
- **DO NOT** default to a fallback sample banner (e.g., `banner-1.png`) if both `profile.customCoverUrl` and `profile.coverTemplateId` are empty.
- **DO** render the clean empty state ("No cover banner selected") in `LinkedinCopyDrawer` and disable the "Download PNG" button when no banner has been selected.

### 🛡️ Admin Security & Authorization
- **DO** verify admin privileges against **both** `BUILDER_ACCESS_EMAILS` (in `lib/accessConfig.ts`) and `ADMIN_EMAILS` (in `.env`).
- **DO** use `isUserAdmin(user)` in `lib/adminAuth.ts` which iterates over all email addresses in `user.emailAddresses` (supporting multi-email Clerk accounts and OAuth sign-ins).
- **DO NOT** pass `userId` to `isAdmin()` (it expects an email address string) and always `await` `isAdmin(email)` since it is asynchronous.

### ⚡ Client-Side Polling & Error Handling
- **DO NOT** `throw new Error('Failed to fetch')` or log `console.error` inside recurring auto-polling loops (such as `AdminTrafficPage`'s 12-second interval). In Next.js Turbopack dev mode, unhandled errors and `console.error` in components trigger the fullscreen red dev error modal.
- **DO** handle `!res.ok` gracefully: extract response error JSON, store the message in a component `loadError` state, surface an inline banner with a "Retry" button, and only show toast errors when triggered manually by the user.

### 🔔 Toast Notifications
- **DO** use the unified global toast system (`import toast from '@/lib/toast';`).
- **DO** maintain the standard duration of **1.75s (`1750ms`)** across all studios.
- **DO** keep template removal messages short, clear, and uniform:
  ```ts
  toast.success('Template removed');
  ```
  *(Never use trailing periods or lengthy explanations like "Experience, education, certifications removed.")*

### 🛠️ UI Layouts & Dropdown Overflows
- **DO NOT** place `overflow-x-auto` or `overflow-hidden` on parent toolbars or header wrappers that contain absolute dropdown popovers. In CSS/Tailwind, this clips dropdowns to the parent's height (e.g. 36px), making menus appear frozen or broken.
- **DO** position dropdowns with `absolute top-full mt-2` anchored directly beneath their trigger buttons, and hide non-essential formatting buttons on mobile screens with responsive utilities (`hidden sm:flex`, `hidden sm:inline`).

### 📱 Navigation & Account Controls
- **DO** ensure the mobile brand logo in `MobileNavBar` redirects to the home landing view (`onGoHome` resets active studio modes to `'landing'`).
- **DO NOT** place redundant user auth pills in the top-right header. All authentication, plan status, upgrade modals, and logout actions are consolidated in the bottom-left sidebar card.

### 🤖 AI API Routes (`/api/*-chat`)
- **DO** verify all imported constants (e.g., `DEFAULT_HEADSHOT_URL`, `COVER_ART`) are explicitly imported at the top of route files.
- **DO** preserve empty strings (`headshotUrl: fullProfile.headshotUrl ?? ''`) when merging AI responses so blank profiles do not have sample images forcibly injected.
- **DO** generate 3-4 domain-specific accomplishment bullets separated by `\n` when the user adds experience (e.g., AI Engineer, Data Engineer), and update the `about` section to roughly half-capacity (one punchy paragraph of ~45–65 words / ~300–450 characters).
- **DO** automatically populate Licenses & Certifications (2-3 domain-relevant industry credentials) and Recommendations (1-2 authentic supervisor testimonials) when the user adds experience or states their target role, replacing empty placeholders.
- **DO** log errors with `console.error('[Service Error]:', err)` and return readable error messages so local development failures are easily diagnosed in terminal logs.

---

## 4. Solved Gotchas & Engineering Knowledge Base

### 🛡️ Turbopack Dev Overlay & Live Auto-Polling (`Failed to fetch`)
- **Gotcha:** In `app/admin/traffic/page.tsx`, `fetchTrafficData` runs every 12 seconds via `setInterval`. Writing `if (!res.ok) throw new Error('Failed to fetch')` and calling `console.error` caused the Next.js Turbopack dev overlay to repeatedly hijack the user's screen whenever an unauthorized (403/401) or transient network response occurred.
- **Fix:** Remove `throw` statements and `console.error` from polling callbacks. Store failure state in `loadError`, display a non-disruptive banner with a "Retry Connection" action, and only trigger toast alerts if `isManual === true`.

### 🔐 Multi-Email Clerk Accounts & Admin Route Protection
- **Gotcha:** `user.emailAddresses[0]` in Clerk may not be the user's work/admin email if the user also linked a personal Google account or secondary address. Furthermore, passing `userId` to `isAdmin()` resulted in false 403s.
- **Fix:** In `lib/adminAuth.ts`, use `isUserAdmin(user)` to iterate through all addresses in `user.emailAddresses`. Verify each address against both `BUILDER_ACCESS_EMAILS` and `process.env.ADMIN_EMAILS`. Always `await` `isAdmin(email)`.

### 🔄 SSR Hydration Mismatch with LocalStorage (`dynamic(..., { ssr: false })`)
- **Gotcha:** When reading studio state directly from `localStorage` on initial component mount, the server renders the landing view while the client renders the studio view, causing React hydration mismatch errors (`Hydration failed because the server rendered HTML didn't match the client`).
- **Fix:** Wrap client-hydrated routes (`ResumeRoute`, `LinkedinRoute`, `GithubRoute`) in client boundary components using `dynamic(() => import(...), { ssr: false })` (`ResumeClient`, `LinkedinClient`, `GithubClient`) while preserving server-side SEO `metadata` on the parent page route.

### 💾 LocalStorage Null-Wipe Race Condition (Lazy State Initializers)
- **Gotcha:** Initializing state as `useState(null)` alongside a `useEffect` that calls `localStorage.removeItem(...)` when the state is `null` will immediately delete saved user data on page remount before hydration completes.
- **Fix:** Always initialize state with lazy evaluation functions:
  ```typescript
  const [data, setData] = useState(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('key');
    return saved ? JSON.parse(saved) : null;
  });
  ```
  And never remove keys from `localStorage` in standard render effects unless the user explicitly clicks a delete/reset button.

### 📦 Universal Workerless PDF Parsing (`unpdf`)
- **Gotcha:** Standard `pdfjs-dist` libraries attempt to load web worker chunks from dynamic file paths or CDN URLs, crashing in Next.js Turbopack and Vercel serverless environments.
- **Fix:** Use `unpdf` (`extractText` from `'unpdf'`). It runs in standard Node/V8 environments without worker dependencies, reliably extracting raw text from PDFs before passing structured schemas to OpenAI.

### 🔤 Font Optimization & Next.js Preloading (`next/font/google`)
- **Root Layout Rule:** In `app/layout.tsx`, only the primary global body font (`Geist`) should keep `preload: true` (default). All secondary fonts (`Geist_Mono`, `Poppins`, `Bricolage_Grotesque`, `Dancing_Script`, `Playfair_Display`) **MUST** specify `preload: false`. This prevents the browser from preloading 10+ unused `.woff2` font files on the initial page load.
- **No `next/font` in Subcomponents:** Do NOT declare `next/font/google` instances inside subcomponents (e.g., `LinkedinChatStudio`, `LinkedinTemplatePreview`). Doing so forces Next.js to extract a standalone CSS chunk that gets preloaded across parent and prefetched pages, triggering `link preload but not used within a few seconds` warnings in Chrome. Use standard `font-sans` instead.

### ⚡ Router Prefetching in Navigation Shells
- In persistent shells (e.g. `components/AdminShell.tsx`, `components/AdminSidebarNav.tsx`), always set **`prefetch={false}`** on sidebar / header navigation `<Link>` tags.
- Eager viewport prefetching on pages with multiple navigation links causes Next.js to inject `<link rel="preload">` for all targets on load; if the user remains on the current page for >3 seconds, Chrome flags all unvisited preloads as unused.

### 📊 GA4 Client-Side Route Tracking (`lib/gtag.ts` & `GoogleAnalytics.tsx`)
- In Next.js App Router, do NOT re-call `gtag('config', ...)` on client-side route changes, as this reinitializes tracking and can cause `TypeError: Cannot read properties of undefined (reading 'startTime')` during soft navigations in Chrome DevTools / Web Vitals scripts.
- Set `send_page_view: false` in the initial `gtag('config')` in `GoogleAnalytics.tsx`.
- On SPA route changes in `lib/gtag.ts`, use:
  ```typescript
  window.gtag('event', 'page_view', {
    page_path: url,
    send_to: GA_MEASUREMENT_ID,
  });
  ```

---

## 5. Verification Workflow

Before pushing code to production or concluding an agent turn:
1. Run TypeScript validation:
   ```bash
   bun x tsc --noEmit
   ```
2. Run local production build check:
   ```bash
   bun run build
   ```
3. Confirm the build output reports `✓ Compiled successfully` with exit code `0`.
4. Check that no unused font preloads or detached CSS chunks are emitted into HTML `<head>`.
5. **Self-Update `gemini.md`:** Ensure any new lessons learned, user preferences, or bug fixes from the session are recorded here.
