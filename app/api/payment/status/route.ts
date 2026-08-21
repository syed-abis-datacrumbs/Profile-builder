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
    let unlock = await db.paymentUnlock.findUnique({ where: { userId } });
    if (!unlock) {
      unlock = await db.paymentUnlock.create({ data: { userId } });
    }
    const lastApprovedAt = unlock.unlockedAt ? unlock.unlockedAt.toISOString() : 'team_access_permanent';
    const shouldCelebrate = !(unlock as any)?.celebratedAt;
    return Response.json({ unlocked: true, aiMessagesUsed, lastApprovedAt, shouldCelebrate });
  }

  // Testing: always report "not unlocked" so the watermark/download-block
  // and payment prompt stay available on every load, letting the flow be
  // re-tested repeatedly without cleaning up rows. Mirrors LMS's
  // hasCvDownloadAccess().
  if (PAYMENT_TESTING_MODE) return Response.json({ unlocked: false, aiMessagesUsed, shouldCelebrate: false });

  const approvedProof = await db.paymentProof.findFirst({
    where: { userId, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
  });

  const unlock = await db.paymentUnlock.findUnique({ where: { userId } });

  if (unlock || approvedProof) {
    let resolvedUnlock = unlock;
    if (!resolvedUnlock) {
      resolvedUnlock = await db.paymentUnlock.create({
        data: { userId, unlockedAt: approvedProof?.createdAt || new Date() },
      });
    }
    const lastApprovedAt = resolvedUnlock.unlockedAt
      ? resolvedUnlock.unlockedAt.toISOString()
      : (approvedProof?.createdAt ? approvedProof.createdAt.toISOString() : 'unlocked_permanent');
    const shouldCelebrate = !(resolvedUnlock as any)?.celebratedAt;
    return Response.json({ unlocked: true, aiMessagesUsed, lastApprovedAt, shouldCelebrate });
  }

  return Response.json({ unlocked: false, aiMessagesUsed, shouldCelebrate: false });
}
