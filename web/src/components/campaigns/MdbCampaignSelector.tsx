"use client";

import { useMemo, useState } from "react";
import type { Politician, PoliticiansCache } from "@/lib/types/politician";
import politiciansJson from "../../../data/politicians-cache.json";

const politicians = (politiciansJson as PoliticiansCache).bundestag;
const DEFAULT_RESULT_LIMIT = 30;

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function labelFor(politician: Politician): string {
  return `${politician.firstName} ${politician.lastName}`;
}

export function filterCampaignPoliticians(
  source: Politician[],
  query: string,
  parties: string[]
): Politician[] {
  const normalizedQuery = normalize(query);
  const selectedParties = new Set(parties);

  return source.filter((politician) => {
    const matchesQuery =
      !normalizedQuery ||
      normalize(
        [
          labelFor(politician),
          politician.party,
          politician.wahlkreisName,
          ...(politician.committees ?? []),
        ].join(" ")
      ).includes(normalizedQuery);
    const matchesParty = selectedParties.size === 0 || selectedParties.has(politician.party);
    return matchesQuery && matchesParty;
  });
}

export function mergeCampaignPoliticianIds(
  selectedIds: number[],
  politiciansToAdd: Politician[]
): number[] {
  return [...new Set([...selectedIds, ...politiciansToAdd.map((politician) => politician.id)])];
}

type MdbCampaignSelectorProps = {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  inputName?: string;
};

