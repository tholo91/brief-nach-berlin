"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatPartyShort } from "@/lib/formatParty";
import type {
  RecipientSearchCard,
  RecipientSearchLevel,
  RecipientSearchResult,
} from "@/lib/lookup/recipientSearch";

interface AlternativeRecipientPickerProps {
  level: RecipientSearchLevel;
  plz: string;
  selectedId: number | null;
  onSelect: (politician: RecipientSearchCard) => void;
}

export function AlternativeRecipientPicker({
  level,
  plz,
  selectedId,
  onSelect,
}: AlternativeRecipientPickerProps) {
  const [party, setParty] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<RecipientSearchCard[]>([]);
  const [parties, setParties] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (offset: number, append: boolean) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(false);
      try {
        const response = await fetch("/api/recipient-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level, plz, party, query, offset }),
        });
        if (!response.ok) throw new Error("recipient search failed");
        const result = (await response.json()) as RecipientSearchResult;
        if (requestId !== requestIdRef.current) return;
        setItems((current) => (append ? [...current, ...result.items] : result.items));
        setParties(result.parties);
        setTotal(result.total);
        setNextOffset(result.nextOffset);
      } catch {
        if (requestId === requestIdRef.current) setError(true);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [level, party, plz, query]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(0, false), 250);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const searchReady = Boolean(party) || query.trim().length >= 2;

  return (
    <div className="mt-4 rounded-xl border border-waldgruen/20 bg-creme/60 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-body text-sm font-semibold text-waldgruen-dark">
            {level === "Bund" ? "Bundesweit suchen" : "Im Bundesland suchen"}
          </p>
          <p className="mt-1 font-body text-xs leading-relaxed text-warmgrau/70">
            Diese Personen sind nicht aus deinem Wahlkreis.
          </p>
        </div>
        <span className="shrink-0 rounded bg-warmgrau/10 px-2 py-1 font-body text-[11px] font-semibold text-warmgrau/65">
          Nicht aus deinem Wahlkreis
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Partei auswählen">
        {parties.map((option) => {
          const active = option === party;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => setParty(active ? "" : option)}
              className={[
                "rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition-colors",
                active
                  ? "border-waldgruen bg-waldgruen text-creme"
                  : "border-warmgrau/25 bg-creme text-waldgruen-dark hover:border-waldgruen/50",
              ].join(" ")}
            >
              {formatPartyShort(option)}
            </button>
          );
        })}
      </div>

      <label className="mt-4 grid gap-1.5" htmlFor={`alternative-recipient-${level}`}>
        <span className="font-body text-sm font-semibold text-waldgruen-dark">
          Person suchen
        </span>
        <input
          id={`alternative-recipient-${level}`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            level === "Bund"
              ? "Name, Partei, Wahlkreis oder Ausschuss"
              : "Name, Partei oder Wahlkreis"
          }
          className="rounded-lg border border-warmgrau/30 bg-creme px-4 py-3 font-body text-base text-warmgrau outline-none focus:border-waldgruen focus:ring-2 focus:ring-waldgruen"
        />
      </label>

      {!searchReady && !loading && (
        <p className="mt-3 font-body text-sm text-warmgrau/65">
          Wähle eine Partei oder gib mindestens zwei Zeichen ein.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 font-body text-sm text-airmail-rot">
          Die Suche konnte nicht geladen werden. Bitte versuche es erneut.
        </p>
      )}

      {searchReady && items.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" role="radiogroup">
          {items.map((politician) => (
            <button
              key={politician.id}
              type="button"
              role="radio"
              aria-checked={selectedId === politician.id}
              onClick={() => onSelect(politician)}
              className={[
                "h-full rounded-lg border-2 p-4 text-left transition-colors",
                selectedId === politician.id
                  ? "border-waldgruen bg-waldgruen/10"
                  : "border-waldgruen/20 bg-creme hover:border-waldgruen/40",
              ].join(" ")}
            >
              <span className="mb-1.5 inline-block rounded bg-warmgrau/10 px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide text-warmgrau/60">
                Nicht aus deinem Wahlkreis
              </span>
              <p className="font-body text-base font-semibold text-warmgrau">
                {politician.title ? `${politician.title} ` : ""}
                {politician.firstName} {politician.lastName}
              </p>
              <p className="mt-0.5 font-body text-sm text-warmgrau">
                {formatPartyShort(politician.party)}
              </p>
              <p className="mt-2 font-body text-xs leading-relaxed text-warmgrau/65">
                Wahlkreis {politician.wahlkreisId} · {politician.wahlkreisName}
              </p>
            </button>
          ))}
        </div>
      )}

      {searchReady && !loading && !error && items.length === 0 && (
        <p className="mt-3 font-body text-sm text-warmgrau/65">
          Keine passende Person gefunden.
        </p>
      )}

      {searchReady && (
        <p className="mt-3 font-body text-xs text-warmgrau/60" aria-live="polite">
          {loading && items.length === 0 ? "Suche läuft …" : `${items.length} von ${total} Personen`}
        </p>
      )}

      {nextOffset !== null && (
        <button
          type="button"
          disabled={loading}
          onClick={() => void load(nextOffset, true)}
          className="mt-3 font-body text-sm font-semibold text-waldgruen underline underline-offset-4 disabled:opacity-50"
        >
          Weitere anzeigen
        </button>
      )}
    </div>
  );
}
