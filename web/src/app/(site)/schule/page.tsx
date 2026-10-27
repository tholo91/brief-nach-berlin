import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Figure } from "@/components/editorial/Figure";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ClassLinkGenerator } from "@/components/schule/ClassLinkGenerator";
import { APP_URL } from "@/lib/config";
import {
  COLLECTIVE_ENVELOPE_NOTE,
  LESSON_45,
  LESSON_90_EXTRAS,
  PRECHECK_ITEMS,
  formatMinuteRange,
} from "@/lib/schule/lessonPlan";

const URL_PATH = "/schule";
const CANONICAL_URL = `${APP_URL}${URL_PATH}`;
const TITLE = "Briefe an Abgeordnete im Unterricht";
const DESCRIPTION =
  "Unterrichtsidee für Klasse 8 bis 10: In 45 Minuten schreiben Schüler:innen echte Briefe an Abgeordnete. Mit Klassenlink, QR-Code, Ablauf und Arbeitsblatt.";

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "de_DE",
    url: CANONICAL_URL,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const linkClass = "font-semibold text-waldgruen underline underline-offset-2";
const h2Class = "font-typewriter text-2xl font-bold text-waldgruen-dark";
const bodyClass = "font-body text-base leading-relaxed text-warmgrau";

const DATA_SUMMARY =
  "E-Mail-Adresse, Postleitzahl und das Anliegen werden für den Entwurf nur während der Verarbeitung verwendet und danach verworfen. Es gibt keine Accounts. Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich.";