export function MdbCampaignSelector({
  selectedIds,
  onChange,
  disabled = false,
  inputName = "targetPoliticianId",
}: MdbCampaignSelectorProps) {
  const [query, setQuery] = useState("");
  const [partyFilters, setPartyFilters] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const normalizedQuery = normalize(query);
  const partyOptions = useMemo(
    () => [...new Set(politicians.map((politician) => politician.party))].sort(
      new Intl.Collator("de-DE").compare
    ),
    []
  );
  const matchingPoliticians = useMemo(
    () => filterCampaignPoliticians(politicians, query, partyFilters),
    [query, partyFilters]
  );
  const hasActiveFilter = Boolean(normalizedQuery) || partyFilters.length > 0;
  const visiblePoliticians = useMemo(() => {
    if (hasActiveFilter) return matchingPoliticians;

    const selected = matchingPoliticians.filter((politician) => selectedSet.has(politician.id));
    const unselected = matchingPoliticians.filter((politician) => !selectedSet.has(politician.id));
    return [...selected, ...unselected.slice(0, Math.max(0, DEFAULT_RESULT_LIMIT - selected.length))];
  }, [hasActiveFilter, matchingPoliticians, selectedSet]);
  const allMatchingSelected =
    matchingPoliticians.length > 0 &&
    matchingPoliticians.every((politician) => selectedSet.has(politician.id));

  function toggleParty(party: string) {
    setPartyFilters((current) =>
      current.includes(party)
        ? current.filter((value) => value !== party)
        : [...current, party]
    );
  }

  function toggle(politicianId: number) {
    if (disabled) return;
    if (selectedSet.has(politicianId)) {
      onChange(selectedIds.filter((id) => id !== politicianId));
      return;
    }
    onChange([...selectedIds, politicianId]);
  }

  function selectAllMatching() {
    if (disabled) return;
    onChange(mergeCampaignPoliticianIds(selectedIds, matchingPoliticians));
  }

  function removeAllMatching() {
    if (disabled) return;
    const matchingIds = new Set(matchingPoliticians.map((politician) => politician.id));
    onChange(selectedIds.filter((id) => !matchingIds.has(id)));
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <p className="font-body text-sm leading-relaxed text-warmgrau/75">
          Die PLZ der schreibenden Person bleibt Pflicht und grenzt die Auswahl
          zuerst auf zuständige Personen ein.
        </p>
        <p className="font-body text-sm font-semibold text-waldgruen-dark" aria-live="polite">
          {selectedIds.length} MdB{selectedIds.length === 1 ? "" : "s"} ausgewählt
        </p>
      </div>

      <div className="grid gap-2">
        <p className="font-body text-sm font-semibold text-waldgruen-dark">Parteien filtern</p>
        <div className="flex flex-wrap gap-2" aria-label="Parteien filtern">
          {partyOptions.map((party) => {
            const active = partyFilters.includes(party);
            return (
              <button
                key={party}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                onClick={() => toggleParty(party)}
                className={[
                  "rounded-full border px-3 py-1.5 font-body text-sm font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
                  active
                    ? "border-waldgruen bg-waldgruen text-creme"
                    : "border-warmgrau/25 bg-white text-waldgruen-dark hover:border-waldgruen/50",
                ].join(" ")}
              >
                {party}
              </button>
            );
          })}
        </div>
      </div>

      <label className="grid gap-1" htmlFor="campaign-mdb-search">
        <span className="font-body text-sm font-semibold text-waldgruen-dark">MdB suchen</span>
        <input
          id="campaign-mdb-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={disabled}
          placeholder="Name, Partei, Wahlkreis oder Ausschuss"
          className="rounded-md border border-warmgrau/20 bg-white px-3 py-2.5 font-body text-base outline-none focus:border-waldgruen disabled:opacity-60"
        />
      </label>

      {hasActiveFilter && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-warmgrau/15 bg-white/55 px-3 py-2.5">
          <p className="font-body text-sm text-warmgrau/70">
            {matchingPoliticians.length} passend{matchingPoliticians.length === 1 ? "e Person" : "e Personen"}
          </p>
          <button
            type="button"
            disabled={disabled || matchingPoliticians.length === 0}
            onClick={allMatchingSelected ? removeAllMatching : selectAllMatching}
            className="font-body text-sm font-semibold text-waldgruen underline decoration-waldgruen/35 underline-offset-4 transition-colors hover:text-waldgruen-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {allMatchingSelected ? "Gefilterte Auswahl entfernen" : "Alle gefilterten auswählen"}
          </button>
        </div>
      )}

      {selectedIds.length > 0 && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([])}
          className="w-fit font-body text-sm font-semibold text-warmgrau/70 underline decoration-warmgrau/35 underline-offset-4 transition-colors hover:text-waldgruen-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          Gesamte Auswahl leeren
        </button>
      )}

      {!hasActiveFilter && matchingPoliticians.length > visiblePoliticians.length && (
        <p className="font-body text-sm text-warmgrau/65">
          Zeigt die ersten {visiblePoliticians.length} Personen. Suche oder filtere nach Partei, um weitere
          Abgeordnete zu sehen.
        </p>
      )}

      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={inputName} value={id} />
      ))}

      <div
        className="grid max-h-[32rem] gap-2 overflow-x-hidden overflow-y-auto rounded-md border border-warmgrau/15 bg-white/55 p-2"
        role="group"
        aria-label="Bundestagsabgeordnete auswählen"
      >
        {visiblePoliticians.map((politician) => {
          const selected = selectedSet.has(politician.id);
          return (
            <label
              key={politician.id}
              className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                selected
                  ? "border-waldgruen bg-waldgruen/8"
                  : "border-transparent hover:border-waldgruen/30 hover:bg-creme/70"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(politician.id)}
                disabled={disabled}
                className="mt-1 h-4 w-4 shrink-0 accent-waldgruen"
              />
              <span className="min-w-0 font-body text-sm leading-relaxed text-warmgrau">
                <span className="block font-semibold text-waldgruen-dark">
                  {politician.title ? `${politician.title} ` : ""}{labelFor(politician)}
                </span>
                <span className="block text-warmgrau/70">
                  {politician.party} · {politician.wahlkreisName}
                </span>
                {politician.committees?.length ? (
                  <span className="mt-0.5 block break-words text-xs leading-relaxed text-warmgrau/60">
                    {politician.committees.join(" · ")}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
        {visiblePoliticians.length === 0 && (
          <p className="px-3 py-4 font-body text-sm text-warmgrau/65">
            Keine passende Person gefunden.
          </p>
        )}
      </div>
    </div>
  );
}
