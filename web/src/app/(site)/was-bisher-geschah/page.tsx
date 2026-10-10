import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL, FOUNDER_INSTAGRAM } from "@/lib/config";
import { getLetterCount } from "@/lib/counter";
import { formatNumber } from "@/lib/formatNumber";

const URL_PATH = "/was-bisher-geschah";
const PUBLISHED = "2026-05-28";
const TITLE = "Was bisher geschah: Der Fortschritt von Brief-nach-Berlin";
const DESCRIPTION =
  "Ein offenes Fortschritts-Log: was ich seit dem Start an Brief-nach-Berlin gebaut, verbessert und gelernt habe, und was ich als Nächstes vorhabe.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
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

interface Monat {
  key: string;
  badge: string;
  /** kurze Linie unter dem Stempel, was diesen Monat ausmachte */
  note: string;
  entries: string[];
}

interface Vorhaben {
  key: string;
  title: string;
  text: string;
  link?: { href: string; label: string; external?: boolean };
}

/** Ausblick: noch nicht abgestempelt, deshalb ohne Datum. */
const vorhaben: Vorhaben[] = [
  {
    key: "instagram",
    title: "Eine größere Instagram-Kampagne",
    text: "Viele wissen nicht, dass ein handgeschriebener Brief im Abgeordnetenbüro mehr auffällt als jede Mail. Auf Instagram zeige ich, wie schnell so ein Brief entsteht und was er bewirken kann.",
    link: { href: FOUNDER_INSTAGRAM, label: "Auf Instagram folgen", external: true },
  },
  {
    key: "kooperationen",
    title: "Mehr Kooperationen mit Kampagnen",
    text: "Ich suche Initiativen, Vereine und NGOs, die die Demokratie stärken wollen. Sie bringen ein Anliegen mit, Brief-nach-Berlin macht daraus viele persönliche Briefe an die zuständigen Abgeordneten.",
    link: { href: "/ngo-briefkampagne", label: "Infos für Initiativen" },
  },
  {
    key: "persoenlicher",
    title: "Kampagnenbriefe, die noch persönlicher klingen",
    text: "Bei Kampagnen soll jeder Brief einen eigenen Aufhänger bekommen, damit im Abgeordnetenbüro keine zwei Briefe gleich klingen.",
  },
];

