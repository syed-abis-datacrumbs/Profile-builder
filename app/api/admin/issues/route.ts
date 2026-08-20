import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server';

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'OPEN';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const where = { status };

  const [issues, total] = await Promise.all([
    db.profileBuilderIssue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.profileBuilderIssue.count({ where }),
  ]);

  const client = await clerkClient();
  const uniqueUserIds = Array.from(new Set(issues.map(i => i.userId).filter(Boolean))) as string[];
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

  const enrichedIssues = issues.map(i => ({
    ...i,
    user: i.userId ? userMap.get(i.userId) : null,
  }));

  return NextResponse.json({
    issues: enrichedIssues,
    total,
    page,
    pageSize: PAGE_SIZE,
  });
}
