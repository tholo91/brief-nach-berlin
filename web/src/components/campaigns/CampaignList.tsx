import Link from "next/link";
import type { Campaign } from "@/lib/campaigns/schema";
import { CampaignLogo } from "./CampaignLogo";

export type CampaignListItem = Pick<
  Campaign,
  | "slug"
  | "title"
  | "creatorName"
  | "logoPath"
  | "activatedAt"
  | "createdAt"
  | "letterCount"
>;

type CampaignListProps = {
  campaigns: CampaignListItem[];
  emptyMessage?: string;
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatCampaignDate(campaign: CampaignListItem): string {
  return dateFormatter.format(
    new Date(campaign.activatedAt ?? campaign.createdAt),
  );
}

export function CampaignList({
  campaigns,
  emptyMessage,
}: CampaignListProps) {
  if (campaigns.length === 0) {
    return emptyMessage ? (
      <p className="font-body text-sm leading-relaxed text-warmgrau/70">
        {emptyMessage}
      </p>
    ) : null;
  }

  return (
    <ol className="grid gap-2">
      {campaigns.map((campaign) => (
        <li key={campaign.slug}>
          <Link
            href={`/kampagne/${campaign.slug}`}
            className="group block rounded-md border border-waldgruen/12 bg-white/55 p-3 transition-colors duration-150 hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <CampaignLogo
                logoPath={campaign.logoPath}
                name={campaign.creatorName?.trim() || campaign.title}
              />
              <div className="min-w-0 flex-1">
                <p className="flex min-w-0 items-baseline font-body text-sm font-bold leading-snug text-waldgruen-dark group-hover:text-waldgruen">
                  <span className="min-w-0 truncate">{campaign.title}</span>
                  {campaign.letterCount > 20 && (
                    <span className="ml-1 shrink-0 font-body text-xs font-semibold text-warmgrau/55">
                      20+ Briefe
                    </span>
                  )}
                </p>
                <div className="mt-2 flex min-w-0 items-center gap-x-2 overflow-hidden whitespace-nowrap font-body text-[11px] font-semibold text-warmgrau/55">
                  {campaign.creatorName && (
                    <span className="min-w-0 truncate">
                      Anliegen von {campaign.creatorName}
                    </span>
                  )}
                  <span className="shrink-0">{formatCampaignDate(campaign)}</span>
                </div>
              </div>
              <span className="shrink-0 pt-0.5 font-typewriter text-[10px] font-bold uppercase tracking-wider text-waldgruen/75">
                Öffnen
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
