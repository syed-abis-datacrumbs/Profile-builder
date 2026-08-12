import { auth } from '@clerk/nextjs/server';

/** Current signed-in user's Clerk ID, or null if signed out. */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
