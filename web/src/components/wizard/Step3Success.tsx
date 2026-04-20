"use client";

import { useState, useCallback } from "react";
import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import { selectPoliticianAction } from "@/lib/actions/selectPolitician";
import { resendLetterAction } from "@/lib/actions/resendLetter";
import { APP_URL, SHARE_TEXT, SHARE_URL_WHATSAPP, SHARE_URL_TWITTER, WIZARD_PATH } from "@/lib/config";

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
  const [resendOpen, setResendOpen] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendEmail, setResendEmail] = useState(wizardData.email);

  const handleSelectPolitician = useCallback(
    async () => {
      if (selectedPoliticianId === null) return;

      setIsGenerating(true);
      setGenerationError(null);

      try {
        // NOTE: we deliberately no longer pass the `politicians` array here —
        // the server re-derives it from PLZ to prevent tampering. Only the
        // numeric ID is accepted as user-supplied input.
        const selectResult = await selectPoliticianAction(
          wizardData,
          selectedPoliticianId
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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Brief nach Berlin",
          text: SHARE_TEXT,
          url: APP_URL,
        });
      } catch {
        // User cancelled — no action needed
      }
    }
  };

  const handleResend = useCallback(async () => {
    if (resendState === "sending" || resendState === "sent") return;
    if (!result || !("success" in result) || !result.politician) return;
    setResendState("sending");
    try {
      const res = await resendLetterAction({ ...wizardData, email: resendEmail }, result.politician);
      setResendState("success" in res ? "sent" : "error");
    } catch {
      setResendState("error");
    }
  }, [resendState, result, wizardData, resendEmail]);

  const emailShareHref = `mailto:?subject=${encodeURIComponent("Brief nach Berlin – schreib deinem Abgeordneten")}&body=${encodeURIComponent(SHARE_TEXT)}`;

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
        {/* Envelope icon */}
        <div className="mb-6">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-waldgruen" aria-hidden="true">
            <rect x="4" y="10" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M4 13 L24 28 L44 13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
            <path d="M30 22l6 6m0-6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0" />
            <circle cx="36" cy="14" r="5" fill="#4ade80" stroke="white" strokeWidth="2" />
            <path d="M34 14l1.5 1.5L37.5 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark">
          Dein Brief ist fertig!
        </h1>
        <p className="font-body text-base text-warmgrau leading-relaxed mt-3">
          Wir haben dir den Brief per E-Mail geschickt. Schau in dein Postfach.
        </p>

        {/* Notice: Brief ist Entwurf, eigene Stimme */}
        <div className="mt-6 border-l-4 border-waldgruen/50 bg-waldgruen/8 rounded-r-lg p-4 space-y-2">
          <p className="font-body text-sm font-semibold text-waldgruen-dark flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-waldgruen" aria-hidden="true">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
            Mach diesen Brief zu deinem.
          </p>
          <p className="font-body text-sm text-warmgrau/75 leading-relaxed">
            Lies ihn durch und pass ihn vor dem Abschreiben an — Ton, Formulierungen, einzelne Argumente. Der Entwurf kommt von KI, die Unterschrift ist deine.
          </p>
        </div>
        <p className="font-body text-xs text-warmgrau/50 mt-2 leading-relaxed">
          KI kann Fehler machen — bitte prüfe Politikerdaten und Inhalt vor dem Versand anhand offizieller Quellen (<a href="https://www.bundestag.de" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-warmgrau/70 transition-colors">bundestag.de</a>).
        </p>

        {/* Step-by-step instructions */}
        <div className="mt-8 space-y-4">
          <h2 className="font-body text-sm font-semibold text-warmgrau/70 uppercase tracking-wide">
            So geht es weiter
          </h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-waldgruen/15 text-waldgruen font-body text-xs font-bold flex items-center justify-center mt-0.5">1</span>
              <p className="font-body text-sm text-warmgrau leading-relaxed">
                <strong>Brief abschreiben.</strong> Schreib den Brief von Hand ab und pass ihn an deinen Schreibstil an. Handgeschriebene Briefe werden im Bundestag tatsächlich gelesen und besprochen.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-waldgruen/15 text-waldgruen font-body text-xs font-bold flex items-center justify-center mt-0.5">2</span>
              <p className="font-body text-sm text-warmgrau leading-relaxed">
                <strong>Adresse aufschreiben, Briefmarke drauf, ab zur Post.</strong> Die Adresse findest du im Brief.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-waldgruen/15 text-waldgruen font-body text-xs font-bold flex items-center justify-center mt-0.5">3</span>
              <p className="font-body text-sm text-warmgrau leading-relaxed">
                <strong>Weitersagen.</strong> Je mehr Menschen schreiben, desto mehr Gewicht hat jeder einzelne Brief.
              </p>
            </li>
          </ol>
        </div>

        {/* Share section */}
        <div className="mt-10 pt-8 border-t border-warmgrau/15">
          <p className="font-body text-sm text-warmgrau/60 mb-4">
            Andere auch motivieren mitzumachen?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={SHARE_URL_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold text-waldgruen border-2 border-waldgruen/40 hover:border-waldgruen px-4 py-2.5 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
              WhatsApp
            </a>
            <a
              href={emailShareHref}
              className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold text-waldgruen border-2 border-waldgruen/40 hover:border-waldgruen px-4 py-2.5 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Per E-Mail
            </a>
            {"share" in navigator ? (
              <>
                <a
                  href={SHARE_URL_TWITTER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold text-waldgruen border-2 border-waldgruen/40 hover:border-waldgruen px-4 py-2.5 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Auf X teilen
                </a>
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold text-waldgruen border-2 border-waldgruen/40 hover:border-waldgruen px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" x2="12" y1="2" y2="15" />
                  </svg>
                  Teilen
                </button>
              </>
            ) : (
              <a
                href={SHARE_URL_TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 inline-flex items-center justify-center gap-2 font-body text-sm font-semibold text-waldgruen border-2 border-waldgruen/40 hover:border-waldgruen px-4 py-2.5 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Auf X teilen
              </a>
            )}
          </div>
        </div>

        {/* Resend help */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setResendOpen((o) => !o)}
            className="font-body text-xs text-warmgrau/50 hover:text-warmgrau/70 transition-colors cursor-pointer underline underline-offset-2"
          >
            Keine E-Mail erhalten?
          </button>
          {resendOpen && (
            <div className="mt-3 p-4 bg-warmgrau/5 rounded-lg space-y-3">
              <p className="font-body text-sm text-warmgrau leading-relaxed">
                Prüfe deinen Spam-Ordner. Falls nichts ankommt, überprüfe deine E-Mail-Adresse und sende den Brief erneut.
              </p>
              {resendState !== "sent" && (
                <div>
                  <label htmlFor="resend-email" className="font-body text-xs text-warmgrau/60 mb-1 block">
                    E-Mail-Adresse
                  </label>
                  <input
                    id="resend-email"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => { setResendEmail(e.target.value); setResendState("idle"); }}
                    className="w-full font-body text-sm text-warmgrau bg-white border border-warmgrau/25 rounded-lg px-3 py-2 focus:outline-none focus:border-waldgruen transition-colors"
                    disabled={resendState === "sending"}
                  />
                </div>
              )}
              <div>
                {resendState === "sent" ? (
                  <p className="font-body text-sm text-waldgruen font-semibold flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                    Brief wurde erneut gesendet
                  </p>
                ) : resendState === "error" ? (
                  <div className="space-y-2">
                    <p className="font-body text-sm text-airmail-rot">Senden fehlgeschlagen. Bitte versuche es später erneut.</p>
                    <button
                      type="button"
                      onClick={handleResend}
                      className="font-body text-sm text-waldgruen font-semibold underline underline-offset-2 hover:text-waldgruen-dark transition-colors cursor-pointer"
                    >
                      Nochmal versuchen
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendState === "sending" || !resendEmail.trim()}
                    className={[
                      "font-body text-sm font-semibold text-waldgruen border border-waldgruen/30 px-4 py-2 rounded-lg transition-colors",
                      resendState === "sending" || !resendEmail.trim() ? "opacity-60 cursor-not-allowed" : "hover:bg-waldgruen/8 cursor-pointer",
                    ].join(" ")}
                  >
                    {resendState === "sending" ? (
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        Wird gesendet...
                      </span>
                    ) : (
                      "Brief erneut senden"
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="mt-6 space-y-3">
          <a
            href={WIZARD_PATH}
            className="w-full inline-flex items-center justify-center gap-2 font-body text-sm font-semibold text-waldgruen border-2 border-waldgruen/40 hover:border-waldgruen px-4 py-2.5 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12l7-7 7 7"/>
            </svg>
            Neuen Brief schreiben
          </a>
          <p className="text-center">
            <a
              href="/"
              className="font-body text-xs text-warmgrau/50 hover:text-warmgrau/70 transition-colors"
            >
              ← Zurück zur Startseite
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Sub-state B: Disambiguation
  if ("disambiguationNeeded" in result && result.disambiguationNeeded) {
    return (
      <div>
        <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark">
          Wer vertritt deinen Wahlkreis?
        </h1>
        <p className="font-body text-base text-warmgrau mt-2">
          Deine PLZ liegt in mehreren Wahlkreisen. Wähle den Wahlkreis, in dem du wohnst – der dortige Abgeordnete ist dein direkter Ansprechpartner im Bundestag.
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
              <p className="font-body text-sm text-warmgrau/70 mt-1">
                Wahlkreis {p.wahlkreisId}: {p.wahlkreisName}
              </p>
            </button>
          ))}
        </div>

        {/* Submit after selection — full width to match cards */}
        {selectedPoliticianId !== null && (
          <div className="mt-8">
            <button
              type="button"
              onClick={handleSelectPolitician}
              disabled={isGenerating}
              className={[
                "w-full bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl",
                "hover:bg-waldgruen-dark transition-colors min-h-[44px]",
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
