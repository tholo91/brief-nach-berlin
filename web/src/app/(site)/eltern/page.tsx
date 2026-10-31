import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ElternExperience } from "@/components/eltern/ElternExperience";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";
import { APP_URL, DEFAULT_OG_IMAGES } from "@/lib/config";

const URL_PATH = "/eltern";
const CANONICAL_URL = `${APP_URL}${URL_PATH}`;
const TITLE = "Unterrichtsausfall beschweren: Brief an die Landespolitik";
const DESCRIPTION =
  "Unterrichtsausfall, Lehrermangel, marode Schule? Als Elternteil an Landtag oder Schulträger schreiben: Anliegen schildern, Entwurf bekommen, abschreiben.";

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

const linkClass = "font-semibold text-waldgruen underline underline-offset-2";

const faqs = [
  {
    q: "Wo kann ich mich über Unterrichtsausfall beschweren?",
    a: "Zuerst bei der Schulleitung und der Elternvertretung deiner Schule. Für Lehrkräfte und Unterrichtsausfall ist das Land zuständig, also kannst du auch an Landtagsabgeordnete oder die Landesregierung schreiben. Brief-nach-Berlin hilft dir, daraus einen Briefentwurf an die zuständige Ebene zu machen.",
  },
  {
    q: "Wer ist für das Schulgebäude zuständig?",
    a: "Für Gebäude, Ausstattung und Schulbus ist in der Regel der Schulträger zuständig, also die Stadt, die Gemeinde oder der Kreis. Lehrkräfte und Lehrpläne gehören zum Land. Die Aufteilung unterscheidet sich je nach Bundesland, die Quelle ist das Niedersächsische Kultusministerium.",
  },
  {
    q: "Kann ich an das Kultusministerium schreiben?",
    a: "Brief-nach-Berlin schlägt für die Landesebene Landtagsabgeordnete und die Landesregierung vor, in Stadtstaaten den Senat. Das Kultusministerium selbst ist kein eigener Empfänger in der Auswahl. Du kannst es im Brief aber nennen und schildern, was in deinem Bundesland geändert werden soll.",
  },
  {
    q: "Ist das für mein Kind sicher?",
    a: "Ja. Dein Kind gibt in der Schule Postleitzahl und Anliegen ein, nur während der Verarbeitung, ohne Account. Die Lehrkraft entscheidet, ob der Entwurf als PDF auf dem Gerät bleibt oder per E-Mail kommt; nur beim E-Mail-Weg wird eine Adresse abgefragt. Im Jugendmodus gibt es keine Erinnerungen, keine Spendenbitte und keine Frage nach einer Partei. Den Entwurf formuliert eine KI von Mistral aus Frankreich.",
  },
  {
    q: "Was kostet das?",
    a: "Nichts. Brief-nach-Berlin ist kostenlos und du brauchst keinen Account. Für den Brief brauchst du nur Papier, einen Umschlag und eine Briefmarke.",
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

const h2Class = "font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl";
const doorClass =
  "flex items-start justify-between gap-3 rounded-xl border border-waldgruen/20 bg-white p-4 transition-colors hover:border-waldgruen/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";
const bodyClass = "font-body text-base leading-relaxed text-warmgrau";

export default function ElternPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto w-full max-w-xl px-5 pb-16 pt-4 sm:pt-10">
        <Image
          src="/images/img-eltern-kuechentisch.webp"
          alt="Ein Elternteil schreibt am Küchentisch einen Brief, das Kind zeigt auf eine Zeile, gemalte Illustration"
          width={1200}
          height={510}
          sizes="(max-width: 576px) 100vw, 576px"
          priority
          className="mb-4 h-24 w-full rounded-xl object-cover object-[center_50%] shadow-md shadow-waldgruen/10 sm:mb-6 sm:h-auto"
        />

        <h1 className="font-typewriter text-2xl font-bold leading-tight tracking-tight text-waldgruen-dark text-balance sm:text-[2rem]">
          Schreib der Politik, was an der Schule deiner Kinder fehlt.
        </h1>
        <p className="mt-2 font-body text-base leading-relaxed text-warmgrau sm:mt-4 sm:text-lg">
          Unterrichtsausfall, gesperrte Turnhalle, verspäteter Schulbus? Ich suche die zuständige Ebene und schreibe dir einen Entwurf zum Abschreiben.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href="#schreiben" className={doorClass}>
            <span>
              <span className="block font-body text-base font-bold text-waldgruen-dark">Ich will selbst einen Brief schreiben</span>
              <span className="mt-1 block font-body text-sm text-warmgrau/80">
                Anliegen schildern, Entwurf bekommen, von Hand abschreiben.
              </span>
            </span>
            <WizardForwardIcon className="mt-1 shrink-0 rotate-90 text-waldgruen" />
          </a>
          <a href="#sicher" className={doorClass}>
            <span>
              <span className="block font-body text-base font-bold text-waldgruen-dark">Mein Kind will Brief-nach-Berlin mit seiner Klasse nutzen</span>
              <span className="mt-1 block font-body text-sm text-warmgrau/80">
                Was mit den Daten passiert und wie die Lehrkraft startet.
              </span>
            </span>
            <WizardForwardIcon className="mt-1 shrink-0 rotate-90 text-waldgruen" />
          </a>
        </div>

        <div id="schreiben" className="mt-8 scroll-mt-32">
          <ElternExperience />
        </div>

        <section aria-labelledby="eltern-zustaendig" className="reveal mt-14">
          <h2 id="eltern-zustaendig" className={h2Class}>Wer ist zuständig?</h2>
          <div className="mt-5 -rotate-1 border border-warmgrau/20 bg-creme p-5 shadow-[3px_4px_0_rgba(107,100,92,0.15)] motion-reduce:rotate-0 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
              <div>
                <h3 className="font-typewriter text-xl font-bold text-waldgruen">Land</h3>
                <p className={`${bodyClass} mt-1`}>
                  Lehrkräfte, Unterrichtsausfall, Lehrpläne, Schulgesetz.
                </p>
                <p className="mt-2 font-body text-sm font-semibold text-waldgruen-dark">
                  Landtag und Landesregierung
                </p>
              </div>
              <div className="border-t border-dashed border-warmgrau/30 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                <h3 className="font-typewriter text-xl font-bold text-airmail-blau">Schulträger</h3>
                <p className={`${bodyClass} mt-1`}>
                  Gebäude, Ausstattung, Schulbus.
                </p>
                <p className="mt-2 font-body text-sm font-semibold text-waldgruen-dark">
                  Stadt, Gemeinde oder Kreis
                </p>
              </div>
            </div>
          </div>
          <p className={`${bodyClass} mt-4`}>
            Brief-nach-Berlin schlägt dir die zuständige Ebene vor. Prüf den Vorschlag, bevor du den Brief abschreibst. Die Aufteilung unterscheidet sich je nach Bundesland, sie stammt vom Niedersächsischen Kultusministerium.
          </p>
        </section>

        <section id="sicher" aria-labelledby="eltern-daten" className="reveal mt-14 scroll-mt-32">
          <h2 id="eltern-daten" className={h2Class}>Ist das sicher?</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-waldgruen">
            <li className={bodyClass}>
              Verarbeitet werden Postleitzahl und Anliegen als Text, nur während der Verarbeitung, beim E-Mail-Weg auch die E-Mail-Adresse. Es gibt keine Accounts, auf meinem Server wird dafür nichts gespeichert.
            </li>
            <li className={bodyClass}>
              Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich.
            </li>
            <li className={bodyClass}>
              Im Jugendmodus bekommt dein Kind höchstens die eine Mail mit dem Entwurf: keine Erinnerungen, keine Spendenbitte, keine Frage nach einer Partei, keine Kartenfunktion.
            </li>
          </ul>
          <p className={`${bodyClass} mt-4`}>
            Alle Details stehen in der{" "}
            <Link href="/datenschutz#jugendmodus" className={linkClass}>Datenschutzerklärung</Link>{" "}
            und auf der Seite{" "}
            <Link href="/unterricht" className={linkClass}>für Schulen</Link>.
          </p>
        </section>

        <section aria-labelledby="eltern-faq" className="reveal mt-14">
          <h2 id="eltern-faq" className={`${h2Class} mb-4`}>Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </section>
      </div>
    </>
  );
}
