"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const COOLDOWN_MS = 60_000;
const TICK_MS = 10_000;

function refreshedLabel(elapsedMs: number): string {
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 1) return "gerade aktualisiert";
  return `vor ${minutes} Min. aktualisiert`;
}

export function CreatorStatsRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [refreshedAt, setRefreshedAt] = useState(() => Date.now());
  const [now, setNow] = useState(refreshedAt);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const elapsed = now - refreshedAt;
  const coolingDown = elapsed < COOLDOWN_MS;
  const disabled = isPending || coolingDown;

  function refresh() {
    const stamp = Date.now();
    setRefreshedAt(stamp);
    setNow(stamp);
    startTransition(() => router.refresh());
  }

  return (
    <span className="-ml-2.5 inline-flex items-center gap-1 self-center">
      <button
        type="button"
        onClick={refresh}
        disabled={disabled}
        aria-label="Zahlen aktualisieren"
        title={coolingDown && !isPending ? "Gleich wieder möglich" : "Zahlen aktualisieren"}
        className="grid h-10 w-10 place-items-center rounded-full text-waldgruen/70 transition-colors hover:bg-waldgruen/8 hover:text-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen disabled:cursor-default disabled:text-warmgrau/35 disabled:hover:bg-transparent"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className={isPending ? "animate-spin motion-reduce:animate-none" : undefined}
        >
          <path
            d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M15.5 2.5v3.2h-3.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span className="font-body text-xs text-warmgrau/60">
        {isPending ? "wird aktualisiert" : refreshedLabel(elapsed)}
      </span>
    </span>
  );
}
