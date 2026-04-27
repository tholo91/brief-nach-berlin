"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import { selectPoliticianAction } from "@/lib/actions/selectPolitician";
import { resendLetterAction } from "@/lib/actions/resendLetter";
import {
  APP_URL,
  SHARE_TEXT_CAUSE,
  SHARE_URL_EMAIL,
  FOUNDER_FEEDBACK_URL,
} from "@/lib/config";

const REPLY_REQUEST_SENTENCE =
  "Ich würde mich über eine kurze Rückmeldung freuen, ob und wie Sie dieses Anliegen aufgreifen werden.";

function ReplyHelperDisclosure() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(REPLY_REQUEST_SENTENCE);
      setCopied(true);
    } catch {
      // Clipboard blocked: leave the example visible for manual copy.
    }
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="mt-6 border-l-4 border-airmail-blau/60 bg-airmail-blau/[0.04] rounded-r-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="reply-helper-content"
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left font-body text-sm font-semibold text-airmail-blau hover:bg-airmail-blau/[0.07] transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10a6 6 0 0 1 6 6v0a6 6 0 0 1-6 6H8" />
          </svg>
          Antwort wünschen? Optional ergänzen
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        id="reply-helper-content"
        className={`transition-all duration-300 ease-out overflow-hidden ${open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 pb-4 pt-1 font-body text-sm text-warmgrau leading-relaxed space-y-3">
          <p>
            Dein Brief zielt darauf, dass dein Anliegen politisch behandelt wird, nicht
            unbedingt, dass du eine persönliche Antwort bekommst. Wenn du dir trotzdem
            eine Rückmeldung wünschst, schreib einfach folgenden Satz von Hand am Ende
            des Briefs dazu, vor der Grußformel:
          </p>
          <div className="rounded-md bg-creme/70 border border-warmgrau/15 px-3 py-2 font-typewriter text-[13px] text-warmgrau italic">
            &bdquo;{REPLY_REQUEST_SENTENCE}&ldquo;
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 font-body text-xs font-semibold text-airmail-blau border border-airmail-blau/40 hover:bg-airmail-blau/[0.08] px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Kopiert
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Satz kopieren
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Step3SuccessProps {
  result: WizardActionResult | null;
  wizardData: WizardData;
  politicians: Politician[];
}

export function Step3Success({ result, wizardData, politicians }: Step3SuccessProps) {
  // Pre-select the first Direktmandat-holder so users land on the most
  // politically relevant option without an extra click. If no Direktmandat
  // exists (Wahlrechtsreform 2025: 23 Wahlkreise sind unbesetzt), the user
  // chooses manually.
  const [selectedPoliticianId, setSelectedPoliticianId] = useState<number | null>(
    () => politicians.find((p) => p.isDirect)?.id ?? null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [resendOpen, setResendOpen] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error" | "limited">("idle");
  const [resendLimitMessage, setResendLimitMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState(wizardData.email);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  // Smooth-scroll the submit button into view after a card is picked, so users
  // on long lists don't have to hunt for the next step. Honor
  // prefers-reduced-motion (vestibular-disorder safety, WCAG 2.3.3).
  const handleCardSelect = useCallback((politicianId: number) => {
    setSelectedPoliticianId(politicianId);
    requestAnimationFrame(() => {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      submitButtonRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      });
    });
  }, []);

  // Direktmandate first, then list/Nachrücker (stable within each group)
  const sortedPoliticians = useMemo(() => {
    return [...politicians].sort((a, b) => Number(b.isDirect) - Number(a.isDirect));
  }, [politicians]);

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
    [selectedPoliticianId, wizardData]
  );

  // Keyboard navigation for politician cards
  const handleCardKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    politicianId: number
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardSelect(politicianId);
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

  const [copied, setCopied] = useState(false);

  // Single "Teilen" button: native share when available, fall back to clipboard copy.
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Brief nach Berlin",
          text: SHARE_TEXT_CAUSE,
          url: APP_URL,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy fallback below
      }
    }
    try {
      await navigator.clipboard.writeText(SHARE_TEXT_CAUSE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked, fail silently
    }
  };

  const handleResend = useCallback(async () => {
    if (resendState === "sending" || resendState === "sent" || resendState === "limited") return;
    if (!result || !("success" in result) || !result.politician) return;
    setResendState("sending");
    try {
      const res = await resendLetterAction({ ...wizardData, email: resendEmail }, result.politician);
      if ("success" in res) {
        setResendState("sent");
      } else if (res.error === "rate_limited") {
        setResendLimitMessage(res.message);
        setResendState("limited");
      } else {
        setResendState("error");
      }
    } catch {
      setResendState("error");
    }
  }, [resendState, result, wizardData, resendEmail]);

  const emailShareHref = SHARE_URL_EMAIL;

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
        {/* Header: envelope + headline side by side */}
        <div className="flex items-center gap-3 mb-3">
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" className="text-waldgruen flex-shrink-0" aria-hidden="true">
            <rect x="4" y="10" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M4 13 L24 28 L44 13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          </svg>
          <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark m-0">
            Dein Brief ist fertig!
          </h1>
        </div>
        <p className="font-body text-base text-warmgrau leading-relaxed mt-3">
          Wir haben dir den Brief per E-Mail geschickt. Schau in dein Postfach.
        </p>

        {/* Notice: Brief ist Entwurf, eigene Stimme */}
        <div className="mt-6 border-l-4 border-waldgruen/50 bg-waldgruen/8 rounded-r-lg p-4 space-y-2">
          <p className="font-body text-sm font-semibold text-waldgruen-dark flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-waldgruen" aria-hidden="true">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
            Mach diesen Brief zu deinem Brief.
          </p>
          <p className="font-body text-sm text-warmgrau/75 leading-relaxed">
            Lies dir die Mail durch und pass den Brief an, damit er sich nach dir anfühlt und dein Anliegen perfekt platziert. Ton, Formulierungen, einzelne Argumente: Der Entwurf kommt von uns, die Unterschrift ist deine.
          </p>
        </div>

        {/* "Keine E-Mail erhalten?" — placed close to the email notice for context */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setResendOpen((o) => !o)}
            className="font-body text-sm text-warmgrau/55 hover:text-warmgrau/75 transition-colors cursor-pointer underline underline-offset-2"
          >
            Keine E-Mail erhalten?
          </button>
        </div>
        {resendOpen && (
          <div className="mt-3 p-4 bg-warmgrau/5 rounded-lg space-y-3">
              <p className="font-body text-sm text-warmgrau leading-relaxed">
                Prüfe deinen Spam-Ordner. Falls nichts ankommt, überprüfe deine E-Mail-Adresse und sende den Brief erneut.
              </p>
              {resendState !== "sent" && resendState !== "limited" && (
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
                ) : resendState === "limited" ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-2.5 rounded-lg bg-waldgruen/5 border border-waldgruen/20 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-waldgruen flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                    </svg>
                    <div className="space-y-1.5">
                      <p className="font-body text-sm font-semibold text-waldgruen-dark">Maximal dreimal gesendet</p>
                      <p className="font-body text-sm text-warmgrau leading-relaxed">
                        {resendLimitMessage ?? "Wir haben dir den Brief jetzt mehrfach gesendet. Bitte prüfe noch einmal deinen Spam-Ordner und die E-Mail-Adresse."}
                      </p>
                      <a
                        href={FOUNDER_FEEDBACK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block font-body text-sm font-semibold text-waldgruen underline underline-offset-2 hover:text-waldgruen-dark"
                      >
                        Hilfe anfragen
                      </a>
                    </div>
                  </div>
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

        {/* Optional reply-request helper — handwritten add-on, between letter and next-steps */}
        <ReplyHelperDisclosure />

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

        {/* Cause-recruit share section: motivate Wahlkreis-Bürger to write their own letters */}
        <div className="mt-10 pt-8 border-t border-warmgrau/15">
          <div className="rounded-xl bg-waldgruen/8 border border-waldgruen/20 p-5">
            <h2 className="font-typewriter text-lg font-semibold text-waldgruen-dark">
              Gemeinsam noch lauter
            </h2>
            <p className="font-body text-sm text-warmgrau leading-relaxed mt-2">
              Dein Brief wirkt. Und er wirkt noch stärker, wenn weitere Stimmen aus deinem Wahlkreis dazukommen. Briefe aus derselben Gegend zum gleichen Thema bekommen im Bundestag besonderes Gewicht.
            </p>
            <p className="font-body text-sm text-warmgrau leading-relaxed mt-3">
              Motiviere gern andere, mitzumachen! Über Politik meckern fühlt sich noch besser an, wenn man einen Brief schreibt 😉
            </p>

            {/* Two primary share buttons, equal width */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <a
                href={emailShareHref}
                className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold text-creme bg-waldgruen hover:bg-waldgruen-dark px-3 py-3 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Per E-Mail
              </a>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold text-creme bg-waldgruen hover:bg-waldgruen-dark px-3 py-3 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    Kopiert
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" x2="12" y1="2" y2="15" />
                    </svg>
                    Teilen
                  </>
                )}
              </button>
            </div>

            {/* Secondary feedback button */}
            <a
              href={FOUNDER_FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 font-body text-sm font-semibold text-waldgruen bg-creme border-2 border-waldgruen/40 hover:border-waldgruen hover:bg-white px-3 py-2.5 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Feedback &amp; Anregung
            </a>
          </div>
        </div>

        {/* Back to home, centered at the very bottom */}
        <div className="mt-10 flex justify-center">
          <a
            href="/"
            className="font-body text-sm text-warmgrau/55 hover:text-warmgrau/75 transition-colors underline underline-offset-2"
          >
            ← Zurück zur Startseite
          </a>
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
          Deine PLZ liegt in mehreren Wahlkreisen. Standardmäßig haben wir die Person mit dem Direktmandat ausgewählt — sie ist dein:e direkt gewählte:r Ansprechpartner:in im Bundestag. Du kannst aber auch eine andere Person wählen.
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

        {/* Politician cards — switch to 2-col grid on long lists (e.g. PLZs that
            straddle several Wahlkreise) so the disambiguation step doesn't turn
            into an endless scroll. */}
        <div
          role="radiogroup"
          aria-label="Abgeordnete auswählen"
          className={[
            "mt-6",
            sortedPoliticians.length > 5
              ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
              : "space-y-3",
          ].join(" ")}
        >
          {sortedPoliticians.map((p, index) => (
            <div
              key={p.id}
              role="radio"
              aria-checked={selectedPoliticianId === p.id}
              tabIndex={0}
              onClick={() => handleCardSelect(p.id)}
              onKeyDown={(e) => handleCardKeyDown(e, index, p.id)}
              className={[
                "w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer",
                selectedPoliticianId === p.id
                  ? "border-waldgruen bg-waldgruen/10"
                  : "border-waldgruen/20 bg-creme hover:border-waldgruen/40",
              ].join(" ")}
            >
              {p.isDirect && (
                <span className="inline-block font-body text-[11px] font-semibold uppercase tracking-wide text-waldgruen-dark bg-waldgruen/15 px-2 py-0.5 rounded mb-1.5">
                  Direktmandat
                </span>
              )}
              <p className="font-body text-base font-semibold text-warmgrau">
                {p.title ? p.title + " " : ""}
                {p.firstName} {p.lastName}
              </p>
              <p className="font-body text-sm text-warmgrau mt-0.5">{p.party}</p>
              <p className="font-body text-sm text-warmgrau/70 mt-1">
                Wahlkreis {p.wahlkreisId}: {p.wahlkreisName}
              </p>
              {p.abgeordnetenwatchUrl && (
                <a
                  href={p.abgeordnetenwatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block font-body text-xs text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 mt-2"
                >
                  Profil auf Abgeordnetenwatch.de ↗
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Submit after selection — full width to match cards */}
        {selectedPoliticianId !== null && (
          <div className="mt-8">
            <button
              ref={submitButtonRef}
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
                "Brief erstellen"
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
