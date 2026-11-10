import type { Politician } from "../types/politician";
import type { LandesregierungRecipient } from "./landesregierungRecipient";
import type { BundeskanzlerRecipient } from "./bundeskanzlerRecipient";
import type { CampaignFixedRecipientRecipient } from "./campaignFixedRecipient";
import berlinBezirksaemterJson from "../../../data/berlin-bezirksaemter.json";

interface BerlinBezirksamtEntry {
  recipientLine: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  sourceUrl: string;
}

const berlinBezirksaemter = berlinBezirksaemterJson as {
  _meta: { source: { title: string; url: string; stand: string } };
  byBezirk: Record<string, BerlinBezirksamtEntry>;
};

/** Postanschrift eines Berliner Bezirksamts aus dem Repo-Snapshot (berlin.de). */
export function getBerlinBezirksamtAddress(bezirk: string): RathausOfficialAddress | null {
  const entry = berlinBezirksaemter.byBezirk[bezirk];
  if (!entry) return null;
  return {
    source: "official",
    sourceName: "berlin.de",
    recipientLine: entry.recipientLine,
    streetAddress: entry.streetAddress,
    postalCode: entry.postalCode,
    city: entry.city,
    sourceTitle: berlinBezirksaemter._meta.source.title,
    sourceUrl: entry.sourceUrl,
    sourceStand: berlinBezirksaemter._meta.source.stand,
  };
}

export interface RathausOfficialAddress {
  source: "official";
  /** Anzeigename der Quelle, z.B. "Destatis" oder "berlin.de" */
  sourceName: "Destatis" | "berlin.de";
  /** Nur Destatis-Treffer; stabiler Bindungsschlüssel für das Signal-Token. */
  ags?: string;
  /** Offizielle erste Umschlagzeile, falls abweichend vom Label (Berlin: "Bezirksamt X von Berlin"). */
  recipientLine?: string;
  /** Darf leer sein (Großkunden-PLZ ohne Straße). */
  streetAddress: string;
  postalCode: string;
  city: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceStand: string;
}

export interface RathausCandidate {
  bezirk: string;
  /** z.B. "Bezirksamt Pankow" */
  label: string;
  /** Offizielle erste Umschlagzeile, z.B. "Bezirksamt Pankow von Berlin" */
  recipientLine: string;
  streetAddress: string;
  postalCode: string;
  city: string;
}

// Discriminated Union für Brief-Empfänger (LOCK-5):
// - mdb/mdl sind echte Politician-Objekte mit Abgeordnetenwatch-IDs, die
//   serverseitig gegen die PLZ-abgeleitete Liste geprüft werden.
// - rathaus und landesregierung sind synthetische institutionelle Empfänger
//   OHNE id/politicianId. Sie werden serverseitig aus der PLZ oder dem fest
//   konfigurierten Kampagnenziel abgeleitet, nie aus Client-Daten übernommen.

export interface MdbRecipient extends Politician {
  kind: "mdb";
}

export interface MdlRecipient extends Politician {
  kind: "mdl";
}

export interface MdbLaterRecipient {
  kind: "mdb_later";
  level: "Bund";
  label: "Mitglied des Deutschen Bundestages";
  postalAddress: "Platz der Republik 1, 11011 Berlin";
}

export interface RathausRecipient {
  kind: "rathaus";
  level: "Kommune";
  recipientKind: "buergermeisteramt" | "bezirksamt";
  /** Mehrere zuständige Berliner Bezirke sind möglich; keine automatische Auswahl. */
  ambiguous?: boolean;
  /** Gemeinde-/Stadtname bzw. Berliner Bezirk, z.B. "Köln" oder "Friedrichshain-Kreuzberg" */
  gemeindeName: string;
  plz: string;
  /** Empfänger-Label, z.B. "Bürgermeisteramt Köln" oder "Bezirksamt Friedrichshain-Kreuzberg" */
  label: string;
  /** Vollständige Anschrift bei amtlichem Treffer, sonst nur das Empfänger-Label. */
  postalAddress: string;
  address: RathausOfficialAddress | { source: "fallback" };
  /** Nur bei `ambiguous`: mögliche Bezirke mit Adresse, ohne automatische Auswahl. */
  candidates?: RathausCandidate[];
  // Kein id-, kein politicianId-Feld (LOCK-5).
}

export type Recipient =
  | MdbRecipient
  | MdlRecipient
  | MdbLaterRecipient
  | BundeskanzlerRecipient
  | CampaignFixedRecipientRecipient
  | RathausRecipient
  | LandesregierungRecipient;

export type RecipientRelation =
  | "local"
  | "outside_constituency"
  | "institutional"
  | "unassigned";

/** Client → Server Auswahl-Objekt. Institutionelle Empfänger übertragen KEINE ID. */
export type RecipientSelection =
  | { kind: "mdb"; selectedPoliticianId: number }
  | { kind: "mdl"; selectedPoliticianId: number }
  | { kind: "mdb_later" }
  | { kind: "bundeskanzler" }
  | { kind: "campaign_fixed" }
  | { kind: "landesregierung"; addressee?: "institution" | "head" }
  | { kind: "rathaus" };

/** HH/HB: Einheitsgemeinde (Art. 28 Abs. 1 S. 2 GG) — Kommune-Ebene existiert nicht, Land übernimmt. */
export class RathausRecipientNotApplicable extends Error {
  constructor(public bundeslandKey: string) {
    super(
      `Rathaus recipient not applicable for Stadtstaat ${bundeslandKey} (Einheitsgemeinde, Land uebernimmt)`
    );
    this.name = "RathausRecipientNotApplicable";
  }
}

export function buildRathausRecipient(args: {
  gemeindeName: string;
  plz: string;
  bundeslandKey: string;
  /** Nur Berlin: Bezirk der PLZ (erster Treffer aus der BTW-Ableitung) */
  bezirk?: string | null;
  officialAddress?: {
    ags: string;
    streetAddress: string;
    postalCode: string;
    city: string;
    sourceTitle: string;
    sourceUrl: string;
    sourceStand: string;
  } | null;
}): RathausRecipient {
  if (args.bundeslandKey === "HH" || args.bundeslandKey === "HB") {
    throw new RathausRecipientNotApplicable(args.bundeslandKey);
  }

  const isBerlin = args.bundeslandKey === "BE";
  const hasBezirk = isBerlin && Boolean(args.bezirk);
  const name = hasBezirk ? (args.bezirk as string) : args.gemeindeName;
  const label = isBerlin
    ? hasBezirk
      ? `Bezirksamt ${name}`
      : "Zuständiges Bezirksamt in Berlin"
    : args.officialAddress
      ? `Bürgermeisteramt ${name}`
      : "Zuständiges Bürgermeisteramt";
  const berlinAddress = hasBezirk ? getBerlinBezirksamtAddress(name) : null;
  const destatisAddress = isBerlin || !args.officialAddress
    ? null
    : {
        source: "official" as const,
        sourceName: "Destatis" as const,
        ...args.officialAddress,
      };
  const address: RathausOfficialAddress | { source: "fallback" } =
    berlinAddress ?? destatisAddress ?? { source: "fallback" as const };
  const postalAddress =
    address.source === "official"
      ? [
          address.recipientLine ?? label,
          address.streetAddress,
          `${address.postalCode} ${address.city}`,
        ]
          .filter(Boolean)
          .join(", ")
      : label;

  return {
    kind: "rathaus",
    level: "Kommune",
    recipientKind: isBerlin ? "bezirksamt" : "buergermeisteramt",
    gemeindeName: name,
    plz: args.plz,
    label,
    postalAddress,
    address,
  };
}
