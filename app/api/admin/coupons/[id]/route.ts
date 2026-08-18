import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json();

  const dataToUpdate: any = {};
  if (body.isActive !== undefined) dataToUpdate.isActive = body.isActive;
  if (body.code !== undefined) dataToUpdate.code = body.code;
  if (body.label !== undefined) dataToUpdate.label = body.label;
  if (body.maxUses !== undefined) dataToUpdate.maxUses = body.maxUses;
  if (body.expiresAt !== undefined) dataToUpdate.expiresAt = body.expiresAt;

  const coupon = await db.profileBuilderCoupon.update({
    where: { id },
    data: dataToUpdate,
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
