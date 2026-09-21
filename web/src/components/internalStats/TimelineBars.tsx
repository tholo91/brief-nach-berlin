import { formatNumber } from "@/lib/formatNumber";

export type TimelinePoint = { key: string; label: string; count: number };

export function TimelineBars({ data }: { data: TimelinePoint[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((point) => point.count));
  return (
    <div className="grid gap-1.5">
      {data.map((point) => (
        <div
          key={point.key}
          className="grid grid-cols-[72px_1fr_auto] items-center gap-3"
        >
          <span className="font-typewriter text-[11px] tabular-nums text-warmgrau/60">
            {point.label}
          </span>
          <div className="h-2 overflow-hidden rounded-full bg-warmgrau/10">
            <div
              className="h-full rounded-full bg-waldgruen"
              style={{ width: `${max > 0 ? (point.count / max) * 100 : 0}%` }}
            />
          </div>
          <span className="font-typewriter text-xs tabular-nums text-waldgruen-dark">
            {formatNumber(point.count)}
          </span>
        </div>
      ))}
    </div>
  );
}