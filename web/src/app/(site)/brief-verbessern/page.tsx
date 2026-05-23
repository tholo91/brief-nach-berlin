import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { PromptCopyBlock } from "@/components/PromptCopyBlock";

const TITLE = "Brief verbessern";
const DESCRIPTION =
  "Der KI-Entwurf ist ein Schnellstart. So verbesserst du ihn mit Mistral oder ChatGPT in wenigen Minuten, damit er sich wirklich nach dir anhört.";
const URL_PATH = "/brief-verbessern";
const PUBLISHED = "2026-05-23";

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

const IMPROVE_PROMPT = `Du hast große Erfahrung im Schreiben politischer Briefe an Abgeordnete und ein Gespür für Sprache und Wirkung.

Ich habe einen KI-generierten Entwurf für einen Brief an meinen Abgeordneten erhalten. Den möchte ich jetzt verbessern: sprachlich, inhaltlich und vor allem so, dass er sich nach mir anhört, nicht nach einem Computer.

Bitte halte dich beim Überarbeiten an folgende Regeln:
- Formaler Briefstil, durchgehend Sie-Form
- Verändere die Länge des Briefes möglichst wenig
- Kein KI-Jargon, keine Floskeln, keine leeren Phrasen
- Wenn ich eine konkrete Änderung nenne, setze sie direkt um
- Was ich nicht erwähne, behalte so wie es ist

Das möchte ich am Brief ändern oder ergänzen:
[Hier deine Anmerkungen eintragen, z.B. "Absatz 2 klingt nicht nach mir", "Ton ist zu weich", "ich will auch X erwähnen"]

Hier ist der Entwurf, den du überarbeiten sollst:
[Hier deinen Brief-Entwurf aus der Mail einfügen]`;

export default function BriefVerbessernPage() {
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
          Brief verfeinern
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Aus dem Entwurf deinen Brief machen
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
          Der Entwurf aus der Mail ist ein Schnellstart. Mit ein paar Minuten und
          einem guten Prompt wird er zu einem Brief, der sich wirklich nach dir
          anhört.
        </p>

        <Prose>
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            So funktioniert es
          </h2>
          <p>
            Öffne{" "}
            <a
              href="https://chat.mistral.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-waldgruen hover:underline"
            >
              Mistral
            </a>{" "}
            (oder ChatGPT, Gemini, was du nutzt). Füge den Prompt ein, schreib
            deine Anmerkungen hinein und setze deinen Briefentwurf aus der Mail
            ganz ans Ende. Dann abschicken.
          </p>
        </Prose>

        {/* Prompt block directly after the first paragraph */}
        <div className="mt-6 mb-12">
          <PromptCopyBlock
            text={IMPROVE_PROMPT}
            boldLines={[
              "Das möchte ich am Brief ändern oder ergänzen:",
              "Hier ist der Entwurf, den du überarbeiten sollst:",
            ]}
          />
        </div>

        <Prose>
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Was gehört in deine Anmerkungen?
          </h2>
          <p>
            Nur das, was dich wirklich stört oder was fehlt. Ein paar Beispiele:
          </p>
          <ul className="list-disc list-inside space-y-1 text-warmgrau">
            <li>
              &ldquo;Der Tonfall ist zu förmlich, ich würde das direkter sagen.&rdquo;
            </li>
            <li>
              &ldquo;Im zweiten Absatz wird eine Aussage getroffen, die nicht stimmt.&rdquo;
            </li>
            <li>
              &ldquo;Ich möchte auch erwähnen, dass ich selbst betroffen bin, weil...&rdquo;
            </li>
            <li>
              &ldquo;Der Brief klingt zu allgemein, ich will ein konkretes Beispiel einbauen.&rdquo;
            </li>
          </ul>
          <p>
            Du musst nicht alles aufzählen. Was du nicht erwähnst, bleibt so wie
            es ist.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Warum Mistral?
          </h2>
          <p>
            Mistral ist ein europäischer Anbieter mit Sitz in Paris, kostenlos
            nutzbar und im direkten Vergleich besonders stark beim Umformulieren
            von Fließtext auf Deutsch. Wer schon ChatGPT oder Gemini nutzt, kann
            natürlich auch die nehmen.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Und dann?
          </h2>
          <p>
            Wenn du mit dem überarbeiteten Brief zufrieden bist: abschreiben,
            frankieren, absenden. Handgeschriebene Briefe werden im Bundestag
            tatsächlich gelesen und registriert. Das ist der Punkt.
          </p>
          <p>
            Was einen guten Brief ausmacht, welche Länge funktioniert und wie du
            ihn adressierst, steht in unseren{" "}
            <Link
              href="/tipps"
              className="text-waldgruen hover:underline"
            >
              Tipps für den perfekten Brief
            </Link>
            .
          </p>
          <p>
            Wenn du den Entwurf grundsätzlich nicht mochtest, schreib uns gerne
            Feedback. In der Mail ist eine Sterne-Bewertung, über die das bei
            uns direkt ankommt.
          </p>
        </Prose>
      </div>
    </div>
  );
}
