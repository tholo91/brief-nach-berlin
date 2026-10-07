import type { CampaignTargetLevel } from "./schema";

export type CampaignTargetDraftFields = {
  targetLevel: CampaignTargetLevel;
  targetState: string;
  targetMode: string;
  targetPoliticianIds: number[];
  fixedOrganizationName: string;
  fixedPersonName: string;
  fixedSalutation: string;
  fixedStreet: string;
  fixedHouseNumber: string;
  fixedPostalCode: string;
  fixedCity: string;
};

export function normalizeCampaignTargetDraft<T extends CampaignTargetDraftFields>(
  draft: T
): T {
  const normalized = { ...draft };
  if (normalized.targetLevel !== "Land") normalized.targetState = "";
  if (normalized.targetLevel !== "Bund") {
    normalized.targetMode = "default";
    normalized.targetPoliticianIds = [];
  }
  if (normalized.targetLevel !== "Fixed") {
    normalized.fixedOrganizationName = "";
    normalized.fixedPersonName = "";
    normalized.fixedSalutation = "Sehr geehrte Damen und Herren,";
    normalized.fixedStreet = "";
    normalized.fixedHouseNumber = "";
    normalized.fixedPostalCode = "";
    normalized.fixedCity = "";
  }
  return normalized;
}
