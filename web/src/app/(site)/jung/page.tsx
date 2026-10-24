import type { Metadata } from "next";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { JungExperience } from "@/components/jung/JungExperience";
import { resolveJungEntry } from "@/components/jung/jungEntry";
import { APP_URL } from "@/lib/config";

const URL_PATH = "/jung";
const CANONICAL_URL = `${APP_URL}${URL_PATH}`;
const TITLE = "Brief an die Politik für Schüler:innen";
const DESCRIPTION =
  "Du darfst noch nicht wählen, aber schreiben: Thema wählen, Erlebnis beschreiben und einen Briefentwurf an deine Abgeordneten bekommen. Kostenlos, ohne Account.";

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "de_DE",
    url: CANONICAL_URL,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const faqs = [
  {
    q: "Darf ich als Schüler:in an Abgeordnete schreiben?",
    a: "Ja. Jede Person darf sich an Abgeordnete wenden, egal wie alt sie ist und ob sie schon wählen darf. Abgeordnete vertreten alle Menschen in ihrem Wahlkreis, auch die, die noch nicht wählen dürfen.",
  },
  {
    q: "Warum soll ich den Brief von Hand abschreiben?",
    a: "Ein handgeschriebener Brief fällt im Büro auf und zeigt, dass dir das Thema wirklich wichtig ist. Schreib beim Abschreiben ein eigenes Erlebnis dazu, dann ist es dein Brief und nicht der der KI.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Du gibst eine E-Mail-Adresse und eine Postleitzahl an. Die E-Mail brauche ich, um dir den Entwurf zu schicken. Du bekommst nur diese eine Mail, keine Werbung und keine Erinnerungen. Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich. Mehr steht in der Datenschutzerklärung.",
    aNode: (
      <>
        Du gibst eine E-Mail-Adresse und eine Postleitzahl an. Die E-Mail brauche ich, um dir den Entwurf zu schicken. Du bekommst nur diese eine Mail, keine Werbung und keine Erinnerungen. Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich. Mehr steht in der{" "}
        <Link href="/datenschutz" className="font-semibold text-waldgruen underline underline-offset-2">
          Datenschutzerklärung
        </Link>
        .
      </>
    ),
  },
  {
    q: "Was mache ich, wenn im Entwurf etwas Falsches steht?",
    a: "Lies den Entwurf genau, die KI kann sich irren. Streich, was nicht stimmt, und schreib es beim Abschreiben richtig. Du unterschreibst den Brief, also zählt, was du für richtig hältst.",
  },
  {
    q: "Kostet das etwas?",
    a: "Das Tool ist kostenlos und du brauchst keinen Account. Für den Brief brauchst du nur einen Umschlag und eine Briefmarke.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: TITLE,
      description: DESCRIPTION,
      url: CANONICAL_URL,
      inLanguage: "de-DE",
      isPartOf: { "@id": `${APP_URL}/#website` },
      publisher: { "@id": `${APP_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const steps = [
  { title: "Anliegen aufschreiben", text: "ein Thema und ein eigenes Erlebnis, das dauert zwei Minuten." },
  {
    title: "Entwurf bekommen",
    text: "Ich suche die zuständige Person in Bund, Land oder Gemeinde und schicke dir den Entwurf per Mail.",
  },
  {
    title: "Von Hand abschreiben",
    text: "Mit einem eigenen Satz wird es dein Brief. Dann Briefmarke drauf und ab zur Post.",
  },
];

export default async function JungPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { k } = await searchParams;
  const entry = resolveJungEntry(k);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto w-full max-w-xl px-5 pb-16 pt-6 sm:pt-10">
        {entry.status === "valid" && (
          <p role="status" className="mb-5 rounded-lg border border-waldgruen/25 bg-waldgruen/5 px-4 py-3 font-body text-sm text-waldgruen-dark">
            Über den Klassenlink sind Klasse {entry.klasse} und PLZ {entry.plz} schon eingetragen.
          </p>
        )}
        {entry.status === "invalid" && (
          <p role="status" className="mb-5 rounded-lg border border-bernstein/50 bg-bernstein/10 px-4 py-3 font-body text-sm text-warmgrau">
            Dieser Klassenlink ist abgelaufen oder ungültig. Frag deine Lehrkraft nach einem neuen. Schreiben kannst du trotzdem.
          </p>
        )}

        <h1 className="font-typewriter text-[2rem] font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-4xl">
          Wählen darfst du noch nicht.
          <span className="mt-1 block origin-left -rotate-1 font-handwriting text-4xl font-normal text-waldgruen sm:text-5xl">
            Schreiben schon.
          </span>
        </h1>
        <p className="mb-7 mt-4 font-body text-base leading-relaxed text-warmgrau sm:text-lg">
          Erzähl, was dich an der Schule, in deinem Ort oder bei deiner Zukunft stört. Ich finde heraus, wer in der Politik dafür zuständig ist, und schreibe dir einen Entwurf. Du schreibst ihn von Hand ab und schickst ihn mit der Post.
        </p>

        <JungExperience entry={entry} />

        <section aria-labelledby="jung-so-geht-s" className="mt-14">
          <h2 id="jung-so-geht-s" className="font-typewriter text-2xl font-bold text-waldgruen-dark">So geht&apos;s</h2>
          <ol className="mt-5 space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-waldgruen/40 font-typewriter text-sm font-bold text-waldgruen">
                  {index + 1}
                </span>
                <p className="font-body text-base leading-relaxed text-warmgrau">
                  <strong className="font-bold text-waldgruen-dark">{step.title}:</strong> {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="jung-faq" className="mt-14">
          <h2 id="jung-faq" className="mb-4 font-typewriter text-2xl font-bold text-waldgruen-dark">Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </section>

        <p className="mt-10 font-body text-sm leading-relaxed text-warmgrau/80">
          Du bist Lehrkraft? Auf der{" "}
          <Link href="/schule" className="font-semibold text-waldgruen underline underline-offset-2">
            Seite für Schulen
          </Link>{" "}
          gibt es einen Klassenlink mit QR-Code und einen Ablauf für 45 oder 90 Minuten.
        </p>
      </div>
    </>
  );
}
