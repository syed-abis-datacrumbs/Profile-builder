import { NextRequest } from 'next/server';
import { recordVisitorPulse, resolveLocationFromHeaders } from '@/lib/realtimeTraffic';
import { apiSuccess, apiBadRequest, apiServerError } from '@/lib/apiResponse';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      sessionId,
      visitorId,
      path = '/',
      tool = 'home',
      device = 'Desktop',
      timeZone,
    } = body;

    if (!sessionId || !visitorId) {
      return apiBadRequest('Missing session or visitor ID');
    }

    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || null;

    const location = resolveLocationFromHeaders(req.headers, timeZone);

    // Record in database
    await recordVisitorPulse({
      sessionId,
      visitorId,
      path: typeof path === 'string' ? path : '/',
      tool: typeof tool === 'string' ? tool : 'home',
      country: location.country,
      countryCode: location.countryCode,
      device: typeof device === 'string' ? device : 'Desktop',
      ip: clientIp,
    });

    return apiSuccess({ ok: true });
  } catch (err: any) {
    return apiServerError(err.message, err);
  }
}
