import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server';

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || 'resume';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const where: any = { builderType: type };
  
  if (search) {
    const client = await clerkClient();
    const users = await client.users.getUserList({ query: search });
    const userIds = users.data.map(u => u.id);
    if (userIds.length === 0) {
      return NextResponse.json({ sessions: [], total: 0, page, pageSize: PAGE_SIZE });
    }
    where.userId = { in: userIds };
  }

  const grouped = await db.profileBuilderChatLog.groupBy({
    by: ["sessionId"],
    where,
    _count: { _all: true },
    _min: { createdAt: true },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const allSessions = await db.profileBuilderChatLog.groupBy({ by: ["sessionId"], where });
  const total = allSessions.length;

  if (grouped.length === 0) {
    return NextResponse.json({ sessions: [], total, page, pageSize: PAGE_SIZE });
  }

  const sessionIds = grouped.map((g) => g.sessionId);
  const firstTurns = await db.profileBuilderChatLog.findMany({
    where: { sessionId: { in: sessionIds } },
    orderBy: { createdAt: "asc" },
    select: {
      sessionId: true,
      userMessage: true,
      isAutoFit: true,
      userId: true,
    },
  });

  const firstBySession = new Map<string, (typeof firstTurns)[number]>();
  for (const turn of firstTurns) {
    const existing = firstBySession.get(turn.sessionId);
    if (!existing || (existing.isAutoFit && !turn.isAutoFit)) {
      firstBySession.set(turn.sessionId, turn);
    }
  }

  const client = await clerkClient();
  const uniqueUserIds = Array.from(new Set(firstTurns.map(t => t.userId).filter(Boolean))) as string[];
  const clerkUsers = await Promise.all(
    uniqueUserIds.map(async (id) => {
      try { return await client.users.getUser(id); } catch { return null; }
    })
  );
  
  const userMap = new Map<string, { id: string; name: string; email: string }>();
  clerkUsers.forEach(u => {
    if (u) {
      const email = u.emailAddresses[0]?.emailAddress || 'No Email';
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || email;
      userMap.set(u.id, { id: u.id, name, email });
    }
  });

  const sessions = grouped
    .map((g) => {
      const first = firstBySession.get(g.sessionId);
      if (!first) return null;
      const student = first.userId ? userMap.get(first.userId) : null;
      return {
        sessionId: g.sessionId,
        turnCount: g._count._all,
        startedAt: (g._min.createdAt ?? new Date()).toISOString(),
        lastAt: (g._max.createdAt ?? new Date()).toISOString(),
        firstMessage: first.userMessage,
        student: student || { id: 'unknown', name: 'Anonymous', email: 'N/A' },
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    sessions,
    total,
    page,
    pageSize: PAGE_SIZE,
  });
}
