import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Figure } from "@/components/editorial/Figure";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { SectionDivider } from "@/components/editorial/SectionDivider";
import { FactCallout } from "@/components/editorial/FactCallout";

const TITLE = "Warum ein Brief mehr ist als ein Brief";
const DESCRIPTION =
  "Wer einmal einen Brief an seinen Abgeordneten geschrieben hat, gibt seine Stimme nicht mehr nur ab. Er erhebt sie. Über politische Selbstwirksamkeit, das Demokratie-Muskel-Prinzip und warum Lobbyisten gerade auf deine Beteiligung hoffen, dass sie ausbleibt.";
const URL_PATH = "/warum-ein-brief";
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
    q: "Warum ein Brief und keine E-Mail an den Abgeordneten?",
    a: "Eine E-Mail ist billig: Postfächer werden gefiltert, Sekretariate antworten mit Schablonen. Ein Brief liegt physisch auf dem Schreibtisch, wird geöffnet, gelesen, manchmal weitergegeben. Niemand hat einen Spam-Filter für Papier.",
  },
  {
    q: "Was bewirkt ein einzelner Brief wirklich?",
    a: "Direkt vielleicht wenig. Aber er verändert dich: politische Selbstwirksamkeit steigt nachweislich, sobald du einmal eine politische Handlung jenseits des Wählens vollzogen hast. Außerdem kumulieren Briefe in den internen Themenlisten der Abgeordnetenbüros. Zwanzig Briefe aus einem Wahlkreis zum gleichen Thema sind ein politisches Signal.",
  },
  {
    q: "Was ist politische Selbstwirksamkeit?",
    a: "Das Gefühl, dass dein politisches Handeln einen Unterschied macht. Studien aus der politischen Bildung zeigen: Menschen, die einmal über das Wählen hinaus aktiv waren, schätzen ihre Wirksamkeit dauerhaft höher ein und geben weniger schnell auf.",
  },
  {
    q: "Sollte ich nur schreiben, wenn ich Kritik habe?",
    a: "Nein. Auch ein Danke ist ein Brief. Wenn sich eine Abgeordnete für etwas eingesetzt hat, das dir wichtig ist, schreib es ihr, auch wenn ihre Partei nicht deine ist. Lob ist seltener als Kritik und wirkt deshalb stärker.",
  },
  {
    q: "Warum wirken Lobbyisten so viel stärker als Bürger?",
    a: "Weil sie Vollzeit dafür bezahlt werden. In Berlin sind über 5.000 Lobbyisten registriert. Was du als Bürger hast und sie nicht: eine Stimme im Wahlkreis dieses Abgeordneten. Genau darauf reagieren direkt gewählte Abgeordnete besonders empfindlich.",
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

export default function WarumPage() {
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
          Ein Essay
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Warum ein Brief mehr ist als ein Brief
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-4 text-pretty">
          Wer einmal einen Brief an seinen Abgeordneten geschrieben hat, gibt
          seine Stimme nicht mehr nur ab. Er erhebt sie. Und merkt dabei etwas,
          das sich danach schwer wieder vergessen lässt.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          7 Minuten Lesezeit
        </p>

        <Prose>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            &bdquo;Stimme abgeben&ldquo; ist ein verräterisches Wort
          </h2>
          <p className="first-letter:float-left first-letter:font-body first-letter:text-7xl md:first-letter:text-8xl first-letter:font-bold first-letter:text-waldgruen-dark first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1">
            Im Deutschen gehst du wählen und gibst deine Stimme ab. Du legst sie
            weg. Du übergibst sie. Vier Jahre lang gehört sie nicht mehr dir,
            sondern jemand anderem. Allein das Wort beschreibt eigentlich schon,
            was viele danach fühlen: Ohnmacht. Du hast etwas Wertvolles
            weggegeben und bekommst dafür nicht zwangsläufig zurück, was du
            wolltest.
          </p>
          <p>
            Demokratie ist aber kein Pfand-Geschäft. Sie ist ein Verhältnis. Und
            Verhältnisse leben davon, dass beide Seiten sich melden, nicht nur
            an einem Tag im Februar oder September.
          </p>

          <PullQuote decorative>
            Demokratie ist kein Pfand-Geschäft. Sie ist ein Verhältnis.
          </PullQuote>

          <SectionDivider />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Was passiert, wenn du tatsächlich schreibst
          </h2>
          <p>
            Etwas Komisches passiert, sobald du dich hinsetzt und einen Brief
            formulierst. Dein Anliegen wird konkret. Du musst es benennen. Du
            musst entscheiden, wer dafür eigentlich zuständig ist. Du recherchierst
            kurz, wer dein Wahlkreisabgeordneter ist, vielleicht auch, wer im
            Bundestagsausschuss zu diesem Thema sitzt. Du wirst, fast nebenbei,
            informiert.
          </p>
          <p>
            Forscher nennen das, was dabei mit dir passiert, politische
            Selbstwirksamkeit. Das Gefühl, dass dein Handeln einen Unterschied
            macht. Studien aus der politischen Bildung zeigen seit Jahren das
            Gleiche: Menschen, die einmal eine politische Handlung jenseits des
            Wählens vollzogen haben, schätzen ihre eigene Wirksamkeit dauerhaft
            höher ein. Sie tun danach mehr. Sie geben weniger schnell auf. Sie
            sprechen anders im Bekanntenkreis darüber.
          </p>
          <p>
            Der Brief verändert also nicht nur die Welt da draußen, sondern auch
            dich.
          </p>

          <SectionDivider />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Warum gerade Briefe und nicht E-Mails
          </h2>

          <Figure
            src="/images/img-brief-schwebt.webp"
            width={280}
            height={188}
            side="right"
            rotate="left"
          />

          <p>
            Ein Bundestagsabgeordneter bekommt am Tag dutzende, manchmal hunderte
            E-Mails. Die meisten sind Massenversand. Postfächer haben Filter,
            Sekretariate sortieren in Antwortschablonen. Eine Mail ist billig.
            Genau deshalb ist sie wenig wert.
          </p>

          <PullQuote align="right">
            Niemand hat einen Spam-Filter für Papier.
          </PullQuote>

          <p>
            Ein Brief ist anders. Er liegt physisch auf einem Schreibtisch.
            Jemand hat ihn aufgemacht, jemand hat ihn überflogen, vielleicht
            weitergegeben. Wenn er handgeschrieben ist, ist klar: Da hat sich
            jemand zwanzig Minuten hingesetzt, in einer Welt, in der zwanzig
            Minuten teuer sind. In vielen Wahlkreisbüros werden Briefe nach
            Thema und Region sortiert und der Abgeordnete bekommt am Wochenende
            den Stapel.
          </p>
          <p>
            Ich habe selbst im Bundestag gearbeitet. Wir haben Briefe gelesen.
            Wir haben sie besprochen. Manchmal haben sie eine kleine Anfrage
            ausgelöst.
          </p>

          <SectionDivider />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Die Lobbyisten haben Vollzeit dafür. Du nicht.
          </h2>

          <FactCallout
            number="5.000+"
            label="registrierte Lobbyisten in Berlin. Ihr Vollzeitjob: mit Abgeordneten reden."
            source="Lobbyregister des Bundestags"
          />

          <p>
            Sie sind gut. Sie werden dafür bezahlt. Sie haben Zeit. Du hast
            keine Zeit. Aber du hast etwas, das kein Lobbyist hat: eine Stimme
            bei der nächsten Wahl. Genau deine, im Wahlkreis dieses Abgeordneten.
            Wenn ein Abgeordneter zwanzig Briefe aus seinem eigenen Wahlkreis
            zum gleichen Thema bekommt, wird er nervös. Sehr zu Recht. Zwanzig
            Briefe sind oft das, was zwischen einem sicheren und einem knappen
            Direktmandat liegt.
          </p>
          <p>
            Lobbyisten verlassen sich darauf, dass du das nicht weißt. Oder dass
            du es weißt und trotzdem nicht schreibst, weil es sich zu klein
            anfühlt.
          </p>

          <PullQuote>
            Dieses Sich-zu-klein-fühlen ist die wichtigste Ressource jeder
            geschlossenen Politik.
          </PullQuote>

          <SectionDivider />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Auch ein Danke ist ein Brief
          </h2>
          <p>
            Briefe müssen nicht immer Kritik sein. Wenn sich eine Abgeordnete
            für etwas eingesetzt hat, das dir wichtig ist, schreib ihr das.
            Auch dann, wenn du sie nicht gewählt hast und ihre Partei sonst
            nicht deine wäre. Der Job zehrt: Sitzungswochen bis nach
            Mitternacht, Wahlkreis am Wochenende, ein Postfach voller Wut. Ein
            handgeschriebenes Danke fällt aus diesem Stapel heraus und bleibt
            hängen.
          </p>

          <PullQuote>
            Lob ist seltener als Kritik. Genau deshalb wirkt es stärker.
          </PullQuote>

          <SectionDivider />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Demokratie ist ein Muskel
          </h2>
          <p>
            Wer nur alle vier Jahre in die Wahlkabine geht, trainiert seinen
            demokratischen Muskel zwei Mal pro Jahrzehnt. Das reicht nicht, um
            Bewegungen zu spüren. Das reicht nicht, um in der Familie ruhig zu
            erklären, warum dir etwas wichtig ist. Das reicht nicht, um einer
            Schwägerin zu widersprechen, die behauptet, dass &bdquo;eh nichts
            mehr funktioniert&ldquo;.
          </p>
          <p>
            Wer einmal einen Brief geschrieben hat, redet danach anders. Nicht
            lauter, nicht moralischer. Sondern handfester. Du weißt jetzt, an
            wen man sich wendet. Du weißt, wie eine Antwort aus einem
            Abgeordnetenbüro aussieht. Du hast gelernt, dass die Maschine
            Demokratie nicht abstrakt ist, sondern aus Menschen besteht, die in
            Büros sitzen und auf Post reagieren. Mit dieser Erfahrung kannst du
            andere mitnehmen.
          </p>

          <SectionDivider />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Was passiert, wenn 100.000 das Gleiche tun
          </h2>

          <ol className="not-prose grid gap-3 my-4 font-body text-base md:text-lg">
            {[
              { n: "1", text: "Brief", mean: "ist ein Brief." },
              { n: "100", text: "Briefe", mean: "sind eine Sortier-Aufgabe." },
              { n: "1.000", text: "Briefe", mean: "sind eine Pressemitteilung." },
              { n: "10.000", text: "Briefe", mean: "sind eine Bewegung, der niemand ausweichen kann." },
            ].map((row) => (
              <li
                key={row.n}
                className="grid grid-cols-[5rem_1fr] md:grid-cols-[6rem_1fr] items-baseline gap-x-4 border-l-2 border-waldgruen/20 pl-4"
              >
                <span className="font-body text-2xl md:text-3xl font-bold text-waldgruen tabular-nums">
                  {row.n}
                </span>
                <span className="text-warmgrau">
                  <strong className="text-waldgruen-dark">{row.text}</strong> {row.mean}
                </span>
              </li>
            ))}
          </ol>

          <p>
            Die Frage ist nicht, ob ein einzelner Brief die Welt rettet. Die
            Frage ist, ob du den Mut hast, der erste in deinem Bekanntenkreis zu
            sein, der schreibt.
          </p>

          <SectionDivider />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </Prose>

        <div className="mt-20 p-8 md:p-10 bg-waldgruen/5 border border-waldgruen/15 rounded-2xl hover:bg-waldgruen/10 transition-colors">
          <p className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 mb-3">
            Worauf wartest du?
          </p>
          <p className="font-body text-warmgrau leading-relaxed mb-6 text-lg">
            Drei Minuten, kein Account, kein Tracking. Wir schicken dir den
            fertigen Brief per Mail, du schreibst ihn ab und steckst ihn in den
            Briefkasten.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Mit deinem Brief anfangen &rarr;
          </Link>
        </div>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed">
          <p>
            Wenn du danach noch eine Stufe weiter willst, gibt es{" "}
            <Link
              href="/treppe-der-selbstwirksamkeit"
              className="text-waldgruen hover:underline"
            >
              die Treppe der politischen Selbstwirksamkeit
            </Link>{" "}
            mit zehn weiteren Stufen.
          </p>
        </div>
      </div>
    </div>
  );
}
