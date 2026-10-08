import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL, DONATION_PATH } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FactCallout } from "@/components/editorial/FactCallout";
import { Figure } from "@/components/editorial/Figure";

const URL_PATH = "/petition-starten";
const PUBLISHED = "2026-10-08";
const TITLE =
  "Petition starten: Bundestag, Landtag oder online | Brief nach Berlin";
const DESCRIPTION =
  "So startest du eine Petition beim Bundestag, beim Landtag oder online: Schritte, Quorum, Ablauf. Plus: wie ein persönlicher Brief deine Petition stärker macht.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
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
    q: "Wer darf eine Petition starten?",
    a: "Jede Person. Das Petitionsrecht aus Artikel 17 Grundgesetz gilt für alle, unabhängig von Alter, Wohnort oder Staatsangehörigkeit. Du kannst allein oder gemeinsam mit anderen eine Bitte oder Beschwerde an das zuständige Parlament richten.",
  },
  {
    q: "Wie viele Unterschriften braucht eine Petition?",
    a: "Für die Bearbeitung reicht eine einzige Unterschrift, deine eigene. Beim Bundestag führen 30.000 Mitzeichnungen innerhalb von sechs Wochen in der Regel zu einer öffentlichen Beratung im Petitionsausschuss. Online-Plattformen setzen eigene Ziele, die rechtlich nichts auslösen.",
  },
  {
    q: "Ist eine Online-Petition bei Change.org oder openPetition rechtlich eine Petition?",
    a: "Nein. Eine Petition im Sinne von Artikel 17 Grundgesetz ist sie erst, wenn sie bei einem Parlament oder einer zuständigen Stelle eingereicht wird. Online-Plattformen sammeln Unterstützung und übergeben die Unterschriften dann oft selbst an Politik oder Verwaltung. Für das Quorum beim Bundestag zählen nur Mitzeichnungen im Portal des Bundestags.",
  },
  {
    q: "Wie lange dauert es, bis eine Petition beim Bundestag entschieden ist?",
    a: "Eine feste Frist gibt es nicht, rechne mit mehreren Monaten. Der Petitionsausschuss holt meist zuerst eine Stellungnahme des zuständigen Ministeriums ein, berät dann und gibt eine Beschlussempfehlung an das Plenum. Am Ende bekommst du einen schriftlichen Bescheid mit Begründung.",
  },
  {
    q: "Petition oder Brief an die Abgeordnete: was wirkt mehr?",
    a: "Beides wirkt auf unterschiedliche Weise. Eine Petition zeigt, wie viele Menschen eine Forderung teilen, und hat ein festes Verfahren. Ein persönlicher Brief an die Abgeordnete deines Wahlkreises zeigt, wie das Problem bei einer konkreten Person ankommt. Am stärksten ist die Kombination.",
  },
  {
    q: "Was kostet Brief nach Berlin?",
    a: "Nichts. Briefe schreiben und Briefkampagnen starten ist kostenlos. Brief nach Berlin ist eine gemeinnützige Initiative in Trägerschaft der WE AID gGmbH und finanziert sich über Spenden.",
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

const inlineLink = "text-waldgruen hover:underline";
const listLink =
  "font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors";

const relatedLinks = [
  { href: "/brief-oder-petition", title: "Brief oder Petition: was wirkt mehr?" },
  { href: "/kampagne-starten", title: "Briefkampagne starten, allein oder mit deiner Initiative" },
  { href: "/kommune-land-bund-eu", title: "Kommune, Land, Bund oder EU: wer ist zuständig?" },
  { href: "/andere-tools", title: "Andere Tools für mehr Demokratie im Vergleich" },
  { href: "/lohnt-sich-brief-an-politiker", title: "Lohnt es sich, einem Politiker zu schreiben?" },
];

export default function PetitionStartenPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Petitionen
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Petition starten: so geht&apos;s beim Bundestag, im Land und online
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-4 text-pretty">
          Eine Petition darf jede Person starten. Für Bundesthemen reichst du
          sie online beim Petitionsausschuss des Bundestags ein, für Landes-
          und Kommunalthemen beim Landtag oder deiner Gemeinde. Plattformen wie
          openPetition oder Change.org sammeln zusätzlich öffentliche
          Unterstützung. Ein persönlicher Brief an deine Abgeordnete macht die
          Petition stärker.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          6 Minuten Lesezeit
        </p>

        <Prose>
          <h2>Wie starte ich eine Petition beim Bundestag?</h2>
          <Figure
            src="/images/letterbox-berlin.webp"
            alt="Gemalte Berliner Straßenszene: eine Hand wirft einen Brief in einen gelben Briefkasten"
            width={1376}
            height={768}
            side="right"
            rotate="right"
            caption="Petition online, Brief per Post: beides kommt im Bundestag an."
          />
          <p>
            Der offizielle Weg führt über das Petitionsportal{" "}
            <a href="https://epetitionen.bundestag.de" className={inlineLink} target="_blank" rel="noopener noreferrer">
              epetitionen.bundestag.de
            </a>
            . Dort beschreibst du, was sich ändern soll und warum, und reichst
            den Text beim Petitionsausschuss ein. Per Post geht es auch: Deutscher
            Bundestag, Petitionsausschuss, Platz der Republik 1, 11011 Berlin.
            Jede Petition wird geprüft und beschieden, auch wenn nur eine Person
            sie unterschrieben hat.
          </p>
          <p>
            Du kannst beantragen, dass deine Petition als öffentliche Petition
            erscheint. Dann können andere sie sechs Wochen lang online
            mitzeichnen. Kommen in dieser Zeit 30.000 Mitzeichnungen zusammen,
            berät der Ausschuss sie in der Regel öffentlich. Seit Juli 2024
            liegt diese Hürde bei 30.000 statt vorher 50.000 Stimmen. Wichtig:
            Unterschriften von openPetition oder Change.org zählen dafür nicht,
            nur Mitzeichnungen im Portal des Bundestags.
          </p>

          <FactCallout
            number="9.260"
            label="Petitionen gingen 2024 beim Bundestag ein. 413 davon wurden öffentlich gestellt, 607 hat der Ausschuss einzeln beraten."
            source="Jahresbericht des Petitionsausschusses 2024"
          />

          <h2>Bundestag, Landtag oder Gemeinde: wer ist zuständig?</h2>
          <Figure
            src="/images/img-vier-ebenen.webp"
            alt="Gemalte Landschaft mit Rathaus, Landtag, Bundestag und EU-Gebäude, verbunden durch Wege"
            width={1200}
            height={670}
            side="left"
            rotate="left"
            caption="Gemeinde, Land, Bund, EU: jede Ebene hat ihr eigenes Parlament."
          />
          <p>
            Eine Petition landet nur dann bei den richtigen Leuten, wenn das
            Parlament auch zuständig ist. Rente, Bundeswehr, Krankenkassen und
            Steuern sind Bundessache. Schulen, Polizei, Hochschulen und der
            Nahverkehr sind meist Ländersache. Der Spielplatz, die Ampel vor
            der Kita und die Öffnungszeiten im Bürgeramt gehören in den
            Gemeinderat.
          </p>
          <p>
            Für Landesthemen haben die Landtage eigene Petitionsausschüsse,
            viele mit Online-Formular. Eine Übersicht findest du auf{" "}
            <a href="https://www.petitionsportal.de" className={inlineLink} target="_blank" rel="noopener noreferrer">
              petitionsportal.de
            </a>
            . In der Gemeinde richtest du Anregungen und Beschwerden an den Rat.
            Wie das genau abläuft, regelt die Gemeindeordnung deines
            Bundeslands.
          </p>
          <p>
            Wenn du unsicher bist, hilft unsere Übersicht{" "}
            <Link href="/kommune-land-bund-eu" className={inlineLink}>
              Kommune, Land, Bund oder EU
            </Link>
            .
          </p>

          <h2>Was ist der Unterschied zwischen offizieller Petition und Online-Petition?</h2>
          <p>
            Eine offizielle Petition reichst du direkt bei einem Parlament ein.
            Sie hat ein festes Verfahren und endet mit einem schriftlichen
            Bescheid. Eine Online-Petition auf einer privaten Plattform ist
            zunächst ein öffentlicher Aufruf. Rechtlich wird sie erst zur
            Petition, wenn jemand die Unterschriften bei der zuständigen Stelle
            einreicht.
          </p>
          <p>
            Die bekanntesten Plattformen in Deutschland sind openPetition,
            Change.org, WeAct und innn.it. openPetition wird von einer
            gemeinnützigen GmbH betrieben. Erreicht eine Petition dort ihr
            Quorum, bittet openPetition die zuständigen Abgeordneten um eine
            Stellungnahme. WeAct gehört zu Campact und nimmt nur Petitionen
            an, die zu den Werten von Campact passen. innn.it ist ein
            spendenfinanzierter Verein aus Berlin. Change.org ist international
            die bekannteste Plattform. Einen genaueren Vergleich findest du
            unter{" "}
            <Link href="/andere-tools" className={inlineLink}>
              Andere Tools für mehr Demokratie
            </Link>
            .
          </p>

          <div className="not-prose my-10 overflow-hidden rounded-xl border border-waldgruen/15 bg-white/55">
            <div className="grid grid-cols-1 divide-y divide-waldgruen/10 md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="p-5">
                <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60 mb-2">
                  Offizielle Petition
                </p>
                <p className="font-body text-sm leading-relaxed text-warmgrau">
                  Beim Parlament eingereicht, festes Verfahren, schriftlicher
                  Bescheid.
                </p>
              </div>
              <div className="p-5">
                <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60 mb-2">
                  Online-Petition
                </p>
                <p className="font-body text-sm leading-relaxed text-warmgrau">
                  Öffentlicher Aufruf, schnell geteilt, Wirkung über
                  Aufmerksamkeit und Übergabe.
                </p>
              </div>
              <div className="p-5">
                <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60 mb-2">
                  Persönlicher Brief
                </p>
                <p className="font-body text-sm leading-relaxed text-warmgrau">
                  Geht an die Abgeordnete deines Wahlkreises, mit deinem Namen
                  und deiner Geschichte.
                </p>
              </div>
            </div>
          </div>

          <h2>Was passiert, nachdem ich die Petition eingereicht habe?</h2>
          <p>
            Der Petitionsausschuss prüft jede Eingabe. Meist bittet er zuerst
            das zuständige Bundesministerium um eine Stellungnahme. Danach
            beschließt er eine Empfehlung, über die das Plenum des Bundestags
            abstimmt. Am Ende bekommst du einen schriftlichen Bescheid mit
            Begründung.
          </p>
          <p>
            Eine feste Bearbeitungsfrist gibt es nicht, rechne mit mehreren
            Monaten. Der Ausschuss kann auch ablehnen, eine Petition öffentlich
            zu stellen, zum Beispiel bei persönlichen Beschwerden. Geprüft wird
            sie trotzdem.
          </p>

          <h2>Wie mache ich meine Petition wirksamer?</h2>
          <Figure
            src="/images/img-drei-briefe.webp"
            alt="Drei handgeschriebene Briefe neben einer Teetasse auf einem Holztisch"
            width={400}
            height={400}
            side="right"
            rotate="right"
            caption="Jeder Brief erzählt eine eigene Geschichte."
          />
          <p>
            Schreib zusätzlich an die Abgeordnete oder den Abgeordneten deines
            Wahlkreises. Die Petition läuft durch ein Verfahren mit vielen
            tausend anderen Eingaben. Ein Brief landet dagegen im Büro einer
            Person, die von Menschen aus ihrem Wahlkreis gewählt wird und dort
            wieder gewählt werden will. Sie kann im Ausschuss nachfragen, das
            Thema in ihrer Fraktion ansprechen oder dir direkt antworten.
          </p>
          <p>
            Brief nach Berlin hilft dir dabei. Du beschreibst dein Anliegen und
            gibst deine Postleitzahl ein. Daraus entsteht in wenigen Minuten ein
            Briefentwurf an die zuständige Person, den du anpasst, von Hand
            abschreibst und per Post schickst. Wie Petition und Brief sich
            unterscheiden, steht ausführlich unter{" "}
            <Link href="/brief-oder-petition" className={inlineLink}>
              Brief oder Petition
            </Link>
            .
          </p>

          <PullQuote decorative>
            Die Petition zeigt, wie viele es sind. Der Brief zeigt, wer sie
            sind.
          </PullQuote>

          <h2>Du startest die Petition mit einer Gruppe?</h2>
          <p>
            Dann lohnt sich eine Briefkampagne neben der Petition. Du legst dein
            Anliegen einmal an und bekommst einen Link. Alle, die ihn öffnen,
            schreiben daraus einen eigenen Brief an ihre eigenen Abgeordneten.
            So bekommt jedes Wahlkreisbüro Post von Menschen, die dort wohnen,
            statt hundertmal denselben Text. Wie das geht, erklärt die Seite{" "}
            <Link href="/kampagne-starten" className={inlineLink}>
              Briefkampagne starten
            </Link>
            .
          </p>
          <p>
            Wie viel dabei zusammenkommen kann, zeigen zwei Kampagnen aus dem
            Oktober 2026. Über{" "}
            <Link href="/kampagne/eeg-so-nicht" className={inlineLink}>
              EEG so nicht!
            </Link>{" "}
            von Klartext mit Lilly haben fast 1.000 Menschen in zwei Tagen
            einen eigenen Brief erstellt. Bei{" "}
            <Link href="/kampagne/afd-vor-gericht" className={inlineLink}>
              AfD vor Gericht
            </Link>{" "}
            waren es fast 500. Die Inhalte stammen jeweils von den Initiatoren.
          </p>
          <p>
            Brief nach Berlin ist kostenlos und werbefrei. Das Projekt ist eine
            gemeinnützige Initiative in Trägerschaft der WE AID gGmbH und wird
            über{" "}
            <Link href={DONATION_PATH} className={inlineLink}>
              Spenden
            </Link>{" "}
            finanziert. Es sammelt keine Unterschriften und verkauft keine
            Reichweite.
          </p>
        </Prose>

        <div className="mt-16 border-t border-warmgrau/10 pt-8">
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-4">
            Mehr dazu
          </p>
          <ul className="flex flex-col gap-3">
            {relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={listLink}>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-6">
            Häufige Fragen
          </h2>
          <FAQAccordion items={faqs} />
        </div>

        <div className="mt-16 rounded-xl bg-white/70 border border-waldgruen/15 p-8 text-center shadow-sm">
          <p className="font-body text-lg font-bold text-waldgruen-dark mb-3">
            Mach aus deiner Petition einen Brief
          </p>
          <p className="font-body text-sm text-warmgrau/75 leading-relaxed mb-6">
            Beschreib dein Anliegen und gib deine Postleitzahl ein. Allein oder
            mit deiner Gruppe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/app"
              className="inline-block rounded-lg bg-waldgruen px-8 py-3 font-body font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
            >
              Brief schreiben
            </Link>
            <Link
              href="/kampagne/starten"
              className="inline-block rounded-lg border border-waldgruen/30 px-8 py-3 font-body font-semibold text-waldgruen transition-colors hover:bg-waldgruen/5"
            >
              Briefkampagne starten
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
