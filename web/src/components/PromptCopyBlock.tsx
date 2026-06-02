"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

interface Annotation {
  /** Exact line text (trimmed) to anchor the post-it to. */
  anchorLine: string;
  /** Post-it label, supports `\n` for line breaks. */
  label: string;
  side: "left" | "right";
  tone?: "yellow" | "pink" | "green";
  /** Vertical offset from anchor line center (px). Positive = down. */
  offsetY?: number;
  /** Horizontal offset toward the prompt (px). Positive = closer to/over prompt. */
  offsetX?: number;
  /** Smaller post-it for secondary callouts. */
  compact?: boolean;
  /** Render arrow pointing at the anchor. Defaults to true. */
  arrow?: boolean;
  /** Override the default rotation (Tailwind class, e.g. "-rotate-6"). */
  rotateClass?: string;
}

interface PromptCopyBlockProps {
  text: string;
  /** Exact line strings (after trim) to render in bold for visual emphasis. Paste output stays plain. */
  boldLines?: string[];
  annotations?: Annotation[];
}

const TONE_STYLES = {
  yellow: {
    bg: "bg-[#FFE680]",
    ink: "text-[#5a4a00]",
    tape: "bg-[#FFD43B]/70",
    arrow: "#5a4a00",
  },
  pink: {
    bg: "bg-[#FFB4A2]",
    ink: "text-[#7a2e1f]",
    tape: "bg-[#E29578]/70",
    arrow: "#7a2e1f",
  },
  green: {
    bg: "bg-[#B7E4C7]",
    ink: "text-waldgruen-dark",
    tape: "bg-waldgruen/40",
    arrow: "#1B4332",
  },
} as const;

export function PromptCopyBlock({ text, boldLines, annotations }: PromptCopyBlockProps) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const [anchorTops, setAnchorTops] = useState<Record<string, number>>({});

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  useLayoutEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const next: Record<string, number> = {};
      anchorRefs.current.forEach((el, key) => {
        const rect = el.getBoundingClientRect();
        next[key] = rect.top - containerTop + rect.height / 2;
      });
      setAnchorTops(next);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [text, annotations]);

  const boldSet = new Set((boldLines ?? []).map((l) => l.trim()));
  const anchorSet = new Set((annotations ?? []).map((a) => a.anchorLine.trim()));
  const lines = text.split("\n");

  return (
    <div ref={containerRef} className="relative">
      <div className="group relative bg-white border border-warmgrau/20 rounded-sm shadow-sm">
        <button
          onClick={handleCopy}
          aria-label={copied ? "Kopiert" : "Prompt kopieren"}
          className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded bg-white/80 md:bg-transparent hover:bg-waldgruen/10 text-waldgruen/60 hover:text-waldgruen"
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
          {lines.map((line, i) => {
            const trimmed = line.trim();
            const isBold = boldSet.has(trimmed);
            const isAnchor = anchorSet.has(trimmed);
            const inner = isBold ? (
              <strong className="font-bold text-waldgruen-dark">{line}</strong>
            ) : (
              line
            );
            const content = isAnchor ? (
              <span
                ref={(el) => {
                  if (el) anchorRefs.current.set(trimmed, el);
                }}
              >
                {inner}
              </span>
            ) : (
              inner
            );
            return (
              <Fragment key={i}>
                {content}
                {i < lines.length - 1 ? "\n" : ""}
              </Fragment>
            );
          })}
        </pre>
      </div>

      {(annotations ?? []).map((a, idx) => {
        const key = a.anchorLine.trim();
        const top = anchorTops[key];
        if (top === undefined) return null;
        const isLeft = a.side === "left";
        const tone = TONE_STYLES[a.tone ?? (isLeft ? "yellow" : "pink")];
        const labelLines = a.label.split("\n");
        const showArrow = a.arrow !== false;
        const compact = a.compact === true;
        const offsetX = a.offsetX ?? 0;
        const translateX = isLeft ? offsetX : -offsetX;
        const rotateClass =
          a.rotateClass ?? (isLeft ? "-rotate-3" : "rotate-3");
        const stickyClass = compact
          ? "w-32 px-3 py-2.5 font-handwriting text-base leading-tight"
          : "w-44 px-4 py-4 font-handwriting text-xl leading-tight";
        return (
          <div
            key={`${key}-${idx}`}
            className="hidden lg:flex absolute items-center gap-2 pointer-events-none"
            style={{
              top: `${top + (a.offsetY ?? 0)}px`,
              transform: `translate(${translateX}px, -50%)`,
              zIndex: compact ? 2 : 1,
              ...(isLeft
                ? { right: "100%", paddingRight: "8px", flexDirection: "row" }
                : { left: "100%", paddingLeft: "8px", flexDirection: "row-reverse" }),
            }}
          >
            <div
              className={`${stickyClass} ${tone.bg} ${tone.ink} ${rotateClass} shadow-[4px_6px_18px_-6px_rgba(0,0,0,0.35)] relative pointer-events-auto`}
            >
              <div
                className={`absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-3.5 ${tone.tape} rotate-2 opacity-80`}
                aria-hidden="true"
              />
              {labelLines.map((l, lineIdx) => (
                <Fragment key={lineIdx}>
                  {l}
                  {lineIdx < labelLines.length - 1 ? <br /> : null}
                </Fragment>
              ))}
            </div>
            {showArrow ? (
              <svg
                width="72"
                height="40"
                viewBox="0 0 72 40"
                fill="none"
                aria-hidden="true"
                className={isLeft ? "" : "-scale-x-100"}
              >
                <path
                  d="M 4 20 Q 30 4 56 24"
                  stroke={tone.arrow}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 56 24 L 50 19 M 56 24 L 60 17"
                  stroke={tone.arrow}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
