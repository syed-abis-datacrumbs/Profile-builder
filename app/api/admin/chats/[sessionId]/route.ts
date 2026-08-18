import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { sessionId } = await params;

  const rows = await db.profileBuilderChatLog.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    select: { id: true, userMessage: true, aiReply: true, isAutoFit: true, createdAt: true },
  });

  const turns = rows.map((r) => ({
    id: r.id,
    userMessage: r.userMessage,
    aiReply: r.aiReply,
    isAutoFit: r.isAutoFit,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json(turns);
}
