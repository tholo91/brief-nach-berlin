import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { EXAMPLE_LETTERS } from "@/lib/example-letters";
import LetterPaper from "@/components/LetterPaper";

const TITLE = "Beispiel-Briefe an Politiker:innen";
const DESCRIPTION =
  "Echte Briefe, die mit Brief nach Berlin entstanden sind: zur Energiepolitik, zur Lage am Bremer Hauptbahnhof und zur Verdrängung in Berlin-Kreuzkölln. Anonymisiert.";
const URL_PATH = "/beispiele";
const PUBLISHED = "2026-05-20";

export const metadata: Metadata = {
  title: `${TITLE} | Brief nach Berlin`,
  description: DESCRIPTION,
  alternates: {
    canonical: `${APP_URL}${URL_PATH}`,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: { "@type": "Organization", name: "Brief nach Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief nach Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

export default function BeispielePage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-16 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Beispiele
          </p>
          <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-5 text-balance">
            Drei Briefe, die wirklich rausgegangen sind
          </h1>

          <p className="font-body text-base md:text-lg text-warmgrau leading-relaxed mb-14 max-w-2xl text-pretty">
            Alle drei Briefe wurden mit Brief nach Berlin formuliert und anschließend
            von Hand abgeschrieben und verschickt. Namen und Wohnort der
            Absender:innen sind anonymisiert. Der Rest ist genau so rausgegangen.
          </p>

        <div className="space-y-16 md:space-y-20">
          {EXAMPLE_LETTERS.map((letter, i) => (
              <LetterPaper key={i} letter={letter} rotate={i % 2 === 0 ? "left" : "right"} />
          ))}
        </div>

        <div className="mt-20 md:mt-24 text-center">
          <p className="font-handwriting text-2xl text-waldgruen-dark mb-6 leading-snug">
            Du hast auch ein Anliegen?
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/20 active:scale-[0.98]"
          >
            Jetzt deinen Brief schreiben &rarr;
          </Link>
          <p className="mt-4 font-body text-sm text-warmgrau/60">
            Kostenlos · in 3 Minuten · ohne Anmeldung
          </p>
          <p className="mt-8 font-body text-sm text-warmgrau/70">
            Unsicher, wie das genau geht? Der{" "}
            <Link
              href="/guide"
              className="text-waldgruen hover:underline"
            >
              komplette Guide nimmt dich Schritt für Schritt mit
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
