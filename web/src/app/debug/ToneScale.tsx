import { getUiCopy } from "@/lib/i18n/uiCatalog";

const TONES = getUiCopy("de").preferences.tones;

// Die Stufe kommt aus der URL, alte Links haben keine.
export function isToneStep(level: number | undefined): level is number {
  return level !== undefined && Number.isInteger(level) && level >= 1 && level <= TONES.length;
}

// Gleiche Leiste wie im Wizard (StepPreferences), nur zum Ansehen.
export default function ToneScale({ title, level }: { title: string; level: number }) {
  const position = `${((level - 1) / (TONES.length - 1)) * 100}%`;
  return (
    <div className="border-t border-warmgrau/10 py-3">
      <p className="text-[15px] text-warmgrau/75">{title}</p>
      <div
        role="img"
        aria-label={`${title}: ${TONES[level - 1]}, Stufe ${level} von ${TONES.length}`}
        className="mt-3"
      >
        <div className="mx-2 h-1 rounded-full bg-warmgrau/15">
          <div className="relative h-full rounded-full bg-waldgruen" style={{ width: position }}>
            <span className="absolute right-0 top-1/2 size-4 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white bg-waldgruen shadow-sm" />
          </div>
        </div>
        <div className="mt-2.5 flex justify-between gap-1">
          {TONES.map((label, index) => (
            <span
              key={label}
              className={[
                "text-center text-xs",
                level === index + 1 ? "font-semibold text-waldgruen" : "text-warmgrau/60",
              ].join(" ")}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
