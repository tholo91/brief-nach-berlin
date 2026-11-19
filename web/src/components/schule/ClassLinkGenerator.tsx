"use client";

import { useRef, useState } from "react";
import { CampaignQrDownload } from "@/components/campaigns/CampaignQrDownload";
import { createClassLinkAction } from "@/lib/actions/createClassLink";
import { KLASSE_MAX, KLASSE_MIN } from "@/lib/schule/youth";
import { BigQrOverlay } from "./BigQrOverlay";
import {
  LEVEL_OPTIONS,
  STEP_INFO,
  STEP_LABELS,
  classLinkFileName,
  formatValidUntil,
  levelSummary,
  validateClassLinkStep,
  type ClassLinkLevel,
  type ClassLinkStep,
} from "./classLinkHelpers";
import { CopyIcon, ExpandIcon, LinkIcon } from "./icons";

const KLASSEN = Array.from({ length: KLASSE_MAX - KLASSE_MIN + 1 }, (_, i) => KLASSE_MIN + i);

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";
const fieldClass = `mt-1 block min-h-11 w-full rounded-lg border border-waldgruen/25 bg-white px-3 font-body text-base text-warmgrau ${focusRing}`;
const optionClass =
  "flex cursor-pointer items-start gap-2.5 rounded-lg border border-waldgruen/25 bg-white px-3 py-2 transition-colors has-checked:border-waldgruen has-checked:bg-waldgruen/5 has-focus-visible:ring-2 has-focus-visible:ring-waldgruen has-focus-visible:ring-offset-2";
const buttonClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-body text-base font-bold transition-colors ${focusRing}`;

type Delivery = "pdf" | "email";
type Result = { url: string; expiresAt: string; klasse: number; plz: string; delivery: Delivery; level: ClassLinkLevel };

const DELIVERY_OPTIONS: { value: Delivery; label: string; hint: string }[] = [
  { value: "pdf", label: "Als PDF, ohne E-Mail", hint: "Entwurf wird auf dem Gerät gespeichert." },
  { value: "email", label: "Per E-Mail", hint: "Jede Person braucht eine eigene Adresse." },
];

export function ClassLinkGenerator() {
  const [klasse, setKlasse] = useState("");
  const [plz, setPlz] = useState("");
  const [delivery, setDelivery] = useState<Delivery>("pdf");
  const [level, setLevel] = useState<ClassLinkLevel>("auto");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<ClassLinkStep>(1);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (step < 3) {
      goNext();
      return;
    }
    setError("");
    setCopyState("idle");
    const klasseNumber = Number(klasse);
    const plzClean = plz.trim();
    const stepError = validateClassLinkStep(1, { klasse, plz });
    if (stepError) {
      setError(stepError);
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      const response = await createClassLinkAction({ klasse: klasseNumber, plz: plzClean, delivery, level });
      if ("error" in response) {
        setError(response.message);
        setResult(null);
      } else {
        setResult({ url: response.url, expiresAt: response.expiresAt, klasse: klasseNumber, plz: plzClean, delivery, level });
      }
    } catch {
      setError("Das hat gerade nicht geklappt. Bitte versuch es noch einmal.");
    } finally {
      setLoading(false);
    }
  }

  function goNext() {
    const stepError = validateClassLinkStep(step, { klasse, plz });
    setError(stepError);
    if (!stepError && step < 3) setStep((step + 1) as ClassLinkStep);
  }

  function goBack() {
    setError("");
    if (step > 1) setStep((step - 1) as ClassLinkStep);
  }

  function editSettings() {
    setResult(null);
    setError("");
    setStep(1);
    setOverlayOpen(false);
  }

  async function copyLink() {
    if (!result) return;
    window.clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(result.url);
      setCopyState("copied");
      copyTimer.current = window.setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      linkRef.current?.focus();
      linkRef.current?.select();
      setCopyState("manual");
    }
  }

  return (
    <section
      aria-labelledby="schule-generator"
      className="overflow-hidden rounded-sm border border-warmgrau/15 bg-white shadow-[0_20px_50px_-30px_rgba(27,67,50,0.45)]"
    >
      <div
        aria-hidden="true"
        className="h-2 w-full"
        style={{
          background:
            "repeating-linear-gradient(-45deg, #c1121f 0 10px, #faf8f5 10px 15px, #1d3557 15px 25px, #faf8f5 25px 30px)",
        }}
      />
      <div className="p-5 sm:p-7">
        <h2 id="schule-generator" className="font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl">
          Dein Klassenlink
        </h2>

        {!result && (
          <form onSubmit={onSubmit} noValidate className="mt-3">
            <ol className="flex items-center gap-2 font-body text-xs font-semibold" aria-label="Schritte">
              {STEP_LABELS.map(({ step: n, label }) => (
                <li
                  key={n}
                  aria-current={step === n ? "step" : undefined}
                  className={`flex items-center gap-1.5 ${step === n ? "text-waldgruen-dark" : "text-warmgrau/60"}`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${step === n ? "bg-waldgruen text-creme" : step > n ? "bg-waldgruen/20 text-waldgruen-dark" : "border border-warmgrau/30"}`}
                  >
                    {n}
                  </span>
                  {label}
                  {n < 3 && <span aria-hidden="true" className="ml-1 h-px w-4 bg-warmgrau/30 sm:w-8" />}
                </li>
              ))}
            </ol>

            <div className="mt-3 min-h-[11.5rem]">
              <div hidden={step !== 1} className="grid gap-3">
                <div>
                  <label htmlFor="schule-klasse" className="font-body text-sm font-semibold text-waldgruen-dark">
                    Klassenstufe
                  </label>
                  <select
                    id="schule-klasse"
                    required
                    value={klasse}
                    onChange={(e) => setKlasse(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Bitte wählen</option>
                    {KLASSEN.map((value) => (
                      <option key={value} value={value}>
                        Klasse {value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="schule-plz" className="font-body text-sm font-semibold text-waldgruen-dark">
                    Postleitzahl der Schule
                  </label>
                  <input
                    id="schule-plz"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={5}
                    required
                    value={plz}
                    onChange={(e) => setPlz(e.target.value.replace(/\D/g, ""))}
                    aria-describedby={error ? "schule-fehler" : undefined}
                    className={fieldClass}
                  />
                </div>
              </div>

              <fieldset hidden={step !== 2}>
                <legend className="font-body text-sm font-semibold text-waldgruen-dark">Entwurf für die Schüler:innen</legend>
                <div className="mt-1 grid gap-1.5">
                  {DELIVERY_OPTIONS.map((option) => (
                    <label key={option.value} className={optionClass}>
                      <input
                        type="radio"
                        name="schule-delivery"
                        value={option.value}
                        checked={delivery === option.value}
                        onChange={() => setDelivery(option.value)}
                        className="mt-0.5 h-4 w-4 accent-waldgruen"
                      />
                      <span className="font-body text-sm leading-snug">
                        <span className="block font-semibold text-waldgruen-dark">{option.label}</span>
                        <span className="block text-xs text-warmgrau/80">{option.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset hidden={step !== 3}>
                <legend className="font-body text-sm font-semibold text-waldgruen-dark">Empfänger</legend>
                <div className="mt-1 grid gap-1.5">
                  {LEVEL_OPTIONS.map((option) => (
                    <label key={option.value} className={optionClass}>
                      <input
                        type="radio"
                        name="schule-level"
                        value={option.value}
                        checked={level === option.value}
                        onChange={() => setLevel(option.value)}
                        className="mt-0.5 h-4 w-4 accent-waldgruen"
                      />
                      <span className="font-body text-sm leading-snug">
                        <span className="block font-semibold text-waldgruen-dark">{option.label}</span>
                        <span className="block text-xs text-warmgrau/80">{option.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <p className="mt-2 font-body text-xs leading-snug text-warmgrau/80">{STEP_INFO[step]}</p>
            <p id="schule-fehler" role="alert" className="mt-2 font-body text-sm text-airmail-rot empty:hidden">
              {error}
            </p>

            <div className="mt-3 flex gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className={`${buttonClass} border border-waldgruen/40 bg-white text-waldgruen-dark hover:bg-waldgruen/5`}
                >
                  Zurück
                </button>
              )}
              {step < 3 ? (
                <button key="next" type="button" onClick={goNext} className={`${buttonClass} flex-1 bg-waldgruen text-creme hover:bg-waldgruen-dark`}>
                  Weiter
                </button>
              ) : (
                <button
                  key="submit"
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className={`${buttonClass} flex-1 bg-waldgruen text-creme hover:bg-waldgruen-dark disabled:cursor-wait disabled:opacity-70`}
                >
                  <LinkIcon />
                  {loading ? "Link wird erstellt..." : "Link erstellen"}
                </button>
              )}
            </div>
          </form>
        )}

        {result && (
          <div className="mt-4 space-y-5">
            <button
              type="button"
              onClick={() => setOverlayOpen(true)}
              className={`${buttonClass} w-full bg-waldgruen text-creme hover:bg-waldgruen-dark`}
            >
              <ExpandIcon />
              QR-Code groß zeigen
            </button>

            <div>
              <label htmlFor="schule-link" className="font-body text-sm font-semibold text-waldgruen-dark">
                Dein Klassenlink für Klasse {result.klasse}, PLZ {result.plz}
              </label>
              <input
                id="schule-link"
                ref={linkRef}
                readOnly
                value={result.url}
                onFocus={(e) => e.currentTarget.select()}
                className={`${fieldClass} font-mono text-sm`}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={copyLink}
                  className={`${buttonClass} border border-waldgruen/40 bg-white text-waldgruen-dark hover:bg-waldgruen/5`}
                >
                  <CopyIcon />
                  Link kopieren
                </button>
                <span role="status" className="font-body text-sm font-semibold text-waldgruen">
                  {copyState === "copied" && "Kopiert"}
                  {copyState === "manual" && "Der Link ist markiert. Kopier ihn mit Strg+C oder Cmd+C."}
                </span>
              </div>
              <p className="mt-2 font-body text-sm text-warmgrau/80">
                Gültig bis {formatValidUntil(result.expiresAt)}.{" "}
                {result.delivery === "pdf" ? "Die Klasse speichert den Entwurf als PDF." : "Die Klasse bekommt den Entwurf per E-Mail."}{" "}
                {levelSummary(result.level)}
                {" "}Der Link gilt 14 Tage.
              </p>
              <button
                type="button"
                onClick={editSettings}
                className={`mt-2 font-body text-sm font-semibold text-waldgruen-dark underline underline-offset-2 hover:text-waldgruen ${focusRing}`}
              >
                Einstellungen ändern
              </button>
            </div>

            <CampaignQrDownload
              url={result.url}
              slug={`klasse-${result.klasse}`}
              fileName={classLinkFileName(result.klasse)}
              ariaLabel="QR-Code zum Klassenlink"
              description="Zum Ausdrucken oder für die Tafel. Wer scannt, landet direkt beim Brief."
            />
          </div>
        )}
      </div>
      {overlayOpen && result && (
        <BigQrOverlay url={result.url} klasse={result.klasse} onClose={() => setOverlayOpen(false)} />
      )}
    </section>
  );
}
