import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Figure } from "@/components/editorial/Figure";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ClassLinkGenerator } from "@/components/schule/ClassLinkGenerator";
import { LessonPlanToggle } from "@/components/schule/LessonPlanToggle";
import { APP_URL } from "@/lib/config";
import { COLLECTIVE_ENVELOPE_NOTE, PRECHECK_ITEMS } from "@/lib/schule/lessonPlan";

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
const h2Class = "font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl";
const heroButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-lg px-5 py-3 font-body text-base font-bold transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";
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

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 h-5 w-5 shrink-0 text-waldgruen"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-waldgruen transition-transform duration-200"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SchulePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:pt-10">
        <section aria-labelledby="schule-h1" className="md:grid md:grid-cols-[1.15fr_1fr] md:items-center md:gap-10">
          <div>
            <h1
              id="schule-h1"
              className="font-typewriter text-2xl font-bold leading-tight tracking-tight text-waldgruen-dark text-balance sm:text-[2rem] md:text-[1.75rem] lg:text-[2rem]"
            >
              Deine Klasse schreibt an die Politik.
            </h1>
            <p className="mt-3 font-body text-base leading-relaxed text-warmgrau sm:text-lg">
              In einer Schulstunde schreiben deine Schüler:innen echte Briefe an ihre Abgeordneten. Los geht es per QR-Code.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-body text-sm font-semibold text-waldgruen-dark">
              {["45 oder 90 Minuten", "Kostenlos", "Ohne Accounts"].map((fact) => (
                <li key={fact} className="flex items-center gap-1.5 [&>svg]:mt-0">
                  <CheckIcon />
                  {fact}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#klassenlink" className={`${heroButtonClass} bg-waldgruen text-creme hover:bg-waldgruen-dark`}>
                Klassenlink erstellen
              </a>
              <a
                href="#ablauf"
                className={`${heroButtonClass} border border-waldgruen/40 bg-white text-waldgruen-dark hover:bg-waldgruen/5`}
              >
                Ablauf ansehen
              </a>
            </div>
          </div>
          <Image
            src="/images/img-schule-klasse.webp"
            alt="Eine Schulklasse schreibt an Holztischen Briefe von Hand, die Lehrerin geht durch die Reihen, im Fenster die Reichstagskuppel, gemalte Illustration"
            width={1200}
            height={670}
            sizes="(min-width: 768px) 460px, 100vw"
            priority
            className="mt-8 aspect-[5/2] w-full rounded-xl object-cover object-[center_55%] shadow-md shadow-waldgruen/10 md:mt-0 md:aspect-auto md:h-auto"
          />
        </section>

        <div className="mx-auto max-w-2xl">
          <div id="klassenlink" className="mt-10 scroll-mt-32">
            <ClassLinkGenerator />
          </div>

          <section aria-labelledby="schule-pruefen" className="reveal mt-14">
            <h2 id="schule-pruefen" className={h2Class}>Vorher kurz prüfen</h2>
            <ul className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
              {PRECHECK_ITEMS.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckIcon />
                  <span className={bodyClass}>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="ablauf" aria-labelledby="schule-ablauf" className="reveal mt-14 scroll-mt-32">
            <h2 id="schule-ablauf" className={h2Class}>Ablauf der Stunde</h2>
            <LessonPlanToggle />
            <p className={`${bodyClass} mt-6 rounded-xl border border-dashed border-waldgruen/30 bg-white/70 p-4`}>
              {COLLECTIVE_ENVELOPE_NOTE}
            </p>
            <p className={`${bodyClass} mt-6`}>
              <Link href="/schule/ablauf" className={linkClass}>
                Ablauf, Arbeitsblatt und Tafelbild zum Ausdrucken
              </Link>
            </p>
          </section>

          <section aria-labelledby="schule-warum" className="reveal mt-14 flow-root">
            <h2 id="schule-warum" className={h2Class}>Warum das wirkt</h2>
            <Figure
              src="/images/img-schule-sammelumschlag.webp"
              alt="Eine Mitarbeiterin im Abgeordnetenbüro liest die handgeschriebenen Briefe einer Klasse, im Fenster die Reichstagskuppel, gemalte Illustration"
              width={1200}
              height={896}
              side="right"
              rotate="right"
            />
            <p className={`${bodyClass} mt-3`}>
              Zum Bundestag wählt man ab 18, viele Schüler:innen dürfen also noch nicht mitentscheiden. Schreiben dürfen sie trotzdem, und Abgeordnete vertreten auch sie. Die Kultusministerkonferenz hat am 11.10.2018 beschlossen, dass Demokratiebildung Aufgabe aller Fächer ist. Ein echter Brief ist dafür eine Übung mit Ernstfall.
            </p>
            <div className="clear-both mt-5">
              <FAQAccordion
                items={[
                  {
                    q: "Warum Handschrift?",
                    a: "Ein handgeschriebener Brief liegt als Papier vor jemandem im Büro. Büros berichten, dass persönliche, handgeschriebene Briefe die seltenste Kategorie sind und deshalb Aufmerksamkeit bekommen. Feldexperimente zeigen, dass Bürgerkontakt Abgeordnete erreichen kann. Ob Handschrift allein stärker wirkt als eine E-Mail, ist bisher nicht direkt untersucht. Ich setze deshalb darauf, dass der Brief bei der zuständigen Person landet und ein eigenes Erlebnis erzählt.",
                  },
                ]}
              />
            </div>
            <p className={`${bodyClass} mt-5`}>
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

          <section id="schulleitung" aria-labelledby="schule-leitung" className="reveal mt-14 scroll-mt-32">
            <h2 id="schule-leitung" className={h2Class}>Für die Schulleitung</h2>
            <details className="group [&[open]_svg]:rotate-180 [&[open]]:bg-waldgruen/[0.03] -mx-3 mt-4 rounded-lg border-y border-waldgruen/15 px-3 transition-colors duration-150">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                <span className="pr-2 font-body text-base font-semibold text-waldgruen-dark transition-colors duration-150 group-open:text-waldgruen md:text-lg">
                  Datenschutz und Technik im Überblick
                </span>
                <ChevronIcon />
              </summary>
              <ul className="list-disc space-y-3 pb-6 pl-5 pr-3 marker:text-waldgruen">
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
            </details>
            <p className={`${bodyClass} mt-4`}>
              Für den Elternbrief reicht der Link zur{" "}
              <Link href="/eltern#sicher" className={linkClass}>Seite für Eltern</Link>: Dort steht, was Brief-nach-Berlin ist und welche Daten verarbeitet werden.
            </p>
            <p className={`${bodyClass} mt-4`}>
              Alle Details stehen in der{" "}
              <Link href="/datenschutz#jugendmodus" className={linkClass}>Datenschutzerklärung</Link>{" "}
              und auf der Seite{" "}
              <Link href="/ki-transparenz" className={linkClass}>KI und Transparenz</Link>.
            </p>
          </section>

          <section aria-labelledby="schule-gross" className="reveal mt-14">
            <h2 id="schule-gross" className={h2Class}>Projekttag</h2>
            <div className="mt-4 rounded-xl border border-waldgruen/20 bg-white p-5">
              <p className={bodyClass}>
                Aus einer Stunde kann mehr werden: Mehrere Klassen schreiben am selben Tag, die SV stellt die Briefe in der Schulversammlung vor, oder ein Jahrgang macht einen Projekttag daraus.{" "}
                <Link href="/projekttag-demokratie" className={linkClass}>
                  Ideen für den Projekttag Demokratie
                </Link>
                .
              </p>
            </div>
          </section>

          <section aria-labelledby="schule-faq" className="reveal mt-14">
            <h2 id="schule-faq" className={`${h2Class} mb-4`}>Häufige Fragen</h2>
            <FAQAccordion items={faqs} />
          </section>

          <p className="mt-10 font-body text-sm leading-relaxed text-warmgrau/80">
            Für Schüler:innen geht es hier los:{" "}
            <Link href="/jung" className={linkClass}>/jung</Link>
          </p>
        </div>
      </div>
    </>
  );
}
