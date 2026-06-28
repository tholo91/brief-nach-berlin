import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignHero } from "@/components/campaigns/CampaignHero";
import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import { campaignSlugSchema } from "@/lib/campaigns/schema";

type CampaignPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CampaignPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const parsedSlug = campaignSlugSchema.safeParse(rawSlug);
  if (!parsedSlug.success) return {};

  const campaign = await getActiveCampaignBySlug(parsedSlug.data);
  if (!campaign) return {};

  return {
    title: `${campaign.title} | Brief nach Berlin`,
    description:
      campaign.description ??
      "Eine oeffentliche Kampagne mit editierbarem Anliegen fuer deinen Brief an die Politik.",
    alternates: { canonical: `/kampagne/${campaign.slug}` },
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug: rawSlug } = await params;
  const parsedSlug = campaignSlugSchema.safeParse(rawSlug);
  if (!parsedSlug.success) notFound();

  const campaign = await getActiveCampaignBySlug(parsedSlug.data);
  if (!campaign) notFound();

  return <CampaignHero campaign={campaign} />;
}
