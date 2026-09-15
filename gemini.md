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

### 📥 Studio Toolbar & Import Button Design
- **DO** display **ONLY the upload icon (`<Upload className="w-3.5 h-3.5 text-slate-700 shrink-0" />`)** on the studio toolbar import button across all 3 studios with **NO text** (never include trailing words like "Import").
- **DO** use the unified reusable `ImportButton` component (`components/ImportButton.tsx`) so button styling, title tooltip, and behavior are NEVER duplicated across the codebase.
- **DO** maintain identical compact dimensions (`h-7 w-7 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 flex items-center justify-center shrink-0 cursor-pointer`) matching the sibling `LayoutTemplate` and `Trash2` buttons.
- **DO** position the import button consistently in the left controls group immediately next to the Templates button across all 3 studios (`ResumeChatStudio`, `LinkedinChatStudio`, and `GithubChatStudio`).
- **DO NOT** add text labels to studio toolbar action buttons or duplicate button markup inline in studio components.
- **DO NOT** place the import button in divergent locations (e.g. right-side controls in one studio and left-side in another).

### 🔐 Studio Access & Login Modal vs Private Windows
- **DO** trigger the standard **Login Window (`AuthModal` via `setIsAuthOpen(true)`)** whenever an unauthenticated or logged-out user attempts to select templates, submit prompts, or open editor studios on any tab (including LinkedIn, GitHub, Resume, JobHunting, Freelancing, and Interview Prep).
- **DO NOT** display "This Page is Private" / "Contact administrator" blocking screens (`BlockScreen` has been permanently removed from the codebase as it has no actual usage).
- **DO NOT** wrap studio content in artificial `onClickCapture` handlers that intercept pointer clicks or hijack the view for non-resume tabs.

### 🚪 Session Cleanup, Logout Redirection & Studio Route Guards
- **DO** wipe all active studio modes (`profile_builder_resume_mode`, `profile_builder_github_mode`, `profile_builder_linkedin_mode`), AI chat histories (`profile_builder_*_chat`), in-memory profile drafts, and active tab preferences from `localStorage` whenever a user logs out via `clearWorkspaceSession()` in `lib/sessionCleanup.ts`.
- **DO** immediately redirect to the home page (`window.location.href = '/'`) upon logging out.
- **DO** guard all studio routes (`ResumeRoute`, `GithubRoute`, `LinkedinRoute`) against unauthenticated studio access: if `!isLoggedIn`, initialize mode to `'landing'`, refuse to mount chat studios, and forcibly fall back to `'landing'` if a user logs out.
- **DO NOT** allow unauthenticated or logged-out users to navigate between active chat studio states or persist in `studio` or `editor` modes across tabs.
- **DO NOT** write active chat messages, cv drafts, or studio modes to `localStorage` when `!isLoggedIn`.

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
- **Root Layout Rule:** In `app/layout.tsx`, configure fonts with `preload: false` whenever possible (or keep `preload: true` only on primary Geist if early font loading is needed). All secondary fonts (`Geist_Mono`, `Poppins`, `Bricolage_Grotesque`, `Dancing_Script`, `Playfair_Display`) **MUST** specify `preload: false`. This prevents the browser from preloading 10+ unused `.woff2` font files on the initial page load.
- **No `next/font` in Subcomponents:** Do NOT declare `next/font/google` instances inside subcomponents (e.g., `LinkedinChatStudio`, `LinkedinTemplatePreview`). Doing so forces Next.js to extract a standalone CSS chunk that gets preloaded across parent and prefetched pages, triggering `link preload but not used within a few seconds` warnings in Chrome. Use standard `font-sans` instead.
- **Turbopack Dev CSS Chunk Preload Warning (`[root-of-the-server]__..._.css`):** In Next.js with Turbopack in development mode (`next dev --turbopack`), Next.js automatically injects an HTTP `Link: </_next/static/chunks/%5Broot-of-the-server%5D...css>; rel=preload; as="style"` response header for the development CSS bundle. Because Turbopack manages CSS updates dynamically via its client-side HMR WebSocket runtime rather than static stylesheet reloads, Chrome triggers a diagnostic warning: `The resource http://localhost:3000/_next/static/chunks/[root-of-the-server]... was preloaded using link preload but not used within a few seconds from the window's load event`. This is an internal Turbopack dev-server artifact: in production (`next build` / `next start`), this header and `[root-of-the-server]` chunks do not exist, and styles are served via standard `<link rel="stylesheet">` tags.

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

### 🧪 App Testing Phase & Non-Admin Blocking Gate (`TestingPhaseModal`)
- **Testing Phase Objective:** Restrict access so only administrators can access and test the app peacefully without outside traffic, while blocking non-admin logged-in users with an impassable modal informing them the app is in a testing phase.
- **Admin Verification:**
  - Evaluated against both `BUILDER_ACCESS_EMAILS` (in `lib/accessConfig.ts`) and `ADMIN_EMAILS` (in `.env`) via `isUserAdmin(user)` and `isAdmin(email)` in `lib/adminAuth.ts`.
  - In `app/(workspace)/layout.tsx`, `isUserAdmin(user)` is executed server-side and passed via `initialUser.isAdmin` to prevent layout shift or delay.
  - In `context/WorkspaceContext.tsx`, `isAdmin` and `isCheckingAdmin` are maintained and synced with Clerk's client user and verified against `/api/admin/check`.
- **Client Blocking (`components/TestingPhaseModal.tsx` & `WorkspaceShell.tsx`):**
  - When `isLoggedIn && !isAdmin && !isCheckingAdmin`, `TestingPhaseModal` renders at `z-[100]` with dark blur backdrop, blocking all pointer and keyboard events to the underlying workspace.
  - The modal displays user's email, "Not Admin" badge, an explanation of the private testing phase, and provides "Sign Out" and "Log in with Admin Account" actions.
