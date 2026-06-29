"use client";

import { useState } from "react";

type CampaignUrlCopyFieldProps = {
  url: string;
  label?: string;
  variant?: "card" | "compact";
};

function displayParts(url: string): { prefix: string; slug: string } {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const slug = decodeURIComponent(parts.at(-1) ?? "");
    const prefix = `${parsed.hostname}/${parts.slice(0, -1).join("/")}/`;
    return { prefix, slug };
  } catch {
    return { prefix: "", slug: url };
  }
}

function copyTextWithFallback(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="transition-transform duration-200"
      >
        <path
          d="M3 8l3.5 3.5L13 4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-200"
    >
      <rect
        x="5"
        y="5"
        width="9"
        height="9"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CampaignUrlCopyField({
  url,
  label = "Kampagnenlink",
  variant = "card",
}: CampaignUrlCopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const parts = displayParts(url);

  async function copyUrl() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else if (!copyTextWithFallback(url)) {
        throw new Error("Copy failed");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(copyTextWithFallback(url));
      window.setTimeout(() => setCopied(false), 2200);
    }
  }

  if (variant === "compact") {
    return (
      <div className="grid gap-1.5">
        <p className="font-typewriter text-[11px] font-bold uppercase tracking-widest text-waldgruen/55">
          {label}
        </p>
        <button
          type="button"
          onClick={copyUrl}
          aria-label={copied ? "Kampagnenlink kopiert" : "Kampagnenlink kopieren"}
          className={`group inline-grid min-w-0 max-w-full grid-cols-[1fr_auto] items-center gap-2 rounded-md border px-3 py-2 text-left font-body text-sm outline-none transition-all duration-200 ${
            copied
              ? "border-waldgruen/40 bg-waldgruen/8 text-waldgruen-dark"
              : "border-warmgrau/16 bg-white/55 text-warmgrau/70 hover:border-waldgruen/35 hover:bg-white/80 focus:border-waldgruen"
          }`}
        >
          <span className="min-w-0 truncate">
            <span>{parts.prefix}</span>
            <span className="font-semibold text-waldgruen-dark">{parts.slug}</span>
          </span>
          <span
            className={`grid h-7 w-7 place-items-center rounded-md text-waldgruen-dark transition-all duration-200 ${
              copied ? "scale-105 bg-waldgruen/12" : "group-hover:bg-waldgruen/8"
            }`}
          >
            <CopyIcon copied={copied} />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-2 rounded-md border border-warmgrau/15 bg-white/65 px-4 py-4">
      <label
        htmlFor="campaign-public-url"
        className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60"
      >
        {label}
      </label>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <button
          id="campaign-public-url"
          type="button"
          onClick={copyUrl}
          className="min-w-0 rounded-md border border-warmgrau/20 bg-white px-3 py-2 text-left font-body text-sm outline-none transition-colors hover:border-waldgruen/40 focus:border-waldgruen"
        >
          <span className="break-all text-warmgrau/55">{parts.prefix}</span>
          <span className="break-all font-bold text-waldgruen-dark">
            {parts.slug}
          </span>
        </button>
        <button
          type="button"
          onClick={copyUrl}
          className="rounded-md bg-waldgruen px-4 py-2 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
        >
          <span className="inline-flex items-center gap-2">
            <CopyIcon copied={copied} />
            {copied ? "Kopiert" : "Link kopieren"}
          </span>
        </button>
      </div>
    </div>
  );
}
