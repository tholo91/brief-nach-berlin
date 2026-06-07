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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = containerRef.current;
    if (!container) return;

    let currentIndex = 0;
    let timer: ReturnType<typeof setInterval> | null = null;
    let isVisible = false;

    const advance = () => {
      const snaps =
        container.querySelectorAll<HTMLElement>(".marquee-snap-item");
      if (!snaps.length) return;
      currentIndex = (currentIndex + 1) % items.length;
      const target = snaps[currentIndex];
      if (!target) return;
      // Scroll only the marquee container horizontally — never the page.
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const left =
        container.scrollLeft +
        (targetRect.left - containerRect.left) -
        (containerRect.width - targetRect.width) / 2;
      container.scrollTo({ left, behavior: "smooth" });
    };

    const startTimer = () => {
      if (timer) return;
      timer = setInterval(advance, 4000);
    };

    const stopTimer = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    const resetTimer = () => {
      stopTimer();
      if (isVisible) startTimer();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) startTimer();
        else stopTimer();
      },
      { threshold: 0.1 },
    );
    observer.observe(container);

    container.addEventListener("touchstart", resetTimer, { passive: true });

    return () => {
      stopTimer();
      observer.disconnect();
      container.removeEventListener("touchstart", resetTimer);
    };
  }, [items.length]);

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
          animation: marquee 60s linear infinite;
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
        /* Touch / coarse-pointer devices: swipe the carousel manually with scroll-snap. */
        @media (hover: none) {
          .marquee-track {
            animation: none;
          }
          .marquee-container {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .marquee-container::-webkit-scrollbar {
            display: none;
          }
          .marquee-snap-item {
            scroll-snap-align: center;
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
            const isThis = expandedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (cardHref) {
                    window.open(cardHref, "_blank", "noopener,noreferrer");
                    return;
                  }
                  setExpandedKey(isThis ? null : key);
                }}
                aria-expanded={cardHref ? undefined : isThis}
                aria-label={
                  cardHref
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
