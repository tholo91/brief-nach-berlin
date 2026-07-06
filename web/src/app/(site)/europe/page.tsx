import type { Metadata } from "next";
import { headers } from "next/headers";
import { APP_URL, FOUNDER_EMAIL } from "@/lib/config";
import { EuropePageContent } from "./EuropePageClient";

const URL_PATH = "/europe";
const PUBLISHED = "2026-06-26";
const MODIFIED = "2026-07-03";
const TITLE = "Bring Brief nach Berlin to your country | Brief nach Berlin";
const DESCRIPTION =
  "Use the open source approach behind Brief nach Berlin for another country: choose an AI provider, map local representatives, adapt language and test it locally.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    locale: "en_GB",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const faqs = [
  {
    q: "Can I adapt Brief nach Berlin for my country?",
    a: "Yes. The code is open. You can fork it, use Mistral AI or another suitable LLM provider, map local representatives and adapt the copy, design, forms of address, languages and privacy details to your country.",
  },
  {
    q: "What has to be adapted locally?",
    a: "The most important work is mapping postal codes or constituencies to the right representatives and offices. Some countries need a different lookup model, so local validation matters.",
  },
  {
    q: "Can Thomas build versions for all of Europe?",
    a: "No. Thomas can share lessons, technical context and feedback, but local teams have to handle country-specific institutions, language and culture.",
  },
  {
    q: "Why not build one central European version?",
    a: "Political systems differ too much. One central version would become inaccurate quickly. Local versions are better: they can use the open approach and translate it carefully for their institutions.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: MODIFIED,
  author: { "@type": "Organization", name: "Brief nach Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief nach Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  url: `${APP_URL}${URL_PATH}`,
  inLanguage: ["de-DE", "en"],
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <EuropePageContent contactEmail={FOUNDER_EMAIL} language={language} />
    </>
  );
}
