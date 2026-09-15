import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../../lib/db';
import { getAdminNameRequests } from '@/lib/adminData';
import {
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiNotFound,
} from '@/lib/apiResponse';

export const runtime = 'nodejs';

/** GET /api/admin/name-requests — list all PENDING resume name-change requests */
export async function GET() {
  const clerk = await currentUser();
  if (!clerk) return apiUnauthorized('Not authenticated');

  // Admin check via Clerk public metadata
  const role = (clerk.publicMetadata as any)?.role;
  if (role !== 'admin') return apiForbidden('Forbidden');

  const enriched = await getAdminNameRequests();

  return apiSuccess({ requests: enriched });
}

/** POST /api/admin/name-requests — approve or reject a request */
export async function POST(request: Request) {
  const clerk = await currentUser();
  if (!clerk) return apiUnauthorized('Not authenticated');

  const role = (clerk.publicMetadata as any)?.role;
  if (role !== 'admin') return apiForbidden('Forbidden');

  const body = await request.json().catch(() => null);
  const { requestId, action } = body ?? {};
  if (!requestId || !['approve', 'reject'].includes(action)) {
    return apiBadRequest('Invalid payload');
  }

  const req = await db.resumeNameChangeRequest.findUnique({ where: { id: requestId } });
  if (!req || req.status !== 'PENDING') {
    return apiNotFound('Request not found or already decided');
  }

  if (action === 'approve') {
    // Add the requested name to their allowed downloaded names list
    let profile = await db.resumeProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) {
      profile = await db.resumeProfile.create({ data: { userId: req.userId, downloadedNames: [] } });
    }
    
    const downloadedNames = Array.isArray(profile.downloadedNames) ? (profile.downloadedNames as string[]) : [];
    if (!downloadedNames.some(n => n.toLowerCase() === req.requestedName.toLowerCase())) {
      downloadedNames.push(req.requestedName);
      await db.resumeProfile.update({
        where: { userId: req.userId },
        data: { downloadedNames },
      });
    }

    await db.resumeNameChangeRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', decidedAt: new Date() },
    });

    return apiSuccess({ success: true, action: 'approved', newName: req.requestedName });
  }

  // Reject
  await db.resumeNameChangeRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED', decidedAt: new Date() },
  });

  return apiSuccess({ success: true, action: 'rejected' });
}
