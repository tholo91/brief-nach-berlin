"use client";

import { Analytics } from "@vercel/analytics/next";

// Wrapped because beforeSend must be a function (not serializable from
// the Server Component layout). We strip any event whose URL points at
// /feedback so the signed token in ?t=... never reaches Vercel Analytics.
export function AnalyticsWrapper() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          const url = new URL(event.url);
          if (url.pathname.startsWith("/feedback")) return null;
        } catch {
          // If the URL can't be parsed, fall through and send the event.
        }
        return event;
      }}
    />
  );
}
