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

  // Get the name from the profile's downloaded names
  const [profile, pending] = await Promise.all([
    db.resumeProfile.findUnique({ where: { userId } }),
    db.resumeNameChangeRequest.findFirst({
      where: { userId, status: 'PENDING' },
      select: { id: true, requestedName: true, createdAt: true },
    }),
  ]);

  const editsUsed = profile?.fullNameEditsUsed ?? 0;
  
  // Use the most recently downloaded name (if any)
  const downloadedNames = Array.isArray(profile?.downloadedNames) ? profile!.downloadedNames as string[] : [];
  const fullName: string = downloadedNames.length > 0 ? downloadedNames[downloadedNames.length - 1] : '';

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

  // Only one pending request allowed at a time
  if (pending) {
    return NextResponse.json({
      status: 'pending',
      requestedName: pending.requestedName,
      fullName: currentName,
    } satisfies UpdateNameResult);
  }

  // Create a pending request
  await db.resumeNameChangeRequest.create({
    data: { userId, currentName, requestedName: newName },
  });

  return NextResponse.json({
    status: 'pendingCreated',
    requestedName: newName,
    fullName: currentName,
  } satisfies UpdateNameResult);
}
