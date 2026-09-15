import { getCurrentUserId } from '../../../../lib/serverAuth';
import { db } from '../../../../lib/db';
import { apiSuccess, apiUnauthorized, apiNotFound, apiBadRequest } from '@/lib/apiResponse';

export const runtime = 'nodejs';

/** Full profile snapshot of one saved GitHub profile (ownership enforced). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return apiUnauthorized('Not authenticated');

  const { id } = await params;
  const row = await db.githubSave.findFirst({ where: { id, userId }, select: { data: true } });
  if (!row) return apiNotFound('Not found');

  return apiSuccess({ data: row.data });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return apiUnauthorized('Not authenticated');

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiBadRequest('Missing body');

  const updateData: any = {};
  if (body.name) updateData.name = body.name.trim();
  if (body.data) updateData.data = body.data;

  if (Object.keys(updateData).length === 0) {
    return apiBadRequest('Nothing to update');
  }

  await db.githubSave.updateMany({
    where: { id, userId },
    data: updateData,
  });

  return apiSuccess({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return apiUnauthorized('Not authenticated');

  const { id } = await params;
  await db.githubSave.deleteMany({ where: { id, userId } });
  return apiSuccess({ success: true });
}
