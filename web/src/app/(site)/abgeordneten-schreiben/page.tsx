import Link from "next/link";
import { Figure } from "@/components/editorial/Figure";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

const TITLE = "Brief an Abgeordneten schreiben: So geht's";
const DESCRIPTION =
  "Wie schreibe ich meinem Abgeordneten? Anrede, Länge, Handschrift oder Druck, Bundestag oder Landtag: diese Anleitung erklärt alle Schritte in unter drei Minuten.";
const URL_PATH = "/abgeordneten-schreiben";
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
    q: "Wie schreibe ich einen Brief an einen Abgeordneten?",
    a: "Beginne mit der Anrede (Sehr geehrte Frau/Sehr geehrter Herr [Nachname]), nenne dein Anliegen im ersten Satz, erkläre kurz deinen persönlichen Bezug, formuliere ein konkretes Ziel (Stellungnahme, Anfrage, Antwort) und schließe mit Gruß, Namen und Adresse. Eine handgeschriebene Seite mit 200 bis 280 Wörtern ist die richtige Länge.",
  },
  {
    q: "Wie lang sollte der Brief sein?",
    a: "Eine handgeschriebene Seite, etwa 200 bis 280 Wörter. Lang genug, um ernst genommen zu werden. Kurz genug, um vollständig gelesen zu werden. Drei Seiten riskieren, dass der Kern untergeht.",
  },
  {
    q: "Handschriftlich oder gedruckt?",
    a: "Wenn möglich handschriftlich. Ein handgeschriebener Brief signalisiert, dass jemand aus dem Wahlkreis sich zwanzig Minuten genommen hat. Gedruckte Briefe wirken wie Kampagnen oder Massenversand. Getippt und ausgedruckt ist trotzdem besser als gar nicht zu schreiben.",
  },
  {
    q: "An welchen Abgeordneten schreibe ich, Bundestag oder Landtag?",
    a: "Bundestag (MdB) für bundesweite Themen: Sozialpolitik, Steuern, Außenpolitik, Einwanderungsrecht. Landtag (MdL) für Landesthemen: Schulen, Polizei, Wohnungspolitik. Kommunalpolitik für alles vor deiner Haustür: Spielplätze, Straßen, Kita-Plätze.",
  },
  {
    q: "Brauche ich Vorwissen oder Jura-Kenntnisse?",
    a: "Nein. Ein Brief an einen Abgeordneten erfordert kein Vorwissen, kein Jura-Studium und keine Mustervorlage. Du brauchst nur ein konkretes Anliegen und ein Blatt Papier.",
  },
  {
    q: "Muss ich meine Adresse angeben?",
    a: "Ja, wenn du eine Antwort möchtest und damit dein Brief als Wahlkreis-Post erkennbar ist. Direkt gewählte Abgeordnete nehmen Post aus dem eigenen Wahlkreis besonders ernst.",
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

export default function AbgeordnetenSchreibenPage() {
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
            Anleitung
          </p>
          <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
            Brief an Abgeordneten schreiben: So geht&apos;s
          </h1>

          <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-2 text-pretty">
            Einen Brief an einen Abgeordneten zu schreiben klingt nach mehr
            Aufwand, als es ist. Du brauchst kein Vorwissen, kein Jura-Studium und
            keine Mustervorgabe. Du brauchst nur ein konkretes Anliegen und ein
            Blatt Papier.
          </p>
          <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
            3 Minuten Lesezeit
          </p>

        <Prose>
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Was gehört in einen Brief an den Abgeordneten?
          </h2>

          <Figure
            src="/images/img-brief-schwebt.webp"
            width={280}
            height={188}
            side="right"
            rotate="left"
          />

          <p>
            Ein guter Brief ist kurz und ehrlich. Kein akademisches Rundschreiben,
            keine Petition mit drei Seiten Forderungen. Das hier ist die Struktur,
            die tatsächlich gelesen wird:
          </p>

          <ul className="list-none space-y-4 pl-0">
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                1. Anrede
              </span>
              <span>
                &bdquo;Sehr geehrte Frau [Nachname]&ldquo; oder &bdquo;Sehr
                geehrter Herr [Nachname]&ldquo;. Kein Akademiker-Titel nötig,
                aber schaden tut er nicht.
              </span>
            </li>
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                2. Dein Anliegen in einem Satz
              </span>
              <span>
                Was stört dich, was wünschst du dir, was läuft schief? Direkt
                und ohne Einleitung. Der erste Satz entscheidet, ob der Brief
                weitergelesen wird.
              </span>
            </li>
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                3. Persönlicher Bezug
              </span>
              <span>
                Erkläre kurz, warum das Thema dich betrifft: als Anwohnerin,
                als Vater, als Lehrerin, als jemand, der täglich mit diesem
                Problem lebt. Das macht den Unterschied zu einer anonymen Mail.
              </span>
            </li>
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                4. Konkretes Ziel
              </span>
              <span>
                Was erhoffst du dir? Eine Stellungnahme, eine Anfrage im
                Ausschuss, eine Antwort? Je konkreter, desto einfacher ist es
                für das Büro, zu reagieren.
              </span>
            </li>
            <li className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                5. Schluss
              </span>
              <span>
                &bdquo;Mit freundlichen Grüßen&ldquo;, dein Name, deine Adresse
                (damit eine Antwort möglich ist). Kein langer Abschluss nötig.
              </span>
            </li>
          </ul>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Wem schreibe ich eigentlich?
          </h2>
          <p>
            <strong>Bundestag:</strong> Gesetze für ganz Deutschland.
            Sozialpolitik, Außenpolitik, Bundeshaushalt, Einwanderungsrecht. Hier
            ist dein Wahlkreisabgeordneter (MdB) die richtige Adresse.
          </p>
          <p>
            <strong>Landtag:</strong> Was im Bundesland geregelt wird.
            Schulen, Polizei, Landesbehörden, Wohnungspolitik. Hier ist dein
            Mitglied des Landtags (MdL) zuständig.
          </p>
          <p>
            <strong>Gemeinderat oder Stadtrat:</strong> Alles, was direkt vor
            deiner Tür passiert. Spielplätze, Straßen, Kita-Plätze, lokale
            Bebauungspläne. Dazu gibt es eine eigene Seite:{" "}
            <Link
              href="/kommunalpolitik-brief"
              className="text-waldgruen hover:underline"
            >
              Brief an Stadtrat oder Gemeinderat schreiben
            </Link>
            .
          </p>
          <p>
            Brief nach Berlin findet über deine Postleitzahl automatisch die
            zuständigen Abgeordneten für Bundestag und Landtag.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Wie lang sollte der Brief sein?
          </h2>
          <p>
            Eine handgeschriebene Seite, ungefähr 200 bis 280 Wörter. Das ist
            die goldene Mitte. Lang genug, um ernst genommen zu werden. Kurz
            genug, um vollständig gelesen zu werden. Wer auf drei Seiten alles
            ausführt, riskiert, dass der Kern untergeht.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Handschriftlich oder gedruckt?
          </h2>
          <p>
            Handschriftlich, wenn irgend möglich. Nicht weil es schöner aussieht,
            sondern weil es Zeit kostet. Und das merkt man. Ein gedruckter Brief
            könnte von einer Kampagne kommen. Ein handgeschriebener Brief kommt
            von einer Person aus dem Wahlkreis, die sich zwanzig Minuten genommen
            hat. Getippt und ausgedruckt ist trotzdem besser als gar nicht.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </Prose>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl hover:bg-waldgruen/10 transition-colors">
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Drei Minuten, kein Account, kein Tracking. Wir finden den richtigen
            Abgeordneten für deine Postleitzahl und schlagen dir einen Brief vor,
            den du selbst abschreibst und verschickst.
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
            Warum ein Brief mehr bewirkt als eine E-Mail oder Petition:{" "}
            <Link
              href="/warum-ein-brief"
              className="text-waldgruen hover:underline"
            >
              Warum ein Brief mehr ist als ein Brief
            </Link>
            .
          </p>
          <p>
            Wenn dein Anliegen eher ein kommunales Thema ist:{" "}
            <Link
              href="/kommunalpolitik-brief"
              className="text-waldgruen hover:underline"
            >
              Brief an Stadtrat oder Gemeinderat schreiben
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
