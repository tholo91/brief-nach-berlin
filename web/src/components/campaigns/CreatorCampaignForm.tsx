"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createCampaignDraftAction,
  type CreateCampaignDraftResult,
} from "@/lib/actions/createCampaignDraft";

const initialResult: CreateCampaignDraftResult | null = null;

function slugPreview(value: string): string {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function CreatorCampaignForm() {
  const [result, setResult] = useState(initialResult);
  const [isPending, startTransition] = useTransition();
  const [slug, setSlug] = useState("");
  const normalizedSlug = useMemo(() => slugPreview(slug), [slug]);

  return (
    <form
      className="grid gap-5"
      action={(formData) => {
        setResult(null);
        startTransition(async () => {
          setResult(await createCampaignDraftAction(formData));
        });
      }}
    >
      <div className="grid gap-2">
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="creatorEmail">
          E-Mail fuer Freischaltung und spaetere Verwaltung
        </label>
        <input
          id="creatorEmail"
          name="creatorEmail"
          type="email"
          required
          className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
          placeholder="name@organisation.de"
        />
        {result?.ok === false && result.fieldErrors?.creatorEmail && (
          <p className="font-body text-sm text-airmail-rot">{result.fieldErrors.creatorEmail}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="title">
          Kampagnentitel
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={120}
          className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
          placeholder="Mehr sichere Schulwege in Bremen"
        />
      </div>

      <div className="grid gap-2">
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="issueText">
          Vorbefuelltes Anliegen
        </label>
        <textarea
          id="issueText"
          name="issueText"
          required
          minLength={20}
          maxLength={4000}
          rows={8}
          className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base leading-relaxed outline-none focus:border-waldgruen"
          placeholder="Beschreibe das Problem konkret. Schreib nicht den fertigen Brief, sondern den Ausgangspunkt, den Unterstuetzende spaeter mit eigenen Worten anpassen koennen."
        />
        <p className="font-body text-sm text-warmgrau/60">
          Dieser Text wird moderiert und erst nach deiner E-Mail-Bestaetigung oeffentlich.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="creatorName">
            Name oder Organisation optional
          </label>
          <input
            id="creatorName"
            name="creatorName"
            maxLength={120}
            className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
            placeholder="Initiative Musterstadt"
          />
        </div>
        <div className="grid gap-2">
          <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="externalUrl">
            Externer Link optional
          </label>
          <input
            id="externalUrl"
            name="externalUrl"
            type="url"
            maxLength={500}
            className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="description">
          Kurze Beschreibung optional
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={400}
          rows={3}
          className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base leading-relaxed outline-none focus:border-waldgruen"
          placeholder="Ein Satz Kontext, damit Besucherinnen verstehen, warum diese Kampagne existiert."
        />
      </div>

      <div className="grid gap-2">
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="slug">
          Kurzadresse
        </label>
        <div className="flex flex-col gap-2 rounded-md border border-warmgrau/20 bg-white px-4 py-3 md:flex-row md:items-center">
          <span className="font-body text-sm text-warmgrau/55">brief-nach-berlin.de/kampagne/</span>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="min-w-0 flex-1 bg-transparent font-body text-base outline-none"
            placeholder="sichere-schulwege"
          />
        </div>
        <p className="font-body text-sm text-warmgrau/60">
          Vorschau: <span className="font-semibold text-waldgruen-dark">{normalizedSlug || "sichere-schulwege"}</span>
        </p>
        {result?.ok === false && result.fieldErrors?.slug && (
          <p className="font-body text-sm text-airmail-rot">{result.fieldErrors.slug}</p>
        )}
      </div>

      {result && (
        <div
          className={`rounded-md border px-4 py-3 font-body text-sm ${
            result.ok
              ? "border-waldgruen/20 bg-waldgruen/8 text-waldgruen-dark"
              : "border-airmail-rot/25 bg-airmail-rot/5 text-airmail-rot"
          }`}
        >
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Wird geprueft..." : "Kampagne anlegen"}
      </button>
    </form>
  );
}
