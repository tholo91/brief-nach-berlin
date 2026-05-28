import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { getLetterCount } from "@/lib/counter";

const URL_PATH = "/was-bisher-geschah";
const PUBLISHED = "2026-05-28";
const TITLE = "Was bisher geschah: Der Fortschritt von Brief nach Berlin";
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
  /** kurze Linie unter dem Stempel, was diesen Monat ausmachte */
  note: string;
  entries: string[];
}

const monate: Monat[] = [
  {
    key: "mai-2026",
    badge: "Mai 2026",
    note: "Stimmen, Roadmap und spürbar bessere Briefe",
    entries: [
      "Bewertungen von echten Nutzern gesammelt und auf der Seite /stimmen veröffentlicht, mit Filter und Swipe-Funktion auf dem Handy.",
      "Die Seite /was-noch-kommt (Roadmap) ist live, mit den vier politischen Ebenen und einem Anmeldeformular für die Landtag-Ebene.",
      "E-Mail nach dem Briefversand überarbeitet: Footer mit direktem Link zur Abgeordneten-Seite, Sterne-Bewertung direkt in der Mail.",
      "Briefvorschau und Verbesserungs-Vorschläge auf Mobilgeräten benutzerfreundlicher gemacht.",
      "Postleitzahlen in Stadtstaaten wie Berlin, Hamburg und Bremen genauer aufgelöst, damit der Brief beim richtigen Wahlkreis landet.",
      "Auswahl der Abgeordneten klarer gemacht: Bei mehreren Wahlkreisen werden die Politiker nach Wahlkreis gruppiert und als Direktmandat oder Listenplatz gekennzeichnet, und du kannst die Postleitzahl mit einem Klick korrigieren.",
      "Wechsel von 'wir' auf 'ich' auf der Startseite und allen Unterseiten, weil Brief nach Berlin ein Solo-Projekt ist.",
    ],
  },
  {
    key: "april-2026",
    badge: "April 2026",
    note: "Aus der Idee wird ein funktionierendes Werkzeug",
    entries: [
      "Briefversand per E-Mail eingebaut: Nutzer bekommen den fertigen Brief direkt ins Postfach, inklusive Anschrift und Anleitung zum Ausdrucken.",
      "Spracheingabe integriert: Anliegen einsprechen statt tippen, die Transkription läuft über das europäische Modell Mistral Voxtral.",
      "Firefox-Kompatibilität gefixt: Das Hero-Video auf der Startseite lief in Firefox nicht, jetzt schon.",
      "Mistral-API mit automatischem Retry bei kurzfristigen Serverfehlern abgesichert, damit kein Brief stillschweigend verloren geht.",
      "E-Mail-Footer verfeinert: klarerer Hinweis auf den handschriftlichen Charakter und warum das zählt.",
      "Datenschutz-Grundlage gelegt: keine Datenbank, kein Account, keine persistente Speicherung von Briefen.",
    ],
  },
  {
    key: "maerz-2026",
    badge: "März 2026",
    note: "Der erste Brief verlässt den Briefkasten",
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

/** Luftpost-Faden: dünne, gestrichelte vertikale Linie in Rot/Blau. */
function timelineStripe() {
  return {
    background: `repeating-linear-gradient(
      to bottom,
      var(--color-airmail-rot) 0px,
      var(--color-airmail-rot) 6px,
      transparent 6px,
      transparent 12px,
      var(--color-airmail-blau) 12px,
      var(--color-airmail-blau) 18px,
      transparent 18px,
      transparent 24px
    )`,
  };
}

export default async function WasBisherGeschahPage() {
  const letterCount = await getLetterCount();
  const updateCount = monate.reduce((n, m) => n + m.entries.length, 0);

  const stats = [
    letterCount > 0
      ? { value: `${letterCount}`, label: "Briefe entstanden" }
      : null,
    { value: "3", label: "Monate offen gebaut" },
    { value: `${updateCount}`, label: "Verbesserungen dokumentiert" },
  ].filter(Boolean) as { value: string; label: string }[];

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

        {/* Trust-Statistik: belegt, dass hinter den Bewertungen echte Arbeit steckt */}
        <div className="mb-10 flex flex-wrap items-stretch gap-y-4 border-y border-waldgruen/15 py-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 min-w-[8rem] px-4 sm:px-6 ${
                i > 0 ? "border-l border-waldgruen/15" : ""
              }`}
            >
              <p className="font-typewriter text-3xl md:text-4xl font-bold text-waldgruen-dark leading-none tabular-nums">
                {stat.value}
                <span className="text-airmail-rot">+</span>
              </p>
              <p className="font-body text-xs sm:text-sm text-warmgrau/80 mt-2 leading-snug">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Roadmap-Verweis: das hier ist Vergangenheit, dort steht die Zukunft */}
        <Link
          href="/was-noch-kommt"
          className="group mb-16 flex items-center justify-between gap-4 rounded-2xl border border-waldgruen/15 bg-white/60 px-5 py-4 transition-colors hover:border-waldgruen hover:bg-white"
        >
          <span className="font-body text-sm text-waldgruen-dark leading-snug">
            <span className="font-bold">Was als Nächstes kommt</span> steht in
            der Roadmap: die nächsten politischen Ebenen.
          </span>
          <span className="font-typewriter text-sm font-bold text-waldgruen whitespace-nowrap transition-transform group-hover:translate-x-1">
            Fahrplan &rarr;
          </span>
        </Link>

        {/* Timeline */}
        <div className="relative">
          {/* Luftpost-Faden */}
          <div
            className="absolute left-[11px] top-2 bottom-2 w-[3px] rounded-full opacity-40"
            style={timelineStripe()}
            aria-hidden="true"
          />

          <div className="space-y-12">
            {monate.map((monat, mi) => (
              <section
                key={monat.key}
                className="animate-log-rise relative pl-12"
                style={{ animationDelay: `${mi * 120}ms` }}
                aria-labelledby={`monat-${monat.key}`}
              >
                {/* Poststempel-Marker auf dem Faden */}
                <div className="absolute left-0 top-0.5" aria-hidden="true">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed shadow-sm ${
                      mi === 0
                        ? "border-airmail-rot bg-airmail-rot"
                        : "border-airmail-rot/50 bg-creme"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        mi === 0 ? "bg-creme" : "bg-airmail-rot/60"
                      }`}
                    />
                  </span>
                </div>

                <header className="mb-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2
                      id={`monat-${monat.key}`}
                      className="font-typewriter text-lg font-bold uppercase tracking-widest text-waldgruen-dark"
                    >
                      {monat.badge}
                    </h2>
                    {mi === 0 && (
                      <span className="font-typewriter text-[0.65rem] font-bold uppercase tracking-widest text-airmail-rot border border-airmail-rot/40 rounded-full px-2 py-0.5">
                        Zuletzt
                      </span>
                    )}
                  </div>
                  <p className="font-handwriting text-lg text-warmgrau/90 leading-snug mt-1">
                    {monat.note}
                  </p>
                </header>

                <ul className="space-y-2.5">
                  {monat.entries.map((entry, i) => (
                    <li
                      key={i}
                      className="font-body text-base text-warmgrau leading-relaxed flex gap-3"
                    >
                      <span
                        className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-waldgruen/40"
                        aria-hidden="true"
                      />
                      <span>{entry}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {/* Startpunkt der Reise */}
            <div className="relative pl-12">
              <div className="absolute left-[5px] top-1" aria-hidden="true">
                <span className="block h-3 w-3 rounded-full bg-waldgruen/30" />
              </div>
              <p className="font-handwriting text-lg text-warmgrau/70 leading-snug">
                Hier fing alles an, mit einem Telefonat mit meiner Mutter.
              </p>
              <Link
                href="/warum"
                className="group mt-1 inline-flex items-center gap-1 font-typewriter text-sm font-bold text-waldgruen hover:text-waldgruen-dark transition-colors"
              >
                Warum es das gibt
                <span className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 p-8 border-2 border-waldgruen/20 bg-creme/50 rounded-sm">
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

        {/* Für Verirrte: die Kurz-Domain */}
        <p className="mt-12 text-center font-typewriter text-xs text-warmgrau/50 leading-relaxed">
          Über briefnachberlin.de hergefunden? Beide Adressen führen hierher,
          offiziell ist brief-nach-berlin.de.
        </p>
      </div>
    </div>
  );
}
