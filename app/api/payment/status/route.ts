import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../../lib/db';
import { PAYMENT_TESTING_MODE } from '../../../../lib/paymentConfig';
import { BUILDER_ACCESS_EMAILS } from '../../../../lib/accessConfig';

export async function GET() {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) return Response.json({ unlocked: false, aiMessagesUsed: 0 });

  let aiMessagesUsed = 0;
  const usage = await db.profileBuilderAiUsage.findUnique({ where: { userId } });
  if (usage) {
    aiMessagesUsed = usage.usedCount;
  }

  // Admin override: Team emails permanently get Pro access.
  // We explicitly write a PaymentUnlock row so that other server endpoints 
  // (like AI chat limiters) natively see this user as fully unlocked.
  const primaryEmail = user.primaryEmailAddress?.emailAddress;
  if (primaryEmail && BUILDER_ACCESS_EMAILS.has(primaryEmail)) {
    const unlock = await db.paymentUnlock.findUnique({ where: { userId } });
    if (!unlock) {
      await db.paymentUnlock.create({ data: { userId } });
    }
    return Response.json({ unlocked: true, aiMessagesUsed });
  }

  // Testing: always report "not unlocked" so the watermark/download-block
  // and payment prompt stay available on every load, letting the flow be
  // re-tested repeatedly without cleaning up rows. Mirrors LMS's
  // hasCvDownloadAccess().
  if (PAYMENT_TESTING_MODE) return Response.json({ unlocked: false, aiMessagesUsed });

  const unlock = await db.paymentUnlock.findUnique({ where: { userId } });
  return Response.json({ unlocked: !!unlock, aiMessagesUsed });
}
