import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CampaignBackground } from "@/components/campaigns/CampaignBackground";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { getRecentActiveCampaigns } from "@/lib/campaigns/repository";
import { SPECIAL_CAMPAIGN_SLUG } from "@/lib/campaigns/specialCampaigns";

const URL_PATH = "/ngo-briefkampagne";
const PUBLISHED = "2026-07-06";
const MODIFIED = "2026-10-08";
const TITLE =
  "NGO-Briefkampagne: aus eurem Anliegen viele persönliche Briefe machen | Brief-nach-Berlin";
const DESCRIPTION =
  "Eine NGO-Briefkampagne macht aus eurem Anliegen viele persönliche Briefe: an Bundestagsabgeordnete, die Landesregierung oder einen festen Empfänger. Ohne Massenmailing und ohne Account.";

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

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "Was bringt eine NGO-Briefkampagne?",
    a: "Sie macht aus einem gemeinsamen Anliegen viele persönliche Briefe. Jede Person schreibt aus dem eigenen Wahlkreis, ergänzt eigene Gründe und entscheidet selbst, ob sie den Brief abschickt.",
  },
  {
    q: "An wen können die Briefe gehen?",
    a: "An das Mitglied des Bundestags aus dem eigenen Wahlkreis, an eine Auswahl von Bundestagsabgeordneten, an die Landesregierung oder an einen festen Empfänger mit Adresse in Deutschland, etwa ein Ministerium oder ein Rathaus.",
  },
  {
    q: "Ist das besser als eine Petition?",
    a: "Es ist anders. Eine Petition zeigt Breite. Eine Briefkampagne bringt das Anliegen direkt in Wahlkreis- und Abgeordnetenbüros. Beides kann zusammenpassen.",
  },
  {
    q: "Was ist anders als beim normalen Brief-nach-Berlin?",
    a: "Beim normalen Brief startet eine einzelne Person mit ihrem eigenen Anliegen. Bei einer Briefkampagne gebt ihr als Verein den gemeinsamen Startpunkt vor. Unterstützer:innen kommen schneller in den persönlichen Briefprozess, passen den Entwurf an ihren Wahlkreis und ihre Gründe an und erzeugen dadurch viele echte, persönliche Schreiben statt nur einen Klick.",
  },
  {
    q: "Brauchen wir als NGO schon einen fertigen Brief?",
    a: "Nein. Ihr braucht ein klares Anliegen, eine kurze Einordnung und eine Organisation, die sichtbar Verantwortung übernimmt. Den persönlichen Brief schreibt später jede Person selbst weiter.",
  },
  {
    q: "Wird daraus eine KI-Briefflut?",
    a: "Nein. Brief-nach-Berlin verschickt nichts automatisch. Menschen lesen, ändern und verwenden den Text selbst. Genau diese Reibung schützt vor künstlicher Beteiligung.",
  },
  {
    q: "Was kostet das und was sehen wir danach?",
    a: "Der Start ist aktuell kostenlos und ohne Account. Ihr seht, wie viele Briefe über eure Kampagne entstanden sind. Namen, Adressen und Brieftexte eurer Unterstützer:innen seht ihr nicht.",
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
  author: { "@type": "Organization", name: "Brief-nach-Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief-nach-Berlin",
    url: APP_URL,
  },
  url: `${APP_URL}${URL_PATH}`,
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
};

const steps = [
  "Ihr legt Anliegen und Ausgangstext an.",
  "Ihr teilt den Link oder QR-Code mit eurer Community.",
  "Jede Person macht daraus ihren eigenen Brief und schickt ihn selbst ab.",
];

const recipientOptions = [
  {
    title: "Das eigene MdB",
    text: "Die PLZ entscheidet, wer im Wahlkreis zuständig ist.",
  },
  {
    title: "Ausgewählte MdBs",
    text: "Zum Beispiel die Mitglieder eines Ausschusses.",
  },
  {
    title: "Die Landesregierung",
    text: "In Berlin, Hamburg und Bremen der Senat.",
  },
  {
    title: "Ein fester Empfänger",
    text: "Ministerium, Rathaus, Behörde oder Unternehmen.",
  },
];

function ArrowDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M10 4.167v11.666M10 15.833l5-5M10 15.833l-5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.667"
      />
    </svg>
  );
}

