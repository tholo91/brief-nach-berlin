"use client";

import { useState } from "react";

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

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-waldgruen px-3 py-1.5 text-sm font-semibold text-waldgruen-dark transition-colors hover:bg-waldgruen hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
    >
      <span aria-live="polite">
        {state === "done" ? "Kopiert" : state === "failed" ? "Kopieren nicht möglich" : label}
      </span>
    </button>
  );
}
