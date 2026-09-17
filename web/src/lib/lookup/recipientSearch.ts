import type { Politician } from "@/lib/types/politician";
import {
  getAllBundestagPoliticians,
  getBundeslandForPlz,
  getBundestagPoliticianBundesland,
  getLandtagPoliticiansForBundesland,
  lookupPLZ,
  lookupPLZWithLevel,
} from "./plzLookup";

export const RECIPIENT_SEARCH_PAGE_SIZE = 12;

export type RecipientSearchLevel = "Bund" | "Land";

export interface RecipientSearchCard {
  id: number;
  politicianId: number;
  firstName: string;
  lastName: string;
  title: string | null;
  party: string;
  wahlkreisId: number;
  wahlkreisName: string;
  level: "Bund" | "Land";
  postalAddress: string;
  isDirect: boolean;
  abgeordnetenwatchUrl: string | null;
  bundeslandKey?: string;
}

export interface RecipientSearchResult {
  items: RecipientSearchCard[];
  parties: string[];
  total: number;
  nextOffset: number | null;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("de")
    .trim();
}

function matchesQuery(
  politician: Politician,
  query: string,
  includeCommittees: boolean
): boolean {
  const haystack = [
    politician.firstName,
    politician.lastName,
    politician.party,
    politician.wahlkreisName,
    ...(includeCommittees ? politician.committees ?? [] : []),
  ]
    .map(normalize)
    .join(" ");
  return haystack.includes(normalize(query));
}

function toCard(politician: Politician): RecipientSearchCard {
  return {
    id: politician.id,
    politicianId: politician.politicianId,
    firstName: politician.firstName,
    lastName: politician.lastName,
    title: politician.title,
    party: politician.party,
    wahlkreisId: politician.wahlkreisId,
    wahlkreisName: politician.wahlkreisName,
    level: politician.level === "Land" ? "Land" : "Bund",
    postalAddress: politician.postalAddress,
    isDirect: politician.isDirect,
    abgeordnetenwatchUrl: politician.abgeordnetenwatchUrl,
    ...(politician.bundeslandKey
      ? { bundeslandKey: politician.bundeslandKey }
      : {}),
  };
}

export function searchAlternativeRecipients(args: {
  level: RecipientSearchLevel;
  plz: string;
  party?: string;
  query?: string;
  offset?: number;
}): RecipientSearchResult {
  const party = args.party?.trim() ?? "";
  const query = args.query?.trim() ?? "";
  const offset = Math.max(0, args.offset ?? 0);
  const bundeslandKey = getBundeslandForPlz(args.plz);
  const localIds = new Set(
    args.level === "Bund"
      ? lookupPLZ(args.plz).politicians.map((politician) => politician.id)
      : lookupPLZWithLevel(args.plz).optionalByLevel.Land.map(
          (politician) => politician.id
        )
  );

  const candidates =
    args.level === "Bund"
      ? getAllBundestagPoliticians()
      : bundeslandKey
        ? getLandtagPoliticiansForBundesland(bundeslandKey)
        : [];
  const parties = Array.from(new Set(candidates.map((politician) => politician.party)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "de"));

  if (!party && query.length < 2) {
    return { items: [], parties, total: 0, nextOffset: null };
  }

  const filtered = candidates
    .filter((politician) => !localIds.has(politician.id))
    .filter((politician) => !party || politician.party === party)
    .filter(
      (politician) =>
        !query || matchesQuery(politician, query, args.level === "Bund")
    )
    .sort((a, b) => {
      if (args.level === "Bund" && bundeslandKey) {
        const aLocalState = getBundestagPoliticianBundesland(a) === bundeslandKey;
        const bLocalState = getBundestagPoliticianBundesland(b) === bundeslandKey;
        if (aLocalState !== bLocalState) return aLocalState ? -1 : 1;
      }
      return (
        a.lastName.localeCompare(b.lastName, "de") ||
        a.firstName.localeCompare(b.firstName, "de")
      );
    });

  const items = filtered
    .slice(offset, offset + RECIPIENT_SEARCH_PAGE_SIZE)
    .map(toCard);
  const nextOffset =
    offset + items.length < filtered.length ? offset + items.length : null;

  return { items, parties, total: filtered.length, nextOffset };
}
