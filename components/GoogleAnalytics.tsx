'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { GA_MEASUREMENT_ID, pageview } from '@/lib/gtag';

function getVisitorSession() {
  if (typeof window === 'undefined') return { visitorId: '', sessionId: '' };
  let visitorId = '';
  try {
    visitorId = localStorage.getItem('dc_pb_vid') || '';
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('dc_pb_vid', visitorId);
    }
  } catch (_) {
    visitorId = 'v_' + Math.random().toString(36).substring(2, 11);
  }

  let sessionId = '';
  try {
    sessionId = sessionStorage.getItem('dc_pb_sid') || '';
    if (!sessionId) {
      sessionId = 's_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      sessionStorage.setItem('dc_pb_sid', sessionId);
    }
  } catch (_) {
    sessionId = 's_' + Math.random().toString(36).substring(2, 11);
  }

  return { visitorId, sessionId };
}

function sendPulse(url: string, tool: string) {
  const { visitorId, sessionId } = getVisitorSession();
  if (!visitorId || !sessionId) return;

  const device = /Mobi|Android|iPhone/i.test(navigator.userAgent)
    ? 'Mobile'
    : /iPad|Tablet/i.test(navigator.userAgent)
    ? 'Tablet'
    : 'Desktop';

  let timeZone = '';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch (_) {}

  fetch('/api/traffic/pulse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      visitorId,
      path: url,
      tool,
      device,
      timeZone,
    }),
    keepalive: true,
  }).catch(() => {});
}

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const searchStr = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    const url = pathname + searchStr;
    const tool = searchParams?.get('tool') || (pathname?.startsWith('/admin') ? 'admin' : 'home');

    // 1. Fire GA4 pageview
    if (GA_MEASUREMENT_ID) {
      pageview(url);
    }

    // 2. Fire real-time in-app pulse
    sendPulse(url, tool);

    // 3. Heartbeat pulse every 40s while tab is visible
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendPulse(url, tool);
      }
    }, 40000);

    return () => clearInterval(timer);
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname + window.location.search,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}
