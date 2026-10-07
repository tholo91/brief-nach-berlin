import { getSpecialCampaignBySlug } from "./specialCampaigns";

export const LANDING_CAMPAIGN_COLUMNS =
  "slug,title,creator_name,logo_path,landing_label";

export type LandingCampaignRow = {
  slug: string;
  title: string;
  creator_name: string | null;
  logo_path: string | null;
  landing_label: string | null;
};

/** Öffentliche Felder für die Kampagnen-Pills im Hero (Client-Komponente). */
export type LandingCampaign = {
  slug: string;
  href: string;
  label: string;
  title: string;
  creatorName: string | null;
  logoPath: string | null;
};

export function toLandingCampaign(row: LandingCampaignRow): LandingCampaign {
  return {
    slug: row.slug,
    href: getSpecialCampaignBySlug(row.slug)?.path ?? `/kampagne/${row.slug}`,
    label: row.landing_label?.trim() || row.title,
    title: row.title,
    creatorName: row.creator_name?.trim() || null,
    logoPath: row.logo_path,
  };
}
