import { notFound, permanentRedirect } from "next/navigation";
import {
  getActiveCampaignByCompactSlug,
  getActiveCampaignBySlug,
} from "@/lib/campaigns/repository";
import { campaignSlugSchema } from "@/lib/campaigns/schema";

export const dynamic = "force-dynamic";

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
    ? await getActiveCampaignBySlug(parsedSlug.data)
    : null;
  const campaign =
    exactCampaign ?? (await getActiveCampaignByCompactSlug(rawSlug));

  if (!campaign) {
    notFound();
  }

  permanentRedirect(`/kampagne/${campaign.slug}`);
}
