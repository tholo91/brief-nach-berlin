"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WIZARD_PATH } from "@/lib/config";
import { readLandingDraft, writeLandingDraft } from "@/lib/landing-draft";
import { saveHandoff } from "@/lib/wizard-handoff";

const MIN_CHARS = 50;
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type CampaignIssueStarterProps = {
  slug: string;
  initialIssueText: string;
};

export function CampaignIssueStarter({
  slug,
  initialIssueText,
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
    el.style.height = "auto";
    el.style.height = `${Math.min(360, Math.max(180, el.scrollHeight))}px`;
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
    });
    router.push(WIZARD_PATH);
  }, [router, slug, tooShort, trimmed]);

  return (
    <div className="rounded-md border border-waldgruen/20 bg-creme/85 p-4 shadow-sm md:p-5">
      <label
        htmlFor="campaign-issue"
        className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/65"
      >
        Dein Starttext
      </label>
      <textarea
        ref={textareaRef}
        id="campaign-issue"
        value={issueText}
        onChange={(event) => {
          setIssueText(event.target.value);
          writeLandingDraft(event.target.value, slug);
        }}
        className="mt-3 w-full resize-none rounded-lg border border-warmgrau/25 bg-white/80 px-4 py-3 font-body text-base leading-relaxed text-warmgrau outline-none transition-colors focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20"
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`font-body text-sm ${
            showHint && tooShort ? "text-airmail-rot" : "text-warmgrau/60"
          }`}
          aria-live="polite"
        >
          {tooShort
            ? `${trimmed.length} von mindestens ${MIN_CHARS} Zeichen`
            : "Du kannst den Text im naechsten Schritt weiter anpassen."}
        </p>
        <button
          type="button"
          onClick={continueToWizard}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
        >
          Brief daraus starten
        </button>
      </div>
    </div>
  );
}
