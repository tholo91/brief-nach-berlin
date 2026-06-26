"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicReview } from "@/lib/reviews/types";
import { ReviewCard } from "./ReviewCard";

interface ReviewMarqueeProps {
  reviews: PublicReview[];
  variant?: "full" | "compact";
  limit?: number;
  cardHref?: string;
}

export function ReviewMarquee({
  reviews,
  variant = "full",
  limit = 30,
  cardHref,
}: ReviewMarqueeProps) {
  const items = reviews.slice(0, limit);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expandedKey) return;
    function handleDocClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setExpandedKey(null);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setExpandedKey(null);
    }
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [expandedKey]);

  // Reset CSS animation when tab becomes visible again — browsers pause animations
  // on hidden tabs and resume from the wrong position, causing a visible snap.
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) return;
      const track = containerRef.current?.querySelector<HTMLElement>(".marquee-track");
      if (!track) return;
      track.style.animation = "none";
      // Force reflow so the browser registers the removal before re-applying.
      void track.offsetWidth;
      track.style.animation = "";
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  if (items.length === 0) return null;

  const isPaused = expandedKey !== null;

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 80s linear infinite;
        }
        .marquee-container:hover .marquee-track,
        .marquee-container.is-paused .marquee-track {
          animation-play-state: paused;
        }
        .marquee-fade {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0,
            black 6%,
            black 94%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0,
            black 6%,
            black 94%,
            transparent 100%
          );
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
          .marquee-container {
            overflow-x: auto;
          }
        }
      `}</style>
      <div
        ref={containerRef}
        className={`marquee-container marquee-fade w-full py-6 overflow-x-hidden ${
          isPaused ? "is-paused" : ""
        }`}
        data-variant={variant}
        aria-label="Stimmen aus dem ganzen Land"
      >
        <div className="marquee-track flex gap-5 w-max px-4">
          {[...items, ...items].map((review, index) => {
            const key = `${review.id}-${index}`;
            const isDuplicate = index >= items.length;
            const isThis = expandedKey === key;
            return (
              <button
                key={key}
                type="button"
                tabIndex={isDuplicate ? -1 : 0}
                onClick={(event) => {
                  event.stopPropagation();
                  if (cardHref) {
                    window.open(cardHref, "_blank", "noopener,noreferrer");
                    return;
                  }
                  setExpandedKey(isThis ? null : key);
                }}
                aria-hidden={isDuplicate ? "true" : undefined}
                aria-expanded={cardHref || isDuplicate ? undefined : isThis}
                aria-label={
                  isDuplicate
                    ? undefined
                    : cardHref
                    ? "Alle Bewertungen lesen"
                    : isThis
                      ? "Bewertung schließen"
                      : "Bewertung vollständig lesen"
                }
                className="marquee-snap-item flex text-left rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 focus-visible:ring-offset-creme cursor-pointer"
              >
                <ReviewCard review={review} isExpanded={isThis} />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
