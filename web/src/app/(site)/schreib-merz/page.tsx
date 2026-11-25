import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import FadeFooterImage from "@/components/FadeFooterImage";
import { SchreibMerzForm } from "@/components/campaigns/SchreibMerzForm";
import { SCHREIB_MERZ_CAMPAIGN } from "@/lib/campaigns/specialCampaigns";
import { APP_URL } from "@/lib/config";

const TITLE = "Schreib Merz: Dein Brief an den Kanzler";
const DESCRIPTION =
  "Merz, wir müssen reden! Erzähl, was dich nervt, und bekomm in 2 Minuten einen Briefentwurf an Friedrich Merz oder deine Abgeordneten. Kostenlos, ohne Account.";
const CANONICAL_URL = `${APP_URL}${SCHREIB_MERZ_CAMPAIGN.path}`;

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
    q: "Liest Merz meinen Brief wirklich?",
    a: "Ob er ihn selbst liest, kann dir niemand versprechen. Briefe ans Kanzleramt werden aber gelesen, sortiert und beantwortet. Ein handgeschriebener Brief mit eigenem Erlebnis fällt dabei mehr auf als jede Mail.",
  },
  {
    q: "Warum von Hand schreiben?",
    a: "Weil es sonst kaum noch jemand macht. Ein handgeschriebener Brief zeigt, dass dir das Thema wichtig ist. Der Entwurf hilft dir, mit einem eigenen Satz wird es dein Brief und nicht der der KI.",
  },
  {
    q: "Muss ich an Merz schreiben?",
    a: "Nein. Im nächsten Schritt kannst du auch deine Abgeordneten im Bundestag aus deinem Wahlkreis wählen. Die sind oft näher dran und antworten häufiger.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Du gibst eine Postleitzahl und eine E-Mail-Adresse an. Die Mail brauche ich, um dir eine Kopie des Entwurfs zu schicken. Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich. Mehr steht in der Datenschutzerklärung.",
    aNode: (
      <>
        Du gibst eine Postleitzahl und eine E-Mail-Adresse an. Die Mail brauche ich, um dir eine Kopie des Entwurfs zu schicken. Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich. Mehr steht in der{" "}
        <Link href="/datenschutz" className="font-semibold text-waldgruen underline underline-offset-2">
          Datenschutzerklärung
        </Link>
        .
      </>
    ),
  },
  {
    q: "Ist das eine Aktion von Merz oder der CDU?",
    a: "Nein. Schreib Merz ist eine unabhängige Aktion von Brief-nach-Berlin, ohne Verbindung zu Friedrich Merz, der CDU, der Bundesregierung oder dem Bundeskanzleramt. Deine Meinung und dein Brief gehören dir.",
  },
  {
    q: "Kostet das etwas?",
    a: "Das Tool ist kostenlos und du brauchst keinen Account. Für den Brief brauchst du nur Papier, einen Umschlag und eine Briefmarke.",
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
  { title: "Sag, was nervt", text: "Ein Thema und ein Satz aus deinem Alltag. Tippen oder sprechen." },
  {
    title: "Entwurf bekommen",
    text: "Du wählst Merz oder deine Abgeordneten. Den Entwurf siehst du sofort und bekommst eine Kopie per Mail.",
  },
  {
    title: "Von Hand schreiben",
    text: "Schreib ihn mit eigenen Worten ab. Briefmarke drauf, ab in den Kasten. Porto zahlst du, Wirkung bekommst du.",
  },
];

const facts = ["Kostenlos", "Ohne Account", "In 2 Minuten"];

