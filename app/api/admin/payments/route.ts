import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { lookupClerkUsers } from '@/lib/clerkUserLookup';
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
  const userMap = await lookupClerkUsers(uniqueUserIds);

  const enrichedPayments = payments.map((p) => {
    const u = userMap.get(p.userId);
    return {
      ...p,
      userEmail: u?.email || p.userId,
      userName: u?.name || u?.email || p.userId,
    };
  });

  return NextResponse.json(enrichedPayments);
}
