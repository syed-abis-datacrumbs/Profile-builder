# Phase 3 Handoff: Core Hooks & UI Extraction

> **Date:** September 15, 2026  
> **Status:** Phase 2 Complete (100%) | Ready to Start Phase 3  
> **Primary Working Branch:** `main` (clean, verified, up to date with `origin/main`)  
> **Target Branch for Phase 3:** `refactor/phase-3-hooks-ui`

---

## 1. System State & Phase 2 Recap

### Current Repository State
- **Branch:** `main` at commit [`70915a6`](https://github.com/syed-abis-datacrumbs/Profile-builder/commit/70915a6).
- **TypeScript:** `bun x tsc --noEmit` passes with **0 errors**.
- **Next.js Build:** `bun run build` generates all **40/40 routes cleanly with 0 errors**.
- **Living Guide:** `gemini.md` is updated with all API response conventions and carve-outs.

### Phase 2 Accomplishments (All 5 Batches Complete)
1. **Standardized Response Architecture:** All Next.js API routes use `@/lib/apiResponse` (`apiSuccess`, `apiBadRequest`, `apiUnauthorized`, `apiForbidden`, `apiNotFound`, `apiServerError`).
2. **Backward Compatibility:** All success payloads maintain exact flat/direct shapes (e.g. `{ versions: rows }`, `{ allowed: true }`), ensuring zero breaking changes for existing frontend consumers.
3. **Intentional Carve-Outs Documented in `gemini.md`:**
   - `/api/payment/coupon` & `/api/payment/verify`: Preserved `{ status: 'APPROVED' | 'REJECTED', message: string }` domain contract for `PaymentModal.tsx`.
   - `/api/resume-chat`, `/api/github-chat`, and `/api/linkedin-rich-chat`: Excluded from `apiServerError` migration because they intentionally return HTTP 200 with `{ error: string }` or `{ reply: string }` so studios render inline conversational warning bubbles rather than network fetch aborts.
4. **Pending Architecture Scope for Phase 5:**
   - `/api/admin/name-requests`: Direct API test confirmed it returns 403 for non-admins. It currently checks `clerk.publicMetadata.role === 'admin'`. When executing Phase 5 (`BUILDER_ACCESS_EMAILS` decoupling), migrate it to standard `requireAdmin()`.
5. **PDF Error Handling Note:**
   - In `components/ResumeChatStudio.tsx:848`, error handling calls `throw new Error(err?.detail ?? 'PDF generation failed')`. Since `/api/pdf` now returns clean `apiServerError('PDF generation failed', err)`, the `??` operator safely falls back to `'PDF generation failed'`. During Phase 3, this can be refined to `err?.error || err?.details || err?.detail || 'PDF generation failed'`.

---

## 2. Phase 3 Objectives & DRY Payoff

The three AI chat studios are currently huge:
- `components/ResumeChatStudio.tsx`: ~1,917 lines
- `components/LinkedinChatStudio.tsx`: ~2,513 lines
- `components/GithubChatStudio.tsx`: ~1,313 lines

Across these three files, there are **massive blocks of identical copy-pasted state, event listeners, and modal JSX**. Phase 3 extracts these into reusable custom hooks and shared components, shrinking each studio by hundreds of lines and establishing clean, shared foundations.

---

## 3. Detailed Work Breakdown for Phase 3

### Task 3.1: Create `useUndoRedo<T>` Custom Hook
**Target file to create:** `hooks/useUndoRedo.ts`

#### The Problem:
Identical undo/redo history stacks, array slicing (`.slice(-99)`), pointer indices, and `Ctrl+Z` / `Ctrl+Y` keyboard event listeners are copy-pasted across all 3 studios:
- `ResumeChatStudio.tsx` (lines 228–335 & 1383–1396)
- `LinkedinChatStudio.tsx` (lines 377–419 & 1056–1068)
- `GithubChatStudio.tsx` (lines 142–204 & 896–908)

#### Proposed Hook Interface:
```typescript
// hooks/useUndoRedo.ts
import { useState, useCallback, useEffect } from 'react';

export interface UndoRedoOptions<T> {
  maxHistory?: number; // default 100
  enableKeyboardShortcuts?: boolean; // default true
}

export function useUndoRedo<T>(initialPresent: T, options?: UndoRedoOptions<T>) {
  const maxHistory = options?.maxHistory ?? 100;
  const enableKeyboard = options?.enableKeyboardShortcuts ?? true;

  const [history, setHistory] = useState<T[]>([initialPresent]);
  const [index, setIndex] = useState(0);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  const set = useCallback((newPresent: T | ((prev: T) => T)) => {
    setHistory((prev) => {
      const current = prev[index];
      const resolved = typeof newPresent === 'function' 
        ? (newPresent as (p: T) => T)(current)
        : newPresent;

      const trimmed = prev.slice(0, index + 1);
      const next = [...trimmed, resolved];
      if (next.length > maxHistory) {
        return next.slice(next.length - maxHistory);
      }
      return next;
    });
    setIndex((prev) => Math.min(prev + 1, maxHistory - 1));
  }, [index, maxHistory]);

  const undo = useCallback(() => {
    if (canUndo) setIndex((i) => i - 1);
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) setIndex((i) => i + 1);
  }, [canRedo]);

  const reset = useCallback((newPresent: T) => {
    setHistory([newPresent]);
    setIndex(0);
  }, []);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y / Ctrl+Shift+Z
  useEffect(() => {
    if (!enableKeyboard) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (!modifier) return;

      // Ignore when focused inside standard text inputs/textareas to allow native text undo
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'y' && !e.shiftKey) || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, undo, redo]);

  return {
    state: history[index] ?? initialPresent,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    historyIndex: index,
    historyLength: history.length,
  };
}
```

#### Files to Update:
- `components/ResumeChatStudio.tsx`: Replace local history stack and keyboard listener with `useUndoRedo(initialCv)`.
- `components/GithubChatStudio.tsx`: Replace with `useUndoRedo(initialGithub)`.
- `components/LinkedinChatStudio.tsx`: Replace with `useUndoRedo(initialLinkedin)`.

---

### Task 3.2: Extract `<ReportIssueModal>` Shared Component
**Target file to create:** `components/ReportIssueModal.tsx`

#### The Problem:
Over ~70 lines of modal JSX, state management (`reportCategory`, `reportText`, `reportImage`, `reportSubmitting`), Cloudinary base64 image reading, and submission to `/api/issues` are copy-pasted 3 times:
- `ResumeChatStudio.tsx` (lines 208–285 & 1637–1700)
- `LinkedinChatStudio.tsx` (lines 232–248 & 2272–2335)
- `GithubChatStudio.tsx` (lines 116–132 & 978–1041)

#### Proposed Component Interface:
```typescript
// components/ReportIssueModal.tsx
import React, { useState } from 'react';
import { Bug, X, Upload, Loader2, Check } from 'lucide-react';
import toast from '@/lib/toast';

export interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory: 'RESUME' | 'GITHUB' | 'LINKEDIN';
}

export function ReportIssueModal({ isOpen, onClose, defaultCategory }: ReportIssueModalProps) {
  // Encapsulates state, file reading, category selection, and POST to /api/issues
  // Handles toast notification on success
}
```

#### Files to Update:
- `components/ResumeChatStudio.tsx`: Import `<ReportIssueModal isOpen={reportIssueModalOpen} onClose={() => setReportIssueModalOpen(false)} defaultCategory="RESUME" />`.
- `components/LinkedinChatStudio.tsx`: Import with `defaultCategory="LINKEDIN"`.
- `components/GithubChatStudio.tsx`: Import with `defaultCategory="GITHUB"`.

---

### Task 3.3: Consolidate Payment Status & Pro Polling via `useWorkspace()`

#### The Problem:
All 3 studios implement independent `fetch('/api/payment/status')` polling loops, local `unlocked` state, and `window.addEventListener('focus', ...)`:
- `ResumeChatStudio.tsx` (lines 690–712)
- `LinkedinChatStudio.tsx` (lines 260–280)
- `GithubChatStudio.tsx` (lines 220–240)

Meanwhile, `context/WorkspaceContext.tsx` already maintains:
- `unlocked` (global Pro unlock status, cached in `localStorage`)
- `checkUnlockStatus()` (fetches status, caches to `localStorage`, fires `'profile_builder_unlocked'`)
- Global window event listeners.

#### Proposed Solution:
- In `WorkspaceContext.tsx`, expose `aiMessagesUsed` or usage data if needed by studios.
- In each studio, read `const { unlocked, checkUnlockStatus } = useWorkspace()` directly instead of creating local duplicate `setInterval` or focus event listeners.

---

### Task 3.4: Create `useTypewriter` Custom Hook
**Target file to create:** `hooks/useTypewriter.ts`

#### The Problem:
Identical typewriter timing logic (phrases array, textIndex, isDeleting, speed calculation, interval timeout) is duplicated across:
- `components/ResumeLandingView.tsx` (lines 69–95)
- `components/LinkedinLandingView.tsx` (lines 47–70)
- `components/GithubLandingView.tsx` (lines 218–240)
- `components/AuthModal.tsx` (lines 160–191)

#### Proposed Hook Interface:
```typescript
// hooks/useTypewriter.ts
export interface UseTypewriterOptions {
  words: string[];
  typingSpeed?: number;    // default 50ms
  deletingSpeed?: number;  // default 30ms
  pauseTime?: number;      // default 1800ms
  enabled?: boolean;       // default true
}

export function useTypewriter({
  words,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseTime = 1800,
  enabled = true,
}: UseTypewriterOptions): string {
  // Returns current typed string
}
```

#### Files to Update:
- `ResumeLandingView.tsx`, `LinkedinLandingView.tsx`, `GithubLandingView.tsx`, `AuthModal.tsx`.

---

### Task 3.5: PDF Download Error Message Refinement
In `components/ResumeChatStudio.tsx:848`:
```diff
- throw new Error(err?.detail ?? 'PDF generation failed');
+ throw new Error(err?.error || err?.details || err?.detail || 'PDF generation failed');
```
This enables semantic validation error messages (e.g. `html is required`) from the newly migrated `/api/pdf` to surface cleanly in user toasts.

---

## 4. Execution Strategy for Tomorrow's Agent

1. **Step 1: Check Git State**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b refactor/phase-3-hooks-ui
   ```

2. **Step 2: Sub-Batch 3.1 (`useUndoRedo`)**
   - Create `hooks/useUndoRedo.ts`.
   - Update `ResumeChatStudio.tsx`, `GithubChatStudio.tsx`, and `LinkedinChatStudio.tsx`.
   - Run `bun x tsc --noEmit` & verify.

3. **Step 3: Sub-Batch 3.2 (`ReportIssueModal`)**
   - Create `components/ReportIssueModal.tsx`.
   - Remove duplicate modal state/JSX from the 3 studios.
   - Run `bun x tsc --noEmit`.

4. **Step 4: Sub-Batch 3.3 & 3.4 (Payment Polling & `useTypewriter`)**
   - Create `hooks/useTypewriter.ts` and apply to landing views & `AuthModal`.
   - Standardize payment polling in studios via `useWorkspace()`.
   - Apply Task 3.5 PDF error message tweak in `ResumeChatStudio.tsx`.

5. **Step 5: Full Build Verification**
   - Run `bun x tsc --noEmit`.
   - Run `bun run build` (ensure 40/40 routes pass with 0 errors).

6. **Step 6: Review Diffs & Merge**
   - Present diffs separately to user.
   - Merge `refactor/phase-3-hooks-ui` into `main` and push to `origin/main`.
   - Update `gemini.md` with the new hooks conventions.

---

## 5. Mandatory Agent Rules & Constraints
- **Package Manager:** ALWAYS use `bun` and `bunx`. Never use `npm`, `npx`, or `yarn`.
- **Preserve Behavior:** Do not alter existing keyboard shortcuts, modal designs, button styling, or animation timings.
- **Self-Update `gemini.md`:** Document the new hooks under Section 2 / Section 4 when completed.
