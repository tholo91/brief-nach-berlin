import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Figure } from "@/components/editorial/Figure";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";

const TITLE = "Wer darf einem MdB schreiben? Brief an Abgeordnete, Kanzler & Co.";
const DESCRIPTION =
  "Wer darf einem MdB oder dem Bundeskanzler schreiben? Du musst nicht 18 sein, kein deutscher Pass, keine Ahnung von Politik. Art. 17 Grundgesetz gibt jedem Menschen das Recht, sich an Bundestag, Kanzler oder Abgeordnete zu wenden.";
const URL_PATH = "/wer-darf-mdb-schreiben";
const PUBLISHED = "2026-05-26";

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
    q: "Darf ich als Minderjährige oder Minderjähriger einen Brief an einen Abgeordneten schreiben?",
    a: "Ja. Das Petitionsrecht aus Art. 17 GG ist nicht an ein Mindestalter gebunden. Wer sein Anliegen schriftlich formulieren kann, darf schreiben, egal ob 12, 16 oder 80. Eine Unterschrift der Eltern ist nicht nötig.",
  },
  {
    q: "Darf ich als ausländische Staatsangehörige oder ausländischer Staatsangehöriger schreiben?",
    a: "Ja. Art. 17 GG gilt für jeden Menschen, nicht nur für Deutsche. Auch Menschen ohne deutsche Staatsbürgerschaft, Staatenlose und Personen, die im Ausland leben, dürfen sich an deutsche Politik wenden, solange das Anliegen eine deutsche Stelle betrifft.",
  },
  {
    q: "Darf ich den Bundeskanzler persönlich anschreiben?",
    a: "Ja. Briefe an das Bundeskanzleramt landen im Bürgerreferat, werden gelesen, an das zuständige Fachreferat weitergeleitet und in der Regel beantwortet. Adresse: Bundeskanzleramt, Willy-Brandt-Straße 1, 10557 Berlin.",
  },
  {
    q: "Was ist der Unterschied zwischen einem Brief und einer Petition?",
    a: "Ein Brief an eine Abgeordnete oder einen Abgeordneten ist formlos und politisch wirksam, aber rechtlich nicht antwortpflichtig. Eine offizielle Petition beim Petitionsausschuss des Bundestags muss bearbeitet und beschieden werden. Beide Wege sind erlaubt, die Petition ist formaler.",
  },
  {
    q: "Werden anonyme Briefe bearbeitet?",
    a: "Nein. Ohne Absender und Unterschrift gibt es keine inhaltliche Prüfung. Name und Anschrift gehören in jeden Brief. Deine Daten werden vertraulich behandelt.",
  },
  {
    q: "Muss ich wahlberechtigt sein, um zu schreiben?",
    a: "Nein. Wahlrecht und Schreibrecht sind zwei verschiedene Dinge. Du darfst dich auch dann an Politik wenden, wenn du nicht wählen darfst, etwa weil du minderjährig bist oder keinen deutschen Pass hast.",
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

export default function WerDarfSchreibenPage() {
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
          Petitionsrecht
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Wer darf einem MdB schreiben?
        </h1>

        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-2 text-pretty">
          Kurz: jeder Mensch. Kein Mindestalter, kein deutscher Pass, kein
          Wahlrecht nötig. Das Grundgesetz ist hier ungewöhnlich großzügig.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          3 Minuten Lesezeit
        </p>

        <Prose>
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Die kurze Antwort
          </h2>

          <Figure
            src="/images/img-wer-darf-schreiben.webp"
            alt="Fünf Menschen unterschiedlicher Generationen und Herkünfte stehen in einem begrünten Berliner Innenhof, jeder hält einen Brief, die Reichstagskuppel scheint im Hintergrund durch das Laub"
            width={320}
            height={213}
            side="right"
            rotate="left"
          />

          <p>
            Artikel 17 des Grundgesetzes formuliert es so:{" "}
            <em>
              &bdquo;Jedermann hat das Recht, sich einzeln oder in Gemeinschaft
              mit anderen schriftlich mit Bitten oder Beschwerden an die
              zuständigen Stellen und an die Volksvertretung zu wenden.&ldquo;
            </em>{" "}
            <strong>Jedermann</strong>, das heißt: nicht nur Deutsche, nicht
            nur Erwachsene, nicht nur Wahlberechtigte. Jeder Mensch, der sein
            Anliegen schriftlich äußern kann.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Das darfst du, auch wenn du dachtest, dass du es nicht darfst
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                Du bist 14 und ärgerst dich über deine Schule
              </span>
              <span>
                Erlaubt. Es gibt keine Altersgrenze. Eltern müssen nicht
                mitunterschreiben. Bildung ist Ländersache, also schreib an
                deinen Landtag.
              </span>
            </div>
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                Du lebst seit drei Jahren in Berlin, hast aber keinen deutschen
                Pass
              </span>
              <span>
                Erlaubt. Wahlrecht hin oder her, Petitionsrecht gilt für alle
                Menschen. Du darfst Abgeordnete, Minister und auch den
                Bundeskanzler anschreiben.
              </span>
            </div>
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                Du wohnst in Wien und willst der deutschen Klimapolitik
                schreiben
              </span>
              <span>
                Erlaubt. Auch vom Ausland aus, solange dein Anliegen eine
                deutsche Stelle betrifft.
              </span>
            </div>
            <div className="p-4 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
              <span className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 block mb-1">
                Du willst direkt dem Bundeskanzler schreiben
              </span>
              <span>
                Erlaubt. Briefe gehen ans Bürgerreferat im Bundeskanzleramt,
                Willy-Brandt-Straße 1, 10557 Berlin. Sie werden gelesen und in
                der Regel beantwortet.
              </span>
            </div>
          </div>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Wen darfst du anschreiben?
          </h2>

          <Figure
            src="/images/img-vier-ebenen.webp"
            alt="Vier politische Ebenen: Kommune, Landtag, Bundestag, Kanzleramt"
            width={280}
            height={188}
            side="left"
            rotate="right"
          />

          <ul className="space-y-2 pl-5 list-disc">
            <li>
              <strong>Deine MdBs</strong> aus deinem Wahlkreis, der
              Direktkandidat und die Listenabgeordneten deines Bundeslands.
            </li>
            <li>
              <strong>Den Bundeskanzler</strong> oder einzelne
              Bundesministerinnen und Bundesminister.
            </li>
            <li>
              <strong>Den Petitionsausschuss des Bundestags.</strong> Das ist
              der formelle Weg, der eine Bearbeitungspflicht auslöst.
            </li>
            <li>
              <strong>Landtagsabgeordnete</strong> für Themen wie Schule,
              Polizei, Hochschule oder Landeswohnungsbau.
            </li>
            <li>
              <strong>Stadt- und Gemeinderat</strong> für alles, was vor deiner
              Haustür passiert.
            </li>
            <li>
              <strong>Europaabgeordnete</strong> für Datenschutz, Klimaziele,
              Lieferketten und vieles, was wir für nationale Politik halten.
            </li>
          </ul>
          <p>
            Eine Übersicht, welche Ebene wofür zuständig ist, findest du hier:{" "}
            <Link
              href="/kommune-land-bund-eu"
              className="text-waldgruen hover:underline"
            >
              Kommune, Land, Bund, EU – wer ist wofür zuständig?
            </Link>
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Was muss minimal drinstehen?
          </h2>
          <ul className="space-y-2 pl-5 list-disc">
            <li>Dein Name</li>
            <li>Deine Anschrift</li>
            <li>Deine Unterschrift, wenn du auf Papier schreibst</li>
            <li>Dein Anliegen in eigenen Worten</li>
          </ul>
          <p>
            Anonyme Briefe werden nicht bearbeitet. Aber: deine Daten werden
            vertraulich behandelt, sie tauchen nicht öffentlich auf. Wer mehr
            zur Tonalität wissen will, findet hier eine Anleitung:{" "}
            <Link
              href="/abgeordneten-schreiben"
              className="text-waldgruen hover:underline"
            >
              Brief an Abgeordnete schreiben – so geht&apos;s
            </Link>
            .
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Brief oder Petition?
          </h2>
          <p>
            Beides ist erlaubt, beides ist Art. 17 GG. Ein Brief an eine
            einzelne Abgeordnete oder einen einzelnen Abgeordneten ist formlos
            und schnell. Es gibt keine Pflicht zu antworten, in der Praxis tun
            es viele trotzdem. Eine offizielle Petition beim Petitionsausschuss
            des Bundestags muss bearbeitet und beschieden werden. 2024 gingen
            dort 9.260 Petitionen mit 722.639 Mitzeichnungen ein. Beide Wege
            sind nebeneinander offen.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </Prose>

        <div className="mt-16 pt-8 border-t border-waldgruen/15">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-4">
            Quellen
          </p>
          <ul className="space-y-3 font-body text-sm text-warmgrau leading-relaxed">
            <li>
              <a
                href="https://www.gesetze-im-internet.de/gg/art_17.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                Art. 17 Grundgesetz – Wortlaut
              </a>{" "}
              (gesetze-im-internet.de)
            </li>
            <li>
              <a
                href="https://www.bundestag.de/webarchiv/Ausschuesse/ausschuesse19/a02/petitionsrecht_im_grundgesetz-532080"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                Petitionsrecht im Grundgesetz
              </a>{" "}
              (bundestag.de)
            </li>
            <li>
              <a
                href="https://www.bundestag.de/webarchiv/Ausschuesse/ausschuesse19/a02/hinweise-532076"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                Allgemeine Hinweise zum Petitionsverfahren
              </a>{" "}
              (bundestag.de)
            </li>
            <li>
              <a
                href="https://epetitionen.bundestag.de/epet/service.$$$.rubrik.rechtlicheGrundlagen.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                Rechtliche Grundlagen ePetitionen
              </a>{" "}
              (epetitionen.bundestag.de)
            </li>
            <li>
              <a
                href="https://www.bundestag.de/presse/hib/kurzmeldungen-1116464"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                9.260 Petitionen 2024
              </a>{" "}
              (bundestag.de, hib-Meldung)
            </li>
            <li>
              <a
                href="https://www.bundestag.de/resource/blob/1116456/Jahresbericht_Ausgabe_2025.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                Jahresbericht Petitionsausschuss 2024 (PDF, Drs. 21/1900)
              </a>{" "}
              (bundestag.de)
            </li>
            <li>
              <a
                href="https://www.bundeskanzler.de/bk-de/service/kontakt/kontakt-formular/1853246-1853246"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                Bürgerkontakt Bundeskanzleramt
              </a>{" "}
              (bundeskanzler.de)
            </li>
            <li>
              <a
                href="https://www.bundestag.de/services/glossar/glossar/M/mandat-245494"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                Freies Mandat, Art. 38 GG – Glossar
              </a>{" "}
              (bundestag.de)
            </li>
          </ul>
        </div>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl hover:bg-waldgruen/10 transition-colors">
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Du darfst also schreiben. Bleibt nur die Frage, was draufsteht.
            Drei Minuten, kein Account, kein Tracking.
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
            Welche Ebene für welches Thema?{" "}
            <Link
              href="/kommune-land-bund-eu"
              className="text-waldgruen hover:underline"
            >
              Kommune, Land, Bund, EU – wer ist wofür zuständig?
            </Link>
          </p>
          <p>
            Wie ein Brief aufgebaut sein sollte:{" "}
            <Link
              href="/abgeordneten-schreiben"
              className="text-waldgruen hover:underline"
            >
              Brief an Abgeordnete schreiben – so geht&apos;s
            </Link>
            .
          </p>
          <p>
            Warum Brief und nicht E-Mail:{" "}
            <Link
              href="/warum-ein-brief"
              className="text-waldgruen hover:underline"
            >
              Warum ein Brief mehr ist als ein Brief
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
