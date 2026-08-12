import { NextResponse } from 'next/server';
import { getCurrentUserId } from '../../../lib/serverAuth';
import { db } from '../../../lib/db';
import type { CvData } from '../../../lib/cvTypes';

export const runtime = 'nodejs';

// Oldest saves beyond this are pruned after each save, mirroring the LMS CV
// Generator's own cap so an account can't grow an unbounded pile of saves.
const MAX_SAVES_PER_USER = 30;

/** Newest-first list of the current user's saved resumes (metadata only). */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const rows = await db.resumeSave.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true },
  });
  return NextResponse.json({ versions: rows });
}

/** Saves the current CV as a named version. One save per name per account
 *  (case-insensitive) — refuses instead of piling up duplicates. */
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const data = body?.data as CvData | undefined;
  if (!data) return NextResponse.json({ error: 'Missing resume data' }, { status: 400 });

  const name = (body?.name || '').trim() || 'Untitled resume';

  const existing = await db.resumeSave.findFirst({
    where: { userId, name: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: `A resume named "${name}" is already saved. Rename it and try again.` },
      { status: 409 }
    );
  }

  await db.resumeSave.create({ data: { userId, name, data: data as any } });

  const excess = await db.resumeSave.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: MAX_SAVES_PER_USER,
    select: { id: true },
  });
  if (excess.length) {
    await db.resumeSave.deleteMany({ where: { id: { in: excess.map((e) => e.id) } } });
  }

  return NextResponse.json({ name });
}
