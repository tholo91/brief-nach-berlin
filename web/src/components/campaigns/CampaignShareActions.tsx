"use client";

import { useState } from "react";
import type { ShareTarget } from "@/lib/share";

type CampaignShareActionsProps = {
  share: ShareTarget;
};

export function CampaignShareActions({ share }: CampaignShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(share.text);
      setCopied(true);
      setFallbackOpen(false);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setFallbackOpen(true);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
          href={share.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-waldgruen/25 bg-white px-3 py-2 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
        >
          WhatsApp
        </a>
        <a
          href={share.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-waldgruen/25 bg-white px-3 py-2 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
        >
          Telegram
        </a>
        <a
          href={share.emailUrl}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-waldgruen/25 bg-white px-3 py-2 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
        >
          E-Mail
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-waldgruen px-3 py-2 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
        >
          {copied ? "Kopiert" : "Kopieren"}
        </button>
      </div>
      {fallbackOpen && (
        <p className="mt-3 break-all rounded-md border border-warmgrau/15 bg-white/65 px-3 py-2 font-body text-xs leading-relaxed text-warmgrau/70">
          {share.text}
        </p>
      )}
    </div>
  );
}
