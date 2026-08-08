import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FactCallout } from "@/components/editorial/FactCallout";

const URL_PATH = "/brief-schreiben-wirkt";
const PUBLISHED = "2026-07-25";
const TITLE = "Brief schreiben wirkt | Brief nach Berlin";
const DESCRIPTION =
  "Brief schreiben wirkt: Meine Mutter schrieb mit Brief nach Berlin zwei handschriftliche Briefe. Das Büro rief zurück, kam vorbei, ihr Problem wurde gelöst.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: "Brief schreiben wirkt",
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Brief schreiben wirkt",
    description: DESCRIPTION,
  },
};

const faqs = [
  {
    q: "Was hat Brief nach Berlin mit der Geschichte von Thomas' Mutter zu tun?",
    a: "Thomas' Mutter war die erste Nutzerin von Brief nach Berlin. Mit der Seite schrieb sie zwei handschriftliche Briefe zu konkreten Missständen in ihrem Stadtteil Duisburg-Homberg. Das Büro des Bundestagsabgeordneten Mahmut Özdemir meldete sich zurück, die Bezirksvertreterin Steffie Ogaza machte mit ihr eine Ortsbegehung. Die Probleme wurden anschließend angegangen.",
  },
  {
    q: "Kann ein einzelner Brief an Abgeordnete wirklich etwas bewirken?",
    a: "Ja, ein Brief kann ein konkretes Anliegen sichtbar machen und ein Gespräch mit dem Wahlkreisbüro auslösen. Eine Lösung ist nie garantiert. Aber ein persönlicher, handgeschriebener Brief zeigt, dass ein Mensch aus dem Wahlkreis Zeit investiert hat und eine Antwort erwartet.",
  },
  {
    q: "Warum sollte ich meinen Brief handschriftlich schreiben?",
    a: "Ein handschriftlicher Brief fällt zwischen E-Mails und Serienmails auf. Er zeigt Aufwand und bleibt als echtes Stück Papier im Büro. Das macht ihn nicht automatisch erfolgreicher, aber er wird persönlicher wahrgenommen als eine schnelle Nachricht im Postfach.",
  },
  {
    q: "Muss ich viel über Politik wissen, bevor ich schreibe?",
    a: "Nein. Du musst dein Anliegen erklären können. Brief nach Berlin hilft dir, die zuständige Person zu finden und einen klaren Entwurf zu schreiben. Den Brief schreibst du anschließend in deinen eigenen Worten ab.",
  },
  {
    q: "Kann ich auch wegen eines lokalen Problems schreiben?",
    a: "Ja. Viele Anliegen betreffen den Alltag vor Ort. Wichtig ist, die richtige Ebene zu finden: Kommune, Land, Bund oder Europa. Brief nach Berlin hilft dir dabei, damit dein Brief dort ankommt, wo jemand zuständig ist.",
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
  headline: "Brief schreiben wirkt",
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

export default function BriefSchreibenWirktPage() {
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
          Eine echte Geschichte aus Duisburg
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Brief schreiben wirkt. Auch außerhalb des Bildschirms.
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-4 text-pretty">
          Meine Mutter war die erste Nutzerin von Brief nach Berlin. Sie schrieb
          zwei handschriftliche Briefe. Das Bundestagsbüro rief zurück, kam zu
          ihr nach Hause, und ihr Problem wurde gelöst.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          Eine Geschichte, die Brief nach Berlin bestätigt hat
        </p>

        <Prose>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Meine Mutter als erste Userin des Tools
          </h2>
          <p className="first-letter:float-left first-letter:font-body first-letter:text-7xl md:first-letter:text-8xl first-letter:font-bold first-letter:text-waldgruen-dark first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1">
            Meine Mutter wohnt in Duisburg-Homberg, mit Blick auf den Rhein. Als
            Brief nach Berlin zum ersten Mal funktionierte, war sie die erste,
            die es ausprobierte. Ihr Anliegen war ganz praktisch: Es ging um die
            Sauberkeit im Stadtteil. Der Weg, auf dem sie mit ihrem Hund Gassi
            geht, war schon ewig zugewuchert. Am Haus, in dem ihre Wohnung
            liegt, häufte sich immer wieder Dreck an. Und der angrenzende
            Parkplatz diente offenbar als Drogentauschort.
          </p>
          <p>
            Sie schrieb die beiden Entwürfe mit der Hand ab und schickte sie
            los. Einer ging an Mahmut Özdemir, den SPD-Bundestagsabgeordneten
            für Duisburg. Sein Bundestagsbüro rief an und kündigte an, ihre
            Anliegen mit Nachdruck an die zuständigen Behörden vor Ort
            weiterzugeben. Kurz darauf stand die Bezirksvertreterin Steffie
            Ogaza bei ihr vor der Tür und machte eine Ortsbegehung. Beide
            Probleme sind seither in Bewegung. Sogar die Polizei hat sich
            gemeldet und Hilfe angeboten.
          </p>

          <figure className="not-prose my-10 md:my-14 overflow-hidden rounded-sm border border-waldgruen/15 bg-white shadow-xl shadow-waldgruen/10">
            <Image
              src="/images/erste-nutzerin-brief-nach-berlin.webp"
              alt="Illustration: Thomas' Mutter mit einem handgeschriebenen Brief in ihrer Wohnung in Duisburg-Homberg, während eine Mitarbeiterin aus dem Bundestagsbüro zu Besuch kommt"
              width={1376}
              height={768}
              sizes="(max-width: 768px) 100vw, 672px"
              className="w-full h-auto"
            />
            <figcaption className="border-t border-waldgruen/10 px-5 py-3 font-typewriter text-xs uppercase tracking-wider text-warmgrau/60">
              Duisburg-Homberg, mit Blick auf den Rhein
            </figcaption>
          </figure>

          <FactCallout
            number="2"
            label="handschriftliche Briefe schrieb meine Mutter mit Brief nach Berlin. Sie führten zu einem Rückruf, einer Ortsbegehung mit der Bezirksvertreterin Steffie Ogaza und sogar zur Hilfe der Polizei."
            source="Erfahrung aus meiner Familie"
          />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Was ein Brief mit dir selbst macht
          </h2>
          <p>
            Das Beste daran war nicht nur der Rückruf. Meine Mutter fühlte sich
            danach ernst genommen. Sie hatte sich nicht klein gemacht und nicht
            darauf gewartet, dass sich jemand anderes kümmert. Sie hat
            geschrieben, eine Antwort bekommen und gemerkt, dass auf der anderen
            Seite Menschen sitzen.
          </p>

          <PullQuote decorative>
            Andere Leute sollten das auch machen.
          </PullQuote>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Kann ein handschriftlicher Brief an Abgeordnete etwas ändern?
          </h2>
          <p>
            Diese Geschichte ist kein Versprechen, dass jeder Brief ein Problem
            löst. Es gibt keine Garantie für einen Rückruf oder einen Besuch.
            Aber sie zeigt, was möglich wird, wenn ein Anliegen eine Adresse
            bekommt. Ein Brief zwingt dich, es in Worte zu fassen. Im Büro ist
            er ein echter Vorgang, nicht bloß ein weiterer Eintrag im Feed.
          </p>
          <p>
            Die App war für meine Mutter der fehlende erste Schritt. Sie musste
            nicht mehr überlegen, wer zuständig ist oder wie ein Brief anfangen
            soll. Sie konnte sich auf ihr Anliegen konzentrieren. Am Ende war es
            ihr Brief, weil sie ihn selbst abgeschrieben hat.
          </p>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Warum der Brief mit der Hand geschrieben wird
          </h2>
          <p>
            Die Handschrift ist kein Ritual. Sie ist der Moment, in dem du dir
            Zeit für dein Anliegen nimmst. Du liest den Entwurf noch einmal,
            änderst einen Satz, lässt etwas weg oder ergänzt, was nur du wissen
            kannst. Am Ende liegt kein Text von einer Website im Umschlag,
            sondern dein Brief.
          </p>
          <p>
            <Link
              href="/warum"
              className="text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
            >
              Wie aus diesem ersten Versuch Brief nach Berlin wurde, erzähle ich
              auf der Seite über das Projekt.
            </Link>
          </p>
        </Prose>

        <div className="mt-16 border-t border-warmgrau/10 pt-8">
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-4">
            Mehr dazu
          </p>
          <ul className="flex flex-col gap-3">
            <li>
              <Link
                href="/lohnt-sich-brief-an-politiker"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Wirkt ein Brief an Politiker:innen wirklich?
              </Link>
            </li>
            <li>
              <Link
                href="/warum-ein-brief"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Warum ein Brief mehr ist als ein Brief
              </Link>
            </li>
            <li>
              <Link
                href="/guide"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Der Guide: vom Frust zum Brief im Kasten
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-16">
          <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-6">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </div>

        <div className="mt-16 p-8 border-2 border-waldgruen/20 bg-creme/50 rounded-sm text-center">
          <p className="font-body text-lg font-bold text-waldgruen-dark mb-4">
            Schreib deinen Brief.
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
