import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { getAdminCoupons } from '@/lib/adminData';
import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiCreated, apiBadRequest, apiConflict } from '@/lib/apiResponse';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const coupons = await getAdminCoupons();
  return apiSuccess(coupons);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { code, label, maxUses, expiresAt } = body;

  if (!code?.trim()) {
    return apiBadRequest('Code is required');
  }

  try {
    const coupon = await db.profileBuilderCoupon.create({
      data: {
        code: code.trim().toUpperCase(),
        label: label?.trim() || null,
        maxUses: Number(maxUses) || 1,
        expiresAt: expiresAt || null,
        createdBy: auth.userId,
      },
    });
    return apiCreated(coupon);
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return apiConflict('Coupon code already exists');
    }
    throw err;
  }
}
