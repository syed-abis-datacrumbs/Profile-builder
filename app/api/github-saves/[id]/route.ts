import { NextResponse } from 'next/server';
import { getCurrentUserId } from '../../../../lib/serverAuth';
import { db } from '../../../../lib/db';

export const runtime = 'nodejs';

/** Full profile snapshot of one saved GitHub profile (ownership enforced). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const row = await db.githubSave.findFirst({ where: { id, userId }, select: { data: true } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: row.data });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Missing body' }, { status: 400 });

  const updateData: any = {};
  if (body.name) updateData.name = body.name.trim();
  if (body.data) updateData.data = body.data;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  await db.githubSave.updateMany({
    where: { id, userId },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  await db.githubSave.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}
