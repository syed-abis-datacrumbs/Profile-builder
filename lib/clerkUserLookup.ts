import { clerkClient } from '@clerk/nextjs/server';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  createdAt: string | null;
}

export function parseClerkDate(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val.toISOString();
  if (typeof val === 'number') {
    // If Unix seconds (< 10000000000), convert to ms
    const ms = val < 10000000000 ? val * 1000 : val;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (typeof val === 'string') {
    const num = Number(val);
    if (!isNaN(num) && num > 1000000000) {
      const ms = num < 10000000000 ? num * 1000 : num;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
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
            (u as any).email_addresses?.[0]?.email_address ||
            'No Email';
          const firstName = u.firstName || (u as any).first_name || '';
          const lastName = u.lastName || (u as any).last_name || '';
          const name = `${firstName} ${lastName}`.trim() || email;

          const rawCreated =
            (u as any).createdAt ??
            (u as any).created_at ??
            (u as any).raw?.created_at ??
            (u as any).raw?.createdAt;

          const createdAt = parseClerkDate(rawCreated);
          map.set(uid, { id: uid, name, email, createdAt });
        } catch {
          map.set(uid, { id: uid, name: 'Unknown User', email: '(Not found in Clerk)', createdAt: null });
        }
      })
    );
  } catch (e) {
    console.error('[lookupClerkUsers] Failed to fetch users from Clerk:', e);
  }

  return map;
}
