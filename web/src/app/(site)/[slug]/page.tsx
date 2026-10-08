import { notFound, permanentRedirect } from "next/navigation";
import {
  getActiveCampaignByCompactSlug,
  getActiveCampaignBySlug,
  getCampaignBySlug,
} from "@/lib/campaigns/repository";
import { isEndedWhilePaused } from "@/lib/campaigns/endDate";
import { campaignSlugSchema } from "@/lib/campaigns/schema";

export const dynamic = "force-dynamic";

async function getActiveOrEndedPausedCampaign(slug: string) {
  const active = await getActiveCampaignBySlug(slug);
  if (active) return active;
  const paused = await getCampaignBySlug(slug);
  return paused && isEndedWhilePaused(paused, new Date()) ? paused : null;
}

type RootSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RootSlugPage({
  params,
}: RootSlugPageProps) {
  const { slug: rawSlug } = await params;
  if (!/^[a-z0-9-]+$/i.test(rawSlug)) {
    notFound();
  }

  const parsedSlug = campaignSlugSchema.safeParse(rawSlug);

  const exactCampaign = parsedSlug.success
    ? await getActiveOrEndedPausedCampaign(parsedSlug.data)
    : null;
  const campaign =
    exactCampaign ?? (await getActiveCampaignByCompactSlug(rawSlug));

  if (!campaign) {
    notFound();
  }

  permanentRedirect(`/kampagne/${campaign.slug}`);
}
