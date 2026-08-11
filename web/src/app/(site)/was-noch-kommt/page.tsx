import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { APP_URL, FOUNDER_FEEDBACK_URL, FOUNDER_EMAIL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";

const URL_PATH = "/was-noch-kommt";
const PUBLISHED = "2026-05-22";
const TITLE =
  "Welche politischen Ebenen unterstützt Brief-nach-Berlin? | Brief-nach-Berlin";
const DESCRIPTION =
  "Brief-nach-Berlin unterstützt heute Bund, Land und Kommune. Hier steht, wie die Zuständigkeit funktioniert und was bewusst nicht versprochen wird.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: "Welche politischen Ebenen unterstützt Brief-nach-Berlin?",
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Welche politischen Ebenen unterstützt Brief-nach-Berlin?",
    description: DESCRIPTION,
  },
};

type LevelStatus = "live" | "beta" | "geplant";

interface Level {
  key: "bund" | "land" | "kommune" | "eu";
  name: string;
  badge: string;
  status: LevelStatus;
  body: ReactNode;
}

const levels: Level[] = [
  {
    key: "bund",
    name: "Bund",
    badge: "Live",
    status: "live",
    body: "Heute schreibst du an deine Bundestagsabgeordnete oder deinen Bundestagsabgeordneten. Themen wie Steuern, Rente, Arbeitsrecht oder Außenpolitik landen direkt im Berliner Büro, mit korrekter Anschrift und Anliegen-passender Anrede.",
  },
  {
    key: "land",
    name: "Land",
    badge: "Live",
    status: "live",
    body: "Schule, Polizei, Hochschulen, Wohnungspolitik: das gehört in den Landtag, nicht nach Berlin. Brief-nach-Berlin routet Landesthemen an die institutionell passende Landesadresse und berücksichtigt dabei auch Stadtstaaten.",
  },
  {
    key: "kommune",
    name: "Kommune",
    badge: "Live",
    status: "live",
    body: "Spielplatz, Kita, Radweg, Bauantrag: hier hilft kein Brief nach Berlin, hier hilft ein Brief ans Rathaus. Brief-nach-Berlin führt kommunale Anliegen anhand offizieller Gemeindeadressen zur passenden Stadt oder Gemeinde.",
  },
  {
    key: "eu",
    name: "EU",
    badge: "Vorerst nicht geplant",
    status: "geplant",
    body: (
      <>
        Datenschutz, Klimaziele, Lieferketten, Agrarpolitik: vieles davon wird
        in Brüssel entschieden, nicht in Berlin. Eine EU-Ebene ist derzeit
        nicht Teil des Produkts. Wenn sich das ändert, steht es zuerst hier.
      </>
    ),
  },
];

function badgeClasses(status: LevelStatus): string {
  switch (status) {
    case "live":
      return "bg-waldgruen text-creme";
    case "beta":
      return "bg-waldgruen/15 text-waldgruen-dark";
    case "geplant":
      return "bg-warmgrau/15 text-warmgrau";
  }
}

