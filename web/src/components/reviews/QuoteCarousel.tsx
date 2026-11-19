"use client";

import { useState, type KeyboardEvent } from "react";
import { StarBar } from "@/components/reviews/RatingStat";
import type { SpreadQuote } from "@/lib/reviews/pickSpreadQuotes";

const buttonClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-waldgruen-dark/30 text-waldgruen-dark transition-colors hover:border-waldgruen-dark hover:bg-waldgruen/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen";

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export function QuoteCarousel({ quotes }: { quotes: SpreadQuote[] }) {
  const [index, setIndex] = useState(0);
  if (quotes.length === 0) return null;

  const total = quotes.length;
  const current = quotes[Math.min(index, total - 1)];
  const go = (step: number) => setIndex((value) => (value + step + total) % total);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  };

  return (
    <section
      aria-roledescription="Karussell"
      aria-label="Stimmen aus dem Feedback"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-waldgruen"
    >
      <div aria-live="polite" aria-atomic="true" className="min-h-56 rounded-2xl bg-surface px-5 py-6 sm:min-h-52 sm:px-8 sm:py-8">
        <figure className="flex h-full flex-col justify-between gap-5">
          <div>
            <span aria-hidden="true" className="block h-10 font-handwriting text-5xl leading-none text-airmail-rot/70">
              „
            </span>
            <blockquote className="font-body text-lg leading-relaxed text-warmgrau sm:text-xl">
              {current.body}
            </blockquote>
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span className="font-typewriter text-sm font-bold text-waldgruen-dark">
              {current.name}
              <span className="font-normal text-warmgrau/70">, {current.monthLabel}</span>
            </span>
            <span className="flex items-center">
              <span aria-hidden="true">
                <StarBar rating={current.rating} size="sm" />
              </span>
              <span className="sr-only">{current.rating} von 5 Sternen</span>
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="font-body text-sm tabular-nums text-warmgrau/80">
          {Math.min(index, total - 1) + 1} von {total}
        </p>
        <div className="flex gap-3">
          <button type="button" aria-label="Vorherige Stimme" onClick={() => go(-1)} className={buttonClass}>
            <Arrow direction="left" />
          </button>
          <button type="button" aria-label="Nächste Stimme" onClick={() => go(1)} className={buttonClass}>
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}
