import { APP_URL, COMPACT_APP_URL, SHARE_TEXT_CAUSE } from "@/lib/config";
import { formatLetterCount } from "@/lib/campaigns/milestones";
import type { PoliticalLevel } from "@/lib/types/politician";

type CampaignShareInput = {
  slug?: string | null;
  title?: string | null;
  creatorName?: string | null;
  letterCount?: number | null;
};

type CampaignShareContext = "participant" | "creator" | "milestone";

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

export function campaignShortUrl(slug: string): string {
  return `${APP_URL}/${encodeURIComponent(slug)}`;
}

export function campaignCompactShortUrl(slug: string): string {
  return `${COMPACT_APP_URL}/${encodeURIComponent(slug)}`;
}

export function campaignLinkParts(url: string): { prefix: string; slug: string } {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const slug = decodeURIComponent(parts.at(-1) ?? "");
    const prefix = [parsed.hostname, ...parts.slice(0, -1), ""].join("/");
    return { prefix, slug };
  } catch {
    return { prefix: "", slug: url };
  }
}

export function campaignLinkText(url: string): string {
  const { prefix, slug } = campaignLinkParts(url);
  return prefix + slug;
}

export function buildShareTarget(
  campaign?: CampaignShareInput | null,
  context: CampaignShareContext = "participant",
  level: PoliticalLevel = "Bund",
  landInstitutionKind: "landesregierung" | "senat" = "landesregierung"
): ShareTarget {
  const slug = campaign?.slug?.trim();
  const title = campaign?.title?.trim();
  const url = slug ? campaignPublicUrl(slug) : APP_URL;
  const subject = title
    ? `Machst du bei "${title}" mit?`
    : "Schreibst du auch einen Brief-nach-Berlin?";
  const letterCount = campaign?.letterCount;
  const text =
    slug && title && context === "milestone" && letterCount
      ? `Schon ${formatLetterCount(letterCount)} Briefe für „${title}“. Schreibst du auch einen? ${url}`
      : slug && title && context === "creator"
      ? `Ich habe die Briefkampagne "${title}" gestartet. Schreibst du auch einen eigenen Brief mit deinen Worten? ${url}`
      : slug && title
      ? `Ich habe gerade bei der Kampagne "${title}" einen Brief an die Politik vorbereitet. Machst du auch mit? ${url}`
      : level === "Land"
        ? `Ich habe gerade mit Brief-nach-Berlin einen persönlichen Brief an ${landInstitutionKind === "senat" ? "den Senat meines Bundeslands" : "meine Landesregierung"} vorbereitet. Magst du auch einen Brief schreiben, mit deinen eigenen Worten? ${APP_URL}`
        : level === "Kommune"
          ? `Ich habe gerade mit Brief-nach-Berlin einen persönlichen Brief an meine Kommune vorbereitet. Magst du auch einen Brief schreiben, mit deinen eigenen Worten? ${APP_URL}`
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
