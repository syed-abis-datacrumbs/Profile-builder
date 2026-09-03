# MOMENTUM (Profile Builder) — Developer & Context Guide

This document captures the complete architectural context, engineering conventions, environment setup with **Bun**, and critical **Do's and Don'ts** established for the MOMENTUM Profile Builder application.

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

# 5. Run production build
bun run build

# 6. Start production server locally
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
   - SVG banner generator with typography overlay.
   - Streamlined saved profile version drawer (`/api/linkedin-saves`).
4. **Admin Suite (`/app/admin/...`)**:
   - Manages user accounts, payment receipts, coupon codes, and reported issue logs.

---

## 3. Critical Do's & Don'ts

### 🎨 Template Personas & Names
- **DO NOT** overwrite template sample author names (e.g., `"Zoya Siddiqui"`, `"Alex Rivera"`) with the logged-in Clerk user's account name.
- **DO** keep sample persona names intact on landing cards, thumbnails, preview modals, and initial studio loads so templates display their authentic sample identity.

### 📄 Blank Slate vs. Template Initialization
- **DO NOT** auto-load the first template (e.g., `buildDefaultRichProfile()` or AI/ML template) when a user opens a studio directly or types a prompt from the landing page.
- **DO** initialize with **`buildEmptyRichProfile()`** (blank placeholders for Name, Headline, About, Experience, Education) unless the user explicitly selected a template card from the gallery.

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
- **DO** position dropdowns with `absolute top-full mt-2` anchored directly beneath their trigger buttons, and hide non-essential formatting buttons on mobile screens with responsive utilities (`hidden sm:flex`).

### 📱 Navigation & Account Controls
- **DO** ensure the mobile brand logo in `MobileNavBar` redirects to the home landing view (`onGoHome` resets active studio modes to `'landing'`).
- **DO NOT** place redundant user auth pills in the top-right header. All authentication, plan status, upgrade modals, and logout actions are consolidated in the bottom-left sidebar card.

### 🤖 AI API Routes (`/api/*-chat`)
- **DO** verify all imported constants (e.g., `DEFAULT_HEADSHOT_URL`, `COVER_ART`) are explicitly imported at the top of route files.
- **DO** preserve empty strings (`headshotUrl: fullProfile.headshotUrl ?? ''`) when merging AI responses so blank profiles do not have sample images forcibly injected.
- **DO** generate 3-4 domain-specific accomplishment bullets separated by `\n` when the user adds experience (e.g., AI Engineer, Data Engineer), and update the `about` section to roughly half-capacity (one punchy paragraph of ~45–65 words / ~300–450 characters).
- **DO** log errors with `console.error('[Service Error]:', err)` and return readable error messages so local development failures are easily diagnosed in terminal logs.

---

## 4. Verification Workflow

Before pushing code to production or creating a pull request:
1. Run local build check:
   ```bash
   bun run build
   ```
2. Confirm the build output reports `✓ Compiled successfully` with exit code `0`.
3. Test direct chat navigation, template switching, and template removal toasts.
