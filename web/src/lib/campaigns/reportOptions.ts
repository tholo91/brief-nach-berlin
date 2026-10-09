export const CAMPAIGN_REPORT_REASONS = [
  "falsche-angaben",
  "falscher-empfaenger",
  "beleidigend",
  "rechte-verletzt",
  "sonstiges",
] as const;

export type CampaignReportReason = (typeof CAMPAIGN_REPORT_REASONS)[number];

export const CAMPAIGN_REPORT_REASON_LABELS: Record<CampaignReportReason, string> = {
  "falsche-angaben": "Falsche Angaben",
  "falscher-empfaenger": "Falscher Empfänger oder Adresse",
  beleidigend: "Beleidigend oder hetzerisch",
  "rechte-verletzt": "Bild- oder Logorechte verletzt",
  sonstiges: "Sonstiges",
};

export const CAMPAIGN_REPORT_ROLES = ["briefschreiber", "betroffen", "sonstige"] as const;

export type CampaignReportRole = (typeof CAMPAIGN_REPORT_ROLES)[number];

export const CAMPAIGN_REPORT_ROLE_LABELS: Record<CampaignReportRole, string> = {
  briefschreiber: "Briefschreiber:in",
  betroffen: "Selbst betroffen",
  sonstige: "Sonstige",
};

export const CAMPAIGN_REPORT_MESSAGE_MIN = 20;
export const CAMPAIGN_REPORT_MESSAGE_MAX = 1000;
