import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ElternExperience } from "@/components/eltern/ElternExperience";
import { APP_URL } from "@/lib/config";

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
    a: "Ja. Dein Kind gibt in der Schule E-Mail-Adresse, Postleitzahl und Anliegen ein, nur während der Verarbeitung, ohne Account. Im Jugendmodus bekommt es nur die eine Mail mit dem Entwurf, ohne Erinnerungen, ohne Spendenbitte und ohne Frage nach einer Partei. Den Entwurf formuliert eine KI von Mistral aus Frankreich.",
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

const h2Class = "font-typewriter text-2xl font-bold text-waldgruen-dark";
const bodyClass = "font-body text-base leading-relaxed text-warmgrau";

export default function ElternPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto w-full max-w-xl px-5 pb-16 pt-6 sm:pt-10">
        <Image
          src="/images/img-eltern-kuechentisch.webp"
          alt="Ein Elternteil schreibt am Küchentisch einen Brief, das Kind zeigt auf eine Zeile, gemalte Illustration"
          width={1200}
          height={510}
          sizes="(max-width: 576px) 100vw, 576px"
          priority
          className="mb-6 h-auto w-full rounded-xl shadow-md shadow-waldgruen/10"
        />

        <h1 className="font-typewriter text-[2rem] font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-4xl">
          Dein Kind schreibt an die Politik.
          <span className="mt-1 block origin-left -rotate-1 font-handwriting text-4xl font-normal text-waldgruen sm:text-5xl">
            Du darfst auch.
          </span>
        </h1>
        <p className="mb-7 mt-4 font-body text-base leading-relaxed text-warmgrau sm:text-lg">
          Unterricht fällt aus, die Turnhalle ist gesperrt, der Schulbus kommt zu spät? Schreib es der Person in der Politik, die dafür zuständig ist. Ich suche die Ebene heraus und schreibe dir einen Entwurf, den du von Hand abschreibst.
        </p>

        <ElternExperience />

        <section aria-labelledby="eltern-zustaendig" className="mt-14">
          <h2 id="eltern-zustaendig" className={h2Class}>Wer ist zuständig?</h2>
          <div className="mt-5 -rotate-1 border border-warmgrau/20 bg-creme p-5 shadow-[3px_4px_0_rgba(107,100,92,0.15)] motion-reduce:rotate-0 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
              <div>
                <h3 className="font-handwriting text-3xl text-waldgruen">Land</h3>
                <p className={`${bodyClass} mt-1`}>
                  Lehrkräfte, Unterrichtsausfall, Lehrpläne, Schulgesetz.
                </p>
                <p className="mt-2 font-body text-sm font-semibold text-waldgruen-dark">
                  Landtag und Landesregierung
                </p>
              </div>
              <div className="border-t border-dashed border-warmgrau/30 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                <h3 className="font-handwriting text-3xl text-airmail-blau">Schulträger</h3>
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

        <section aria-labelledby="eltern-daten" className="mt-14">
          <h2 id="eltern-daten" className={h2Class}>Dein Kind hat Brief-nach-Berlin in der Schule benutzt?</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-waldgruen">
            <li className={bodyClass}>
              Verarbeitet werden E-Mail-Adresse, Postleitzahl und das Anliegen als Text, nur während der Verarbeitung. Es gibt keine Accounts, auf meinem Server wird dafür nichts gespeichert.
            </li>
            <li className={bodyClass}>
              Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich.
            </li>
            <li className={bodyClass}>
              Im Jugendmodus bekommt dein Kind nur die eine Mail mit dem Entwurf: keine Erinnerungen, keine Spendenbitte, keine Frage nach einer Partei, keine Kartenfunktion.
            </li>
          </ul>
          <p className={`${bodyClass} mt-4`}>
            Alle Details stehen in der{" "}
            <Link href="/datenschutz#jugendmodus" className={linkClass}>Datenschutzerklärung</Link>{" "}
            und auf der Seite{" "}
            <Link href="/schule" className={linkClass}>für Schulen</Link>.
          </p>
        </section>

        <section aria-labelledby="eltern-faq" className="mt-14">
          <h2 id="eltern-faq" className={`${h2Class} mb-4`}>Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </section>

        <p className="mt-10 font-body text-sm leading-relaxed text-warmgrau/80">
          Für Schüler:innen geht es auf der{" "}
          <Link href="/jung" className={linkClass}>Seite für Jugendliche</Link> los, für Lehrkräfte auf der{" "}
          <Link href="/schule" className={linkClass}>Seite für Schulen</Link>.
        </p>
      </div>
    </>
  );
}
