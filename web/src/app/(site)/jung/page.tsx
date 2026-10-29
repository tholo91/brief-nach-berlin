import type { Metadata } from "next";
import Link from "next/link";
import LoopVideoBackground from "@/components/LoopVideoBackground";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Figure } from "@/components/editorial/Figure";
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
    q: "Ab wann darf ich wählen?",
    a: "Das hängt von der Wahl ab. Bei der Bundestagswahl bist du ab 18 dabei, bei der Europawahl ab 16. Bei Landtagswahlen dürfen 16-Jährige in Baden-Württemberg, Brandenburg, Bremen, Hamburg, Mecklenburg-Vorpommern und Schleswig-Holstein wählen, in Nordrhein-Westfalen ab der Landtagswahl 2027. Bei Kommunalwahlen liegt die Grenze in vielen Ländern bei 16. Stand: Oktober 2026. Schreiben darfst du unabhängig davon jederzeit.",
  },
  {
    q: "Warum soll ich den Brief von Hand abschreiben?",
    a: "Ein handgeschriebener Brief fällt im Büro auf und zeigt, dass dir das Thema wirklich wichtig ist. Schreib beim Abschreiben ein eigenes Erlebnis dazu, dann ist es dein Brief und nicht der der KI.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Du gibst eine E-Mail-Adresse und eine Postleitzahl an. Die E-Mail brauche ich, um dir eine Kopie des Entwurfs zu schicken. Du bekommst nur diese eine Mail, keine Werbung und keine Erinnerungen. Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich. Mehr steht in der Datenschutzerklärung.",
    aNode: (
      <>
        Du gibst eine E-Mail-Adresse und eine Postleitzahl an. Die E-Mail brauche ich, um dir eine Kopie des Entwurfs zu schicken. Du bekommst nur diese eine Mail, keine Werbung und keine Erinnerungen. Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich. Mehr steht in der{" "}
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

const h2Class = "font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl";

const steps = [
  { title: "Anliegen aufschreiben", text: "Ein Thema und ein eigenes Erlebnis, das dauert zwei Minuten." },
  {
    title: "Entwurf bekommen",
    text: "Ich suche die zuständige Person in Bund, Land oder Gemeinde. Den Entwurf siehst du direkt, eine Kopie kommt per Mail.",
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[17rem] sm:h-[26rem] lg:bottom-0 lg:h-auto">
          <LoopVideoBackground
            webm="/jung-bg.webm"
            mp4="/jung-bg.mp4"
            poster="/jung-bg.webp"
            playbackRate={0.5}
            className="object-[20%_center] sm:object-[center_66%] lg:object-[center_75%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                to bottom,
                rgba(250,248,245,0.38) 0%,
                rgba(250,248,245,0.42) 55%,
                rgba(250,248,245,0.88) 82%,
                rgba(250,248,245,1) 100%
              )`,
            }}
          />
          <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-r from-transparent from-40% via-creme/60 via-60% to-creme/90 lg:block" />
        </div>
        <div className="relative mx-auto w-full max-w-2xl px-5 pb-2 pt-52 sm:pt-[21rem] lg:grid lg:min-h-[30rem] lg:max-w-6xl lg:grid-cols-2 lg:items-center lg:pb-14 lg:pt-10">
          <div className="lg:col-start-2">
            {entry.status === "invalid" && (
              <p role="status" className="mb-4 rounded-lg border border-bernstein/50 bg-bernstein/10 px-4 py-3 font-body text-sm text-warmgrau">
                Dieser Klassenlink ist abgelaufen oder ungültig. Frag deine Lehrkraft nach einem neuen. Schreiben kannst du trotzdem.
              </p>
            )}
            <h1 className="font-typewriter text-xl font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-[2rem]">
              <span className="block">Wählen darfst du noch nicht.</span>{" "}
              <span className="mt-1 inline-block origin-left -rotate-3 font-handwriting text-[2.6rem] font-bold leading-none tracking-normal text-waldgruen sm:text-6xl">
                Schreiben schon.
              </span>
            </h1>
            <p className="mt-3 font-body text-base leading-snug text-warmgrau sm:mt-4 sm:text-lg">
              Erzähl, was dich stört. Das Tool macht daraus einen Brief an die Politik.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-6 sm:pt-8 lg:pt-2">
        <div id="schreiben" className="scroll-mt-32">
          <JungExperience entry={entry} />
        </div>

        <section aria-labelledby="jung-so-geht-s" className="reveal mt-14">
          <h2 id="jung-so-geht-s" className={h2Class}>So geht&apos;s</h2>
          <ol className="mt-6 space-y-6">
            {steps.map((step, index) => (
              <li key={step.title} className="relative flex gap-4">
                <span aria-hidden="true" className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-waldgruen/40 bg-creme font-typewriter text-sm font-bold text-waldgruen">
                  {index + 1}
                </span>
                {index < steps.length - 1 && (
                  <span aria-hidden="true" className="step-connector absolute -bottom-5 left-[15px] top-9 w-0.5" />
                )}
                <div>
                  <p className="font-body font-bold text-waldgruen-dark">{step.title}</p>
                  <p className="mt-1 font-body text-base leading-relaxed text-warmgrau">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="jung-warum" className="reveal mt-14 flow-root">
          <h2 id="jung-warum" className={h2Class}>Warum dein Brief zählt</h2>
          <Figure
            src="/images/img-im-buero.webp"
            alt="Ein handgeschriebener Brief liegt auf einem Schreibtisch im Abgeordnetenbüro, daneben ein Stapel Post, durchs Fenster ist die Reichstagskuppel zu sehen, gemalte Illustration"
            width={1376}
            height={768}
            side="right"
            rotate="right"
          />
          <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-waldgruen">
            <li className="font-body text-base leading-relaxed text-warmgrau">
              Wählen darfst du je nach Wahl erst ab 16 oder 18, schreiben sofort.{" "}
              <Link href="/mitbestimmen-ohne-wahlrecht" className="font-semibold text-waldgruen underline underline-offset-2">
                Mitbestimmen ohne Wahlrecht
              </Link>
              .
            </li>
            <li className="font-body text-base leading-relaxed text-warmgrau">
              Abgeordnete vertreten auch dich. Briefe von Jugendlichen sind die Ausnahme, deshalb fallen sie auf.
            </li>
            <li className="font-body text-base leading-relaxed text-warmgrau">
              Zusammen ist lauter: Schreib mit Freund:innen, mit deiner Klasse oder über die SV. Wie das in der Schule geht, steht auf der{" "}
              <Link href="/unterricht" className="font-semibold text-waldgruen underline underline-offset-2">
                Seite für Lehrkräfte
              </Link>
              .
            </li>
          </ul>
        </section>

        <section aria-labelledby="jung-faq" className="reveal mt-14">
          <h2 id="jung-faq" className={`${h2Class} mb-4`}>Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </section>

        <p className="mt-10 font-body text-sm leading-relaxed text-warmgrau/80">
          Du bist Lehrkraft? Auf der{" "}
          <Link href="/unterricht" className="font-semibold text-waldgruen underline underline-offset-2">
            Seite für Schulen
          </Link>{" "}
          gibt es einen Klassenlink mit QR-Code und einen Ablauf für 45 oder 90 Minuten.
        </p>
        <p className="mt-3 font-body text-sm leading-relaxed text-warmgrau/80">
          Du bist Elternteil und willst wissen, was das hier ist, oder selbst schreiben? Die{" "}
          <Link href="/eltern" className="font-semibold text-waldgruen underline underline-offset-2">
            Seite für Eltern
          </Link>{" "}
          erklärt es.
        </p>
      </div>
    </>
  );
}
