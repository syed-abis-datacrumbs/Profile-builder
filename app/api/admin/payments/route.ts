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
  return NextResponse.json(payments);
}
