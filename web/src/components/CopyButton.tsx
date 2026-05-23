"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  labelCopied?: string;
}

export function CopyButton({
  text,
  label = "Prompt kopieren",
  labelCopied = "Kopiert!",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-5 py-3 rounded-sm font-typewriter text-sm font-semibold tracking-wide transition-colors bg-waldgruen text-creme hover:bg-waldgruen-dark active:scale-95"
    >
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {labelCopied}
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
