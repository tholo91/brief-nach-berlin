import ministerDataJson from "../../../data/landesminister.json";
import { isRessort, type Ressort } from "./ressorts";

export interface LandesministerDataEntry {
  ressorts: string[];
  officeName: string;
  name: string;
  title: string;
  salutation: string;
  addressLines: string[];
  source: { title: string; url: string; verifiedAt: string };
  /** Noch nicht bestätigte Einträge werden nie als Empfänger ausgegeben. */
  unverified?: boolean;
}

export interface LandesministerData {
  lastUpdated?: string;
  states?: Record<string, { stateName: string; ministers?: LandesministerDataEntry[] } | undefined>;
}

// Fachminister:in eines Landes (nur Schulmodus). Wie bei der Regierungsspitze
// ohne id: serverseitig aus Bundesland und Ressort gebaut, nie aus Client-Daten.
export interface LandesministerRecipient {
  kind: "landesminister";
  level: "Land";
  ressort: Ressort;
  name: string;
  title: string;
  salutation: string;
  bundeslandKey: string;
  bundeslandName: string;
  /** Erste Anschriftzeile, z.B. "Senatorin Henrike Müller". */
  label: string;
  /** Behörde, z.B. "Die Senatorin für Umwelt, Klima und Wissenschaft". */
  officeName: string;
  postalAddress: string;
  address: {
    addressLines: string[];
    sourceTitle: string;
    sourceUrl: string;
    sourceStand: string;
  };
}

const ministerData = ministerDataJson as LandesministerData;

export function getLandesministerRecipient(
  bundeslandKey: string,
  ressort: Ressort,
  data: LandesministerData = ministerData
): LandesministerRecipient | null {
  if (!isRessort(ressort)) return null;
  const state = data.states?.[bundeslandKey];
  const entry = state?.ministers?.find(
    (minister) =>
      !minister.unverified &&
      minister.addressLines.length > 0 &&
      minister.ressorts.includes(ressort)
  );
  if (!state || !entry) return null;
  return {
    kind: "landesminister",
    level: "Land",
    ressort,
    name: entry.name,
    title: entry.title,
    salutation: entry.salutation,
    bundeslandKey,
    bundeslandName: state.stateName,
    label: entry.addressLines[0],
    officeName: entry.officeName,
    postalAddress: entry.addressLines.join(", "),
    address: {
      addressLines: entry.addressLines,
      sourceTitle: entry.source.title,
      sourceUrl: entry.source.url,
      sourceStand: entry.source.verifiedAt,
    },
  };
}
