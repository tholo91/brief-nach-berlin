"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicReview } from "@/lib/reviews/types";

const ADVANCE_MS = 6000;
const EXIT_MS = 200;

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={n <= rating ? "text-amber-400" : "text-warmgrau/20"}
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewMiniCard({ review }: { review: PublicReview }) {
  return (
    <div className="w-44 min-h-[18rem] bg-white/95 rounded-2xl border border-waldgruen/10 p-4 shadow-lg shadow-waldgruen/10 flex flex-col gap-2.5">
      <StarRow rating={review.rating} />
      <p className="font-handwriting text-sm text-warmgrau leading-relaxed tracking-wide line-clamp-6 flex-1">
        {review.body}
      </p>
      <span className="font-body text-[10px] font-normal text-warmgrau/45 tracking-wide leading-snug">
        {review.display_name || "Anonym"}
      </span>
    </div>
  );
}

export function HeroReviewStack({ reviews }: { reviews: PublicReview[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // Auto-advance — interval restarts on each currentIndex change (resets the 6s clock)
  useEffect(() => {
    if (reviews.length <= 1) return;
    const id = setInterval(() => {
      if (reducedMotion.current) {
        setCurrentIndex((i) => (i + 1) % reviews.length);
        return;
      }
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % reviews.length);
        setIsExiting(false);
      }, EXIT_MS);
    }, ADVANCE_MS);
    return () => clearInterval(id);
  }, [currentIndex, reviews.length]);

  if (reviews.length === 0) return null;

  const front = currentIndex % reviews.length;
  const mid = (currentIndex + 1) % reviews.length;
  const back = (currentIndex + 2) % reviews.length;

  return (
    <div className="select-none">
      {/* Stacked cards */}
      <div className="relative w-44 h-72">
        {/* Back card */}
        {reviews.length >= 3 && (
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{
              zIndex: 10,
              transform: "rotate(-2deg) scale(0.90) translateY(18px)",
              opacity: 0.5,
            }}
          >
            <ReviewMiniCard review={reviews[back]} />
          </div>
        )}

        {/* Mid card */}
        {reviews.length >= 2 && (
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{
              zIndex: 20,
              transform: "rotate(3deg) scale(0.95) translateY(9px)",
              opacity: 0.7,
            }}
          >
            <ReviewMiniCard review={reviews[mid]} />
          </div>
        )}

        {/* Front card — click opens /stimmen in new tab */}
        <a
          href="/stimmen"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Alle Bewertungen lesen"
          className="absolute top-0 left-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 rounded-2xl"
          style={{
            zIndex: 30,
            transform: isExiting
              ? "translateX(-50px) rotate(-15deg) scale(0.8)"
              : "rotate(-5deg)",
            opacity: isExiting ? 0 : 1,
            transition: `transform ${EXIT_MS}ms ease-in, opacity ${EXIT_MS}ms ease-in`,
          }}
        >
          <ReviewMiniCard review={reviews[front]} />
        </a>
      </div>

      {/* Pagination dots */}
      {reviews.length > 1 && (
        <div className="md:hidden flex gap-1.5 justify-center mt-3 ml-1" aria-hidden="true">
          {reviews.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === front
                  ? "w-3 h-1.5 bg-waldgruen"
                  : "w-1.5 h-1.5 bg-waldgruen/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
