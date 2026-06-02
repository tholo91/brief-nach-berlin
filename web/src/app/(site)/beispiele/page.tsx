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

const ECHO_CTA_BY_SLUG: Record<string, string> = {
  energiepolitik: "Auch was zu Klima oder Energie? Brief schreiben",
  "bremen-hauptbahnhof": "Auch was vor deiner Haustür? Brief schreiben",
  "berlin-kreuzkoelln": "Auch was zu Mieten oder Stadt? Brief schreiben",
};

const ECHO_CTA_FALLBACK = "Ähnlichen Brief schreiben";

const AIRMAIL_STRIPE_BG = `repeating-linear-gradient(
  -45deg,
  var(--color-airmail-rot),
  var(--color-airmail-rot) 8px,
  var(--color-creme) 8px,
  var(--color-creme) 12px,
  var(--color-airmail-blau) 12px,
  var(--color-airmail-blau) 20px,
  var(--color-creme) 20px,
  var(--color-creme) 24px
)`;

export default function BeispielePage() {
  return (
    <div className="min-h-screen bg-creme">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Hero */}
      <section className="px-6 pt-12 md:pt-16 pb-12 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Echt verschickt
          </p>
          <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-5 text-balance">
            Drei Briefe, die wirklich rausgegangen sind.
          </h1>
          <p className="font-body text-base md:text-lg text-warmgrau leading-relaxed mb-8 max-w-2xl text-pretty">
            Diese drei Briefe wurden mit Brief nach Berlin formuliert, von Hand
            abgeschrieben und in den Briefkasten geworfen. Namen anonymisiert,
            der Rest steht so im Original.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-5">
            <Link
              href="/app"
              className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/25 active:scale-[0.98]"
            >
              Jetzt deinen Brief schreiben &rarr;
            </Link>
            <span className="font-handwriting text-xl text-waldgruen-dark leading-snug">
              dauert keine 3 Minuten
            </span>
          </div>

          <p className="font-typewriter text-xs text-warmgrau/70 tracking-wide">
            Über 300 Briefe verschickt
            <span className="mx-2 text-warmgrau/40">·</span>
            Kostenlos
            <span className="mx-2 text-warmgrau/40">·</span>
            Ohne Anmeldung
          </p>
        </div>
      </section>

      {/* Letters */}
      <section className="px-6 pb-20 md:pb-24">
        <div className="max-w-3xl mx-auto space-y-20 md:space-y-24">
          {EXAMPLE_LETTERS.map((letter, i) => {
            const ctaLabel =
              ECHO_CTA_BY_SLUG[letter.slug] ?? ECHO_CTA_FALLBACK;
            return (
              <div key={letter.slug}>
                <LetterPaper
                  letter={letter}
                  rotate={i % 2 === 0 ? "left" : "right"}
                />
                <div className="mt-6 md:mt-7 flex justify-end">
                  <Link
                    href="/app"
                    className="group inline-flex items-center gap-2 font-typewriter text-xs md:text-sm font-bold tracking-widest uppercase text-waldgruen hover:text-waldgruen-dark transition-colors"
                  >
                    {ctaLabel}
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-creme">
        <div className="px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-handwriting text-2xl md:text-3xl text-waldgruen-dark leading-snug mb-5">
              Dein Anliegen ist das nächste.
            </p>
            <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-3 text-balance">
              Schreib deinen Brief.
            </h2>
            <p className="font-body text-base md:text-lg text-warmgrau leading-relaxed mb-8">
              Drei Minuten. Kostenlos. Keine Anmeldung.
            </p>
            <Link
              href="/app"
              className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/25 active:scale-[0.98]"
            >
              Jetzt loslegen &rarr;
            </Link>
            <p className="mt-6 font-typewriter text-xs md:text-sm text-warmgrau/70 tracking-wide max-w-md mx-auto">
              Brief nach Berlin findet die richtige Adresse. Du musst nur sagen,
              was du denkst.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
