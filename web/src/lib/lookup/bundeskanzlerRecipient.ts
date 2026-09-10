import { SCHREIB_MERZ_CAMPAIGN_SLUG } from "@/lib/campaigns/specialCampaigns";

export interface BundeskanzlerRecipient {
  kind: "bundeskanzler";
  level: "Bund";
  label: "Bundeskanzler Friedrich Merz";
  firstName: "Friedrich";
  lastName: "Merz";
  title: null;
  officeName: "Bundeskanzleramt";
  anrede: "Sehr geehrter Herr Bundeskanzler,";
  postalAddress: string;
  address: {
    addressLines: readonly string[];
    sourceTitle: string;
    sourceUrl: string;
    sourceStand: string;
  };
}

const BUNDESKANZLER_RECIPIENT: BundeskanzlerRecipient = {
  kind: "bundeskanzler",
  level: "Bund",
  label: "Bundeskanzler Friedrich Merz",
  firstName: "Friedrich",
  lastName: "Merz",
  title: null,
  officeName: "Bundeskanzleramt",
  anrede: "Sehr geehrter Herr Bundeskanzler,",
  postalAddress:
    "Bundeskanzleramt, Bundeskanzler, Friedrich Merz, Willy-Brandt-Straße 1, 10557 Berlin",
  address: {
    addressLines: [
      "Bundeskanzleramt",
      "Bundeskanzler",
      "Friedrich Merz",
      "Willy-Brandt-Straße 1",
      "10557 Berlin",
    ],
    sourceTitle: "Kontakt zum Bundeskanzler",
    sourceUrl:
      "https://www.bundeskanzler.de/bk-de/service/kontakt/kontakt-formular/1853246-1853246",
    sourceStand: "2026-09-10",
  },
};

export function isBundeskanzlerCampaignSlug(
  slug: string | null | undefined
): boolean {
  return slug === SCHREIB_MERZ_CAMPAIGN_SLUG;
}

export function isBundeskanzlerCampaignTarget(campaign: {
  slug: string;
  targetLevel: string;
  targetPoliticianIds: readonly number[];
} | null): boolean {
  return Boolean(
    campaign &&
      isBundeskanzlerCampaignSlug(campaign.slug) &&
      campaign.targetLevel === "Bund" &&
      campaign.targetPoliticianIds.length === 0
  );
}

/** Baut den institutionellen Empfänger ausschließlich aus vertrauenswürdigem Code. */
export function getBundeskanzlerRecipient(): BundeskanzlerRecipient {
  return {
    ...BUNDESKANZLER_RECIPIENT,
    address: {
      ...BUNDESKANZLER_RECIPIENT.address,
      addressLines: [...BUNDESKANZLER_RECIPIENT.address.addressLines],
    },
  };
}
