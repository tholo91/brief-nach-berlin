import Link from "next/link";
import Image from "next/image";
import { Figure } from "@/components/editorial/Figure";
import { Prose } from "@/components/editorial/Prose";
import type { Metadata } from "next";
import { APP_URL, FOUNDER_LINKEDIN, FOUNDER_FEEDBACK_URL } from "@/lib/config";

const TITLE = "Andere Tools für mehr Demokratie";
const DESCRIPTION =
  "LiebeMdB, WeAct, innn.it, openPetition, Abgeordnetenwatch: Wo Brief-nach-Berlin sich abgrenzt und wo die anderen Tools die bessere Wahl sind. Ein ehrlicher Überblick.";
const URL_PATH = "/andere-tools";
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

type Tool = {
  name: string;
  url: string;
  what: string;
  good: string;
  different: string;
  extra?: string;
};

type Category = {
  id: string;
  label: string;
  intro: string;
  tools: Tool[];
};

const categories: Category[] = [
  {
    id: "direktkontakt",
    label: "Direktkontakt zu Abgeordneten",
    intro:
      "Tools, die dich dabei unterstützen, persönlich an einzelne Politikerinnen und Politiker zu schreiben. Hier ist Brief-nach-Berlin selbst zu Hause.",
    tools: [
      {
        name: "LiebeMdB.org",
        url: "https://liebemdb.org",
        what: "Hilft dir, eine E-Mail oder einen Brief an deine Bundestagsabgeordneten zu formulieren, ähnlich wie wir.",
        good: "Wenn du schon weißt, was du sagen willst, und das Tool direkt zur Formulierung nutzt. Ein guter Begleiter, wenn du regelmäßig an Abgeordnete schreibst.",
        different:
          "Brief-nach-Berlin denkt strikt vom analogen Briefkasten her: handgeschrieben, abgeschickt, ein Adressat, eine konkrete Bitte. Das ist absichtlich aufwändiger und genau deshalb landet so ein Brief mit höherer Wahrscheinlichkeit auf dem Schreibtisch und nicht im Spam-Ordner. Außerdem führen wir dich vom diffusen Frust bis zum fertigen Brief, auch wenn du noch keine klare Forderung hast.",
      },
    ],
  },
  {
    id: "petitionen",
    label: "Petitionen, Kampagnen und Volksbegehren",
    intro:
      "Plattformen, die viele Stimmen zu einer gemeinsamen Forderung bündeln. Von der einfachen Online-Petition bis zum rechtssicheren Volksbegehren.",
    tools: [
      {
        name: "WeAct (Campact)",
        url: "https://weact.campact.de",
        what: "Eine Plattform, auf der du eigene Petitionen starten oder bestehende mitzeichnen kannst. Getragen von Campact, mit großer Reichweite.",
        good: "Wenn du ein Anliegen hast, das viele Menschen teilen, und du gemeinsam Druck aufbauen willst. Petitionen sind stark, wenn es um Sichtbarkeit, Medien und politische Aufmerksamkeit geht.",
        different:
          "Eine Petition ist ein kollektives Signal. Ein Brief-nach-Berlin-Brief ist ein persönliches Signal an genau eine Person, deinen Wahlkreisabgeordneten. Beides hat seinen Platz: Petitionen wirken auf das politische Klima, Briefe wirken auf konkrete Postfächer in Abgeordnetenbüros. Wir empfehlen ausdrücklich, beides zu nutzen.",
      },
      {
        name: "innn.it",
        url: "https://innn.it",
        what: "Hilft dir, echte Volksbegehren und Bürgerbegehren rechtssicher auf den Weg zu bringen. Das ist direkte Demokratie auf Landes- und Kommunalebene.",
        good: "Wenn du nicht nur eine Botschaft senden, sondern tatsächlich Gesetze oder kommunale Entscheidungen herbeiführen willst. Das ist das stärkste Instrument unterhalb einer Wahl.",
        different:
          "innn.it ist die schwerste Stufe der Mitwirkung mit dem höchsten Hebel. Brief-nach-Berlin ist die leichteste Einstiegsstufe. Wer noch nie politisch geschrieben hat, fängt nicht mit einem Volksbegehren an. Aber wer einmal einen Brief geschrieben und eine Antwort bekommen hat, ist näher dran, sich auch an ein Volksbegehren zu trauen.",
      },
      {
        name: "Change.org und openPetition",
        url: "https://www.openpetition.de",
        what: "Petitionsplattformen mit großer Reichweite und niedriger Einstiegshürde. Du unterschreibst mit einem Klick, oder startest selbst eine Petition.",
        good: "Wenn du eine bestehende Petition mit deiner Unterschrift unterstützen oder schnell eine Kampagne starten willst. Sehr gut für viral verbreitbare Anliegen.",
        different:
          "Eine Unterschrift in einer Liste ist ein wichtiger Akt, aber sie ist anonym in der Masse. Ein Brief-nach-Berlin-Brief trägt deinen Namen, deine Postleitzahl, deine Worte. Er landet bei einer Person, die du gewählt hast oder hättest wählen können. Das ist eine andere Tonlage als eine Petition, kein Ersatz, sondern ein Zusatzkanal.",
      },
    ],
  },
  {
    id: "transparenz",
    label: "Transparenz, Daten und Recherche",
    intro:
      "Die Infrastruktur dahinter: Plattformen, die offene Daten über Abgeordnete und politische Prozesse bereitstellen. Ohne sie könnten Tools wie Brief-nach-Berlin gar nicht existieren.",
    tools: [
      {
        name: "Abgeordnetenwatch.de",
        url: "https://www.abgeordnetenwatch.de",
        what: "Die zentrale deutsche Plattform für parlamentarische Transparenz. Profile aller Bundestagsabgeordneten, Landtagsabgeordneten und EU-Abgeordneten, ihr Abstimmungsverhalten, Nebeneinkünfte, Lobbykontakte. Du kannst Fragen stellen und die öffentlichen Antworten lesen.",
        good: "Wenn du verstehen willst, wer deine Abgeordneten eigentlich sind, wie sie abstimmen, und welche Themen sie vertreten. Auch perfekt, um eine öffentliche Frage zu stellen, die dann sichtbar dokumentiert wird.",
        different:
          "Abgeordnetenwatch ist keine Konkurrenz, sondern Fundament. Brief-nach-Berlin nutzt die offenen Daten von Abgeordnetenwatch, um aus deiner Postleitzahl die richtige Ansprechperson im Bundestag zu ermitteln. Ohne die jahrelange Arbeit dieses Vereins gäbe es Brief-nach-Berlin nicht.",
        extra:
          "Die Datenqualität von Abgeordnetenwatch ist in Deutschland einzigartig: CC0-lizenziert, sauber gepflegt, mit klarer API. Wer wissen will, wie politische Transparenz technisch aussehen kann, sollte sich das Projekt anschauen. Wir verlinken bei jedem generierten Brief direkt auf das Abgeordnetenwatch-Profil der jeweiligen Person, damit du nachschauen kannst, mit wem du es zu tun hast.",
      },
      {
        name: "FragDenStaat.de",
        url: "https://fragdenstaat.de",
        what: "Eine Plattform, über die du IFG-, UIG- und VIG-Anfragen an Behörden stellen kannst, ohne Jura-Studium. Anfragen und Antworten werden öffentlich dokumentiert, daraus entstehen oft Recherchen und Klagen, die echte Aktenfunde freilegen. Getragen von der Open Knowledge Foundation Deutschland.",
        good: "Wenn dein Frust eine konkrete Frage hat, auf die eine Behörde eine Antwort kennt, sie aber nicht von selbst rausrückt. Bauanträge, Studien, interner Mailverkehr, Verträge, Gutachten. Auch stark als Recherche-Schritt, bevor du an Politik schreibst.",
        different:
          "FragDenStaat holt Informationen aus dem System heraus, Brief-nach-Berlin trägt deine Botschaft ins System hinein. Beides greift oft ineinander: eine IFG-Anfrage liefert die Fakten, der Brief an die MdB übersetzt sie in eine politische Forderung. Wer ein Anliegen ernsthaft betreibt, nutzt beides nacheinander.",
      },
    ],
  },
  {
    id: "verwaltung",
    label: "Verwaltung und Behörden besser machen",
    intro:
      "Wenn dein Frust nicht beim Gesetz, sondern beim Behördenweg anfängt: kaputte Anträge, endlose Formulare, fehlende Digitalisierung. Hier gibt es einen anderen Hebel als den Brief an den Bundestag.",
    tools: [
      {
        name: "Deutschland, was geht? (SPRIN-D)",
        url: "https://deutschland-was-geht.org",
        what: "Eine Initiative der Bundesagentur für Sprunginnovationen (SPRIN-D). Bürger:innen melden, was sie an deutscher Verwaltung nervt. Aus den Einreichungen wählt eine Bürgerjury gemeinsam mit SPRIN-D Themen aus, 15 davon werden finanziert und fünf sollen bis Ende 2026 tatsächlich in Behörden eingeführt werden, als Open-Source-Software. Das Vorbild sind die Presidential Hackathons aus Taiwan.",
        good: "Wenn dein Frust an einem konkreten Behördengang festgemacht ist: ein Antrag ist unverständlich, ein Portal stürzt ab, ein Prozess dauert neun Monate ohne Grund. Kurz: Probleme, die sich mit besserer Software oder klügerem Prozessdesign lösen lassen.",
        different:
          "Brief-nach-Berlin schreibt an Menschen, die Gesetze machen und politische Richtung bestimmen. „Deutschland, was geht?” zielt auf etwas anderes: Verwaltungsprozesse, die sich mit besserer Software reparieren lassen, ohne dass dafür ein neues Gesetz nötig wäre. Je nachdem, wo dein Problem sitzt, ist mal das eine, mal das andere das richtige Werkzeug. Manchmal auch beides.",
      },
    ],
  },
];

