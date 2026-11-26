import type {
  CampaignFixedRecipient,
  CampaignTargetLevel,
} from "@/lib/campaigns/schema";
import {
  buildCampaignFixedRecipient,
  type CampaignFixedRecipientRecipient,
} from "./campaignFixedRecipient";
import { getAllBundestagPoliticians, lookupPLZ } from "./plzLookup";

// Eine Regel für alle serverseitigen Stellen (submitWizard, generate-letter,
// selectPolitician, resendLetter). Nur serverseitig importieren: die Daten
// kommen aus der PLZ- und Politiker-Datei.

export type CampaignRuleInput = {
  targetLevel: CampaignTargetLevel;
  targetPoliticianIds: readonly number[];
  targetParties?: readonly string[];
  backupRecipient?: CampaignFixedRecipient | null;
};

export type CampaignRecipientRule = {
  restricted: boolean;
  allowedPoliticianIds: number[];
  backupRecipient: CampaignFixedRecipientRecipient | null;
};

// Entfernt weiche Trennstriche (die Grünen) und Leerraum, damit Konfiguration
// und Datenbestand exakt vergleichbar bleiben.
function normalizeParty(value: string): string {
  return value.replace(/­/g, "").trim();
}

export function campaignAllowedPoliticianIds(
  campaign: Pick<CampaignRuleInput, "targetLevel" | "targetPoliticianIds" | "targetParties">
): { restricted: boolean; allowedPoliticianIds: number[] } {
  const ids = [...new Set(campaign.targetPoliticianIds)];
  const parties =
    campaign.targetLevel === "Bund"
      ? new Set((campaign.targetParties ?? []).map(normalizeParty).filter(Boolean))
      : new Set<string>();
  if (parties.size === 0) {
    return { restricted: ids.length > 0, allowedPoliticianIds: ids };
  }
  const partyIds = getAllBundestagPoliticians()
    .filter((politician) => parties.has(normalizeParty(politician.party)))
    .map((politician) => politician.id);
  const partyIdSet = new Set(partyIds);
  const allowed = ids.length > 0 ? ids.filter((id) => partyIdSet.has(id)) : partyIds;
  return { restricted: true, allowedPoliticianIds: allowed };
}

export function campaignBackupRecipient(
  campaign: CampaignRuleInput
): CampaignFixedRecipientRecipient | null {
  if (campaign.targetLevel !== "Bund" || !campaign.backupRecipient) return null;
  const hasRule =
    (campaign.targetParties ?? []).some((party) => normalizeParty(party).length > 0) ||
    campaign.targetPoliticianIds.length > 0;
  if (!hasRule) return null;
  return buildCampaignFixedRecipient(campaign.backupRecipient);
}

export function resolveCampaignRecipientRule(
  campaign: CampaignRuleInput | null | undefined,
  plz: string
): CampaignRecipientRule {
  if (!campaign) {
    return { restricted: false, allowedPoliticianIds: [], backupRecipient: null };
  }
  const { restricted, allowedPoliticianIds } = campaignAllowedPoliticianIds(campaign);
  const backup = campaignBackupRecipient(campaign);
  if (!restricted || !backup) {
    return { restricted, allowedPoliticianIds, backupRecipient: null };
  }
  const allowed = new Set(allowedPoliticianIds);
  const hasLocalMatch = lookupPLZ(plz).politicians.some((politician) =>
    allowed.has(politician.id)
  );
  return {
    restricted,
    allowedPoliticianIds,
    backupRecipient: hasLocalMatch ? null : backup,
  };
}

export function campaignSelectionAllowed(
  rule: CampaignRecipientRule,
  kind: string
): boolean {
  if (!rule.restricted) return true;
  if (kind === "mdb") return rule.allowedPoliticianIds.length > 0;
  if (kind === "campaign_fixed") return rule.backupRecipient !== null;
  return false;
}
