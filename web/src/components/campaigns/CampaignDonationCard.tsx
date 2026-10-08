import Image from "next/image";
import Link from "next/link";
import { DONATION_PATH, DONATION_PROVIDER_URL } from "@/lib/config";
import {
  SUPPORT_CAMPAIGN_CREATOR_COPY,
  SUPPORT_CONTENT,
} from "@/lib/support-content";

export function CampaignDonationCard() {
  const copy = SUPPORT_CAMPAIGN_CREATOR_COPY;

  return (
    <section
      aria-labelledby="creator-donation-heading"
      className="rounded-md border border-waldgruen/15 bg-creme/90 p-5 shadow-sm md:p-7"
    >
      <div className="flex items-center gap-4 md:items-start">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-waldgruen/15">
          <Image
            src={SUPPORT_CONTENT.founder.avatarPath}
            alt={SUPPORT_CONTENT.founder.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h2
            id="creator-donation-heading"
            className="text-balance font-typewriter text-lg font-bold leading-snug text-waldgruen-dark"
          >
            {copy.heading}
          </h2>
          <p className="mt-2 hidden max-w-2xl font-body text-base leading-relaxed text-warmgrau/80 md:block">
            {copy.body}
          </p>
        </div>
      </div>
      <p className="mt-4 font-body text-sm leading-relaxed text-warmgrau/80 md:hidden">
        {copy.body}
      </p>

      <div className="mt-5 grid gap-2 min-[440px]:grid-cols-2 md:max-w-md">
        <a
          href={DONATION_PROVIDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-waldgruen px-5 py-2.5 text-center font-body text-sm font-semibold text-creme transition-[background-color,transform] duration-200 hover:bg-waldgruen-dark active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          {copy.button}
        </a>
        <Link
          href={DONATION_PATH}
          prefetch={false}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-waldgruen/30 bg-white/45 px-5 py-2.5 text-center font-body text-sm font-semibold text-waldgruen-dark transition-[border-color,background-color,transform] duration-200 hover:border-waldgruen hover:bg-white/80 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          {copy.infoButton}
        </Link>
      </div>

      <p className="mt-4 max-w-2xl font-body text-xs leading-relaxed text-warmgrau/60">
        {copy.status}
      </p>
    </section>
  );
}
