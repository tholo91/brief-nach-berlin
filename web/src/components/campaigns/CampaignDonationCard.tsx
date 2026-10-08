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
      className="grid grid-cols-[1fr_auto] overflow-hidden rounded-md border border-waldgruen/15 bg-creme/90 shadow-sm"
    >
      <div className="col-span-2 px-5 pt-5 md:col-span-1 md:pl-7 md:pr-4 md:pt-7">
        <h2
          id="creator-donation-heading"
          className="text-balance font-typewriter text-lg font-bold leading-snug text-waldgruen-dark md:text-xl"
        >
          {copy.manageHeading}
        </h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-warmgrau/80 md:text-base">
          {copy.body}
        </p>
      </div>

      <div className="col-span-2 grid gap-2 px-5 pt-5 sm:grid-cols-2 md:col-span-1 md:max-w-md md:pl-7 md:pr-4">
        <a
          href={DONATION_PROVIDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-waldgruen px-4 py-2.5 text-center font-body text-sm font-semibold text-creme transition-[background-color,transform] duration-200 hover:bg-waldgruen-dark active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          {copy.button}
        </a>
        <Link
          href={DONATION_PATH}
          prefetch={false}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-waldgruen/30 bg-white/45 px-4 py-2.5 text-center font-body text-sm font-semibold text-waldgruen-dark transition-[border-color,background-color,transform] duration-200 hover:border-waldgruen hover:bg-white/80 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          {copy.infoButton}
        </Link>
      </div>

      <p className="self-end pb-5 pl-5 pr-2 pt-4 font-body text-xs leading-relaxed text-warmgrau/60 md:pb-7 md:pl-7">
        {copy.status}
      </p>

      <div className="relative col-start-2 row-start-3 aspect-square w-28 self-end sm:w-32 md:row-span-3 md:row-start-1 md:w-44">
        <Image
          src={SUPPORT_CONTENT.founder.avatarPath}
          alt={SUPPORT_CONTENT.founder.name}
          fill
          sizes="(min-width: 768px) 176px, 128px"
          className="object-cover object-bottom mix-blend-multiply"
        />
      </div>
    </section>
  );
}
