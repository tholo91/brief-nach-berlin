import type { ReviewStats } from "@/lib/reviews/types";

interface RatingStatProps {
  stats: ReviewStats;
  showDistribution?: boolean;
}

function StarBar({ rating, max = 5 }: { rating: number; max?: number }) {
  const fillPercent = (rating / max) * 100;
  return (
    <div className="relative inline-flex">
      <div className="flex gap-0.5 text-warmgrau/20 text-3xl leading-none select-none">
        {"★".repeat(max)}
      </div>
      <div
        className="absolute inset-0 flex gap-0.5 text-amber-400 text-3xl leading-none overflow-hidden select-none"
        style={{ width: `${fillPercent}%` }}
      >
        {"★".repeat(max)}
      </div>
    </div>
  );
}

export function RatingStat({ stats, showDistribution = false }: RatingStatProps) {
  if (stats.totalCount === 0) {
    return (
      <p className="font-typewriter text-sm text-warmgrau/60">
        Noch zu wenig Bewertungen
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <StarBar rating={stats.averageRating} />
      <p className="font-typewriter text-sm text-warmgrau/70">
        bewertet mit {stats.averageRating.toFixed(1)}/5 aus {stats.totalCount} Stimmen
      </p>
      {showDistribution && (
        <div className="flex flex-col gap-1.5 mt-1">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = stats.distribution[star] ?? 0;
            const pct =
              stats.totalCount > 0
                ? Math.round((count / stats.totalCount) * 100)
                : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="font-typewriter text-xs text-warmgrau/60 w-8 shrink-0">
                  {star} ★
                </span>
                <div className="flex-1 h-2 bg-waldgruen/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-typewriter text-xs text-warmgrau/60 w-5 text-right shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
