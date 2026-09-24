import {
  getAllBundestagPoliticians,
  getBundestagPoliticiansByIds,
  getLandtagPoliticiansForBundesland,
  lookupPLZ,
  lookupPLZWithLevel,
} from "./plzLookup";
import type {
  Recipient,
  RecipientRelation,
  RecipientSelection,
} from "./rathausRecipient";
import {
  getBundeskanzlerRecipient,
  isBundeskanzlerCampaignSlug,
} from "./bundeskanzlerRecipient";
import { getLandesregierungRecipient } from "./landesregierungRecipient";

export type ResolveRecipientResult =
  | {
      ok: true;
      recipient: Recipient;
      availableCount: number;
      relation: RecipientRelation;
    }
  | { ok: false; reason: "not_found" | "kommune_not_applicable" };

type ResolveRecipientOptions = {
  allowedPoliticianIds?: readonly number[];
  campaignSlug?: string | null;
};

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
  selection: RecipientSelection,
  options: ResolveRecipientOptions = {}
): ResolveRecipientResult {
  if (selection.kind === "bundeskanzler") {
    if (!isBundeskanzlerCampaignSlug(options.campaignSlug)) {
      return { ok: false, reason: "not_found" };
    }
    return {
      ok: true,
      recipient: getBundeskanzlerRecipient(),
      availableCount: 1,
      relation: "institutional",
    };
  }

  if (selection.kind === "mdb") {
    const localPoliticians = lookupPLZ(plz).politicians;
    const allowedIds = options.allowedPoliticianIds ?? [];
    const isCampaign = Boolean(options.campaignSlug) || allowedIds.length > 0;
    const politicians = isCampaign
      ? allowedIds.length > 0
        ? localPoliticians.filter((politician) => allowedIds.includes(politician.id)).length > 0
          ? localPoliticians.filter((politician) => allowedIds.includes(politician.id))
          : getBundestagPoliticiansByIds(allowedIds)
        : localPoliticians
      : getAllBundestagPoliticians();
    const match = politicians.find((p) => p.id === selection.selectedPoliticianId);
    if (!match) return { ok: false, reason: "not_found" };
    return {
      ok: true,
      recipient: { ...match, kind: "mdb" },
      availableCount: politicians.length,
      relation: localPoliticians.some((politician) => politician.id === match.id)
        ? "local"
        : "outside_constituency",
    };
  }

  if (selection.kind === "mdb_later") {
    if (
      options.campaignSlug ||
      (options.allowedPoliticianIds?.length ?? 0) > 0 ||
      lookupPLZ(plz).politicians.length > 0
    ) {
      return { ok: false, reason: "not_found" };
    }
    return {
      ok: true,
      recipient: {
        kind: "mdb_later",
        level: "Bund",
        label: "Mitglied des Deutschen Bundestages",
        postalAddress: "Platz der Republik 1, 11011 Berlin",
      },
      availableCount: 0,
      relation: "unassigned",
    };
  }

  if (selection.kind === "mdl") {
    const result = lookupPLZWithLevel(plz);
    const localPoliticians = result.optionalByLevel.Land;
    const politicians = options.campaignSlug
      ? localPoliticians
      : result.bundeslandKey
        ? getLandtagPoliticiansForBundesland(result.bundeslandKey)
        : [];
    const match = politicians.find(
      (p) => p.id === selection.selectedPoliticianId
    );
    if (!match) return { ok: false, reason: "not_found" };
    return {
      ok: true,
      recipient: { ...match, kind: "mdl" },
      availableCount: politicians.length,
      relation: localPoliticians.some((politician) => politician.id === match.id)
        ? "local"
        : "outside_constituency",
    };
  }

  if (selection.kind === "landesregierung") {
    const result = lookupPLZWithLevel(plz);
    const landesregierung = result.bundeslandKey
      ? getLandesregierungRecipient(
          result.bundeslandKey,
          selection.addressee === "head" ? "head" : "institution"
        )
      : null;
    if (!landesregierung) return { ok: false, reason: "not_found" };
    return {
      ok: true,
      recipient: landesregierung,
      availableCount: 1,
      relation: "institutional",
    };
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
  return {
    ok: true,
    recipient: rathaus,
    availableCount: 1,
    relation: "institutional",
  };
}
