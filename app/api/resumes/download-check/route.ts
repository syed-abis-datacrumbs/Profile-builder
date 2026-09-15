import { currentUser } from '@clerk/nextjs/server';
import { db } from '../../../../lib/db';
import { apiSuccess, apiUnauthorized, apiServerError } from '@/lib/apiResponse';

const MAX_FREE_RESUME_NAME_EDITS = 4;

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return apiUnauthorized('Unauthorized');
    }

    const body = await request.json().catch(() => null);
    const requestedName = (body?.requestedName || '').trim();
    if (!requestedName) {
      return apiSuccess({ allowed: true });
    }

    let profile = await db.resumeProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await db.resumeProfile.create({
        data: { userId: user.id, downloadedNames: [] },
      });
    }

    const downloadedNames: string[] = Array.isArray(profile.downloadedNames) 
      ? (profile.downloadedNames as string[]) 
      : [];

    const requestedNameLower = requestedName.toLowerCase();
    
    // 1. Is this name already in their list of allowed names? (Case-insensitive check)
    const existingIndex = downloadedNames.findIndex((n) => n.toLowerCase() === requestedNameLower);
    
    if (existingIndex !== -1) {
      // Move it to the end so it becomes the "latest" downloaded name
      const exactName = downloadedNames[existingIndex];
      const newDownloadedNames = [
        ...downloadedNames.slice(0, existingIndex),
        ...downloadedNames.slice(existingIndex + 1),
        exactName
      ];

      await db.resumeProfile.update({
        where: { userId: user.id },
        data: { downloadedNames: newDownloadedNames },
      });

      return apiSuccess({
        allowed: true,
        downloadedNames: newDownloadedNames,
      });
    }

    // 2. Not in the list. Do they have slots remaining?
    if (downloadedNames.length < MAX_FREE_RESUME_NAME_EDITS) {
      // Add it to their list
      const newDownloadedNames = [...downloadedNames, requestedName];
      await db.resumeProfile.update({
        where: { userId: user.id },
        data: { downloadedNames: newDownloadedNames },
      });

      return apiSuccess({
        allowed: true,
        newSlotUsed: true,
        slotsRemaining: Math.max(0, MAX_FREE_RESUME_NAME_EDITS - newDownloadedNames.length),
        downloadedNames: newDownloadedNames,
      });
    }

    // 3. No slots remaining. Check if there's a pending request.
    const pendingRequest = await db.resumeNameChangeRequest.findFirst({
      where: { userId: user.id, status: 'PENDING' },
    });

    return apiSuccess({
      allowed: false,
      requestedName,
      downloadedNames,
      pendingRequest: pendingRequest ? {
        requestedName: pendingRequest.requestedName,
        createdAt: pendingRequest.createdAt,
      } : null,
    });

  } catch (error: any) {
    return apiServerError('Internal Server Error', error);
  }
}