export default async function NgoBriefkampagnePage() {
  const campaigns = (await getRecentActiveCampaigns(6))
    .filter((campaign) => campaign.slug !== SPECIAL_CAMPAIGN_SLUG)
    .slice(0, 5);

  return (
    <CampaignBackground>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 md:py-16 lg:py-20">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen transition-colors hover:text-waldgruen-dark"
        >
          &larr; Zurück
        </Link>

        <section
          id="uebersicht"
          className="mx-auto mt-10 max-w-3xl scroll-mt-28"
        >
          <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60 sm:text-sm">
            Für NGOs, Vereine, Initiativen und Creator
          </p>
          <h1 className="mt-3 text-balance font-body text-4xl font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-5xl">
            Aus eurem Anliegen{" "}
            <span className="font-black text-waldgruen decoration-waldgruen/35 decoration-[0.13em] underline underline-offset-[0.08em] sm:whitespace-nowrap">
              viele persönliche Briefe
            </span>{" "}
            machen
          </h1>
          <p className="mt-6 max-w-2xl font-body text-lg font-medium leading-relaxed text-warmgrau/85">
            Für alle, die eine Community haben und politisch etwas bewegen
            wollen. Ihr legt Anliegen und Ausgangstext an. Eure Leute machen
            daraus ihre eigenen Briefe: an Bundestagsabgeordnete, an die
            Landesregierung oder genau an die Person, die entscheidet.
          </p>
          <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/kampagne/starten"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-waldgruen px-6 py-3 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark active:translate-y-px"
            >
              <span>Kampagne starten</span>
            </Link>
            <Link
              href="#laufende-kampagnen"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-waldgruen/18 bg-white/55 px-6 py-3 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen/35 hover:bg-white/85 active:translate-y-px"
            >
              <span>Laufende Kampagnen ansehen</span>
              <ArrowDownIcon />
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-3xl md:mt-14">
          <section id="laufende-kampagnen" className="scroll-mt-28">
            <div className="mb-4">
              <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/50">
                Laufende Kampagnen
              </p>
              <h2 className="mt-2 font-body text-xl font-bold text-waldgruen-dark">
                Aktuell aktiv
              </h2>
            </div>
            <CampaignList
              campaigns={campaigns}
              emptyMessage="Noch keine öffentlichen Kampagnen. Wenn du ein Anliegen testen willst, kannst du hier die erste Kampagne starten."
            />
          </section>

          <section className="mt-12 grid gap-8 border-y border-waldgruen/15 py-8 md:grid-cols-2 md:gap-10">
            <div>
              <h2 className="font-body text-xl font-bold tracking-tight text-waldgruen-dark">
                So läuft es
              </h2>
              <ol className="mt-4 flex flex-col gap-3">
                {steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-3 font-body text-base font-medium leading-relaxed text-warmgrau/85"
                  >
                    <span className="font-typewriter text-sm font-bold leading-relaxed text-waldgruen/50">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div id="empfaenger" className="scroll-mt-28">
              <h2 className="font-body text-xl font-bold tracking-tight text-waldgruen-dark">
                Wen eure Briefe erreichen
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {recipientOptions.map((option) => (
                  <li
                    key={option.title}
                    className="font-body text-base leading-relaxed text-warmgrau/85"
                  >
                    <span className="font-bold text-waldgruen-dark">
                      {option.title}:
                    </span>{" "}
                    {option.text}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <p className="mt-6 font-body text-sm leading-relaxed text-warmgrau/75">
            Kostenlos und ohne Account. Ihr bekommt eine Kampagnenseite mit
            Logo, Link, QR-Code und Briefzähler. Namen, Adressen und Brieftexte
            eurer Unterstützer:innen seht ihr nicht.
          </p>

          <div id="faq" className="mt-10 scroll-mt-28">
            <h2 className="mb-6 font-body text-xl font-bold text-waldgruen-dark">
              Häufige Fragen
            </h2>
            <FAQAccordion items={faqs} />
          </div>

          <div className="mt-10 rounded-xl bg-creme p-8 text-center ring-1 ring-waldgruen/10">
            <p className="mb-4 font-body text-lg font-bold text-waldgruen-dark">
              Willst du eine Kampagne testen?
            </p>
            <p className="mx-auto mb-6 max-w-lg font-body text-sm leading-relaxed text-warmgrau/75">
              Leg das Anliegen an und teile den Link erst mit wenigen Menschen,
              die du wirklich kennst. Fünf gute Briefe sind für den Anfang
              besser als ein großer Verteiler ohne Rückmeldung.
            </p>
            <Link
              href="/kampagne/starten"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-waldgruen px-8 py-3 font-body font-semibold text-creme transition-colors hover:bg-waldgruen-dark active:translate-y-px"
            >
              <span>Kampagne starten</span>
            </Link>
          </div>

          <div className="mt-10 border-t border-warmgrau/10 pt-6">
            <p className="mb-4 font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/50">
              Mehr dazu
            </p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  href="/lohnt-sich-brief-an-politiker"
                  className="font-body text-sm text-waldgruen underline underline-offset-2 transition-colors hover:text-waldgruen-dark"
                >
                  Lohnt es sich, Politikerinnen und Politikern zu schreiben?
                </Link>
              </li>
              <li>
                <Link
                  href="/keine-ki-briefflut"
                  className="font-body text-sm text-waldgruen underline underline-offset-2 transition-colors hover:text-waldgruen-dark"
                >
                  Warum daraus keine KI-Briefflut werden soll
                </Link>
              </li>
              <li>
                <Link
                  href="/brief-oder-petition"
                  className="font-body text-sm text-waldgruen underline underline-offset-2 transition-colors hover:text-waldgruen-dark"
                >
                  Brief oder Petition: Was passt zu eurem Anliegen?
                </Link>
              </li>
              <li>
                <Link
                  href="/weitersagen"
                  className="font-body text-sm text-waldgruen underline underline-offset-2 transition-colors hover:text-waldgruen-dark"
                >
                  Brief-nach-Berlin weitertragen
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </CampaignBackground>
  );
}
