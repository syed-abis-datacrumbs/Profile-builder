import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../../lib/db';
import { MAX_FREE_RESUME_NAME_EDITS } from '../../../../lib/resumeNameLock';

export const runtime = 'nodejs';

export type NameStatusResult = {
  fullName: string;
  editsUsed: number;
  editsRemaining: number;
  pendingRequest: { id: string; requestedName: string; createdAt: string } | null;
};

export type UpdateNameResult =
  | { status: 'unchanged'; fullName: string; editsUsed: number; editsRemaining: number }
  | { status: 'applied'; fullName: string; editsUsed: number; editsRemaining: number }
  | { status: 'pending'; requestedName: string; fullName: string }
  | { status: 'pendingCreated'; requestedName: string; fullName: string }
  | { status: 'error'; error: string };

/**
 * GET /api/resumes/name
 * Returns the current locked name, edits used/remaining, and any pending request.
 * Mirrors LMS's getFullNameStatus().
 */
export async function GET(): Promise<NextResponse> {
  const clerk = await currentUser();
  if (!clerk) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const userId = clerk.id;

  // Get the name from the most recent ResumeSave (the locked name lives there)
  const [profile, pending, latestSave] = await Promise.all([
    db.resumeProfile.findUnique({ where: { userId } }),
    db.resumeNameChangeRequest.findFirst({
      where: { userId, status: 'PENDING' },
      select: { id: true, requestedName: true, createdAt: true },
    }),
    db.resumeSave.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { data: true },
    }),
  ]);

  const editsUsed = profile?.fullNameEditsUsed ?? 0;
  // Extract fullName from the latest save's JSON blob
  const fullName: string = (latestSave?.data as any)?.personalInfo?.fullName?.trim() ?? '';

  const result: NameStatusResult = {
    fullName,
    editsUsed,
    editsRemaining: Math.max(0, MAX_FREE_RESUME_NAME_EDITS - editsUsed),
    pendingRequest: pending
      ? { id: pending.id, requestedName: pending.requestedName, createdAt: pending.createdAt.toISOString() }
      : null,
  };

  return NextResponse.json(result);
}

/**
 * POST /api/resumes/name
 * Attempts to change the locked full name.
 * - If edits remain → applies immediately, increments counter
 * - If locked → creates a PENDING request for admin approval
 * Mirrors LMS's updateFullName().
 */
export async function POST(request: Request): Promise<NextResponse> {
  const clerk = await currentUser();
  if (!clerk) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const userId = clerk.id;
  const body = await request.json().catch(() => null);
  const newName: string = (body?.newName ?? '').trim();
  if (!newName) return NextResponse.json({ status: 'error', error: "Name can't be empty" });

  // Get current profile + the name stored in the latest save
  const [profile, latestSave, pending] = await Promise.all([
    db.resumeProfile.findUnique({ where: { userId } }),
    db.resumeSave.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, data: true },
    }),
    db.resumeNameChangeRequest.findFirst({
      where: { userId, status: 'PENDING' },
      select: { requestedName: true },
    }),
  ]);

  const editsUsed = profile?.fullNameEditsUsed ?? 0;
  const currentName: string = (latestSave?.data as any)?.personalInfo?.fullName?.trim() ?? '';

  if (newName === currentName) {
    return NextResponse.json({
      status: 'unchanged',
      fullName: currentName,
      editsUsed,
      editsRemaining: Math.max(0, MAX_FREE_RESUME_NAME_EDITS - editsUsed),
    } satisfies UpdateNameResult);
  }

  // Only one pending request allowed at a time
  if (pending) {
    return NextResponse.json({
      status: 'pending',
      requestedName: pending.requestedName,
      fullName: currentName,
    } satisfies UpdateNameResult);
  }

  if (editsUsed < MAX_FREE_RESUME_NAME_EDITS) {
    // Apply immediately — update the name in ALL saves for this user so the
    // live preview reflects it everywhere, and increment the counter.
    const newEditsUsed = editsUsed + 1;

    // Update name in every ResumeSave for this user
    const allSaves = await db.resumeSave.findMany({ where: { userId }, select: { id: true, data: true } });
    await Promise.all(
      allSaves.map((s) => {
        const d = s.data as any;
        const updated = { ...d, personalInfo: { ...d.personalInfo, fullName: newName } };
        return db.resumeSave.update({ where: { id: s.id }, data: { data: updated } });
      })
    );

    // Upsert the profile counter
    await db.resumeProfile.upsert({
      where: { userId },
      create: { userId, fullNameEditsUsed: newEditsUsed },
      update: { fullNameEditsUsed: newEditsUsed },
    });

    return NextResponse.json({
      status: 'applied',
      fullName: newName,
      editsUsed: newEditsUsed,
      editsRemaining: Math.max(0, MAX_FREE_RESUME_NAME_EDITS - newEditsUsed),
    } satisfies UpdateNameResult);
  }

  // Locked — create a pending request
  await db.resumeNameChangeRequest.create({
    data: { userId, currentName, requestedName: newName },
  });

  return NextResponse.json({
    status: 'pendingCreated',
    requestedName: newName,
    fullName: currentName,
  } satisfies UpdateNameResult);
}
