import type { Metadata } from "next";
import { SchreibMerzExperience } from "@/components/campaigns/SchreibMerzExperience";
import { SCHREIB_MERZ_CAMPAIGN } from "@/lib/campaigns/specialCampaigns";
import { APP_URL } from "@/lib/config";

const TITLE = "Schreib Merz: Dein Brief an den Bundeskanzler";
const DESCRIPTION = SCHREIB_MERZ_CAMPAIGN.description;
const CANONICAL_URL = `${APP_URL}${SCHREIB_MERZ_CAMPAIGN.path}`;

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "de_DE",
    url: CANONICAL_URL,
    images: [
      {
        url: `${CANONICAL_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Schreib Merz – dein persönlicher Brief an den Bundeskanzler",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${CANONICAL_URL}/opengraph-image`],
  },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: TITLE,
  description: DESCRIPTION,
  url: CANONICAL_URL,
  inLanguage: "de-DE",
  isPartOf: { "@id": `${APP_URL}/#website` },
  publisher: { "@id": `${APP_URL}/#organization` },
};

export default function SchreibMerzPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <SchreibMerzExperience />
    </>
  );
}
