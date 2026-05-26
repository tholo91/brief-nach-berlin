import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { PromptCopyBlock } from "@/components/PromptCopyBlock";
import {
  buildHintBullets,
  filterAllowedTags,
  sanitizeNotiz,
} from "@/lib/improve/feedbackHints";

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

const PROMPT_HEADER = `Du hast große Erfahrung im Schreiben politischer Briefe an Abgeordnete und ein Gespür für Sprache und Wirkung.

Ich habe einen KI-generierten Entwurf für einen Brief an meinen Abgeordneten erhalten. Den möchte ich jetzt verbessern: sprachlich, inhaltlich und vor allem so, dass er sich nach mir anhört, nicht nach einem Computer.

Bitte halte dich beim Überarbeiten an folgende Regeln:
- Formaler Briefstil, durchgehend Sie-Form
- Verändere die Länge des Briefes möglichst wenig
- Kein KI-Jargon, keine Floskeln, keine leeren Phrasen
- Wenn ich eine konkrete Änderung nenne, setze sie direkt um
- Was ich nicht erwähne, behalte so wie es ist`;

const PROMPT_FOOTER = `Hier ist der Entwurf, den du überarbeiten sollst:
[Hier deinen Brief-Entwurf aus der Mail einfügen]`;

const ANCHOR_AENDERN = "Das möchte ich am Brief ändern oder ergänzen:";
const ANCHOR_ENTWURF = "Hier ist der Entwurf, den du überarbeiten sollst:";
const DEFAULT_AENDERN_BODY = `[Hier deine Anmerkungen eintragen, z.B. "Absatz 2 klingt nicht nach mir", "Ton ist zu weich", "ich will auch X erwähnen"]`;

function buildImprovePrompt(bullets: string[]): string {
  const aendernBody = bullets.length > 0 ? bullets.join("\n") : DEFAULT_AENDERN_BODY;
  return [
    PROMPT_HEADER,
    "",
    ANCHOR_AENDERN,
    aendernBody,
    "",
    PROMPT_FOOTER,
  ].join("\n");
}

type SearchParamsShape = {
  gruende?: string | string[];
  notiz?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function BriefVerbessernPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const params = await searchParams;
  const gruende = filterAllowedTags(firstParam(params.gruende));
  const notiz = sanitizeNotiz(firstParam(params.notiz));
  const bullets = buildHintBullets(gruende, notiz);
  const hasFeedback = bullets.length > 0;
  const prompt = buildImprovePrompt(bullets);

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
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-8 text-pretty">
          Der Entwurf aus der Mail ist ein Schnellstart. Mit ein paar Minuten und
          einem guten Prompt wird er zu einem Brief, der sich wirklich nach dir
          anhört.
        </p>

        {hasFeedback ? (
          <div className="mb-12 rounded-lg border-2 border-waldgruen/40 bg-waldgruen/10 px-5 py-4">
            <p className="font-body text-base text-waldgruen-dark leading-relaxed">
              <span className="font-bold">Dein Feedback ist im Prompt drin.</span>{" "}
              Schau unten gerne nochmal drüber und ergänze, was fehlt.
            </p>
          </div>
        ) : null}

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
            text={prompt}
            boldLines={[ANCHOR_AENDERN, ANCHOR_ENTWURF]}
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

        {hasFeedback ? (
          <div className="mt-12 rounded-lg border border-waldgruen/20 bg-creme/60 px-5 py-4">
            <p className="font-body text-sm text-warmgrau leading-relaxed">
              <span className="font-semibold text-waldgruen-dark">
                Hat es geholfen?
              </span>{" "}
              Wenn der überarbeitete Brief jetzt besser passt, klick gern in
              deiner ursprünglichen E-Mail noch einmal auf einen Stern. So sehen
              wir, ob unser Verbesserungs-Prompt funktioniert hat.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
