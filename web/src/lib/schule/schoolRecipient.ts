import { lookupPLZ, lookupPLZWithLevel } from "@/lib/lookup/plzLookup";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import type {
  Recipient,
  RecipientRelation,
  RecipientSelection,
} from "@/lib/lookup/rathausRecipient";
import type { Ressort } from "@/lib/lookup/ressorts";
import type { ClassLevel } from "@/lib/schule/classToken";

// Empfänger im Schulmodus (Jugend-Audience mit gültigem Klassen-Token): Die Kinder
// wählen weder Ebene noch Person. Der Server entscheidet aus der Token-PLZ, der
// Token-Ebene und der Router-Empfehlung. Kein Client-Wert fließt in den Empfänger.

export type SchoolLevel = "Bund" | "Land" | "Kommune";

export interface SchoolRoutingInput {
  primary?: { level: SchoolLevel } | null;
  ressort?: Ressort | null;
  topic?: { topicCategories?: readonly string[] } | null;
}

// Fallback, wenn der Router kein Ressort nennt: das Hauptthema eindeutig einem Ressort zuordnen.
const TOPIC_TO_RESSORT: Partial<Record<string, Ressort>> = {
  bildung: "bildung",
  klima_umwelt: "umwelt",
  verkehr_mobilitaet: "verkehr",
  gesundheit_pflege: "gesundheit",
  soziales_familie: "soziales",
  wohnen_bauen: "bau",
};

function ressortFor(routing: SchoolRoutingInput | null | undefined): Ressort | null {
  if (routing?.ressort) return routing.ressort;
  const main = routing?.topic?.topicCategories?.[0];
  return (main && TOPIC_TO_RESSORT[main]) || null;
}

export interface SchoolRecipient {
  /** Tatsächlich gewählte Ebene (kann vom Wunsch abweichen, wenn Daten fehlen). */
  level: SchoolLevel;
  /** Serverseitig gebaute Auswahl, kann 1:1 an selectPoliticianAction gehen. */
  selection: RecipientSelection;
  recipient: Recipient;
  relation: RecipientRelation;
  /** Ein kurzer deutscher Satz für "Warum diese Person?". */
  reason: string;
}

function withArticleLowercase(officeName: string): string {
  return officeName.replace(/^(Der|Die|Das)\b/, (article) => article.toLowerCase());
}

function resolved(
  level: SchoolLevel,
  plz: string,
  selection: RecipientSelection,
  reason: (recipient: Recipient) => string
): SchoolRecipient | null {
  const result = resolveRecipientSelection(plz, selection);
  if (!result.ok) return null;
  if (result.recipient.kind === "rathaus" && result.recipient.ambiguous) return null;
  return {
    level,
    selection,
    recipient: result.recipient,
    relation: result.relation,
    reason: reason(result.recipient),
  };
}

function landRecipient(plz: string, ressort: Ressort | null | undefined): SchoolRecipient | null {
  if (ressort) {
    const minister = resolved("Land", plz, { kind: "landesminister", ressort }, (recipient) =>
      recipient.kind === "landesminister"
        ? `Für dein Thema ist in ${recipient.bundeslandName} ${withArticleLowercase(recipient.officeName)} zuständig.`
        : ""
    );
    if (minister) return minister;
  }
  return resolved("Land", plz, { kind: "landesregierung", addressee: "head" }, (recipient) =>
    recipient.kind === "landesregierung" && recipient.headName
      ? `Für dein Thema passt kein einzelnes Ressort. Du schreibst deshalb an ${recipient.headName}, ${recipient.headTitle}.`
      : "Für dein Thema passt kein einzelnes Ressort. Du schreibst deshalb an die Regierungsspitze deines Landes."
  );
}

function bundRecipient(plz: string): SchoolRecipient | null {
  const local = lookupPLZ(plz).politicians;
  const mdb = local.find((politician) => politician.isDirect) ?? local[0];
  if (!mdb) {
    return resolved("Bund", plz, { kind: "mdb_later" }, () =>
      "Dieses Thema wird im Bundestag entschieden. Du schreibst an das Mitglied des Bundestages für deinen Wahlkreis."
    );
  }
  return resolved("Bund", plz, { kind: "mdb", selectedPoliticianId: mdb.id }, (recipient) =>
    recipient.kind === "mdb"
      ? `Dieses Thema wird im Bundestag entschieden. Du schreibst an ${recipient.firstName} ${recipient.lastName}, die oder der deinen Wahlkreis im Bundestag vertritt.`
      : ""
  );
}

function kommuneRecipient(plz: string): SchoolRecipient | null {
  return resolved("Kommune", plz, { kind: "rathaus" }, (recipient) =>
    recipient.kind === "rathaus"
      ? `Dieses Thema wird vor Ort entschieden. Du schreibst an ${recipient.label}.`
      : ""
  );
}

/**
 * Gewünschte Ebene = Token-Ebene, sonst die Router-Empfehlung, sonst Bund.
 * - Land: Fachminister:in zum Ressort, sonst Regierungsspitze des Landes.
 * - Bund: MdB des Wahlkreises (Direktmandat zuerst).
 * - Kommune (nur automatisch): Rathaus, sonst Regierungsspitze, sonst MdB.
 * Fehlen für die Ebene verifizierte Daten, folgt die nächste in dieser Reihenfolge.
 */
export function resolveSchoolRecipient(args: {
  /** Muss die PLZ aus dem verifizierten Klassen-Token sein, nie Client-Eingabe. */
  plz: string;
  tokenLevel?: ClassLevel | null;
  routing?: SchoolRoutingInput | null;
}): SchoolRecipient | null {
  const { plz } = args;
  const level: SchoolLevel = args.tokenLevel ?? args.routing?.primary?.level ?? "Bund";
  if (level === "Bund") return bundRecipient(plz);
  if (level === "Kommune") {
    return kommuneRecipient(plz) ?? landRecipient(plz, ressortFor(args.routing)) ?? bundRecipient(plz);
  }
  // Ohne Bundesland (unbekannte PLZ) bleibt nur der Bund.
  if (!lookupPLZWithLevel(plz).bundeslandKey) return bundRecipient(plz);
  return landRecipient(plz, ressortFor(args.routing)) ?? bundRecipient(plz);
}
