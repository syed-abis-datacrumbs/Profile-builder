import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const coupons = await db.profileBuilderCoupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { redemptions: true } } },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { code, label, maxUses, expiresAt } = body;

  if (!code?.trim()) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
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
    return NextResponse.json(coupon, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
    }
    throw err;
  }
}
