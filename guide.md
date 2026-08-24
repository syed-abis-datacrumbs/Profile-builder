# Momentum Profile & Resume Builder

Next.js-based AI career suite for generating, optimizing, and formatting industry-ready resumes (ATS-compliant), LinkedIn profiles & covers, and GitHub developer portfolios with real-time AI assistance, dynamic 1-page pagination, support bug reporting, and payment-proof verification.

---

## Architecture Overview

```
Client (Next.js App Router, React 19, Tailwind CSS, Framer Motion)
  ├── Resume Studio (Interactive Live Preview, ContentEditable DOM, Smart Pagination, ATS Score)
  ├── LinkedIn Studio (Cover Art Banner Generator, Headline, About & Experience Generator)
  ├── GitHub Studio (Interactive README Builder, Tech Stack Badges, Live Stats & Avatar Cropper)
  ├── Interview Prep & Job Hunting (Interactive MCQs, Career Blueprints & Live Mock Interviews)
  └── Admin Suite (/admin)
      ├── /admin/payments      ← Manual Review & Payment Proof Verification (EasyPaisa/JazzCash)
      ├── /admin/users         ← User Management, Pro Access Toggle & Coupon Generator
      ├── /admin/issues        ← Categorized Bug Reports & Feedback (Resume, GitHub, LinkedIn)
      ├── /admin/name-requests ← Resume Locked Name Change Approval/Rejection
      └── /admin/chats         ← User AI Conversation Logs & Session Viewer

API Routes (Next.js Serverless / Node.js Runtime)
  ├── /api/resume-chat         ← AI Resume Generator & 1-Page Keyword Auto-Injector (OpenAI / Gemini)
  ├── /api/ats-score           ← 4-Tier Mathematical ATS Scoring Engine (0–100 Points)
  ├── /api/resumes/*           ← Resume Save / Load / Delete CRUD & Download Name Verification
  ├── /api/linkedin-chat       ← AI LinkedIn Profile & Cover Art Assistant
  ├── /api/github-chat         ← AI GitHub README & Markdown Portfolio Generator
  ├── /api/issues/*            ← User Bug / Feedback Submission with Cloudinary Image Attachments
  ├── /api/payment/*           ← OCR Receipt Extraction, Image Hashing & Unlock Status
  ├── /api/coupon/redeem       ← Coupon Validation & Instant Pro Unlock
  └── /api/admin/*             ← Admin Decision Handlers (Payments, Users, Issues, Names, Coupons)

Database & Authentication
  ├── Clerk                    ← Authentication, Session Tokens & Admin RBAC
  ├── Cloudinary               ← Issue Screenshots & Payment Proof Receipt Storage
  └── PostgreSQL (Prisma ORM)  ← Neon PostgreSQL Database (Profile-builder specific tables)
```

All application state, user resumes, saved profiles, AI usage credits, payment approvals, coupon redemptions, and user-submitted feedback persist in **PostgreSQL** via **Prisma ORM**. Clerk user IDs (`userId`) link user data across all tables without foreign-key coupling to external databases.

---

## Database Schema & Models

- **Provider**: PostgreSQL (Neon Database)
- **Connection**: `DATABASE_URL` (direct connection string in `.env.local` / production environment)
- **Client**: Prisma Client (`prisma/schema.prisma`)

### Core Models:

1. **`ResumeSave` (`profile_builder_resumes`)**
   - Stores saved user resumes.
   - Fields: `id`, `userId`, `name`, `data` (JSON structured resume shape), `createdAt`.

2. **`GithubSave` (`profile_builder_github_saves`)**
   - Stores saved GitHub README snapshots and profile configurations.
   - Fields: `id`, `userId`, `name`, `data` (JSON GitHub profile data), `createdAt`.

3. **`LinkedinSave` (`profile_builder_linkedin_saves`)**
   - Stores saved LinkedIn profile drafts (Headlines, About summaries, Experience bullets, Cover templates).
   - Fields: `id`, `userId`, `name`, `data` (JSON LinkedIn rich profile), `createdAt`.

4. **`PaymentUnlock` (`profile_builder_payment_unlocks`)**
   - One-time payment unlock table for Pro users.
   - Fields: `id`, `userId` (unique), `unlockedAt`, `celebratedAt`.
   - Grants permanent watermark-free downloads (Resume PDF/PNG, GitHub README) and unlimited AI credits.

5. **`PaymentProof` (`profile_builder_payment_proofs`)**
   - Audit trail of payment screenshots uploaded via EasyPaisa / JazzCash / Bank transfer.
   - Fields: `id`, `userId`, `imageUrl`, `imageHash` (dHash duplicate detection), `transactionRef`, `extractedMethod`, `extractedTitle`, `extractedAccountNumber`, `extractedAmount`, `titleMatched`, `numberMatched`, `amountMatched`, `duplicateOfProofId`, `tamperSignal`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `decisionReason`, `createdAt`.

