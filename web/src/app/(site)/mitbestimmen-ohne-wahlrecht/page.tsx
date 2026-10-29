import type { Metadata } from "next";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { WahlalterLeiste } from "@/components/schule/WahlalterLeiste";
import { APP_URL } from "@/lib/config";

const URL_PATH = "/mitbestimmen-ohne-wahlrecht";
const CANONICAL_URL = `${APP_URL}${URL_PATH}`;
const PUBLISHED = "2026-10-27";
const TITLE = "Mitbestimmen ohne Wahlrecht: Brief an Politiker schreiben";
const DESCRIPTION =
  "Du darfst noch nicht wählen? Schreiben darfst du in jedem Alter. So bestimmst du als Jugendliche:r mit und schickst einen Brief an deine Abgeordneten.";

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: CANONICAL_URL,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const linkClass = "font-semibold text-waldgruen underline underline-offset-2 hover:text-waldgruen-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen";

const faqs = [
  {
    q: "Ab wann darf ich wählen?",
    a: "Den Bundestag wählst du ab 18. Bei der Europawahl darfst du ab 16 wählen. Landtagswahlen sind ab 16 in Baden-Württemberg, Brandenburg, Bremen, Hamburg, Mecklenburg-Vorpommern und Schleswig-Holstein möglich, in Nordrhein-Westfalen ab 2027. Bei Kommunalwahlen gilt in vielen Ländern 16. Stand Oktober 2026, die Regeln ändern sich, prüf sie für dein Bundesland.",
  },
  {
    q: "Darf ich mit 14 an Abgeordnete schreiben?",
    a: "Ja. Nach Artikel 17 des Grundgesetzes darf sich jeder Mensch schriftlich an die Volksvertretung wenden. Eine Altersgrenze gibt es nicht. Abgeordnete vertreten alle Menschen in ihrem Wahlkreis, auch die, die noch nicht wählen dürfen.",
  },
  {
    q: "Lesen Abgeordnete Briefe von Jugendlichen?",
    a: "Eine Garantie gibt es nicht. Ob ein Brief gelesen wird und ob du eine Antwort bekommst, hängt vom Büro ab. Ein handgeschriebener Brief mit einem eigenen Erlebnis fällt eher auf als eine Standardmail. Das ist meine Einschätzung, kein Beleg.",
  },
  {
    q: "Muss ich meine Eltern fragen?",
    a: "Für den Brief selbst brauchst du keine Erlaubnis. Das Tool braucht eine E-Mail-Adresse, an die ich dir den Entwurf schicke. Wie ich mit den Daten von Jugendlichen umgehe, steht in der Datenschutzerklärung im Abschnitt Jugendmodus.",
    aNode: (
      <>
        Für den Brief selbst brauchst du keine Erlaubnis. Das Tool braucht eine E-Mail-Adresse, an die ich dir den Entwurf schicke. Wie ich mit den Daten von Jugendlichen umgehe, steht in der Datenschutzerklärung im Abschnitt{" "}
        <Link href="/datenschutz#jugendmodus" className={linkClass}>
          Jugendmodus
        </Link>
        .
      </>
    ),
  },
  {
    q: "Kostet das etwas?",
    a: "Das Tool ist kostenlos und du brauchst keinen Account. Für den Brief brauchst du nur Papier, einen Umschlag und eine Briefmarke.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      author: { "@type": "Organization", name: "Brief-nach-Berlin" },
      publisher: { "@type": "Organization", name: "Brief-nach-Berlin", url: APP_URL },
      mainEntityOfPage: CANONICAL_URL,
      inLanguage: "de-DE",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const steps = [
  { title: "Anliegen aufschreiben", text: "Ein Thema und ein eigenes Erlebnis, das dauert zwei Minuten." },
  { title: "Entwurf bekommen", text: "Ich suche die zuständige Person in Bund, Land oder Gemeinde und schreibe dir einen Entwurf." },
  { title: "Von Hand abschreiben", text: "Mit einem eigenen Satz wird es dein Brief. Briefmarke drauf, ab zur Post." },
];

const h2Class = "font-typewriter text-2xl font-bold text-waldgruen-dark";
const pClass = "mt-4 font-body text-base leading-relaxed text-warmgrau";

export default function MitbestimmenOhneWahlrechtPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto w-full max-w-xl px-5 pb-16 pt-6 sm:pt-10">
        <h1 className="font-typewriter text-[2rem] font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-4xl">
          Mitbestimmen ohne Wahlrecht?
          <span className="mt-1 block origin-left -rotate-1 font-handwriting text-4xl font-normal text-waldgruen sm:text-5xl">
            Geht. Mit einem Brief.
          </span>
        </h1>
        <p className="mt-4 font-body text-base leading-relaxed text-warmgrau sm:text-lg">
          Den Bundestag wählst du ab 18, das Europaparlament ab 16. Landtagswahlen sind ab 16 in Baden-Württemberg, Brandenburg, Bremen, Hamburg, Mecklenburg-Vorpommern und Schleswig-Holstein möglich, in NRW ab 2027. Kommunalwahlen in vielen Ländern ab 16. Schreiben darfst du in jedem Alter (Artikel 17 Grundgesetz). Stand Oktober 2026.
        </p>

        <WahlalterLeiste />

        <section aria-labelledby="mow-auffallen" className="mt-12">
          <h2 id="mow-auffallen" className={h2Class}>Warum fällt der Brief einer 14-Jährigen auf?</h2>
          <p className={pClass}>
            Die meisten Briefe an Abgeordnete schreiben Erwachsene. Ein Brief von einer 14-Jährigen oder einem 16-Jährigen ist deshalb die Ausnahme. Das ist eine Beobachtung, kein Versprechen: Wie ein Büro darauf reagiert, kann ich nicht vorhersagen.
          </p>
          <p className={pClass}>
            Abgeordnete vertreten alle Menschen in ihrem Wahlkreis, auch dich. Entscheidungen über Schule, Ausbildung und Klima betreffen dich oft länger als die, die darüber abstimmen.
          </p>
        </section>

        <section aria-labelledby="mow-wie" className="mt-12">
          <h2 id="mow-wie" className={h2Class}>Wie kann ich als Jugendliche:r Politik mitbestimmen?</h2>
          <p className={pClass}>
            Mit einem Brief an die Person, die dein Thema entscheiden kann. So geht es in{" "}
            <Link href="/jung" className={linkClass}>Brief-nach-Berlin für Schüler:innen</Link>:
          </p>
          <ol className="mt-5 space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-waldgruen/40 font-typewriter text-sm font-bold text-waldgruen">
                  {index + 1}
                </span>
                <p className="font-body text-base leading-relaxed text-warmgrau">
                  <strong className="font-bold text-waldgruen-dark">{step.title}.</strong> {step.text}
                </p>
              </li>
            ))}
          </ol>
          <p className={pClass}>
            Wer für dein Thema zuständig ist, erklärt die Seite{" "}
            <Link href="/kommune-land-bund-eu" className={linkClass}>Kommune, Land, Bund, EU</Link>. Wer überhaupt schreiben darf, steht unter{" "}
            <Link href="/wer-darf-mdb-schreiben" className={linkClass}>Wer darf Abgeordnete anschreiben</Link>.
          </p>
        </section>

        <section aria-labelledby="mow-zusammen" className="mt-12">
          <h2 id="mow-zusammen" className={h2Class}>Was bringt es, gemeinsam zu schreiben?</h2>
          <p className={pClass}>
            Ein Brief ist ein Anfang. Schreiben mehrere aus deiner Klasse, aus der SV oder nach einer Schulversammlung zum selben Thema, sehen Abgeordnete: Das beschäftigt mehr als eine Person. Jede:r schreibt dabei den eigenen Brief mit dem eigenen Erlebnis.
          </p>
          <p className={pClass}>
            Lehrkräfte finden auf der Seite{" "}
            <Link href="/unterricht" className={linkClass}>Brief-nach-Berlin für Schulen</Link>{" "}
            einen Klassenlink und einen Ablauf für den Unterricht, mehr zum{" "}
            <Link href="/projekttag-demokratie" className={linkClass}>Projekttag Demokratie</Link>{" "}
            steht dort ebenfalls.
          </p>
        </section>

        <section aria-labelledby="mow-andere" className="mt-12">
          <h2 id="mow-andere" className={h2Class}>Welche anderen Wege gibt es noch?</h2>
          <p className={pClass}>
            Laut Shell Jugendstudie 2024 interessiert sich etwa die Hälfte der Jugendlichen für Politik. Mitmachen kannst du in der Schülervertretung, in einem Jugendparlament oder Jugendbeirat, wenn es das in deinem Ort gibt, oder auf einer Demonstration wie den Schulstreiks von Fridays for Future. Weitere Ideen stehen unter{" "}
            <Link href="/aktiv-werden" className={linkClass}>Aktiv werden</Link>. Warum kleine Schritte zählen, zeigt die{" "}
            <Link href="/treppe-der-selbstwirksamkeit" className={linkClass}>Treppe der Selbstwirksamkeit</Link>.
          </p>
        </section>

        <section aria-labelledby="mow-faq" className="mt-12">
          <h2 id="mow-faq" className="mb-4 font-typewriter text-2xl font-bold text-waldgruen-dark">Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </section>

        <section aria-labelledby="mow-cta" className="mt-12 rounded-xl bg-creme px-6 py-8 text-center">
          <h2 id="mow-cta" className="font-typewriter text-xl font-bold text-waldgruen-dark">Dein Thema, dein Brief</h2>
          <p className="mt-2 font-body text-base leading-relaxed text-warmgrau">
            Kostenlos, ohne Account, in wenigen Minuten.
          </p>
          <Link
            href="/jung"
            className="mt-5 inline-block rounded-lg bg-waldgruen px-8 py-3 font-body font-semibold text-creme transition-colors hover:bg-waldgruen-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen-dark"
          >
            Brief schreiben
          </Link>
        </section>
      </div>
    </>
  );
}
