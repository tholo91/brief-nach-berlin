import { formatNumber } from "@/lib/formatNumber";

export type ColumnPoint = {
  key: string;
  label: string;
  count: number;
  /** Untergrenze, z. B. erster Zählerabschnitt ohne Vorwert. */
  partial?: boolean;
  /** Zusätzliche Zeile im Tooltip und in der Tabelle. */
  detail?: string;
};

type ColumnChartProps = {
  data: ColumnPoint[];
  /** Einheit für Tooltip und Tabelle, z. B. „Briefe“. */
  unit: string;
  /** Beschriftung der Zeitachse in der Tabellenansicht. */
  axisLabel?: string;
  color?: string;
  emphasisColor?: string;
  /** Spitzenwert hervorheben und beschriften. */
  emphasizePeak?: boolean;
  tableSummary?: string;
  compact?: boolean;
};

/**
 * Säulen über der Zeit, reine HTML/CSS-Umsetzung: schmale Säulen mit 2 px
 * Lücke, 4 px gerundete Datenenden, Haarlinie als Grundlinie, selektive
 * Beschriftung (Anfang, Ende, Spitze) und eine Tabellenansicht als Fallback.
 */
export function ColumnChart({
  data,
  unit,
  axisLabel = "Zeitraum",
  color = "#2D6A4F",
  emphasisColor = "#C1121F",
  emphasizePeak = true,
  tableSummary = "Werte als Tabelle",
  compact = false,
}: ColumnChartProps) {
  if (!data.length) return null;
  const highest = Math.max(...data.map((point) => point.count));
  const max = Math.max(highest, 1);
  let peakIndex = -1;
  if (emphasizePeak) {
    data.forEach((point, index) => {
      if (peakIndex === -1 || point.count > data[peakIndex].count) peakIndex = index;
    });
  }
  const lastIndex = data.length - 1;
  // Achsenbeschriftung nur am Anfang und Ende (bei wenigen Säulen überall);
  // die Spitze trägt ihr Label oben an der Säule, damit nichts kollidiert.
  const showLabel = (index: number) =>
    index === 0 || index === lastIndex || data.length <= 6 || (compact && index === Math.floor(lastIndex / 2));
  const peakLabelClass =
    peakIndex === 0
      ? "left-0"
      : peakIndex === lastIndex
        ? "right-0 text-right"
        : "left-1/2 -translate-x-1/2 text-center";

  return (
    <figure className="m-0">
      <div className="relative pt-6" style={compact ? { maxWidth: `${Math.max(15, data.length * 3)}rem` } : undefined}>
        {compact && highest > 0 && (
          <span aria-hidden="true" className="absolute top-1 font-body text-xs tabular-nums text-warmgrau">
            {formatNumber(highest)}
          </span>
        )}
        <div
          className={`flex items-end border-b border-warmgrau/20 ${compact ? "h-32 gap-1 border-t border-t-warmgrau/15 sm:h-40" : "h-40 gap-[2px] sm:h-48"}`}
          role="img"
          aria-label={`${formatNumber(data.reduce((sum, point) => sum + point.count, 0))} ${unit} in ${data.length} Zeitabschnitten`}
        >
          {data.map((point, index) => {
            const isPeak = index === peakIndex && data.length > 1;
            const height = max > 0 ? (point.count / max) * 100 : 0;
            const title = [
              `${point.label}: ${formatNumber(point.count)} ${unit}${point.partial ? " (Untergrenze, Teilabschnitt)" : ""}`,
              point.detail,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <div
                key={point.key}
                className="group relative flex h-full min-w-0 flex-1 items-end justify-center"
                title={title}
              >
                {isPeak && (
                  <span
                    className={`absolute -top-6 whitespace-nowrap font-typewriter text-[11px] font-bold tabular-nums text-waldgruen-dark ${peakLabelClass}`}
                  >
                    {formatNumber(point.count)}
                    <span className="font-normal text-warmgrau/60"> · {point.label}</span>
                  </span>
                )}
                <div
                  className={`w-full rounded-t-[4px] transition-opacity group-hover:opacity-75 ${compact ? "" : "max-w-6"}`}
                  style={{
                    height: `${Math.max(height, point.count > 0 ? 1.5 : 0)}%`,
                    backgroundColor: isPeak ? emphasisColor : color,
                    opacity: point.partial ? 0.45 : 1,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className={`mt-1.5 flex ${compact ? "min-h-4 gap-1" : "gap-[2px]"}`} aria-hidden="true">
          {data.map((point, index) => (
            <div key={point.key} className="relative min-w-0 flex-1">
              {showLabel(index) && (
                <span
                  className={`block whitespace-nowrap font-typewriter tabular-nums ${compact ? "text-xs text-warmgrau" : "text-[10px] text-warmgrau/60"} ${
                    index === 0
                      ? "text-left"
                      : index === lastIndex
                        ? "absolute right-0 text-right"
                        : "absolute left-1/2 -translate-x-1/2 text-center"
                  }`}
                >
                  {point.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <details className={compact ? "mt-2 group/table" : "mt-6 group/table"}>
        <summary className={`inline-flex cursor-pointer list-none items-center gap-1.5 underline-offset-2 hover:text-waldgruen-dark hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen [&::-webkit-details-marker]:hidden ${compact ? "min-h-11 font-body text-sm font-semibold text-waldgruen-dark" : "font-typewriter text-[11px] font-bold uppercase tracking-[0.12em] text-warmgrau/55"}`}>
          <svg
            aria-hidden="true"
            viewBox="0 0 10 10"
            className="h-2.5 w-2.5 transition-transform group-open/table:rotate-90"
          >
            <path d="M3 1.5 6.5 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {tableSummary}
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className={`w-full border-collapse font-body text-sm ${compact ? "" : "min-w-[280px]"}`}>
            <thead>
              <tr className="border-b border-warmgrau/15 text-left font-typewriter text-[11px] uppercase tracking-[0.1em] text-warmgrau/55">
                <th className="py-1.5 pr-3 font-bold">{axisLabel}</th>
                <th className="py-1.5 pr-3 text-right font-bold">{unit}</th>
                {data.some((point) => point.detail) && <th className="py-1.5 font-bold">{compact ? "Datum" : "Hinweis"}</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.key} className="border-b border-warmgrau/10">
                  <td className="py-1.5 pr-3 text-waldgruen-dark">{point.label}</td>
                  <td className="py-1.5 pr-3 text-right font-typewriter tabular-nums text-waldgruen-dark">
                    {formatNumber(point.count)}
                    {point.partial ? " +" : ""}
                  </td>
                  {data.some((item) => item.detail) && (
                    <td className="py-1.5 text-xs text-warmgrau/60">{point.detail ?? ""}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
