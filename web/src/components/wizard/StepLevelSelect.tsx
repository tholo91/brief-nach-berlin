"use client";

import { useMemo, useState } from "react";
import { useLocale, useUiCopy } from "@/components/i18n/LocaleProvider";
import type { PoliticalLevel } from "@/lib/types/politician";
import type { LevelRoutingContext } from "@/lib/types/wizard";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";

interface StepLevelSelectProps {
  routing: LevelRoutingContext;
  /** Vorherige Wahl, wenn der User über "Ebene ändern" zurückkommt */
  initialLevel?: PoliticalLevel | null;
  onContinue: (level: PoliticalLevel) => void;
}

const RECOMMENDATION_COPY = {
  de: {
    Bund: "Wahrscheinlich ist dein Anliegen am besten beim Bund aufgehoben.",
    Land: "Wahrscheinlich ist dein Anliegen am besten auf Landesebene aufgehoben.",
    Kommune: "Wahrscheinlich ist dein Anliegen am besten bei der Kommune aufgehoben.",
  },
  en: {
    Bund: "Your concern will probably be best addressed at the federal level.",
    Land: "Your concern will probably be best addressed at the state level.",
    Kommune: "Your concern will probably be best addressed locally.",
  },
  tr: {
    Bund: "Talebiniz muhtemelen en iyi federal düzeyde ele alınır.",
    Land: "Talebiniz muhtemelen en iyi eyalet düzeyinde ele alınır.",
    Kommune: "Talebiniz muhtemelen en iyi yerel düzeyde ele alınır.",
  },
};

const FALLBACK_REGION_COPY = {
  de: "deinem Bundesland",
  en: "your state",
  tr: "eyaletiniz",
};

