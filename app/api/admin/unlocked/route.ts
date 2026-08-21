import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { lookupClerkUsers } from '@/lib/clerkUserLookup';
import { NextResponse } from 'next/server';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const unlocked = await db.paymentUnlock.findMany({
    orderBy: { unlockedAt: 'desc' },
  });

  const uniqueUserIds = Array.from(new Set(unlocked.map((u) => u.userId).filter(Boolean)));
  const userMap = await lookupClerkUsers(uniqueUserIds);

  const enriched = unlocked.map((u) => {
    const user = userMap.get(u.userId);
    return {
      ...u,
      userEmail: user?.email || u.userId,
      userName: user?.name || user?.email || u.userId,
    };
  });

  return NextResponse.json(enriched);
}
