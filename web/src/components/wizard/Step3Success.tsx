"use client";

import { useState, useEffect, useCallback } from "react";
import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import { selectPoliticianAction } from "@/lib/actions/selectPolitician";

interface Step3SuccessProps {
  result: WizardActionResult | null;
  wizardData: WizardData;
  politicians: Politician[];
}

export function Step3Success({ result, wizardData, politicians }: Step3SuccessProps) {
  const [selectedPoliticianId, setSelectedPoliticianId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  // Letter text stored in component state for Phase 3 email pickup (forward contract)
  const [letterText, setLetterText] = useState<string | null>(null);

  // Store letter text when result arrives with success
  useEffect(() => {
    if (result && "success" in result && result.success) {
      setLetterText(result.letter);
    }
  }, [result]);

  const handleSelectPolitician = useCallback(
    async () => {
      if (selectedPoliticianId === null) return;

      setIsGenerating(true);
      setGenerationError(null);

      try {
        const selectResult = await selectPoliticianAction(
          wizardData,
          selectedPoliticianId,
          politicians
        );

        if ("error" in selectResult) {
          setGenerationError(selectResult.message);
          setIsGenerating(false);
          return;
        }

        if ("success" in selectResult && selectResult.success) {
          setLetterText(selectResult.letter);
          setGenerationComplete(true);
        }
      } catch {
        setGenerationError(
          "Es ist ein Fehler aufgetreten. Bitte versuche es erneut."
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [selectedPoliticianId, wizardData, politicians]
  );

  // Keyboard navigation for politician cards
  const handleCardKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    politicianId: number
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedPoliticianId(politicianId);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const cards = document.querySelectorAll<HTMLElement>('[role="radio"]');
      const nextIndex =
        e.key === "ArrowDown"
          ? (index + 1) % cards.length
          : (index - 1 + cards.length) % cards.length;
      cards[nextIndex]?.focus();
    }
  };

  if (!result) return null;

  // Sub-state C: Level data missing (D-07)
  if ("error" in result && result.error === "level_data_missing") {
    return (
      <div>
        <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark">
          Daten nicht verfügbar
        </h1>
        <p className="font-body text-base text-warmgrau leading-relaxed mt-6">
          {result.message}
        </p>
        {"fallbackUrl" in result && (
          <a
            href={result.fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-waldgruen underline hover:text-waldgruen-dark font-body text-base"
          >
            {result.fallbackUrl}
          </a>
        )}
      </div>
    );
  }

  // Sub-state A: Processing / Success (single Wahlkreis or after disambiguation)
  if (
    ("success" in result && result.success) ||
    generationComplete
  ) {
    return (
      <div>
        <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark">
          Dein Brief wird erstellt ...
          <span
            className="inline-block w-[2px] h-[28px] bg-waldgruen-dark animate-pulse ml-1 align-middle"
            aria-hidden="true"
          />
        </h1>
        <p className="font-body text-base text-warmgrau leading-relaxed mt-6">
          Wir analysieren dein Anliegen, finden den zuständigen Abgeordneten und
          formulieren deinen Brief mit den besten Argumenten. Das kann einen
          Moment dauern — wir schicken dir den Brief per Mail zu.
        </p>
        <p className="font-handwriting text-base text-warmgrau mt-8">
          Dein Anliegen ist auf dem Weg.
        </p>
      </div>
    );
  }

  // Sub-state B: Disambiguation
  if ("disambiguationNeeded" in result && result.disambiguationNeeded) {
    return (
      <div>
        <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark">
          Wir haben mehrere Abgeordnete gefunden
        </h1>
        <p className="font-body text-base text-warmgrau mt-2">
          Wer soll deinen Brief erhalten?
        </p>

        {/* Error banner */}
        {generationError && (
          <div
            role="alert"
            className="bg-airmail-rot/10 border-l-4 border-airmail-rot text-airmail-rot p-4 rounded-r-lg text-sm font-body mt-4"
          >
            {generationError}
          </div>
        )}

        {/* Politician cards */}
        <div role="radiogroup" aria-label="Abgeordnete auswählen" className="space-y-3 mt-6">
          {politicians.map((p, index) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selectedPoliticianId === p.id}
              tabIndex={0}
              onClick={() => setSelectedPoliticianId(p.id)}
              onKeyDown={(e) => handleCardKeyDown(e, index, p.id)}
              className={[
                "w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer",
                selectedPoliticianId === p.id
                  ? "border-waldgruen bg-waldgruen/10"
                  : "border-waldgruen/20 bg-creme hover:border-waldgruen/40",
              ].join(" ")}
            >
              <p className="font-body text-base font-semibold text-warmgrau">
                {p.title ? p.title + " " : ""}
                {p.firstName} {p.lastName}
              </p>
              <p className="font-body text-sm text-warmgrau mt-0.5">{p.party}</p>
              <p className="font-body text-sm text-warmgrau/70 mt-0.5">
                {p.wahlkreisName}
              </p>
            </button>
          ))}
        </div>

        {/* Submit after selection */}
        {selectedPoliticianId !== null && (
          <div className="mt-8">
            <button
              type="button"
              onClick={handleSelectPolitician}
              disabled={isGenerating}
              className={[
                "bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl",
                "hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full sm:w-auto",
                isGenerating ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Brief wird erstellt...
                </span>
              ) : (
                "Brief anfordern"
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
