import { currentUser } from '@clerk/nextjs/server';
import { isUserAdmin } from '@/lib/adminAuth';
import { apiSuccess } from '@/lib/apiResponse';

export async function GET() {
  const user = await currentUser();
  const adminStatus = await isUserAdmin(user);
  return apiSuccess({ isAdmin: adminStatus });
}
