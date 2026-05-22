"use client";

import type { PublicReview } from "@/lib/reviews/types";
import { ReviewCard } from "./ReviewCard";

interface ReviewMarqueeProps {
  reviews: PublicReview[];
  variant?: "full" | "compact";
  limit?: number;
}

export function ReviewMarquee({
  reviews,
  variant = "full",
  limit = 30,
}: ReviewMarqueeProps) {
  const items = reviews.slice(0, limit);

  if (items.length === 0) return null;

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
        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
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
        className="marquee-container overflow-x-hidden w-full"
        data-variant={variant}
        aria-label="Stimmen aus dem ganzen Land"
      >
        <div className="marquee-track flex gap-4 w-max">
          {/* Doppelte Liste fuer seamless loop */}
          {[...items, ...items].map((review, index) => (
            <ReviewCard key={`${review.id}-${index}`} review={review} />
          ))}
        </div>
      </div>
    </>
  );
}
