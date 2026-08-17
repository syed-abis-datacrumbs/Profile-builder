import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const [
    totalUnlocked,
    pendingPayments,
    totalProofs,
    totalCoupons,
    totalRedemptions,
    totalResumes,
    recentPayments,
  ] = await Promise.all([
    db.paymentUnlock.count(),
    db.paymentProof.count({ where: { status: 'PENDING' } }),
    db.paymentProof.count(),
    db.profileBuilderCoupon.count(),
    db.profileBuilderCouponRedemption.count(),
    db.resumeSave.count(),
    db.paymentProof.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    totalUnlocked,
    pendingPayments,
    totalProofs,
    totalCoupons,
    totalRedemptions,
    totalResumes,
    recentPayments,
  });
}
