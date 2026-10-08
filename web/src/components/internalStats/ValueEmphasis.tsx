import { shareParts, type ViewMode } from "@/lib/internalStats/view";

type ValueEmphasisProps = {
  mode: ViewMode;
  value: number;
  total: number;
  unit?: string;
  smallSuffix?: string;
  /** "dark" für dunkle Kartenhintergründe (helle Schrift). */
  tone?: "light" | "dark";
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
  tone = "light",
}: ValueEmphasisProps) {
  const parts = shareParts(value, total);
  const valueClass = `font-typewriter text-4xl font-bold tabular-nums sm:text-5xl ${
    tone === "dark" ? "text-creme" : "text-waldgruen-dark"
  }`;
  const baseClass = `font-body text-xs leading-relaxed ${
    tone === "dark" ? "text-creme/75" : "text-warmgrau/55"
  }`;
  const unitText = unit ? ` ${unit}` : "";
  const countText = `${parts.count}${unitText}`;
  const shareText = `${parts.shareText} %`;
  const baseText = `${parts.count} von ${parts.totalText}${unitText}`;

  if (mode === "prozentual") {
    return (
      <span className="inline-flex flex-col items-start gap-0.5">
        <span className={valueClass}>
          {shareText}
        </span>
        <span className={baseClass}>
          {baseText}
          {total === 0 && " · keine Basis"}
          {smallSuffix ? ` · ${smallSuffix}` : ""}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span className={valueClass}>
        {countText}
      </span>
      <span className={baseClass}>
        ({shareText} · von {parts.totalText})
        {total === 0 && " · keine Basis"}
        {smallSuffix ? ` · ${smallSuffix}` : ""}
      </span>
    </span>
  );
}