"use client";

import { useEffect, useState } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
};

export function CopyButton({ text, label = "Kopieren" }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="rounded-md border border-waldgruen-dark/20 bg-white/80 px-3 py-1.5 font-typewriter text-xs font-bold uppercase tracking-[0.12em] text-waldgruen-dark transition-colors hover:bg-waldgruen-dark hover:text-creme focus:outline-none focus:ring-2 focus:ring-waldgruen/30"
    >
      {state === "copied" ? "Kopiert" : state === "failed" ? "Bitte markieren" : label}
    </button>
  );
}
