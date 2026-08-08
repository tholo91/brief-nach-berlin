import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { FactCallout } from "@/components/editorial/FactCallout";
import { Figure } from "@/components/editorial/Figure";
import { Prose } from "@/components/editorial/Prose";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FAQAccordion } from "@/components/FAQAccordion";

const URL_PATH = "/kein-mdb-im-wahlkreis";
const PUBLISHED = "2026-07-11";
const TITLE = "Kein MdB im Wahlkreis? So schreibst du trotzdem nach Berlin | Brief nach Berlin";
const DESCRIPTION =
  "Dein Wahlkreis hat gerade kein zugeordnetes MdB? Hier erfährst du, an wen dein Brief geht, warum das passiert und wie du weiter machst.";

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
    q: "Was bedeutet „Kein MdB zugeordnet“?",
    a: "Die Zuordnung zu deinem Wahlkreis ist gerade nicht vollständig. Das kann nach einer Wahl, bei einem Mandatswechsel oder wegen einer Lücke in den öffentlichen Daten vorkommen. Es bedeutet nicht, dass dein Anliegen niemanden im Bundestag erreicht.",
  },
  {
    q: "An wen schreibe ich, wenn mein Wahlkreis kein MdB hat?",
    a: "Schreibe zunächst an eine Abgeordnete oder einen Abgeordneten aus deinem Bundesland, deren oder dessen Arbeit zu deinem Thema passt. Die offizielle Abgeordnetensuche des Bundestages lässt sich nach Bundesland, Wahlkreis und Fraktion filtern.",
  },
  {
    q: "Kann ich den Brief trotzdem abschicken?",
    a: "Ja. Der Briefentwurf bleibt nutzbar. Ersetze die neutrale Empfängerzeile durch den Namen und die Adresse des ausgewählten Bundestagsbüros und passe die Anrede an.",
  },
  {
    q: "Warum wird nicht automatisch ein beliebiges MdB eingesetzt?",
    a: "Ein beliebiger Name würde den Eindruck erwecken, diese Person sei für deinen Wahlkreis zuständig. Die neutrale Zeile macht sichtbar, dass du die Empfängerin oder den Empfänger noch selbst auswählst.",
  },
  {
    q: "Wann ist der Petitionsausschuss die bessere Adresse?",
    a: "Wenn du eine Bitte oder Beschwerde an den Deutschen Bundestag als Institution richten möchtest, kannst du eine Petition einreichen. Ein persönlicher Brief an ein MdB passt besser, wenn du eine politische Person um Stellungnahme, Unterstützung oder eine konkrete Anfrage bittest.",
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
  publisher: { "@type": "Organization", name: "Brief nach Berlin", url: APP_URL },
  url: `${APP_URL}${URL_PATH}`,
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

export default function KeinMdbImWahlkreisPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <Link href="/" className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block">
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          Empfänger finden
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Kein MdB im Wahlkreis? Dein Brief kann trotzdem losgehen.
        </h1>
        <p className="font-body text-lg text-warmgrau/80 leading-relaxed mb-8 text-pretty">
          Wenn deinem Wahlkreis gerade kein MdB zugeordnet ist, schreibe an eine Abgeordnete oder einen Abgeordneten aus deinem Bundesland, die oder der zu deinem Thema passt. Die neutrale Empfängerzeile in deiner Mail ist ein Hinweis, keine Sackgasse. Wähle den Namen und die Adresse vor dem Versand selbst aus.
        </p>

        <Figure
          src="/images/kein-mdb-im-wahlkreis.webp"
          width={1536}
          height={1024}
          alt="Illustration eines Briefs mit dem Hinweis kein Name, einem Wegweiser und dem Bundestag im Hintergrund"
          caption="Kein Name ist kein Endpunkt. Es ist der Moment, den passenden Empfänger selbst auszuwählen."
        />

        <Prose>
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Was mache ich jetzt mit meinem Brief?
          </h2>
          <ol className="list-none space-y-4 pl-0">
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">1. Thema festlegen</span>
              Entscheide, welche Fraktion oder welches Fachgebiet zu deinem Anliegen passt. Bei Gesundheit, Arbeit oder Familie kann ein thematisch zuständiger Ausschuss ein guter Anhaltspunkt sein.
            </li>
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">2. Person auswählen</span>
              Suche auf der offiziellen <a href="https://www.bundestag.de/abgeordnete" target="_blank" rel="noopener noreferrer" className="text-waldgruen hover:underline">Abgeordnetenseite des Bundestages</a> nach Bundesland, Fraktion oder Wahlkreis. So findest du einen realen Empfänger mit einem öffentlichen Bundestagsbüro.
            </li>
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">3. Adresse ersetzen</span>
              Trage Name, Anrede und Postadresse in deinen Entwurf ein. Schreibe kurz dazu, dass du aus dem Wahlkreis kommst, auch wenn die Person dort kein Direktmandat hat.
            </li>
          </ol>

          <FactCallout number="1" label="Eine Person aus deinem Bundesland reicht als konkreter nächster Empfänger." source="Vor dem Versand Namen und Adresse prüfen" />

          <PullQuote decorative>
            Dein Wahlkreis braucht eine Stimme. Dafür muss nicht zwingend ein einzelner Name in der ersten Mail stehen.
          </PullQuote>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Warum gibt es manchmal keinen zugeordneten Namen?
          </h2>
          <p>
            Die Seite arbeitet mit öffentlichen Daten zu Wahlkreisen und Mandaten. Nach einer Bundestagswahl, einem Nachrücken oder einer Aktualisierung können Wahlkreis und Person zeitweise nicht sauber zusammenpassen. Außerdem sitzt in einem Wahlkreis nicht nur die direkt gewählte Person. Weitere Mitglieder können über die Landesliste in den Bundestag eingezogen sein.
          </p>
          <p>
            Ein erfundener oder zufällig eingesetzter Name wäre deshalb irreführend. Die Mail zeigt den offenen Punkt lieber ehrlich an. Du behältst die Entscheidung, wer deinen Brief bekommen soll.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Wann schreibe ich lieber an den Petitionsausschuss?
          </h2>
          <p>
            Ein persönlicher Brief passt, wenn du ein MdB um eine Einschätzung, Unterstützung oder eine politische Anfrage bittest. Wenn du dich mit einer Bitte oder Beschwerde direkt an den Deutschen Bundestag wenden möchtest, ist eine Petition der passende Weg. Das offizielle Portal erklärt den Ablauf und nimmt Petitionen online entgegen.
          </p>
          <p>
            <a href="https://epetitionen.bundestag.de/" target="_blank" rel="noopener noreferrer" className="text-waldgruen hover:underline">Petition beim Deutschen Bundestag einreichen</a>
          </p>
          <p>
            Mehr zum richtigen Empfänger findest du im <Link href="/wahlkreisbuero-oder-berlin" className="text-waldgruen hover:underline">Vergleich von Wahlkreisbüro und Berlin-Büro</Link>. Die Grundlagen zum Brief stehen in der <Link href="/abgeordneten-schreiben" className="text-waldgruen hover:underline">Anleitung für einen Brief an Abgeordnete</Link>.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </Prose>

        <div className="mt-16 bg-creme rounded-xl p-8 text-center">
          <p className="font-body text-lg font-bold text-waldgruen-dark mb-4">Bereit, deinen Brief zu schreiben?</p>
          <Link href="/" className="inline-block bg-waldgruen text-creme font-body font-semibold px-8 py-3 rounded-lg hover:bg-waldgruen-dark transition-colors">
            Brief schreiben
          </Link>
        </div>
      </main>
    </>
  );
}
