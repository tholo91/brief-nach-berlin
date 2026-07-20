import { lookupPLZ, lookupPLZWithLevel } from "./plzLookup";
import type { Recipient, RecipientSelection } from "./rathausRecipient";

export type ResolveRecipientResult =
  | { ok: true; recipient: Recipient; availableCount: number }
  | { ok: false; reason: "not_found" | "kommune_not_applicable" };

/**
 * Löst eine Client-Auswahl serverseitig in einen vertrauenswürdigen Empfänger
 * auf (LOCK-5). Gemeinsamer Guard für selectPoliticianAction, resendLetter und
 * /api/generate-letter:
 * - mdb/mdl: die numerische Abgeordnetenwatch-ID muss in der PLZ-abgeleiteten
 *   Liste der jeweiligen Ebene stehen (WR-02-Muster).
 * - rathaus/landesregierung: es wird KEINE Client-ID akzeptiert; der Empfänger
 *   wird komplett aus der PLZ neu gebaut.
 */
export function resolveRecipientSelection(
  plz: string,
  selection: RecipientSelection
): ResolveRecipientResult {
  if (selection.kind === "mdb") {
    // Bestehender Bund-Pfad inkl. Fallback-Eintrag (id -1) bleibt erhalten.
    const { politicians } = lookupPLZ(plz);
    const match = politicians.find((p) => p.id === selection.selectedPoliticianId);
    if (!match) return { ok: false, reason: "not_found" };
    return {
      ok: true,
      recipient: { ...match, kind: "mdb" },
      availableCount: politicians.length,
    };
  }

  if (selection.kind === "mdl") {
    const result = lookupPLZWithLevel(plz);
    const match = result.optionalByLevel.Land.find(
      (p) => p.id === selection.selectedPoliticianId
    );
    if (!match) return { ok: false, reason: "not_found" };
    return {
      ok: true,
      recipient: { ...match, kind: "mdl" },
      availableCount: result.optionalByLevel.Land.length,
    };
  }

  if (selection.kind === "landesregierung") {
    const result = lookupPLZWithLevel(plz);
    const landesregierung = result.byLevel.Land[0];
    if (!landesregierung) return { ok: false, reason: "not_found" };
    return { ok: true, recipient: landesregierung, availableCount: 1 };
  }

  // rathaus: vollständig PLZ-abgeleitet, Client-Daten fließen nicht ein
  const result = lookupPLZWithLevel(plz);
  const rathaus = result.byLevel.Kommune[0];
  if (!rathaus) {
    return {
      ok: false,
      reason: result.coverage.stadtstaatEinheitsgemeinde ? "kommune_not_applicable" : "not_found",
    };
  }
  return { ok: true, recipient: rathaus, availableCount: 1 };
}
