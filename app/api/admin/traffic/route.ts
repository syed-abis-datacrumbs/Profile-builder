import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRealtimeTrafficStats } from '@/lib/realtimeTraffic';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  // Compute platform activity aggregates across Resume, GitHub, and LinkedIn tools
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalChats,
    todayChats,
    resumeChats,
    githubChats,
    linkedinChats,
    totalResumes,
    totalGithubSaves,
    totalLinkedinSaves,
    totalUsersCount,
    totalUnlockedCount,
  ] = await Promise.all([
    db.profileBuilderChatLog.count(),
    db.profileBuilderChatLog.count({ where: { createdAt: { gte: startOfToday } } }),
    db.profileBuilderChatLog.count({ where: { builderType: 'resume' } }),
    db.profileBuilderChatLog.count({ where: { builderType: 'github' } }),
    db.profileBuilderChatLog.count({ where: { builderType: 'linkedin' } }),
    db.resumeSave.count(),
    db.githubSave.count(),
    db.linkedinSave.count(),
    db.profileBuilderAiUsage.count(),
    db.paymentUnlock.count(),
  ]);

  // Google Analytics 4 configuration details
  const gaConfig = {
    streamName: 'momentum',
    streamUrl: 'https://momentum.datacrumbs.org',
    links: {
      realtime: 'https://analytics.google.com/analytics/web/#/reports/dashboard',
      acquisition: 'https://analytics.google.com/analytics/web/#/reports/lifecycle-acquisition-overview',
      engagement: 'https://analytics.google.com/analytics/web/#/reports/lifecycle-engagement-overview',
      tech: 'https://analytics.google.com/analytics/web/#/reports/tech-details',
      demographics: 'https://analytics.google.com/analytics/web/#/reports/user-demographics-overview',
    },
  };

  // Fetch real-time active users and geolocations
  const realtime = await getRealtimeTrafficStats();

  // Aggregate ALL verified Momentum (Profile Builder) users across DB tables
  const [
    aiUsers,
    resumeUsers,
    githubUsers,
    linkedinUsers,
    chatUsers,
    unlockUsers,
    couponUsers,
    nameReqUsers,
  ] = await Promise.all([
    db.profileBuilderAiUsage.findMany({ select: { userId: true, createdAt: true } }),
    db.resumeSave.findMany({ select: { userId: true, createdAt: true } }),
    db.githubSave.findMany({ select: { userId: true, createdAt: true } }),
    db.linkedinSave.findMany({ select: { userId: true, createdAt: true } }),
    db.profileBuilderChatLog.findMany({ where: { userId: { not: null } }, select: { userId: true, createdAt: true } }),
    db.paymentUnlock.findMany({ select: { userId: true, unlockedAt: true } }),
    db.profileBuilderCouponRedemption.findMany({ select: { userId: true, redeemedAt: true } }),
    db.resumeNameChangeRequest.findMany({ select: { userId: true, createdAt: true } }),
  ]);

  const momentumUserFirstSeen = new Map<string, Date>();

  const trackUserTime = (userId: string | null, date: Date | null | undefined) => {
    if (!userId || !date) return;
    const existing = momentumUserFirstSeen.get(userId);
    if (!existing || date.getTime() < existing.getTime()) {
      momentumUserFirstSeen.set(userId, date);
    }
  };

  aiUsers.forEach((u) => trackUserTime(u.userId, u.createdAt));
  resumeUsers.forEach((u) => trackUserTime(u.userId, u.createdAt));
  githubUsers.forEach((u) => trackUserTime(u.userId, u.createdAt));
  linkedinUsers.forEach((u) => trackUserTime(u.userId, u.createdAt));
  chatUsers.forEach((u) => trackUserTime(u.userId, u.createdAt));
  unlockUsers.forEach((u) => trackUserTime(u.userId, u.unlockedAt));
  couponUsers.forEach((u) => trackUserTime(u.userId, u.redeemedAt));
  nameReqUsers.forEach((u) => trackUserTime(u.userId, u.createdAt));

  // If a Clerk account creation date exists for these Momentum users, refine to their exact signup date
  try {
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ limit: 500, orderBy: '-created_at' });
    
    for (const u of clerkUsers.data) {
      if (momentumUserFirstSeen.has(u.id)) {
        const createdMs = typeof u.createdAt === 'number' ? u.createdAt : new Date(u.createdAt).getTime();
        const clerkCreatedDate = new Date(createdMs);
        trackUserTime(u.id, clerkCreatedDate);
      }
    }
  } catch (err) {
    console.warn('[Traffic] Clerk refinement skipped:', err);
  }

  const totalMomentumUsers = momentumUserFirstSeen.size;

  // Build 30 days map for Momentum signups
  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dayMap.set(key, 0);
  }

  for (const [, firstDate] of momentumUserFirstSeen.entries()) {
    const key = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}-${String(firstDate.getDate()).padStart(2, '0')}`;
    if (dayMap.has(key)) {
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    }
  }

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const signupDays = Array.from(dayMap.entries()).map(([dateStr, count]) => {
    const [, m, d] = dateStr.split('-');
    const monthName = MONTH_NAMES[parseInt(m, 10) - 1] || m;
    return {
      date: dateStr,
      label: `${monthName} ${parseInt(d, 10)}`,
      count,
    };
  });

  // Calculate summary metrics
  const last7 = signupDays.slice(-7);
  const last14 = signupDays.slice(-14);
  const signups7d = last7.reduce((sum, d) => sum + d.count, 0);
  const signups14d = last14.reduce((sum, d) => sum + d.count, 0);
  const signups30d = signupDays.reduce((sum, d) => sum + d.count, 0);

  let peakDay = { label: 'None', count: 0 };
  for (const d of signupDays) {
    if (d.count > peakDay.count) {
      peakDay = { label: d.label, count: d.count };
    }
  }

  const averageDaily = Number((signups30d / 30).toFixed(1));

  return NextResponse.json({
    gaConfig,
    realtime,
    signups: {
      totalUsers: totalMomentumUsers,
      signups7d,
      signups14d,
      signups30d,
      peakDay,
      averageDaily,
      days: signupDays,
    },
    stats: {
      totalChats,
      todayChats,
      resumeChats,
      githubChats,
      linkedinChats,
      totalResumes,
      totalGithubSaves,
      totalLinkedinSaves,
      totalUsersCount,
      totalUnlockedCount,
    },
  });
}
