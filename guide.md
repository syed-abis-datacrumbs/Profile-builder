# Momentum Profile & Resume Builder

Next.js-based AI career suite for generating, optimizing, and formatting industry-ready resumes (ATS-compliant), LinkedIn profiles, and GitHub developer portfolios with real-time AI assistance, dynamic 1-page pagination, and payment-proof verification.

## Architecture

```
Client (Next.js App Router, React 19, Tailwind CSS, Framer Motion)
  ├── Resume Studio (Interactive Live Preview, ContentEditable DOM, Smart Pagination)
  ├── LinkedIn Studio (Headline, About, Experience & Skills Generator)
  ├── GitHub Studio (Interactive README Builder, Tech Stack Badges, Stats Generator)
  └── Admin Panel (/admin/payments — Manual Review & Payment Proof Verification)

API Routes (Next.js Serverless / Node.js Runtime)
  ├── /api/resume-chat        ← AI Resume Generator & Keyword Auto-Injector (Gemini / OpenAI)
  ├── /api/ats-score          ← 4-Tier Mathematical ATS Scoring Engine (0–100 Points)
  ├── /api/resumes/*          ← Resume Save / Load / Delete CRUD & Download Name Verification
  ├── /api/linkedin-chat      ← AI LinkedIn Profile Assistant
  ├── /api/github-chat        ← AI GitHub README & Showcase Generator
  ├── /api/payment/*          ← OCR Receipt Extraction, Image Hashing & Unlock Status
  └── /api/admin/*            ← Admin Payment Proof & Name Change Deciders

Database & Auth
  ├── Clerk                   ← Authentication, Session Tokens & Admin RBAC
  └── PostgreSQL (Prisma ORM) ← Single Shared Database (Profile-builder specific tables)
```

All application state, user resumes, AI usage credits, payment approvals, and coupon redemptions persist in **PostgreSQL** via **Prisma ORM**. Clerk user IDs (`userId`) link user data across all tables without foreign-key coupling to external databases.

---

## Database

- **Provider**: PostgreSQL
- **Connection**: `DATABASE_URL` (direct connection string in `.env.local` / production environment)
- **Client**: Prisma Client (`prisma/schema.prisma`)

### Key Tables & Models:
- **`profile_builder_resumes` (`ResumeSave`)** — Saved user resumes (`name`, `data` as structured JSON, `userId`). Independent of external LMS resume versions.
- **`profile_builder_github_saves` (`GithubSave`)** — Saved GitHub README snapshots and profile configurations.
- **`profile_builder_linkedin_saves` (`LinkedinSave`)** — Saved LinkedIn profile drafts (Headlines, About summaries, Experience bullets).
- **`profile_builder_payment_unlocks` (`PaymentUnlock`)** — One-time payment unlock table (`userId`, `unlockedAt`). Once present, removes export watermarks permanently and unlocks unlimited AI credits.
- **`profile_builder_payment_proofs` (`PaymentProof`)** — Audit trail of payment screenshots uploaded via EasyPaisa / JazzCash / Bank transfer. Stores `imageHash` (dHash duplicate detection), OCR extracted fields (`extractedTitle`, `extractedAccountNumber`, `extractedAmount`), fuzzy match flags, and `status` (`PENDING`, `APPROVED`, `REJECTED`).
- **`profile_builder_coupons` (`ProfileBuilderCoupon`)** — Admin-issued coupon codes that grant instant watermark removal and unlock access.
- **`profile_builder_coupon_redemptions` (`ProfileBuilderCouponRedemption`)** — One row per user redemption. Unique composite index `(couponId, userId)` prevents double redemption.
- **`profile_builder_ai_usage` (`ProfileBuilderAiUsage`)** — Tracks free AI message consumption per user (5 free turns across tools for unpaid accounts).
- **`profile_builder_chat_logs` (`ProfileBuilderChatLog`)** — Audit log of user messages and AI completions grouped by `sessionId`.
- **`profile_builder_resume_profiles` (`ResumeProfile`)** — Tracks locked user resume names and `downloadedNames` JSON array for certificate/resume name integrity.
- **`profile_builder_resume_name_requests` (`ResumeNameChangeRequest`)** — Student requests for admin approval to modify their resume name after exhausting free name edits.

---

## Known Gotchas

- **Industry-Grade 4-Tier ATS Scoring Model (25 + 35 + 25 + 15 = 100 Points)**:
  - **Structure (25 pts)**: Contact info (2), Header/Summary (3), Education (3), Experience (5), Projects (3), Skills (3), Certifications (2), Portfolio links (2), Metrics (2).
  - **Weighted Keywords (35 pts)**: Top 15 domain keywords. Tier 1 Critical (Weight 3), Tier 2 Important (Weight 2), Tier 3 Nice-to-have (Weight 1). Location multipliers: Work Experience (`1.0x`), Projects (`1.0x`), Certifications (`0.9x`), Skills/Interests (`0.85x`).
  - **Experience Relevance (25 pts)**: Evaluates whether work experience and projects actively demonstrate domain skills with quantified metrics and action verbs.
  - **Resume Quality & ATS Readability (15 pts)**: Complete sentences, no cutoff punctuation, no keyword stuffing, clean distribution.
  - **Zero Floor Boosters**: Scorers must remain 100% deterministic and mathematical without artificial jumps (`Math.max(96)`).
