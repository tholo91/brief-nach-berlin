import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL, DONATION_PATH } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FactCallout } from "@/components/editorial/FactCallout";
import { Figure } from "@/components/editorial/Figure";

const URL_PATH = "/kampagne-starten";
const PUBLISHED = "2026-07-01";
const MODIFIED = "2026-10-08";
const TITLE =
  "Briefkampagne starten: Alternative zur Petition | Brief nach Berlin";
const DESCRIPTION =
  "Briefkampagne statt oder neben einer Petition: Anliegen anlegen, Link teilen, alle schreiben eigene Briefe an ihre Abgeordneten. Kostenlos und spendenfinanziert.";

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
    q: "Wie starte ich eine Kampagne bei Brief nach Berlin?",
    a: "Du beschreibst dein Anliegen, Ziel und Kontext. Nach deiner E-Mail-Bestätigung prüfen wir den öffentlichen Text. Danach bekommst du einen Link, den du teilen kannst. Andere Menschen nutzen diesen Link als Einstieg und schreiben daraus ihren eigenen Brief.",
  },
  {
    q: "Ist Brief nach Berlin eine Petitionsplattform wie WeAct?",
    a: "Nein. WeAct, Change.org und openPetition sammeln Unterschriften unter einer gemeinsamen Forderung. Brief nach Berlin hilft mehreren Menschen, persönliche Briefe zu demselben Anliegen zu schreiben. Das ist kleiner, langsamer und persönlicher.",
  },
  {
    q: "Was unterscheidet eine Briefkampagne von einer Massenmail?",
    a: "Eine Massenmail verschickt denselben Text an viele Postfächer. Eine Briefkampagne bei Brief nach Berlin gibt nur den Anlass vor. Jede Person formuliert ihren Brief mit eigener Perspektive, eigener Postleitzahl und eigener Adresse.",
  },
  {
    q: "Für welche Themen eignet sich eine Briefkampagne?",
    a: "Eine Briefkampagne eignet sich für konkrete politische Anliegen, bei denen einzelne Abgeordnete verstehen sollen, wie ein Problem im Alltag ankommt. Gute Themen haben eine klare Bitte, einen politischen Adressaten und Menschen, die persönlich betroffen sind.",
  },
  {
    q: "Kann ich eine Petition und eine Briefkampagne gleichzeitig starten?",
    a: "Ja. Die Petition zeigt, wie viele Menschen eine Forderung unterstützen. Die Briefkampagne bringt einzelne Geschichten zu den zuständigen Abgeordneten. Teile beide Links zusammen und bitte die Unterzeichnenden, zusätzlich einen eigenen Brief zu schreiben.",
  },
  {
    q: "Was kostet eine Kampagne?",
    a: "Nichts. Kampagnen sind kostenlos, für Initiativen, Vereine und Einzelpersonen genauso wie für größere Organisationen. Brief nach Berlin ist eine gemeinnützige Initiative in Trägerschaft der WE AID gGmbH und finanziert sich über Spenden.",
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
  author: { "@type": "Organization", name: "Brief nach Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief nach Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

export default function KampagneStartenSeoPage() {
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
          Briefkampagnen
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Kampagne starten: viele persönliche Briefe statt eine Liste
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-4 text-pretty">
          Wenn du eine Kampagne starten willst, brauchst du nicht immer eine
          Petition. Brief nach Berlin bündelt Menschen über einen gemeinsamen
          Anlass, aber jede Person schreibt am Ende einen eigenen Brief an ihre
          Abgeordnete oder ihren Abgeordneten. Das unterscheidet es von WeAct,
          Change.org oder openPetition: weniger Masse, mehr persönliche Post.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          4 Minuten Lesezeit
        </p>

        <Prose>
          <h2>Wann ist eine Briefkampagne besser als eine Petition?</h2>
          <Figure
            src="/images/img-campaign-crowd-ghibli.webp"
            alt="Gemalte Menschengruppe mit Briefen in der Hand vor dem Bundestag"
            width={1376}
            height={768}
            side="right"
            rotate="right"
            caption="Ein gemeinsamer Anlass, viele eigene Briefe."
          />
          <p>
            Eine Petition ist stark, wenn du Breite zeigen willst: viele
            Menschen, eine Forderung, ein öffentlich sichtbarer Zähler. Eine
            Briefkampagne ist stark, wenn die Empfängerin oder der Empfänger
            verstehen soll, warum ein Thema im Alltag einzelner Menschen
            ankommt.
          </p>
          <p>
            Das Format passt besonders gut, wenn du schon eine Gruppe hast:
            Eltern einer Schule, Mieterinnen eines Hauses, Pendler aus einer
            Region, Mitglieder eines Vereins, Betroffene einer
            Verwaltungsentscheidung. Alle teilen den Anlass. Aber jede Person
            hat eine eigene Geschichte.
          </p>

          <FactCallout
            number="1"
            label="gemeinsamer Anlass reicht. Der fertige Brief bleibt persönlich und wird nicht als identischer Kampagnentext verschickt."
            source="Produktprinzip von Brief nach Berlin"
          />

          <h2>Wie funktioniert eine Kampagne bei Brief nach Berlin?</h2>
          <p>
            Du legst eine Kampagne mit Thema, Ziel und Kontext an. Daraus
            entsteht eine öffentliche Kampagnenseite. Wer den Link öffnet,
            bekommt einen vorbereiteten Einstieg und schreibt daraus einen
            eigenen Brief. Die Postleitzahl entscheidet, welche Abgeordnete
            oder welcher Abgeordnete zuständig ist.
          </p>
          <p>
            Wichtig ist der Unterschied zum Copy-and-paste-Prinzip. Brief nach
            Berlin will keine identischen Texte in politische Büros schieben.
            Das Tool hilft beim Formulieren, aber der Brief bleibt an die
            Person gebunden, die ihn schreibt.
          </p>

          <PullQuote decorative>
            Eine Petition zeigt, wie viele unterschreiben. Eine Briefkampagne
            zeigt, wie viele sich die Mühe machen, selbst zu schreiben.
          </PullQuote>

          <h2>Was unterscheidet Brief nach Berlin von WeAct, Change.org und openPetition?</h2>
          <p>
            WeAct, Change.org und openPetition sind sinnvoll, wenn du
            öffentliche Unterstützung sammeln willst. Menschen unterschreiben
            dieselbe Forderung. Das ist schnell, gut teilbar und für viele
            Anliegen die richtige Form.
          </p>
          <p>
            Brief nach Berlin setzt an einer anderen Stelle an. Hier geht es
            nicht um eine Zahl unter einer Petition, sondern um einzelne Briefe
            an konkrete Abgeordnete. Das ist kleiner im öffentlichen Signal,
            aber stärker im persönlichen Kontakt.
          </p>
          <div className="not-prose my-10 overflow-hidden rounded-xl border border-waldgruen/15 bg-white/55">
            <div className="grid grid-cols-1 divide-y divide-waldgruen/10 md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="p-5">
                <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60 mb-2">
                  Petition
                </p>
                <p className="font-body text-sm leading-relaxed text-warmgrau">
                  Eine Forderung, viele Unterschriften, öffentlich sichtbarer
                  Druck.
                </p>
              </div>
              <div className="p-5">
                <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60 mb-2">
                  Massenmail
                </p>
                <p className="font-body text-sm leading-relaxed text-warmgrau">
                  Ein Text, viele Postfächer, oft schnell als Kampagne
                  erkennbar.
                </p>
              </div>
              <div className="p-5">
                <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60 mb-2">
                  Briefkampagne
                </p>
                <p className="font-body text-sm leading-relaxed text-warmgrau">
                  Ein Anlass, viele persönliche Briefe, jeweils an die eigene
                  politische Ansprechperson.
                </p>
              </div>
            </div>
          </div>

          <h2>Für wen ist das Kampagnen-Feature gedacht?</h2>
          <Figure
            src="/images/img-kiez.webp"
            alt="Frau schreibt auf einer Parkbank in einem grünen Kiez einen Brief"
            width={400}
            height={400}
            side="left"
            rotate="left"
            caption="Oft fängt es lokal an: Schule, Haus, Straße, Verein."
          />
          <p>
            Das Feature ist für Menschen gedacht, die ein Anliegen nicht allein
            tragen wollen, aber auch keine klassische Petitionskampagne
            starten möchten. Zum Beispiel eine lokale Initiative, ein kleiner
            Verein, eine Elternvertretung, eine Mietergruppe oder eine Person,
            die schon zehn andere Betroffene kennt.
          </p>
          <p>
            Eine Kampagne kostet nichts. Brief nach Berlin
            ist eine gemeinnützige Initiative in Trägerschaft der WE AID gGmbH
            und läuft über{" "}
            <Link href={DONATION_PATH} className="text-waldgruen hover:underline">Spenden</Link>. Kleine Initiativen
            sollen nicht an Agenturpreisen oder fehlender NGO-Infrastruktur
            scheitern. Für größere Organisationen gibt es eine eigene Seite:{" "}
            <Link href="/ngo-briefkampagne" className="text-waldgruen hover:underline">Briefkampagnen für NGOs und Vereine</Link>.
          </p>

          <h2>Wie viele Briefe kommen bei einer Briefkampagne zusammen?</h2>
          <p>
            Das hängt davon ab, wie viele Menschen den Link sehen und wie sehr
            sie das Thema betrifft. Zwei Beispiele aus dem Oktober 2026: Die
            Kampagne{" "}
            <Link href="/kampagne/eeg-so-nicht" className="text-waldgruen hover:underline">
              EEG so nicht!
            </Link>{" "}
            von Klartext mit Lilly bittet Abgeordnete, der EEG-Novelle in der
            vorliegenden Form nicht zuzustimmen. Innerhalb von zwei Tagen haben
            darüber fast 1.000 Menschen einen eigenen Brief erstellt.
          </p>

          <FactCallout
            number="~1.000"
            label="Briefe in zwei Tagen, jeder an die Abgeordnete oder den Abgeordneten im eigenen Wahlkreis."
            source="Kampagne EEG so nicht!, Stand Oktober 2026"
          />

          <p>
            Die Initiative{" "}
            <Link href="/kampagne/afd-vor-gericht" className="text-waldgruen hover:underline">
              AfD vor Gericht
            </Link>{" "}
            bittet Abgeordnete, beim Bundesverfassungsgericht prüfen zu lassen,
            ob die AfD verfassungswidrig ist. Über ihre Kampagne sind fast 500 Briefe entstanden.
            Beide Kampagnen hatten eine Gemeinschaft, die den Link geteilt hat.
            Die Inhalte stammen von den Initiatoren, nicht von Brief nach
            Berlin.
          </p>

          <h2>Petition und Briefkampagne kombinieren: wie geht das?</h2>
          <p>
            Du musst dich nicht entscheiden. Viele Anliegen brauchen beides.
            Die Petition zeigt Breite: viele Unterschriften unter einer
            Forderung. Die Briefkampagne sorgt
            dafür, dass im Wahlkreisbüro einzelne Menschen mit Namen und
            Adresse ankommen.
          </p>
          <p>
            In der Praxis heißt das: Petition anlegen, Briefkampagne anlegen,
            beide Links in denselben Aufruf schreiben. Wer unterschrieben hat,
            bekommt als nächsten Schritt die Bitte, auch selbst zu schreiben.
            Wie du eine Petition beim Bundestag, beim Landtag oder online
            startest, steht in unserer{" "}
            <Link href="/petition-starten" className="text-waldgruen hover:underline">Anleitung zum Petition starten</Link>.
          </p>

          <h2>Wie starte ich eine politische Kampagne ohne Budget?</h2>
          <p>
            Fang klein an. Schreib nicht zuerst eine Strategie mit 17 Kanälen.
            Such drei Menschen, die das Problem ebenfalls betrifft, und schick
            ihnen einen konkreten Link. Wenn sie mitmachen, hast du ein Signal.
            Wenn sie nicht mitmachen, ist die Kampagne noch nicht klar genug.
          </p>
          <p>
            Die billigste Validierung ist eine Nachricht an echte Betroffene:
            &bdquo;Ich will dazu eine Briefkampagne starten. Würdest du deinen
            eigenen Brief schreiben, wenn ich dir den Einstieg vorbereite?&ldquo;
            Drei ehrliche Antworten sind mehr wert als 300 anonyme Klicks.
          </p>
        </Prose>

        <div className="mt-16 border-t border-warmgrau/10 pt-8">
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-4">
            Mehr dazu
          </p>
          <ul className="flex flex-col gap-3">
            <li>
              <Link
                href="/petition-starten"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Petition starten: Bundestag, Landtag oder online
              </Link>
            </li>
            <li>
              <Link
                href="/brief-oder-petition"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Brief oder Petition: was wirkt mehr?
              </Link>
            </li>
            <li>
              <Link
                href="/andere-tools"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Andere Tools für mehr Demokratie
              </Link>
            </li>
            <li>
              <Link
                href="/lohnt-sich-brief-an-politiker"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Lohnt es sich, einem Politiker zu schreiben?
              </Link>
            </li>
            <li>
              <Link
                href="/aktiv-werden"
                className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                Politisch aktiv werden, ohne gleich Profi zu sein
              </Link>
            </li>
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
            Willst du eine Briefkampagne starten?
          </p>
          <p className="font-body text-sm text-warmgrau/75 leading-relaxed mb-6">
            Beschreib dein Anliegen. Wir machen daraus den Einstieg, den andere
            persönlich anpassen können.
          </p>
          <Link
            href="/kampagne/starten"
            className="inline-block rounded-lg bg-waldgruen px-8 py-3 font-body font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
          >
            Kampagne anlegen
          </Link>
        </div>
      </main>
    </div>
  );
}
