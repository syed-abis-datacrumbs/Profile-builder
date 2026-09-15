import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiBadRequest, apiServerError } from '@/lib/apiResponse';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id: userId } = await params;
  const { status } = await req.json();

  if (!status || !['Free', 'Paid'].includes(status)) {
    return apiBadRequest('Invalid status');
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

    return apiSuccess({ success: true });
  } catch (err: any) {
    return apiServerError('Failed to update user status', err);
  }
}