// Inline-SVGs (lucide-Pfade) statt neuer Dependency — Konvention im Projekt.
function LevelIcon({ level, className }: { level: PoliticalLevel; className?: string }) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  if (level === "Bund") {
    // Landmark (Parlament)
    return (
      <svg {...common}>
        <line x1="3" x2="21" y1="22" y2="22" />
        <line x1="6" x2="6" y1="18" y2="11" />
        <line x1="10" x2="10" y1="18" y2="11" />
        <line x1="14" x2="14" y1="18" y2="11" />
        <line x1="18" x2="18" y1="18" y2="11" />
        <polygon points="12 2 20 7 4 7" />
      </svg>
    );
  }
  if (level === "Land") {
    // MapPin (Region)
    return (
      <svg {...common}>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }
  // Home (Rathaus / vor Ort)
  return (
    <svg {...common}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

const LEVELS: PoliticalLevel[] = ["Bund", "Land", "Kommune"];

export function StepLevelSelect({
  routing,
  initialLevel,
  onContinue,
}: StepLevelSelectProps) {
  const { locale } = useLocale();
  const copy = useUiCopy();
  const recommended = routing.recommended;

  const availability: Record<PoliticalLevel, boolean> = useMemo(
    () => ({
      Bund: true,
      Land: routing.coverage.landSupported,
      Kommune: routing.coverage.kommuneSupported,
    }),
    [routing.coverage]
  );

  const preselectedRecommendationLevel = useMemo<PoliticalLevel | null>(() => {
    if (!recommended || recommended.confidence === "low") return null;
    if (availability[recommended.level]) return recommended.level;
    if (
      recommended.level === "Kommune" &&
      routing.coverage.stadtstaatEinheitsgemeinde &&
      availability.Land
    ) {
      return "Land";
    }
    return null;
  }, [availability, recommended, routing.coverage.stadtstaatEinheitsgemeinde]);

  const recommendationWasBundledUnderLand =
    recommended?.level === "Kommune" &&
    preselectedRecommendationLevel === "Land" &&
    routing.coverage.stadtstaatEinheitsgemeinde;

  const [selected, setSelected] = useState<PoliticalLevel | null>(() => {
    if (initialLevel && availability[initialLevel]) return initialLevel;
    if (!recommended || recommended.confidence === "low") return null;
    if (availability[recommended.level]) return recommended.level;
    // Stadtstaat: Kommune existiert nicht, die Land-Ebene übernimmt.
    if (
      recommended.level === "Kommune" &&
      routing.coverage.stadtstaatEinheitsgemeinde &&
      availability.Land
    ) {
      return "Land";
    }
    return null;
  });

  // Ehrliche Erklärungen für nicht verfügbare Ebenen
  const unavailableHint = (level: PoliticalLevel): string | null => {
    if (availability[level]) return null;
    if (level === "Land") {
      const region = routing.bundeslandName ?? FALLBACK_REGION_COPY[locale];
      return copy.levels.stateUnavailable.replace("{region}", region);
    }
    if (level === "Kommune") {
      if (routing.coverage.stadtstaatEinheitsgemeinde && routing.bundeslandName) {
        return copy.levels.cityStateHint.replace("{state}", routing.bundeslandName);
      }
      return copy.levels.localUnavailable;
    }
    return null;
  };

  const focusLevel = selected ?? LEVELS.find((level) => availability[level]);

  const handleKeyDown = (e: React.KeyboardEvent, level: PoliticalLevel) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (availability[level]) setSelected(level);
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      const availableLevels = LEVELS.filter((candidate) => availability[candidate]);
      const currentIndex = Math.max(0, availableLevels.indexOf(level));
      const nextLevel = e.key === "Home"
        ? availableLevels[0]
        : e.key === "End"
          ? availableLevels.at(-1)
          : availableLevels[
              (currentIndex + (e.key === "ArrowDown" ? 1 : -1) + availableLevels.length) %
                availableLevels.length
            ];
      if (!nextLevel) return;
      setSelected(nextLevel);
      document.querySelector<HTMLElement>(`[data-level-card="${nextLevel}"]`)?.focus();
    }
  };

  return (
    <div>
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark">
        {copy.levels.heading}
      </h1>
      {preselectedRecommendationLevel ? (
        <div className="mt-4 font-body text-sm leading-relaxed text-warmgrau">
          <p className="font-semibold text-waldgruen-dark">
            {RECOMMENDATION_COPY[locale][preselectedRecommendationLevel]}
          </p>
          <p className="mt-1">
            {routing.reasoning && !recommendationWasBundledUnderLand && (
              <>
                {routing.reasoning}
                {routing.reasoning.endsWith(".") ? "" : "."}{" "}
              </>
            )}
            <span className="text-warmgrau/75">{copy.levels.canChooseAnother}</span>
          </p>
        </div>
      ) : (
        <p className="mt-4 font-body text-sm leading-relaxed text-warmgrau">
          {copy.levels.noRecommendation}
        </p>
      )}

      <div role="radiogroup" aria-label={copy.levels.groupAriaLabel} className="mt-6 space-y-3">
        {LEVELS.map((level) => {
          const isAvailable = availability[level];
          const isSelected = selected === level;
          const isBeta = level !== "Bund";
          const hint = unavailableHint(level);
          const hintId = hint ? `level-${level.toLowerCase()}-hint` : undefined;
          const isBundledUnderLand =
            level === "Kommune" &&
            !isAvailable &&
            routing.coverage.stadtstaatEinheitsgemeinde &&
            Boolean(routing.bundeslandName);
          return (
            <div
              key={level}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={!isAvailable}
              aria-describedby={hintId}
              data-level-card={level}
              tabIndex={isAvailable && focusLevel === level ? 0 : -1}
              onClick={() => isAvailable && setSelected(level)}
              onKeyDown={(e) => handleKeyDown(e, level)}
              className={[
                "w-full text-left p-4 rounded-lg border-2 transition-colors",
                isAvailable ? "cursor-pointer active:scale-[0.99]" : "cursor-not-allowed",
                isSelected
                  ? "border-waldgruen bg-waldgruen/10"
                  : isAvailable
                    ? "border-waldgruen/20 bg-creme hover:border-waldgruen/40"
                    : "border-warmgrau/25 bg-warmgrau/[0.04]",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                    isSelected
                      ? "border-waldgruen/40 bg-waldgruen text-creme"
                      : isAvailable
                        ? "border-waldgruen/20 bg-white text-waldgruen-dark"
                        : "border-warmgrau/20 bg-warmgrau/10 text-warmgrau/45",
                  ].join(" ")}
                >
                  <LevelIcon level={level} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-2">
                    <p
                      className={`min-w-0 flex-1 font-body text-base font-semibold ${isAvailable ? "text-warmgrau" : "text-warmgrau/60"}`}
                    >
                      {level === "Bund"
                        ? copy.levels.federal
                        : level === "Land"
                          ? copy.levels.state
                          : copy.levels.local}
                    </p>
                    <div className="ml-auto flex max-w-full flex-wrap justify-end gap-2">
                      {isBundledUnderLand && (
                        <span className="inline-block font-body text-[11px] font-semibold uppercase tracking-wide text-warmgrau/70 bg-warmgrau/10 px-2 py-0.5 rounded">
                          {copy.levels.underState.replace("{state}", routing.bundeslandName ?? "")}
                        </span>
                      )}
                      {isBeta && (
                        <span className="inline-block font-body text-[11px] font-semibold uppercase tracking-wide text-bernstein bg-bernstein/10 px-2 py-0.5 rounded">
                          {copy.levels.beta}
                        </span>
                      )}
                    </div>
                  </div>
                  <p
                    className={`font-body text-sm mt-0.5 ${isAvailable ? "text-warmgrau/75" : "text-warmgrau/50"}`}
                  >
                    {level === "Bund"
                      ? copy.levels.federalExamples
                      : level === "Land"
                        ? copy.levels.stateExamples
                        : copy.levels.localExamples}
                  </p>

                  {hint && (
                    <p
                      id={hintId}
                      className="font-body text-xs text-warmgrau/70 mt-2 leading-relaxed"
                    >
                      {hint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => selected && onContinue(selected)}
          disabled={!selected}
          className={[
            "relative w-full bg-waldgruen text-creme font-semibold text-base px-8 pr-14 py-4 rounded-xl whitespace-nowrap",
            "hover:bg-waldgruen-dark transition-colors min-h-[44px]",
            selected ? "cursor-pointer" : "opacity-60 cursor-not-allowed",
          ].join(" ")}
        >
          {copy.levels.chooseRecipients}
          <WizardForwardIcon className="absolute right-5 top-1/2 -translate-y-1/2" />
        </button>
      </div>
    </div>
  );
}
