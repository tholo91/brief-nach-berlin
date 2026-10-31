import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Figure } from "@/components/editorial/Figure";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ClassLinkGenerator } from "@/components/schule/ClassLinkGenerator";
import { ClockIcon, MailIcon, PrinterIcon } from "@/components/schule/icons";
import { LessonPlanToggle } from "@/components/schule/LessonPlanToggle";
import { APP_URL, FOUNDER_EMAIL, DEFAULT_OG_IMAGES } from "@/lib/config";
import { COLLECTIVE_ENVELOPE_NOTE, PRECHECK_ITEMS } from "@/lib/schule/lessonPlan";

const URL_PATH = "/unterricht";
const CANONICAL_URL = `${APP_URL}${URL_PATH}`;
const TITLE = "Briefe an Abgeordnete im Unterricht";
const DESCRIPTION =
  "Unterrichtsidee für Klasse 8 bis 10: In 45 Minuten schreiben Schüler:innen echte Briefe an Abgeordnete. Mit Klassenlink, QR-Code, Ablauf und Arbeitsblatt.";

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "de_DE",
    url: CANONICAL_URL,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const CONTACT_MAILTO = `mailto:${FOUNDER_EMAIL}?subject=${encodeURIComponent(
  "Brief-nach-Berlin im Unterricht",
)}&body=${encodeURIComponent(
  "Hallo Thomas,\n\nich möchte Brief-nach-Berlin mit meiner Klasse ausprobieren.\n\nSchule und Ort: \nKlassenstufe: \nGeplanter Termin: \nDabei hätte ich gern Hilfe: \n\nViele Grüße\n",
)}`;

const linkClass = "font-semibold text-waldgruen underline underline-offset-2";
const h2Class = "font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl";
const outlineButtonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-waldgruen/40 bg-white px-5 py-3 font-body text-base font-bold text-waldgruen-dark transition-colors hover:bg-waldgruen/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";
const bodyClass = "font-body text-base leading-relaxed text-warmgrau";

const DATA_SUMMARY =
  "Postleitzahl und Anliegen, beim E-Mail-Weg auch die E-Mail-Adresse, werden für den Entwurf nur während der Verarbeitung verwendet und danach verworfen. Es gibt keine Accounts. Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich.";

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
    a: "Nein. Sie scannen den QR-Code, schreiben ihr Anliegen und sehen den Entwurf direkt auf dem Gerät. Mit dem PDF-Weg speichern sie ihn ohne E-Mail-Adresse, beim E-Mail-Weg kommt eine Kopie per Mail.",
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

export default function UnterrichtPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Bild und Überschrift skalieren beide mit der Containerbreite (cqw), so bleibt der Text auf der Tafel im Bild. */}
      <section aria-labelledby="schule-h1" className="@container mx-auto w-full max-w-[120rem]">
        <div className="relative h-[75cqw] overflow-hidden bg-waldgruen-dark sm:h-[52cqw] lg:h-[min(36cqw,50vh)]">
          <Image
            src="/images/img-schule-klasse-hero.webp"
            alt="Eine Schulklasse schreibt an Holztischen Briefe von Hand, die Lehrerin geht durch die Reihen, im Fenster die Reichstagskuppel, gemalte Illustration"
            width={2000}
            height={1117}
            sizes="(min-width: 1024px) 100vw, (min-width: 640px) 150vw, 225vw"
            priority
            className="absolute left-[-5cqw] top-[-23cqw] w-[225cqw] max-w-none sm:left-[-2.5cqw] sm:top-[-14cqw] sm:w-[150cqw] lg:left-0 lg:top-[-8.5cqw] lg:w-full"
          />
          <h1
            id="schule-h1"
            className="absolute left-[8cqw] top-[9.5cqw] max-w-[9.4em] font-typewriter text-[7.6cqw] font-bold leading-[1.18] tracking-tight text-creme sm:left-[6cqw] sm:top-[6.5cqw] sm:text-[5.1cqw] lg:left-[6.5cqw] lg:top-[5.8cqw] lg:text-[3.4cqw]"
          >
            Deine Klasse schreibt an den Bundestag.
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-8 sm:pt-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] md:items-start lg:gap-16">
          <div>
            <p className="font-body text-lg leading-relaxed text-warmgrau">
              Ein kurzer Unterrichtsentwurf: Deine Schüler:innen schreiben in einer Stunde Briefe für ihre Zukunft an ihre Abgeordneten.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-body text-sm font-semibold text-waldgruen-dark">
              {["45 oder 90 Minuten", "Kostenlos", "Ohne Accounts"].map((fact) => (
                <li key={fact} className="flex items-center gap-1.5 [&>svg]:mt-0">
                  <CheckIcon />
                  {fact}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <a href="#ablauf" className={outlineButtonClass}>
                <ClockIcon />
                Ablauf ansehen
              </a>
              <Link href="/unterricht/ablauf" className={outlineButtonClass}>
                <PrinterIcon />
                Material drucken
              </Link>
            </div>
            <p className="mt-6 font-body text-base leading-relaxed text-warmgrau">
              Hilfe bei der Planung? Ich unterstütze dich gern.
            </p>
            <a
              href={CONTACT_MAILTO}
              className={`${linkClass} inline-flex min-h-11 items-center gap-2 rounded-lg hover:text-waldgruen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2`}
            >
              <MailIcon />
              Thomas schreiben
            </a>
          </div>
          <div id="klassenlink" className="scroll-mt-32">
            <ClassLinkGenerator />
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
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
              <Link href="/unterricht/ablauf" className={linkClass}>
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
                  Verarbeitet werden Postleitzahl und Anliegen als Text, beim E-Mail-Weg auch die E-Mail-Adresse. Für den Entwurf werden sie nur während der Verarbeitung verwendet und danach verworfen, auf meinem Server wird dafür nichts gespeichert.
                </li>
                <li className={bodyClass}>Es gibt keine Accounts und keine Anmeldung. Ich führe keine Newsletter- oder Marketingliste.</li>
                <li className={bodyClass}>Die Reichweitenmessung arbeitet ohne Cookies.</li>
                <li className={bodyClass}>
                  Du wählst pro Klassenlink: Beim PDF-Weg wird keine E-Mail-Adresse abgefragt, das PDF entsteht auf dem Gerät. Beim E-Mail-Weg brauche ich die Adresse, um den Entwurf zu schicken. Der Versand läuft über Brevo, Server in der EU.
                </li>
                <li className={bodyClass}>
                  Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich. Die Seite läuft bei Vercel in Frankfurt.
                </li>
                <li className={bodyClass}>
                  Über den Klassenlink schreiben die Schüler:innen im Jugendmodus: ohne Erinnerungen, ohne Spendenbitte und ohne Bitte um eine Bewertung. Beim E-Mail-Weg kommt nur die eine Mail mit dem Entwurf. Partei und Organisation werden nicht abgefragt, die freiwillige Kartenfunktion gibt es dort nicht.
                </li>
                <li className={bodyClass}>
                  Der Klassenlink enthält nur Klassenstufe, Schul-Postleitzahl, den gewählten Weg und den Zeitpunkt der Erstellung, keine Namen. Er gilt 14 Tage.
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
        </div>
      </div>
    </>
  );
}
