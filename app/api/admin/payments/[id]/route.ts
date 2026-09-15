import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiBadRequest, apiNotFound } from '@/lib/apiResponse';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json();
  const { action } = body; // 'approve' | 'reject' | 'pending'

  if (action !== 'approve' && action !== 'reject' && action !== 'pending') {
    return apiBadRequest('action must be approve, reject, or pending');
  }

  const proof = await db.paymentProof.findUnique({ where: { id } });
  if (!proof) return apiNotFound('Not found');

  const newStatus = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'PENDING';

  await db.paymentProof.update({
    where: { id },
    data: { status: newStatus, decisionReason: body.reason || null },
  });

  // If approved, ensure user is unlocked with fresh timestamp and fresh celebration state
  if (action === 'approve') {
    await db.paymentUnlock.upsert({
      where: { userId: proof.userId },
      update: { unlockedAt: new Date(), celebratedAt: null } as any,
      create: { userId: proof.userId },
    });
  } else {
    // If moved to REJECTED or PENDING, check if user has another approved proof
    const otherApproved = await db.paymentProof.findFirst({
      where: { userId: proof.userId, status: 'APPROVED', id: { not: id } },
    });
    if (!otherApproved) {
      await db.paymentUnlock.deleteMany({ where: { userId: proof.userId } });
    }
  }

  return apiSuccess({ success: true });
}
