export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-YFE2YP3K1L';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Track pageviews
export function pageview(url: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: url,
      send_to: GA_MEASUREMENT_ID,
    });
  }
}

// Track generic custom events
export function trackEvent({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
}

// Track specific tool switches (Resume, GitHub, LinkedIn, Job Hunting)
export function trackToolSwitch(tool: string) {
  trackEvent({
    action: 'tool_switch',
    category: 'Navigation',
    label: tool,
  });
}
