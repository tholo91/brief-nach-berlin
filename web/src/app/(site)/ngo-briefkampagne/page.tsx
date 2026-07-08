import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CampaignBackground } from "@/components/campaigns/CampaignBackground";
import { getRecentActiveCampaigns } from "@/lib/campaigns/repository";
import type { Campaign } from "@/lib/campaigns/schema";

const URL_PATH = "/ngo-briefkampagne";
const PUBLISHED = "2026-07-06";
const TITLE =
  "NGO-Briefkampagne: aus eurem Anliegen viele persönliche Briefe machen | Brief-nach-Berlin";
const DESCRIPTION =
  "Eine NGO-Briefkampagne macht aus eurem Anliegen viele persönliche Briefe aus echten Wahlkreisen. So nutzt du Brief-nach-Berlin ohne Massenmailing und ohne Account.";

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

type CampaignListItem = Pick<
  Campaign,
  | "slug"
  | "title"
  | "creatorName"
  | "activatedAt"
  | "createdAt"
>;

const faqs = [
  {
    q: "Was bringt eine NGO-Briefkampagne?",
    a: "Sie macht aus einem gemeinsamen Anliegen viele persönliche Briefe. Jede Person schreibt aus dem eigenen Wahlkreis, ergänzt eigene Gründe und entscheidet selbst, ob sie den Brief abschickt.",
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

const shortPoints = [
  {
    title: "Guter Einsatz",
    text: "Wenn ihr ein klares politisches Ziel habt: Gesetz, Haushalt, Förderung, lokaler Missstand. Für reine Aufmerksamkeit ist es zu konkret. Für ein Anliegen mit Adresse passt es gut.",
  },
  {
    title: "Für Unterstützer:innen",
    text: "Sie sehen euer Anliegen und gehen dann durch den normalen Briefprozess: PLZ, zuständige Abgeordnete, persönlicher Entwurf. Der Kampagnentext bleibt Startpunkt, nicht Endfassung.",
  },
  {
    title: "Klare Grenze",
    text: "Brief-nach-Berlin verschickt nichts automatisch. Keine Fake-Beteiligung, keine hundert Varianten aus der Maschine. Wer mitmacht, muss den Text selbst prüfen und weiterverwenden.",
  },
];

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatCampaignDate(campaign: CampaignListItem): string {
  return dateFormatter.format(
    new Date(campaign.activatedAt ?? campaign.createdAt)
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M5.833 14.167 14.167 5.833M14.167 5.833H7.5M14.167 5.833V12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.667"
      />
    </svg>
  );
}

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

function CampaignList({ campaigns }: { campaigns: CampaignListItem[] }) {
  if (campaigns.length === 0) {
    return (
      <p className="font-body text-sm leading-relaxed text-warmgrau/70">
        Noch keine öffentlichen Kampagnen. Wenn du ein Anliegen testen willst,
        kannst du hier die erste Kampagne starten.
      </p>
    );
  }

  return (
    <ol className="grid gap-2">
      {campaigns.map((campaign) => (
        <li key={campaign.slug}>
          <Link
            href={`/kampagne/${campaign.slug}`}
            className="group block rounded-md border border-waldgruen/12 bg-white/55 p-3 transition-colors duration-150 hover:bg-white/85 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="break-words font-body text-sm font-bold leading-snug text-waldgruen-dark group-hover:text-waldgruen">
                {campaign.title}
              </p>
              <span className="shrink-0 font-typewriter text-[10px] font-bold uppercase tracking-wider text-waldgruen/75">
                Öffnen
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 font-body text-[11px] font-semibold text-warmgrau/55">
              {campaign.creatorName && (
                <span>Anliegen von {campaign.creatorName}</span>
              )}
              <span>{formatCampaignDate(campaign)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default async function NgoBriefkampagnePage() {
  const campaigns = await getRecentActiveCampaigns(5);

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
            Für NGOs und Vereine
          </p>
          <h1 className="mt-3 text-balance font-body text-4xl font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-5xl">
            Aus eurem Anliegen{" "}
            <span className="font-black text-waldgruen decoration-waldgruen/35 decoration-[0.13em] underline underline-offset-[0.08em] sm:whitespace-nowrap">
              viele persönliche Briefe
            </span>{" "}
            machen
          </h1>
          <p className="mt-6 max-w-2xl font-body text-lg font-medium leading-relaxed text-warmgrau/85">
            Für Entscheider:innen aus NGOs und Engagierte in Vereinen, die
            konkrete politische Unterstützung mobilisieren wollen. Ihr bietet
            den Schnellstart. Alle, die die Kampagne unterstützen, machen daraus
            ihre persönlichen Briefe an Abgeordnete in ihrem Wahlkreis.
          </p>
          <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/kampagne/starten"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-waldgruen px-6 py-3 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark active:translate-y-px"
            >
              <span>Kampagne starten</span>
              <ArrowUpRightIcon />
            </Link>
            <Link
              href="#laufende-kampagnen"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-waldgruen/18 bg-white/55 px-6 py-3 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen/35 hover:bg-white/85 active:translate-y-px"
            >
              <span>Beispielkampagne ansehen</span>
              <ArrowDownIcon />
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-3xl md:mt-14">
          <div className="divide-y divide-waldgruen/15 border-y border-waldgruen/15">
            {shortPoints.map((point) => (
              <section
                key={point.title}
                className="grid gap-3 py-6 md:grid-cols-[0.42fr_0.58fr] md:gap-8"
              >
                <h2 className="font-body text-xl font-bold tracking-tight text-waldgruen-dark">
                  {point.title}
                </h2>
                <p className="font-body text-base font-medium leading-relaxed text-warmgrau/85">
                  {point.text}
                </p>
              </section>
            ))}
          </div>

          <figure className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-md border border-waldgruen/12 bg-white/55 shadow-sm">
            <Image
              src="/images/img-ngo-briefkampagne.webp"
              alt="Illustration eines NGO-Tisches mit handgeschriebenen Briefen, Airmail-Umschlägen und einer Wahlkreiskarte vor einem hellen Berliner Fenster"
              width={1368}
              height={770}
              sizes="(min-width: 768px) 672px, calc(100vw - 40px)"
              className="h-auto w-full"
            />
          </figure>

          <section id="laufende-kampagnen" className="mt-10 scroll-mt-28">
            <div className="mb-4">
              <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/50">
                Laufende Kampagnen
              </p>
              <h2 className="mt-2 font-body text-xl font-bold text-waldgruen-dark">
                Aktuell aktiv
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/70">
                Folgende Kampagnen laufen bereits, schau sie dir gerne an:
              </p>
            </div>
            <CampaignList campaigns={campaigns} />
          </section>

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
              <ArrowUpRightIcon />
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
