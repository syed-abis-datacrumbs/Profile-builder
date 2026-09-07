import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const resolvedParams = await params;
    const rawId = resolvedParams?.sessionId || req.nextUrl.searchParams.get('sessionId') || '';
    const decoded = decodeURIComponent(rawId);
    const sessionIds = decoded.split(',').map((s) => s.trim()).filter(Boolean);

    let rows: any[] = [];
    try {
      // Try full select with debug fields
      rows = await db.profileBuilderChatLog.findMany({
        where: { sessionId: { in: sessionIds } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          userMessage: true,
          aiReply: true,
          isAutoFit: true,
          rawOutput: true,
          rawText: true,
          parseSuccess: true,
          model: true,
          tokens: true,
          latencyMs: true,
          error: true,
          createdAt: true,
        },
      });
    } catch (dbErr: any) {
      console.warn('[Admin Chats] Full select failed, falling back to base fields:', dbErr?.message);
      // Fallback in case Prisma client in running process hasn't reloaded schema yet
      rows = await db.profileBuilderChatLog.findMany({
        where: { sessionId: { in: sessionIds } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          userMessage: true,
          aiReply: true,
          isAutoFit: true,
          createdAt: true,
        },
      });
    }

    const turns = rows.map((r: any) => ({
      id: r.id,
      userMessage: r.userMessage,
      aiReply: r.aiReply,
      isAutoFit: r.isAutoFit,
      rawOutput: r.rawOutput || null,
      rawText: r.rawText || null,
      parseSuccess: r.parseSuccess ?? true,
      model: r.model || null,
      tokens: r.tokens || null,
      latencyMs: r.latencyMs || null,
      error: r.error || null,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(turns);
  } catch (err: any) {
    console.error('[API /api/admin/chats/[sessionId] Fatal Error]:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load transcript' }, { status: 500 });
  }
}

