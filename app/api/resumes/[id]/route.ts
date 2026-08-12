import { NextResponse } from 'next/server';
import { getCurrentUserId } from '../../../../lib/serverAuth';
import { db } from '../../../../lib/db';

export const runtime = 'nodejs';

/** Full CV snapshot of one saved resume (ownership enforced). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const row = await db.resumeSave.findFirst({ where: { id, userId }, select: { data: true } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: row.data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  // deleteMany so the ownership filter applies without throwing when the
  // row is already gone (e.g. deleted from another tab).
  await db.resumeSave.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}
