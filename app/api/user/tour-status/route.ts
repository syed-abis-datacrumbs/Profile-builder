import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized } from '@/lib/apiResponse';

export const runtime = 'nodejs';

/**
 * GET /api/user/tour-status
 * Check if the authenticated user has completed/dismissed the welcome tour in DB.
 */
export async function GET() {
  const clerk = await currentUser();
  if (!clerk) return apiUnauthorized('Not authenticated');

  const userId = clerk.id;
  const profile = await db.resumeProfile.findUnique({
    where: { userId },
    select: { tourSeen: true },
  });

  return apiSuccess({
    tourSeen: profile?.tourSeen ?? false,
  });
}

/**
 * POST /api/user/tour-status
 * Persistently mark the welcome tour as completed/seen in the PostgreSQL database.
 */
export async function POST() {
  const clerk = await currentUser();
  if (!clerk) return apiUnauthorized('Not authenticated');

  const userId = clerk.id;

  await db.resumeProfile.upsert({
    where: { userId },
    create: {
      userId,
      tourSeen: true,
    },
    update: {
      tourSeen: true,
    },
  });

  return apiSuccess({
    success: true,
    tourSeen: true,
  });
}
