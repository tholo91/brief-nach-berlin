import type { Metadata } from "next";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { APP_URL, DEFAULT_OG_IMAGES } from "@/lib/config";
import { COLLECTIVE_ENVELOPE_NOTE } from "@/lib/schule/lessonPlan";
import { PROJEKTTAG_STEPS } from "@/lib/schule/projekttag";

const URL_PATH = "/projekttag-demokratie";
const CANONICAL_URL = `${APP_URL}${URL_PATH}`;
const PUBLISHED = "2026-10-27";
const TITLE = "Projekttag Demokratie: Die ganze Schule schreibt an die Politik";
const DESCRIPTION =
  "Projekttag Demokratie an der Schule: Jede Klasse schreibt echte Briefe an Abgeordnete, die Schule schickt Sammelumschläge. Mit Tagesplan und Antworten an der Wand.";

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: CANONICAL_URL,
    publishedTime: PUBLISHED,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const linkClass =
  "font-semibold text-waldgruen underline underline-offset-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen-dark";
const h2Class = "font-typewriter text-2xl font-bold text-waldgruen-dark";
const bodyClass = "font-body text-base leading-relaxed text-warmgrau";

const DATA_SUMMARY =
  "E-Mail-Adresse, Postleitzahl und das Anliegen werden für den Entwurf nur während der Verarbeitung verwendet und danach verworfen. Es gibt keine Accounts. Über den Klassenlink schreiben die Schüler:innen im Jugendmodus: nur eine Mail mit dem Entwurf, ohne Erinnerungen und ohne Spendenbitte. Der Klassenlink enthält keine Namen.";