export default function AndereToolsPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Im Vergleich
          </p>
          <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
            Andere Tools für mehr Demokratie
          </h1>

          <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-2 text-pretty">
            Brief-nach-Berlin ist nicht die einzige Antwort auf die Frage &bdquo;Wie
            mische ich mich ein?&ldquo;. Es gibt großartige Initiativen, die das
            schon viel länger machen. Hier zeige ich dir, welche das sind, wann sie
            die bessere Wahl sind, und warum Brief-nach-Berlin trotzdem etwas Eigenes
            beitragen kann.
          </p>

        <nav
          aria-label="Inhaltsverzeichnis"
          className="mb-14 p-5 md:p-6 bg-waldgruen/[0.04] border border-waldgruen/15 rounded-xl"
        >
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Springe zu
          </p>
          <ol className="font-body text-base text-warmgrau space-y-3">
            {categories.map((cat, idx) => (
              <li key={cat.id} className="flex gap-3">
                <span
                  aria-hidden
                  className="font-typewriter text-sm font-bold text-waldgruen/70 tabular-nums w-5 shrink-0 pt-0.5"
                >
                  {idx + 1}.
                </span>
                <div>
                  <a
                    href={`#${cat.id}`}
                    className="text-waldgruen-dark font-semibold hover:text-waldgruen hover:underline underline-offset-4 decoration-waldgruen/40"
                  >
                    {cat.label}
                  </a>
                  <span className="block text-sm text-warmgrau/70 mt-0.5">
                    {cat.tools.map((t) => t.name).join(", ")}
                  </span>
                </div>
              </li>
            ))}
            <li className="flex gap-3 pt-2 mt-1 border-t border-waldgruen/15">
              <span aria-hidden className="w-5 shrink-0" />
              <a
                href="#feedback"
                className="text-waldgruen-dark hover:text-waldgruen hover:underline underline-offset-4 decoration-waldgruen/40"
              >
                Feedback an Thomas
              </a>
            </li>
          </ol>
        </nav>

        <Prose>
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-2">
            Demokratie ist Teamarbeit
          </h2>

          <Figure
            src="/images/img-drei-briefe.webp"
            width={280}
            height={188}
            side="left"
            rotate="right"
          />

          <p>
            Ich sehe Brief-nach-Berlin nicht als Konkurrenz zu anderen
            Demokratie-Tools, sondern als einen weiteren Hebel im selben
            Werkzeugkasten. Je nach Anliegen ist mal das eine, mal das andere
            das richtige Werkzeug. Wer in Deutschland und in Europa
            demokratische Strukturen am Leben halten will, sollte mehrere
            dieser Tools kennen und nutzen.
          </p>
          <p>
            Deshalb hier ein ehrlicher Überblick, was die anderen tun, wo sie
            stark sind, und wo Brief-nach-Berlin etwas anderes versucht.
          </p>

          {categories.map((cat, idx) => (
            <section
              key={cat.id}
              id={cat.id}
              className="not-prose pt-10 scroll-mt-8"
            >
              <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/60 mb-2">
                Kategorie {idx + 1}
              </p>
              <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark mb-3">
                {cat.label}
              </h2>
              <p className="font-body text-warmgrau leading-[1.85] text-base md:text-lg mb-8">
                {cat.intro}
              </p>

              <div className="space-y-8">
                {cat.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="border-l-4 border-waldgruen/30 pl-5 md:pl-6 space-y-3"
                  >
                    <h3 className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
                      >
                        {tool.name}
                      </a>
                    </h3>
                    <div>
                      <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/60 mb-1">
                        Was es ist
                      </p>
                      <p className="font-body text-warmgrau leading-[1.85] text-base md:text-lg">
                        {tool.what}
                      </p>
                    </div>
                    <div>
                      <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/60 mb-1">
                        Wann es die bessere Wahl ist
                      </p>
                      <p className="font-body text-warmgrau leading-[1.85] text-base md:text-lg">
                        {tool.good}
                      </p>
                    </div>
                    <div>
                      <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/60 mb-1">
                        Was Brief nach Berlin anders macht
                      </p>
                      <p className="font-body text-warmgrau leading-[1.85] text-base md:text-lg">
                        {tool.different}
                      </p>
                    </div>
                    {tool.extra && (
                      <div className="mt-4 p-4 bg-waldgruen/[0.06] border border-waldgruen/15 rounded-lg">
                        <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/70 mb-2">
                          Warum das hier wichtig ist
                        </p>
                        <p className="font-body text-warmgrau leading-[1.7] text-sm md:text-base">
                          {tool.extra}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-10">
            Die kurze Version
          </h2>
          <p>
            Brief-nach-Berlin füllt eine sehr spezifische Lücke: der einzelne,
            handgeschriebene Brief an die eine Person, die deinen Wahlkreis im
            Bundestag vertritt. Kein Massenversand, keine Unterschriftensammlung,
            keine Kampagne. Eine Stimme, eine Adresse, ein analoger Umschlag im
            Briefkasten.
          </p>
          <p>
            Genau das ist nicht die größte Hebelwirkung, aber es ist die
            niedrigste Einstiegshürde in eine politische Handlung mit deinem
            Namen drauf. Und es ist der Kanal, der im Bundestag tatsächlich
            gelesen und im Wahlkreisbüro besprochen wird, gerade weil so wenige
            Menschen ihn nutzen.
          </p>
          <p>
            Wenn du also schon bei WeAct unterzeichnest, ein Volksbegehren bei
            innn.it mitträgst, Fragen über Abgeordnetenwatch stellst und
            LiebeMdB für deine Lieblings-Themen nutzt: super. Ein zusätzlicher
            handgeschriebener Brief zu einem Anliegen, das dich persönlich
            betrifft, ist trotzdem etwas, das diese Kanäle nicht ersetzen
            können.
          </p>

          <div className="not-prose my-10 p-6 md:p-8 bg-waldgruen/[0.06] border-l-4 border-waldgruen rounded-r-xl">
            <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/70 mb-3">
              Übrigens
            </p>
            <p className="font-handwriting text-xl md:text-2xl text-waldgruen-dark leading-snug mb-3">
              Brief-nach-Berlin wurde in der{" "}
              <a
                href="https://lagedernation.org/podcast/ldn478-hantavirus-warum-wir-heute-schlechter-dastehen-als-vor-corona/#shownotes"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-waldgruen/40 underline-offset-4 hover:decoration-waldgruen"
              >
                Lage der Nation (Folge 478)
              </a>{" "}
              empfohlen. Seitdem haben sich die Nutzerzahlen versechsfacht.
            </p>
            <p className="font-body text-sm text-warmgrau">
              Das hier ist ein Indie-Projekt, kein NGO-Apparat. Jede ehrliche
              Rückmeldung hilft, es besser zu machen.
            </p>
          </div>
        </Prose>

        <section id="feedback" className="mt-12 scroll-mt-8">
          <div className="p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
            <h2 className="font-body text-2xl font-bold text-waldgruen-dark mb-3">
              Fehlt dir ein Tool? Funktioniert etwas nicht?
            </h2>
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-4">
              <div className="shrink-0">
                <Image
                  src="/images/thomas-portrait.webp"
                  alt="Thomas Lorenz, der hinter Brief-nach-Berlin steht"
                  width={400}
                  height={360}
                  className="w-[140px] h-auto rounded-2xl border-4 border-creme shadow-lg shadow-waldgruen/20"
                />
              </div>
              <p className="font-body text-warmgrau leading-relaxed">
                Ich bin Thomas Lorenz, Indie Builder aus Bremen und der Mensch
                hinter Brief-nach-Berlin. Ich baue das Projekt allein, neben
                anderen Sachen, und ich bin stark auf Feedback angewiesen.
              </p>
            </div>
            <p className="font-body text-warmgrau leading-relaxed mb-6">
              Wenn dir hier ein wichtiges Tool fehlt, du eine bessere
              Einordnung hast, oder dir an Brief-nach-Berlin selbst etwas
              auffällt, das nicht stimmt oder fehlt: schreib mir. Auch
              kritisches Feedback ist willkommen, gerade das.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={FOUNDER_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-waldgruen text-creme font-body text-sm font-semibold px-4 py-2 rounded-lg hover:bg-waldgruen-dark transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                Feedback per Sprachnachricht oder Text
              </a>
              <a
                href={FOUNDER_LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-creme border-2 border-waldgruen text-waldgruen font-body text-sm font-semibold px-4 py-2 rounded-lg hover:bg-waldgruen/5 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.23 0z" />
                </svg>
                Auf LinkedIn schreiben
              </a>
            </div>
          </div>
        </section>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed space-y-3">
          <p>
            Mehr zur Geschichte und Motivation hinter dem Projekt:{" "}
            <Link href="/warum" className="text-waldgruen hover:underline">
              Warum es Brief-nach-Berlin gibt
            </Link>
            .
          </p>
          <p>
            Wenn du wissen willst, warum gerade ein handgeschriebener Brief
            mehr bewirkt als eine E-Mail, lies{" "}
            <Link href="/warum-ein-brief" className="text-waldgruen hover:underline">
              Warum ein Brief mehr ist als ein Brief
            </Link>
            .
          </p>
        </div>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl hover:bg-waldgruen/10 transition-colors">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark mb-4">
            Probier es aus
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Sag uns, was dich stört, und deine Postleitzahl. Drei Minuten
            später hast du einen Brief, den du in Ruhe abschreiben kannst.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Mit deinem Brief anfangen &rarr;
          </Link>
          <p className="mt-4 font-body text-sm text-warmgrau/60">
            Kostenlos, ohne Anmeldung, ohne Tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
