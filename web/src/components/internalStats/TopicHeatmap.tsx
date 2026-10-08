import { formatNumber } from "@/lib/formatNumber";
import type { HeatmapData } from "@/lib/internalStats/view";

type TopicHeatmapProps = {
  data: HeatmapData;
  rowLabel: (key: string) => string;
  unit?: string;
};

const STEPS = [0.12, 0.28, 0.46, 0.66, 0.88] as const;

function cellStyle(count: number, max: number): { backgroundColor: string; color: string } {
  if (count <= 0 || max <= 0) return { backgroundColor: "transparent", color: "rgba(61,61,61,0.35)" };
  const step = Math.min(STEPS.length - 1, Math.floor((count / max) * STEPS.length));
  const alpha = STEPS[step];
  return {
    backgroundColor: `rgba(45,106,79,${alpha})`,
    color: alpha >= 0.66 ? "#FAF8F5" : "#1B4332",
  };
}

/**
 * Oberkategorie × Zeitabschnitt als Heatmap (eine Farbe, hell → dunkel).
 * Erste Spalte bleibt beim horizontalen Scrollen auf dem Handy stehen.
 */
const WEEK_LABEL = /^(KW \d+) · (\d{2})$/;

/** „KW 38 · 26“ → „KW 38“, wenn alle Spalten im selben Jahr liegen. */
function compactColumnLabels(columns: HeatmapData["columns"]): string[] {
  const matches = columns.map((column) => WEEK_LABEL.exec(column.label));
  const years = new Set(matches.map((match) => match?.[2]));
  if (matches.every(Boolean) && years.size === 1) {
    return matches.map((match) => match?.[1] ?? "");
  }
  return columns.map((column) => column.label);
}

export function TopicHeatmap({ data, rowLabel, unit = "Signale" }: TopicHeatmapProps) {
  if (!data.rows.length || !data.columns.length) return null;
  const columnLabels = compactColumnLabels(data.columns);
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full border-separate border-spacing-[2px] font-body text-sm">
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 bg-white/95 py-1 pr-3 text-left font-typewriter text-[11px] font-bold uppercase tracking-[0.1em] text-warmgrau/55 backdrop-blur"
            >
              Thema
            </th>
            {data.columns.map((column, index) => (
              <th
                key={column.key}
                scope="col"
                title={column.label}
                className="min-w-9 px-0.5 py-1 text-center font-typewriter text-[10px] font-normal tabular-nums text-warmgrau/60"
              >
                {columnLabels[index]}
              </th>
            ))}
            <th
              scope="col"
              className="px-2 py-1 text-right font-typewriter text-[11px] font-bold uppercase tracking-[0.1em] text-warmgrau/55"
            >
              Σ
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={row.key}>
              <th
                scope="row"
                className="sticky left-0 z-10 max-w-[150px] truncate bg-white/95 py-1 pr-3 text-left font-body text-sm font-semibold text-waldgruen-dark backdrop-blur sm:max-w-none"
              >
                {rowLabel(row.key)}
              </th>
              {row.counts.map((count, index) => {
                const column = data.columns[index];
                return (
                  <td
                    key={column.key}
                    title={`${rowLabel(row.key)} · ${column.label}: ${formatNumber(count)} ${unit}`}
                    className="h-9 min-w-9 rounded-[4px] px-0.5 text-center font-typewriter text-xs tabular-nums"
                    style={cellStyle(count, data.max)}
                  >
                    {count > 0 ? formatNumber(count) : "·"}
                  </td>
                );
              })}
              <td className="px-2 text-right font-typewriter text-xs font-bold tabular-nums text-waldgruen-dark">
                {formatNumber(row.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
