"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

const EXCLUDED_PATHS = ["/feedback", "/rueckmeldung", "/debug", "/datenloeschen", "/kampagne/verwalten"];

function stripSensitiveUrl(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);
    if (EXCLUDED_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) return null;
    return { ...event, url: url.origin + url.pathname };
  } catch {
    return null;
  }
}

// Wrapped because beforeSend must be a client function (not serializable from
// the Server Component layout). Token/PII routes are dropped; all other
// events lose query and hash.
export function AnalyticsWrapper() {
  return <Analytics beforeSend={stripSensitiveUrl} />;
}
