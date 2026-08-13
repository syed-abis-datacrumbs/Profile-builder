import { getCurrentUserId } from '../../../../lib/serverAuth';
import { db } from '../../../../lib/db';
import { PAYMENT_TESTING_MODE } from '../../../../lib/paymentConfig';

export async function GET() {
  // Testing: always report "not unlocked" so the watermark/download-block
  // and payment prompt stay available on every load, letting the flow be
  // re-tested repeatedly without cleaning up rows. Mirrors LMS's
  // hasCvDownloadAccess().
  if (PAYMENT_TESTING_MODE) return Response.json({ unlocked: false });

  const userId = await getCurrentUserId();
  if (!userId) return Response.json({ unlocked: false });

  const unlock = await db.paymentUnlock.findUnique({ where: { userId } });
  return Response.json({ unlocked: !!unlock });
}
