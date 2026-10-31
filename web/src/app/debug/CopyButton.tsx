"use client";

import { useState } from "react";

const SLOT = "col-start-1 row-start-1 inline-flex items-center gap-1.5";

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2500);
  }

  const done = state === "done";

  return (
    <button
      type="button"
      onClick={copy}
      className={[
        "inline-grid rounded-lg border border-waldgruen px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen",
        done ? "bg-waldgruen text-white" : "text-waldgruen-dark hover:bg-waldgruen hover:text-white",
      ].join(" ")}
    >
      {/* Beide Zustände liegen übereinander, damit die Breite nicht springt. */}
      <span className={`${SLOT} ${done ? "invisible" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {state === "failed" ? "Kopieren nicht möglich" : label}
      </span>
      <span className={`${SLOT} justify-center ${done ? "" : "invisible"}`}>
        <span className="size-4">
          {done && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path className="draw-check" pathLength={1} d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        Kopiert
      </span>
      <span className="sr-only" aria-live="polite">
        {done ? "In die Zwischenablage kopiert" : ""}
      </span>
    </button>
  );
}
