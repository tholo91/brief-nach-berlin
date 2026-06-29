import type { Campaign } from "@/lib/campaigns/schema";
import { campaignLogoPublicUrl } from "@/lib/campaigns/logo";
import { CampaignBackground } from "./CampaignBackground";
import { CampaignIssueStarter } from "./CampaignIssueStarter";

type PublicCampaign = Pick<
  Campaign,
  | "slug"
  | "title"
  | "issueText"
  | "description"
  | "creatorName"
  | "externalUrl"
  | "logoPath"
  | "letterCount"
>;

const FAQ_ITEMS = [
  {
    question: "Warum eine Briefkampagne?",
    answer:
      "Ein Brief landet bei einem konkreten Abgeordneten, nicht nur in einer Liste. Mit Adresse und Wahlkreisbezug ist klar: Diese Person erwartet eine Antwort.",
  },
  {
    question: "Was ist anders als bei einer Online-Petition?",
    answer:
      "Online-Petitionen sammeln viele Stimmen an einem Ort. Ein persönlicher Brief macht aus einem Klick ein Anliegen, das im Büro einzeln bearbeitet werden muss.",
  },
  {
    question: "Muss ich den Kampagnentext übernehmen?",
    answer:
      "Nein. Die Vorlage ist ein Startpunkt. Änder alles, was nicht zu dir passt, bevor daraus dein Brief wird.",
  },
];

const TRUST_ITEMS = [
  "Kostenlos",
  "Kein Account",
  "Text vorausgefüllt",
];

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M3 8l3.2 3.2L13 4.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-waldgruen transition-transform duration-200"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.3"
      />
    </svg>
  );
}

function formatHostname(url: string | null): string | null {
  if (!url) return null;

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function CampaignHero({ campaign }: { campaign: PublicCampaign }) {
  const attribution = campaign.creatorName?.trim();
  const logoUrl = campaignLogoPublicUrl(campaign.logoPath);
  const formattedLetterCount = new Intl.NumberFormat("de-DE").format(
    campaign.letterCount
  );
  const letterCountLabel = campaign.letterCount === 1 ? "Brief" : "Briefe";
  const sourceName = attribution || "Kampagnenersteller:in";
  const sourceInitial = sourceName.charAt(0).toUpperCase();
  const sourceHostname = formatHostname(campaign.externalUrl);

  return (
    <CampaignBackground>
      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-6 sm:py-10 lg:grid-cols-[0.92fr_1.08fr] lg:grid-rows-[auto_auto] lg:gap-x-12 lg:gap-y-6 lg:py-14">
        <div className="flex flex-col justify-center lg:col-start-1 lg:row-start-1">
          <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/65 sm:text-sm">
            Öffentliche Briefkampagne
          </p>
          <h1 className="mt-3 max-w-xl text-balance font-body text-4xl font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-5xl">
            {campaign.title}
          </h1>
          <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-warmgrau/75">
            Starte mit einer Vorlage zum Thema, ergänze deine Prioritäten und
            Details. Die Argumente sind vorbereitet, dein passendes MdB wird im
            nächsten Schritt gefunden.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 font-body text-sm font-semibold text-waldgruen">
            {TRUST_ITEMS.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckIcon />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <CampaignIssueStarter
            slug={campaign.slug}
            title={campaign.title}
            initialIssueText={campaign.issueText}
            creatorName={campaign.creatorName}
            externalUrl={campaign.externalUrl}
            logoPath={campaign.logoPath}
          />
        </div>

        <div className="rounded-md border border-waldgruen/15 bg-white/70 p-4 shadow-sm backdrop-blur-sm lg:col-start-1 lg:row-start-2">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div
                role="img"
                aria-label={`Logo oder Bild von ${sourceName}`}
                className="h-14 w-14 shrink-0 rounded-full border border-warmgrau/15 bg-white shadow-sm"
                style={{
                  backgroundImage: `url(${logoUrl})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                }}
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-waldgruen/15 bg-waldgruen/10 font-typewriter text-xl font-bold text-waldgruen-dark"
              >
                {sourceInitial}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60">
                Kampagne von
              </p>
              <p className="mt-1 truncate font-body text-base font-semibold leading-tight text-waldgruen-dark">
                {sourceName}
              </p>
              {campaign.externalUrl && sourceHostname && (
                <a
                  href={campaign.externalUrl}
                  className="mt-1 inline-block max-w-full truncate font-body text-sm text-waldgruen underline decoration-waldgruen/30 underline-offset-4 transition-colors hover:text-waldgruen-dark"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {sourceHostname}
                </a>
              )}
            </div>
          </div>
          {campaign.description && (
            <p className="mt-4 border-t border-warmgrau/10 pt-4 font-body text-sm leading-relaxed text-warmgrau/70">
              {campaign.description}
            </p>
          )}
          <div className="mt-4 grid gap-1 border-t border-warmgrau/10 pt-3 font-body text-sm leading-relaxed text-warmgrau/60">
            <p>
              <span className="font-semibold text-waldgruen-dark">
                {formattedLetterCount} {letterCountLabel}
              </span>{" "}
              bisher geschrieben
            </p>
            <p>Die Kampagne nutzt die Infrastruktur von Brief-nach-Berlin.</p>
          </div>
        </div>
      </div>
      <section className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-16 sm:px-6 lg:pb-20">
        <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60 sm:text-sm">
          Warum Briefkampagne?
        </p>
        <h2 className="mt-2 font-body text-2xl font-bold tracking-tight text-waldgruen-dark sm:text-3xl">
          Weniger Klick, mehr Gewicht
        </h2>
        <div className="mt-7 divide-y divide-waldgruen/15 border-y border-waldgruen/15">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group -mx-3 rounded-lg px-3 transition-colors duration-150 [&[open]]:bg-waldgruen/[0.03] [&[open]_svg]:rotate-180"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-body text-base font-semibold text-waldgruen-dark transition-colors duration-150 group-open:text-waldgruen [&::-webkit-details-marker]:hidden sm:text-lg">
                <span>{item.question}</span>
                <ChevronIcon />
              </summary>
              <p className="pb-6 pr-8 font-body text-base leading-relaxed text-warmgrau/75">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </CampaignBackground>
  );
}
