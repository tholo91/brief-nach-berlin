import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

const PAGE_PATH = "/osterholz";
const PAGE_TITLE = "Osterholz schreibt mit | Brief-nach-Berlin";
const PAGE_DESCRIPTION =
  "Was sollte sich in deinem Viertel ändern? Brief-nach-Berlin hilft dir, dein Anliegen an die richtige politische Stelle zu bringen.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${APP_URL}${PAGE_PATH}` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${APP_URL}${PAGE_PATH}`,
    type: "website",
    locale: "de_DE",
  },
};

const topics = [
  "Miete und Wohnen",
  "Schule und Kita",
  "Bus und Bahn",
  "Sicherheit und Beleuchtung",
  "Pflege und Gesundheit",
  "Spielplätze und Grünflächen",
];

export default function OsterholzPage() {
  return (
    <div className="osterholz-page overflow-hidden">
      <section className="osterholz-hero px-6 pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="font-typewriter text-sm font-bold uppercase tracking-[0.22em] text-airmail-rot">
              Brief-nach-Berlin × Osterholz
            </p>
            <h1 className="mt-5 max-w-3xl font-typewriter text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-waldgruen-dark md:text-7xl">
              Osterholz
              <br />
              schreibt mit.
            </h1>
            <p className="mt-7 max-w-xl text-xl leading-relaxed text-warmgrau md:text-2xl">
              Was sollte sich in deinem Viertel ändern? Wir helfen dir, dein
              Anliegen an die richtige politische Stelle zu bringen.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-xl bg-waldgruen px-7 py-4 text-center font-body text-lg font-semibold text-creme shadow-[0_10px_25px_rgba(27,67,50,0.16)] transition hover:-translate-y-0.5 hover:bg-waldgruen-dark"
              >
                Anliegen starten <span className="ml-2">→</span>
              </Link>
              <span className="font-body text-sm text-warmgrau/65">
                kostenlos · ohne Anmeldung · in wenigen Minuten
              </span>
            </div>
          </div>

          <div className="osterholz-postcard relative mx-auto w-full max-w-[500px] rotate-[1.5deg]">
            <div className="absolute -right-2 -top-3 z-10 rotate-6 rounded-sm bg-airmail-rot px-3 py-2 font-typewriter text-xs font-bold uppercase tracking-[0.15em] text-creme shadow-md">
              Bremen-Ost
            </div>
            <div className="osterholz-postcard-inner p-7 md:p-10">
              <div className="flex items-start justify-between gap-6 border-b border-warmgrau/15 pb-6">
                <span className="font-typewriter text-2xl font-bold text-waldgruen-dark">
                  Dein Anliegen
                </span>
                <span className="font-typewriter text-right text-xs uppercase tracking-[0.14em] text-warmgrau/55">
                  nicht wegsehen
                  <br />
                  abschicken
                </span>
              </div>
              <p className="mt-8 font-handwriting text-4xl leading-tight text-waldgruen-dark md:text-5xl">
                „Was müsste sich hier ändern, damit unser Alltag besser wird?“
              </p>
              <div className="mt-9 grid grid-cols-2 gap-3 font-typewriter text-xs uppercase tracking-[0.12em] text-warmgrau/60">
                <span className="border-t border-warmgrau/20 pt-2">Ort: Osterholz</span>
                <span className="border-t border-warmgrau/20 pt-2 text-right">Format: Brief</span>
              </div>
            </div>
            <div className="osterholz-postcard-stripe" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="bg-white/60 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <p className="font-typewriter text-sm font-bold uppercase tracking-[0.2em] text-airmail-rot">
              Kein Politikstudium nötig
            </p>
            <h2 className="mt-4 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-5xl">
              Aus einem Gedanken wird ein Brief.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-warmgrau/80">
              Du kennst deinen Alltag. Du weißt, wo es hakt. Brief-nach-Berlin
              hilft dir, daraus ein konkretes Anliegen an die zuständige Stelle
              zu machen.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Erzählen", "Was passiert? Was stört dich? Was sollte sich ändern?"],
              ["02", "Einordnen", "Wir finden heraus, welche politische Ebene zuständig ist."],
              ["03", "Abschicken", "Du bekommst einen persönlichen Brief zum Abschreiben und Versenden."],
            ].map(([number, title, body]) => (
              <article key={number} className="osterholz-step-card">
                <span className="font-typewriter text-sm font-bold tracking-[0.18em] text-airmail-rot">
                  {number}
                </span>
                <h3 className="mt-7 font-typewriter text-2xl font-bold text-waldgruen-dark">
                  {title}
                </h3>
                <p className="mt-3 leading-relaxed text-warmgrau/75">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[0.72fr_1fr] md:items-start">
          <div>
            <p className="font-typewriter text-sm font-bold uppercase tracking-[0.2em] text-airmail-rot">
              Dein Thema
            </p>
            <h2 className="mt-4 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
              Große Politik beginnt oft vor der Haustür.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {topics.map((topic) => (
              <div key={topic} className="flex items-center gap-3 border-b border-warmgrau/12 py-3 text-lg">
                <span className="h-2 w-2 shrink-0 rounded-full bg-airmail-rot" aria-hidden="true" />
                {topic}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-waldgruen-dark px-6 py-16 text-creme md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-typewriter text-sm font-bold uppercase tracking-[0.2em] text-airmail-rot">
              Viele Sprachen. Ein Anliegen.
            </p>
            <h2 className="mt-4 max-w-2xl font-typewriter text-3xl font-bold leading-tight md:text-4xl">
              Du kannst uns auch auf Türkisch, Arabisch oder Englisch ansprechen.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-creme/75">
              Entscheidend ist nicht, ob du Politikbegriffe kennst. Entscheidend
              ist, was dich betrifft.
            </p>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-xl bg-creme px-7 py-4 font-body text-lg font-semibold text-waldgruen-dark transition hover:bg-white"
          >
            Brief beginnen <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      <section className="px-6 py-16 text-center md:py-24">
        <p className="font-handwriting text-4xl text-waldgruen-dark md:text-5xl">
          Deine Stimme muss nicht laut sein.
        </p>
        <h2 className="mt-4 font-typewriter text-3xl font-bold text-waldgruen-dark md:text-5xl">
          Aber sie sollte ankommen.
        </h2>
        <Link
          href="/app"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-waldgruen px-8 py-4 font-body text-lg font-semibold text-creme transition hover:bg-waldgruen-dark"
        >
          Jetzt Anliegen schildern <span className="ml-2">→</span>
        </Link>
      </section>
    </div>
  );
}
