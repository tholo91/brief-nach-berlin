import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FactCallout } from "@/components/editorial/FactCallout";

const URL_PATH = "/kampagne-starten";
const PUBLISHED = "2026-07-01";
const TITLE =
  "Kampagne starten: Alternative zu Petition und Massenmail | Brief nach Berlin";
const DESCRIPTION =
  "Briefkampagne starten ohne Massenmail: Anliegen anlegen, Link teilen, andere schreiben eigene Briefe an Abgeordnete, als Alternative zu Petition und WeAct.";

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
    q: "Was kostet eine Kampagne?",
    a: "Der Kampagnenstart ist aktuell kostenlos. Perspektivisch soll daraus ein bezahlbares Angebot für Initiativen, Vereine und Einzelpersonen werden, nicht nur für große Organisationen mit Kampagnenbudget.",
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
          <p>
            Das Feature ist für Menschen gedacht, die ein Anliegen nicht allein
            tragen wollen, aber auch keine klassische Petitionskampagne
            starten möchten. Zum Beispiel eine lokale Initiative, ein kleiner
            Verein, eine Elternvertretung, eine Mietergruppe oder eine Person,
            die schon zehn andere Betroffene kennt.
          </p>
          <p>
            Der Kampagnenstart ist aktuell kostenlos. Perspektivisch soll daraus
            ein bezahlbares Angebot werden, damit auch kleine Initiativen nicht
            bei Agenturpreisen oder NGO-Infrastruktur hängen bleiben. Der Kern
            bleibt gleich: Kampagne anlegen, Link teilen, persönliche Briefe
            ermöglichen.
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
