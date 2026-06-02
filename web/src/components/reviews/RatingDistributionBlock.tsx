import type { ReviewStats } from "@/lib/reviews/types";

interface RatingDistributionBlockProps {
  stats: ReviewStats;
}

export function RatingDistributionBlock({
  stats,
}: RatingDistributionBlockProps) {
  if (stats.totalCount === 0) return null;

  return (
    <section className="mt-10">
      <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
        So verteilen sich die Stimmen
      </p>
      <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark tracking-tight mb-2">
        Alle Sterne, ungeschönt
      </h2>
      <p className="font-typewriter text-xs text-warmgrau/60">
        aus {stats.totalCount} Bewertungen seit Mai 2026
      </p>

      <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-3 md:gap-y-3.5 mt-8">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = stats.distribution[star] ?? 0;
          const pct =
            stats.totalCount > 0
              ? Math.round((count / stats.totalCount) * 100)
              : 0;
          return (
            <div key={star} className="contents">
              <span className="font-typewriter text-sm text-warmgrau/70 tabular-nums">
                {star} <span className="text-amber-400/80">★</span>
              </span>
              <div
                className="h-2.5 bg-waldgruen/10 rounded-full overflow-hidden self-center"
                title={`${pct}%`}
              >
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-typewriter text-sm text-waldgruen-dark tabular-nums text-right min-w-[2.5rem]">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
