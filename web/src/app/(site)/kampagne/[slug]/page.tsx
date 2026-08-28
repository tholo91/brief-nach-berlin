import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CampaignHero } from "@/components/campaigns/CampaignHero";
import {
  getActiveCampaignByCompactSlug,
  getActiveCampaignBySlug,
} from "@/lib/campaigns/repository";
import { campaignSlugSchema } from "@/lib/campaigns/schema";

type CampaignPageProps = {
  params: Promise<{ slug: string }>;
};

async function resolveCampaign(rawSlug: string) {
  const parsedSlug = campaignSlugSchema.safeParse(rawSlug);
  if (parsedSlug.success) {
    const exactCampaign = await getActiveCampaignBySlug(parsedSlug.data);
    if (exactCampaign) {
      return {
        campaign: exactCampaign,
        shouldRedirect: rawSlug !== exactCampaign.slug,
      };
    }
  }

  if (!/^[a-z0-9]+$/i.test(rawSlug)) return null;

  const compactCampaign = await getActiveCampaignByCompactSlug(rawSlug);
  return compactCampaign
    ? { campaign: compactCampaign, shouldRedirect: true }
    : null;
}

export async function generateMetadata({
  params,
}: CampaignPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const resolved = await resolveCampaign(rawSlug);
  if (!resolved) return {};
  const { campaign } = resolved;

  return {
    title: `${campaign.title} | Brief-nach-Berlin`,
    description:
      campaign.description ??
      "Eine öffentliche Kampagne mit editierbarem Anliegen für deinen Brief an die Politik.",
    alternates: { canonical: `/kampagne/${campaign.slug}` },
    openGraph: {
      title: campaign.title,
      description:
        campaign.description ??
        "Eine öffentliche Briefkampagne mit vorbereitetem Anliegen.",
      type: "website",
      url: `/kampagne/${campaign.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: campaign.title,
      description:
        campaign.description ??
        "Eine öffentliche Briefkampagne mit vorbereitetem Anliegen.",
    },
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug: rawSlug } = await params;
  const resolved = await resolveCampaign(rawSlug);
  if (!resolved) notFound();
  if (resolved.shouldRedirect) {
    permanentRedirect(`/kampagne/${resolved.campaign.slug}`);
  }

  return <CampaignHero campaign={resolved.campaign} />;
}
