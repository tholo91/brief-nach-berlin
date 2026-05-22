import type { PublicReview } from "@/lib/reviews/types";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={filled ? "text-amber-400" : "text-warmgrau/20"}
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= rating} />
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: PublicReview;
  isExpanded?: boolean;
}

export function ReviewCard({ review, isExpanded = false }: ReviewCardProps) {
  const name = review.display_name || "Anonym";
  const date = new Date(review.created_at).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={`bg-white/95 rounded-3xl border border-waldgruen/10 p-6 flex-shrink-0 flex flex-col gap-3 transition-all duration-300 ${
        isExpanded
          ? "min-w-[360px] max-w-[440px] shadow-2xl shadow-waldgruen/20 scale-[1.03] z-10"
          : "w-[340px] min-h-[240px] shadow-sm hover:shadow-md"
      }`}
    >
      <StarRow rating={review.rating} />
      <p
        className={`font-body text-sm text-warmgrau leading-relaxed flex-1 ${
          isExpanded ? "" : "line-clamp-4"
        }`}
      >
        {review.body}
      </p>
      <div className="flex items-center justify-between gap-2 mt-1">
        <span className="font-typewriter text-xs font-semibold text-waldgruen-dark truncate">
          {name}
        </span>
        <span className="font-typewriter text-xs text-warmgrau/60 shrink-0">
          {date}
        </span>
      </div>
    </div>
  );
}
