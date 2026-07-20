import type { Politician } from "../types/politician";
import type { LandesregierungRecipient } from "./landesregierungRecipient";

// Discriminated Union für Brief-Empfänger (LOCK-5):
// - mdb/mdl sind echte Politician-Objekte mit Abgeordnetenwatch-IDs, die
//   serverseitig gegen die PLZ-abgeleitete Liste geprüft werden.
// - rathaus und landesregierung sind synthetische institutionelle Empfänger
//   OHNE id/politicianId. Sie werden IMMER serverseitig aus der PLZ neu
//   abgeleitet, nie aus Client-Daten übernommen.

export interface MdbRecipient extends Politician {
  kind: "mdb";
}

export interface MdlRecipient extends Politician {
  kind: "mdl";
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
  address:
    | {
        source: "destatis";
        ags: string;
        streetAddress: string;
        postalCode: string;
        city: string;
        sourceTitle: string;
        sourceUrl: string;
        sourceStand: string;
      }
    | { source: "fallback" };
  // Kein id-, kein politicianId-Feld (LOCK-5).
}

export type Recipient =
  | MdbRecipient
  | MdlRecipient
  | RathausRecipient
  | LandesregierungRecipient;

/** Client → Server Auswahl-Objekt. Institutionelle Empfänger übertragen KEINE ID. */
export type RecipientSelection =
  | { kind: "mdb"; selectedPoliticianId: number }
  | { kind: "mdl"; selectedPoliticianId: number }
  | { kind: "landesregierung" }
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
  const officialAddress = isBerlin ? null : args.officialAddress;
  const address = officialAddress
    ? {
        source: "destatis" as const,
        ...officialAddress,
      }
    : { source: "fallback" as const };
  const postalAddress = officialAddress
    ? `${label}, ${officialAddress.streetAddress}, ${officialAddress.postalCode} ${officialAddress.city}`
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
