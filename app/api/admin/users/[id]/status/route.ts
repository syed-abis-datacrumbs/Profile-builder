import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id: userId } = await params;
  const { status } = await req.json();

  if (!status || !['Free', 'Paid'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    if (status === 'Free') {
      // Revoke access: delete payment unlock and any coupon redemptions
      await db.$transaction([
        db.paymentUnlock.deleteMany({ where: { userId } }),
        db.profileBuilderCouponRedemption.deleteMany({ where: { userId } }),
      ]);
    } else if (status === 'Paid') {
      // Grant access
      await db.paymentUnlock.upsert({
        where: { userId },
        update: {}, // if exists, do nothing (keep original unlockedAt)
        create: { userId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating user status:', err);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}
