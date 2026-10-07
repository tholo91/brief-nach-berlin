import Link from "next/link";
import type { LandingCampaign } from "@/lib/campaigns/landing";
import { CampaignLogo } from "./CampaignLogo";

type HeroCampaignPillsProps = {
  campaigns: LandingCampaign[];
  className?: string;
};

export function HeroCampaignPills({ campaigns, className }: HeroCampaignPillsProps) {
  if (campaigns.length === 0) return null;

  return (
    <div className={className}>
      <ul
        aria-label="Laufende Briefkampagnen"
        className="flex flex-wrap items-center justify-center gap-2.5"
      >
        {campaigns.slice(0, 3).map((campaign) => {
          const sender = campaign.creatorName ? ` von ${campaign.creatorName}` : "";
          return (
            <li key={campaign.slug}>
              <Link
                href={campaign.href}
                prefetch={false}
                title={
                  campaign.creatorName
                    ? `${campaign.title} · ${campaign.creatorName}`
                    : campaign.title
                }
                aria-label={`Briefkampagne „${campaign.title}“${sender} ansehen`}
                className="group inline-flex h-10 items-center gap-2 rounded-full border border-waldgruen/15 bg-white/70 pl-[3px] pr-3 shadow-[0_1px_2px_rgba(27,67,50,0.06)] transition-[background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-waldgruen/35 hover:bg-white hover:shadow-[0_8px_18px_-12px_rgba(27,67,50,0.5)] active:bg-creme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 focus-visible:ring-offset-creme"
              >
                <CampaignLogo
                  logoPath={campaign.logoPath}
                  name={campaign.creatorName ?? campaign.title}
                  size="chip"
                />
                <span className="max-w-[13rem] truncate font-body text-sm font-semibold text-waldgruen-dark">
                  {campaign.label}
                </span>
                <svg
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0 text-waldgruen/45 transition-[color,transform] duration-200 group-hover:text-waldgruen motion-safe:group-hover:translate-x-0.5"
                >
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
