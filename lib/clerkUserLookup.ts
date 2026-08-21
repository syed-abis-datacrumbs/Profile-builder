import { clerkClient } from '@clerk/nextjs/server';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export async function lookupClerkUsers(userIds: string[]): Promise<Map<string, UserSummary>> {
  const map = new Map<string, UserSummary>();
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) return map;

  try {
    const client = await clerkClient();
    await Promise.all(
      uniqueIds.map(async (uid) => {
        try {
          const u = await client.users.getUser(uid);
          const email =
            u.primaryEmailAddress?.emailAddress ||
            u.emailAddresses?.[0]?.emailAddress ||
            'No Email';
          const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || email;
          map.set(uid, { id: uid, name, email });
        } catch {
          map.set(uid, { id: uid, name: 'Unknown User', email: '(Not found in Clerk)' });
        }
      })
    );
  } catch (e) {
    console.error('[lookupClerkUsers] Failed to fetch users from Clerk:', e);
  }

  return map;
}
