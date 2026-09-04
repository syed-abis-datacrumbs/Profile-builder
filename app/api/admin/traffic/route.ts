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

  return NextResponse.json({
    gaConfig,
    realtime,
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
