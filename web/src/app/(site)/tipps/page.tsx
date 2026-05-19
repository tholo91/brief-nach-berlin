import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Tipps für den perfekten Brief | Brief nach Berlin",
  description:
    "Welches Papier, wie die Zeilen gerade bleiben, warum Telefonnummer und E-Mail reingehören und wann es sich lohnt, sofort loszulegen.",
  alternates: {
    canonical: `${APP_URL}/tipps`,
  },
  openGraph: {
    title: "Tipps für den perfekten Brief",
    description:
      "Welches Papier, wie die Zeilen gerade bleiben, warum Telefonnummer und E-Mail reingehören.",
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}/tipps`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tipps für den perfekten Brief",
    description:
      "Welches Papier, wie die Zeilen gerade bleiben, warum Telefonnummer und E-Mail reingehören.",
  },
};

type Tip = {
  n: number;
  title: string;
  body: React.ReactNode;
};

const tips: Tip[] = [
  {
    n: 1,
    title: "Das richtige Papier",
    body: (
      <>
        <p>
          Weißes, unliniertes A4-Papier. Wer kein Briefpapier hat, nimmt
          einfach das aus dem Drucker.
        </p>
        <p className="mt-2">
          Damit die Zeilen gerade bleiben, hilft ein alter Trick: Lege ein
          liniertes Blatt unter das weiße. Die Linien scheinen durch und
          verschwinden, wenn du das Hilfsblatt wieder herausziehst. Im fertigen
          Brief sieht man nichts davon.
        </p>
      </>
    ),
  },
  {
    n: 2,
    title: "Lesbar schreiben",
    body: (
      <>
        <p>Deine Schrift muss nicht schön sein. Sie muss lesbar sein.</p>
        <p className="mt-2">
          Zu klein, zu eng, zu hastig &ndash; und ein Brief, der inhaltlich
          gut ist, landet als Letzter auf dem Stapel. Wer pro Tag dutzende
          Briefe bekommt, freut sich über einen, den man gerne liest. Nimm dir
          Zeit.
        </p>
      </>
    ),
  },
  {
    n: 3,
    title: "Um Rückmeldung bitten",
    body: (
      <>
        <p>
          Handgeschriebene Briefe aus dem Wahlkreis fallen auf. Es kommt vor
          &ndash; öfter als man denkt &ndash; dass Abgeordnete tatsächlich
          antworten: per Brief, manchmal per E-Mail, manchmal sogar per
          Telefon. Besonders wenn das Thema gerade auf der politischen Agenda
          steht.
        </p>
        <p className="mt-2">
          Damit das funktioniert, müssen deine Kontaktdaten im Brief stehen.
          Schreib Telefonnummer und E-Mail-Adresse unter deinen Namen. Je
          einfacher eine Antwort zu schicken ist, desto öfter passiert es.
        </p>
      </>
    ),
  },
  {
    n: 4,
    title: "Briefmarke und Porto",
    body: (
      <p>
        Ein Standardbrief kostet 0,95&nbsp;Euro (Stand 2026). Briefmarken gibt
        es an Postschaltern, an Automaten in Bahnhöfen und Supermärkten, in
        vielen Kiosken und online. Die Deutsche Post bietet auch eine{" "}
        <a
          href="https://www.deutschepost.de/de/m/mobile-briefmarke.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-waldgruen hover:underline"
        >
          mobile Briefmarke
        </a>{" "}
        an &ndash; den Code kaufst du per App und schreibst ihn auf den
        Umschlag.
      </p>
    ),
  },
  {
    n: 5,
    title: "Bei aktuellen Themen schnell absenden",
    body: (
      <>
        <p>
          Wenn dein Anliegen mit einem laufenden Gesetzgebungsverfahren oder
          einer aktuellen Debatte zusammenhängt, zählt jeder Tag. Ein Brief,
          der zwei Tage vor einer Abstimmung ankommt, hat ein anderes Gewicht
          als einer, der eine Woche danach eintrifft.
        </p>
        <p className="mt-2">Schreib ihn heute ab. Heute.</p>
      </>
    ),
  },
];

export default function TippsPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Schreibtipps
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Tipps für den perfekten Brief
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
          Fünf Dinge, die den Unterschied machen &ndash; zwischen einem Brief,
          der gelesen wird, und einem, der es schwer hat.
        </p>

        <nav
          aria-label="Inhaltsverzeichnis"
          className="mb-14 p-5 md:p-6 bg-waldgruen/[0.04] border border-waldgruen/15 rounded-xl"
        >
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Springe zu
          </p>
          <ol className="font-body text-base text-warmgrau space-y-1.5">
            {tips.map((tip) => (
              <li key={tip.n} className="flex gap-3">
                <span
                  aria-hidden
                  className="font-typewriter text-sm font-bold text-waldgruen/70 tabular-nums w-5 shrink-0 pt-0.5"
                >
                  {tip.n}.
                </span>
                <a
                  href={`#tipp-${tip.n}`}
                  className="text-waldgruen-dark hover:text-waldgruen hover:underline underline-offset-4 decoration-waldgruen/40"
                >
                  {tip.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="space-y-12">
          {tips.map((tip) => (
            <li
              key={tip.n}
              id={`tipp-${tip.n}`}
              className="border-l-2 border-waldgruen/20 pl-6 relative scroll-mt-8"
            >
              <span
                aria-hidden
                className="absolute -left-5 top-0 w-9 h-9 rounded-full bg-waldgruen text-creme font-typewriter font-bold flex items-center justify-center shadow-sm"
              >
                {tip.n}
              </span>
              <h2 className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark mb-3 mt-1">
                {tip.title}
              </h2>
              <div className="font-body text-warmgrau leading-relaxed text-base md:text-lg">
                {tip.body}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 p-6 md:p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
          <h2 className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark mb-3">
            Unser Entwurf ist ein Anfang
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Wir formulieren den Brief vor und senken damit die Hürde. Aber lies
            ihn durch und pass an, was sich nicht nach dir anfühlt. Dein Thema,
            deine Formulierungen, deine Unterschrift.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Brief schreiben &rarr;
          </Link>
          <p className="mt-4 font-body text-sm text-warmgrau/60">
            Kostenlos, in drei Minuten, ohne Anmeldung.
          </p>
        </div>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed space-y-3">
          <p>
            Den vollständigen Guide vom Anliegen bis zum Briefkasten gibt es
            unter{" "}
            <Link href="/guide" className="text-waldgruen hover:underline">
              Vom Frust zum Brief im Kasten
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
