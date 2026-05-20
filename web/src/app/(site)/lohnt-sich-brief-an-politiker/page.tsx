import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FactCallout } from "@/components/editorial/FactCallout";
import { Figure } from "@/components/editorial/Figure";

const URL_PATH = "/lohnt-sich-brief-an-politiker";
const PUBLISHED = "2026-05-19";
const TITLE =
  "Lohnt es sich, einem Politiker zu schreiben? Was wirklich passiert | Brief nach Berlin";
const DESCRIPTION =
  "Bringt ein Brief an einen Abgeordneten überhaupt etwas? Was im Wahlkreisbüro mit deinem Brief passiert, warum handgeschrieben mehr Gewicht hat als E-Mail oder Petition, und wann es sich besonders lohnt.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: "Lohnt es sich, einem Politiker zu schreiben?",
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Lohnt es sich, einem Politiker zu schreiben?",
    description: DESCRIPTION,
  },
};

const faqs = [
  {
    q: "Wie viele Briefe bekommt eine Abgeordnete oder ein Abgeordneter pro Woche?",
    a: "Das schwankt stark, je nach Themenlage und Bekanntheit. Bürobetreuende berichten typischerweise von einer einstelligen Zahl handgeschriebener Privatbriefe pro Woche, neben Mailings und Massenbriefen, die getrennt sortiert werden. Persönliche, handgeschriebene Briefe sind die seltenste Kategorie und bekommen daher auch die meiste Aufmerksamkeit.",
  },
  {
    q: "Wer liest meinen Brief am Ende?",
    a: "In der Regel zuerst eine wissenschaftliche oder persönliche Mitarbeiterin oder ein Mitarbeiter im Wahlkreis- oder Berliner Büro. Sie sortieren Themen, fassen zusammen und legen einen Stapel mit Antwortvorschlägen vor. Die oder der Abgeordnete sieht in den meisten Büros entweder den Originalbrief oder eine kurze Zusammenfassung.",
  },
  {
    q: "Bringt eine E-Mail nicht das Gleiche?",
    a: "Eine E-Mail erreicht das Büro schneller, hat aber weniger Gewicht. Sie wird in der Regel automatisch nach Thema sortiert und beantwortet, oft mit Textbausteinen. Ein handgeschriebener Brief ist ein physischer Aufwand, den jemand vor sich liegen hat. Das verändert die Aufmerksamkeit.",
  },
  {
    q: "Ist eine Petition nicht wirkungsvoller, weil viele unterschreiben?",
    a: "Petitionen und Briefe wirken anders. Eine Petition signalisiert Breite. Ein Brief signalisiert Tiefe einer einzelnen Person. Beides ergänzt sich. Wer nur Petitionen mitzeichnet, bleibt anonym im Stapel. Wer schreibt, hat einen Namen, eine Adresse, ein Anliegen.",
  },
  {
    q: "Bekomme ich eine Antwort?",
    a: "Häufig ja, aber nicht garantiert. Viele Büros antworten innerhalb von zwei bis sechs Wochen, manche mit Standardtext, manche persönlich. Die Antwort ist nicht der Erfolgsmaßstab. Der Brief wirkt vor allem über die interne Themenstatistik des Büros, und die merkt auch ohne Rückbrief, wenn fünf Briefe zum gleichen Punkt liegen.",
  },
  {
    q: "Lohnt es sich auch, wenn meine Abgeordnete nicht meiner Partei angehört?",
    a: "Ja. Direkt gewählte Abgeordnete vertreten ihren ganzen Wahlkreis, nicht nur die eigenen Wählerinnen und Wähler. Viele nehmen Bürgerpost gerade dann ernst, wenn sie zeigt, dass auch jenseits der eigenen Stammwählerschaft jemand mitliest und sich Mühe macht.",
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
  headline: "Lohnt es sich, einem Politiker zu schreiben?",
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

export default function LohntSichPage() {
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
          Antwort auf eine häufige Frage
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Lohnt es sich, einem Politiker zu schreiben?
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-4 text-pretty">
          Kurz: ja. Vor allem handgeschrieben und aus dem eigenen Wahlkreis.
          Hier ist, was tatsächlich im Büro mit deinem Brief passiert, und
          warum die Wirkung größer ist, als es sich anfühlt.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          5 Minuten Lesezeit
        </p>

        <Prose>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Die kurze Antwort
          </h2>
          <p className="first-letter:float-left first-letter:font-body first-letter:text-7xl md:first-letter:text-8xl first-letter:font-bold first-letter:text-waldgruen-dark first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1">
            Ein Brief an deine Bundestagsabgeordnete oder deinen
            Bundestagsabgeordneten wirkt vor allem dann, wenn er handgeschrieben
            ist, persönlich klingt und aus dem eigenen Wahlkreis kommt. Er
            landet nicht direkt bei der Abgeordneten, sondern auf dem
            Schreibtisch einer Mitarbeiterin oder eines Mitarbeiters, die das
            Thema sortieren, zusammenfassen und vorlegen. Wenn dein Anliegen
            häufiger auftaucht, wandert es in die interne Themenliste des
            Büros und manchmal in Gespräche oder Plenarbeiträge.
          </p>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Was mit deinem Brief im Büro passiert
          </h2>
          <Figure
            src="/images/img-im-buero.webp"
            alt="Aquarell: Schreibtisch in einem Abgeordnetenbüro, ein handgeschriebener Brief im Lichtkegel neben einem Stapel Mailings"
            width={1376}
            height={768}
            side="right"
            rotate="right"
          />
          <p>
            Ein typisches Wahlkreisbüro hat zwei bis fünf Mitarbeitende. Post
            kommt morgens, wird grob nach Thema sortiert und dann gelesen.
            Handgeschriebene Briefe werden fast immer geöffnet, weil sie sich
            optisch von Mailings unterscheiden. Sie sind dünn, eckig, oft mit
            einer einzelnen Briefmarke, und sie haben einen Namen in der Ecke,
            den niemand kennt. Das macht neugierig.
          </p>
          <p>
            Was dann passiert, hängt vom Inhalt ab. Konkrete Anliegen aus dem
            Wahlkreis bekommen häufig einen Antwortentwurf. Komplexe oder
            ungewöhnliche Themen landen in einer wöchentlichen Besprechung mit
            der oder dem Abgeordneten. Mehrere Briefe zum gleichen Thema in
            kurzer Zeit verändern die Themenliste, also das, was im Büro als
            relevant gilt.
          </p>

          <FactCallout
            number="≈ 5"
            label="handgeschriebene Privatbriefe pro Woche bekommt ein typisches Wahlkreisbüro, neben Mailings und E-Mails. Persönliche Post ist die seltenste Kategorie und bekommt daher überproportional viel Aufmerksamkeit."
            source="Berichte aus Wahlkreisbüros"
          />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Brief, E-Mail, Petition: was wirkt wann?
          </h2>
          <p>
            Jedes Format hat eine andere Funktion. Die Wahl hängt davon ab,
            was du erreichen willst.
          </p>
          <p>
            <span className="font-body font-bold text-waldgruen-dark">
              Ein Brief
            </span>{" "}
            ist das Format mit dem höchsten persönlichen Gewicht. Er kommt
            seltener vor, kostet die Schreibende Zeit, und er bleibt im
            Stapel liegen, bis er bearbeitet ist. Ideal, wenn dir das Thema
            persönlich nahegeht und du eine Antwort oder zumindest interne
            Wahrnehmung willst.
          </p>
          <p>
            <span className="font-body font-bold text-waldgruen-dark">
              Eine E-Mail
            </span>{" "}
            ist schneller, aber wird in den meisten Büros automatisch nach
            Thema sortiert und mit Textbausteinen beantwortet. Sie ist
            sinnvoll, wenn du auf eine konkrete Frist reagieren willst,
            etwa vor einer Abstimmung.
          </p>
          <p>
            <span className="font-body font-bold text-waldgruen-dark">
              Eine Petition
            </span>{" "}
            signalisiert Breite. Sie zeigt, dass ein Thema viele Menschen
            betrifft. Petitionen ab 50.000 Mitzeichnungen werden im
            Petitionsausschuss öffentlich behandelt. Sie ersetzt aber keinen
            persönlichen Brief, weil sie anonym bleibt.
          </p>
          <p>
            <span className="font-body font-bold text-waldgruen-dark">
              Social Media
            </span>{" "}
            erreicht Abgeordnete, aber selten in der Tiefe. Eine Erwähnung
            wird gesehen, oft nicht beantwortet, und verschwindet im Feed.
            Sie wirkt eher öffentlich, also als Druck nach außen, weniger
            als interne Position.
          </p>

          <PullQuote decorative>
            Eine Petition signalisiert Breite. Ein Brief signalisiert Tiefe
            einer einzelnen Person.
          </PullQuote>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Warum handgeschrieben mehr Gewicht hat
          </h2>
          <p>
            Eine handgeschriebene Seite kostet etwa zehn bis dreißig Minuten.
            Diese Zeit ist sichtbar im Brief. Sie sieht man an der Schrift,
            am Layout, an der Tatsache, dass jemand sich hingesetzt hat.
            Mailings sehen anders aus. Auch ein gut gemeintes Massenformular
            erkennt das Büro am Layout nach drei Sekunden.
          </p>
          <p>
            Hinzu kommt ein psychologischer Effekt im Büro selbst. Wer
            morgens dreißig Mails wegklickt und dann einen handgeschriebenen
            Brief in der Hand hält, liest langsamer. Das ist kein
            romantisches Detail, sondern eine messbare Verschiebung in der
            Aufmerksamkeit. Die Wirkung ist nicht garantiert, aber
            wahrscheinlicher als bei jedem anderen Format.
          </p>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Wann es sich besonders lohnt
          </h2>
          <p>
            Drei Situationen, in denen ein Brief unverhältnismäßig viel
            bewirkt:
          </p>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              Vor einer Abstimmung, zu einem konkreten Gesetzentwurf. Dann
              steht das Thema sowieso auf der Tagesordnung des Büros, und dein
              Brief bekommt automatisch mehr Gewicht.
            </li>
            <li>
              Bei lokalen Themen, die sonst keine bundespolitische
              Aufmerksamkeit haben. Hier ist deine Stimme oft eine der
              wenigen, die das Büro überhaupt zu diesem Thema erreichen.
            </li>
            <li>
              Wenn mehrere Menschen aus demselben Wahlkreis zum gleichen
              Thema schreiben. Auch ohne Absprache wirkt das, weil die
              interne Themenstatistik des Büros das merkt.
            </li>
          </ul>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Was es dir selbst bringt
          </h2>
          <p>
            Die häufigste Rückmeldung von Menschen, die zum ersten Mal
            geschrieben haben: das Gefühl, etwas Konkretes weggeschickt zu
            haben. Eine Adresse, ein Anliegen, ein Datum. Politische Ohnmacht
            lebt davon, dass man weiß, dass etwas schief läuft, aber keinen
            Adressaten findet. Wer schreibt, hat einen. Das ist schon der
            erste Teil der Wirkung, bevor in Berlin überhaupt jemand den
            Umschlag öffnet.
          </p>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Weiterlesen
          </h2>
          <ul className="space-y-3">
            <li>
              <Link
                href="/was-tun-gegen-politische-ohnmacht"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Was tun, wenn man sich politisch ohnmächtig fühlt?
              </Link>
            </li>
            <li>
              <Link
                href="/warum-ein-brief"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Warum ein Brief mehr ist als ein Brief
              </Link>
            </li>
            <li>
              <Link
                href="/guide"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Der Guide: vom Frust zum Brief im Kasten
              </Link>
            </li>
            <li>
              <Link
                href="/beispiele"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Beispiele aus echten Briefen
              </Link>
            </li>
          </ul>
        </Prose>

        <div className="mt-16 p-8 border-2 border-waldgruen/20 bg-creme/50 rounded-sm">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Wenn du jetzt schreiben willst
          </p>
          <p className="font-body text-lg text-waldgruen-dark mb-6">
            Beschreib dein Anliegen in ein paar Sätzen, gib deine
            Postleitzahl ein, und du bekommst einen Briefentwurf an genau
            die richtige Adresse. Kostenlos, ohne Konto, in unter drei
            Minuten.
          </p>
          <Link
            href="/"
            className="inline-block font-body font-bold text-creme bg-waldgruen-dark hover:bg-waldgruen px-6 py-3 rounded-sm transition-colors"
          >
            Brief schreiben &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
