"use client";

import { useRef, useState } from "react";
import { CampaignQrDownload } from "@/components/campaigns/CampaignQrDownload";
import { createClassLinkAction } from "@/lib/actions/createClassLink";
import { KLASSE_MAX, KLASSE_MIN } from "@/lib/schule/youth";
import { BigQrOverlay } from "./BigQrOverlay";
import { classLinkFileName, formatValidUntil } from "./classLinkHelpers";

const KLASSEN = Array.from({ length: KLASSE_MAX - KLASSE_MIN + 1 }, (_, i) => KLASSE_MIN + i);

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";
const fieldClass = `mt-2 block min-h-11 w-full rounded-lg border border-waldgruen/25 bg-white px-3 font-body text-base text-warmgrau ${focusRing}`;
const buttonClass = `inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2.5 font-body text-sm font-semibold transition-colors ${focusRing}`;

type Result = { url: string; expiresAt: string; klasse: number; plz: string };

export function ClassLinkGenerator() {
  const [klasse, setKlasse] = useState("");
  const [plz, setPlz] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setCopyState("idle");
    const klasseNumber = Number(klasse);
    const plzClean = plz.trim();
    if (!klasse) {
      setError("Wähl zuerst die Klassenstufe.");
      return;
    }
    if (!/^\d{5}$/.test(plzClean)) {
      setError("Gib eine fünfstellige Postleitzahl ein.");
      return;
    }
    setLoading(true);
    try {
      const response = await createClassLinkAction({ klasse: klasseNumber, plz: plzClean });
      if ("error" in response) {
        setError(response.message);
        setResult(null);
      } else {
        setResult({ url: response.url, expiresAt: response.expiresAt, klasse: klasseNumber, plz: plzClean });
      }
    } catch {
      setError("Das hat gerade nicht geklappt. Bitte versuch es noch einmal.");
    } finally {
      setLoading(false);
    }
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
          Klassenlink erstellen
        </h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/80">
          Mit der Schul-PLZ schreiben alle an die Abgeordneten deines Schulorts. Der Link gilt 14 Tage.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={`${buttonClass} w-full bg-waldgruen text-creme hover:bg-waldgruen-dark disabled:cursor-wait disabled:opacity-70 sm:w-fit`}
            >
              {loading ? "Link wird erstellt..." : "Klassenlink erstellen"}
            </button>
            <p id="schule-fehler" role="alert" className="mt-3 font-body text-sm text-airmail-rot">
              {error}
            </p>
          </div>
        </form>

        {result && (
          <div className="mt-6 space-y-5 rounded-md border border-dashed border-waldgruen/40 bg-creme/60 p-4 sm:p-5">
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
                <button type="button" onClick={copyLink} className={`${buttonClass} bg-waldgruen text-creme hover:bg-waldgruen-dark`}>
                  Link kopieren
                </button>
                <span role="status" className="font-body text-sm font-semibold text-waldgruen">
                  {copyState === "copied" && "Kopiert"}
                  {copyState === "manual" && "Der Link ist markiert. Kopier ihn mit Strg+C oder Cmd+C."}
                </span>
              </div>
              <p className="mt-2 font-body text-sm text-warmgrau/80">
                Gültig bis {formatValidUntil(result.expiresAt)}
              </p>
            </div>

            <CampaignQrDownload
              url={result.url}
              slug={`klasse-${result.klasse}`}
              fileName={classLinkFileName(result.klasse)}
              ariaLabel="QR-Code zum Klassenlink"
              description="Zum Ausdrucken oder für die Tafel. Wer scannt, landet direkt beim Brief."
            />

            <button
              type="button"
              onClick={() => setOverlayOpen(true)}
              className={`${buttonClass} w-full border border-waldgruen/40 bg-white text-waldgruen-dark hover:bg-waldgruen/5 sm:w-fit`}
            >
              QR-Code groß zeigen
            </button>
          </div>
        )}
      </div>
      {overlayOpen && result && (
        <BigQrOverlay url={result.url} klasse={result.klasse} onClose={() => setOverlayOpen(false)} />
      )}
    </section>
  );
}