6. **`ProfileBuilderCoupon` (`profile_builder_coupons`)**
   - Admin-issued coupon codes granting instant watermark removal and Pro unlock.
   - Fields: `id`, `code` (unique, uppercase), `label`, `maxUses`, `usedCount`, `expiresAt`, `isActive`, `createdBy`, `createdAt`.

7. **`ProfileBuilderCouponRedemption` (`profile_builder_coupon_redemptions`)**
   - User redemption tracking. Unique composite key `(couponId, userId)` prevents double redemption.
   - Fields: `id`, `couponId`, `userId`, `redeemedAt`.

8. **`ProfileBuilderAiUsage` (`profile_builder_ai_usage`)**
   - Tracks free AI message consumption per user (5 free turns across tools for unpaid accounts).
   - Fields: `userId` (primary key), `usedCount`, `updatedAt`, `createdAt`.

9. **`ProfileBuilderChatLog` (`profile_builder_chat_logs`)**
   - Audit log of user messages and AI completions grouped by `sessionId`.
   - Fields: `id`, `sessionId`, `builderType` (`"resume"`, `"github"`, `"linkedin"`), `userId`, `userMessage`, `aiReply`, `isAutoFit`, `createdAt`.

10. **`ResumeProfile` (`profile_builder_resume_profiles`)**
    - Tracks locked user resume names and `downloadedNames` JSON array for certificate/resume name integrity.
    - Fields: `id`, `userId` (unique), `fullNameEditsUsed`, `downloadedNames` (JSON array), `createdAt`, `updatedAt`.

11. **`ResumeNameChangeRequest` (`profile_builder_resume_name_requests`)**
    - Student requests for admin approval to modify their resume name after exhausting free name edits.
    - Fields: `id`, `userId`, `currentName`, `requestedName`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `createdAt`, `decidedAt`.

12. **`ProfileBuilderIssue` (`profile_builder_issues`)**
    - User-submitted bug reports, UI issues, and feedback with optional screenshot attachments.
    - Fields: `id`, `userId`, `category` (`"resume"`, `"github"`, `"linkedin"`), `text`, `imageUrl`, `status` (`OPEN`, `RESOLVED`), `createdAt`.

---

## Core Feature Specifications

### 1. Resume Studio & ATS Scoring
- **4-Tier Mathematical ATS Scoring Engine (0–100 Points)**:
  - **Structure (25 pts)**: Contact info, summary, education, experience, projects, skills, certifications, links.
  - **Weighted Keywords (35 pts)**: Top 15 domain keywords with location multipliers (Experience `1.0x`, Projects `1.0x`, Certifications `0.9x`, Skills `0.85x`).
  - **Experience Relevance (25 pts)**: Quantified bullet points, action verbs, domain impact metrics.
  - **Resume Quality (15 pts)**: Punctuation consistency, sentence completeness, zero keyword stuffing.
- **Smart 1-Page Layout Preservation (`Fit in 1 Page`)**: Condenses line lengths and padding while retaining all technical keywords.
- **ContentEditable DOM**: Inline editing with instant blur state syncing, undo/redo stacks, and formatting toolbar (Bold, Italic, Underline).
- **Name Locking & Download Limits**: Protects certificate/resume name integrity; requests admin approval if name changes exceed the free limit.
- **Support / Bug Report Button**: Bottom-right floating bug icon allowing users to report issues and upload screenshots.

### 2. GitHub README Studio
- **Interactive Markdown Preview**: Live rendered preview of developer bio, shields.io badges, GitHub metrics cards, and project showcases.
- **Universal Avatar Standard**: Standardized on high-resolution `/images/github-profile/git-profile-1.png` across all starter templates, default builder state, and custom prompt submissions.
- **Action-Oriented Starter Prompts**: Prompts formatted as actionable commands:
  - `"Create Full-Stack Engineer Profile with modern tech stack and live metrics"`
  - `"Create Frontend Developer Profile with interactive project showcases"`
  - `"Create AI & Machine Learning Lead Profile with production pipelines"`
  - `"Create Backend & Distributed Systems Profile with high-concurrency stats"`
- **Theme & Header Customization**: Pre-curated Cloudinary tech headers, Dark/Tokyonight/Dracula/Radial color themes, and custom banner URLs.
- **Support & Bug Report System**: Integrated floating bug report button dispatching categorized feedback (`category: 'github'`).

