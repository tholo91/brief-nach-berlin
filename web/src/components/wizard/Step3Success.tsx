"use client";

import { useState, useCallback } from "react";
import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import { selectPoliticianAction } from "@/lib/actions/selectPolitician";
import { SHARE_URL_WHATSAPP, SHARE_URL_TWITTER } from "@/lib/config";

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

        {/* Share buttons */}
        <div className="mt-10 pt-8 border-t border-warmgrau/15">
          <p className="font-body text-sm text-warmgrau/60 mb-4">
            Andere auch motivieren mitzumachen?
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={SHARE_URL_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-waldgruen border-2 border-waldgruen/40 hover:border-waldgruen px-4 py-2.5 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
              WhatsApp
            </a>
            <a
              href={SHARE_URL_TWITTER}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-waldgruen border-2 border-waldgruen/40 hover:border-waldgruen px-4 py-2.5 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Auf X teilen
            </a>
          </div>
        </div>
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
