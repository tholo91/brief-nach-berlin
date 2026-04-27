import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title:
    "Die Treppe der politischen Selbstwirksamkeit | 10 Stufen, vom Wählen bis zum eigenen Verein",
  description:
    "Wählen alle vier Jahre ist die unterste Stufe. Hier sind zehn konkrete Wege, wie du als Bürgerin oder Bürger in Deutschland politisch wirklich etwas bewegst, sortiert nach Aufwand. Vom 1-Klick-Mitzeichnen einer Petition bis zum Gründen einer eigenen Bürgerinitiative.",
  alternates: {
    canonical: `${APP_URL}/treppe-der-selbstwirksamkeit`,
  },
  openGraph: {
    title: "Die Treppe der politischen Selbstwirksamkeit",
    description:
      "10 Stufen, wie du in Deutschland politisch wirklich etwas bewegst. Vom Mitzeichnen einer Petition bis zur eigenen Bürgerinitiative.",
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}/treppe-der-selbstwirksamkeit`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Die Treppe der politischen Selbstwirksamkeit",
    description:
      "10 Stufen, wie du in Deutschland politisch wirklich etwas bewegst.",
  },
};

type Step = {
  n: number;
  title: string;
  effort: string;
  body: React.ReactNode;
};

const steps: Step[] = [
  {
    n: 1,
    title: "Wählen gehen",
    effort: "5 Minuten, alle paar Jahre",
    body: (
      <p>
        Die Bundestagswahl 2025 hatte 82,5 % Beteiligung. Hoch, aber das heißt
        immer noch: rund 11 Millionen Wahlberechtigte sind nicht hingegangen.
        Wählen ist die unterste Stufe und das Mindeste. Wer hier nicht steht,
        kann nirgendwo sonst stehen.
      </p>
    ),
  },
  {
    n: 2,
    title: "Eine Petition mitzeichnen",
    effort: "60 Sekunden",
    body: (
      <p>
        Auf{" "}
        <a
          href="https://epetitionen.bundestag.de"
          target="_blank"
          rel="noopener noreferrer"
          className="text-waldgruen hover:underline"
        >
          epetitionen.bundestag.de
        </a>{" "}
        kannst du öffentliche Petitionen mit deinem Namen unterstützen. Bei
        30.000 Mitzeichnungen innerhalb von sechs Wochen wird die Petition im
        Petitionsausschuss öffentlich angehört. Das Quorum wurde 2024 von 50.000
        auf 30.000 gesenkt: deine Unterschrift zählt heute mehr als noch vor
        zwei Jahren.
      </p>
    ),
  },
  {
    n: 3,
    title: "Einen Brief an deinen Abgeordneten schreiben",
    effort: "10 bis 30 Minuten",
    body: (
      <p>
        Ein handgeschriebener Brief landet auf dem Schreibtisch eines
        Abgeordneten und wird gelesen. E-Mails laufen durch Filter, Tweets gehen
        unter. Briefe werden geöffnet. Sie zählen in vielen Büros statistisch
        mit, manche sortieren sie nach Wahlkreis und Thema. Wenn du nicht weißt,
        an wen genau du schreiben sollst:{" "}
        <Link
          href="/app"
          className="text-waldgruen hover:underline font-semibold"
        >
          dafür haben wir Brief-nach-Berlin gebaut
        </Link>
        .
      </p>
    ),
  },
  {
    n: 4,
    title: "Eine eigene Petition starten",
    effort: "ein paar Stunden Recherche",
    body: (
      <p>
        Jeder Mensch kann eine Petition an den Bundestag richten. Du brauchst
        einen klaren Forderungstext, eine kurze Begründung und genug Geduld, um
        in sechs Wochen 30.000 Unterstützer zu sammeln. Die meisten Petitionen
        scheitern am Quorum. Aber selbst eine gescheiterte Petition wird vom
        Petitionsausschuss bearbeitet und beantwortet, und wer 5.000
        Unterschriften zusammenbringt, hat damit oft schon mehr Reichweite
        erzeugt als drei Lokalzeitungsartikel.
      </p>
    ),
  },
  {
    n: 5,
    title: "Einen Leserbrief schreiben oder öffentlich posten",
    effort: "30 Minuten",
    body: (
      <p>
        Lokalzeitungen drucken Leserbriefe oft fast unverändert ab, vor allem
        wenn sie konkret und auf einen Artikel bezogen sind. Eine
        Wochenend-Ausgabe wird gelesen, im Café ausgelegt, beim Bäcker
        besprochen. Ein Post auf LinkedIn oder Mastodon mit Tag an den
        zuständigen Politiker tut etwas Ähnliches digital. Beides ist sichtbar
        und macht klar: hier ist eine Wählerstimme mit einer Meinung.
      </p>
    ),
  },
  {
    n: 6,
    title: "Eine Bürgersprechstunde besuchen",
    effort: "ein Termin, meist abends",
    body: (
      <p>
        Fast jeder Bundestags- und Landtagsabgeordnete bietet einmal im Monat
        eine Bürgersprechstunde im Wahlkreisbüro an. Termine stehen auf der
        Website der oder des Abgeordneten oder du rufst im Wahlkreisbüro an.
        Eine halbe Stunde, gegenüber von einer Person, die in Berlin oder im
        Landtag mitstimmt. Das ist Demokratie auf Augenhöhe und kostet dich nur
        die Anfahrt.
      </p>
    ),
  },
  {
    n: 7,
    title: "Bei deiner Landtagsabgeordneten anrufen oder vorbeigehen",
    effort: "20 Minuten",
    body: (
      <>
        <p>
          Das machen die wenigsten. Und genau deswegen wirkt es. Bundestag
          ist medial sichtbar, Landtag ist es nicht, also denken die meisten
          Menschen nicht daran. Dabei entscheidet dein Landtag über Schulen,
          Polizei, Wohnungsbau, Kitas, Hochschulen, viele Steuern, das halbe
          Leben.
        </p>
        <p className="mt-2">
          Ruf im Landtagsbüro an. Frag, ob du persönlich vorbeikommen kannst.
          Du wirst überrascht sein, wie viel Zeit dir gegeben wird, schlicht
          weil sonst niemand kommt.
        </p>
      </>
    ),
  },
  {
    n: 8,
    title:
      "In einem Verein, einer Bürgerinitiative oder einem Ortsverband mitmachen",
    effort: "ein bis zwei Abende im Monat",
    body: (
      <p>
        Ortsverbände der Parteien, lokale Bürgerinitiativen, Vereine zu Mobilität,
        Klima, Wohnen, Pflege: alle suchen Mitglieder. Du musst nicht gleich
        eintreten und du musst nicht zu allem ja sagen. Geh zu einer offenen
        Sitzung, hör zu, frag nach. Aus diesen Gruppen kommen die Menschen, die
        zwei Stufen weiter oben kandidieren oder Gründungen anschieben. Hier
        lernst du, wie Politik tatsächlich funktioniert: über Beziehungen,
        nicht über Ideen allein.
      </p>
    ),
  },
  {
    n: 9,
    title: "Selbst auf kommunaler Ebene kandidieren",
    effort: "einige Wochen Vorbereitung, ein Wahlkampf",
    body: (
      <p>
        Stadtrat, Gemeinderat, Ortsbeirat, Bezirksverordnetenversammlung in den
        Stadtstaaten. Der Einstieg ist niedriger, als die meisten denken. Du
        brauchst keine Parteimitgliedschaft, viele Kommunen haben freie
        Wählervereinigungen oder Listen, die dich aufnehmen. Eine
        Stadtratssitzung kostet dich ein paar Stunden im Monat und du
        entscheidest mit über Schulhof-Sanierungen, Radwege, Bauanträge,
        Kita-Plätze. Konkret, vor deiner Haustür, sofort wirksam.
      </p>
    ),
  },
  {
    n: 10,
    title:
      "Eine eigene Bürgerinitiative, einen Verein oder eine Bewegung gründen",
    effort: "Monate bis Jahre",
    body: (
      <p>
        Die höchste Stufe und die anstrengendste. Wenn dir keine bestehende
        Gruppe für dein Anliegen passt, gründest du selbst. Sieben Personen
        reichen für einen eingetragenen Verein, eine Bürgerinitiative geht auch
        formloser. Das ist die Stufe, auf der aus Wut etwas wird, das andere
        Menschen mitnehmen kann. Fridays for Future fing mit einer einzelnen
        Schülerin an, der ADFC mit einer Handvoll Radfahrenden. Du musst nicht
        die Welt retten. Es reicht, wenn du den Punkt rettest, an dem du
        wohnst.
      </p>
    ),
  },
];

export default function TreppePage() {
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
          10 Stufen
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Die Treppe der politischen Selbstwirksamkeit
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
          Wählen alle vier Jahre ist nicht das Ende der Geschichte, sondern der
          Anfang. Hier sind zehn konkrete Wege, wie du als Bürgerin oder Bürger
          in Deutschland politisch wirklich etwas bewegst, sortiert nach Aufwand.
        </p>

        <div className="font-body text-warmgrau leading-relaxed space-y-3 mb-14">
          <p>
            Du musst nicht oben anfangen und du musst nicht alles tun. Wer auf
            Stufe 3 steht, ist schon weiter als 95 % der Bevölkerung. Wer auf
            Stufe 7 steht, hat etwas, das die meisten Lobbyisten nicht haben:
            eine Wählerstimme, ein Gesicht und einen Namen, der im Wahlkreisbüro
            bekannt ist.
          </p>
          <p>
            Such dir die nächste Stufe aus, die du dir zutraust. Dann nimm sie.
          </p>
        </div>

        <ol className="space-y-10">
          {steps.map((step) => (
            <li
              key={step.n}
              className="border-l-2 border-waldgruen/20 pl-6 relative"
            >
              <span
                aria-hidden
                className="absolute -left-5 top-0 w-9 h-9 rounded-full bg-waldgruen text-creme font-typewriter font-bold flex items-center justify-center shadow-sm"
              >
                {step.n}
              </span>
              <h2 className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark mb-1 mt-1">
                {step.title}
              </h2>
              <p className="font-typewriter text-xs uppercase tracking-wider text-warmgrau/60 mb-3">
                Aufwand: {step.effort}
              </p>
              <div className="font-body text-warmgrau leading-relaxed">
                {step.body}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark mb-4">
            Wo fängst du an?
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Wenn du heute eine Stufe nehmen willst, ist Stufe 3 die mit dem
            besten Verhältnis aus Aufwand und Wirkung. Schreib einen Brief.
            Direkt an die Person in Berlin, die für dein Anliegen zuständig ist.
            Wir helfen dir, die richtige zu finden und ihn zu formulieren.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Brief schreiben &rarr;
          </Link>
        </div>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed">
          <p>
            Mehr dazu, warum gerade ein Brief so eine starke Stufe ist, steht
            unter{" "}
            <Link
              href="/warum-ein-brief"
              className="text-waldgruen hover:underline"
            >
              Warum ein Brief mehr ist als ein Brief
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
