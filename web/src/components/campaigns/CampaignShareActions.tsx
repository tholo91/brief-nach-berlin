import Image from "next/image";
import type { ShareTarget } from "@/lib/share";

type CampaignShareActionsProps = {
  share: ShareTarget;
};

function ShareIcon({
  src,
  alt = "",
}: {
  src: string;
  alt?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={16}
      height={16}
      className="h-4 w-4 shrink-0"
    />
  );
}

function LinkedinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path
        d="M3.6 5.7H1.5V14h2.1V5.7ZM2.6 2A1.2 1.2 0 1 0 2.6 4.4 1.2 1.2 0 0 0 2.6 2ZM14.5 9.2c0-2.2-1.2-3.6-3.1-3.6-1 0-1.8.4-2.2 1.1v-1H7.1V14h2.1V9.8c0-1.2.6-2 1.6-2s1.5.7 1.5 2V14h2.2V9.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CampaignShareActions({ share }: CampaignShareActionsProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
          href={share.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-waldgruen/25 bg-white px-3 py-2 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
        >
          <ShareIcon src="/images/icon-whatsapp.png" />
          WhatsApp
        </a>
        <a
          href={share.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-waldgruen/25 bg-white px-3 py-2 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
        >
          <ShareIcon src="/images/icon-telegram.png" />
          Telegram
        </a>
        <a
          href={share.emailUrl}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-waldgruen/25 bg-white px-3 py-2 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
        >
          <ShareIcon src="/images/icon-email.png" />
          E-Mail
        </a>
        <a
          href={share.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-waldgruen px-3 py-2 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
        >
          <LinkedinIcon />
          LinkedIn
        </a>
      </div>
    </div>
  );
}
