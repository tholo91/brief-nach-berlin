import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";

const TITLE = "Überfordert das die Abgeordneten?";
const DESCRIPTION =
  "Wenn viele Bürger:innen mit KI-Hilfe schreiben, ist das dann nicht zu viel für den Bundestag? Warum handschriftliche Briefe der Bruch in der KI-Kette sind, und warum Lobby-Post längst die Regel ist.";
const URL_PATH = "/keine-ki-briefflut";
const PUBLISHED = "2026-05-21";

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
    q: "Werden Abgeordnete jetzt mit Briefen überschwemmt?",
    a: "Nein. Briefe verteilen sich nach Wahlkreis. Jede:r MdB bekommt also nur Post aus dem eigenen Wahlkreis, nicht aus ganz Deutschland. Das ist genau die Verteilung, die im Grundgesetz so gedacht ist: Wahlkreisarbeit heißt, mit den Leuten zu reden, die einen gewählt haben.",
  },
  {
    q: "Wenn Bürger:innen KI nutzen, antworten Abgeordnete dann auch mit KI?",
    a: "Möglich. Aber die KI-Kette hat bei Brief-nach-Berlin zwei harte Brüche: Der Brief wird per Hand abgeschrieben und per Post verschickt. Wer 150 bis 280 Wörter mit dem Kuli abschreibt, meint das Anliegen ernst. Genau diese Mühe ist das Signal, das durchkommt.",
  },
  {
    q: "Ist das nicht unfair gegenüber der Verwaltung?",
    a: "Lobby-Verbände, Anwaltskanzleien und Interessengruppen schreiben seit Jahrzehnten mit professioneller Unterstützung an den Bundestag. Wenn ein Apparat aufrüstet, ist es eher eine Frage von Waffengleichheit, dass auch einzelne Bürger:innen die Tools bekommen, die der Rest längst nutzt.",
  },
  {
    q: "Warum gibt es kein 'Brief aus Berlin' für Politiker:innen?",
    a: "Weil das die falsche Richtung wäre. Der Punkt von Brief-nach-Berlin ist, dass MdBs ein realistischeres Bild davon bekommen, was Menschen in ihrem Wahlkreis bewegt. Ein Tool, das Massenantworten generiert, würde genau diesen Effekt kaputt machen. Antworten dürfen ruhig handgeschrieben, kurz und persönlich bleiben.",
  },
  {
    q: "Was, wenn am Ende KI mit KI spricht?",
    a: "Genau deshalb der handschriftliche Bruch. Ein KI-Brief, der gedruckt im Postfach landet, sieht aus wie hundert andere. Ein Brief mit unsicheren Buchstaben, durchgestrichenen Stellen und einer persönlichen Anrede sieht aus wie ein Mensch. Letzteres bleibt liegen, ersteres landet im Stapel.",
  },
  {
    q: "Bedeutet 'viele Briefe' nicht weniger Nähe zu jedem Einzelnen?",
    a: "Mehr Briefe heißen mehr Datenpunkte, was Menschen wirklich bewegt. Statt drei sehr lauten Lobby-Stimmen kommt eine breitere Verteilung an. Politiker:innen, die echte Bürgernähe wollen, gewinnen damit, nicht verlieren. Und wenn die Anliegen abgearbeitet werden, nehmen die Briefe wieder ab.",
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

export default function UeberfordertPage() {
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
          Häufige Bedenken
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Überfordert brief-nach-berlin die Abgeordneten?
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
          Eine berechtigte Frage, die in Diskussionen immer wieder kommt: Wenn
          alle mit KI-Hilfe schreiben, kippt das System dann nicht? Hier eine
          ehrliche Antwort.
        </p>

        <Prose>
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Die kurze Antwort
          </h2>
          <p>
            Briefe verteilen sich nach Wahlkreis, also auf 299 Abgeordnete im
            ganzen Land. Wer einen Brief per Hand abschreibt und per Post
            schickt, hat einen klaren Bruch in jeder KI-Kette eingebaut. Und:
            Interessenverbände schreiben dem Bundestag seit Jahrzehnten mit
            professionellem Apparat. Es geht hier um Waffengleichheit, nicht um
            eine neue Flut.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Briefe verteilen sich auf 299 Wahlkreise
          </h2>
          <p>
            Niemand schreibt &laquo;an den Bundestag&raquo;. Wer Brief-nach-Berlin
            nutzt, schreibt an die zwei bis fünf Abgeordneten, die für den
            eigenen Wahlkreis zuständig sind. Das heißt: Die Last verteilt sich
            genau so, wie das Wahlrecht es vorsieht. Eine MdB aus Bremen
            bekommt Post von Menschen aus Bremen, keine bundesweiten
            Massenmails.
          </p>
          <p>
            Wahlkreisarbeit ist nicht der lästige Teil des Jobs, sondern der
            Kern davon. Wer gewählt wird, vertritt einen Ort, nicht eine
            abstrakte Republik. Mehr Briefe aus dem eigenen Wahlkreis heißen
            mehr Material, was die eigenen Wähler:innen gerade bewegt.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Handschrift ist der Bruch in der KI-Kette
          </h2>
          <p>
            Das stärkste Gegenargument lautet: Wenn Bürger:innen mit KI
            schreiben und die Verwaltung mit KI antwortet, reden am Ende
            Maschinen mit Maschinen. Das wäre tatsächlich absurd. Genau deshalb
            ist Brief-nach-Berlin so gebaut, dass die KI-Kette zweimal reißt.
          </p>
          <p>
            Erstens: Der Brief wird nicht versendet, sondern angezeigt. Wer ihn
            tatsächlich loswerden will, muss ihn von Hand abschreiben. 150 bis
            280 Wörter mit dem Kuli, das ist Aufwand. Wer das macht, meint das
            Anliegen ernst. Genau diese Mühe ist das Signal, das durchkommt.
          </p>
          <p>
            Zweitens: Wir rufen ausdrücklich dazu auf, den Entwurf vor dem
            Abschreiben zu personalisieren. Eigene Beispiele, eigene Wörter,
            der eigene Tonfall. Der KI-Entwurf ist Startpunkt, nicht
            Endprodukt. KI-glatte Briefe, die in dieser Form das Paul-Löbe-Haus
            erreichen, gibt es so kaum.
          </p>
          <p>
            Wenn am Ende der Verwaltung trotzdem eine KI-Antwort
            zurückschickt, ist das ihre Entscheidung. Brief-nach-Berlin schiebt
            die Verantwortung dafür dahin zurück, wo sie hingehört.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Lobby-Post ist längst die Regel
          </h2>
          <p>
            In den Postfächern des Bundestages liegen jede Woche professionell
            aufbereitete Stellungnahmen: von Wirtschaftsverbänden,
            Kanzleien, Branchenvereinigungen, NGOs mit eigenem Apparat. Dort
            schreibt schon lange niemand mehr alleine am Küchentisch. Dort
            arbeiten Teams, Vorlagen, Argumentationsdatenbanken, in
            Einzelfällen auch KI.
          </p>
          <p>
            Wer findet, dass Bürger:innen mit KI-Hilfe an ihre MdBs schreiben
            sei unfair, müsste konsequenterweise zuerst über diese Lobby-Post
            reden. Brief-nach-Berlin gibt einzelnen Menschen ein Werkzeug, das
            den professionellen Apparaten näherkommt. Nicht weil das schön
            ist, sondern weil die Asymmetrie sonst bleibt.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Warum es kein &laquo;Brief aus Berlin&raquo; gibt
          </h2>
          <p>
            Eine naheliegende Frage in den Diskussionen: Wenn ihr Bürger:innen
            das Briefeschreiben erleichtert, warum baut ihr nicht auch ein Tool
            für Abgeordnete, das Antworten generiert? Schöner Wortwitz, aber
            klare Antwort: Das wäre die falsche Richtung.
          </p>
          <p>
            Der Punkt von Brief-nach-Berlin ist, dass Politiker:innen wieder
            ein realistischeres Bild bekommen, was die Menschen in ihrem
            Wahlkreis bewegt. Ein Tool, das Antworten generiert, würde genau
            diesen Effekt zerstören. Antworten dürfen ruhig kurz, persönlich
            oder handgeschrieben sein. Sie dürfen auch ausbleiben. Was sie
            nicht sein dürfen: automatisierte Textbausteine, die so tun, als
            wäre jemand gemeint.
          </p>
          <p>
            Wenn ein:e Abgeordnete:r in der Tastatur tippt &laquo;Das nehmen
            wir mit&raquo;, ist das ehrlicher als ein perfekt formulierter
            Standardbrief aus dem Generator. Diese Asymmetrie ist gewollt: Bei
            Bürger:innen senkt KI die Hemmschwelle, sich überhaupt zu melden.
            Bei Politiker:innen wäre sie eine Hemmschwelle weniger, ehrlich zu
            sein.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Ein gutes Ende für Brief-nach-Berlin
          </h2>
          <p>
            Das Ziel ist nicht möglichst viel Masse, sondern eine niedrigere
            Hürde gegen das Ohnmachtsgefühl. Wer das Tool nutzt, soll
            demokratisch ein Stück handlungsfähiger werden, einmal etwas
            geschrieben haben, einen Brief in den Kasten geworfen haben. Das
            ist der Hebel.
          </p>
          <p>
            Und wenn die Themen, die gerade so vielen schreiben lassen,
            tatsächlich angegangen werden, nehmen die Briefe wieder ab. Das
            wäre ein schönes Ende für Brief-nach-Berlin.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </Prose>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl hover:bg-waldgruen/10 transition-colors">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark mb-4">
            Schreib deinen Brief
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Drei Minuten, ein Entwurf, kein Account. Abschreiben und in den
            Kasten werfen. Genau dieser Schritt ist der Bruch in der KI-Kette,
            und genau er macht den Brief lesenswert.
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
            Mehr zur Technik dahinter:{" "}
            <Link
              href="/ki-transparenz"
              className="text-waldgruen hover:underline"
            >
              KI &amp; Transparenz
            </Link>
            . Warum es das Tool überhaupt gibt:{" "}
            <Link
              href="/warum-ein-brief"
              className="text-waldgruen hover:underline"
            >
              Warum ein Brief
            </Link>
            . Und wenn dich das Ohnmachtsgefühl kennt:{" "}
            <Link
              href="/was-tun-gegen-politische-ohnmacht"
              className="text-waldgruen hover:underline"
            >
              Was tun gegen politische Ohnmacht
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
