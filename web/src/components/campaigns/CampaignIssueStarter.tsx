"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WIZARD_PATH } from "@/lib/config";
import { readLandingDraft, writeLandingDraft } from "@/lib/landing-draft";
import { saveHandoff } from "@/lib/wizard-handoff";

const MIN_CHARS = 50;
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

type CampaignIssueStarterProps = {
  slug: string;
  title: string;
  initialIssueText: string;
  creatorName?: string | null;
  externalUrl?: string | null;
  logoPath?: string | null;
};

export function CampaignIssueStarter({
  slug,
  title,
  initialIssueText,
  creatorName,
  externalUrl,
  logoPath,
}: CampaignIssueStarterProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [issueText, setIssueText] = useState(initialIssueText);
  const [showHint, setShowHint] = useState(false);
  const trimmed = issueText.trim();
  const tooShort = trimmed.length < MIN_CHARS;

  useEffect(() => {
    router.prefetch(WIZARD_PATH);
  }, [router]);

  useIsoLayoutEffect(() => {
    const saved = readLandingDraft(slug);
    if (saved) setIssueText(saved);
  }, [slug]);

  useIsoLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const maxHeight =
      typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches
        ? 280
        : 360;
    el.style.height = "auto";
    el.style.height = `${Math.min(maxHeight, Math.max(190, el.scrollHeight))}px`;
  }, [issueText]);

  const continueToWizard = useCallback(() => {
    if (tooShort) {
      setShowHint(true);
      window.setTimeout(() => setShowHint(false), 2200);
      return;
    }

    saveHandoff({
      issueText: trimmed,
      source: "campaign",
      campaignSlug: slug,
      campaignTitle: title,
      campaignCreatorName: creatorName?.trim() || undefined,
      campaignExternalUrl: externalUrl?.trim() || undefined,
      campaignLogoPath: logoPath?.trim() || undefined,
    });
    router.push(WIZARD_PATH);
  }, [creatorName, externalUrl, logoPath, router, slug, title, tooShort, trimmed]);

  return (
    <div className="rounded-md border border-waldgruen/20 bg-white/90 p-4 shadow-[0_18px_48px_-28px_rgba(27,67,50,0.55)] backdrop-blur-sm sm:p-5">
      <div>
        <h3 className="font-body text-2xl font-bold leading-tight tracking-tight text-waldgruen-dark">
          Dein Brief ist vorbereitet
        </h3>
        <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-warmgrau/65">
          Ergänze, was dir an dem Thema wichtig ist. Die Vorlage bringt die
          Argumente mit, der nächste Schritt formuliert daraus deinen Brief.
        </p>
      </div>
      <label
        htmlFor="campaign-issue"
        className="sr-only"
      >
        Kampagnentext
      </label>
      <textarea
        ref={textareaRef}
        id="campaign-issue"
        value={issueText}
        onChange={(event) => {
          setIssueText(event.target.value);
          writeLandingDraft(event.target.value, slug);
        }}
        className="scrollbar-hide mt-5 w-full resize-none overflow-y-auto rounded-lg border border-warmgrau/25 bg-creme/65 px-4 py-3 font-body text-base leading-relaxed text-warmgrau outline-none transition-colors focus:border-waldgruen focus:bg-white focus:ring-2 focus:ring-waldgruen/20"
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`font-body text-sm leading-relaxed ${
            showHint && tooShort ? "text-airmail-rot" : "text-warmgrau/60"
          }`}
          aria-live="polite"
        >
          {tooShort
            ? `${trimmed.length} von mindestens ${MIN_CHARS} Zeichen`
            : "Kostenlos und ohne Account. Du prüfst alles vor dem Abschicken."}
        </p>
        <button
          type="button"
          onClick={continueToWizard}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme shadow-lg shadow-waldgruen/20 transition-colors hover:bg-waldgruen-dark active:scale-[0.98] sm:w-auto sm:shrink-0"
        >
          <span>Brief in 2 Minuten erstellen</span>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}
