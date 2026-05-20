import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL, FOUNDER_HOMEPAGE } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";

const TITLE = "KI & Transparenz";
const DESCRIPTION =
  "Welche KI Brief-nach-Berlin nutzt, warum wir uns für Mistral aus Europa entschieden haben und wie das Tool transparent mit Claude Code als Freizeitprojekt entstanden ist.";
const URL_PATH = "/ki-transparenz";
const PUBLISHED = "2026-05-20";

export const metadata: Metadata = {
  title: `${TITLE} | Brief nach Berlin`,
  description: DESCRIPTION,
  alternates: {
    canonical: `${APP_URL}${URL_PATH}`,
  },
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

const faqs = [
  {
    q: "Welche KI nutzt Brief-nach-Berlin?",
    a: "Brief-nach-Berlin generiert die Brief-Entwürfe mit Mistral, einem KI-Anbieter mit Sitz in Paris. Konkret läuft die Textgenerierung über das Modell mistral-medium, die Inhaltsprüfung über mistral-moderation. Alle Aufrufe gehen direkt an Mistrals API in der EU.",
  },
  {
    q: "Warum nicht OpenAI oder ein anderes US-Modell?",
    a: "US-Anbieter unterliegen Gesetzen wie dem CLOUD Act, die US-Behörden Zugriff auf Daten geben können, auch wenn Server in Europa stehen. Für ein Tool, in dem Menschen politische Anliegen formulieren, ist das die falsche Grundlage. Mistral ist europäisch, unterliegt EU-Recht und nutzt deine Eingaben vertraglich nicht für Training.",
  },
  {
    q: "Werden meine Eingaben gespeichert?",
    a: "Nein. Brief-nach-Berlin speichert weder dein Anliegen noch den generierten Brief in einer Datenbank. Sobald du die Seite schließt, ist beides weg. Mistral verpflichtet sich vertraglich, deine Eingaben nicht für Modelltraining zu verwenden.",
  },
  {
    q: "Werden meine Daten für KI-Training verwendet?",
    a: "Nein. Mistral nutzt die Eingaben aus Brief-nach-Berlin laut Vertrag nicht für das Training neuer Modelle.",
  },
  {
    q: "Wo läuft die App?",
    a: "Auf europäischen Servern, ausgeliefert über ein Frankfurter Rechenzentrum. Auch die wenigen Metriken (etwa der Brief-Zähler) liegen bei einem europäischen Anbieter. Keine Daten verlassen den europäischen Rechtsraum.",
  },
  {
    q: "Wurde Brief-nach-Berlin mit KI gebaut?",
    a: "Ja, die Entwicklung erfolgte mit Claude Code von Anthropic. Aber Claude läuft nicht im Betrieb mit: Wenn du das Tool benutzt, verarbeitet ausschließlich Mistral in Europa deine Eingaben.",
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
  author: { "@type": "Organization", name: "Brief nach Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief nach Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

export default function KiTransparenzPage() {
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
            KI & Transparenz
          </p>
          <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
            Welche KI wir nutzen, und warum aus Europa
          </h1>
          <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
            Wer politische Briefe mit Hilfe von KI schreibt, sollte wissen,
            welche KI da eigentlich mitschreibt. Hier steht es offen.
          </p>

        <Prose>
            <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
              Wir nutzen Mistral
            </h2>
            <p>
              Brief-nach-Berlin generiert die Brief-Entwürfe mit{" "}
              <a
                href="https://mistral.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                Mistral
              </a>
              , einem KI-Anbieter mit Sitz in Paris. Konkret läuft die
              Textgenerierung über das Modell <em>mistral-medium</em>, die
              Inhaltsprüfung über <em>mistral-moderation</em>. Beide Aufrufe
              gehen direkt an Mistrals API in der EU. Kein Umweg über andere
              Anbieter, kein Zwischenspeichern, keine Trainingsdaten aus deinen
              Texten.
            </p>

            <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
              Warum Mistral und nicht ein US-Anbieter
            </h2>
            <p>
              Die naheliegende Wahl wäre ein US-Modell gewesen. Technisch ist
              das oft die einfachere Lösung. Politisch und datenschutzrechtlich
              ist es das nicht. US-Anbieter unterliegen Gesetzen wie dem CLOUD
              Act, die US-Behörden Zugriff auf Daten geben können, auch wenn
              die Server in Europa stehen. Für ein Tool, in dem Menschen
              beschreiben, was sie politisch bewegt, ist das die falsche
              Grundlage.
            </p>
            <p>
              Mistral ist ein europäisches Unternehmen unter europäischem
              Recht. Die Datenverarbeitung läuft in EU-Rechenzentren. Mistral
              verpflichtet sich vertraglich, deine Eingaben nicht für das
              Training neuer Modelle zu verwenden. Das ist nicht perfekt, aber
              es ist die mit Abstand sauberste Lösung, die heute praktisch
              verfügbar ist.
            </p>
            <p>
              Dahinter steht eine Überzeugung: Wenn wir wollen, dass digitale
              Infrastruktur in Europa unabhängig wird, müssen europäische
              Anbieter auch dann genutzt werden, wenn sie nicht die größten
              oder bekanntesten sind. Sonst wird aus dem Wunsch nach digitaler
              Souveränität ein Sonntagsreden-Thema.
            </p>

            <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
              Was die KI sieht, und was nicht
            </h2>
            <p>
              An Mistral geht das, was du in das Eingabefeld schreibst, plus
              den Namen deines Abgeordneten und die Wahlkreis-Information.
              Mehr nicht. Kein Name von dir, keine Adresse, keine IP. Das Tool
              braucht das nicht, also wird es auch nicht erhoben.
            </p>
            <p>
              Der fertige Brief existiert nur in deinem Browser. Brief-nach-Berlin
              speichert weder dein Anliegen noch den Brief in einer Datenbank.
              Sobald du die Seite schließt, ist beides weg. Was bleibt, ist
              der Brief, den du selbst von Hand abschreibst und abschickst.
            </p>
            <p>
              Mehr Details dazu stehen in der{" "}
              <Link
                href="/datenschutz"
                className="text-waldgruen hover:underline"
              >
                Datenschutzerklärung
              </Link>
              .
            </p>

            <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
              Hosting in Deutschland
            </h2>
            <p>
              Die Web-Anwendung läuft auf europäischen Servern, ausgeliefert
              über ein Frankfurter Rechenzentrum. Auch die wenigen Daten, die
              das Tool überhaupt braucht (zum Beispiel der Zähler, wie viele
              Briefe geschrieben wurden), liegen bei einem europäischen
              Anbieter mit EU-Datenverarbeitung. Keine Daten verlassen den
              europäischen Rechtsraum.
            </p>

            <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
              Auch die Bilder sind teilweise KI
            </h2>
            <p>
              Ein Teil der Illustrationen auf dieser Seite ist mit KI
              entstanden. Ehrlich gesagt: Am liebsten hätte ich jedes Bild
              selbst gezeichnet oder mit einer Illustratorin zusammen
              entwickelt. Dafür fehlt mir als Einzelperson schlicht die Zeit
              und das Budget. Die Entscheidung war: lieber eine App, die
              überhaupt existiert und lebendig wirkt, als ein perfektes
              Bildkonzept, das nie online geht.
            </p>
            <p>
              Wichtiger als jedes einzelne Bild ist mir, dass Leute hier
              tatsächlich Briefe schreiben. Und dass man trotzdem merkt, dass
              da Herzblut drinsteckt: viele Stunden Arbeit, die ich gerne
              reinstecke, weil das Feedback der letzten Wochen so schön war.
              Die Erwähnung in der{" "}
              <Link
                href="/lage-der-nation"
                className="text-waldgruen hover:underline"
              >
                Lage der Nation
              </Link>{" "}
              war da nochmal ein besonderer Moment.
            </p>

            <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
              Transparent gebaut mit Claude Code
            </h2>
            <p>
              Eine letzte Sache, weil mir Offenheit hier wichtig ist:
              Brief-nach-Berlin ist ein Freizeitprojekt, gebaut mit{" "}
              <a
                href="https://claude.com/claude-code"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                Claude Code
              </a>
              , einem KI-Assistenten von Anthropic. Heißt: Ich arbeite beim
              Entwickeln mit einer KI zusammen, die mir hilft, Code schneller
              und sauberer zu schreiben. Das hat mich enorm produktiv gemacht
              und macht es überhaupt erst möglich, so ein Tool als Einzelperson
              kostenlos bereitzustellen.
            </p>
            <p>
              Wichtig dabei: Claude Code kommt nur beim Bauen zum Einsatz, nicht
              im Betrieb. Wenn du das Tool benutzt, läuft kein Claude irgendwo
              im Hintergrund mit. Die Architektur und der Code wurden mit Claude
              entwickelt, die laufende Verarbeitung deiner Eingaben erfolgt
              ausschließlich über Mistral in Europa. Datenschutzrechtlich passt
              das sauber zusammen: Wie ein Tool gebaut wurde, ist eine andere
              Frage als womit es im Alltag arbeitet.
            </p>
            <p>
              Ich schreibe das hier ausdrücklich hin, weil ich finde, dass
              Tools, die KI nutzen, ehrlich darüber sprechen sollten, wo KI
              überall mitspielt. Nicht erst, wenn jemand danach fragt.
            </p>

            <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
              Häufige Fragen
            </h2>
            <FAQAccordion items={faqs} />
        </Prose>

          <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl hover:bg-waldgruen/10 transition-colors">
            <h2 className="font-body text-2xl font-bold text-waldgruen-dark mb-4">
              Probier es aus
            </h2>
            <p className="font-body text-warmgrau leading-relaxed mb-6">
              Drei Minuten, ein Brief, kein Account. Deine Eingaben gehen
              ausschließlich an Mistral in Europa und werden nirgendwo
              gespeichert.
            </p>
            <Link
              href="/app"
              className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
            >
              Mit deinem Brief anfangen &rarr;
            </Link>
          </div>

          <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed space-y-3">
            <p>
              Wenn dich interessiert, wer hinter dem Projekt steht und warum es
              kostenlos ist, lies{" "}
              <Link href="/warum" className="text-waldgruen hover:underline">
                Wer dahintersteht
              </Link>
              . Mehr zur Person:{" "}
              <a
                href={FOUNDER_HOMEPAGE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                thomas-lorenz.eu
              </a>
              .
            </p>
          </div>
      </div>
    </div>
  );
}
