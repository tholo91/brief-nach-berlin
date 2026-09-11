import type { Metadata } from "next";
import { SchreibMerzExperienceV2 } from "@/components/campaigns/SchreibMerzExperienceV2";
import { SCHREIB_MERZ_CAMPAIGN } from "@/lib/campaigns/specialCampaigns";
import { APP_URL } from "@/lib/config";

const TITLE = "Schreib Merz: Dein Anliegen als Brief";
const DESCRIPTION =
  "Schreib dein Anliegen in deinen eigenen Worten. Mit optionalen Startbausteinen entsteht daraus dein persönlicher Brief an Friedrich Merz oder an ein Mitglied des Bundestags aus deinem Wahlkreis.";
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
        alt: "Schreib Merz – dein Anliegen als persönlicher Brief",
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
      <SchreibMerzExperienceV2 />
    </>
  );
}
