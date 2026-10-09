export const BRIEF_EMAIL = "Brief-nach-Berlin@posteo.de" as const;

export const CONTACT = {
  email: BRIEF_EMAIL,
} as const;

export function campaignContactHref(slug: string): string {
  return `mailto:${BRIEF_EMAIL}?subject=${encodeURIComponent(`Kampagne ${slug}`)}`;
}
