"use client";

import { useMemo, useState } from "react";
import type { PoliticalLevel } from "@/lib/types/politician";
import type { LevelRoutingContext } from "@/lib/types/wizard";

// Eigener Wizard-Step "Ebene wählen" (999.6): drei Cards (Bund oben, Land
// Mitte, Kommune unten). Die von Mistral empfohlene Ebene ist vorausgewählt
// und trägt Begründung + Confidence. Der User kann jederzeit überschreiben —
// die Empfehlung ist ein Nudge, keine Entscheidung.

interface StepLevelSelectProps {
  routing: LevelRoutingContext;
  plz: string;
  /** Vorherige Wahl, wenn der User über "Ebene ändern" zurückkommt */
  initialLevel?: PoliticalLevel | null;
  onContinue: (level: PoliticalLevel) => void;
  onBack: () => void;
}

const CONFIDENCE_LABELS: Record<"high" | "medium" | "low", string> = {
  high: "hoch",
  medium: "mittel",
  low: "niedrig",
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

interface LevelCardConfig {
  level: PoliticalLevel;
  title: string;
  institution: string;
  examples: string;
}

const LEVEL_CARDS: LevelCardConfig[] = [
  {
    level: "Bund",
    title: "Bund",
    institution: "Bundestag",
    examples: "Bundesgesetze, Rente, Asyl, Mieten, Verteidigung",
  },
  {
    level: "Land",
    title: "Land",
    institution: "Landtag",
    examples: "Schule, Polizei, Krankenhäuser, Landespolitik",
  },
  {
    level: "Kommune",
    title: "Kommune",
    institution: "Rathaus",
    examples: "Straße, Kita, Müll, Spielplatz, lokale Verwaltung",
  },
];

export function StepLevelSelect({
  routing,
  plz,
  initialLevel,
  onContinue,
  onBack,
}: StepLevelSelectProps) {
  const recommended = routing.recommended;
  const lowConfidence = !recommended || recommended.confidence === "low";

  const availability: Record<PoliticalLevel, boolean> = useMemo(
    () => ({
      Bund: true,
      Land: routing.coverage.landSupported,
      Kommune: routing.coverage.kommuneSupported,
    }),
    [routing.coverage]
  );

  // Vorauswahl: vorherige Wahl (bei "Ebene ändern"), sonst die empfohlene
  // Ebene, wenn verfügbar — sonst Bund. Bei niedriger Confidence keine
  // Vorauswahl (der User soll bewusst wählen).
  const [selected, setSelected] = useState<PoliticalLevel | null>(() => {
    if (initialLevel && availability[initialLevel]) return initialLevel;
    if (!recommended || recommended.confidence === "low") return null;
    if (availability[recommended.level]) return recommended.level;
    return "Bund";
  });

  // Ehrliche Erklärungen für nicht verfügbare Ebenen
  const unavailableHint = (level: PoliticalLevel): string | null => {
    if (availability[level]) return null;
    if (level === "Land") {
      const region = routing.bundeslandName ?? "deinem Bundesland";
      return `Für deine PLZ in ${region} können wir noch keine Landtagsabgeordneten zuordnen. Das kommt bald dazu, solange bleibt der Bund wählbar.`;
    }
    if (level === "Kommune") {
      if (routing.coverage.stadtstaatEinheitsgemeinde && routing.bundeslandName) {
        return `In ${routing.bundeslandName} ist die Stadt zugleich ein Bundesland. Kommunale Anliegen gehören hier zur Land-Ebene.`;
      }
      return "Für diese PLZ konnten wir keine Stadtverwaltung zuordnen.";
    }
    return null;
  };

  // Empfehlung zeigt auf eine nicht verfügbare Ebene → ehrlicher Hinweis oben
  const recommendationGap =
    recommended && !availability[recommended.level] ? routing.coverageHint : null;

  const handleKeyDown = (e: React.KeyboardEvent, index: number, level: PoliticalLevel) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (availability[level]) setSelected(level);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const cards = document.querySelectorAll<HTMLElement>('[data-level-card="true"]');
      const nextIndex =
        e.key === "ArrowDown"
          ? (index + 1) % cards.length
          : (index - 1 + cards.length) % cards.length;
      cards[nextIndex]?.focus();
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="font-body text-sm text-warmgrau/60 hover:text-warmgrau transition-colors mb-6 cursor-pointer flex items-center gap-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        zurück
      </button>

      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark">
        An welche Ebene soll dein Brief gehen?
      </h1>
      <p className="font-body text-base text-warmgrau mt-2">
        Politik hat drei Ebenen. Wir haben dein Anliegen eingeordnet, aber du
        entscheidest, wer den Brief bekommt.
      </p>

      {lowConfidence && (
        <p className="font-body text-sm text-warmgrau mt-4" role="status">
          Wir sind uns nicht ganz sicher, welche Ebene passt. Bitte wähle selbst.
        </p>
      )}

      {recommendationGap && (
        <div
          role="status"
          className="bg-creme border-l-4 border-airmail-rot/60 text-warmgrau p-4 rounded-r-lg text-sm font-body mt-4"
        >
          {recommendationGap}
        </div>
      )}

      <div role="radiogroup" aria-label="Politische Ebene wählen" className="mt-6 space-y-3">
        {LEVEL_CARDS.map((card, index) => {
          const isAvailable = availability[card.level];
          const isSelected = selected === card.level;
          const isRecommended = recommended?.level === card.level;
          const hint = unavailableHint(card.level);
          return (
            <div
              key={card.level}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={!isAvailable}
              data-level-card="true"
              tabIndex={0}
              onClick={() => isAvailable && setSelected(card.level)}
              onKeyDown={(e) => handleKeyDown(e, index, card.level)}
              className={[
                "w-full text-left p-4 rounded-lg border-2 transition-colors",
                isAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                isSelected
                  ? "border-waldgruen bg-waldgruen/10"
                  : isAvailable
                    ? "border-waldgruen/20 bg-creme hover:border-waldgruen/40"
                    : "border-warmgrau/20 bg-creme/60",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                    isSelected
                      ? "border-waldgruen/40 bg-waldgruen text-creme"
                      : "border-waldgruen/20 bg-white text-waldgruen-dark",
                  ].join(" ")}
                >
                  <LevelIcon level={card.level} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-body text-base font-semibold text-warmgrau">
                      {card.title}
                      <span className="font-normal text-warmgrau/70"> · {card.institution}</span>
                    </p>
                    {isRecommended && isAvailable && (
                      <span className="inline-block font-body text-[11px] font-semibold uppercase tracking-wide text-waldgruen-dark bg-waldgruen/15 px-2 py-0.5 rounded">
                        Unsere Empfehlung
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-warmgrau/75 mt-0.5">{card.examples}</p>

                  {isRecommended && isAvailable && recommended && (
                    <div className="mt-2.5 border-t border-waldgruen/15 pt-2.5">
                      {routing.reasoning && (
                        <p className="font-body text-sm text-waldgruen-dark leading-relaxed">
                          {routing.reasoning}
                          {routing.reasoning.endsWith(".") ? "" : "."}
                        </p>
                      )}
                      <p className="font-body text-xs text-warmgrau/60 mt-1">
                        Sicherheit der Einschätzung: {CONFIDENCE_LABELS[recommended.confidence]}
                      </p>
                    </div>
                  )}

                  {hint && (
                    <p className="font-body text-xs text-warmgrau/70 mt-2 leading-relaxed">
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
            "w-full bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl",
            "hover:bg-waldgruen-dark transition-colors min-h-[44px]",
            selected ? "cursor-pointer" : "opacity-60 cursor-not-allowed",
          ].join(" ")}
        >
          Weiter
        </button>
        <p className="text-xs text-warmgrau/60 mt-3 text-center">
          Im nächsten Schritt wählst du, wer genau deinen Brief bekommt (PLZ {plz}).
        </p>
      </div>
    </div>
  );
}
