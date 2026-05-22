import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { RoadmapSignupForm } from "./RoadmapSignupForm";

const URL_PATH = "/was-noch-kommt";
const PUBLISHED = "2026-05-22";
const TITLE =
  "Roadmap: Welche politischen Ebenen kommen als nächstes | Brief nach Berlin";
const DESCRIPTION =
  "Was kommt nach dem Bundestag? Landtag im Juni 2026, danach Kommune und EU. Der Fahrplan von Brief nach Berlin, und wie du die Reihenfolge mitbestimmst.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: "Roadmap: Welche politischen Ebenen kommen als nächstes",
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Roadmap: Welche politischen Ebenen kommen als nächstes",
    description: DESCRIPTION,
  },
};

type LevelStatus = "live" | "in-arbeit" | "im-juni-2026" | "geplant";

interface Level {
  key: "bund" | "land" | "kommune" | "eu";
  name: string;
  badge: string;
  status: LevelStatus;
  body: string;
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
    badge: "Im Juni 2026",
    status: "im-juni-2026",
    body: "Schule, Polizei, Hochschulen, Wohnungspolitik: das gehört in den Landtag, nicht nach Berlin. Wir starten mit den vier bevölkerungsreichsten Bundesländern (NRW, Bayern, Baden-Württemberg, Niedersachsen) und ergänzen die anderen 12 nach und nach. Wenn dein Land noch nicht dabei ist, bekommst du erstmal weiterhin deine Bundestagsabgeordneten als pragmatischen Zwischenschritt.",
  },
  {
    key: "kommune",
    name: "Kommune",
    badge: "In Arbeit",
    status: "in-arbeit",
    body: "Spielplatz, Kita, Radweg, Bauantrag: hier hilft kein Brief nach Berlin, hier hilft das Rathaus. Wir arbeiten an einem Verweis-Modus, der dich direkt zur richtigen Gemeindeverwaltung leitet, mit der offiziellen Adresse deiner Stadt oder Gemeinde. Eigene Bürgermeister-Daten kommen später.",
  },
  {
    key: "eu",
    name: "EU",
    badge: "Geplant",
    status: "geplant",
    body: "Datenschutz, Klimaziele, Lieferketten, Agrarpolitik: vieles davon wird in Brüssel entschieden, nicht in Berlin. Die Erweiterung auf Europaabgeordnete steht auf der Roadmap, hat aber noch kein festes Datum. Wenn die EU-Ebene für dich wichtig ist, sag uns Bescheid über die Feedback-Seite.",
  },
];

function badgeClasses(status: LevelStatus): string {
  switch (status) {
    case "live":
      return "bg-waldgruen text-creme";
    case "im-juni-2026":
      return "bg-airmail-rot text-creme";
    case "in-arbeit":
      return "bg-waldgruen/15 text-waldgruen-dark";
    case "geplant":
      return "bg-warmgrau/15 text-warmgrau";
  }
}

