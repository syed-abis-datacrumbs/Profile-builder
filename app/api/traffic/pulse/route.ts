import { NextRequest, NextResponse } from 'next/server';
import { recordVisitorPulse, resolveLocationFromHeaders } from '@/lib/realtimeTraffic';

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
      return NextResponse.json({ ok: false, message: 'Missing session or visitor ID' }, { status: 400 });
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

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Traffic Pulse API] Error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
