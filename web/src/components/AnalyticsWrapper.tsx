"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

const EXCLUDED_PATHS = ["/feedback", "/rueckmeldung", "/debug", "/datenloeschen", "/kampagne/verwalten"];

function stripSensitiveUrl(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);
    if (EXCLUDED_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) return null;
    // Nur Kampagnen-Kennungen bleiben (z. B. QR-Sticker), alles andere fällt weg.
    const kept = new URLSearchParams();
    for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
      const value = url.searchParams.get(key);
      if (value && /^[a-z0-9-]{1,40}$/.test(value)) kept.set(key, value);
    }
    const query = kept.toString();
    return { ...event, url: url.origin + url.pathname + (query ? `?${query}` : "") };
  } catch {
    return null;
  }
}

// Wrapped because beforeSend must be a client function (not serializable from
// the Server Component layout). Token/PII routes are dropped; all other
// events lose hash and every query param except utm_source/medium/campaign.
export function AnalyticsWrapper() {
  return <Analytics beforeSend={stripSensitiveUrl} />;
}
