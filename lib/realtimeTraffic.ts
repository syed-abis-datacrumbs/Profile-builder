import { db } from '@/lib/db';

export const COUNTRY_META: Record<string, { name: string; flag: string }> = {
  PK: { name: 'Pakistan', flag: '🇵🇰' },
  US: { name: 'United States', flag: '🇺🇸' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  IN: { name: 'India', flag: '🇮🇳' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  AE: { name: 'United Arab Emirates', flag: '🇦🇪' },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦' },
  DE: { name: 'Germany', flag: '🇩🇪' },
  FR: { name: 'France', flag: '🇫🇷' },
  AU: { name: 'Australia', flag: '🇦🇺' },
  SG: { name: 'Singapore', flag: '🇸🇬' },
  MY: { name: 'Malaysia', flag: '🇲🇾' },
  BD: { name: 'Bangladesh', flag: '🇧🇩' },
  NG: { name: 'Nigeria', flag: '🇳🇬' },
  EG: { name: 'Egypt', flag: '🇪🇬' },
  TR: { name: 'Turkey', flag: '🇹🇷' },
  QA: { name: 'Qatar', flag: '🇶🇦' },
  KW: { name: 'Kuwait', flag: '🇰🇼' },
  OM: { name: 'Oman', flag: '🇴🇲' },
  BH: { name: 'Bahrain', flag: '🇧🇭' },
  NL: { name: 'Netherlands', flag: '🇳🇱' },
  SE: { name: 'Sweden', flag: '🇸🇪' },
  CH: { name: 'Switzerland', flag: '🇨🇭' },
  IE: { name: 'Ireland', flag: '🇮🇪' },
  ES: { name: 'Spain', flag: '🇪🇸' },
  IT: { name: 'Italy', flag: '🇮🇹' },
  BR: { name: 'Brazil', flag: '🇧🇷' },
  JP: { name: 'Japan', flag: '🇯🇵' },
  KR: { name: 'South Korea', flag: '🇰🇷' },
  ZA: { name: 'South Africa', flag: '🇿🇦' },
  NZ: { name: 'New Zealand', flag: '🇳🇿' },
};

const TIMEZONE_TO_COUNTRY: Record<string, { code: string; name: string; flag: string }> = {
  'Asia/Karachi': { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  'Asia/Kolkata': { code: 'IN', name: 'India', flag: '🇮🇳' },
  'Asia/Calcutta': { code: 'IN', name: 'India', flag: '🇮🇳' },
  'Asia/Dubai': { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  'Asia/Riyadh': { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  'Asia/Dhaka': { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  'Asia/Singapore': { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  'Asia/Kuala_Lumpur': { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  'Asia/Tokyo': { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  'Asia/Seoul': { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  'Asia/Qatar': { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  'Asia/Kuwait': { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  'Europe/London': { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  'Europe/Berlin': { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  'Europe/Paris': { code: 'FR', name: 'France', flag: '🇫🇷' },
  'Europe/Amsterdam': { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  'Europe/Dublin': { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  'Europe/Rome': { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  'Europe/Madrid': { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  'Europe/Istanbul': { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  'America/New_York': { code: 'US', name: 'United States', flag: '🇺🇸' },
  'America/Chicago': { code: 'US', name: 'United States', flag: '🇺🇸' },
  'America/Los_Angeles': { code: 'US', name: 'United States', flag: '🇺🇸' },
  'America/Denver': { code: 'US', name: 'United States', flag: '🇺🇸' },
  'America/Toronto': { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  'America/Vancouver': { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  'Australia/Sydney': { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  'Australia/Melbourne': { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  'Africa/Cairo': { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  'Africa/Lagos': { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  'Africa/Johannesburg': { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
};

export function resolveLocationFromHeaders(headers: Headers, clientTimeZone?: string) {
  // Check standard CDN & cloud proxy headers
  const countryHeader =
    headers.get('cf-ipcountry') ||
    headers.get('x-vercel-ip-country') ||
    headers.get('x-country') ||
    headers.get('cloudfront-viewer-country') ||
    null;

  if (countryHeader && countryHeader.length === 2) {
    const code = countryHeader.toUpperCase();
    const meta = COUNTRY_META[code] || { name: code, flag: '🌐' };
    return {
      country: meta.name,
      countryCode: code,
      flag: meta.flag,
    };
  }

  // Fallback to client-side timezone if available
  if (clientTimeZone && TIMEZONE_TO_COUNTRY[clientTimeZone]) {
    const mapped = TIMEZONE_TO_COUNTRY[clientTimeZone];
    return {
      country: mapped.name,
      countryCode: mapped.code,
      flag: mapped.flag,
    };
  }

  // Generic default for unknown/localhost
  return {
    country: 'Global Visitor',
    countryCode: 'XX',
    flag: '🌍',
  };
}

let tableInitialized = false;

export async function ensureTrafficTable() {
  if (tableInitialized) return;
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS profile_builder_visitor_sessions (
        id VARCHAR(64) PRIMARY KEY,
        visitor_id VARCHAR(64) NOT NULL,
        path VARCHAR(255) NOT NULL DEFAULT '/',
        tool VARCHAR(64) NOT NULL DEFAULT 'home',
        country VARCHAR(100) NOT NULL DEFAULT 'Unknown',
        country_code VARCHAR(10) NOT NULL DEFAULT 'XX',
        city VARCHAR(100),
        device VARCHAR(32) NOT NULL DEFAULT 'Desktop',
        browser VARCHAR(64),
        ip VARCHAR(64),
        last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_pb_sessions_last_active ON profile_builder_visitor_sessions(last_active);
      CREATE INDEX IF NOT EXISTS idx_pb_sessions_tool ON profile_builder_visitor_sessions(tool);
    `);
    tableInitialized = true;
  } catch (err) {
    console.error('[Traffic] Failed to ensure visitor sessions table:', err);
  }
}

export async function recordVisitorPulse(data: {
  sessionId: string;
  visitorId: string;
  path: string;
  tool: string;
  country: string;
  countryCode: string;
  city?: string | null;
  device: string;
  browser?: string | null;
  ip?: string | null;
}) {
  await ensureTrafficTable();

  try {
    await db.$executeRawUnsafe(
      `
      INSERT INTO profile_builder_visitor_sessions (
        id, visitor_id, path, tool, country, country_code, city, device, browser, ip, last_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        path = EXCLUDED.path,
        tool = EXCLUDED.tool,
        country = CASE WHEN profile_builder_visitor_sessions.country = 'Global Visitor' AND EXCLUDED.country <> 'Global Visitor' THEN EXCLUDED.country ELSE profile_builder_visitor_sessions.country END,
        country_code = CASE WHEN profile_builder_visitor_sessions.country_code = 'XX' AND EXCLUDED.country_code <> 'XX' THEN EXCLUDED.country_code ELSE profile_builder_visitor_sessions.country_code END,
        device = EXCLUDED.device,
        last_active = NOW();
      `,
      data.sessionId,
      data.visitorId,
      data.path.substring(0, 255),
      data.tool.substring(0, 64),
      data.country.substring(0, 100),
      data.countryCode.substring(0, 10),
      data.city ? data.city.substring(0, 100) : null,
      data.device.substring(0, 32),
      data.browser ? data.browser.substring(0, 64) : null,
      data.ip ? data.ip.substring(0, 64) : null
    );

    // Light prune randomly (1 in 50 pulses) to keep DB clean without overhead
    if (Math.random() < 0.02) {
      db.$executeRawUnsafe(`
        DELETE FROM profile_builder_visitor_sessions WHERE last_active < NOW() - INTERVAL '24 hours';
      `).catch(() => {});
    }
  } catch (err) {
    console.error('[Traffic] Pulse recording error:', err);
  }
}

export type RealtimeStats = {
  activeNow: number;
  active30m: number;
  activeToday: number;
  countries: Array<{
    country: string;
    countryCode: string;
    flag: string;
    count: number;
    pct: number;
  }>;
  tools: Array<{
    tool: string;
    label: string;
    count: number;
    pct: number;
  }>;
  devices: Array<{
    device: string;
    count: number;
    pct: number;
  }>;
  recentVisitors: Array<{
    id: string;
    path: string;
    tool: string;
    country: string;
    countryCode: string;
    flag: string;
    device: string;
    lastActive: string;
  }>;
};

export async function getRealtimeTrafficStats(): Promise<RealtimeStats> {
  await ensureTrafficTable();

  try {
    // 1. Active counts
    const activeNowResult: any = await db.$queryRawUnsafe(`
      SELECT COUNT(DISTINCT visitor_id)::int AS count
      FROM profile_builder_visitor_sessions
      WHERE last_active >= NOW() - INTERVAL '5 minutes';
    `);

    const active30mResult: any = await db.$queryRawUnsafe(`
      SELECT COUNT(DISTINCT visitor_id)::int AS count
      FROM profile_builder_visitor_sessions
      WHERE last_active >= NOW() - INTERVAL '30 minutes';
    `);

    const activeTodayResult: any = await db.$queryRawUnsafe(`
      SELECT COUNT(DISTINCT visitor_id)::int AS count
      FROM profile_builder_visitor_sessions
      WHERE last_active >= CURRENT_DATE;
    `);

    const activeNow = activeNowResult[0]?.count ?? 0;
    const active30m = active30mResult[0]?.count ?? 0;
    const activeToday = activeTodayResult[0]?.count ?? 0;

    // 2. Countries (last 30m)
    const countriesResult: any = await db.$queryRawUnsafe(`
      SELECT country, country_code, COUNT(DISTINCT visitor_id)::int AS count
      FROM profile_builder_visitor_sessions
      WHERE last_active >= NOW() - INTERVAL '30 minutes'
      GROUP BY country, country_code
      ORDER BY count DESC
      LIMIT 10;
    `);

    const totalCountryCount = (countriesResult as any[]).reduce((sum, c) => sum + (c.count || 0), 0) || 1;
    const countries = (countriesResult as any[]).map((c) => {
      const meta = COUNTRY_META[c.country_code] || { flag: '🌍', name: c.country };
      return {
        country: c.country,
        countryCode: c.country_code,
        flag: meta.flag,
        count: Number(c.count || 0),
        pct: Math.round(((c.count || 0) / totalCountryCount) * 100),
      };
    });

    // 3. Tools (last 30m)
    const toolsResult: any = await db.$queryRawUnsafe(`
      SELECT tool, COUNT(DISTINCT visitor_id)::int AS count
      FROM profile_builder_visitor_sessions
      WHERE last_active >= NOW() - INTERVAL '30 minutes'
      GROUP BY tool
      ORDER BY count DESC;
    `);

    const TOOL_LABELS: Record<string, string> = {
      resume: 'Resume AI Studio',
      github: 'GitHub README AI',
      linkedin: 'LinkedIn Studio',
      jobhunting: 'Job Hunting',
      home: 'Landing / Home',
      admin: 'Admin Console',
    };

    const totalToolCount = (toolsResult as any[]).reduce((sum, t) => sum + (t.count || 0), 0) || 1;
    const tools = (toolsResult as any[]).map((t) => ({
      tool: t.tool,
      label: TOOL_LABELS[t.tool] || t.tool,
      count: Number(t.count || 0),
      pct: Math.round(((t.count || 0) / totalToolCount) * 100),
    }));

    // 4. Devices (last 30m)
    const devicesResult: any = await db.$queryRawUnsafe(`
      SELECT device, COUNT(DISTINCT visitor_id)::int AS count
      FROM profile_builder_visitor_sessions
      WHERE last_active >= NOW() - INTERVAL '30 minutes'
      GROUP BY device
      ORDER BY count DESC;
    `);

    const totalDeviceCount = (devicesResult as any[]).reduce((sum, d) => sum + (d.count || 0), 0) || 1;
    const devices = (devicesResult as any[]).map((d) => ({
      device: d.device || 'Desktop',
      count: Number(d.count || 0),
      pct: Math.round(((d.count || 0) / totalDeviceCount) * 100),
    }));

    // 5. Recent visitors (last 15)
    const recentResult: any = await db.$queryRawUnsafe(`
      SELECT id, path, tool, country, country_code, device, last_active
      FROM profile_builder_visitor_sessions
      ORDER BY last_active DESC
      LIMIT 15;
    `);

    const recentVisitors = (recentResult as any[]).map((r) => {
      const meta = COUNTRY_META[r.country_code] || { flag: '🌍', name: r.country };
      return {
        id: r.id,
        path: r.path,
        tool: TOOL_LABELS[r.tool] || r.tool,
        country: r.country,
        countryCode: r.country_code,
        flag: meta.flag,
        device: r.device || 'Desktop',
        lastActive: r.last_active ? new Date(r.last_active).toISOString() : new Date().toISOString(),
      };
    });

    return {
      activeNow,
      active30m,
      activeToday,
      countries,
      tools,
      devices,
      recentVisitors,
    };
  } catch (err) {
    console.error('[Traffic] Query error:', err);
    return {
      activeNow: 0,
      active30m: 0,
      activeToday: 0,
      countries: [],
      tools: [],
      devices: [],
      recentVisitors: [],
    };
  }
}
