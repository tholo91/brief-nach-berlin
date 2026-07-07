"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getPendingLetterVariantSubmission,
  retryPendingLetterVariant,
  submitPendingLetterVariant,
  type LetterVariantSubmissionResult,
} from "@/lib/client/letterVariantSubmission";

type Status = "sending" | "sent" | "error" | "missing";

function statusFromResult(result: LetterVariantSubmissionResult): Status {
  if (result.status === "success") return "sent";
  if (result.status === "missing") return "missing";
  return "error";
}

export function VariantSuccessClient() {
  const [status, setStatus] = useState<Status>("sending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);
  const [loadingDots, setLoadingDots] = useState(".");
  const [email] = useState(() => getPendingLetterVariantSubmission()?.email ?? "");

  const applyResult = useCallback((result: LetterVariantSubmissionResult) => {
    setStatus(statusFromResult(result));
    if (result.status === "error") {
      setErrorMessage(result.message);
      setRetryAfterSeconds(result.retryAfterSeconds ?? null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    submitPendingLetterVariant().then((result) => {
      if (!active) return;
      applyResult(result);
    });
    return () => {
      active = false;
    };
  }, [applyResult]);

  const handleRetry = useCallback(async () => {
    setStatus("sending");
    setErrorMessage(null);
    setRetryAfterSeconds(null);
    applyResult(await retryPendingLetterVariant());
  }, [applyResult]);

  useEffect(() => {
    if (status !== "sending") return;
    const interval = window.setInterval(() => {
      setLoadingDots((current) => (current.length >= 3 ? "." : current + "."));
    }, 500);
    return () => window.clearInterval(interval);
  }, [status]);

  const headline =
    status === "sent"
      ? "Angepasster Brief wurde dir zugeschickt."
      : status === "missing"
        ? "Der eingefügte Brief ist nicht mehr verfügbar."
        : status === "error"
          ? "Die Anpassung hat noch nicht geklappt."
          : "Wir formulieren deine neue Variante.";
  const lead =
    status === "sent"
      ? "Prüfe dein Postfach. Wir haben dir nur den neuen Text geschickt, die Anschrift und die Hinweise bleiben in deiner ersten Brief-Mail."
      : status === "missing"
        ? "Aus Datenschutzgründen speichern wir deinen eingefügten Brieftext nicht. Bitte gehe zurück und füge den Brief noch einmal ein."
        : status === "error"
          ? "Dein Brieftext wurde nicht gespeichert. Du kannst es direkt noch einmal versuchen, solange diese Seite geöffnet bleibt."
          : `Das dauert meist nur ein paar Sekunden. Du kannst gleich in dein E-Mail-Postfach schauen${loadingDots}`;

  return (
    <div className="min-h-[100dvh] bg-creme px-6 py-16 overflow-x-clip">
      <main className="mx-auto grid w-full max-w-3xl gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-start">
        <section>
          <div className="mb-4 flex items-center gap-3">
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none" className="shrink-0 text-waldgruen" aria-hidden="true">
              <rect x="4" y="10" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="2.5" />
              <path d="M4 13 L24 28 L44 13" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
              {status === "sent" ? "Verschickt" : status === "sending" ? "In Arbeit" : "Hinweis"}
            </p>
          </div>

          <h1 className="font-typewriter text-[28px] font-semibold leading-[1.18] text-waldgruen-dark">
            {headline}
          </h1>
          <p className="mt-4 font-body text-base leading-relaxed text-warmgrau/75">
            {lead}
          </p>

          {status === "sending" && (
            <div className="mt-7 border-l-4 border-waldgruen/50 bg-waldgruen/8 p-4 rounded-r-lg">
              <p className="font-body text-sm font-semibold text-waldgruen-dark">
                Mistral überarbeitet gerade nur deinen bestehenden Brief.
              </p>
              <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau/75">
                Fakten, Forderung, Anrede und Grußformel sollen erhalten bleiben. Geändert werden Ton, Klarheit und Formulierungen.
              </p>
            </div>
          )}

          {status === "error" && (
            <div role="alert" className="mt-7 border-l-4 border-airmail-rot bg-airmail-rot/10 p-4 rounded-r-lg">
              <p className="font-body text-sm font-semibold text-airmail-rot">
                {errorMessage}
              </p>
              {retryAfterSeconds && (
                <p className="mt-1 font-body text-sm text-airmail-rot/80">
                  Bitte warte etwa {retryAfterSeconds >= 90 ? `${Math.ceil(retryAfterSeconds / 60)} Minuten` : `${retryAfterSeconds} Sekunden`}.
                </p>
              )}
              <button
                type="button"
                onClick={() => void handleRetry()}
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-airmail-rot px-5 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-airmail-rot/90 active:translate-y-px"
              >
                Nochmal versuchen
              </button>
            </div>
          )}

          {status === "missing" && (
            <Link
              href="/brief/anpassen"
              className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-waldgruen px-5 py-3 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark active:translate-y-px"
            >
              Zurück zum Formular
            </Link>
          )}

          {status === "sent" && (
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-waldgruen px-5 py-3 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark active:translate-y-px"
              >
                Zur Startseite
              </Link>
              <Link
                href="/brief/anpassen"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-waldgruen/35 px-5 py-3 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:bg-waldgruen/8 active:translate-y-px"
              >
                Noch eine Variante
              </Link>
            </div>
          )}
        </section>

        <aside className="space-y-7 border-t border-warmgrau/15 pt-7 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <section>
            <h2 className="font-typewriter text-lg font-semibold text-waldgruen-dark">
              So geht es weiter
            </h2>
            <ol className="mt-4 space-y-4">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-waldgruen/15 font-body text-xs font-bold text-waldgruen">1</span>
                <p className="font-body text-sm leading-relaxed text-warmgrau/75">
                  Öffne die neue Mail und lies die Variante gründlich.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-waldgruen/15 font-body text-xs font-bold text-waldgruen">2</span>
                <p className="font-body text-sm leading-relaxed text-warmgrau/75">
                  Nimm Adresse, Briefmarkenhinweis und Tipps aus deiner ersten Brief-Mail.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-waldgruen/15 font-body text-xs font-bold text-waldgruen">3</span>
                <p className="font-body text-sm leading-relaxed text-warmgrau/75">
                  Schreib die bessere Fassung von Hand ab oder passe einzelne Sätze weiter an.
                </p>
              </li>
            </ol>
          </section>

          <section className="border-t border-warmgrau/15 pt-6">
            <h2 className="font-typewriter text-lg font-semibold text-waldgruen-dark">
              Gut zu wissen
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-warmgrau/75">
              Wir schicken dir hier nur einen neuen Text. Bewertungen, Adresse und die ausführlichen Versandtipps bleiben bewusst in der ursprünglichen Mail.
            </p>
            {email && (
              <p className="mt-3 font-body text-xs leading-relaxed text-warmgrau/55">
                Angefordert für {email}
              </p>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}
