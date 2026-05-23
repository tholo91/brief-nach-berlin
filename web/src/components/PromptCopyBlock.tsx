"use client";

import { Fragment, useState } from "react";

interface PromptCopyBlockProps {
  text: string;
  /** Exact line strings (after trim) to render in bold for visual emphasis. Paste output stays plain. */
  boldLines?: string[];
}

export function PromptCopyBlock({ text, boldLines }: PromptCopyBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const boldSet = new Set((boldLines ?? []).map((l) => l.trim()));
  const lines = text.split("\n");

  return (
    <div className="group relative bg-white border border-warmgrau/20 rounded-sm shadow-sm">
      <button
        onClick={handleCopy}
        aria-label={copied ? "Kopiert" : "Prompt kopieren"}
        className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded bg-white/80 md:bg-transparent hover:bg-waldgruen/10 text-waldgruen/60 hover:text-waldgruen"
      >
        {copied ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3.5 9.5l4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="6" y="6" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 6V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v6.5A1.5 1.5 0 004 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </button>
      <pre className="font-typewriter text-sm text-warmgrau leading-relaxed whitespace-pre-wrap break-words p-6 pr-10">
        {lines.map((line, i) => (
          <Fragment key={i}>
            {boldSet.has(line.trim()) ? (
              <strong className="font-bold text-waldgruen-dark">{line}</strong>
            ) : (
              line
            )}
            {i < lines.length - 1 ? "\n" : ""}
          </Fragment>
        ))}
      </pre>
    </div>
  );
}
