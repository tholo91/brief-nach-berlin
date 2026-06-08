import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { PromptCopyBlock } from "@/components/PromptCopyBlock";
import { FAQAccordion } from "@/components/FAQAccordion";
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
const DEFAULT_AENDERN_BODY = `[Hier deine Anmerkungen eintragen, z.B. "Absatz 2 klingt zu sehr nach KI", "Ton ist zu weich", "ich will auch X erwähnen"]`;

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
    <div className="min-h-screen bg-creme px-6 py-20 overflow-x-clip">
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
          <div className="mb-12 lg:hidden rounded-lg border-2 border-waldgruen/40 bg-waldgruen/10 px-5 py-4">
            <p className="font-body text-base text-waldgruen-dark leading-relaxed">
              Das Feedback aus deiner Bewertung ist im neuen Prompt enthalten:
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
            annotations={[
              {
                anchorLine: ANCHOR_AENDERN,
                label: "Pack hier deine\nWünsche rein!",
                side: "left",
                tone: "yellow",
                offsetY: 28,
              },
              ...(hasFeedback
                ? [
                    {
                      anchorLine: ANCHOR_AENDERN,
                      label: "deine Kritikpunkte\nsind schon drin",
                      side: "left" as const,
                      tone: "green" as const,
                      offsetY: -32,
                      offsetX: 70,
                      compact: true,
                      arrow: false,
                      rotateClass: "rotate-6",
                    },
                  ]
                : []),
              {
                anchorLine: ANCHOR_ENTWURF,
                label: "Hier den Brief\naus der Mail!",
                side: "right",
                tone: "yellow",
                offsetY: 24,
              },
            ]}
          />
        </div>

        <FAQAccordion
          items={[
            {
              q: "Welche Anmerkungen helfen?",
              a: "Was dich stört oder fehlt: Tonfall, eine falsche Aussage, ein fehlender persönlicher Bezug, ein konkretes Beispiel. Was du nicht erwähnst, bleibt wie es ist.",
            },
            {
              q: "Timing zählt",
              a: "Wenn dein Thema gerade im Bundestag debattiert wird oder kurz vor einer Abstimmung steht, schreib das in den ersten Satz, z.B. „angesichts der Abstimmung am 12. Juni“. Ein Brief, der diese Woche aufschlägt, wirkt stärker als einer, der irgendwann gelesen wird.",
            },
            {
              q: "Warum Mistral?",
              a: "Europäischer Anbieter, kostenlos, im direkten Vergleich besonders stark beim deutschen Umformulieren. ChatGPT oder Gemini gehen natürlich auch.",
            },
            {
              q: "Und dann?",
              aNode: (
                <>
                  Abschreiben, frankieren, absenden. Handgeschriebene Briefe
                  werden im Bundestag wirklich gelesen. Tipps zu Länge, Adresse
                  und Tonfall in den{" "}
                  <Link href="/tipps" className="text-waldgruen hover:underline">
                    Tipps für den perfekten Brief
                  </Link>
                  .
                </>
              ),
            },
          ]}
        />

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
