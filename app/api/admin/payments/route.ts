import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;

  const payments = await db.paymentProof.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  const uniqueUserIds = Array.from(new Set(payments.map((p) => p.userId).filter(Boolean)));
  const userEmailMap = new Map<string, string>();

  if (uniqueUserIds.length > 0) {
    try {
      const client = await clerkClient();
      await Promise.all(
        uniqueUserIds.map(async (uid) => {
          try {
            const u = await client.users.getUser(uid);
            const email = u.primaryEmailAddress?.emailAddress || u.emailAddresses?.[0]?.emailAddress || uid;
            userEmailMap.set(uid, email);
          } catch {
            // fallback to uid if user not found in Clerk
          }
        })
      );
    } catch (e) {
      console.error('[Admin Payments] Failed to fetch Clerk emails:', e);
    }
  }

  const enrichedPayments = payments.map((p) => ({
    ...p,
    userEmail: userEmailMap.get(p.userId) || p.userId,
  }));

  return NextResponse.json(enrichedPayments);
}
