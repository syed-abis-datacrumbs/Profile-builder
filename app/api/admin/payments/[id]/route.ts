import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json();
  const { action } = body; // 'approve' | 'reject'

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
  }

  const proof = await db.paymentProof.findUnique({ where: { id } });
  if (!proof) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

  await db.paymentProof.update({
    where: { id },
    data: { status: newStatus, decisionReason: body.reason || null },
  });

  // If approved, create the PaymentUnlock row (upsert so it's idempotent)
  if (action === 'approve') {
    await db.paymentUnlock.upsert({
      where: { userId: proof.userId },
      update: {},
      create: { userId: proof.userId },
    });
  }

  return NextResponse.json({ success: true });
}
