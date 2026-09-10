"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  APP_URL,
  SHARE_TEXT_CAUSE,
  SHARE_URL_EMAIL,
  SHARE_URL_LINKEDIN,
  SHARE_URL_TELEGRAM,
  SHARE_URL_WHATSAPP,
} from "@/lib/config";

type ShareIcon = "whatsapp" | "telegram" | "email" | "linkedin";

const SHARE_TITLE = "Brief-nach-Berlin";

const channels: ReadonlyArray<{
  label: string;
  href: string;
  icon: ShareIcon;
  external?: boolean;
}> = [
  { label: "WhatsApp", href: SHARE_URL_WHATSAPP, icon: "whatsapp", external: true },
  { label: "Telegram", href: SHARE_URL_TELEGRAM, icon: "telegram", external: true },
  { label: "E-Mail", href: SHARE_URL_EMAIL, icon: "email" },
  { label: "LinkedIn", href: SHARE_URL_LINKEDIN, icon: "linkedin", external: true },
];

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined" || typeof document === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (userAgent.includes("Mac") && navigator.maxTouchPoints > 1)
  );
}

function ChannelIcon({ icon, iconOnly }: { icon: ShareIcon; iconOnly: boolean }) {
  if (icon === "linkedin") {
    return (
      <span
        aria-hidden="true"
        className={`${iconOnly ? "h-6 w-6 text-sm" : "h-[18px] w-[18px] text-[11px]"} inline-flex shrink-0 items-center justify-center rounded-[2px] bg-waldgruen font-body font-bold leading-none text-white`}
      >
        in
      </span>
    );
  }

  return (
    <Image
      src={`/images/icon-${icon}.png`}
      alt=""
      width={iconOnly ? 24 : 18}
      height={iconOnly ? 24 : 18}
      className={iconOnly ? "h-6 w-6 shrink-0" : "h-[18px] w-[18px] shrink-0"}
    />
  );
}

function NativeShareIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15V3" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

export function WeitersagenShareActions() {
  const [isIOS, setIsIOS] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    const ios = isIOSDevice();
    setIsIOS(ios);
    setCanNativeShare(ios && typeof navigator.share === "function");
  }, []);

  const iconOnly = isIOS;
  const buttonClassName = iconOnly
    ? "group inline-flex h-12 w-12 items-center justify-center rounded-xl border border-waldgruen/15 bg-white text-waldgruen-dark transition-all hover:border-waldgruen/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
    : "flex min-w-0 items-center justify-between gap-3 rounded-xl border border-waldgruen/15 bg-white px-5 py-4 text-waldgruen-dark transition-all hover:border-waldgruen/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen";
  const gridClassName = iconOnly
    ? canNativeShare
      ? "grid grid-cols-5 gap-2 justify-items-center"
      : "grid grid-cols-4 gap-2 justify-items-center"
    : "grid grid-cols-1 gap-3 sm:grid-cols-2";

  function handleNativeShare() {
    if (typeof navigator.share !== "function") return;

    void navigator.share({
      title: SHARE_TITLE,
      text: SHARE_TEXT_CAUSE,
      url: APP_URL,
    }).catch(() => undefined);
  }

  return (
    <div className={gridClassName}>
      {channels.map((channel) => (
        <a
          key={channel.label}
          href={channel.href}
          {...(channel.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          aria-label={channel.label}
          title={channel.label}
          className={buttonClassName}
        >
          <span className="flex min-w-0 items-center gap-3">
            <ChannelIcon icon={channel.icon} iconOnly={iconOnly} />
            {!iconOnly && (
              <span className="truncate font-body font-semibold">
                {channel.label}
              </span>
            )}
          </span>
          {!iconOnly && (
            <span className="shrink-0 font-typewriter text-xs uppercase tracking-wider text-warmgrau/60">
              Öffnen &rarr;
            </span>
          )}
        </a>
      ))}

      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Teilen"
          title="Teilen"
          className={`${buttonClassName} text-waldgruen`}
        >
          <span className="flex min-w-0 items-center gap-3">
            <NativeShareIcon />
            {!iconOnly && (
              <span className="truncate font-body font-semibold">Teilen</span>
            )}
          </span>
          {!iconOnly && (
            <span className="shrink-0 font-typewriter text-xs uppercase tracking-wider text-warmgrau/60">
              Öffnen &rarr;
            </span>
          )}
        </button>
      )}
    </div>
  );
}