### 3. LinkedIn Profile & Cover Studio
- **Dual Cover Banner System**:
  - **7 Clean Artwork Banners (`public/images/linkedin-banners/`)**: Modern high-impact graphic banners mapped 100% domain-relevantly across technical and business roles (`fields: []` with zero text collision):
    - `banner-1.png`: *"Built For Impact — Helping businesses launch market-ready apps"* (Full Stack, Mobile App, Frontend, QA, Game Dev)
    - `banner-2.png`: *"Intelligent AI Solutions — For Modern Businesses"* (AI/ML Engineer, MLOps, Computer Vision, Data Science)
    - `banner-3.png`: *"Connecting Talent. Scaling Teams."* (HR & Talent Acquisition, Product Manager)
    - `banner-4.png`: *"Performance Marketing — Built For Scale."* (Digital Marketing & Growth)
    - `banner-5.png`: *Modern Cloud & Futuristic Infrastructure* (Cloud Engineer, DevOps, Network, Blockchain/Web3)
    - `banner-6.png`: *Developer & Systems Engineering Grid* (Software Engineer, Backend Developer, Data Engineer, Database Administrator, Embedded/IoT)
    - `banner-7.png`: *"BI Enthusiast — Drive Success with Data-Driven Decisions"* (Business Intelligence Analyst, Data Analytics, Business Analyst IT)
  - **3 Restored Customizable Classic Covers**:
    - `paid-marketing` (`/images/linkedin-templates/cover/helping-businesses/background.png`): *"Helping Businesses Scale Through Paid Marketing"* + skill pills & caption.
    - `ideas-inspire` (`/images/linkedin-templates/cover/ideas-inspire/background.png`): *"Ideas that inspire. Solutions that last."* + caption (UI/UX, Graphic Design, Video Editing, Cyber Security).
    - `lets-work-together` (`/images/linkedin-templates/cover/lets-work-together/background.png`): *"Let's Work Together"* with editable phone, email, website, name & title (Technical Writer, Consulting).
  - **Excluded Legacy Banners**: `ai-engineer`, `blue-blocks`, `purple-geometric`, `stunning-websites`, `yellow-wave`.
- **HR & Talent Acquisition Template**: Dedicated career track template card with specialized sample profile and hiring playbook projects.
- **Profile Optimizer**: AI-crafted headlines, About summaries, quantified experience bullets, education, certifications, and skills endorsements.
- **Photo Cropper & Studio Editor**: Interactive headshot positioning (`PfpCropModal`), gradient background pickers, and cover switching overlay.
- **Support & Bug Report System**: Floating bug report widget dispatching categorized feedback (`category: 'linkedin'`).

### 4. Admin Management Suite (`/admin`)
- **Reported Issues Dashboard (`/admin/issues`)**:
  - **Top-Level Feature Tabs**: **All Features**, **Resume Builder**, **GitHub README**, **LinkedIn Optimizer**.
  - **Sub-Status Filters**: **All**, **Open**, and **Resolved** with real-time issue count badges.
  - **Compact Table View**: Fast-scanning row layout with user identity, feature source, text snippet, attachment pill, and 1-click status toggles.
  - **Detailed Modal Lightbox**: Comprehensive issue inspection modal with full issue description, reporter details, and high-resolution Cloudinary screenshot preview.
- **Payment Verification (`/admin/payments`)**:
  - Side-by-side OCR receipt comparison with dHash anti-duplicate protection and instant one-click approval/rejection.
- **User Management & Coupons (`/admin/users`)**:
  - Search Clerk users, view AI usage counts, grant/revoke Pro access manually, create multi-use coupon codes with expiration dates.
- **Name Change Requests (`/admin/name-requests`)**:
  - Review student requested name changes on locked resumes.

---

## File Map

