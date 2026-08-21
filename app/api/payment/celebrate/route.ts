import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../../lib/db';

export async function POST() {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await (db.paymentUnlock as any).updateMany({
      where: { userId },
      data: { celebratedAt: new Date() },
    });
    return Response.json({ success: true });
  } catch (err: any) {
    console.error('Failed to mark celebration:', err);
    return Response.json({ error: 'Failed to record celebration' }, { status: 500 });
  }
}
