"use client";

import { useState } from "react";

export function CopyTextButton({ text, label = "Text kopieren" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-waldgruen/30 bg-white px-4 py-2 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:bg-waldgruen/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
    >
      <span aria-live="polite">{copied ? "Kopiert" : label}</span>
    </button>
  );
}
