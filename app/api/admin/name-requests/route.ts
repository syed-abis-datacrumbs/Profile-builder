import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../../lib/db';

export const runtime = 'nodejs';

/** GET /api/admin/name-requests — list all PENDING resume name-change requests */
export async function GET(): Promise<NextResponse> {
  const clerk = await currentUser();
  if (!clerk) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Admin check via Clerk public metadata
  const role = (clerk.publicMetadata as any)?.role;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await db.resumeNameChangeRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ requests: rows });
}

/** POST /api/admin/name-requests — approve or reject a request */
export async function POST(request: Request): Promise<NextResponse> {
  const clerk = await currentUser();
  if (!clerk) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const role = (clerk.publicMetadata as any)?.role;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const { requestId, action } = body ?? {};
  if (!requestId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const req = await db.resumeNameChangeRequest.findUnique({ where: { id: requestId } });
  if (!req || req.status !== 'PENDING') {
    return NextResponse.json({ error: 'Request not found or already decided' }, { status: 404 });
  }

  if (action === 'approve') {
    // Apply the name to ALL the user's saves
    const allSaves = await db.resumeSave.findMany({
      where: { userId: req.userId },
      select: { id: true, data: true },
    });
    await Promise.all(
      allSaves.map((s) => {
        const d = s.data as any;
        const updated = { ...d, personalInfo: { ...d.personalInfo, fullName: req.requestedName } };
        return db.resumeSave.update({ where: { id: s.id }, data: { data: updated } });
      })
    );

    await db.resumeNameChangeRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', decidedAt: new Date() },
    });

    return NextResponse.json({ success: true, action: 'approved', newName: req.requestedName });
  }

  // Reject
  await db.resumeNameChangeRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED', decidedAt: new Date() },
  });

  return NextResponse.json({ success: true, action: 'rejected' });
}
