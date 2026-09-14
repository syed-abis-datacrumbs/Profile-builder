import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../lib/db';
import type { GithubProfileData } from '../../../types';
import { BUILDER_ACCESS_EMAILS } from '@/lib/accessConfig';

export const runtime = 'nodejs';

/** Newest-first list of the current user's saved GitHub profiles (metadata only). */
export async function GET() {
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  if (!primaryEmail || !BUILDER_ACCESS_EMAILS.has(primaryEmail)) {
    return NextResponse.json({ error: 'Access restricted to authorized beta users.' }, { status: 403 });
  }
  const userId = user.id;

  const rows = await db.githubSave.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true },
  });
  return NextResponse.json({ versions: rows });
}

/** Saves the current GitHub profile as a named version. */
export async function POST(request: Request) {
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  if (!primaryEmail || !BUILDER_ACCESS_EMAILS.has(primaryEmail)) {
    return NextResponse.json({ error: 'Access restricted to authorized beta users.' }, { status: 403 });
  }
  const userId = user.id;

  const body = await request.json().catch(() => null);
  const data = body?.data as GithubProfileData | undefined;
  if (!data) return NextResponse.json({ error: 'Missing github data' }, { status: 400 });

  const name = (body?.name || '').trim() || 'Untitled profile';
  const targetId = body?.id as string | undefined;

  const existing = await db.githubSave.findFirst({
    where: { userId, name: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  });

  if (targetId) {
    if (existing && existing.id !== targetId) {
      return NextResponse.json(
        { error: `A profile named "${name}" already exists. Please choose a different name.` },
        { status: 409 }
      );
    }
    await db.githubSave.updateMany({
      where: { id: targetId, userId },
      data: { name, data: data as any },
    });
    return NextResponse.json({ success: true, id: targetId, name });
  } else {
    if (existing) {
      return NextResponse.json(
        { error: `A profile named "${name}" is already saved. Rename it and try again.` },
        { status: 409 }
      );
    }
    const newSave = await db.githubSave.create({ data: { userId, name, data: data as any } });
    return NextResponse.json({ success: true, id: newSave.id, name });
  }
}
