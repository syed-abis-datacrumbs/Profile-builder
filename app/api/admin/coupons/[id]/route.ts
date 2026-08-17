import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json();

  const coupon = await db.profileBuilderCoupon.update({
    where: { id },
    data: { isActive: body.isActive },
  });
  return NextResponse.json(coupon);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  await db.profileBuilderCoupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
