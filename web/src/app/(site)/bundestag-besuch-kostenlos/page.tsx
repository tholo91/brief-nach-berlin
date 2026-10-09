import Link from "next/link";
import Image from "next/image";
import path from "node:path";
import { existsSync } from "node:fs";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { SectionDivider } from "@/components/editorial/SectionDivider";
import { MdbLookupCard } from "@/components/MdbLookupCard";
import { CopyTextButton } from "@/components/CopyTextButton";

const TITLE = "Kostenlos in den Bundestag: BPA-Fahrt anfragen";
const DESCRIPTION =
  "Dein MdB kann dich kostenlos nach Berlin einladen: Das Bundespresseamt zahlt Fahrt und Hotel. So fragst du an, und so kommst du auch ohne MdB in den Bundestag.";
const URL_PATH = "/bundestag-besuch-kostenlos";
const PUBLISHED = "2026-10-09";

const publicFile = (relative: string) => existsSync(path.join(process.cwd(), "public", relative));
const HERO_IMAGE = "/images/img-bundestag-besuch.webp";
const OG_IMAGE = "/images/og-bundestag-besuch.webp";
const hasHero = publicFile(HERO_IMAGE);
const ogImages = publicFile(OG_IMAGE)
  ? [{ url: `${APP_URL}${OG_IMAGE}`, width: 1200, height: 630 }]
  : undefined;

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
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ogImages?.map((image) => image.url),
  },
};

