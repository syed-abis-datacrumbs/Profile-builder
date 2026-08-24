import { db } from '@/lib/db';
import { lookupClerkUsers } from '@/lib/clerkUserLookup';

export async function getAdminUsers() {
  const [
    unlocks,
    couponRedemptions,
    aiUsage,
    resumes,
    githubs,
    linkedins
  ] = await Promise.all([
    db.paymentUnlock.findMany({ select: { userId: true, unlockedAt: true } }),
    db.profileBuilderCouponRedemption.findMany({ select: { userId: true, coupon: { select: { isActive: true } } } }),
    db.profileBuilderAiUsage.findMany({ select: { userId: true } }),
    db.resumeSave.findMany({ select: { userId: true } }),
    db.githubSave.findMany({ select: { userId: true } }),
    db.linkedinSave.findMany({ select: { userId: true } }),
  ]);

  const allIds = new Set<string>();
  const unlockedMap = new Map<string, Date>();
  const couponStatusMap = new Map<string, 'Active' | 'Deactive'>();

  unlocks.forEach((u) => {
    allIds.add(u.userId);
    unlockedMap.set(u.userId, u.unlockedAt);
  });
  
  couponRedemptions.forEach((c) => {
    allIds.add(c.userId);
    if (c.coupon?.isActive || couponStatusMap.get(c.userId) === 'Active') {
      couponStatusMap.set(c.userId, 'Active');
    } else {
      couponStatusMap.set(c.userId, 'Deactive');
    }
  });
  
  aiUsage.forEach((u) => allIds.add(u.userId));
  resumes.forEach((r) => allIds.add(r.userId));
  githubs.forEach((g) => allIds.add(g.userId));
  linkedins.forEach((l) => allIds.add(l.userId));

  const uniqueUserIds = Array.from(allIds).filter(Boolean);
  const userMap = await lookupClerkUsers(uniqueUserIds);

  return uniqueUserIds.map((userId) => {
    const clerkData = userMap.get(userId);
    const hasUnlock = unlockedMap.has(userId);
    const couponStatus = couponStatusMap.get(userId) || null;

    // If a user has a coupon, they are considered 'Free' (with a coupon badge) even though they have a PaymentUnlock.
    let planStatus: 'Free' | 'Paid' = (hasUnlock && !couponStatus) ? 'Paid' : 'Free';

    return {
      userId,
      email: clerkData?.email || '(Not found in Clerk)',
      name: clerkData?.name || clerkData?.email || 'Unknown User',
      planStatus,
      couponStatus,
      unlockedAt: unlockedMap.get(userId)?.toISOString() || null,
    };
  });
}

export async function getAdminPayments(status?: string) {
  const payments = await db.paymentProof.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  const uniqueUserIds = Array.from(new Set(payments.map((p) => p.userId).filter(Boolean)));
  const userMap = await lookupClerkUsers(uniqueUserIds);

  return payments.map((p) => {
    const u = userMap.get(p.userId);
    return {
      ...p,
      userEmail: u?.email || '(Not found in Clerk)',
      userName: u?.name || u?.email || 'Unknown User',
      createdAt: p.createdAt.toISOString(),
    };
  });
}

export async function getAdminIssues(status: string = 'OPEN', category: string = 'ALL', page: number = 1) {
  const PAGE_SIZE = 20;
  const where: any = { status };
  if (category && category !== 'ALL') {
    where.category = category;
  }

  const [issues, total, openCount, resolvedCount, resumeCount, githubCount, linkedinCount] = await Promise.all([
    (db as any).profileBuilderIssue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    (db as any).profileBuilderIssue.count({ where }),
    (db as any).profileBuilderIssue.count({ where: category && category !== 'ALL' ? { status: 'OPEN', category } : { status: 'OPEN' } }),
    (db as any).profileBuilderIssue.count({ where: category && category !== 'ALL' ? { status: 'RESOLVED', category } : { status: 'RESOLVED' } }),
    (db as any).profileBuilderIssue.count({ where: { category: 'resume', status } }),
    (db as any).profileBuilderIssue.count({ where: { category: 'github', status } }),
    (db as any).profileBuilderIssue.count({ where: { category: 'linkedin', status } }),
  ]);

  const uniqueUserIds = Array.from(new Set(issues.map((i: any) => i.userId).filter(Boolean))) as string[];
  const userMap = await lookupClerkUsers(uniqueUserIds);

  const enrichedIssues = issues.map((i: any) => ({
    ...i,
    category: i.category || 'resume',
    user: i.userId ? userMap.get(i.userId) || { id: i.userId, name: 'Unknown User', email: '(Not found in Clerk)' } : null,
    createdAt: i.createdAt.toISOString(),
  }));

  return {
    issues: enrichedIssues,
    total,
    page,
    pageSize: PAGE_SIZE,
    counts: {
      open: openCount,
      resolved: resolvedCount,
      resume: resumeCount,
      github: githubCount,
      linkedin: linkedinCount,
    },
  };
}

export async function getAdminNameRequests() {
  const rows = await db.resumeNameChangeRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });

  const uniqueUserIds = Array.from(new Set(rows.map((r) => r.userId).filter(Boolean)));
  const userMap = await lookupClerkUsers(uniqueUserIds);

  return rows.map((r) => {
    const u = userMap.get(r.userId);
      return {
      ...r,
      userEmail: u?.email || '(Not found in Clerk)',
      userName: u?.name || u?.email || 'Unknown User',
      createdAt: r.createdAt.toISOString(),
      decidedAt: r.decidedAt?.toISOString() || null,
    };
  });
}

export async function getAdminCoupons() {
  const coupons = await db.profileBuilderCoupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { redemptions: true } } },
  });
  return coupons.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function getAdminChats(search: string = '', type: string = 'resume', page: number = 1) {
  const PAGE_SIZE = 25;
  const where: any = { builderType: type };
  
  if (search) {
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const users = await client.users.getUserList({ query: search });
    const userIds = users.data.map(u => u.id);
    if (userIds.length === 0) {
      return { sessions: [], total: 0, page, pageSize: PAGE_SIZE };
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

  mergedList.sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());

  const total = mergedList.length;
  if (total === 0) {
    return { sessions: [], total, page, pageSize: PAGE_SIZE };
  }

  const paginated = mergedList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const uniqueUserIds = Array.from(new Set(firstTurns.map(t => t.userId).filter(Boolean))) as string[];
  const userMap = await lookupClerkUsers(uniqueUserIds);

  const sessions = paginated
    .map((g) => {
      const firstSessionId = g.sessionIds[g.sessionIds.length - 1];
      const first = firstBySession.get(firstSessionId);
      if (!first) return null;
      
      const clerkData = g.userId ? userMap.get(g.userId) : null;
      const student = clerkData ? { id: g.userId, name: clerkData.name, email: clerkData.email } : null;

      return {
        sessionId: g.sessionIds.join(','),
        turnCount: g.turnCount,
        startedAt: g.startedAt.toISOString(),
        lastAt: g.lastAt.toISOString(),
        firstMessage: first.userMessage,
        student: student || { id: 'unknown', name: 'Anonymous', email: 'N/A' },
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  return {
    sessions,
    total,
    page,
    pageSize: PAGE_SIZE,
  };
}
