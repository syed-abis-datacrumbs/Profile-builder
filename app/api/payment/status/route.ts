import { getCurrentUserId } from '../../../../lib/serverAuth';
import { db } from '../../../../lib/db';
import { PAYMENT_TESTING_MODE } from '../../../../lib/paymentConfig';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return Response.json({ unlocked: false, aiMessagesUsed: 0 });

  let aiMessagesUsed = 0;
  const usage = await db.profileBuilderAiUsage.findUnique({ where: { userId } });
  if (usage) {
    aiMessagesUsed = usage.usedCount;
  }

  // Testing: always report "not unlocked" so the watermark/download-block
  // and payment prompt stay available on every load, letting the flow be
  // re-tested repeatedly without cleaning up rows. Mirrors LMS's
  // hasCvDownloadAccess().
  if (PAYMENT_TESTING_MODE) return Response.json({ unlocked: false, aiMessagesUsed });

  const unlock = await db.paymentUnlock.findUnique({ where: { userId } });
  return Response.json({ unlocked: !!unlock, aiMessagesUsed });
}
