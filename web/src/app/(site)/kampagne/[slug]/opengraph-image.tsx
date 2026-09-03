import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { campaignLogoPublicUrl } from "@/lib/campaigns/logo";
import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import { campaignSlugSchema } from "@/lib/campaigns/schema";
import { APP_URL } from "@/lib/config";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type CampaignOpenGraphImageProps = {
  params: Promise<{ slug: string }>;
};

function compactText(value: string, maxLength: number): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

function titleSize(title: string): number {
  if (title.length > 76) return 58;
  if (title.length > 56) return 66;
  return 76;
}

function campaignClaim(issueText: string, description: string | null): string {
  const source = description?.trim() || issueText.trim().split(/\n\s*\n/)[0];
  return compactText(source, 148);
}

function campaignLogoForOpenGraph(path: string | null): string | null {
  if (!path || !/\.(?:png|jpe?g)$/i.test(path)) return null;
  return campaignLogoPublicUrl(path);
}

export default async function CampaignOpenGraphImage({
  params,
}: CampaignOpenGraphImageProps) {
  const { slug: rawSlug } = await params;
  const parsedSlug = campaignSlugSchema.safeParse(rawSlug);
  if (!parsedSlug.success) notFound();

  const campaign = await getActiveCampaignBySlug(parsedSlug.data);
  if (!campaign) notFound();

  const title = compactText(campaign.title, 92);
  const creatorName = campaign.creatorName
    ? compactText(campaign.creatorName, 46)
    : null;
  const claim = campaignClaim(campaign.issueText, campaign.description);
  const imageUrl =
    campaignLogoForOpenGraph(campaign.logoPath) ??
    `${APP_URL}/images/campaign-creator-icon.png`;
  const backgroundImageUrl = `${APP_URL}/images/img-campaign-crowd-ghibli.png`;
  const fontSize = titleSize(title);
  const airmailStripe =
    "repeating-linear-gradient(-45deg, #C1121F, #C1121F 8px, #FAF8F5 8px, #FAF8F5 12px, #1D3557 12px, #1D3557 20px, #FAF8F5 20px, #FAF8F5 24px)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          background: "#faf8f2",
          color: "#173f2e",
          fontFamily: "Arial, sans-serif",
          padding: "76px 64px",
          position: "relative",
        }}
      >
        <img
          src={backgroundImageUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(250,248,242,0.96) 0%, rgba(250,248,242,0.91) 52%, rgba(250,248,242,0.72) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: 690,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "#2f7051",
              fontSize: 25,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 3.2,
            }}
          >
            Öffentliche Briefkampagne
          </div>
          <div
            style={{
              marginTop: 36,
              fontSize,
              lineHeight: 1.03,
              fontWeight: 900,
              letterSpacing: 0,
              color: "#173f2e",
            }}
          >
            {title}
          </div>
          {creatorName && (
            <div
              style={{
                marginTop: 26,
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 29,
                lineHeight: 1.15,
                color: "#4f584f",
              }}
            >
              Ein Anliegen von {creatorName}
            </div>
          )}
          <div
            style={{
              marginTop: creatorName ? 24 : 28,
              maxWidth: 650,
              fontSize: 28,
              lineHeight: 1.2,
              color: "#3f4b43",
            }}
          >
            {claim}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            width: 330,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 308,
              height: 308,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 42,
              background: "rgba(255, 255, 255, 0.82)",
              border: "2px solid rgba(23, 63, 46, 0.14)",
              boxShadow: "0 28px 70px rgba(23, 63, 46, 0.16)",
              padding: 32,
            }}
          >
            <img
              src={imageUrl}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: airmailStripe,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 10,
            background: airmailStripe,
          }}
        />
      </div>
    ),
    size
  );
}
