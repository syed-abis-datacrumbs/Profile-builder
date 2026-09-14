import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../../lib/db';
import { BUILDER_ACCESS_EMAILS } from '@/lib/accessConfig';

export const runtime = 'nodejs';

async function getAuthorizedUser() {
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  if (!primaryEmail || !BUILDER_ACCESS_EMAILS.has(primaryEmail)) {
    return null;
  }
  return user;
}

/** Full profile snapshot of one saved LinkedIn profile (ownership enforced). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Access restricted to authorized beta users.' }, { status: 403 });
  const userId = user.id;

  const { id } = await params;
  const row = await db.linkedinSave.findFirst({ where: { id, userId }, select: { data: true } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: row.data });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Access restricted to authorized beta users.' }, { status: 403 });
  const userId = user.id;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Missing body' }, { status: 400 });

  const updateData: any = {};
  if (body.name) updateData.name = body.name.trim();
  if (body.data) updateData.data = body.data;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  await db.linkedinSave.updateMany({
    where: { id, userId },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Access restricted to authorized beta users.' }, { status: 403 });
  const userId = user.id;

  const { id } = await params;
  await db.linkedinSave.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}
