import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

const URL_PATH = "/was-bisher-geschah";
const PUBLISHED = "2026-05-27";
const TITLE =
  "Was bisher geschah: Der Fortschritt von Brief nach Berlin";
const DESCRIPTION =
  "Ein offenes Fortschritts-Log, das zeigt, was ich seit dem Start an Brief nach Berlin gebaut, verbessert und gelernt habe.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: "Was bisher geschah: Der Fortschritt von Brief nach Berlin",
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Was bisher geschah: Der Fortschritt von Brief nach Berlin",
    description: DESCRIPTION,
  },
};

interface Monat {
  key: string;
  badge: string;
  entries: string[];
}

const monate: Monat[] = [
  {
    key: "mai-2026",
    badge: "Mai 2026",
    entries: [
      "Bewertungen von echten Nutzern gesammelt und auf der Seite /stimmen veröffentlicht, mit Filter und Swipe-Funktion auf dem Handy.",
      "Die Seite /was-noch-kommt (Roadmap) ist live, mit den vier politischen Ebenen und einem Anmeldeformular für die Landtag-Ebene.",
      "E-Mail nach dem Briefversand überarbeitet: Footer mit direktem Link zur Abgeordneten-Seite, Sterne-Bewertung direkt in der Mail.",
      "Briefvorschau und Verbesserungs-Vorschläge auf Mobilgeräten benutzerfreundlicher gemacht.",
      "Entscheidung gegen pauschal negative Bewertungen: Briefe unter 3 Sternen werden nicht öffentlich gezeigt.",
      "Wechsel von 'wir' auf 'ich' auf der Startseite und allen Unterseiten, weil Brief nach Berlin ein Solo-Projekt ist.",
      "Stadtstaaten-Problem erkannt: In Berlin, Hamburg und Bremen liegen manche Postleitzahlen in mehreren Wahlkreisen gleichzeitig. Fix ist in Planung.",
    ],
  },
  {
    key: "april-2026",
    badge: "April 2026",
    entries: [
      "Briefversand per E-Mail eingebaut: Nutzer bekommen den fertigen Brief direkt ins Postfach, inklusive Anschrift und Anleitung zum Ausdrucken.",
      "Whisper-Transkription integriert: Anliegen per Sprache eingeben, nicht nur per Text.",
      "Firefox-Kompatibilität gefixt: Das Hero-Video auf der Startseite lief in Firefox nicht, jetzt schon.",
      "Mistral-API mit automatischem Retry bei kurzfristigen Serverfehlern abgesichert, damit kein Brief stillschweigend verloren geht.",
      "E-Mail-Footer verfeinert: klarerer Hinweis auf den handschriftlichen Charakter und warum das zählt.",
      "Em-Dashes aus allen Texten entfernt, weil sie in handschriftlichen Briefen falsch wirken.",
      "Datenschutz-Grundlage gelegt: keine Datenbank, kein Account, keine persistente Speicherung von Briefen.",
    ],
  },
  {
    key: "maerz-2026",
    badge: "März 2026",
    entries: [
      "Brief nach Berlin gestartet: Aus einer Postleitzahl und ein paar Sätzen Frust wird ein fertig adressierter Briefentwurf an den zuständigen Bundestagsabgeordneten.",
      "PLZ-zu-Wahlkreis-Mapping aus den Bundeswahlleiter-Daten aufgebaut und als statische JSON-Lookup-Tabelle integriert.",
      "Abgeordnetenwatch-API angebunden: Name, Fraktion und Berliner Büro-Adresse werden direkt aus den offiziellen Mandatsdaten gezogen.",
      "Brief-Prompt entwickelt: Ich-Form, ca. 200 bis 280 Wörter, fließende Prosa, kein PR-Sprech.",
      "Erste Briefe an echte Abgeordnete verschickt, erstes Feedback eingeholt.",
      "Vercel-Deployment aufgesetzt, Domain brief-nach-berlin.de registriert.",
    ],
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Was bisher geschah: Der Fortschritt von Brief nach Berlin",
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

export default function WasBisherGeschahPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Fortschritt
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Was bisher geschah
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-10 text-pretty">
          Ich baue offen. Hier steht, was ich bisher gebaut, verbessert und
          gelernt habe, Monat für Monat.
        </p>

        {/* Roadmap cross-link */}
        <div className="mb-12 border-l-4 border-waldgruen pl-6 py-2">
          <p className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 mb-2">
            Was als Nächstes kommt
          </p>
          <p className="font-body text-base text-waldgruen-dark leading-relaxed mb-2">
            Das hier zeigt, was schon passiert ist. Was als Nächstes kommt,
            steht in der Roadmap.
          </p>
          <Link
            href="/was-noch-kommt"
            className="font-body text-sm font-bold text-waldgruen-dark underline decoration-waldgruen/40 hover:decoration-waldgruen-dark transition-colors"
          >
            Was noch kommt &rarr;
          </Link>
        </div>

        {/* Monats-Sektionen */}
        <div className="space-y-6 mb-16">
          {monate.map((monat) => (
            <section
              key={monat.key}
              className="bg-white border border-waldgruen/15 rounded-2xl p-6 sm:p-8 shadow-sm"
              aria-labelledby={`monat-${monat.key}`}
            >
              <div className="mb-4">
                <span
                  id={`monat-${monat.key}`}
                  className="inline-block rounded-full px-3 py-1 font-typewriter text-xs font-bold uppercase tracking-widest bg-waldgruen text-creme"
                >
                  {monat.badge}
                </span>
              </div>
              <ul className="space-y-2">
                {monat.entries.map((entry, i) => (
                  <li
                    key={i}
                    className="font-body text-base text-warmgrau leading-relaxed flex gap-3"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-waldgruen/40" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-16 p-8 border-2 border-waldgruen/20 bg-creme/50 rounded-sm">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Jetzt ausprobieren
          </p>
          <p className="font-body text-lg text-waldgruen-dark mb-6">
            Beschreib dein Anliegen in ein paar Sätzen, gib deine Postleitzahl
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
