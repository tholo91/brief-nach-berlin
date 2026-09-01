import { formatNumber } from "@/lib/formatNumber";
import type { InternalStats } from "@/lib/internalStats/aggregate";

type StatsPieProps = {
  stats: InternalStats;
};

const segments = [
  { key: "sentCount", label: "Verschickt / gleich", color: "#2D6A4F" },
  { key: "notSentCount", label: "Nicht verschickt", color: "#C1121F" },
  { key: "noAnswerCount", label: "Keine Angabe", color: "#A9A49D" },
] as const;

function percent(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}

export function StatsPie({ stats }: StatsPieProps) {
  const values = segments.map((segment) => stats[segment.key]);
  const total = values.reduce((sum, value) => sum + value, 0);
  let offset = 0;
  const stops = segments.map((segment) => {
    const start = offset;
    offset += percent(stats[segment.key], total);
    return `${segment.color} ${start}% ${offset}%`;
  });

  return (
    <div className="grid items-center gap-8 sm:grid-cols-[190px_1fr]">
      <div
        aria-label={`Versandangaben aus ${formatNumber(total)} Bewertungen`}
        className="relative mx-auto aspect-square w-44 rounded-full shadow-[0_14px_30px_rgba(27,67,50,0.13)]"
        role="img"
        style={{
          background:
            total > 0
              ? `conic-gradient(${stops.join(", ")})`
              : "#d7d2cb",
        }}
      >
        <div className="absolute inset-[23%] flex flex-col items-center justify-center rounded-full bg-creme text-center">
          <span className="font-typewriter text-3xl font-bold tabular-nums text-waldgruen-dark">
            {formatNumber(stats.sentCount)}
          </span>
          <span className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-warmgrau/60">
            positives Signal
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {segments.map((segment) => {
          const count = stats[segment.key];
          const share = percent(count, total);
          return (
            <div key={segment.key} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-body text-sm font-semibold text-waldgruen-dark">
                    {segment.label}
                  </span>
                  <span className="font-typewriter text-xs tabular-nums text-warmgrau/60">
                    {share.toFixed(1).replace(".", ",")} %
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-warmgrau/10">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: segment.color, width: `${share}%` }}
                  />
                </div>
              </div>
              <span className="font-typewriter text-sm font-bold tabular-nums text-waldgruen-dark">
                {formatNumber(count)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
