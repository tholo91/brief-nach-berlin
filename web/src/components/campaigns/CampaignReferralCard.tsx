import Image from "next/image";
import { CampaignReferralShareButton } from "@/components/campaigns/CampaignReferralShareButton";
import { DONATION_PROVIDER_URL } from "@/lib/config";
import { BRIEF_EMAIL } from "@/lib/contact";
import { buildCampaignStartShare } from "@/lib/share";
import { SUPPORT_CONTENT } from "@/lib/support-content";

const AVATAR_EMOJIS = [
  { emoji: "💌", className: "left-0 top-6 -rotate-12 text-2xl" },
  { emoji: "🕊️", className: "right-3 top-2 rotate-12 text-xl" },
  { emoji: "🙏", className: "-left-3 top-[45%] -rotate-6 text-xl" },
  { emoji: "✉️", className: "right-0 top-[38%] rotate-6 text-lg" },
  { emoji: "🌱", className: "left-6 top-0 rotate-3 text-lg" },
];

const INTRODUCE_HREF = `mailto:${BRIEF_EMAIL}?subject=${encodeURIComponent("Vorstellung: Kampagne")}`;

export function CampaignReferralCard() {
  const share = buildCampaignStartShare();

  return (
    <section
      id="creator-referral"
      aria-labelledby="creator-referral-heading"
      className="scroll-mt-32 grid grid-cols-[1fr_auto] overflow-hidden rounded-md border border-waldgruen/15 bg-creme/90 shadow-sm"
    >
      <div className="col-span-2 px-5 pt-5 md:col-span-1 md:pl-7 md:pr-4 md:pt-7">
        <h2
          id="creator-referral-heading"
          className="text-balance font-typewriter text-lg font-bold leading-snug text-waldgruen-dark md:text-xl"
        >
          Kennst du jemanden, der auch was bewegen will?
        </h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-warmgrau/80 md:text-base">
          Eine Initiative, ein Verein, jemand mit Community und einem Anliegen?
          Erzähl ihnen von Brief nach Berlin oder stell mich kurz vor. Ich
          richte die Kampagne gern mit ein.
        </p>
      </div>

      <div className="col-span-2 flex flex-col gap-2 px-5 pt-5 sm:flex-row sm:flex-wrap md:col-span-1 md:pl-7 md:pr-4">
        <CampaignReferralShareButton
          text={share.text}
          subject={share.subject}
          fallbackHref={share.emailUrl}
        />
        <a
          href={INTRODUCE_HREF}
          className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-md border border-waldgruen/30 bg-white/45 px-4 py-2.5 text-center font-body text-sm font-semibold text-waldgruen-dark transition-[border-color,background-color,transform] duration-200 hover:border-waldgruen hover:bg-white/80 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          Thomas vorstellen
        </a>
      </div>

      <p className="self-end pb-5 pl-5 pr-2 pt-4 font-body text-xs leading-relaxed text-warmgrau/60 md:pb-7 md:pl-7">
        Du willst Brief nach Berlin unterstützen?{" "}
        <a
          href={DONATION_PROVIDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-waldgruen-dark underline underline-offset-2 hover:text-waldgruen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          Hier geht&apos;s zur Spende.
        </a>
      </p>

      <div className="relative col-start-2 row-start-3 aspect-square w-28 self-end sm:w-32 md:row-span-3 md:row-start-1 md:w-44">
        <Image
          src={SUPPORT_CONTENT.founder.avatarPath}
          alt={SUPPORT_CONTENT.founder.name}
          fill
          sizes="(min-width: 768px) 176px, 128px"
          className="object-cover object-bottom mix-blend-multiply"
        />
        {AVATAR_EMOJIS.map(({ emoji, className }) => (
          <span
            key={emoji}
            aria-hidden="true"
            className={`pointer-events-none absolute hidden select-none leading-none md:block ${className}`}
          >
            {emoji}
          </span>
        ))}
      </div>
    </section>
  );
}