```
app/
├── api/
│   ├── ats-score/route.ts              4-Tier mathematical ATS Scoring Engine
│   ├── resume-chat/route.ts            AI Resume generation, 1-page condensing & keyword injection
│   ├── linkedin-chat/route.ts          AI LinkedIn profile builder & cover optimizer
│   ├── github-chat/route.ts            AI GitHub README & markdown portfolio generator
│   ├── issues/route.ts                 User issue/feedback submission with Cloudinary upload
│   ├── payment/
│   │   ├── status/route.ts             Returns user's watermark unlock status and AI credits used
│   │   ├── upload/route.ts             OCR receipt scanner, dHash anti-duplicate & proof submission
│   │   └── celebrate/route.ts          Persists Pro celebration state
│   ├── coupon/
│   │   └── redeem/route.ts             Coupon code validation & instant unlock handler
│   ├── resumes/
│   │   ├── route.ts                    Saved resume list (GET) and save/update (POST)
│   │   ├── [id]/route.ts               Load single saved resume (GET) or delete (DELETE)
│   │   ├── name/route.ts               Name edit limits & name lock enforcement
│   │   └── download-check/route.ts     Download name verification before export
│   └── admin/
│       ├── payments/route.ts           Admin API to review and approve/reject payment proofs
│       ├── users/route.ts              Admin API for user list and pro status management
│       ├── issues/
│       │   ├── route.ts                Admin API for categorized issues list & counts
│       │   └── [id]/route.ts           Admin API to resolve/reopen issues
│       ├── coupons/route.ts            Admin API to create and manage coupon codes
│       └── name-requests/route.ts      Admin API to approve/reject locked name change requests
├── admin/
│   ├── payments/page.tsx               Admin Payment Verification Dashboard UI
│   ├── users/page.tsx                  Admin Users & Coupon Management UI
│   ├── issues/page.tsx                 Admin Categorized Issues & Feedback UI
│   ├── name-requests/page.tsx          Admin Name Change Requests UI
│   └── chats/page.tsx                  Admin AI Chat Logs & Sessions UI
├── layout.tsx                          Root layout, ClerkProvider, global fonts & metadata
├── page.tsx                            Main studio shell, tab navigator & responsive workspace
└── globals.css                         Tailwind tokens, design utilities & print media styles

components/
├── ResumeChatStudio.tsx                Interactive Resume Studio, chat sidebar & canvas controls
├── GithubChatStudio.tsx                Interactive GitHub README Studio & toolbar
├── LinkedinChatStudio.tsx              Interactive LinkedIn Studio & cover editor
├── GithubLandingView.tsx               GitHub templates grid, starter prompts & category filters
├── LinkedinLandingView.tsx             LinkedIn cover presets & prompt generator
├── BlockScreen.tsx                     Private Page modal gate for unauthorized users
├── MobileChatWidget.tsx                Floating mobile chat drawer with quick action pills
├── PaymentModal.tsx                    Payment instructions, EasyPaisa/JazzCash upload & coupon tab
├── PfpCropModal.tsx                    Profile picture cropping and aspect-ratio adjustments
└── icons.tsx                           SVG brand icons (GitHub, LinkedIn, etc.)

lib/
├── db.ts                               Singleton PrismaClient instance
├── defaultData.ts                      Default placeholder CV, GitHub, and LinkedIn initial data
├── adminData.ts                        Server-side data loaders for admin dashboards
├── adminAuth.ts                        Admin authorization and Clerk role checks
├── serverAuth.ts                       Server-side user authentication helpers
├── cloudinary.ts                       Cloudinary image upload utility
├── toast.ts                            Global toast notification utility
├── easyPaisaOcr.ts                     Image preprocessing & transaction ID/amount regex parsers
├── githubMarkdown.ts                   Markdown serializing and badge compilation engine
└── linkedinRichProfile.ts              LinkedIn cover art layouts, palettes, and font measurement

prisma/
└── schema.prisma                       PostgreSQL schema definition & indexes
```

---

## Deployment & Environment Variables

### Build & Run Commands:
```bash
# Install dependencies
npm install

# Push database schema changes & regenerate Prisma Client
npx prisma db push
npx prisma generate

# Build for production
npm run build

# Run local development server
npm run dev
```

### Environment Variables (`.env.local`):
```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# AI Engines
OPENAI_API_KEY="sk-proj-..."
GEMINI_API_KEY="AIzaSy..."

# Cloudinary (Issue Attachments & Payment Proofs)
CLOUDINARY_CLOUD_NAME="dnqk2jlds"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Admin Access
ADMIN_USER_IDS="user_2...,user_3..."
```

---

## 8. Recent Feature Additions & Changelog

### 1. Graceful Template Preview Modals (`framer-motion`)
* **LinkedIn, Resume, and GitHub Previews**: All template preview modals (`ResumeTemplatePreview`, `LinkedinTemplatePreview`, and `GithubTemplatePreview`) now mount inside `<AnimatePresence>` with backdrop fade-in (`opacity: 0 -> 1`) and smooth modal panel scale-in (`scale: 0.94 -> 1, y: 16 -> 0`) using cubic-bezier easing.

### 2. GitHub Studio Unlocked with Free Tier Protections
* **Unlocked Studio Entry**: Free users can browse GitHub templates, pick role presets, use custom prompts, and access the GitHub Chat Studio.
* **Gated Free Tier Actions**:
  * `README.md` download button prompts `PaymentModal`.
  * `Copy` markdown button prompts `PaymentModal`.
  * Cover Banner download prompts `PaymentModal`.
  * Profile Picture (PFP) download prompts `PaymentModal`.
  * AI Message limit (5 free iterations) prompts `PaymentModal` upon reaching quota.

### 3. Resume Builder: Direct Project Title Hyperlinks
* When a project link is attached, the project title itself becomes a blue underlined hyperlink (`<a>`), matching the header link style.
* Floating "Add Link / Edit Link" pill above the active project with strict single-target visibility.
* 1-click modal for URL entry and instant removal.