- **Stopwords Vocabulary Filtering**: The ATS engine filters out generic English conversational words (`closely`, `ensure`, `delivery`, `sourcing`, `oversee`, `manager`, `experienced`, `responsibilities`, etc.) so only genuine technical skills, tools, and methodologies are matched.
- **Prisma Client Generation**: Always run standard `npx prisma generate`. Never use `--no-engine` in standard Node.js environments as it triggers the Accelerate (`prisma://`) client error `P6001`.
- **Smart 1-Page Layout Preservation (`Fit in 1 Page`)**: When condensing the resume to fit on a single page, `app/api/resume-chat/route.ts` preserves all injected technical keywords in `additional.skills` and `workExperience` while tightening sentence lengths.
- **Watermark Removal Architecture**: Downloads are never blocked for unpaid users; exports include a semi-transparent rotated "Momentum" watermark. Unlocking via payment or coupon strips the watermark permanently.
- **Inline Preview Editing**: ContentEditable DOM mutations commit to React state on `blur`. Pressing `Backspace` on an empty bullet or selecting all text in a project immediately removes the item, while pressing `Enter` creates a new bullet item.

---

## File Map

```
app/
├── api/
│   ├── ats-score/route.ts              4-Tier mathematical ATS Scoring Engine (25+35+25+15)
│   ├── resume-chat/route.ts            AI Resume generation, 1-page condensing & keyword injection
│   ├── linkedin-chat/route.ts          AI LinkedIn profile builder & section optimizer
│   ├── github-chat/route.ts            AI GitHub README & markdown portfolio generator
│   ├── payment/
│   │   ├── status/route.ts             Returns user's watermark unlock status and AI credits used
│   │   └── upload/route.ts             OCR receipt scanner, dHash anti-duplicate & proof submission
│   ├── coupon/
│   │   └── redeem/route.ts             Coupon code validation & instant unlock handler
│   ├── resumes/
│   │   ├── route.ts                    Saved resume list (GET) and save/update (POST)
│   │   ├── [id]/route.ts               Load single saved resume (GET) or delete (DELETE)
│   │   ├── name/route.ts               Name edit limits & name lock enforcement
│   │   └── download-check/route.ts     Download name verification before export
│   └── admin/
│       ├── payments/route.ts           Admin API to review and approve/reject payment proofs
│       └── name-requests/route.ts      Admin API to approve/reject locked name change requests
├── admin/
│   └── payments/page.tsx               Admin Payment Verification Dashboard UI
├── layout.tsx                          Root layout, ClerkProvider, global fonts & metadata
├── page.tsx                            Main studio shell, tab navigator & responsive sidebar
└── globals.css                         Tailwind tokens, design utilities & print media styles

components/
├── ResumeChatStudio.tsx                Interactive Resume Studio, chat sidebar & canvas controls
├── CvPreview.tsx                       ContentEditable single-page canvas with inline formatting
├── PaginatedCvPreview.tsx              Smart page-break splitter with dynamic height observers
├── MobileChatWidget.tsx                Floating mobile chat drawer with quick action pills
├── ImagineSidebar.tsx                  Left navigation drawer (Resume, LinkedIn, GitHub, Upgrade)
├── PaymentModal.tsx                    Payment instructions, EasyPaisa/JazzCash upload & coupon tab
├── LinkedinOptimizer.tsx               Interactive LinkedIn builder and preview studio
└── GithubOptimizer.tsx                 Interactive GitHub README builder and raw markdown preview

lib/
├── db.ts                               Singleton PrismaClient instance
├── cvTypes.ts                          TypeScript interfaces for CvData, sections & markdown parsers
├── cvPagination.ts                     Block height measurement & auto-pagination algorithm
├── resumeHelpers.ts                    Theme accent colors, formatting helpers & initial state
└── easyPaisaOcr.ts                     Image preprocessing & transaction ID/amount regex parsers

prisma/
└── schema.prisma                       PostgreSQL schema definition & indexes
```

---

## Deploy & Environment Variables

### Deploy:
- **Build Command**: `npm run build` (or `npx next build`)
- **Start Command**: `npm start`
- **Database Migrations**: `npx prisma db push` or `npx prisma migrate deploy` followed by `npx prisma generate`

### Required Environment Variables:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# AI Engines
GEMINI_API_KEY="AIzaSy..."
OPENAI_API_KEY="sk-proj-..."

# Admin Access
ADMIN_USER_IDS="user_2...,user_3..."
```

---

## Where Plans & Docs Live

Standalone technical plans, handoff summaries, and design specifications live directly in the workspace root as `.md` documents:
- `guide.md` — Project architecture, database schema, file map, and operational reference.
- `AGENTS.md` — Agent rules and version guidelines.