- **Backend API Protection:**
  - `/api/resume-chat`, `/api/github-chat`, `/api/linkedin-rich-chat`, `/api/pdf`, `/api/resumes`, and `/api/resumes/download-check` check `await isUserAdmin(user)`. Non-admins receive HTTP 403 Forbidden with `{ error: 'Momentum is currently in private testing phase. Access is restricted to administrators.' }`, guaranteeing zero outside traffic to OpenAI Puppeteer or DB during testing.

### 🔘 Studio Toolbar Button Standardization & DRY Component Architecture
- **Gotcha:** Previously, the Import button was implemented with duplicate inline `<button>` markup across studios with inconsistent styles, positions, and text labels. In `ResumeChatStudio`, it had `<span className="hidden 2xl:inline">Import</span>` (appearing icon-only on smaller viewports but rendering text on wide screens). In `GithubChatStudio`, it was placed in the right-side controls group with `<span className="hidden xl:inline">Import</span>` and divergent padding. In `LinkedinChatStudio`, the import button was omitted from the toolbar entirely.
- **Fix:** Created the unified `ImportButton` component (`components/ImportButton.tsx`). Standardized the import button across all 3 studios (`ResumeChatStudio`, `LinkedinChatStudio`, `GithubChatStudio`) to be strictly icon-only (`h-7 w-7` square button with `<Upload />` and no text labels), placed consistently in the left controls group directly next to `LayoutTemplate`. Also unified the landing view import pill via `variant="landing"` to eliminate code repetition across `ResumeLandingView`, `LinkedinLandingView`, and `GithubLandingView`.

### 🚫 Deprecation & Removal of Private Page Modal (`BlockScreen`)
- **Gotcha:** `WorkspaceShell.tsx` formerly contained an `onClickCapture` listener intercepting clicks whenever `!isAuthorized && activeTab !== 'resume' && activeTab !== 'github'`. On `/linkedin`, clicking anywhere on the page intercepted the event and rendered `BlockScreen` ("This Page is Private") with a "Close" button, preventing unauthenticated users from seeing the standard `AuthModal` login dialog.
- **Fix:** Deleted `components/BlockScreen.tsx`, removed `onClickCapture` from `WorkspaceShell.tsx`, cleaned `showBlockModal` from `WorkspaceContext.tsx`, and unified all studio routes (`LinkedinRoute`, `JobHuntingRoute`, `FreelancingRoute`, `InterviewRoute`) to cleanly invoke `setIsAuthOpen(true)` when `!isLoggedIn`, matching `GithubRoute`.

### 🔄 Cross-Studio State & Chat Persistence Across Logouts
- **Gotcha:** When a user had active chats across Resume, GitHub, and LinkedIn studios while logged in and then logged out, their studio mode (`profile_builder_*_mode = 'studio'`) and chat transcripts (`profile_builder_*_chat`) remained in `localStorage`. Navigating to any studio tab while logged out allowed the user to freely view and continue chatting in the previous active studios instead of being redirected to the home page or prompted to sign in.
- **Fix:**
  1. Created `clearWorkspaceSession()` in `lib/sessionCleanup.ts` that purges all studio modes, AI chat transcripts, and in-memory profile drafts from `localStorage`.
  2. Integrated `clearWorkspaceSession()` into all sign-out pathways (`ImagineSidebar.tsx`, `TestingPhaseModal.tsx`) paired with hard redirection to the root home page (`window.location.href = '/'`).
  3. Added a reactive logout watcher (`wasLoggedInRef`) in `WorkspaceContext.tsx` to automatically invoke session cleanup and redirect if Clerk transitions to logged-out from another tab or expired session.
  4. Added strict logged-out guards in `ResumeRoute.tsx`, `GithubRoute.tsx`, and `LinkedinRoute.tsx`: if `!isLoggedIn`, studio mode is forbidden and forces `'landing'`, mode persistence is blocked, and any action attempting to open studio or apply a template prompts `AuthModal` (`setIsAuthOpen(true)`).
  5. Studio components (`ResumeChatStudio`, `GithubChatStudio`, `LinkedinChatStudio`) only persist chat messages to `localStorage` when `isLoggedIn === true`.

### 🛡️ Standardized Typed API Response Helpers (`lib/apiResponse.ts` & `lib/apiClient.ts`)
- **Convention:** Do NOT construct raw `NextResponse.json(...)` or `Response.json(...)` in API route handlers. Always import and use the standard typed helpers from `@/lib/apiResponse`.
- **Flat Payload Standard:** Success helpers (`apiSuccess(data)`, `apiCreated(data)`) preserve flat/direct payloads (e.g. `{ versions: rows }`, `{ data: row.data }`, `{ success: true, id, name }`) to maintain 100% backward compatibility with client expectations without breaking frontend property lookups.
- **Canonical Error Shape:** Error helpers (`apiError`, `apiBadRequest`, `apiUnauthorized`, `apiForbidden`, `apiNotFound`, `apiConflict`, `apiServerError`) strictly return `{ success: false, error: string, code?: string, details?: unknown }` with the correct HTTP status codes.
- **Production Logging:** `apiServerError(msg, err)` logs unconditionally using `console.error('[API Server Error]:', err)` so that serverless runtime logs (e.g., Vercel Function logs) retain full error stack traces regardless of `NODE_ENV`.
- **Client-Side Safe Fetching:** Client components can use `safeApiFetch<T>(url, init)` from `@/lib/apiClient` to safely handle non-JSON 500 HTML responses and network errors without throwing unhandled promise rejections.

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
