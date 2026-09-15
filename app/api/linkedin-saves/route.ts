import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../lib/db';
import type { LinkedinProfileData } from '../../../types';
import { BUILDER_ACCESS_EMAILS } from '@/lib/accessConfig';
import { apiSuccess, apiCreated, apiForbidden, apiBadRequest, apiConflict } from '@/lib/apiResponse';

export const runtime = 'nodejs';

/** Newest-first list of the current user's saved LinkedIn profiles (metadata only). */
export async function GET() {
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  if (!primaryEmail || !BUILDER_ACCESS_EMAILS.has(primaryEmail)) {
    return apiForbidden('Access restricted to authorized beta users.');
  }
  const userId = user.id;

  const rows = await db.linkedinSave.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true },
  });
  return apiSuccess({ versions: rows });
}

/** Saves the current LinkedIn profile as a named version. */
export async function POST(request: Request) {
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  if (!primaryEmail || !BUILDER_ACCESS_EMAILS.has(primaryEmail)) {
    return apiForbidden('Access restricted to authorized beta users.');
  }
  const userId = user.id;

  const body = await request.json().catch(() => null);
  const data = body?.data as LinkedinProfileData | undefined;
  if (!data) return apiBadRequest('Missing linkedin data');

  const name = (body?.name || '').trim() || 'Untitled profile';
  const targetId = body?.id as string | undefined;

  const existing = await db.linkedinSave.findFirst({
    where: { userId, name: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  });

  if (targetId) {
    if (existing && existing.id !== targetId) {
      return apiConflict(`A profile named "${name}" already exists. Please choose a different name.`);
    }
    await db.linkedinSave.updateMany({
      where: { id: targetId, userId },
      data: { name, data: data as any },
    });
    return apiSuccess({ success: true, id: targetId, name });
  } else {
    if (existing) {
      return apiConflict(`A profile named "${name}" is already saved. Rename it and try again.`);
    }
    const newSave = await db.linkedinSave.create({ data: { userId, name, data: data as any } });
    return apiCreated({ success: true, id: newSave.id, name });
  }
}
