import { NextResponse } from 'next/server';
import { getCurrentUserId } from '../../../lib/serverAuth';
import { db } from '../../../lib/db';
import type { LinkedinProfileData } from '../../../types';

export const runtime = 'nodejs';

/** Newest-first list of the current user's saved LinkedIn profiles (metadata only). */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const rows = await db.linkedinSave.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true },
  });
  return NextResponse.json({ versions: rows });
}

/** Saves the current LinkedIn profile as a named version. */
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const data = body?.data as LinkedinProfileData | undefined;
  if (!data) return NextResponse.json({ error: 'Missing linkedin data' }, { status: 400 });

  const name = (body?.name || '').trim() || 'Untitled profile';

  const existing = await db.linkedinSave.findFirst({
    where: { userId, name: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: `A profile named "${name}" is already saved. Rename it and try again.` },
      { status: 409 }
    );
  }

  await db.linkedinSave.create({ data: { userId, name, data: data as any } });

  return NextResponse.json({ success: true });
}
