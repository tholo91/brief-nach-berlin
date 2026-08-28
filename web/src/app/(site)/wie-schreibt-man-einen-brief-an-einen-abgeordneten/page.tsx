import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FactCallout } from "@/components/editorial/FactCallout";

const URL_PATH = "/wie-schreibt-man-einen-brief-an-einen-abgeordneten";
const PUBLISHED = "2026-08-28";
const TITLE = "Wie schreibt man einen Brief an einen Abgeordneten? | Brief-nach-Berlin";
const DESCRIPTION =
  "So schreibst du einen Brief an einen Abgeordneten: Anliegen klären, Zuständigkeit finden, Brief aufbauen, Adresse prüfen und abschicken.";

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
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const faqs = [
  {
    q: "Wie fange ich einen Brief an einen Abgeordneten an?",
    a: "Beginne mit der Anrede „Sehr geehrte Frau [Nachname]“ oder „Sehr geehrter Herr [Nachname]“. Danach nennst du dein Anliegen direkt im ersten Satz. Schreibe kurz, was passiert ist, warum es dich betrifft und was du dir von der Politik wünschst.",
  },
  {
    q: "Wie lang sollte ein Brief an einen Abgeordneten sein?",
    a: "Eine handgeschriebene Seite mit etwa 200 bis 280 Wörtern reicht meistens aus. Ein Brief sollte dein Anliegen, deinen persönlichen Bezug und eine konkrete Bitte enthalten. Bei mehreren Themen ist es besser, je einen eigenen Brief zu schreiben.",
  },
  {
    q: "Welchem Abgeordneten soll ich schreiben?",
    a: "Das hängt vom Thema und deiner Postleitzahl ab. Für Bundesgesetze ist dein Mitglied des Bundestags zuständig, für Schulen und Polizei meist ein Mitglied des Landtags und für Straßen oder Kitas der Stadtrat oder Gemeinderat. Brief-nach-Berlin hilft dir, die passende Ebene zu prüfen.",
  },
  {
    q: "Muss ich meine Adresse in den Brief schreiben?",
    a: "Ja, wenn du eine Antwort möchtest. Name und Adresse zeigen außerdem, dass du aus dem Wahlkreis schreibst. Setze die Adresse in den Brief oder auf den Umschlag. Eine Telefonnummer oder E-Mail-Adresse kannst du ergänzen, musst du aber nicht.",
  },
  {
    q: "Soll ich den Brief handschriftlich oder per E-Mail schicken?",
    a: "Ein handgeschriebener Brief ist eine gute Wahl, weil er persönlich wirkt und nicht wie eine automatisch versendete Nachricht. Wenn das für dich nicht möglich ist, ist ein getippter Brief oder eine E-Mail trotzdem sinnvoller als gar nicht zu schreiben.",
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
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: { "@type": "Organization", name: "Brief-nach-Berlin" },
  publisher: { "@type": "Organization", name: "Brief-nach-Berlin", url: APP_URL },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          Brief an die Politik
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Wie schreibt man einen Brief an einen Abgeordneten?
        </h1>
        <p className="font-body text-lg text-warmgrau/80 leading-relaxed mb-12">
          Schreibe zuerst dein konkretes Anliegen auf, finde die zuständige politische Ebene und richte den Brief an eine bestimmte Person. Dann erklärst du auf einer Seite, was passiert ist, warum es dich betrifft und welche Antwort oder Handlung du dir wünschst. Am Ende stehen Gruß, Name und Adresse.
        </p>

        <Prose>
          <h2>Wie schreibt man einen Brief an einen Abgeordneten Schritt für Schritt?</h2>
          <p>
            Du brauchst kein politisches Vorwissen und keine perfekte Formulierung. Ein Brief wird verständlicher, wenn du ihn in fünf kleine Aufgaben aufteilst.
          </p>

          <FactCallout number="5" label="Schritte vom ersten Gedanken bis zum abgeschickten Brief" source="Eine Seite reicht für ein konkretes Anliegen" />

          <ol className="list-decimal pl-6 space-y-5">
            <li>
              <strong>Formuliere dein Anliegen in einem Satz.</strong> Was ist passiert oder was sollte sich ändern? Schreibe zunächst so, wie du es einer bekannten Person erzählen würdest.
            </li>
            <li>
              <strong>Erkläre deinen persönlichen Bezug.</strong> Nenne ein konkretes Erlebnis, einen Ort oder eine Folge für deinen Alltag. Zwei bis vier Sätze reichen oft.
            </li>
            <li>
              <strong>Finde die zuständige Person.</strong> Bei Bundesgesetzen ist ein Mitglied des Bundestags die richtige Adresse. Schulen, Polizei und Hochschulen gehören meist zum Land. Für einen Radweg, einen Spielplatz oder einen Kita-Platz ist der Stadtrat oder Gemeinderat zuständig. Der <Link href="/kommune-land-bund-eu" className="text-waldgruen hover:underline">Überblick zu Kommune, Land, Bund und EU</Link> hilft bei der Einordnung.
            </li>
            <li>
              <strong>Stelle eine konkrete Bitte.</strong> Bitte um eine Stellungnahme, eine Erklärung oder darum, das Thema im zuständigen Gremium anzusprechen. Eine klare Bitte ist leichter zu beantworten als allgemeiner Ärger.
            </li>
            <li>
              <strong>Prüfe den Brief und schicke ihn ab.</strong> Lies ihn einmal laut vor. Streiche Wiederholungen, prüfe Name und Adresse und unterschreibe. Eine handgeschriebene Seite mit etwa 200 bis 280 Wörtern ist eine gute Orientierung.
            </li>
          </ol>

          <h2>Welche Anrede und welcher Aufbau sind richtig?</h2>
          <p>
            Beginne mit „Sehr geehrte Frau [Nachname]“ oder „Sehr geehrter Herr [Nachname]“. Danach folgt dein Anliegen ohne lange Vorgeschichte. Im Hauptteil erklärst du den persönlichen Bezug. Zum Schluss formulierst du deine Bitte und bittest, wenn du möchtest, um eine Antwort.
          </p>
          <p>
            Beende den Brief mit „Mit freundlichen Grüßen“, deinem Vor- und Nachnamen sowie deiner Adresse. Ein Datum ist sinnvoll, aber nicht zwingend. Einen Briefkopf brauchst du nicht.
          </p>

          <PullQuote decorative>
            Dein Brief muss nicht perfekt klingen. Er muss erkennen lassen, was dich betrifft und was du dir wünschst.
          </PullQuote>

          <h2>Wie finde ich den richtigen Abgeordneten?</h2>
          <p>
            Prüfe zuerst, auf welcher Ebene dein Thema entschieden wird. Eine Postleitzahl allein beantwortet diese Frage noch nicht, sie hilft aber beim Finden des Wahlkreises. Bei Bundestagsthemen ist dein Wahlkreisabgeordneter ein guter erster Kontakt. Bei Landes- und kommunalen Themen brauchst du oft eine andere Adresse.
          </p>
          <p>
            Wenn du diese Suche abkürzen möchtest, kannst du bei <Link href="/app" className="text-waldgruen hover:underline">Brief-nach-Berlin kostenlos starten</Link>. Du beschreibst dein Anliegen, gibst deine Postleitzahl ein und bekommst Hilfe beim Finden der zuständigen Abgeordneten. Der Text wird als Vorschlag formuliert, den du selbst prüfen, abschreiben und verschicken kannst.
          </p>

          <h2>Was sollte ich vermeiden?</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>Mehrere völlig verschiedene Themen in einem Brief vermischen.</li>
            <li>Nur allgemeine Forderungen schreiben, ohne deinen konkreten Bezug zu erklären.</li>
            <li>Beleidigungen oder Unterstellungen verwenden. Kritik wird klarer, wenn sie sich auf ein Verhalten, eine Entscheidung oder eine Folge bezieht.</li>
            <li>Den Namen der Person und die Adresse ungeprüft übernehmen.</li>
          </ul>

          <p>
            Weitere Hinweise zu Länge, Inhalt und Versand findest du in den <Link href="/tipps" className="text-waldgruen hover:underline">Schreibtipps für deinen Brief</Link>. Wenn du sofort loslegen willst, kannst du dein Anliegen auch einfach in <Link href="/app" className="text-waldgruen hover:underline">drei Minuten kostenlos formulieren</Link>.
          </p>
        </Prose>

        <div className="mt-16 border-t border-warmgrau/10 pt-8">
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-4">Mehr dazu</p>
          <ul className="flex flex-col gap-3">
            <li><Link href="/abgeordneten-schreiben" className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors">Brief an Abgeordnete schreiben</Link></li>
            <li><Link href="/guide" className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors">Der komplette Guide vom Frust zum Brief</Link></li>
            <li><Link href="/lohnt-sich-brief-an-politiker" className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors">Lohnt sich ein Brief an Politiker?</Link></li>
          </ul>
        </div>

        <div className="mt-16">
          <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-6">Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </div>

        <div className="mt-16 bg-creme rounded-xl p-8 text-center">
          <p className="font-body text-lg font-bold text-waldgruen-dark mb-4">
            Anliegen beschreiben statt lange perfektionieren
          </p>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Brief-nach-Berlin hilft dir kostenlos beim Formulieren und bei der Suche nach den zuständigen Abgeordneten.
          </p>
          <Link href="/app" className="inline-block bg-waldgruen text-creme font-body font-semibold px-8 py-3 rounded-lg hover:bg-waldgruen-dark transition-colors">
            Brief schreiben
          </Link>
        </div>
      </main>
    </>
  );
}
