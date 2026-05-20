import Link from "next/link";
import { Figure } from "@/components/editorial/Figure";
import { FAQAccordion } from "@/components/FAQAccordion";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

const TITLE = "Was du sonst noch tun kannst";
const DESCRIPTION =
  "Du hast einen Brief geschrieben und Blut geleckt? Hier sind die nächsten Stufen: Bürgersprechstunde besuchen, eine Petition mitzeichnen, eine eigene Bürgerinitiative gründen. Konkrete Wege, wie du als Bürgerin oder Bürger wirklich etwas bewegst.";
const URL_PATH = "/aktiv-werden";
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
    q: "Was kann ich nach meinem ersten Brief politisch tun?",
    a: "Mehrere Optionen, sortiert nach Aufwand: in die Bürgersprechstunde deines Abgeordneten gehen, Petitionen mitzeichnen, lokale Initiativen unterstützen, oder selbst eine Bürgerinitiative gründen. Politische Wirkung entsteht aus vielen kleinen Schritten, nicht aus einer großen Geste.",
  },
  {
    q: "Was ist eine Bürgersprechstunde?",
    a: "Fast jeder Bundestags- und Landtagsabgeordnete bietet einmal im Monat eine offene Sprechstunde im Wahlkreisbüro an. Termine stehen auf der Website der oder des Abgeordneten. Eine halbe Stunde direkter Austausch mit jemandem, der in Berlin oder im Landtag mitstimmt.",
  },
  {
    q: "Wie viele Unterschriften braucht eine Bundestagspetition?",
    a: "Bei 30.000 Mitzeichnungen wird eine Bundestags-Petition öffentlich angehört. Auf Landes- und Kommunalebene sind die Hürden niedriger.",
  },
  {
    q: "Wie fühlt sich Selbstwirksamkeit konkret an?",
    a: "Wer einmal selbst aktiv war (Brief, Sprechstunde, Petition), schätzt seine politische Wirksamkeit dauerhaft höher ein. Aus 'da müsste mal jemand etwas tun' wird 'ich habe etwas getan'. Das verändert mehr in einem selbst als in der Welt da draußen.",
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

type ActionCard = {
  kicker: string;
  title: string;
  body: React.ReactNode;
  href: string;
  cta: string;
  external?: boolean;
};

const cards: ActionCard[] = [
  {
    kicker: "Persönlich vor Ort",
    title: "Geh in die Bürgersprechstunde",
    body: (
      <>
        <Figure
          src="/images/img-treppe.webp"
          width={220}
          height={148}
          side="right"
          rotate="right"
        />
        <p>
          Fast jeder Bundestags- und Landtagsabgeordnete bietet einmal im Monat
          eine offene Sprechstunde im Wahlkreisbüro an. Termine stehen auf der
          Website der oder des Abgeordneten, oder du rufst kurz dort an. Eine
          halbe Stunde gegenüber einer Person, die in Berlin oder im Landtag
          mitstimmt: das ist Demokratie auf Augenhöhe und kostet dich nur die
          Anfahrt.
        </p>
      </>
    ),
    href: "/treppe-der-selbstwirksamkeit#stufe-6",
    cta: "Mehr zu Stufe 6",
  },
  {
    kicker: "Mitzeichnen, 60 Sekunden",
    title: "Unterstütze die Petition Bremen Rauchfrei",
    body: (
      <p>
        Eine Petition für mehr rauchfreie Außenbereiche in Bremen, von einem
        Bremer Bürger gestartet. Mitzeichnen kostet eine Minute und ist eines
        der niedrigschwelligsten politischen Werkzeuge überhaupt: bei 30.000
        Mitzeichnungen wird eine Bundestags-Petition öffentlich angehört, bei
        Landes- und Kommunalpetitionen ist die Hürde noch niedriger.
      </p>
    ),
    href: "https://bremen-rauchfrei.de",
    cta: "Zur Petition",
    external: true,
  },
  {
    kicker: "Der ganze Überblick",
    title: "Die Treppe der politischen Selbstwirksamkeit",
    body: (
      <p>
        Zehn Stufen, sortiert nach Aufwand: von „Wählen gehen" über
        „Leserbrief schreiben" bis „eigene Bürgerinitiative gründen". Such dir
        die nächste Stufe, die du dir zutraust, und nimm sie. Wer auf Stufe 3
        steht (Brief schreiben), ist schon weiter als 95 % der Bevölkerung.
      </p>
    ),
    href: "/treppe-der-selbstwirksamkeit",
    cta: "Alle 10 Stufen ansehen",
  },
];

export default function AktivWerdenPage() {
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
            Du hast Blut geleckt?
          </p>
          <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
            Was du sonst noch tun kannst
          </h1>

          <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-2 text-pretty">
            Du hast deinen Brief geschrieben. Stark. Und jetzt? Ein Brief ist
            selten das Ende, oft der Anfang. Hier sind die nächsten Schritte,
            sortiert nach Aufwand.
          </p>

        <div className="font-body text-warmgrau leading-relaxed space-y-3 mb-14">
          <p>
            Politische Wirkung entsteht nicht durch eine große Geste, sondern
            durch viele kleine. Such dir aus, was zu dir und deinem Tag passt.
            Mitzeichnen geht in der Mittagspause. Eine Sprechstunde dauert eine
            Stunde. Eine eigene Initiative ist die Reise eines Lebens. Alles
            zählt.
          </p>
        </div>

        <ul className="space-y-8">
          {cards.map((card) => (
            <li
              key={card.href}
              className="bg-white border border-waldgruen/15 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="font-typewriter text-xs uppercase tracking-wider text-warmgrau/60 mb-2">
                {card.kicker}
              </p>
              <h2 className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark mb-3">
                {card.title}
              </h2>
              <div className="font-body text-warmgrau leading-relaxed mb-5 flow-root">
                {card.body}
              </div>
              {card.external ? (
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-typewriter text-sm font-bold text-waldgruen hover:text-waldgruen-dark hover:underline transition-colors"
                >
                  {card.cta} &rarr;
                </a>
              ) : (
                <Link
                  href={card.href}
                  className="inline-block font-typewriter text-sm font-bold text-waldgruen hover:text-waldgruen-dark hover:underline transition-colors"
                >
                  {card.cta} &rarr;
                </Link>
              )}
            </li>
          ))}
        </ul>

        <section className="mt-16 mb-10">
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark mb-6">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
          <div className="mt-8 font-body text-sm text-warmgrau/70 leading-relaxed space-y-2">
            <p>
              Weiterlesen:{" "}
              <Link
                href="/was-tun-gegen-politische-ohnmacht"
                className="text-waldgruen hover:underline"
              >
                Was tun, wenn man sich politisch ohnmächtig fühlt?
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

        <div className="p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl hover:bg-waldgruen/10 transition-colors">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark mb-4">
            Noch keinen Brief geschrieben?
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Der erste Brief ist der wichtigste. Wir helfen dir, die richtige
            Person in Berlin zu finden und in unter drei Minuten loszuschreiben.
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
