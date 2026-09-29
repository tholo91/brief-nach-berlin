import type {
  CampaignFixedRecipient,
  CampaignTargetLevel,
} from "@/lib/campaigns/schema";

export interface CampaignFixedRecipientRecipient {
  kind: "campaign_fixed";
  level: "Fixed";
  label: string;
  organizationName: string | null;
  personName: string | null;
  salutation: string;
  postalAddress: string;
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    countryCode: "DE";
  };
}

export function campaignFixedRecipientAddressLines(
  recipient: CampaignFixedRecipient
): string[] {
  return [
    recipient.organizationName,
    recipient.personName,
    `${recipient.street} ${recipient.houseNumber}`,
    `${recipient.postalCode} ${recipient.city}`,
  ].filter((line): line is string => Boolean(line));
}

export function buildCampaignFixedRecipient(
  recipient: CampaignFixedRecipient
): CampaignFixedRecipientRecipient {
  const label = recipient.organizationName ?? recipient.personName;
  if (!label) throw new Error("Fester Kampagnenempfänger ohne Namen");
  return {
    kind: "campaign_fixed",
    level: "Fixed",
    label,
    organizationName: recipient.organizationName,
    personName: recipient.personName,
    salutation: recipient.salutation,
    postalAddress: campaignFixedRecipientAddressLines(recipient).join(", "),
    address: {
      street: recipient.street,
      houseNumber: recipient.houseNumber,
      postalCode: recipient.postalCode,
      city: recipient.city,
      countryCode: recipient.countryCode,
    },
  };
}

export function getCampaignFixedRecipient(campaign: {
  targetLevel: CampaignTargetLevel;
  targetRecipient: CampaignFixedRecipient | null;
}): CampaignFixedRecipientRecipient | null {
  return campaign.targetLevel === "Fixed" && campaign.targetRecipient
    ? buildCampaignFixedRecipient(campaign.targetRecipient)
    : null;
}
