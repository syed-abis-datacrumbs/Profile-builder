import { getCurrentUserId } from '../../../../lib/serverAuth';
import { db } from '../../../../lib/db';
import { apiSuccess, apiUnauthorized, apiNotFound } from '@/lib/apiResponse';

export const runtime = 'nodejs';

/** Full CV snapshot of one saved resume (ownership enforced). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return apiUnauthorized('Not authenticated');

  const { id } = await params;
  const row = await db.resumeSave.findFirst({ where: { id, userId }, select: { data: true } });
  if (!row) return apiNotFound('Not found');

  return apiSuccess({ data: row.data });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return apiUnauthorized('Not authenticated');

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const data = body?.data;
  const name = body?.name ? (body.name as string).trim() : undefined;

  const existing = await db.resumeSave.findFirst({ where: { id, userId } });
  if (!existing) return apiNotFound('Saved resume not found');

  const updateData: any = {};
  if (data !== undefined) updateData.data = data;
  if (name !== undefined) updateData.name = name;

  const updated = await db.resumeSave.update({
    where: { id },
    data: updateData,
  });

  return apiSuccess({ success: true, id: updated.id, name: updated.name });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return apiUnauthorized('Not authenticated');

  const { id } = await params;
  // deleteMany so the ownership filter applies without throwing when the
  // row is already gone (e.g. deleted from another tab).
  await db.resumeSave.deleteMany({ where: { id, userId } });
  return apiSuccess({ success: true });
}
