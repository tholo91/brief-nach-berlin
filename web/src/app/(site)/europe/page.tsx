import type { Metadata } from "next";
import { headers } from "next/headers";
import { APP_URL, FOUNDER_EMAIL } from "@/lib/config";
import { getLetterCount } from "@/lib/counter";
import { EuropePageContent } from "./EuropePageClient";

const URL_PATH = "/europe";
const PUBLISHED = "2026-06-26";
const MODIFIED = "2026-08-11";
const TITLE = "Use Brief-nach-Berlin in your country | Brief-nach-Berlin";
const DESCRIPTION =
  "Fork Brief-nach-Berlin and plan a local version for Austria, Switzerland, or another country.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    locale: "en_US",
    url: `${APP_URL}${URL_PATH}`,
    images: [
      {
        url: `${APP_URL}/images/europe-correspondence.webp`,
        width: 1376,
        height: 768,
        alt: "Handwritten letters crossing Europe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${APP_URL}/images/europe-correspondence.webp`],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: MODIFIED,
  author: { "@type": "Organization", name: "Brief-nach-Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief-nach-Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  url: `${APP_URL}${URL_PATH}`,
  inLanguage: "en",
};

type Language = "de" | "en";

function resolveLanguage(params: { lang?: string }, acceptLanguage: string): Language {
  if (params.lang === "de" || params.lang === "en") return params.lang;
  return acceptLanguage
    .split(",")
    .some((language) => language.trim().toLowerCase().startsWith("de"))
    ? "de"
    : "en";
}

export default async function EuropePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const language = resolveLanguage(
    params,
    requestHeaders.get("accept-language") ?? ""
  );
  const letterCount = await getLetterCount();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <EuropePageContent
        contactEmail={FOUNDER_EMAIL}
        language={language}
        letterCount={letterCount}
      />
    </>
  );
}
