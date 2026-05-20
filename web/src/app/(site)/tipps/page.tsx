import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Figure } from "@/components/editorial/Figure";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";

const TITLE = "Tipps für den perfekten Brief";
const DESCRIPTION =
  "Welches Papier, wie die Zeilen gerade bleiben, warum Telefonnummer und E-Mail reingehören und wann es sich lohnt, sofort loszulegen.";
const URL_PATH = "/tipps";
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
    q: "Welches Papier soll ich für einen handgeschriebenen Brief nehmen?",
    a: "Weißes, unliniertes A4-Papier reicht. Wer kein Briefpapier hat, nimmt einfach Druckerpapier. Damit die Zeilen gerade bleiben, kann man ein liniertes Blatt unterlegen, die Linien scheinen durch und verschwinden, wenn man das Hilfsblatt herauszieht.",
  },
  {
    q: "Muss meine Handschrift schön sein?",
    a: "Nein, sie muss nur lesbar sein. Zu klein, zu eng oder zu hastig riskiert, dass selbst ein inhaltlich guter Brief untergeht. Nimm dir Zeit beim Schreiben.",
  },
  {
    q: "Soll ich Telefonnummer und E-Mail in den Brief schreiben?",
    a: "Ja. Je einfacher eine Antwort zu schicken ist, desto öfter passiert es. Schreib Telefonnummer und E-Mail unter deinen Namen, damit das Abgeordnetenbüro dich auch ohne Briefantwort erreichen kann.",
  },
  {
    q: "Was kostet ein Standardbrief in Deutschland?",
    a: "0,95 Euro (Stand 2026). Briefmarken gibt es an Postschaltern, an Automaten in Bahnhöfen und Supermärkten, in Kiosken und online. Die Deutsche Post bietet auch eine mobile Briefmarke, die per App gekauft und als Code auf den Umschlag geschrieben wird.",
  },
  {
    q: "Wann sollte ich den Brief abschicken?",
    a: "Sofort, wenn dein Anliegen mit einer laufenden Debatte oder einem aktuellen Gesetzgebungsverfahren zusammenhängt. Ein Brief zwei Tage vor einer Abstimmung wirkt anders als einer eine Woche danach.",
  },
  {
    q: "Soll ich auch positives Feedback an Abgeordnete schicken?",
    a: "Ja. Kritik kommt jeden Tag, Lob fast nie. Ein handgeschriebenes Danke fällt aus dem Postfach heraus und bleibt hängen, auch wenn du eine andere Partei gewählt hast.",
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
          Zu klein, zu eng, zu hastig, und ein Brief, der inhaltlich
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
        <Figure
          src="/images/img-schreibtisch.webp"
          width={260}
          height={175}
          side="right"
          rotate="left"
        />
        <p>
          Handgeschriebene Briefe aus dem Wahlkreis fallen auf. Es kommt
          häufiger vor als man denkt, dass Abgeordnete tatsächlich
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
        an: den Code kaufst du per App und schreibst ihn auf den
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
        <PullQuote>Schreib ihn heute ab. Heute.</PullQuote>
      </>
    ),
  },
  {
    n: 6,
    title: "Auch mal Danke sagen",
    body: (
      <>
        <p>
          Kritik kommt jeden Tag, Lob fast nie. Wenn eine Abgeordnete sich für
          etwas einsetzt, das dir wichtig ist, schreib ihr das. Auch dann, wenn
          du eine andere Partei gewählt hast.
        </p>
        <p className="mt-2">
          Der Job zehrt: Sitzungswochen bis nach Mitternacht, Wahlkreis am
          Wochenende, ein Postfach voller Wut. Ein handgeschriebenes Danke
          fällt aus diesem Stapel heraus und bleibt hängen. Fünf Minuten von
          dir, eine Woche bessere Laune im Büro.
        </p>
      </>
    ),
  },
];

export default function TippsPage() {
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
            Schreibtipps
          </p>
          <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
            Tipps für den perfekten Brief
          </h1>

          <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
            Sechs Dinge, die den Unterschied machen, zwischen einem Brief,
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
              <div className="font-body text-warmgrau leading-relaxed text-base md:text-lg flow-root">
                {tip.body}
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-16">
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark mb-6">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </section>

        <div className="mt-16 p-6 md:p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl hover:bg-waldgruen/10 transition-colors">
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
