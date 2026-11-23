import type { Metadata } from "next";
import { ElternPageContent } from "@/components/eltern/ElternPageContent";
import { APP_URL, DEFAULT_OG_IMAGES } from "@/lib/config";
import { ELTERN_COPY } from "@/lib/i18n/elternCopy";

const URL_PATH = "/eltern";
const CANONICAL_URL = `${APP_URL}${URL_PATH}`;
const TITLE = "Unterrichtsausfall beschweren: Brief an die Landespolitik";
const DESCRIPTION =
  "Unterrichtsausfall, Lehrermangel, marode Schule? Als Elternteil an Landtag oder Schulträger schreiben: Anliegen schildern, Entwurf bekommen, eigenen Brief schreiben.";

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "de_DE",
    url: CANONICAL_URL,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: TITLE,
      description: DESCRIPTION,
      url: CANONICAL_URL,
      inLanguage: "de-DE",
      isPartOf: { "@id": `${APP_URL}/#website` },
      publisher: { "@id": `${APP_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      mainEntity: ELTERN_COPY.de.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function ElternPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ElternPageContent />
    </>
  );
}
