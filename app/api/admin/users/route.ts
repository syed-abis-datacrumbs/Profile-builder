import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { lookupClerkUsers } from '@/lib/clerkUserLookup';
import { NextResponse } from 'next/server';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  // Gather unique user IDs from all activity tables
  const [
    unlocks,
    couponRedemptions,
    aiUsage,
    resumes,
    githubs,
    linkedins
  ] = await Promise.all([
    db.paymentUnlock.findMany({ select: { userId: true, unlockedAt: true } }),
    db.profileBuilderCouponRedemption.findMany({ select: { userId: true } }),
    db.profileBuilderAiUsage.findMany({ select: { userId: true } }),
    db.resumeSave.findMany({ select: { userId: true } }),
    db.githubSave.findMany({ select: { userId: true } }),
    db.linkedinSave.findMany({ select: { userId: true } }),
  ]);

  const allIds = new Set<string>();
  const unlockedMap = new Map<string, string>(); // Map userId to unlockedAt date
  const couponUserIds = new Set<string>();

  unlocks.forEach((u) => {
    allIds.add(u.userId);
    unlockedMap.set(u.userId, u.unlockedAt.toISOString());
  });
  
  couponRedemptions.forEach((c) => {
    allIds.add(c.userId);
    couponUserIds.add(c.userId);
  });
  
  aiUsage.forEach((u) => allIds.add(u.userId));
  resumes.forEach((r) => allIds.add(r.userId));
  githubs.forEach((g) => allIds.add(g.userId));
  linkedins.forEach((l) => allIds.add(l.userId));

  const uniqueUserIds = Array.from(allIds).filter(Boolean);
  
  // Lookup names and emails from Clerk
  const userMap = await lookupClerkUsers(uniqueUserIds);

  // Classify each user
  const users = uniqueUserIds.map((userId) => {
    const clerkData = userMap.get(userId);
    const hasUnlock = unlockedMap.has(userId);
    const hasCoupon = couponUserIds.has(userId);

    let planStatus = 'Free';
    if (hasCoupon) planStatus = 'Coupon';
    else if (hasUnlock) planStatus = 'Paid';

    return {
      userId,
      email: clerkData?.email || '(Not found in Clerk)',
      name: clerkData?.name || clerkData?.email || 'Unknown User',
      planStatus,
      unlockedAt: unlockedMap.get(userId) || null,
    };
  });

  return NextResponse.json(users);
}