const faqs = [
  {
    q: "Welche politischen Ebenen werden aktuell unterstützt?",
    a: "Aktuell schreibst du mit Brief nach Berlin an Bundestagsabgeordnete. Die Landtag-Ebene startet im Juni 2026 mit vier Bundesländern. Kommune folgt als Verweis-Modus zur Gemeindeverwaltung, EU steht weiter hinten auf der Roadmap ohne festes Datum.",
  },
  {
    q: "Wann kommt die Landtag-Ebene?",
    a: "Voraussichtlich im Juni 2026, beginnend mit Nordrhein-Westfalen, Bayern, Baden-Württemberg und Niedersachsen. Damit sind rund die Hälfte aller Einwohnerinnen und Einwohner abgedeckt. Die übrigen 12 Bundesländer ergänzen wir in den Monaten danach.",
  },
  {
    q: "Warum nicht alle Ebenen auf einmal?",
    a: "Jede Ebene hat eigene Datenquellen, eigene Adressformeln und eigene Zuständigkeitslogik. Wenn wir alles auf einmal gebaut hätten, wäre nichts davon belastbar. So testen wir Ebene für Ebene mit echten Nutzerinnen und Nutzern und ziehen Lehren in die nächste mit.",
  },
  {
    q: "Kann ich vorschlagen, welche Ebene als nächstes kommt?",
    a: "Ja. Die Reihenfolge richtet sich nach zwei Dingen: wie oft eine Ebene im Feedback genannt wird, und wie schnell wir an saubere Daten kommen. Wenn du eine bestimmte Ebene priorisieren willst, sag es uns über die Feedback-Seite, das fließt direkt in unsere Reihenfolge ein.",
  },
  {
    q: "Was passiert mit meiner Anmeldung?",
    a: "Wir speichern nur deine Email und die Ebene, die du angekreuzt hast. Du bekommst eine einzige Mail, wenn die Ebene live geht. Danach werden deine Daten gelöscht. Kein Newsletter, keine Weitergabe an Dritte, kein Tracking.",
  },
  {
    q: "Werden auch Bundesländer-spezifische Besonderheiten berücksichtigt?",
    a: "Ja. Jeder Landtag hat eigene Wahlkreis-Strukturen (Stimmkreise in Bayern, Landtagswahlkreise in NRW), eigene Anreden und eigene Adressformeln. Stadtstaaten wie Berlin, Hamburg und Bremen behandeln wir gesondert, weil dort Land und Kommune verfassungsrechtlich verschmelzen.",
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
  headline: "Roadmap: Welche politischen Ebenen kommen als nächstes",
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
          Roadmap
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Was noch kommt
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
          Wir bauen offen. Das hier ist der Fahrplan, und dein Feedback formt
          die Reihenfolge mit.
        </p>

        {/* GEO Answer Block */}
        <div className="mb-14 border-l-4 border-waldgruen pl-6 py-2">
          <p className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 mb-3">
            Welche Ebenen kann ich anschreiben?
          </p>
          <p className="font-body text-base md:text-lg text-waldgruen-dark leading-relaxed">
            Heute schreibst du an deine Bundestagsabgeordneten. Im Juni 2026
            kommt die Landtag-Ebene dazu, beginnend mit vier Bundesländern.
            Danach folgt die Kommune als Verweis-Modus zur Gemeindeverwaltung.
            Die EU-Ebene ist geplant, hat aber noch kein Datum.
          </p>
        </div>

        {/* Die vier Ebenen */}
        <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4 mb-8">
          Die vier Ebenen
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

              {level.key === "land" ? (
                <div className="mt-6">
                  <p className="font-body text-sm font-semibold text-waldgruen-dark mb-3">
                    Sag mir Bescheid, wenn die Landtag-Ebene live geht.
                  </p>
                  <RoadmapSignupForm ebene="land" />
                </div>
              ) : null}
            </section>
          ))}
        </div>

        {/* Cross-Links */}
        <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4 mb-3">
          Schon jetzt mitgestalten
        </h2>
        <p className="font-body text-base text-warmgrau leading-relaxed mb-6">
          Du musst nicht warten, bis die nächste Ebene fertig ist. Drei Wege,
          das Projekt direkt zu beeinflussen:
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-16">
          <Link
            href="/feedback"
            className="block bg-white border border-waldgruen/15 hover:border-waldgruen rounded-2xl p-5 transition-colors"
          >
            <p className="font-body text-base font-bold text-waldgruen-dark mb-1">
              Feedback geben
            </p>
            <p className="font-body text-sm text-warmgrau leading-snug">
              Sag uns, welche Ebene du als nächstes brauchst.
            </p>
          </Link>
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
            href="/weitersagen"
            className="block bg-white border border-waldgruen/15 hover:border-waldgruen rounded-2xl p-5 transition-colors"
          >
            <p className="font-body text-base font-bold text-waldgruen-dark mb-1">
              Weitersagen
            </p>
            <p className="font-body text-sm text-warmgrau leading-snug">
              Je mehr Stimmen, desto schneller die nächste Ebene.
            </p>
          </Link>
        </div>

        <Prose>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Wie die Roadmap entsteht
          </h2>
          <p>
            Die Reihenfolge richtet sich nach zwei Größen. Erstens: wie oft
            eine Ebene im Nutzer-Feedback genannt wird. Wer Bildungspolitik
            adressieren will, braucht den Landtag. Wer einen Bauantrag oder
            Radweg betrifft, braucht die Kommune. Diese Nennungen zählen wir.
          </p>
          <p>
            Zweitens: die technische Komplexität der Datenquellen. Der
            Bundestag liefert seine Mandate über eine einzige, gut gepflegte
            Schnittstelle (abgeordnetenwatch.de). Auf Landesebene sind die
            Strukturen heterogener, jedes Bundesland hat eigene
            Wahlkreis-Logik. Auf Kommunalebene gibt es kein zentrales
            Register, sondern rund 11.000 Gemeinden mit unterschiedlichen
            Verwaltungsstrukturen. Deshalb gehen wir Ebene für Ebene, statt
            alles auf einmal zu versprechen.
          </p>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </Prose>

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
