import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../../lib/db';
import { BUILDER_ACCESS_EMAILS } from '@/lib/accessConfig';
import { apiSuccess, apiForbidden, apiNotFound, apiBadRequest } from '@/lib/apiResponse';

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
  if (!user) return apiForbidden('Access restricted to authorized beta users.');
  const userId = user.id;

  const { id } = await params;
  const row = await db.linkedinSave.findFirst({ where: { id, userId }, select: { data: true } });
  if (!row) return apiNotFound('Not found');

  return apiSuccess({ data: row.data });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthorizedUser();
  if (!user) return apiForbidden('Access restricted to authorized beta users.');
  const userId = user.id;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiBadRequest('Missing body');

  const updateData: any = {};
  if (body.name) updateData.name = body.name.trim();
  if (body.data) updateData.data = body.data;

  if (Object.keys(updateData).length === 0) {
    return apiBadRequest('Nothing to update');
  }

  await db.linkedinSave.updateMany({
    where: { id, userId },
    data: updateData,
  });

  return apiSuccess({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthorizedUser();
  if (!user) return apiForbidden('Access restricted to authorized beta users.');
  const userId = user.id;

  const { id } = await params;
  await db.linkedinSave.deleteMany({ where: { id, userId } });
  return apiSuccess({ success: true });
}
