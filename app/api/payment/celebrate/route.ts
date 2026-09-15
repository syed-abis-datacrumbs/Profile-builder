import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../../lib/db';
import { apiSuccess, apiUnauthorized, apiServerError } from '@/lib/apiResponse';

export async function POST() {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) return apiUnauthorized('Unauthorized');

  try {
    await (db.paymentUnlock as any).upsert({
      where: { userId },
      update: { celebratedAt: new Date() },
      create: { userId, celebratedAt: new Date() },
    });
    return apiSuccess({ success: true });
  } catch (err: any) {
    return apiServerError('Failed to record celebration', err);
  }
}
