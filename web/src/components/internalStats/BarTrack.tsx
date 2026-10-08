import { formatDecimal } from "@/lib/formatNumber";

type BarTrackProps = {
  /** Anteil in Prozent (0–100) oder ein beliebiger Wert auf derselben Skala wie `scale`. */
  value: number;
  /** Wert, der die volle Breite ergibt. */
  scale: number;
  /** Vergleichswert ohne Filter auf derselben Skala; wird als grauer Strich gezeigt. */
  baseline?: number | null;
  baselineLabel?: string;
  color?: string;
  colorClassName?: string;
  height?: "sm" | "md";
};

/**
 * Balken mit optionaler Vergleichsmarke. Die Marke steht für denselben Wert
 * ohne Filter, damit „Bremen 34 % vs. gesamt 22 %“ auf einen Blick lesbar ist.
 */
export function BarTrack({
  value,
  scale,
  baseline = null,
  baselineLabel = "Gesamt",
  color,
  colorClassName = "bg-airmail-rot",
  height = "sm",
}: BarTrackProps) {
  const width = scale > 0 ? Math.min(100, (value / scale) * 100) : 0;
  const markerLeft =
    baseline !== null && scale > 0 ? Math.min(100, (baseline / scale) * 100) : null;
  return (
    <div
      className={`relative mt-1.5 overflow-visible rounded-full bg-warmgrau/10 ${
        height === "md" ? "h-3" : "h-2"
      }`}
    >
      <div
        className={`h-full rounded-full ${color ? "" : colorClassName}`}
        style={{ width: `${width}%`, ...(color ? { backgroundColor: color } : {}) }}
      />
      {markerLeft !== null && (
        <span
          aria-label={`${baselineLabel}: ${formatDecimal(baseline ?? 0)} %`}
          title={`${baselineLabel}: ${formatDecimal(baseline ?? 0)} %`}
          className="absolute -top-1 bottom-[-4px] w-[2px] -translate-x-1/2 rounded-full bg-warmgrau/70 ring-2 ring-creme"
          style={{ left: `${markerLeft}%` }}
        />
      )}
    </div>
  );
}
