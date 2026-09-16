# Phase 3 Handoff: Core Hooks & UI Component Deduplication

> **Date:** September 16, 2026  
> **Status:** Step 3a Complete (100%) | Interim Tasks Complete | Steps 3b, 3c, 3d Paused (Ready for Next Session)  
> **Primary Working Branch:** `main` at commit [`7db5729`](https://github.com/syed-abis-datacrumbs/Profile-builder/commit/7db5729) (clean, fully verified, up to date with `origin/main`)  
> **Target Branch for Next Session:** `refactor/phase-3-remaining` (or continue on sub-task branches)

---

## 1. System State & Recent Accomplishments

### Current Repository State
- **Branch:** `main` at commit [`7db5729`](https://github.com/syed-abis-datacrumbs/Profile-builder/commit/7db5729).
- **Automated Tests:** `bun test` passes all **11/11 tests across 2 suites with 0 failures**.
- **TypeScript:** `bun x tsc --noEmit` passes with **0 errors**.
- **Next.js Production Build:** `bun run build` generates all **40/40 routes cleanly with 0 errors**.
- **Living Guide:** `gemini.md` is updated with Section 4 rules for `useUndoRedo` and admin preview normalizers.

---

### What Has Been Completed in Phase 3 So Far

#### 1. Task 3.1 (Step 3a): `useUndoRedo<T>` Custom Hook (Completed & Merged)
- **Created:** `hooks/useUndoRedo.ts`
  - Encapsulated history stacks, `.slice(-99)` buffer management (`maxHistory` default `100`), past/future state transitions, and `Ctrl+Z` / `Ctrl+Y` / `Cmd+Z` keyboard shortcut listeners.
  - Minimal public API: `{ canUndo, canRedo, undo, redo, recordChange, clearHistory }`.
  - Excluded form inputs (`<input>`, `<textarea>`) while allowing `contentEditable` preview fields to trigger custom undo/redo.
  - Attached explicit window listener cleanup on unmount.
- **Created:** `hooks/useUndoRedo.test.ts`
  - 7 automated unit tests run via `bun test` covering push/pop ordering, boundary buffer slicing, undo/redo state machine transitions, and branching edit behavior.
- **Migrated Studios:**
  - `components/ResumeChatStudio.tsx`: Removed duplicate `past`/`future` states, `handleUndo`/`handleRedo`, and window keydown listener. Wired with `onUndo: () => setRevision(r => r + 1)` and `onRedo: () => setRevision(r => r + 1)`. Retained domain-specific `setAtsScore(null)` in studio wrappers (`recordChange` on blur without remount, `external` on structural edits with remount).
  - `components/GithubChatStudio.tsx`: Removed duplicate states and keydown listener. Wired `recordChange` directly to `set` and `setSection`.
  - `components/LinkedinChatStudio.tsx`: Removed duplicate states and keydown listener. Wired `updateProfile` commits via `recordChange`.
  - All 3 studio toolbars updated to use `disabled={!canUndo}` and `disabled={!canRedo}`.

#### 2. Interim Bug Fix: Admin Panel Resume Summary Preview (Completed & Merged)
- **Issue:** In `/app/admin/chats`, the side-by-side LLM Turn Inspector and the Fullscreen Time-Travel Modal did not render the `Summary` section of resumes.
- **Root Cause:** `normalizeCvData` in `lib/admin/previewNormalizers.ts` omitted the `summary` field when reconstructing the `CvData` object, causing `CvPreview` (in read-only mode) to hide the section.
- **Fix:**
  - `lib/admin/previewNormalizers.ts`: Extracted `summary` from `raw.summary` (with fallback to `raw.personalInfo.summary`, `raw.professionalSummary`, `raw.objective`, or array of strings) and mapped it along with `theme`, `resumeName`, and bullet styles.
  - `components/LlmTurnInspector.tsx`: Added `Summary` to the visual Changes Diff tab.
  - `lib/admin/previewNormalizers.test.ts`: Added 4 automated unit tests covering all summary formats.

#### 3. Interim Enhancement: 50/50 LaTeX ATS Resume Template Expansion (Completed & Merged)
- **Change:** In `lib/resumeSamples.ts`, added `theme: "latex-ats"` to 14 technical & infrastructure templates (Full Stack, Backend, DevOps, Cloud, Cybersecurity, Data Engineer, MLOps, Blockchain, Embedded/IoT, Network Engineer, Database Administrator, QA/Automation, Computer Vision, Game Dev).
- **Result:** Balanced the 31 templates into an exact 15 LaTeX ATS (Overleaf style) / 16 Classic ATS split, creating immediate visual contrast on the landing page cards and in-studio template gallery while keeping all labels clean.

---

## 2. Remaining Phase 3 Tasks (For Next Session)

When resuming Phase 3, implement the following remaining tasks one by one with build verification between each:

### Task 3.2 (Step 3b): `useTypewriter` Custom Hook
- **Target file to create:** `hooks/useTypewriter.ts`
- **The Problem:**
  - Identical typewriter typing/deleting animation loops are duplicated across:
    - `components/ResumeLandingView.tsx` (lines 69–95)
    - `components/LinkedinLandingView.tsx` (lines 47–70)
    - `components/GithubLandingView.tsx` (lines 218–240)
    - `components/AuthModal.tsx` (lines 160–191)
- **Timing Requirements:**
  - Preserve exact timing: **50ms typing speed**, **25ms deleting speed**, **2200ms pause**.
- **Proposed Interface:**
  ```typescript
  export interface UseTypewriterOptions {
    words: string[];
    typingSpeed?: number;    // default 50ms
    deletingSpeed?: number;  // default 25ms
    pauseTime?: number;      // default 2200ms
    enabled?: boolean;       // default true
  }

  export function useTypewriter(options: UseTypewriterOptions): string;
  ```
- **Files to Update:**
  - `ResumeLandingView.tsx`, `LinkedinLandingView.tsx`, `GithubLandingView.tsx`, `AuthModal.tsx`.

---

### Task 3.3 (Step 3c): `<ReportIssueModal>` Shared Component
- **Target file to create:** `components/ReportIssueModal.tsx`
- **The Problem:**
  - Over ~70 lines of modal JSX, state management (`issueText`, `issueImage`, `isSubmittingIssue`), Cloudinary base64 image reading via `FileReader`, and `/api/issues` POST submission logic are copy-pasted across all 3 studios:
    - `components/ResumeChatStudio.tsx` (lines 208–215, 274–293, and modal JSX ~1630–1700)
    - `components/LinkedinChatStudio.tsx` (lines 232–248 and modal JSX ~2270–2335)
    - `components/GithubChatStudio.tsx` (lines 116–132 and modal JSX ~978–1041)
- **Proposed Component Interface:**
  ```typescript
  export interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: 'resume' | 'github' | 'linkedin';
  }

  export function ReportIssueModal({ isOpen, onClose, category }: ReportIssueModalProps): React.JSX.Element | null;
  ```
- **Files to Update:**
  - `ResumeChatStudio.tsx`: Replace local state & modal JSX with `<ReportIssueModal isOpen={reportIssueModalOpen} onClose={() => setReportIssueModalOpen(false)} category="resume" />`.
  - `GithubChatStudio.tsx`: Replace with `category="github"`.
  - `LinkedinChatStudio.tsx`: Replace with `category="linkedin"`.

---

### Task 3.4 (Step 3d): Consolidate Payment Status Polling via `useWorkspace()`
- **The Problem:**
  - All 3 studios implement independent `fetch('/api/payment/status')` polling loops, local `unlocked` state, and `window.addEventListener('focus', ...)`:
    - `ResumeChatStudio.tsx` (lines 690–712)
    - `LinkedinChatStudio.tsx` (lines 260–280)
    - `GithubChatStudio.tsx` (lines 220–240)
  - Meanwhile, `context/WorkspaceContext.tsx` already maintains:
    - `unlocked` (global Pro unlock status, cached in `localStorage`)
    - `checkUnlockStatus()` (fetches status, caches to `localStorage`, fires `'profile_builder_unlocked'`)
    - Global window focus and storage listeners.
- **Proposed Solution:**
  - In each studio, read `const { unlocked, openPaymentModal } = useWorkspace()` directly.
  - Remove duplicate local `unlocked` state, local `/api/payment/status` `setInterval` loops, and duplicate window event listeners.

---

### Task 3.5: PDF Download Error Message Refinement
- **Target file:** `components/ResumeChatStudio.tsx`
- **Change:**
  ```diff
  - throw new Error(err?.detail ?? 'PDF generation failed');
  + throw new Error(err?.error || err?.details || err?.detail || 'PDF generation failed');
  ```
- **Rationale:** Enables semantic validation error messages (e.g. `html is required`) from the newly migrated `/api/pdf` to surface cleanly in user toasts instead of falling back to generic strings.

---

## 3. Recommended Execution Steps for Next Session

When returning to complete Phase 3:

```bash
# 1. Start from latest clean main
git checkout main
git pull origin main

# 2. Create working branch for remaining Phase 3 tasks
git checkout -b refactor/phase-3-remaining

# 3. Sub-Batch 3b: Implement useTypewriter
#    - Create hooks/useTypewriter.ts
#    - Update ResumeLandingView, LinkedinLandingView, GithubLandingView, AuthModal
#    - Verify: bun x tsc --noEmit

# 4. Sub-Batch 3c: Implement ReportIssueModal
#    - Create components/ReportIssueModal.tsx
#    - Update ResumeChatStudio, GithubChatStudio, LinkedinChatStudio
#    - Verify: bun x tsc --noEmit

# 5. Sub-Batch 3d & Task 3.5: Payment Polling & PDF Error Refinement
#    - Standardize studios on useWorkspace().unlocked
#    - Apply err?.error fallback in ResumeChatStudio
#    - Verify: bun x tsc --noEmit

# 6. Full Verification & Merge
bun test
bun x tsc --noEmit
bun run build
# Ensure all 40/40 routes compile cleanly with 0 errors
```

---

## 4. Mandatory Agent Rules & Constraints
- **Package Manager:** ALWAYS use `bun` and `bunx`. Never use `npm`, `npx`, or `yarn`.
- **Preserve Behavior:** Do not alter existing keyboard shortcuts, modal designs, button styling, or animation timings.
- **Self-Update `gemini.md`:** Document the new hooks (`useTypewriter`) and shared components (`ReportIssueModal`) when completed.