const monate: Monat[] = [
  {
    key: "oktober-2026",
    badge: "Oktober 2026",
    note: "Kampagnen bekommen Überblick, Enddatum und Meilensteine",
    entries: [
      "Wer eine Kampagne startet, sieht jetzt, aus welchen Bundesländern die Briefe kommen, wie viele es pro Tag werden und wie sie bewertet wurden.",
      "Kampagnen können ein Enddatum bekommen. Danach zeigt die Seite einen Abschluss, und wer die Kampagne gestartet hat, bekommt eine Abschluss-Mail.",
      "Bei wichtigen Meilensteinen kommt eine kurze Mail mit Bild zum Teilen. Wer das nicht möchte, schaltet es beim Erstellen oder Verwalten ab.",
      "Unten auf jeder Kampagnenseite gibt es jetzt „Stimmt was nicht?“, um Fehler oder Probleme direkt an mich zu melden.",
      "Die Seite für Vereine und NGOs zeigt alle laufenden Kampagnen, und eine neue Seite erklärt, wie du eine Petition startest und sie mit einem persönlichen Brief stärker machst.",
      "Die Karte auf der Startseite zeigt jetzt, aus wie vielen Orten Menschen freiwillig einen Punkt gesetzt haben: über 1.200 Postleitzahlen, Stand Anfang Oktober.",
      "Neue Seite: So kommst du kostenlos nach Berlin und in den Bundestag.",
      "Die Daten der Landtage und Landesregierungen sind aktualisiert, unter anderem für Sachsen-Anhalt und Rheinland-Pfalz.",
    ],
  },
  {
    key: "september-2026",
    badge: "September 2026",
    note: "Schreib Merz, freiere Empfängerwahl und die erste Karte",
    entries: [
      "Neu: Schreib Merz. Du beschreibst dein Anliegen in eigenen Worten und bekommst einen Brief an den Bundeskanzler oder an deine Bundestagsabgeordneten.",
      "Du kannst freier wählen, an wen dein Brief geht, bei Landesthemen auch an die Regierungschefin oder den Regierungschef deines Landes.",
      "Wer möchte, setzt nach dem Brief einen anonymen Punkt auf eine Deutschlandkarte. Der Brieftext wird dabei nicht gespeichert.",
      "Der Versand ist robuster: Ein Brief kommt nicht mehr doppelt an, und Tippfehler in der E-Mail-Adresse fallen vorher auf.",
      "Kampagnen haben jetzt kurze Links, die sich leichter weitergeben lassen.",
    ],
  },
  {
    key: "august-2026",
    badge: "August 2026",
    note: "Bund, Land und Kommune als aktueller Kern",
    entries: [
      "Bund, Land und Kommune sind jetzt der stabile Produktkern: Anliegen werden auf die passende politische oder institutionelle Ebene geroutet.",
      "Landes- und Kommunalbriefe nutzen offizielle Adressen und eigene Anreden, statt Empfänger oder Zuständigkeit zu erraten.",
      "Die Erklärung zur Wirkung handschriftlicher Briefe wurde mit Forschung eingeordnet und trennt direkte Evidenz von plausiblen Übertragungen.",
      "Der Briefprozess prüft die maximale Länge des Anliegens jetzt bereits in der Oberfläche und zeigt verständliche Validierungsfehler.",
    ],
  },
  {
    key: "juli-2026",
    badge: "Juli 2026",
    note: "Kampagnenmodus live, Land und Kommune ausgebaut",
    entries: [
      "Kampagnenmodus gebaut: Creator können ein Anliegen mit Titel, Kurzlink, sichtbarem Absender, Beschreibung, optionalem Bild und externem Link anlegen.",
      "Kampagnen werden erst nach E-Mail-Bestätigung öffentlich und automatisch moderiert, damit keine problematischen Texte ungeprüft live gehen.",
      "Öffentliche Kampagnenseiten führen Menschen durch den normalen Briefprozess: PLZ, zuständige Bundestagsabgeordnete, persönlicher Entwurf statt Copy-Paste-Massenbrief.",
      "Für Kampagnen gibt es Verwaltungslinks zum Bearbeiten, Pausieren oder Archivieren sowie Teilen per Link und QR-Code.",
      "Land und Kommune sind dazugekommen: Die App kann Anliegen jetzt auf Bund, Land oder Kommune routen und führt, wo die Daten sauber genug sind, zur passenden offiziellen Adresse.",
    ],
  },
  {
    key: "juni-2026",
    badge: "Juni 2026",
    note: "Inline-Mic, neue Bundestag-Daten und viele Details verbessert",
    entries: [
      "Die Startseite zeigt jetzt die echte Anzahl verschickter Briefe in Echtzeit, direkt aus der Datenbank gezogen - kein statischer Platzhalter mehr.",
      "Mehr PLZ werden jetzt korrekt aufgelöst: Die Abgeordneten-Daten wurden erweitert, damit weniger Wahlkreise leer bleiben.",
      "Wer eine niedrige Bewertung gibt, sieht direkt einen Weg, den Brief zu verbessern - ohne neu anzufangen. Der Verbesserungs-Flow ist jetzt Teil der Bewertungsseite.",
      "Neues Feedback-Tag 'Fakten erfunden' hilft dabei, Briefe mit erfundenen Aussagen gezielt zu erkennen und das Modell daraufhin zu verbessern.",
      "PLZ-Eingabe zeigt jetzt sofort den zugehörigen Ort oder Ortsteil, als schnelle Bestätigung, dass die Postleitzahl stimmt.",
      "Mobile Navigation überarbeitet: Handy-Menü, scroll-sensitiver CTA und Bewertungs-Marquee auf dem Desktop für mehr Glaubwürdigkeit.",
      "Briefe wiederholen sich weniger: Der Prompt wurde überarbeitet, damit keine Formulierung doppelt auftaucht.",
      "Das Mikrofon sitzt jetzt direkt im Textfeld, ohne separaten Button. Diktat lässt sich beliebig oft wiederholen, und die Aufnahme stoppt automatisch sauber nach drei Minuten.",
      "Alle Abgeordneten-Daten wurden auf den 21. Bundestag aktualisiert, inklusive Ausschuss-Mitgliedschaften. Damit landet dein Brief beim richtigen Ansprechpartner der neuen Legislaturperiode.",
      "Neue Unterseite erklärt, wohin der Brief eigentlich gehört: ins Wahlkreisbüro oder nach Berlin? Die Antwort hängt vom Thema ab, jetzt gibt es eine kurze Erklärung dazu.",
      "Die Fehlerseite bei unbekannter PLZ führt jetzt direkt zurück zum Feld, damit du die Postleitzahl sofort korrigieren kannst, ohne umständlichen Neustart.",
      "Feedback-Option umbenannt: 'Klingt nicht nach mir' heißt jetzt 'Klingt zu sehr nach KI', das trifft den eigentlichen Grund präziser.",
      "Sterne-Anzeige auf der Bewertungsseite war bei halben Sternen (z.B. 4,5) kaputt. Das ist behoben, alle Bewertungen werden jetzt korrekt dargestellt.",
      "Die Seite nach dem Briefversand ist aufgeräumter: Ein überflüssiges Element wurde entfernt, damit Bewertung und nächste Schritte sofort ins Auge fallen.",
    ],
  },
  {
    key: "mai-2026",
    badge: "Mai 2026",
    note: "Stimmen, Roadmap und spürbar bessere Briefe",
    entries: [
      "Bewertungen von echten Nutzern gesammelt und auf der Seite /stimmen veröffentlicht, mit Filter und Swipe-Funktion auf dem Handy.",
      "Die Seite /was-noch-kommt erklärt den aktuellen Ebenen-Stand und welche Zuständigkeit hinter Bund, Land und Kommune steckt.",
      "E-Mail nach dem Briefversand überarbeitet: Footer mit direktem Link zur Abgeordneten-Seite, Sterne-Bewertung direkt in der Mail.",
      "Briefvorschau und Verbesserungs-Vorschläge auf Mobilgeräten benutzerfreundlicher gemacht.",
      "Postleitzahlen in Stadtstaaten wie Berlin, Hamburg und Bremen genauer aufgelöst, damit der Brief beim richtigen Wahlkreis landet.",
      "Auswahl der Abgeordneten klarer gemacht: Bei mehreren Wahlkreisen werden die Politiker nach Wahlkreis gruppiert und als Direktmandat oder Landesliste gekennzeichnet, und du kannst die Postleitzahl mit einem Klick korrigieren.",
      "Wechsel von 'wir' auf 'ich' auf der Startseite und allen Unterseiten, weil Brief-nach-Berlin ein Solo-Projekt ist.",
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
      "Datenschutz-Grundlage gelegt: kein Account, und dein Brieftext wird nicht gespeichert.",
    ],
  },
  {
    key: "maerz-2026",
    badge: "März 2026",
    note: "Der erste Brief verlässt den Briefkasten",
    entries: [
      "Brief-nach-Berlin gestartet: Aus einer Postleitzahl und ein paar Sätzen Frust wird ein fertig adressierter Briefentwurf an den zuständigen Bundestagsabgeordneten.",
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
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: "2026-10-10",
  author: { "@type": "Organization", name: "Brief-nach-Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief-nach-Berlin",
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

/** Luftpost-Kante für die Ausblick-Umschläge. */
function airmailEdge() {
  return {
    background: `repeating-linear-gradient(
      -45deg,
      var(--color-airmail-rot) 0 7px,
      var(--color-creme) 7px 10px,
      var(--color-airmail-blau) 10px 17px,
      var(--color-creme) 17px 20px
    )`,
  };
}

export default async function WasBisherGeschahPage() {
  const letterCount = await getLetterCount();
  const updateCount = monate.reduce((n, m) => n + m.entries.length, 0);

  const stats = [
    letterCount > 0
      ? { value: formatNumber(letterCount), label: "Briefe entstanden" }
      : null,
    { value: formatNumber(monate.length), label: "Monate offen gebaut" },
    { value: formatNumber(updateCount), label: "Verbesserungen dokumentiert" },
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
          gelernt habe, Monat für Monat, und was als Nächstes kommt.
        </p>

        <figure className="mb-12 -mx-2 sm:mx-0">
          <Image
            src="/images/img-was-bisher-geschah.webp"
            alt="Offenes Tagebuch mit handgeschriebenen Seiten auf einem Holztisch, dahinter das Berliner Panorama mit dem Reichstag im Morgenlicht."
            width={1376}
            height={700}
            sizes="(min-width: 768px) 42rem, 100vw"
            className="w-full h-auto rounded-2xl shadow-sm"
            priority
          />
        </figure>

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

        {/* Verweis auf den aktuellen Ebenen-Stand */}
        <Link
          href="/was-noch-kommt"
          className="group mb-14 flex items-center justify-between gap-4 rounded-2xl border border-waldgruen/15 bg-white/60 px-5 py-4 transition-colors hover:border-waldgruen hover:bg-white"
        >
          <span className="font-body text-sm text-waldgruen-dark leading-snug">
            <span className="font-bold">Welche Ebenen heute funktionieren:</span>{" "}
            Bund, Land und Kommune, mit ihren Zuständigkeiten und Grenzen.
          </span>
          <span className="font-typewriter text-sm font-bold text-waldgruen whitespace-nowrap transition-transform group-hover:translate-x-1">
            Ebenen ansehen &rarr;
          </span>
        </Link>

        {/* Ausblick: Briefmarken, die noch nicht abgestempelt sind */}
        <section
          id="als-naechstes"
          className="relative mb-12 scroll-mt-24 pl-12"
          aria-labelledby="als-naechstes-titel"
        >
          {/* Noch nicht gereister Faden bis zum ersten Poststempel */}
          <div
            className="absolute left-[11px] top-3 -bottom-12 border-l-[3px] border-dotted border-airmail-blau/30"
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0.5" aria-hidden="true">
            <span className="block h-6 w-6 rounded-[3px] border-2 border-dashed border-airmail-blau/60 bg-creme" />
          </div>

          <header className="mb-5">
            <h2
              id="als-naechstes-titel"
              className="font-typewriter text-lg font-bold uppercase tracking-widest text-airmail-blau"
            >
              Als Nächstes
            </h2>
            <p className="font-handwriting text-lg text-warmgrau/90 leading-snug mt-1">
              Noch nicht abgestempelt, aber schon unterwegs
            </p>
          </header>

          <ul className="space-y-4">
            {vorhaben.map((v) => (
              <li
                key={v.key}
                className="relative overflow-hidden rounded-xl border border-airmail-blau/15 bg-white/70 py-4 pl-6 pr-4 sm:pr-24"
              >
                <span
                  className="absolute inset-y-0 left-0 w-1.5"
                  style={airmailEdge()}
                  aria-hidden="true"
                />
                {/* Leeres Markenfeld: kommt erst noch */}
                <span
                  className="absolute right-5 top-4 hidden h-14 w-11 rotate-3 rounded-[2px] border-2 border-dashed border-airmail-rot/30 sm:block"
                  aria-hidden="true"
                />
                <h3 className="font-body text-base md:text-lg font-bold text-waldgruen-dark leading-snug">
                  {v.title}
                </h3>
                <p className="font-body text-base text-warmgrau leading-relaxed mt-1.5">
                  {v.text}
                </p>
                {v.link &&
                  (v.link.external ? (
                    <a
                      href={v.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-2 inline-flex items-center gap-1 font-typewriter text-sm font-bold text-waldgruen hover:text-waldgruen-dark transition-colors"
                    >
                      {v.link.label}
                      <span className="transition-transform group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </a>
                  ) : (
                    <Link
                      href={v.link.href}
                      className="group mt-2 inline-flex items-center gap-1 font-typewriter text-sm font-bold text-waldgruen hover:text-waldgruen-dark transition-colors"
                    >
                      {v.link.label}
                      <span className="transition-transform group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </Link>
                  ))}
              </li>
            ))}
          </ul>
        </section>

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
            ein, und du bekommst einen Briefentwurf an die Stelle, die
            zuständig ist: im Bund, im Land oder in deiner Kommune.
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
