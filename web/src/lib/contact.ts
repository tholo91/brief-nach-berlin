export const BRIEF_EMAIL = "Brief-nach-Berlin@posteo.de" as const;

export const CONTACT = {
  email: BRIEF_EMAIL,
} as const;

export function campaignContactHref(slug: string): string {
  return `mailto:${BRIEF_EMAIL}?subject=${encodeURIComponent(`Kampagne ${slug}`)}`;
}

export function campaignJointPostHref(slug: string): string {
  const subject = encodeURIComponent(`Gemeinsamer Post: ${slug}`);
  const body = encodeURIComponent(
    "Hallo Thomas,\n\nNetzwerk (Instagram oder LinkedIn):\nMein Account:\n\n",
  );
  return `mailto:${BRIEF_EMAIL}?subject=${subject}&body=${body}`;
}
