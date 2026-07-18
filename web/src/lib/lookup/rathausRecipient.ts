import type { Politician } from "../types/politician";

// Discriminated Union für Brief-Empfänger (LOCK-5):
// - mdb/mdl sind echte Politician-Objekte mit Abgeordnetenwatch-IDs, die
//   serverseitig gegen die PLZ-abgeleitete Liste geprüft werden.
// - rathaus ist ein synthetischer Verwaltungs-Empfänger OHNE id/politicianId.
//   Er wird IMMER serverseitig aus der PLZ neu abgeleitet, nie aus
//   Client-Daten übernommen.

export interface MdbRecipient extends Politician {
  kind: "mdb";
}

export interface MdlRecipient extends Politician {
  kind: "mdl";
}

export interface RathausRecipient {
  kind: "rathaus";
  level: "Kommune";
  recipientKind: "stadtverwaltung" | "bezirksamt";
  /** Mehrere zuständige Berliner Bezirke sind möglich; keine automatische Auswahl. */
  ambiguous?: boolean;
  /** Gemeinde-/Stadtname bzw. Berliner Bezirk, z.B. "Köln" oder "Friedrichshain-Kreuzberg" */
  gemeindeName: string;
  plz: string;
  /** Empfänger-Label, z.B. "Stadtverwaltung Köln" oder "Bezirksamt Friedrichshain-Kreuzberg" */
  label: string;
  /**
   * Generische, postalisch zustellbare Anschrift OHNE Straße:
   * "Stadtverwaltung Köln, 50667 Köln". Wird bewusst nicht als exakte
   * Straßenadresse verkauft — die Google-Adresshilfe ergänzt Straße+Nr.
   */
  postalAddress: string;
  // Kein id-, kein politicianId-Feld (LOCK-5).
}

export type Recipient = MdbRecipient | MdlRecipient | RathausRecipient;

/** Client → Server Auswahl-Objekt. Für rathaus wird KEINE ID übertragen. */
export type RecipientSelection =
  | { kind: "mdb"; selectedPoliticianId: number }
  | { kind: "mdl"; selectedPoliticianId: number }
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
}): RathausRecipient {
  if (args.bundeslandKey === "HH" || args.bundeslandKey === "HB") {
    throw new RathausRecipientNotApplicable(args.bundeslandKey);
  }

  const isBezirk = args.bundeslandKey === "BE" && Boolean(args.bezirk);
  const name = isBezirk ? (args.bezirk as string) : args.gemeindeName;
  const label = `${isBezirk ? "Bezirksamt" : "Stadtverwaltung"} ${name}`;
  // Komma-Separator spiegelt die postalAddress-Konvention der Politician-Daten
  // (buildEmailHtml splittet Adresszeilen an Kommas).
  const city = args.bundeslandKey === "BE" ? "Berlin" : args.gemeindeName;
  const postalAddress = `${label}, ${args.plz} ${city}`;

  return {
    kind: "rathaus",
    level: "Kommune",
    recipientKind: isBezirk ? "bezirksamt" : "stadtverwaltung",
    gemeindeName: name,
    plz: args.plz,
    label,
    postalAddress,
  };
}