const faqs = [
  {
    q: "Wie viele Klassen schaffen das an einem Tag?",
    a: "So viele, wie du zeitlich versetzt starten lässt. Jede Klasse braucht 45 Minuten, die Phase „Entwurf erstellen“ beginnt aber bei jeder Klasse etwa 15 Minuten nach der vorherigen. Eine feste Obergrenze gebe ich nicht an, denn sie hängt davon ab, wie viele Menschen gerade außerhalb deiner Schule schreiben. Plane lieber einen Puffer ein.",
  },
  {
    q: "Brauchen alle ein eigenes Gerät?",
    a: "Ein Handy oder ein geteiltes Tablet reicht. Der Entwurf erscheint direkt auf dem Bildschirm, den Rest schreiben die Schüler:innen von Hand auf Papier. Auf geteilten Geräten wird der Entwurf nach dem Absenden gelöscht. Jede:r braucht eine eigene E-Mail-Adresse, zum Beispiel die Schul-Mail, denn dorthin kommt die Kopie mit der Anschrift für den Umschlag.",
  },
  {
    q: "Ist das politisch neutral?",
    a: "Ja. Brief-nach-Berlin ist überparteilich. Die Schüler:innen wählen ihr Anliegen selbst, die Themenvorschläge sind nur Satzanfänge ohne Meinung, und der Entwurf wirbt für keine Partei. Das passt zum Beutelsbacher Konsens: niemand wird überwältigt, Kontroverses bleibt kontrovers.",
  },
  {
    q: "Welche Daten werden erfasst?",
    a: `${DATA_SUMMARY} Mehr steht in der Datenschutzerklärung und auf der Schule-Seite im Abschnitt für die Schulleitung.`,
    aNode: (
      <>
        {DATA_SUMMARY} Mehr steht im Abschnitt{" "}
        <Link href="/unterricht#schulleitung" className={linkClass}>
          Für die Schulleitung
        </Link>{" "}
        und in der{" "}
        <Link href="/datenschutz#jugendmodus" className={linkClass}>
          Datenschutzerklärung
        </Link>
        .
      </>
    ),
  },
  {
    q: "Was kostet das?",
    a: "Das Werkzeug ist kostenlos. Kosten entstehen nur für Papier und Porto. Günstiger als eine Marke pro Brief ist ein großer Umschlag pro Empfänger:in mit allen Briefen der Klasse, frankiert nach Gewicht.",
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
      inLanguage: "de-DE",
      url: CANONICAL_URL,
      mainEntityOfPage: CANONICAL_URL,
      author: { "@type": "Person", name: "Thomas Lorenz" },
      publisher: { "@id": `${APP_URL}/#organization` },
      isPartOf: { "@id": `${APP_URL}/#website` },
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

export default function ProjekttagDemokratiePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-6 sm:pt-10">
        <h1 className="font-typewriter text-[2rem] font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-4xl">
          Ein Projekttag Demokratie,
          <span className="mt-1 block origin-left -rotate-1 font-handwriting text-4xl font-normal text-waldgruen sm:text-5xl">
            den man abschicken kann.
          </span>
        </h1>
        <p className="mb-8 mt-4 font-body text-base leading-relaxed text-warmgrau sm:text-lg">
          Auf einem Projekttag, in einer Projektwoche oder nach der Schulversammlung schreibt jede Klasse echte Briefe an ihre Abgeordneten. Die Schule schickt sie in Sammelumschlägen los, die Antworten hängen später an der Wand. Ich stelle den Tagesplan und die Klassenlinks, kostenlos und ohne Accounts.
        </p>

        <section aria-labelledby="tag-plan" className="mt-12">
          <h2 id="tag-plan" className={h2Class}>Wie sieht der Tag aus?</h2>
          <p className={`${bodyClass} mt-3`}>
            Fünf Stationen, von der Vorbereitung bis zur Antwort.
          </p>
          <div
            aria-hidden="true"
            className="mt-6 h-2 rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-airmail-rot)_0_12px,var(--color-creme)_12px_20px,var(--color-airmail-blau)_20px_32px,var(--color-creme)_32px_40px)]"
          />
          <ol className="mt-6 border-l-2 border-dashed border-waldgruen/40">
            {PROJEKTTAG_STEPS.map((step, i) => (
              <li key={step.title} className="relative pb-8 pl-8 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-airmail-blau bg-creme font-typewriter text-sm font-bold text-airmail-blau"
                >
                  {i + 1}
                </span>
                <h3 className="font-typewriter text-lg font-bold leading-snug text-waldgruen-dark">
                  {step.title}
                </h3>
                <p className="mt-0.5 font-handwriting text-xl leading-tight text-airmail-rot">
                  {step.duration}
                </p>
                <p className={`${bodyClass} mt-2`}>{step.what}</p>
              </li>
            ))}
          </ol>
          <p className={`${bodyClass} mt-8`}>
            Warum versetzt? Den Entwurf schreibt eine KI von Mistral, und die schafft pro Minute nur eine begrenzte Zahl Anfragen. Die teile ich mit allen, die gerade auf der Seite schreiben. Wenn zwölf Klassen im selben Moment klicken, warten alle länger oder bekommen eine Fehlermeldung. Mit 15 Minuten Abstand läuft es für jede Klasse flüssig.
          </p>
          <p className={`${bodyClass} mt-3`}>{COLLECTIVE_ENVELOPE_NOTE}</p>
          <p className={`${bodyClass} mt-3`}>
            Den Ablauf der einzelnen Stunde findest du auf der{" "}
            <Link href="/unterricht" className={linkClass}>Seite für den Unterricht</Link>, zum Ausdrucken gibt es{" "}
            <Link href="/unterricht/ablauf" className={linkClass}>Ablauf, Arbeitsblatt und Tafelbild</Link>.
          </p>
        </section>

        <section aria-labelledby="tag-politik" className="mt-14">
          <h2 id="tag-politik" className={h2Class}>Wie bringe ich Politik an meine Schule?</h2>
          <p className={`${bodyClass} mt-3`}>
            Du musst keinen Besuch organisieren, bevor es losgeht. Ein Brief erreicht jede:n Abgeordnete:n auch ohne Termin. Kommt eine Antwort, ist das ein guter Anlass, die Person in die Schule zu bitten. So wird aus dem Projekttag ein Anfang und kein Einzeltermin.
          </p>
        </section>

        <section aria-labelledby="tag-lehrplan" className="mt-14">
          <h2 id="tag-lehrplan" className={h2Class}>Passt das zum Lehrplan?</h2>
          <p className={`${bodyClass} mt-3`}>
            Der KMK-Beschluss zur Demokratiebildung (überarbeitet am 11.10.2018) beschreibt Demokratiebildung als Aufgabe aller Fächer und die Schule als Ort gelebter Demokratie. Ein Projekttag mit allen Klassen passt dazu. Welche Themen in welcher Klassenstufe vorgesehen sind, steht im Lehrplan deines Bundeslandes. Prüfe das bitte gegen den Lehrplan deines Bundeslandes.
          </p>
          <p className={`${bodyClass} mt-3`}>
            Die Schüler:innen wählen ihr Thema selbst, das Werkzeug ist überparteilich. Das entspricht dem Beutelsbacher Konsens.
          </p>
          <p className={`${bodyClass} mt-3`}>
            Der Tag lässt sich gut mit Angeboten kombinieren, die es schon gibt: Die Juniorwahl simuliert eine Wahl, Jugend debattiert übt das Argumentieren, und das HanisauLand-Arbeitsblatt „Schreib deiner/m Abgeordneten!“ der bpb führt Klasse 5 bis 7 an den Brief heran. Der Brief an eine echte Person ist ein weiterer Baustein daneben.
          </p>
        </section>

        <section aria-labelledby="tag-jung" className="mt-14">
          <h2 id="tag-jung" className={h2Class}>Warum Stimmen von Jugendlichen?</h2>
          <p className={`${bodyClass} mt-3`}>
            Bei der Bundestagswahl wählt man ab 18. Landtage wählen Jugendliche ab 16 in Baden-Württemberg, Brandenburg, Bremen, Hamburg, Mecklenburg-Vorpommern und Schleswig-Holstein, Nordrhein-Westfalen folgt mit der Landtagswahl 2027 (Stand Oktober 2026). Die meisten Schüler:innen deiner Schule dürfen also noch nicht wählen. Briefe von Jugendlichen sind in Abgeordnetenbüros eher die Ausnahme, das ist meine Beobachtung, keine Statistik. Ob ein Brief etwas ändert, kann ich nicht versprechen. Sicher ist: Die Schüler:innen erleben, dass man sich an eine konkrete Person wenden kann.
          </p>
          <p className={`${bodyClass} mt-3`}>
            Die Perspektive der Jugendlichen selbst steht auf{" "}
            <Link href="/mitbestimmen-ohne-wahlrecht" className={linkClass}>
              Mitbestimmen ohne Wahlrecht
            </Link>
            , Hintergründe zur Handschrift unter{" "}
            <Link href="/handschriftliche-briefe-wirkung" className={linkClass}>
              Studien zu handschriftlichen Briefen
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="tag-faq" className="mt-14">
          <h2 id="tag-faq" className={`${h2Class} mb-4`}>Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </section>

        <section aria-labelledby="tag-cta" className="mt-14 rounded-sm border-2 border-dashed border-waldgruen/40 bg-creme p-6 text-center">
          <h2 id="tag-cta" className="font-typewriter text-xl font-bold text-waldgruen-dark">
            Bereit für den Projekttag?
          </h2>
          <p className={`${bodyClass} mt-2`}>Ein Klassenlink pro Klasse, in einer Minute erstellt.</p>
          <Link
            href="/unterricht"
            className="mt-4 inline-block rounded-sm bg-waldgruen px-6 py-3 font-body text-base font-bold text-white hover:bg-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen-dark"
          >
            Klassenlinks erstellen
          </Link>
        </section>
      </div>
    </>
  );
}
