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

  // Fetch all sessions to group them in memory
  const rawSessions = await db.profileBuilderChatLog.groupBy({
    by: ["sessionId", "userId"],
    where,
    _count: { _all: true },
    _min: { createdAt: true },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
  });

  const mergedList: any[] = [];
  const userSessions = new Map<string, typeof rawSessions>();

  for (const s of rawSessions) {
    if (!s.userId) {
      // Anonymous users cannot be securely grouped, keep separate
      mergedList.push({
        sessionIds: [s.sessionId],
        userId: null,
        turnCount: s._count._all,
        startedAt: s._min.createdAt ?? new Date(),
        lastAt: s._max.createdAt ?? new Date(),
      });
    } else {
      if (!userSessions.has(s.userId)) userSessions.set(s.userId, []);
      userSessions.get(s.userId)!.push(s);
    }
  }

  // Merge sessions for the same user if they are within 1 hour
  for (const [userId, sessions] of userSessions.entries()) {
    // Sessions are already sorted by _max.createdAt DESC
    let currentGroup: any = null;

    for (const s of sessions) {
      if (!currentGroup) {
        currentGroup = {
          sessionIds: [s.sessionId],
          userId,
          turnCount: s._count._all,
          startedAt: s._min.createdAt ?? new Date(),
          lastAt: s._max.createdAt ?? new Date(),
        };
      } else {
        const diff = currentGroup.startedAt.getTime() - (s._max.createdAt ?? new Date()).getTime();
        // If the previous session ended within 1 hour before the next session started
        if (diff <= 60 * 60 * 1000 && diff >= 0) {
          currentGroup.sessionIds.push(s.sessionId);
          currentGroup.turnCount += s._count._all;
          currentGroup.startedAt = s._min.createdAt ?? new Date();
        } else {
          mergedList.push(currentGroup);
          currentGroup = {
            sessionIds: [s.sessionId],
            userId,
            turnCount: s._count._all,
            startedAt: s._min.createdAt ?? new Date(),
            lastAt: s._max.createdAt ?? new Date(),
          };
        }
      }
    }
    if (currentGroup) mergedList.push(currentGroup);
  }

  // Sort all grouped sessions by their latest activity
  mergedList.sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());

  const total = mergedList.length;

  if (total === 0) {
    return NextResponse.json({ sessions: [], total, page, pageSize: PAGE_SIZE });
  }

  const paginated = mergedList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // We need to fetch the first turns to get the initial messages
  // We'll just use the earliest sessionId from each group to get the first message
  const firstSessionIds = paginated.map((g) => g.sessionIds[g.sessionIds.length - 1]);
  
  const firstTurns = await db.profileBuilderChatLog.findMany({
    where: { sessionId: { in: firstSessionIds } },
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

  const sessions = paginated
    .map((g) => {
      // The first session is the last one in the array because we pushed them in descending order
      const firstSessionId = g.sessionIds[g.sessionIds.length - 1];
      const first = firstBySession.get(firstSessionId);
      if (!first) return null;
      const student = g.userId ? userMap.get(g.userId) : null;
      return {
        sessionId: g.sessionIds.join(','),
        turnCount: g.turnCount,
        startedAt: g.startedAt.toISOString(),
        lastAt: g.lastAt.toISOString(),
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
