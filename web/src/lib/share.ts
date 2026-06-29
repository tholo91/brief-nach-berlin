import { APP_URL, SHARE_TEXT_CAUSE } from "@/lib/config";

type CampaignShareInput = {
  slug?: string | null;
  title?: string | null;
  creatorName?: string | null;
};

type CampaignShareContext = "participant" | "creator";

export type ShareTarget = {
  url: string;
  text: string;
  subject: string;
  whatsappUrl: string;
  telegramUrl: string;
  linkedinUrl: string;
  emailUrl: string;
};

export function campaignPublicUrl(slug: string): string {
  return `${APP_URL}/kampagne/${encodeURIComponent(slug)}`;
}

export function buildShareTarget(
  campaign?: CampaignShareInput | null,
  context: CampaignShareContext = "participant"
): ShareTarget {
  const slug = campaign?.slug?.trim();
  const title = campaign?.title?.trim();
  const url = slug ? campaignPublicUrl(slug) : APP_URL;
  const subject = title
    ? `Machst du bei "${title}" mit?`
    : "Schreibst du auch einen Brief nach Berlin?";
  const text =
    slug && title && context === "creator"
      ? `Ich habe die Briefkampagne "${title}" gestartet. Schreibst du auch einen eigenen Brief aus deinem Wahlkreis? ${url}`
      : slug && title
      ? `Ich habe gerade bei der Kampagne "${title}" einen Brief an die Politik vorbereitet. Machst du auch mit? ${url}`
      : SHARE_TEXT_CAUSE;

  return {
    url,
    text,
    subject,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(text)}`,
    telegramUrl: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    linkedinUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    emailUrl: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
  };
}
