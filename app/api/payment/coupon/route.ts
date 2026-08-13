import { NextRequest } from 'next/server';
import { getCurrentUserId } from '../../../../lib/serverAuth';
import { db } from '../../../../lib/db';

export const runtime = 'nodejs';

// Pakistan Standard Time offset — UTC+5:00. Used to compare expiry dates
// in local Pakistan time (matching how the admin enters the date).
function todayPkt(): string {
  const now = new Date();
  // Shift to PKT: UTC+5
  const pkt = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  return pkt.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ status: 'REJECTED', message: 'Please sign in first to use a coupon.' }, { status: 401 });
  }

  let code: string;
  try {
    const body = await request.json();
    code = (body?.code ?? '').toString().trim().toUpperCase();
  } catch {
    return Response.json({ status: 'REJECTED', message: 'Invalid request.' }, { status: 400 });
  }

  if (!code) {
    return Response.json({ status: 'REJECTED', message: 'Please enter a coupon code.' }, { status: 400 });
  }

  // 1. Look up the coupon
  const coupon = await db.profileBuilderCoupon.findUnique({ where: { code } });

  if (!coupon) {
    return Response.json({ status: 'REJECTED', message: 'This coupon code does not exist. Please check and try again.' });
  }

  if (!coupon.isActive) {
    return Response.json({ status: 'REJECTED', message: 'This coupon has been deactivated.' });
  }

  // 2. Check expiry (Pakistan time)
  if (coupon.expiresAt) {
    const today = todayPkt();
    if (today > coupon.expiresAt) {
      return Response.json({ status: 'REJECTED', message: `This coupon expired on ${coupon.expiresAt}. Please ask for a fresh code.` });
    }
  }

  // 3. Check usage limit
  if (coupon.usedCount >= coupon.maxUses) {
    return Response.json({ status: 'REJECTED', message: 'This coupon has reached its maximum usage limit.' });
  }

  // 4. Check if THIS user already redeemed this coupon
  const existingRedemption = await db.profileBuilderCouponRedemption.findUnique({
    where: { couponId_userId: { couponId: coupon.id, userId } },
  });
  if (existingRedemption) {
    return Response.json({ status: 'REJECTED', message: 'You have already used this coupon code.' });
  }

  // 5. All checks passed — atomically increment usedCount, create redemption,
  //    and unlock the user's payment in a single transaction.
  await db.$transaction([
    db.profileBuilderCoupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    }),
    db.profileBuilderCouponRedemption.create({
      data: { couponId: coupon.id, userId },
    }),
    db.paymentUnlock.upsert({
      where: { userId },
      create: { userId },
      update: {},
    }),
  ]);

  return Response.json({ status: 'APPROVED', message: '🎉 Coupon applied! Your download is now unlocked.' });
}