const faqs = [
  {
    q: "Ist das politisch neutral?",
    a: "Ja. Brief-nach-Berlin ist überparteilich. Die Schüler:innen wählen ihr Anliegen selbst, die Themen sind nur Satzanfänge ohne Meinung, und der Entwurf wirbt für keine Partei. Das passt zum Beutelsbacher Konsens: niemand wird überwältigt, Kontroverses bleibt kontrovers, und jede:r vertritt das eigene Anliegen.",
  },
  {
    q: "Welche Daten werden erfasst?",
    a: `${DATA_SUMMARY} Mehr steht in der Datenschutzerklärung.`,
    aNode: (
      <>
        {DATA_SUMMARY} Mehr steht in der{" "}
        <Link href="/datenschutz" className={linkClass}>
          Datenschutzerklärung
        </Link>
        .
      </>
    ),
  },
  {
    q: "Was ist, wenn die KI etwas Falsches schreibt?",
    a: "Das kann passieren. Der Entwurf ist nur ein Anfang: Die Schüler:innen lesen ihn, streichen, was nicht stimmt, und ergänzen ein eigenes Erlebnis. Eine gute Übung für die Stunde: Fehler im Entwurf gemeinsam suchen.",
  },
  {
    q: "Was kostet das Porto?",
    a: "Jeder Brief braucht eine Briefmarke für einen Standardbrief. Günstiger ist ein großer Umschlag pro Empfänger:in mit allen Briefen der Klasse, frankiert nach Gewicht.",
  },
  {
    q: "Brauchen die Schüler:innen einen Account?",
    a: "Nein. Sie scannen den QR-Code, schreiben ihr Anliegen, geben ihre E-Mail-Adresse an und sehen den Entwurf direkt auf dem Gerät. Eine Kopie kommt per Mail.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: TITLE,
      description: DESCRIPTION,
      url: CANONICAL_URL,
      inLanguage: "de-DE",
      isPartOf: { "@id": `${APP_URL}/#website` },
      publisher: { "@id": `${APP_URL}/#organization` },
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

export default function SchulePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-6 sm:pt-10">
        <h1 className="font-typewriter text-[2rem] font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-4xl">
          Deine Klasse schreibt
          <span className="mt-1 block origin-left -rotate-1 font-handwriting text-4xl font-normal text-waldgruen sm:text-5xl">
            an die Politik.
          </span>
        </h1>
        <p className="mb-8 mt-4 font-body text-base leading-relaxed text-warmgrau sm:text-lg">
          In einer Schulstunde schreiben deine Schüler:innen echte Briefe an Abgeordnete. Sie wählen ihr Anliegen selbst, Brief-nach-Berlin findet die zuständige Ebene und schlägt einen Entwurf vor. Den schreiben sie von Hand ab und ergänzen ihn mit eigenen Worten. Kostenlos, ohne Accounts, mit einem Klassenlink per QR-Code.
        </p>

        <Image
          src="/images/img-schule-klasse.webp"
          alt="Eine Schulklasse schreibt an Holztischen Briefe von Hand, die Lehrerin geht durch die Reihen, im Fenster die Reichstagskuppel, gemalte Illustration"
          width={1200}
          height={670}
          sizes="(max-width: 672px) 100vw, 672px"
          priority
          className="mb-10 h-auto w-full rounded-xl shadow-md shadow-waldgruen/10"
        />

        <ClassLinkGenerator />

        <section aria-labelledby="schule-warum" className="mt-14">
          <h2 id="schule-warum" className={h2Class}>Warum Jugendliche schreiben sollten</h2>
          <p className={`${bodyClass} mt-3`}>
            Zum Bundestag wählt man ab 18, viele Schüler:innen dürfen also noch nicht mitentscheiden. Schreiben dürfen sie trotzdem, und Abgeordnete vertreten auch sie. Die Kultusministerkonferenz hat am 11.10.2018 beschlossen, dass Demokratiebildung Aufgabe aller Fächer ist. Ein echter Brief ist dafür eine Übung mit Ernstfall.
          </p>
        </section>

        <section aria-labelledby="schule-pruefen" className="mt-14">
          <h2 id="schule-pruefen" className={h2Class}>Vorher kurz prüfen</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-waldgruen">
            {PRECHECK_ITEMS.map((item) => (
              <li key={item} className={bodyClass}>{item}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="schule-45" className="mt-14">
          <h2 id="schule-45" className={h2Class}>Ablauf in 45 Minuten</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left font-body text-sm leading-relaxed text-warmgrau sm:text-base">
              <caption className="sr-only">Ablauf der Unterrichtsstunde in 45 Minuten</caption>
              <thead>
                <tr className="border-b-2 border-waldgruen/30 text-waldgruen-dark">
                  <th scope="col" className="py-2 pr-3 font-bold">Zeit</th>
                  <th scope="col" className="py-2 pr-3 font-bold">Phase</th>
                  <th scope="col" className="py-2 font-bold">Was passiert</th>
                </tr>
              </thead>
              <tbody>
                {LESSON_45.map((row) => (
                  <tr key={row.phase} className="border-b border-waldgruen/15 align-top">
                    <td className="whitespace-nowrap py-3 pr-3 font-semibold">{formatMinuteRange(row)}</td>
                    <th scope="row" className="py-3 pr-3 font-semibold text-waldgruen-dark">{row.phase}</th>
                    <td className="py-3">{row.what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`${bodyClass} mt-5`}>{COLLECTIVE_ENVELOPE_NOTE}</p>
        </section>

        <section aria-labelledby="schule-90" className="mt-14">
          <h2 id="schule-90" className={h2Class}>Mit 90 Minuten</h2>
          <p className={`${bodyClass} mt-3`}>Zusätzlich zum Ablauf oben:</p>
          <ul className="mt-3 list-disc space-y-3 pl-5 marker:text-waldgruen">
            {LESSON_90_EXTRAS.map((item) => (
              <li key={item} className={bodyClass}>{item}</li>
            ))}
          </ul>
          <p className={`${bodyClass} mt-6`}>
            <Link href="/schule/ablauf" className={linkClass}>
              Ablauf, Arbeitsblatt und Tafelbild zum Ausdrucken
            </Link>
          </p>
        </section>

        <section aria-labelledby="schule-handschrift" className="mt-14 flow-root">
          <h2 id="schule-handschrift" className={h2Class}>Warum Handschrift</h2>
          <Figure
            src="/images/img-schule-sammelumschlag.webp"
            alt="Eine Mitarbeiterin im Abgeordnetenbüro liest die handgeschriebenen Briefe einer Klasse, im Fenster die Reichstagskuppel, gemalte Illustration"
            width={1200}
            height={896}
            side="right"
            rotate="right"
          />
          <p className={`${bodyClass} mt-3`}>
            Ein handgeschriebener Brief liegt als Papier vor jemandem im Büro. Büros berichten, dass persönliche, handgeschriebene Briefe die seltenste Kategorie sind und deshalb Aufmerksamkeit bekommen. Feldexperimente zeigen, dass Bürgerkontakt Abgeordnete erreichen kann. Ob Handschrift allein stärker wirkt als eine E-Mail, ist bisher nicht direkt untersucht. Ich setze deshalb darauf, dass der Brief bei der zuständigen Person landet und ein eigenes Erlebnis erzählt.
          </p>
          <p className={`${bodyClass} mt-3`}>
            Mehr dazu unter{" "}
            <Link href="/lohnt-sich-brief-an-politiker" className={linkClass}>
              Lohnt es sich, einem Politiker zu schreiben?
            </Link>{" "}
            und{" "}
            <Link href="/handschriftliche-briefe-wirkung" className={linkClass}>
              Studien zu handschriftlichen Briefen
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="schule-leitung" className="mt-14">
          <h2 id="schule-leitung" className={h2Class}>Für die Schulleitung</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-waldgruen">
            <li className={bodyClass}>
              Verarbeitet werden E-Mail-Adresse, Postleitzahl und das Anliegen als Text. Für den Entwurf werden sie nur während der Verarbeitung verwendet und danach verworfen, auf meinem Server wird dafür nichts gespeichert.
            </li>
            <li className={bodyClass}>Es gibt keine Accounts und keine Anmeldung. Ich führe keine Newsletter- oder Marketingliste.</li>
            <li className={bodyClass}>Die Reichweitenmessung arbeitet ohne Cookies.</li>
            <li className={bodyClass}>
              Die E-Mail-Adresse brauche ich, um den Entwurf zu schicken. Der Versand läuft über Brevo, Server in der EU.
            </li>
            <li className={bodyClass}>
              Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich. Die Seite läuft bei Vercel in Frankfurt.
            </li>
            <li className={bodyClass}>
              Über den Klassenlink schreiben die Schüler:innen im Jugendmodus: Sie bekommen nur die eine Mail mit dem Entwurf, ohne Erinnerungen, ohne Spendenbitte und ohne Bitte um eine Bewertung. Partei und Organisation werden nicht abgefragt, die freiwillige Kartenfunktion gibt es dort nicht.
            </li>
            <li className={bodyClass}>
              Der Klassenlink enthält nur Klassenstufe, Schul-Postleitzahl und den Zeitpunkt der Erstellung, keine Namen. Er gilt 14 Tage.
            </li>
          </ul>
          <p className={`${bodyClass} mt-4`}>
            Für den Elternbrief reicht der Link zur{" "}
            <Link href="/eltern" className={linkClass}>Seite für Eltern</Link>: Dort steht, was Brief-nach-Berlin ist und welche Daten verarbeitet werden.
          </p>
          <p className={`${bodyClass} mt-4`}>
            Alle Details stehen in der{" "}
            <Link href="/datenschutz#jugendmodus" className={linkClass}>Datenschutzerklärung</Link>{" "}
            und auf der Seite{" "}
            <Link href="/ki-transparenz" className={linkClass}>KI und Transparenz</Link>.
          </p>
        </section>

        <section aria-labelledby="schule-gross" className="mt-14">
          <h2 id="schule-gross" className={h2Class}>Größer machen: Projekttag oder Schulversammlung</h2>
          <p className={`${bodyClass} mt-3`}>
            Aus einer Stunde kann mehr werden: Mehrere Klassen schreiben am selben Tag, die SV stellt die Briefe in der Schulversammlung vor, oder ein Jahrgang macht einen Projekttag daraus.{" "}
            <Link href="/projekttag-demokratie" className={linkClass}>
              Ideen für den Projekttag Demokratie
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="schule-faq" className="mt-14">
          <h2 id="schule-faq" className={`${h2Class} mb-4`}>Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </section>

        <p className="mt-10 font-body text-sm leading-relaxed text-warmgrau/80">
          Für Schüler:innen geht es hier los:{" "}
          <Link href="/jung" className={linkClass}>/jung</Link>
        </p>
      </div>
    </>
  );
}
