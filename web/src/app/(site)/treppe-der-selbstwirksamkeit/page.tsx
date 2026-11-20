import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { APP_URL, DEFAULT_OG_IMAGES } from "@/lib/config";
import { FAQAccordion } from "@/components/FAQAccordion";
import { FactCallout } from "@/components/editorial/FactCallout";

const TITLE = "Die Treppe der politischen Selbstwirksamkeit";
const DESCRIPTION =
  "Du möchtest ein Anliegen ansprechen oder hast schon einen Brief verschickt? Entdecke elf Möglichkeiten, dich einzubringen, vom ersten Brief bis zur eigenen Bürgerinitiative.";
const URL_PATH = "/treppe-der-selbstwirksamkeit";
const PUBLISHED = "2026-05-20";
const MODIFIED = "2026-11-20";

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
  description: DESCRIPTION,
  alternates: {
    canonical: `${APP_URL}${URL_PATH}`,
  },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
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
    q: "Was kann ich politisch tun, außer wählen?",
    a: "Elf Stufen, sortiert nach Aufwand: 1) Wählen, 2) Petition mitzeichnen, 3) Brief an Abgeordnete schreiben, 4) Eigene Petition starten, 5) Leserbrief schreiben, 6) Bürgersprechstunde besuchen, 7) Dich vom Abgeordneten nach Berlin einladen lassen, 8) Landtagsabgeordnete anrufen, 9) In Verein oder Initiative mitmachen, 10) Kommunal kandidieren, 11) Eigene Bürgerinitiative gründen.",
  },
  {
    q: "Was ist politische Selbstwirksamkeit?",
    a: "Forschung unterscheidet zwei Seiten: das Gefühl, politische Prozesse verstehen und selbst handeln zu können, und die Erwartung, dass Politik Menschen wie dir zuhört. Beides hängt positiv mit Beteiligung zusammen. Ein einzelner Schritt stärkt diese Gefühle aber nicht automatisch oder dauerhaft.",
  },
  {
    q: "Welche Stufe ist die wirkungsvollste für den Aufwand?",
    a: "Das lässt sich nicht allgemeingültig beantworten. Für viele ist ein persönlicher Brief ein machbarer Einstieg, weil er ohne Gruppe und festen Termin möglich ist. Dass er die wirksamste Beteiligungsform ist oder die eigene Selbstwirksamkeit sicher stärkt, ist nicht belegt.",
  },
  {
    q: "Wie wird man Parteimitglied?",
    a: "Über die Website der jeweiligen Partei. Beitritt kostet meist 10 bis 30 Euro im Monat, einkommensabhängig oft weniger. Mit der Mitgliedschaft hast du Stimmrecht in Programm- und Personalfragen.",
  },
  {
    q: "Wie gründe ich eine Bürgerinitiative?",
    a: "Eine Bürgerinitiative ist formlos: drei bis fünf Menschen, ein Thema, ein erster Schritt (Flyer, Stammtisch, Treffen mit der Lokalpresse). Für Bürgerbegehren auf Kommunal- oder Landesebene gelten je nach Bundesland eigene Unterschriftenhürden.",
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
  dateModified: MODIFIED,
  author: { "@type": "Organization", name: "Brief-nach-Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief-nach-Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
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
      <>
        <FactCallout
          number="82,5 %"
          label="Wahlbeteiligung bei der Bundestagswahl 2025. Hoch, aber rund 11 Millionen Wahlberechtigte sind nicht hingegangen."
          source="Bundeswahlleiterin, 2025"
        />
        <p>
          Wählen ist ein grundlegender demokratischer Schritt. Wer eine Wahl
          ausgelassen hat oder nicht wählen darf, kann trotzdem an jeder
          anderen Stelle dieser Treppe anfangen.
        </p>
      </>
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
        30.000 Mitzeichnungen innerhalb von sechs Wochen erreicht die Petition
        das Quorum für eine öffentliche Beratung im Petitionsausschuss. Das
        Quorum wurde 2024 von 50.000 auf 30.000 gesenkt.
      </p>
    ),
  },
  {
    n: 3,
    title: "Einen Brief an deinen Abgeordneten schreiben",
    effort: "10 bis 30 Minuten",
    body: (
      <>
        <p>
          Ein persönlicher Brief bringt dein Anliegen zu einer konkreten
          politischen Vertretung. Er muss nicht perfekt sein. Wichtig ist, dass
          klar wird, was dich beschäftigt und was du dir wünschst. Wenn du nicht
          weißt, wer zuständig ist oder wie du anfangen sollst:{" "}
          <Link
            href="/app"
            className="text-waldgruen hover:underline font-semibold"
          >
            finde mit Brief-nach-Berlin die richtige Ansprechperson
          </Link>
          .
        </p>
      </>
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
        Schau auf der Website deiner Abgeordneten nach einem Termin oder frag
        direkt im Wahlkreisbüro. Du kannst an deinen Brief anknüpfen: „Ich habe
        Ihnen zum Schulweg geschrieben. Kann ich Ihnen die Stelle bei Ihrer
        nächsten Sprechstunde auf einer Karte zeigen?“
      </p>
    ),
  },
  {
    n: 7,
    title: "Dich von deinem Abgeordneten nach Berlin einladen lassen",
    effort: "ein Anruf, dann Warteliste",
    body: (
      <p>
        Dein Bundestagsabgeordneter kann dich zu einer Informationsfahrt des
        Bundespresseamts einladen. Fahrt, Hotel und ein Teil der Verpflegung
        sind bezahlt, du siehst den Bundestag von innen und sprichst mit der
        Politik, die dort Gesetze macht. Es gibt keinen Anspruch, deshalb
        lohnt es sich, früh im Wahlkreisbüro nachzufragen.{" "}
        <Link
          href="/bundestag-besuch-kostenlos"
          className="text-waldgruen hover:underline font-semibold"
        >
          So fragst du an
        </Link>
        .
      </p>
    ),
  },
  {
    n: 8,
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
    n: 9,
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
    n: 10,
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
    n: 11,
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
          11 Stufen
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Die Treppe der politischen Selbstwirksamkeit
        </h1>

        <figure className="mb-8 overflow-hidden rounded-2xl shadow-xl shadow-waldgruen/15">
          <Image
            src="/images/treppe-nachbarinnen.webp"
            alt="Zwei Nachbarinnen sitzen auf einer Haustreppe. Eine zeigt ihren Brief, die andere hört ihr zu."
            width={1248}
            height={832}
            priority
            sizes="(max-width: 672px) 100vw, 672px"
            className="aspect-[3/2] w-full object-cover"
          />
        </figure>

        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-2 text-pretty">
          Wählen ist ein Anfang. Und wenn dich etwas in deinem Alltag stört,
          kannst du auch zwischen den Wahlen etwas anstoßen.
        </p>

        <div className="font-body text-warmgrau leading-relaxed space-y-3 mb-14">
          <p>
            Du musst nicht die ganze Treppe gehen. Fang dort an, wo du gerade
            stehst. Ein Brief kann der erste Schritt sein: Er bringt dein
            Anliegen zu der Person, die dafür zuständig ist. Danach entscheidest
            du selbst, ob und wie du weitermachen möchtest.
          </p>
        </div>

        <section
          aria-labelledby="naechster-schritt"
          className="mb-12 rounded-2xl border border-waldgruen/15 bg-waldgruen/5 p-6 md:p-8"
        >
          <h2 id="naechster-schritt" className="font-body text-2xl font-bold text-waldgruen-dark mb-2">
            Wo stehst du gerade?
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-creme p-5">
              <h3 className="font-body font-bold text-waldgruen-dark mb-2">
                Ich möchte etwas ansprechen
              </h3>
              <p className="font-body text-warmgrau leading-relaxed mb-4">
                Was müsste sich bei dir vor Ort ändern? Schreib den Gedanken
                erst einmal so auf, wie du ihn einer Nachbarin erzählen würdest.
              </p>
              <Link
                href="/app"
                className="font-body font-semibold text-waldgruen hover:underline"
              >
                Meinen Brief anfangen <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="rounded-xl bg-creme p-5">
              <h3 className="font-body font-bold text-waldgruen-dark mb-2">
                Ich habe schon geschrieben
              </h3>
              <p className="font-body text-warmgrau leading-relaxed mb-4">
                Wem könntest du davon erzählen? Oder frag im
                Wahlkreisbüro, wann du dein Anliegen persönlich besprechen kannst.
              </p>
              <Link
                href="#stufe-6"
                className="font-body font-semibold text-waldgruen hover:underline"
              >
                Zur Bürgersprechstunde <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <ol className="space-y-10">
          {steps.map((step) => (
            <li
              key={step.n}
              id={`stufe-${step.n}`}
              className="border-l-2 border-waldgruen/20 pl-6 relative scroll-mt-24"
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
              <div className="font-body text-warmgrau leading-relaxed flow-root">
                {step.body}
              </div>
            </li>
          ))}
        </ol>

        <Link href="#naechster-schritt" className="mt-8 inline-block font-body font-semibold text-waldgruen hover:underline">
          Zurück zu meinem nächsten Schritt ↑
        </Link>

        <section className="mt-16">
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark mb-6">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </section>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed">
          <p>
            Was Forschung über erste politische Schritte, Selbstwirksamkeit und
            die Grenzen dieser Idee sagt, liest du unter{" "}
            <Link
              href="/was-tun-gegen-politische-ohnmacht"
              className="text-waldgruen hover:underline"
            >
              Was tun gegen politische Ohnmacht?
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
