import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL, FOUNDER_HOMEPAGE } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { MISTRAL_MODELS } from "@/lib/mistral";

const TITLE = "KI & Transparenz";
const DESCRIPTION =
  "Welche KI Brief-nach-Berlin nutzt, warum die Wahl auf Mistral aus Europa gefallen ist und wie das Tool transparent mit Claude Code als Freizeitprojekt entstanden ist.";
const URL_PATH = "/ki-transparenz";
const PUBLISHED = "2026-05-20";

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
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
    a: `Brief-nach-Berlin generiert die Brief-Entwürfe mit Mistral, einem KI-Anbieter mit Sitz in Paris. Konkret läuft die Textgenerierung über ${MISTRAL_MODELS.letter}, die Inhaltsprüfung über ${MISTRAL_MODELS.moderation}. Die API-Region und Zero-Data-Retention werden vor Aktivierung freiwilliger Themensignale gesondert geprüft.`,
  },
  {
    q: "Warum nicht OpenAI oder ein anderes US-Modell?",
    a: "US-Anbieter unterliegen Gesetzen wie dem CLOUD Act, die US-Behörden Zugriff auf Daten geben können, auch wenn Server in Europa stehen. Für ein Tool, in dem Menschen politische Anliegen formulieren, ist das ein zusätzlicher Risikofaktor. Mistral ist ein europäischer Anbieter; Region, Aufbewahrung und Trainingseinstellungen werden trotzdem getrennt geprüft.",
  },
  {
    q: "Werden meine Eingaben gespeichert?",
    a: "Für die Brief-Erstellung werden dein Anliegen und der generierte Brief nicht in unserer Datenbank gespeichert. Wenn du freiwillig ein Themensignal freigibst, speichern wir daraus nur Kategorien, kurze Themenlabels, PLZ-/Regiondaten und Metadaten — niemals den Brieftext oder dein Anliegen. Mistrals Aufbewahrungs- und Trainingseinstellungen werden vor Aktivierung dieses Opt-ins separat verifiziert.",
  },
  {
    q: "Werden meine Daten für KI-Training verwendet?",
    a: "Mistral beschreibt für API-Daten einen Training-Opt-out. Ob die dafür nötige Einstellung im verwendeten Konto aktiv ist, wird vor Aktivierung freiwilliger Themensignale separat dokumentiert und freigegeben.",
  },
  {
    q: "Wo läuft die App?",
    a: "Die App läuft in einer Frankfurter Hosting-Region. Für KI-Aufrufe nutze ich Mistral; dessen Datenstandort, Subprozessoren und Zero-Data-Retention-Einstellung dokumentiere und prüfe ich separat.",
  },
  {
    q: "Wurde Brief-nach-Berlin mit KI gebaut?",
    a: "Ja, die Entwicklung erfolgte mit Claude Code von Anthropic. Claude läuft aber nicht im Betrieb mit: Deine Eingaben für Routing, Moderation und Brief-Erstellung verarbeitet die Mistral-API.",
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
  publisher: {
    "@type": "Organization",
    name: "Brief-nach-Berlin",
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
            Welche KI ich nutze, und warum aus Europa
          </h1>
          <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
            Wer politische Briefe mit Hilfe von KI schreibt, sollte wissen,
            welche KI da eigentlich mitschreibt. Hier steht es offen.
          </p>

        <Prose>
            <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
              Ich nutze Mistral
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
              Textgenerierung über das Modell <em>{MISTRAL_MODELS.letter}</em>, die
              Inhaltsprüfung über <em>{MISTRAL_MODELS.moderation}</em>. Beide
              Aufrufe gehen direkt an Mistrals API. Die konkrete API-Region,
              Subprozessoren und Zero-Data-Retention prüfe und dokumentiere ich
              vor der Aktivierung freiwilliger Themensignale gesondert.
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
              Recht. Mistral beschreibt für API-Daten einen Training-Opt-out.
              Ob diese separate Einstellung im verwendeten Konto aktiv ist,
              wird zusammen mit Datenstandort und Aufbewahrung vor der
              Aktivierung freiwilliger Themensignale dokumentiert und
              freigegeben.
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
              An Mistral gehen dein Anliegen, gewünschte Tonalität und
              Brieflänge sowie die für den Brief nötigen Empfängerdaten. Wenn
              du freiwillig Name, Partei oder Organisation angibst, werden
              auch diese Angaben für den Entwurf übermittelt. Je nach
              Empfänger können verifizierte politische Kontextinformationen
              hinzukommen. Deine E-Mail-Adresse und deine Nutzer-IP sind kein
              Bestandteil des Mistral-Prompts.
            </p>
            <p>
              Brief-nach-Berlin speichert weder dein Anliegen noch den Brief in
              der Anwendungsdatenbank. Der fertige Entwurf wird über Brevo an
              dein E-Mail-Postfach übertragen und liegt anschließend dort; für
              technische Logs und Vorschauen des E-Mail-Anbieters gelten die in
              der Datenschutzerklärung beschriebenen und vor Livegang zu
              prüfenden Aufbewahrungseinstellungen.
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
              Die Web-Anwendung wird über eine Frankfurter Hosting-Region
              ausgeliefert. Datenbank und KI-Verarbeitung haben eigene
              Anbieter- und Regionseinstellungen; diese stehen transparent in
              der Datenschutzerklärung und werden bei Änderungen separat
              geprüft. Deshalb behaupte ich hier nicht pauschal, dass jede
              technische Verarbeitung ausschließlich in Deutschland erfolgt.
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
              im Betrieb. Wenn du Brief-nach-Berlin benutzt, läuft kein Claude irgendwo
              im Hintergrund mit. Die Architektur und der Code wurden mit Claude
              entwickelt, die laufende KI-Verarbeitung deiner Eingaben erfolgt
              über die Mistral-API. Datenschutzrechtlich sind Entwicklung und
              Produktivbetrieb getrennte Vorgänge: Wie ein Tool gebaut wurde, ist eine andere
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
              Drei Minuten, ein Brief, kein Account. Deine Eingaben werden für
              Routing, Moderation und Brief-Erstellung an Mistral übermittelt. Für eine interne
              Themenauswertung kannst du freiwillig ein Signal freigeben;
              Brief- und Anliegen-Volltext werden dabei nicht gespeichert.
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
