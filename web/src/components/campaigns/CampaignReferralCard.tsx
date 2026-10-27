import Image from "next/image";
import { CampaignJointPostMenu } from "@/components/campaigns/CampaignJointPostMenu";
import { CampaignReferralShareButton } from "@/components/campaigns/CampaignReferralShareButton";
import { SocialFollowIcons } from "@/components/SocialFollow";
import { DONATION_PROVIDER_URL } from "@/lib/config";
import { buildCampaignStartShare } from "@/lib/share";
import { SUPPORT_CONTENT } from "@/lib/support-content";

const AVATAR_EMOJIS = [
  { emoji: "💌", className: "left-0 top-6 -rotate-12 text-2xl" },
  { emoji: "🕊️", className: "right-3 top-2 rotate-12 text-xl" },
  { emoji: "🙏", className: "-left-3 top-[45%] -rotate-6 text-xl" },
  { emoji: "✉️", className: "right-0 top-[38%] rotate-6 text-lg" },
  { emoji: "🌱", className: "left-6 top-0 rotate-3 text-lg" },
];

export function CampaignReferralCard({ slug }: { slug: string }) {
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
          Lust auf einen gemeinsamen Post?
        </h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-warmgrau/80 md:text-base">
          Ich teile deine Kampagne gern auf Instagram oder LinkedIn, am liebsten
          in einem gemeinsamen Post. Und kennst du Creator oder Initiativen, die
          über Politik posten? Mit Brief-nach-Berlin bekommt ihr Publikum einen
          konkreten nächsten Schritt: einen Brief an die eigenen Abgeordneten.
        </p>
        <div className="mt-3 flex gap-2">
          <SocialFollowIcons />
        </div>
      </div>

      <div className="col-span-2 flex flex-col gap-2 px-5 pt-5 sm:flex-row sm:flex-wrap md:col-span-1 md:pl-7 md:pr-4">
        <CampaignJointPostMenu slug={slug} />
        <CampaignReferralShareButton
          text={share.text}
          subject={share.subject}
          fallbackHref={share.emailUrl}
        />
      </div>

      <p className="self-end pb-5 pl-5 pr-2 pt-4 font-body text-xs leading-relaxed text-warmgrau/60 md:pb-7 md:pl-7">
        Du willst Brief-nach-Berlin unterstützen?{" "}
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
