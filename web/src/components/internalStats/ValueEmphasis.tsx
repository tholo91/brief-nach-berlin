import { shareParts, type ViewMode } from "@/lib/internalStats/view";

type ValueEmphasisProps = {
  mode: ViewMode;
  value: number;
  total: number;
  unit?: string;
  smallSuffix?: string;
};

/**
 * Renders a value/total pair with mode-dependent emphasis.
 * Prozentual: Anteil groß, absolute Basis klein.
 * Absolut: Anzahl groß, Anteil klein.
 */
export function ValueEmphasis({
  mode,
  value,
  total,
  unit,
  smallSuffix,
}: ValueEmphasisProps) {
  const parts = shareParts(value, total);
  const unitText = unit ? ` ${unit}` : "";
  const countText = `${parts.count}${unitText}`;
  const shareText = `${parts.shareText} %`;
  const baseText = `${parts.count} von ${parts.totalText}${unitText}`;

  if (mode === "prozentual") {
    return (
      <span className="inline-flex flex-col items-start gap-0.5">
        <span className="font-typewriter text-4xl font-bold tabular-nums text-waldgruen-dark sm:text-5xl">
          {shareText}
        </span>
        <span className="font-body text-xs leading-relaxed text-warmgrau/55">
          {baseText}
          {total === 0 && " · keine Basis"}
          {smallSuffix ? ` · ${smallSuffix}` : ""}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span className="font-typewriter text-4xl font-bold tabular-nums text-waldgruen-dark sm:text-5xl">
        {countText}
      </span>
      <span className="font-body text-xs leading-relaxed text-warmgrau/55">
        ({shareText} · von {parts.totalText})
        {total === 0 && " · keine Basis"}
        {smallSuffix ? ` · ${smallSuffix}` : ""}
      </span>
    </span>
  );
}