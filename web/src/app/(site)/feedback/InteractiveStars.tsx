"use client";

import { useState, useCallback, useRef } from "react";

interface InteractiveStarsProps {
  value: number;
  onChange: (n: number) => void;
  size?: "lg" | "xl";
}

export function InteractiveStars({ value, onChange, size = "xl" }: InteractiveStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const display = hovered ?? value;
  const px = size === "xl" ? "text-5xl" : "text-4xl";

  const focusStar = useCallback((n: number) => {
    const clamped = Math.max(1, Math.min(5, n));
    buttonsRef.current[clamped - 1]?.focus();
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="Sterne-Bewertung"
      className="inline-flex items-center gap-1.5"
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            ref={(el) => {
              buttonsRef.current[n - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? "Stern" : "Sterne"} von 5`}
            // WAI-ARIA radiogroup: only the selected option is in the tab
            // order; arrow keys cycle through the rest.
            tabIndex={value === n ? 0 : -1}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onFocus={() => setHovered(n)}
            onBlur={() => setHovered(null)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                const next = Math.min(5, value + 1);
                onChange(next);
                focusStar(next);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                const prev = Math.max(1, value - 1);
                onChange(prev);
                focusStar(prev);
              } else if (e.key === "Home") {
                e.preventDefault();
                onChange(1);
                focusStar(1);
              } else if (e.key === "End") {
                e.preventDefault();
                onChange(5);
                focusStar(5);
              }
            }}
            className={[
              px,
              "leading-none select-none transition-all duration-200 ease-out",
              "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen",
              "rounded-sm cursor-pointer",
              filled ? "text-[#D4A017]" : "text-warmgrau/25",
              hovered !== null && n <= hovered ? "scale-110 drop-shadow-sm" : "",
            ].join(" ")}
          >
            <span aria-hidden="true">{filled ? "★" : "☆"}</span>
          </button>
        );
      })}
    </div>
  );
}
