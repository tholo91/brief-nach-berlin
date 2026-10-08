import Link from "next/link";
import { formatCampaignEndDate } from "@/lib/campaigns/endDate";
import type { Campaign } from "@/lib/campaigns/schema";
import { CampaignBackground } from "./CampaignBackground";
import { CampaignList, type CampaignListItem } from "./CampaignList";
import { CampaignLogo } from "./CampaignLogo";

type EndedCampaign = Pick<
  Campaign,
  "slug" | "title" | "creatorName" | "logoPath" | "letterCount"
> & { endsAt: string };

type CampaignEndedViewProps = {
  campaign: EndedCampaign;
  otherCampaigns: CampaignListItem[];
};

function letterCountSentence(count: number): string | null {
  if (count <= 0) return null;
  if (count === 1) return "1 Brief wurde über diese Kampagne formuliert.";
  return `${new Intl.NumberFormat("de-DE").format(count)} Briefe wurden über diese Kampagne formuliert.`;
}

export function CampaignEndedView({
  campaign,
  otherCampaigns,
}: CampaignEndedViewProps) {
  const attribution = campaign.creatorName?.trim();
  const countSentence = letterCountSentence(campaign.letterCount);

  return (
    <CampaignBackground>
      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 md:py-16">
        <div className="flex items-center gap-4">
          <CampaignLogo
            logoPath={campaign.logoPath}
            name={attribution || campaign.title}
            size="md"
          />
          {attribution && (
            <p className="min-w-0 font-body text-sm font-semibold leading-snug text-warmgrau/70">
              Anliegen von {attribution}
            </p>
          )}
        </div>

        <h1 className="mt-5 max-w-2xl text-balance font-body text-3xl font-bold leading-tight tracking-tight text-waldgruen-dark sm:text-4xl">
          {campaign.title}
        </h1>

        <section
          aria-labelledby="campaign-ended-heading"
          className="mt-8 rounded-md border border-waldgruen/15 border-l-4 border-l-waldgruen bg-white/70 p-5 shadow-sm backdrop-blur-sm sm:p-6"
        >
          <h2
            id="campaign-ended-heading"
            className="font-typewriter text-xl font-bold leading-snug text-waldgruen-dark sm:text-2xl"
          >
            Diese Kampagne ist seit {formatCampaignEndDate(campaign.endsAt)} beendet.
          </h2>
          {countSentence && (
            <p className="mt-3 font-body text-lg font-semibold leading-snug text-waldgruen-dark">
              {countSentence}
            </p>
          )}
          <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-warmgrau/75">
            Die Seite bleibt als Endstand erreichbar. Neue Briefe lassen sich über diese
            Kampagne nicht mehr starten.
          </p>
        </section>

        {otherCampaigns.length > 0 && (
          <section aria-labelledby="campaign-ended-others" className="mt-10">
            <h2
              id="campaign-ended-others"
              className="font-body text-xl font-bold tracking-tight text-waldgruen-dark"
            >
              Diese Kampagnen laufen noch
            </h2>
            <div className="mt-4">
              <CampaignList campaigns={otherCampaigns} />
            </div>
          </section>
        )}

        <Link
          href="/app"
          className="mt-10 inline-flex w-full items-center justify-center rounded-md bg-waldgruen px-5 py-3 text-center font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen active:scale-[0.99] sm:w-auto"
        >
          Schreib deinen eigenen Brief nach Berlin
        </Link>
      </div>
    </CampaignBackground>
  );
}
