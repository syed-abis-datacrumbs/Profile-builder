import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const unlocked = await db.paymentUnlock.findMany({
    orderBy: { unlockedAt: 'desc' },
  });
  return NextResponse.json(unlocked);
}