export default function SchreibMerzPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="relative overflow-hidden">
        <div className="relative mx-auto grid w-full max-w-2xl grid-cols-[1fr_auto] gap-x-4 px-5 pb-2 pt-8 sm:pt-14 lg:max-w-6xl lg:grid-cols-[1fr_minmax(0,17rem)] lg:grid-rows-[1fr_auto_1fr] lg:gap-x-16 lg:pb-12 lg:pt-16">
          <h1 className="col-start-1 row-start-1 self-center lg:self-end font-typewriter text-[1.7rem] font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-[2.6rem]">
              <span className="block">Merz,</span>
              <span className="mt-1 inline-block origin-left -rotate-3 font-handwriting text-[2.7rem] font-bold leading-none tracking-normal text-waldgruen sm:text-7xl">
                wir müssen reden!
              </span>
          </h1>
            <p className="col-span-2 mt-4 max-w-[46ch] lg:col-span-1 lg:col-start-1 lg:row-start-2 text-pretty font-body text-base leading-snug text-warmgrau sm:mt-6 sm:text-lg">
              Kommentare scrollt er weg, Briefe nicht. Sag, was nervt, du kriegst den Entwurf.
            </p>
            <ul className="col-span-2 mt-4 flex self-start lg:col-span-1 lg:col-start-1 lg:row-start-3 flex-wrap gap-x-4 gap-y-1 font-body text-sm font-semibold text-waldgruen">
              {facts.map((fact) => (
                <li key={fact} className="inline-flex items-center gap-1.5">
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 20 20">
                    <path d="m4 10 3.5 3.5L16 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  {fact}
                </li>
              ))}
            </ul>
          <figure className="relative col-start-2 row-start-1 w-24 rotate-3 self-start sm:w-40 lg:row-span-3 lg:w-full lg:self-center">
            <div className="overflow-hidden rounded-sm border-4 border-white bg-white shadow-[0_18px_40px_-20px_rgba(27,67,50,0.6)]">
              <div className="relative aspect-[9/10]">
                <Image
                  src="/images/schreib-merz-editorial-clean.webp"
                  alt="Gemalte Illustration von Friedrich Merz, der die leere Rückseite eines Briefs in der Hand hält"
                  fill
                  priority
                  sizes="(max-width: 640px) 96px, (max-width: 1024px) 160px, 272px"
                  className="object-cover"
                />
              </div>
            </div>
            <figcaption className="mt-1.5 hidden text-right font-body text-xs text-warmgrau/60 lg:block">KI-generierte Illustration</figcaption>
          </figure>
        </div>
      </section>

      <div className="mx-auto w-full max-w-2xl px-5 pt-6 sm:pt-8 lg:pt-2">
        <div id="schreiben" className="scroll-mt-32">
          <SchreibMerzForm />
        </div>

        <section aria-labelledby="merz-so-geht-s" className="reveal mt-14">
          <h2 id="merz-so-geht-s" className={h2Class}>So geht&apos;s</h2>
          <ol className="mt-6 space-y-6">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-waldgruen/40 bg-creme font-typewriter text-sm font-bold text-waldgruen">
                  {index + 1}
                </span>
                <div>
                  <p className="font-body font-bold text-waldgruen-dark">{step.title}</p>
                  <p className="mt-1 font-body text-base leading-relaxed text-warmgrau">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="merz-warum" className="reveal -mx-5 mt-14 bg-waldgruen/5 px-5 py-8 sm:mx-0 sm:rounded-2xl sm:px-8">
          <h2 id="merz-warum" className={h2Class}>Warum ein Brief?</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-waldgruen">
            <li className="font-body text-base leading-relaxed text-warmgrau">
              Im Kanzleramt landen jeden Tag Mails und Kommentare. Ein handgeschriebener Brief ist die Ausnahme und fällt auf.
            </li>
            <li className="font-body text-base leading-relaxed text-warmgrau">
              Über deine Zukunft wird gerade entschieden: Wohnen, BAföG, Wehrdienst, Klima. Wer nicht schreibt, wird nicht mitgezählt.
            </li>
            <li className="font-body text-base leading-relaxed text-warmgrau">
              Zusammen ist lauter: Schick den Link an deine WG, deine Gruppe oder deinen Kurs.
            </li>
          </ul>
        </section>
      </div>

      <div className="relative pb-[clamp(120px,16vw,220px)]">
        <FadeFooterImage variant="content" successBackground />
        <section aria-labelledby="merz-faq" className="reveal relative mx-auto mt-14 w-full max-w-2xl px-5">
          <h2 id="merz-faq" className={`${h2Class} mb-4`}>Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
          <p className="mt-8 font-body text-sm leading-relaxed text-warmgrau/70">
            Schreib Merz ist eine unabhängige Aktion von Brief-nach-Berlin. Sie ist nicht mit Friedrich Merz, der CDU, der Bundesregierung oder dem Bundeskanzleramt verbunden.
          </p>
        </section>
      </div>
    </>
  );
}