const faqs = [
  {
    q: "Was bedeutet BPA-Fahrt?",
    a: "BPA steht für das Presse- und Informationsamt der Bundesregierung, kurz Bundespresseamt. Es organisiert und bezahlt Informationsfahrten nach Berlin. Eingeladen wird nicht über das Amt, sondern über das Büro eines Bundestagsabgeordneten.",
  },
  {
    q: "Was kostet eine BPA-Fahrt?",
    a: "Das Bundespresseamt zahlt Hin- und Rückreise, die Übernachtung im Doppelzimmer und einen Teil der Verpflegung. Einzelzimmerzuschlag und Eintrittsgelder zahlst du selbst. Manche Büros erheben einen kleinen Beitrag. Frag im Büro nach, was bei deiner Fahrt gilt.",
  },
  {
    q: "Wer darf mitfahren?",
    a: "Der Abgeordnete lädt politisch interessierte Menschen aus seinem Wahlkreis ein. Du musst mindestens 18 Jahre alt sein. Viele Büros verlangen einen Wohnsitz im Wahlkreis und schließen eine zweite Teilnahme aus. Einen Anspruch auf einen Platz gibt es nicht, das Büro entscheidet.",
  },
  {
    q: "Wie viele Plätze gibt es?",
    a: "Jeder Abgeordnete kann 2026 bis zu drei Gruppen mit je bis zu 50 Personen einladen. Die Fahrten stehen unter dem Vorbehalt ausreichender Haushaltsmittel. Wie viele Plätze bei deinem Abgeordneten frei sind, weiß nur sein Büro.",
  },
  {
    q: "Wann sollte ich nachfragen?",
    a: "Möglichst früh. Die Büros melden Fahrten spätestens zwölf Wochen vor Reisebeginn an, und die Termine für das nächste Jahr stehen oft erst im Spätherbst fest. Einige Büros führen schon vorher Wartelisten. Ein Anruf im Oktober ist deshalb nicht zu früh.",
  },
  {
    q: "Kann ich auch ohne meinen Abgeordneten in den Bundestag?",
    a: "Ja. Plenarsaal und Reichstagskuppel kannst du über den Besucherdienst des Bundestags kostenlos besuchen. Du meldest dich selbst an, auf bundestag.de/besuche oder telefonisch unter 030 227-32152. Die Anmeldung ist Pflicht, die Plätze sind begrenzt. Das Plenum ist nur in Sitzungswochen geöffnet.",
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

const CALL_SCRIPT =
  "Guten Tag, mein Name ist [Name]. Ich wohne in [Ort] und interessiere mich sehr für Politik. Ich habe gelesen, dass [Frau/Herr Name] Bürgerinnen und Bürger zu einer Informationsfahrt nach Berlin einlädt. Kann ich mich dafür vormerken lassen? Und was brauchen Sie dafür von mir?";

const h2 = "font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4 text-balance";

const stepClass = "border-l-2 border-waldgruen/20 pl-6 relative";
const stepBadge =
  "absolute -left-5 top-0 w-9 h-9 rounded-full bg-waldgruen text-creme font-typewriter font-bold flex items-center justify-center shadow-sm";

export default function BundestagBesuchPage() {
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

        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Wie komme ich kostenlos in den Bundestag?
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-4 text-pretty">
          Dein Abgeordneter kann dich im Rahmen einer BPA-Fahrt nach Berlin einladen. Das
          Bundespresseamt zahlt Fahrt, Hotel und einen Teil der Verpflegung. Einen Anspruch darauf
          gibt es nicht, das Büro des Abgeordneten wählt die Gäste aus. Fragen kostet nichts, und
          einige Büros führen schon jetzt Wartelisten für das nächste Jahr.
        </p>
        <p className="font-typewriter text-xs text-warmgrau/60 mb-10">Stand: Oktober 2026</p>
      </div>

      {hasHero ? (
        <div className="max-w-4xl mx-auto mb-14">
          <Image
            src={HERO_IMAGE}
            alt="Eine Abgeordnete spricht vor dem Reichstag mit einer bunt gemischten Gruppe von Bürgerinnen und Bürgern, Ghibli-Illustration"
            width={1600}
            height={900}
            sizes="(max-width: 896px) 100vw, 896px"
            priority
            className="w-full h-auto rounded-2xl shadow-xl shadow-waldgruen/15"
          />
        </div>
      ) : null}

      <div className="max-w-2xl mx-auto">
        <Prose>
          <h2 className={h2}>Zwei Wege in den Bundestag</h2>

          <div className="not-prose grid md:grid-cols-2 gap-4 my-8">
            <div className="rounded-2xl border border-waldgruen/30 bg-waldgruen/5 p-6 ring-1 ring-waldgruen/20">
              <h3 className="font-body text-xl font-bold text-waldgruen-dark mb-1">
                Mit deinem Abgeordneten
              </h3>
              <p className="font-typewriter text-xs text-warmgrau/60 mb-4">BPA-Informationsfahrt</p>
              <ul className="space-y-2 font-body text-sm text-warmgrau">
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>Fahrt, Hotel im Doppelzimmer und ein Teil der Verpflegung sind bezahlt</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>Zwei bis vier Tage Programm in Berlin, je nach Entfernung</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>Du kommst aus dem Wahlkreis und bist mindestens 18</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warmgrau/40 mt-0.5">-</span>
                  <span>Kein Anspruch, die Plätze sind begrenzt</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-warmgrau/20 bg-white/60 p-6">
              <h3 className="font-body text-xl font-bold text-waldgruen-dark mb-1">
                Ohne Abgeordneten
              </h3>
              <p className="font-typewriter text-xs text-warmgrau/60 mb-4">Besucherdienst des Bundestags</p>
              <ul className="space-y-2 font-body text-sm text-warmgrau">
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>Plenarsaal und Reichstagskuppel, kostenlos</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-waldgruen mt-0.5">+</span>
                  <span>
                    Du meldest dich selbst an:{" "}
                    <a
                      href="https://www.bundestag.de/besuche"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-waldgruen hover:underline"
                    >
                      bundestag.de/besuche
                    </a>
                    , Telefon 030 227-32152
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warmgrau/40 mt-0.5">-</span>
                  <span>Anreise und Unterkunft zahlst du selbst</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warmgrau/40 mt-0.5">-</span>
                  <span>Das Plenum ist nur in Sitzungswochen offen, ein Gespräch mit deinem Abgeordneten gehört nicht dazu</span>
                </li>
              </ul>
            </div>
          </div>

          <SectionDivider />

          <h2 className={h2}>So fragst du die BPA-Fahrt an</h2>
          <p>
            Es gibt kein Bewerbungsportal für Bürger. Die Büros buchen die Fahrten selbst, deshalb
            läuft alles über einen Anruf oder eine Mail.
          </p>
        </Prose>

        <ol className="not-prose space-y-10 mt-8 mb-10">
          <li className={stepClass}>
            <span aria-hidden className={stepBadge}>1</span>
            <h3 className="font-body text-xl font-bold text-waldgruen-dark mb-1 mt-1">
              Abgeordneten und Wahlkreisbüro finden
            </h3>
            <p className="font-body text-warmgrau leading-relaxed">
              Gib unten deine Postleitzahl ein. Du bekommst den Namen und die Adresse des
              Wahlkreisbüros. Das Büro im Wahlkreis ist für Anfragen zur Fahrt die richtige Adresse.
            </p>
          </li>
          <li className={stepClass}>
            <span aria-hidden className={stepBadge}>2</span>
            <h3 className="font-body text-xl font-bold text-waldgruen-dark mb-1 mt-1">
              Anrufen oder schreiben
            </h3>
            <p className="font-body text-warmgrau leading-relaxed mb-4">
              Die Telefonnummer steht meist auf der Homepage des Abgeordneten unter Kontakt. Viele
              Büros nehmen Anfragen per Mail oder Formular an, du kannst auch einfach anrufen. Sag,
              wo du wohnst, dass du mitfahren möchtest und zu welcher Zeit es dir passt.
            </p>
            <div className="rounded-xl border border-warmgrau/15 bg-white p-5 shadow-sm">
              <p className="font-handwriting text-xl md:text-2xl leading-snug text-warmgrau mb-4 text-pretty">
                {CALL_SCRIPT}
              </p>
              <CopyTextButton text={CALL_SCRIPT} label="Text kopieren" />
            </div>
          </li>
          <li className={stepClass}>
            <span aria-hidden className={stepBadge}>3</span>
            <h3 className="font-body text-xl font-bold text-waldgruen-dark mb-1 mt-1">
              Vormerken lassen und dranbleiben
            </h3>
            <p className="font-body text-warmgrau leading-relaxed">
              Viele Büros fragen nach Name, Geburtsdatum und Adresse, weil der Bundestag die Namen
              für den Zutritt braucht. Halte außerdem einen Wunschzeitraum bereit. Du landest meist
              auf einer Interessentenliste und wirst später kontaktiert. Hörst du nichts, ruf nach
              ein paar Wochen noch einmal an.
            </p>
          </li>
        </ol>

        <div id="mdb-finden" className="scroll-mt-24 mb-16">
          <MdbLookupCard />
        </div>

        <Prose>
          <h2 className={h2}>Gibt es Wahlkreisveranstaltungen, bei denen ich meinen Abgeordneten treffe?</h2>
          <p>
            Ja. Der Bundestag tagt nur in Sitzungswochen. In den Wochen dazwischen, oft
            Wahlkreiswochen genannt, sind die Abgeordneten zu Hause. Dann laden viele zu
            Bürgersprechstunden und Terminen vor Ort ein, und du erreichst sie, ohne nach Berlin
            zu fahren.
          </p>
          <p>
            Eine zentrale Liste gibt es nicht. Die Termine stehen meist auf der Website des
            Abgeordneten, in dessen Newsletter oder in der Lokalzeitung. Auch ein Anruf im
            Wahlkreisbüro hilft. Welche Wochen sitzungsfrei sind, zeigt der{" "}
            <a
              href="https://www.bundestag.de/parlament/plenum/sitzungskalender"
              target="_blank"
              rel="noopener noreferrer"
              className="text-waldgruen hover:underline"
            >
              Sitzungskalender des Bundestags
            </a>
            . Warum sich so ein Gespräch lohnt, steht auf der{" "}
            <Link href="/treppe-der-selbstwirksamkeit#stufe-6" className="text-waldgruen hover:underline">
              Treppe der Selbstwirksamkeit
            </Link>
            .
          </p>

          <SectionDivider />

          <h2 className={h2}>Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </Prose>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed space-y-3">
          <p>
            Stand: Oktober 2026. Grundlage sind die BPA-Grundsätze für 2026 und die Hinweise des
            Besucherdienstes des Bundestags. Ob 2027 dieselben Regeln gelten, steht erst fest, wenn
            die neuen Grundsätze erscheinen.
          </p>
          <p>
            Mehr dazu:{" "}
            <Link href="/wahlkreisbuero-oder-berlin" className="text-waldgruen hover:underline">
              Berlin-Büro oder Wahlkreisbüro?
            </Link>{" "}
            und{" "}
            <Link href="/aktiv-werden" className="text-waldgruen hover:underline">
              Weitere Wege, aktiv zu werden
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
