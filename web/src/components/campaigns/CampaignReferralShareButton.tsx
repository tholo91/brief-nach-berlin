"use client";

type CampaignReferralShareButtonProps = {
  text: string;
  subject: string;
  fallbackHref: string;
};

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 10V2.5M8 2.5 5.2 5.3M8 2.5l2.8 2.8M3 8.5v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CampaignReferralShareButton({
  text,
  subject,
  fallbackHref,
}: CampaignReferralShareButtonProps) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") return;
    event.preventDefault();
    navigator.share({ title: subject, text }).catch(() => {});
  }

  return (
    <a
      href={fallbackHref}
      onClick={handleClick}
      className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-waldgruen px-4 py-2.5 text-center font-body text-sm font-semibold text-creme transition-[background-color,transform] duration-200 hover:bg-waldgruen-dark active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
    >
      <ShareIcon />
      Weiterempfehlen
    </a>
  );
}
