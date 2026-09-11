"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  { label: "E-Mail", href: SHARE_URL_EMAIL, icon: "email" },
  { label: "LinkedIn", href: SHARE_URL_LINKEDIN, icon: "linkedin", external: true },
  { label: "Telegram", href: SHARE_URL_TELEGRAM, icon: "telegram", external: true },
];

function isShareCapableTouchDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent.toLowerCase();
  return (
    /android|iphone|ipad|ipod/.test(userAgent) ||
    (userAgent.includes("mac") && navigator.maxTouchPoints > 1)
  );
}

function ChannelIcon({ icon }: { icon: ShareIcon }) {
  if (icon === "linkedin") {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] bg-waldgruen font-body text-sm font-bold leading-none text-white md:h-[18px] md:w-[18px] md:text-[11px]"
      >
        in
      </span>
    );
  }

  return (
    <Image
      src={`/images/icon-${icon}.png`}
      alt=""
      width={24}
      height={24}
      className="h-6 w-6 shrink-0 md:h-[18px] md:w-[18px]"
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

const buttonClassName =
  "group inline-flex h-12 w-12 items-center justify-center rounded-xl border border-waldgruen/15 bg-white text-waldgruen-dark transition-all hover:border-waldgruen/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen md:h-auto md:w-auto md:min-w-0 md:justify-between md:gap-3 md:px-5 md:py-4";

export function WeitersagenShareActions() {
  const canNativeShare = useSyncExternalStore(
    () => () => undefined,
    () =>
      isShareCapableTouchDevice() && typeof navigator.share === "function",
    () => false,
  );

  function handleNativeShare() {
    if (typeof navigator.share !== "function") return;

    void navigator
      .share({ title: SHARE_TITLE, text: SHARE_TEXT_CAUSE, url: APP_URL })
      .catch(() => undefined);
  }

  const gridClassName = canNativeShare
    ? "grid grid-cols-5 gap-2 md:grid-cols-2 md:gap-3"
    : "grid grid-cols-4 gap-2 md:grid-cols-2 md:gap-3";

  return (
    <div className={gridClassName}>
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
            <span className="hidden truncate font-body font-semibold md:inline">
              Teilen
            </span>
          </span>
          <span className="hidden shrink-0 font-typewriter text-xs uppercase tracking-wider text-warmgrau/60 md:inline">
            Öffnen &rarr;
          </span>
        </button>
      )}

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
            <ChannelIcon icon={channel.icon} />
            <span className="hidden truncate font-body font-semibold md:inline">
              {channel.label}
            </span>
          </span>
          <span className="hidden shrink-0 font-typewriter text-xs uppercase tracking-wider text-warmgrau/60 md:inline">
            Öffnen &rarr;
          </span>
        </a>
      ))}
    </div>
  );
}

export function CopyCaptionButton({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    if (!navigator.clipboard?.writeText) {
      setStatus("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
    }
  }

  const copied = status === "copied";

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Caption kopiert" : "Caption kopieren"}
        title={copied ? "Caption kopiert" : "Caption kopieren"}
        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen ${
          copied
            ? "scale-105 border-waldgruen bg-waldgruen text-creme"
            : "border-waldgruen/15 bg-white text-waldgruen-dark hover:border-waldgruen/40 hover:shadow-md"
        }`}
      >
        {copied ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 motion-safe:animate-pulse motion-reduce:animate-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
          </svg>
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied
          ? "Caption kopiert."
          : status === "error"
            ? "Die Caption konnte nicht kopiert werden."
            : ""}
      </span>
    </>
  );
}
