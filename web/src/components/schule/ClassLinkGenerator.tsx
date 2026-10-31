"use client";

import { useRef, useState } from "react";
import { CampaignQrDownload } from "@/components/campaigns/CampaignQrDownload";
import { createClassLinkAction } from "@/lib/actions/createClassLink";
import { KLASSE_MAX, KLASSE_MIN } from "@/lib/schule/youth";
import { BigQrOverlay } from "./BigQrOverlay";
import { classLinkFileName, formatValidUntil } from "./classLinkHelpers";
import { CopyIcon, ExpandIcon, LinkIcon } from "./icons";

const KLASSEN = Array.from({ length: KLASSE_MAX - KLASSE_MIN + 1 }, (_, i) => KLASSE_MIN + i);

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";
const fieldClass = `mt-2 block min-h-11 w-full rounded-lg border border-waldgruen/25 bg-white px-3 font-body text-base text-warmgrau ${focusRing}`;
const buttonClass = `inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-body text-base font-bold transition-colors ${focusRing}`;

type Delivery = "pdf" | "email";
type Result = { url: string; expiresAt: string; klasse: number; plz: string; delivery: Delivery };

const DELIVERY_OPTIONS: { value: Delivery; label: string; hint: string }[] = [
  { value: "pdf", label: "Als PDF, ohne E-Mail", hint: "Alle speichern den Entwurf auf ihrem Gerät." },
  { value: "email", label: "Per E-Mail", hint: "Jede Person braucht eine eigene Adresse." },
];

export function ClassLinkGenerator() {
  const [klasse, setKlasse] = useState("");
  const [plz, setPlz] = useState("");
  const [delivery, setDelivery] = useState<Delivery>("pdf");
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
      const response = await createClassLinkAction({ klasse: klasseNumber, plz: plzClean, delivery });
      if ("error" in response) {
        setError(response.message);
        setResult(null);
      } else {
        setResult({ url: response.url, expiresAt: response.expiresAt, klasse: klasseNumber, plz: plzClean, delivery });
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
          Dein Klassenlink
        </h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/80">
          Mit der Schul-PLZ schreiben alle an die Abgeordneten deines Schulorts. Der Link gilt 14 Tage.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-5 grid gap-4">
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
          <fieldset>
            <legend className="font-body text-sm font-semibold text-waldgruen-dark">Entwurf für die Schüler:innen</legend>
            <div className="mt-2 grid gap-2">
              {DELIVERY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-waldgruen/25 bg-white p-3 transition-colors has-checked:border-waldgruen has-checked:bg-waldgruen/5 has-focus-visible:ring-2 has-focus-visible:ring-waldgruen has-focus-visible:ring-offset-2"
                >
                  <input
                    type="radio"
                    name="schule-delivery"
                    value={option.value}
                    checked={delivery === option.value}
                    onChange={() => {
                      setDelivery(option.value);
                      setResult(null);
                    }}
                    className="mt-1 h-4 w-4 accent-waldgruen"
                  />
                  <span className="font-body text-sm leading-snug">
                    <span className="block font-semibold text-waldgruen-dark">{option.label}</span>
                    <span className="block text-warmgrau/80">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={`${buttonClass} w-full bg-waldgruen text-creme hover:bg-waldgruen-dark disabled:cursor-wait disabled:opacity-70`}
            >
              <LinkIcon />
              {loading ? "Link wird erstellt..." : "Link erstellen"}
            </button>
            <p id="schule-fehler" role="alert" className="mt-3 font-body text-sm text-airmail-rot empty:hidden">
              {error}
            </p>
          </div>
        </form>

        {result && (
          <div className="mt-6 space-y-5 border-t border-dashed border-waldgruen/40 pt-5">
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
                {result.delivery === "pdf" ? "Die Klasse speichert den Entwurf als PDF." : "Die Klasse bekommt den Entwurf per E-Mail."}
              </p>
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