const faqs = [
  {
    q: "Welche politischen Ebenen werden aktuell unterstützt?",
    a: "Aktuell unterstützt Brief-nach-Berlin Bund, Land und Kommune. Die drei Ebenen sind im normalen Briefprozess verfügbar. Die EU-Ebene ist derzeit nicht Teil des Produkts.",
  },
  {
    q: "Ist die Landtag-Ebene schon live?",
    a: "Ja. Landesthemen werden an die institutionell passende Landesadresse geroutet. Die Zuordnung berücksichtigt Bundesländer, Stadtstaaten und die jeweils passende Anrede.",
  },
  {
    q: "Warum gibt es keine EU-Ebene?",
    a: "Eine EU-Ebene wäre ein eigenes Produkt mit anderen Datenquellen, Zuständigkeiten und Adresslogiken. Ich verspreche sie derzeit nicht und sammle dafür auch keine Anmeldungen.",
  },
  {
    q: "Kann ich eine weitere Ebene vorschlagen?",
    a: "Ja, über die Feedback-Seite. Eine weitere Ebene kommt aber nur hinzu, wenn Zuständigkeit, Datenquellen und Adressierung sauber genug sind.",
  },
  {
    q: "Werden auch Bundesländer-spezifische Besonderheiten berücksichtigt?",
    a: "Ja. Jeder Landtag hat eigene Wahlkreis-Strukturen (Stimmkreise in Bayern, Landtagswahlkreise in NRW), eigene Anreden und eigene Adressformeln. Stadtstaaten wie Berlin, Hamburg und Bremen behandle ich gesondert, weil dort Land und Kommune verfassungsrechtlich verschmelzen.",
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
  headline: "Welche politischen Ebenen unterstützt Brief-nach-Berlin?",
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: "2026-08-11",
  author: { "@type": "Organization", name: "Brief-nach-Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief-nach-Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

export default function WasNochKommtPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Zuständigkeit
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Welche Ebenen heute funktionieren
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-10 text-pretty">
          Ich baue offen. Hier steht, welche politische Ebene heute für dein
          Anliegen erreichbar ist — und was ich bewusst noch nicht verspreche.
        </p>

        <figure className="mb-12 -mx-2 sm:mx-0">
          <Image
            src="/images/img-vier-ebenen-pfade.webp"
            alt="Vier Pfade einer Landschaft führen zu Rathaus, Landtag, Bundestag und EU-Parlament. Briefe wehen den Wegen entlang."
            width={1280}
            height={700}
            sizes="(min-width: 768px) 42rem, 100vw"
            className="w-full h-auto rounded-2xl shadow-sm"
            priority
          />
        </figure>

        {/* GEO Answer Block */}
        <div className="mb-14 border-l-4 border-waldgruen pl-6 py-2">
          <p className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 mb-3">
            Welche Ebenen kann ich anschreiben?
          </p>
          <p className="font-body text-base md:text-lg text-waldgruen-dark leading-relaxed">
            Heute schreibst du mit Brief-nach-Berlin an Bund, Land oder
            Kommune. Diese drei Ebenen sind im Produkt verfügbar. Die
            EU-Ebene ist derzeit nicht geplant.
          </p>
        </div>

        <div className="mb-14 rounded-2xl border border-airmail-rot/20 bg-white/70 p-6 sm:p-8 shadow-sm">
          <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-airmail-rot/70 mb-3">
            Was heute gilt
          </p>
          <p className="font-body text-base text-warmgrau leading-relaxed">
            Bund, Land und Kommune sind im normalen Produkt verfügbar. Die App
            ordnet dein Anliegen einer passenden Ebene zu und führt dich, wo
            die Daten sauber genug sind, zur richtigen institutionellen oder
            politischen Adresse. Bei unklaren Fällen kannst du die Ebene selbst
            korrigieren.
          </p>
        </div>

        {/* Die politischen Ebenen */}
        <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4 mb-8">
          Die politischen Ebenen
        </h2>

        <div className="space-y-6 mb-16">
          {levels.map((level) => (
            <section
              key={level.key}
              className="bg-white border border-waldgruen/15 rounded-2xl p-6 sm:p-8 shadow-sm"
              aria-labelledby={`level-${level.key}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
                <h3
                  id={`level-${level.key}`}
                  className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark"
                >
                  {level.name}
                </h3>
                <span
                  className={`inline-block rounded-full px-3 py-1 font-typewriter text-xs font-bold uppercase tracking-widest ${badgeClasses(level.status)}`}
                >
                  {level.badge}
                </span>
              </div>
              <p className="font-body text-base text-warmgrau leading-relaxed">
                {level.body}
              </p>

            </section>
          ))}
        </div>

        {/* Cross-Links */}
        <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4 mb-3">
          Schon jetzt mitgestalten
        </h2>
        <p className="font-body text-base text-warmgrau leading-relaxed mb-6">
          Du kannst die neuen Ebenen jetzt testen. Drei Wege, das Projekt
          direkt zu beeinflussen:
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-16">
          <a
            href={FOUNDER_FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-waldgruen/15 hover:border-waldgruen rounded-2xl p-5 transition-colors"
          >
            <p className="font-body text-base font-bold text-waldgruen-dark mb-1">
              Feedback geben
            </p>
            <p className="font-body text-sm text-warmgrau leading-snug">
              Sag mir, wo Land oder Kommune noch falsch liegen.
            </p>
          </a>
          <Link
            href="/aktiv-werden"
            className="block bg-white border border-waldgruen/15 hover:border-waldgruen rounded-2xl p-5 transition-colors"
          >
            <p className="font-body text-base font-bold text-waldgruen-dark mb-1">
              Aktiv werden
            </p>
            <p className="font-body text-sm text-warmgrau leading-snug">
              Bürgersprechstunden, Petitionen, eigene Initiativen.
            </p>
          </Link>
          <Link
            href="/kampagne/starten"
            className="block bg-white border border-waldgruen/15 hover:border-waldgruen rounded-2xl p-5 transition-colors"
          >
            <p className="font-body text-base font-bold text-waldgruen-dark mb-1">
              Kampagne starten
            </p>
            <p className="font-body text-sm text-warmgrau leading-snug">
              Wenn ein aktuelles Thema jetzt viele persönliche Briefe braucht.
            </p>
          </Link>
        </div>

        <div className="mb-16 rounded-2xl border border-waldgruen/15 bg-white p-6 sm:p-8 shadow-sm">
          <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60 mb-3">
            Europa
          </p>
          <h2 className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark mb-3">
            Brief-nach-Berlin für andere Länder
          </h2>
          <p className="font-body text-base text-warmgrau leading-relaxed mb-5">
            Neben Bund, Land und Kommune gibt es eine zweite Spur: Der Code
            ist offen. Menschen in Österreich, Portugal, den Niederlanden oder
            anderswo können das Muster nehmen und vor Ort übersetzen. Ich suche
            Kontakte, Datenquellen und Leute, die direkt anfangen wollen.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/europe"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-waldgruen-dark px-5 py-3 text-center font-body text-sm font-bold text-creme transition-colors hover:bg-waldgruen"
            >
              Europa-Version starten
            </Link>
            <a
              href={`mailto:${FOUNDER_EMAIL}?subject=Brief%20nach%20Berlin%20in%20Europa`}
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-waldgruen/25 px-5 py-3 text-center font-body text-sm font-bold text-waldgruen-dark transition-colors hover:border-waldgruen hover:bg-creme"
            >
              Mich anschreiben
            </a>
          </div>
        </div>

        <Prose>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Wie die Zuständigkeit funktioniert
          </h2>
          <p>
            Die aktuelle Struktur folgt einer einfachen Regel: Dein Anliegen
            soll an die Ebene gehen, die tatsächlich handeln kann. Wer
            Bildungspolitik adressieren will, braucht den Landtag. Wer einen
            Bauantrag oder Radweg betrifft, braucht die Kommune.
          </p>
          <p>
            Kampagnen können dabei mehrere persönliche Briefe zu einem Thema
            bündeln. Der Brief bleibt trotzdem persönlich und wird nicht als
            Massenbrief an eine ganze Liste von Empfänger:innen kopiert.
          </p>
          <p>
            Die technische Komplexität der Datenquellen bleibt der wichtigste
            Prüfstein. Der
            Bundestag liefert seine Mandate über eine einzige, gut gepflegte
            Schnittstelle (abgeordnetenwatch.de). Auf Landesebene sind die
            Strukturen heterogener, jedes Bundesland hat eigene
            Wahlkreis-Logik. Auf Kommunalebene gibt es kein zentrales Register,
            sondern viele Gemeinden mit unterschiedlichen Verwaltungsstrukturen.
            Deshalb bleibt die Zuordnung transparent, statt jeden Randfall als
            perfekt gelöst auszugeben.
          </p>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </Prose>

        {/* Sichtbarkeit */}
        <div className="mt-16 p-6 sm:p-8 border-2 border-waldgruen/20 bg-creme/40 rounded-sm">
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Sichtbarkeit
          </p>
          <h2 className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark mb-3">
            Was mir jetzt am meisten hilft
          </h2>
          <p className="font-body text-base text-warmgrau leading-relaxed mb-4">
            Brief-nach-Berlin ist ein Freizeitprojekt von einer Person. Am
            meisten hilft mir gerade Sichtbarkeit: Wenn du das Projekt
            weitergibst oder mich mit Menschen aus Presse, Medien oder
            passenden Communities vernetzt, bringt mich das konkret weiter.
            Wenn du an einer lokalen Version für ein anderes europäisches
            Land arbeitest, findest du die Infos auf der{" "}
            <Link
              href="/europe"
              className="text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
            >
              Europa-Seite
            </Link>
            .
          </p>
          <a
            href={`mailto:${FOUNDER_EMAIL}?subject=${encodeURIComponent("Sichtbarkeit für Brief-nach-Berlin")}`}
            className="inline-block font-body font-bold text-creme bg-waldgruen-dark hover:bg-waldgruen px-6 py-3 rounded-sm transition-colors"
          >
            Kontakt herstellen
          </a>
        </div>

        {/* Final CTA */}
        <div className="mt-16 p-8 border-2 border-waldgruen/20 bg-creme/50 rounded-sm">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Solange schreibst du schon mal
          </p>
          <p className="font-body text-lg text-waldgruen-dark mb-6">
            Wenn dein Anliegen Bundesthema ist, kannst du heute schon
            loslegen. Beschreib es in ein paar Sätzen, gib deine Postleitzahl
            ein, und du bekommst einen Briefentwurf an deine
            Bundestagsabgeordnete oder deinen Bundestagsabgeordneten.
          </p>
          <Link
            href="/"
            className="inline-block font-body font-bold text-creme bg-waldgruen-dark hover:bg-waldgruen px-6 py-3 rounded-sm transition-colors"
          >
            Brief schreiben &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
