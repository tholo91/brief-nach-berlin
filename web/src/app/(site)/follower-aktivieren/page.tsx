import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL, DEFAULT_OG_IMAGES } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { FactCallout } from "@/components/editorial/FactCallout";

const URL_PATH = "/follower-aktivieren";
const PUBLISHED = "2026-11-23";
const TITLE =
  "Follower aktivieren: Mit handgeschriebenen Briefen zum Handeln | Brief-nach-Berlin";
const DESCRIPTION =
  "Deine Follower sehen ein Problem und wissen nicht, was sie tun können. Ein handgeschriebener Brief an die Abgeordneten ist ein erster Schritt, der in drei Minuten beginnt.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
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
    q: "Wie kann ich meine Follower zum Handeln bringen?",
    a: "Gib ihnen einen ersten Schritt, den sie allein und sofort gehen können. Ein Brief an die Abgeordnete oder den Abgeordneten aus dem eigenen Wahlkreis braucht keine Demo, keinen Termin und keine Mitgliedschaft. Mit Brief-nach-Berlin legst du eine Kampagne an und teilst den Link. Deine Follower beschreiben ihr Anliegen, bekommen einen Entwurf und schreiben ihn selbst ab.",
  },
  {
    q: "Warum ein handgeschriebener Brief und keine E-Mail oder Petition?",
    a: "Eine Mail ist schnell verschickt und schnell vergessen. Ein handgeschriebener Brief kostet Zeit und zeigt damit, dass jemand es ernst meint. Das ist eine plausible Annahme aus der Forschung zu Costly Signaling, kein direkter Beweis für Briefe an Abgeordnete. Die Studienlage steht auf der Seite zur Wirkung handschriftlicher Briefe.",
  },
  {
    q: "Macht Handschrift Menschen wirklich aktiver?",
    a: "Das wurde nicht direkt untersucht. In der Rückmeldung nach dem Brief sagen 87 Prozent von 510 Antwortenden, sie hätten eher das Gefühl, sich politisch einbringen zu können. Es gab keine Vergleichsgruppe und keine Messung vor dem Brief. Die Zahl zeigt ein Gefühl nach dem Brief, keinen Effekt der Handschrift.",
  },
  {
    q: "Schreiben alle Follower denselben Text?",
    a: "Nein. Die Kampagne gibt das Anliegen vor, jede Person schreibt in eigenen Worten und aus dem eigenen Wahlkreis. Es gibt keinen Textbaustein zum Kopieren. Das schützt vor dem Eindruck eines Serienbriefs und folgt den Kampagnen-Grundsätzen.",
  },
  {
    q: "Was kostet eine Kampagne für Influencer:innen und Organisationen?",
    a: "Das Anlegen einer Kampagne ist kostenlos. Auf der Seite zum Kampagnenstart steht, was du dafür brauchst und wie die Freigabe abläuft.",
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
  url: `${APP_URL}${URL_PATH}`,
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

const linkClass =
  "text-waldgruen underline decoration-waldgruen/30 underline-offset-2 hover:text-waldgruen-dark";

export default function FollowerAktivierenPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <main className="mx-auto max-w-2xl">
        <Link href="/" className="mb-8 inline-block font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark">
          &larr; Zurück
        </Link>

        <p className="mb-3 font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/50">
          Für Influencer:innen und Organisationen
        </p>
        <h1 className="mb-6 font-body text-3xl font-bold tracking-tight text-waldgruen-dark md:text-5xl text-balance">
          Follower aktivieren: vom Zuschauen ins Machen
        </h1>
        <p className="mb-12 font-body text-lg leading-relaxed text-warmgrau/80">
          Deine Community sieht ein Problem und fragt: Und was kann ich tun?
          Ein handgeschriebener Brief an die eigene Abgeordnete ist ein erster
          Schritt, den jede Person allein und sofort gehen kann. Die meisten
          Antwortenden bei Brief-nach-Berlin sagen danach, sie könnten sich
          eher politisch einbringen.
        </p>

        <figure className="mb-14 overflow-hidden rounded-xl border border-waldgruen/10 bg-white shadow-[0_24px_70px_-36px_rgba(45,80,22,0.45)]">
          <Image
            src="/images/img-ngo-briefkampagne.webp"
            alt="Illustration eines Tisches mit handgeschriebenen Briefen, Airmail-Umschlägen und einer Wahlkreiskarte vor einem hellen Fenster"
            width={1368}
            height={770}
            sizes="(min-width: 768px) 672px, calc(100vw - 48px)"
            priority
            className="h-auto w-full"
          />
        </figure>

        <Prose>
          <h2>Was Follower nach deinem Beitrag fehlt</h2>
          <p>
            Ein Video über Wohnungsnot, ein Post zur Klimapolitik, ein Thread
            über die Pflege. Viele sehen das und fühlen mit. Dann scrollen sie
            weiter. Es fehlt kein Interesse, es fehlt ein erster Schritt. Eine
            Demo liegt in einer anderen Stadt, eine Mitgliedschaft ist eine
            große Entscheidung, und eine Petition ist nach dem Klick vorbei.
          </p>
          <p>
            Ein Brief an die Abgeordnete oder den Abgeordneten aus dem eigenen
            Wahlkreis geht allein, von zu Hause und heute Abend. Er braucht
            eine Postleitzahl, ein paar eigene Sätze, Papier und eine
            Briefmarke.
          </p>

          <FactCallout
            number="94 %"
            label="kennen das Gefühl oft oder manchmal: etwas Politisches beschäftigt sie, aber sie wissen nicht, was sie konkret tun können (480 von 513 Antworten)."
            source="Rückmeldungen bei Brief-nach-Berlin, Stand 23.11.2026, freiwillige Angabe"
          />

          <h2>Was Handschrift im Kopf auslöst</h2>
          <p>
            Wer einen Brief von Hand schreibt, braucht länger als für eine
            Nachricht. Man formuliert Satz für Satz, liest mit und schreibt
            ab. Das Tempo sinkt, und der Inhalt wird zum eigenen.
          </p>
          <p>
            Die Forschung dazu ist gemischt. Eine EEG-Studie mit 36
            Studierenden fand beim Schreiben von Hand mehr Verbindungen
            zwischen Hirnregionen als beim Tippen, siehe{" "}
            <a className={linkClass} href="https://doi.org/10.3389/fpsyg.2023.1219945" target="_blank" rel="noreferrer">
              van der Weel und van der Meer (2024)
            </a>
            . Ein Kommentar von{" "}
            <a className={linkClass} href="https://doi.org/10.3389/fpsyg.2024.1517235" target="_blank" rel="noreferrer">
              Pinet und Longcamp
            </a>{" "}
            hält dagegen, dass Handschrift einfach länger dauert und das
            Arbeitsgedächtnis länger fordert. Eine Wiederholung der bekannten
            Notizen-Studie fand{" "}
            <a className={linkClass} href="https://www.psychologicalscience.org/news/releases/no-benefit-handwriting-notes.html" target="_blank" rel="noreferrer">
              keinen Vorteil für handschriftliche Notizen
            </a>
            .
          </p>
          <p>
            Ich lese das so: Ein besseres Gedächtnis durch Handschrift ist
            nicht belegt. Plausibel ist aber, dass der selbst ausgeführte
            Schritt zählt. Wer einen Brief formuliert, unterschreibt und
            einwirft, hat etwas getan. Mehr dazu auf der Seite{" "}
            <Link className={linkClass} href="/handschriftliche-briefe-wirkung">
              Wirken handschriftliche Briefe an Abgeordnete?
            </Link>
            .
          </p>

          <h2>Was Follower nach dem Brief sagen</h2>
          <p>
            Nach dem Brief frage ich: Hast du dadurch eher das Gefühl, dich
            politisch einbringen zu können? Die Antworten von Menschen, die
            tatsächlich geschrieben haben:
          </p>

          <FactCallout
            number="87 %"
            label="antworten mit „Ja, deutlich“ oder „Eher ja“ (445 von 510 Antworten). 237 davon sagen „Ja, deutlich“."
            source="Rückmeldungen bei Brief-nach-Berlin, Stand 23.11.2026, freiwillige Angabe"
          />

          <p>
            Auch bei denen, die das Ohnmachtsgefühl oft oder manchmal kennen,
            ist der Anteil fast gleich: 410 von 467, also 88 Prozent.
          </p>
          <p>
            Die Zahl hat Grenzen. Es antworten nur Menschen, die ihre Meinung
            mitteilen wollten. Es gibt keine Vergleichsgruppe und keine
            Messung vor dem Brief. Sie zeigt ein Gefühl nach dem Schreiben,
            keinen Effekt der Handschrift. Als Hinweis darauf, wie sich der
            erste Schritt anfühlt, taugt sie trotzdem.
          </p>

          <h2>Warum der Brief im Abgeordnetenbüro auffallen kann</h2>
          <p>
            Ein handgeschriebener Brief kostet Zeit. Genau das macht ihn
            glaubwürdig: Wer sich hinsetzt und schreibt, meint es ernst.
            Forschung zu Costly Signaling beschreibt diesen Mechanismus,
            untersucht wurden aber keine Briefe an Abgeordnete. Auch der
            Postkarten-Effekt ist eine Arbeitsthese und kein Studienbefund.
          </p>
          <p>
            Praktisch heißt das: Ein Brief liegt als Papier auf dem Tisch und
            kommt von jemandem aus dem Wahlkreis. Ein Beispiel, wie so ein
            Brief ankam, steht unter{" "}
            <Link className={linkClass} href="/brief-schreiben-wirkt">
              Wie ein echter Brief aus Duisburg Wirkung bekam
            </Link>
            .
          </p>

          <h2>So läuft es für deine Follower</h2>
          <p>
            Du legst eine Kampagne an und teilst den Link. Deine Follower
            beschreiben ihr Anliegen in eigenen Worten und geben ihre
            Postleitzahl ein. Brief-nach-Berlin findet die zuständige
            Vertretung und schreibt einen Entwurf. Den schreiben sie selbst
            ab, unterschreiben ihn und schicken ihn los.
          </p>
          <p>
            Es gibt keinen Textbaustein zum Kopieren. Jede Person bringt ihren
            eigenen Grund mit, und so landen verschiedene Briefe statt einer
            Serienpost im Büro. Die{" "}
            <Link className={linkClass} href="/kampagnen-grundsaetze">
              Kampagnen-Grundsätze
            </Link>{" "}
            und die Seite zur{" "}
            <Link className={linkClass} href="/keine-ki-briefflut">
              KI-Briefflut
            </Link>{" "}
            erklären, warum ich das so halte.
          </p>

          <h2>Für Organisationen und NGOs</h2>
          <p>
            Organisationen haben dieselbe Lage wie Influencer:innen: Die
            Unterstützer:innen sind da, es fehlt ein Schritt zwischen Klick und
            Mitgliedschaft. Eine Briefkampagne gibt ihnen einen gemeinsamen
            Anlass und lässt trotzdem jedem Brief seine eigene Stimme. Wie das
            aussieht, steht unter{" "}
            <Link className={linkClass} href="/ngo-briefkampagne">
              NGO-Briefkampagne
            </Link>
            , und{" "}
            <Link className={linkClass} href="/kampagne-starten">
              hier
            </Link>{" "}
            erkläre ich den Ablauf.
          </p>

          <h2>Und danach?</h2>
          <p>
            Wer einmal geschrieben hat, kennt den Weg. Die nächsten Schritte
            sind kleiner als der erste: noch ein Brief, ein Termin im
            Wahlkreisbüro, ein Besuch im Bundestag. Eine Übersicht gibt die{" "}
            <Link className={linkClass} href="/treppe-der-selbstwirksamkeit">
              Treppe der politischen Selbstwirksamkeit
            </Link>
            .
          </p>
        </Prose>

        <div className="mt-16">
          <h2 className="mb-6 font-body text-xl font-bold text-waldgruen-dark">Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </div>

        <div className="mt-16 rounded-xl bg-white/70 border border-waldgruen/15 p-8 text-center shadow-sm">
          <p className="mb-3 font-body text-lg font-bold text-waldgruen-dark">
            Willst du deine Community ins Handeln bringen?
          </p>
          <p className="mb-6 font-body text-sm leading-relaxed text-warmgrau/75">
            Beschreib dein Anliegen. Daraus entsteht der Einstieg, den deine
            Follower persönlich anpassen können.
          </p>
          <Link
            href="/kampagne/starten"
            className="inline-block rounded-lg bg-waldgruen px-8 py-3 font-body font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
          >
            Kampagne starten
          </Link>
        </div>
      </main>
    </div>
  );
}
