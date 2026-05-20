import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { FAQAccordion } from "@/components/FAQAccordion";
import {
  APP_URL,
  FOUNDER_LINKEDIN,
  FOUNDER_FEEDBACK_URL,
  SHARE_URL_WHATSAPP,
  SHARE_URL_TELEGRAM,
  SHARE_URL_EMAIL,
  SHARE_URL_LINKEDIN,
} from "@/lib/config";

const TITLE = "Brief nach Berlin weitersagen";
const DESCRIPTION =
  "Briefe wirken stärker, wenn mehrere Stimmen aus derselben Gegend zum gleichen Thema schreiben. Hier findest du fertige Texte für WhatsApp, einen druckbaren QR-Code und alles, was du brauchst, um Brief nach Berlin im Bekanntenkreis oder in der Nachbarschaft zu teilen.";
const URL_PATH = "/weitersagen";
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
    q: "Warum hat es mehr Wirkung, wenn mehrere Leute schreiben?",
    a: "Briefe aus dem gleichen Wahlkreis zum gleichen Thema bekommen im Büro einer oder eines Abgeordneten besonderes Gewicht. Aus zwei oder drei Briefen wird ein Muster, aus einem Muster wird ein Anliegen, das im Wahlkreisbüro auf den Tisch landet. Eine Stimme allein ist leicht zu überhören, fünf Stimmen aus derselben Gegend sind es nicht.",
  },
  {
    q: "Was schreibe ich am besten in die WhatsApp-Nachricht?",
    a: "Du musst gar nichts schreiben. Über den WhatsApp-Knopf weiter oben öffnet sich eine fertige Nachricht, die du nur noch verschicken musst. Du kannst sie natürlich vorher anpassen, ein persönlicher Satz davor hilft fast immer.",
  },
  {
    q: "Wie nutze ich den QR-Code sinnvoll?",
    a: "Drucke ihn auf einen kleinen Flyer, klebe ihn ans schwarze Brett im Hausflur oder zeige ihn am Stammtisch. Wer den Code scannt, landet direkt auf der Startseite und kann sofort einen eigenen Brief schreiben. Der Code funktioniert mit jeder Handy-Kamera, keine App nötig.",
  },
  {
    q: "Kann ich Flyer oder Plakate bekommen, wenn ich kein Design machen will?",
    a: "Ja. Wenn du ein Treffen veranstaltest, einen Stand auf einem Markt machst oder im Verein Material brauchst, melde dich kurz. Ich gestalte das gerne mit, das Projekt ist auf Mund-zu-Mund angewiesen und jede Aktion hilft.",
  },
  {
    q: "Sammelt ihr Daten, wenn ich den Link weiterleite?",
    a: "Nein. Die Links sind reine Weiterleitungen über deinen Messenger. Brief nach Berlin bekommt keine Information darüber, an wen du was geschickt hast. Auch die Plattform selbst speichert keine Briefe und keine Adressen.",
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

export default function WeitersagenPage() {
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
          Mund zu Mund
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Brief nach Berlin weitersagen
        </h1>

        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-2 text-pretty">
          Ein Brief allein ist gut. Drei Briefe aus derselben Straße sind ein
          Anliegen, das im Wahlkreisbüro nicht mehr übersehen wird.
        </p>

        <div className="font-body text-warmgrau leading-relaxed space-y-3 mb-12">
          <p>
            Briefe aus dem gleichen Wahlkreis zum gleichen Thema bekommen im
            Büro einer oder eines Abgeordneten besonderes Gewicht. Wenn du
            Brief nach Berlin gut findest, ist eine kurze Nachricht an drei
            Bekannte oft der wirksamste nächste Schritt, den du machen kannst.
          </p>
          <p>
            Hier findest du fertige Nachrichten, einen druckbaren QR-Code und
            einen direkten Draht zu mir, wenn du Material für eine eigene
            Aktion brauchst.
          </p>
        </div>

        {/* WhatsApp & andere Messenger */}
        <section className="mb-12">
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark mb-2">
            In einer Minute weitergeben
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Tipp auf einen Knopf, fertige Nachricht öffnet sich, du schickst
            sie an die Person oder die Gruppe deiner Wahl. Du kannst den Text
            vorher noch anpassen.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={SHARE_URL_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 bg-white border border-waldgruen/15 rounded-xl px-5 py-4 hover:border-waldgruen/40 hover:shadow-md transition-all"
            >
              <span className="font-body font-semibold text-waldgruen-dark">
                WhatsApp
              </span>
              <span className="font-typewriter text-xs uppercase tracking-wider text-warmgrau/60">
                Öffnen &rarr;
              </span>
            </a>
            <a
              href={SHARE_URL_TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 bg-white border border-waldgruen/15 rounded-xl px-5 py-4 hover:border-waldgruen/40 hover:shadow-md transition-all"
            >
              <span className="font-body font-semibold text-waldgruen-dark">
                Telegram
              </span>
              <span className="font-typewriter text-xs uppercase tracking-wider text-warmgrau/60">
                Öffnen &rarr;
              </span>
            </a>
            <a
              href={SHARE_URL_EMAIL}
              className="flex items-center justify-between gap-3 bg-white border border-waldgruen/15 rounded-xl px-5 py-4 hover:border-waldgruen/40 hover:shadow-md transition-all"
            >
              <span className="font-body font-semibold text-waldgruen-dark">
                E-Mail
              </span>
              <span className="font-typewriter text-xs uppercase tracking-wider text-warmgrau/60">
                Öffnen &rarr;
              </span>
            </a>
            <a
              href={SHARE_URL_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 bg-white border border-waldgruen/15 rounded-xl px-5 py-4 hover:border-waldgruen/40 hover:shadow-md transition-all"
            >
              <span className="font-body font-semibold text-waldgruen-dark">
                LinkedIn
              </span>
              <span className="font-typewriter text-xs uppercase tracking-wider text-warmgrau/60">
                Öffnen &rarr;
              </span>
            </a>
          </div>
        </section>

        {/* QR-Code */}
        <section className="mb-12 bg-white border border-waldgruen/15 rounded-xl p-6 md:p-8 shadow-sm">
          <p className="font-typewriter text-xs uppercase tracking-wider text-warmgrau/60 mb-2">
            Zum Ausdrucken
          </p>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark mb-2">
            QR-Code fürs schwarze Brett
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Druck ihn auf einen Flyer, kleb ihn in den Hausflur, zeig ihn am
            Stammtisch oder beim Marktstand. Jede Handy-Kamera erkennt ihn,
            keine App nötig.
          </p>

          <div className="flex flex-col items-center gap-5">
            <div className="bg-creme rounded-lg p-4 border border-waldgruen/10">
              <Image
                src="/images/qr-brief-nach-berlin.png"
                alt="QR-Code mit Link zu brief-nach-berlin.de"
                width={320}
                height={320}
                className="w-64 h-64 md:w-72 md:h-72"
                priority
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <a
                href="/images/qr-brief-nach-berlin.png"
                download="brief-nach-berlin-qr.png"
                className="flex-1 text-center bg-waldgruen text-creme font-body font-semibold px-5 py-3 rounded-xl hover:bg-waldgruen-dark transition-colors"
              >
                Web-Version laden (PNG)
              </a>
              <a
                href="/images/qr-brief-nach-berlin-print.png"
                download="brief-nach-berlin-qr-print.png"
                className="flex-1 text-center bg-white border border-waldgruen text-waldgruen-dark font-body font-semibold px-5 py-3 rounded-xl hover:bg-waldgruen/5 transition-colors"
              >
                Druck-Version laden (2048&times;2048)
              </a>
            </div>
            <p className="font-typewriter text-xs text-warmgrau/60 text-center">
              Beide Versionen zeigen auf {APP_URL.replace("https://", "")}
            </p>
          </div>
        </section>

        {/* Kontakt: Flyer, Material, Hilfe */}
        <section className="mb-14 bg-waldgruen/5 border border-waldgruen/15 rounded-xl p-6 md:p-8">
          <p className="font-typewriter text-xs uppercase tracking-wider text-warmgrau/60 mb-2">
            Du brauchst mehr?
          </p>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark mb-3">
            Flyer, Plakate, Workshop?
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-5">
            Wenn du eine Veranstaltung machst, einen Stand auf dem Markt
            betreust, im Verein Material brauchst oder eine eigene Aktion
            planst: schreib mir kurz. Ich gestalte das gerne mit. Brief nach
            Berlin lebt davon, dass Menschen es weitersagen, also kostet dich
            das nichts und mich freut jede Nachricht.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={FOUNDER_FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-waldgruen text-creme font-body font-semibold px-5 py-3 rounded-xl hover:bg-waldgruen-dark transition-colors"
            >
              Sprachnachricht an Thomas
            </a>
            <a
              href={FOUNDER_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-white border border-waldgruen text-waldgruen-dark font-body font-semibold px-5 py-3 rounded-xl hover:bg-waldgruen/5 transition-colors"
            >
              Direkt auf LinkedIn
            </a>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark mb-6">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
          <div className="mt-8 font-body text-sm text-warmgrau/70 leading-relaxed space-y-2">
            <p>
              Weiterlesen:{" "}
              <Link
                href="/aktiv-werden"
                className="text-waldgruen hover:underline"
              >
                Was du nach deinem ersten Brief sonst noch tun kannst
              </Link>
            </p>
            <p>
              Oder:{" "}
              <Link
                href="/lohnt-sich-brief-an-politiker"
                className="text-waldgruen hover:underline"
              >
                Lohnt es sich, einem Politiker zu schreiben?
              </Link>
            </p>
          </div>
        </section>

        <div className="p-8 bg-white border border-waldgruen/15 rounded-xl hover:shadow-md transition-shadow">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark mb-4">
            Noch keinen eigenen Brief geschrieben?
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Der eigene Brief ist immer das beste Argument, wenn du andere
            mitnimmst. In unter drei Minuten ist er fertig.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Brief schreiben &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
