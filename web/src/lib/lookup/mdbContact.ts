import type { Politician } from "../types/politician";
import officesJson from "../../../data/constituency-offices.json";
import { formatPartyShort } from "../formatParty";
import { lookupPLZ } from "./plzLookup";

interface OfficeRecord {
  bundestagId: string;
  name: string;
  party: string;
  profileUrl: string;
  constituencyOffice?: { rawLines: string[] } | null;
}

export interface MdbContact {
  id: number;
  name: string;
  party: string;
  wahlkreisName: string;
  isDirect: boolean;
  profileUrl: string | null;
  profileSource: "bundestag" | "abgeordnetenwatch" | null;
  officeLines: string[];
}

const TITLE_WORDS = /\b(dr|prof|mult|dipl|ing|jur|med|rer|nat|phil|habil|hc|h c)\b/g;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ı/g, "i")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(TITLE_WORDS, " ")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeParty(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");
}

function firstWord(value: string): string {
  return normalize(value).split(" ")[0] ?? "";
}

function lastWord(value: string): string {
  const words = normalize(value).split(" ");
  return words[words.length - 1] ?? "";
}

export function findOfficeRecord(
  politician: Pick<Politician, "firstName" | "lastName" | "party">,
  records: readonly OfficeRecord[]
): OfficeRecord | null {
  const party = normalizeParty(politician.party);
  const last = lastWord(politician.lastName);
  const first = firstWord(politician.firstName);
  if (!last || !first) return null;

  const matches = records.filter((record) => {
    const [officeLast = "", officeFirst = ""] = record.name.split(",");
    return (
      normalizeParty(record.party) === party &&
      lastWord(officeLast) === last &&
      firstWord(officeFirst) === first
    );
  });

  return matches.length === 1 ? matches[0] : null;
}

const officeRecords = (officesJson as { records: OfficeRecord[] }).records;

function displayName(politician: Politician): string {
  return [politician.title, politician.firstName, politician.lastName]
    .filter(Boolean)
    .join(" ");
}

export function buildMdbContacts(plz: string): MdbContact[] {
  const { politicians } = lookupPLZ(plz);
  return politicians.map((politician) => {
    const record = findOfficeRecord(politician, officeRecords);
    const profileUrl = record?.profileUrl ?? politician.abgeordnetenwatchUrl ?? null;
    return {
      id: politician.id,
      name: displayName(politician),
      party: formatPartyShort(politician.party),
      wahlkreisName: politician.wahlkreisName,
      isDirect: politician.isDirect,
      profileUrl,
      profileSource: record?.profileUrl
        ? "bundestag"
        : politician.abgeordnetenwatchUrl
          ? "abgeordnetenwatch"
          : null,
      officeLines: record?.constituencyOffice?.rawLines ?? [],
    };
  });
}
