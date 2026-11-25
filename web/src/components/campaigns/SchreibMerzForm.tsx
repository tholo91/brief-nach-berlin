"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/audio/VoiceRecorder";
import { ExpandableTopicChips } from "@/components/topics/ExpandableTopicChips";
import { useTopicStarters } from "@/components/topics/useTopicStarters";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";
import { useTypewriterPlaceholder } from "@/components/wizard/useTypewriterPlaceholder";
import { WIZARD_PATH } from "@/lib/config";
import { SCHREIB_MERZ_CAMPAIGN } from "@/lib/campaigns/specialCampaigns";
import { saveHandoff } from "@/lib/wizard-handoff";

const DRAFT_KEY = "special-campaign-draft:schreib-merz:v2";
const MAX_TOPICS = 2;
const MIN_ISSUE_LENGTH = 20;
const MAX_ISSUE_LENGTH = 5000;

const TOPIC_MESSAGES = {
  limit: "Zwei Themen reichen, sonst wird es ein Buch.",
  "removed-text": "Satz entfernt.",
  "removed-kept": "Thema entfernt. Deinen bearbeiteten Text habe ich stehen lassen.",
  added: "Satz eingefügt. Jetzt schreib dazu, was du selbst erlebst.",
  "added-max": "Zwei Themen drin. Schreib dazu, was du selbst erlebst.",
};

const PLACEHOLDERS = [
  "Ich zahle 650 € für 14 Quadratmeter WG-Zimmer. Das ist mehr als die Hälfte meines Azubi-Gehalts.",
  "Mein BAföG-Antrag liegt seit vier Monaten beim Amt. Bis dahin lebe ich vom Dispo.",
  "Nach 20 Uhr fährt kein Bus mehr in mein Dorf. Nach der Spätschicht laufe ich nach Hause.",
  "Alle reden über Wehrdienst, aber gefragt hat uns niemand.",
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function fitTextarea(el: HTMLTextAreaElement) {
  el.style.height = "";
  if (!el.value) return;
  el.style.height = "0px";
  const height = Math.min(360, el.scrollHeight + 2);
  el.style.height = "";
  if (height > el.offsetHeight) el.style.height = `${height}px`;
}

export function SchreibMerzForm() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [usedVoice, setUsedVoice] = useState(false);
  // Mikro und Zähler sitzen unten im Feld und wandern mit, wenn es wächst.
  const [fieldHeight, setFieldHeight] = useState(0);
  const {
    selectedTopicIds,
    issueText,
    setIssueText,
    statusMessage,
    setStatusMessage,
    toggleTopic,
    selectionLimitReached,
  } = useTopicStarters({
    draftKey: DRAFT_KEY,
    topics: SCHREIB_MERZ_CAMPAIGN.topics,
    maxTopics: MAX_TOPICS,
    maxIssueLength: MAX_ISSUE_LENGTH,
    messages: TOPIC_MESSAGES,
  });

  useIsoLayoutEffect(() => {
    if (textareaRef.current) fitTextarea(textareaRef.current);
  }, [issueText]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setFieldHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    router.prefetch(WIZARD_PATH);
  }, [router]);

  const hasText = issueText.length > 0;
  const typedPlaceholder = useTypewriterPlaceholder(PLACEHOLDERS, !hasText);

  function continueToWizard() {
    const trimmed = issueText.trim();
    if (trimmed.length < MIN_ISSUE_LENGTH) {
      setStatusMessage("Ein, zwei Sätze mehr, dann geht es weiter.");
      textareaRef.current?.focus();
      return;
    }
    if (trimmed.length > MAX_ISSUE_LENGTH) {
      setStatusMessage("Dein Text ist zu lang. Bitte kürze ihn etwas.");
      textareaRef.current?.focus();
      return;
    }
    saveHandoff({
      issueText: trimmed,
      source: "campaign",
      campaignSlug: SCHREIB_MERZ_CAMPAIGN.slug,
      campaignTitle: SCHREIB_MERZ_CAMPAIGN.title,
      campaignCreatorName: SCHREIB_MERZ_CAMPAIGN.creatorName,
      campaignTargetLevel: SCHREIB_MERZ_CAMPAIGN.targetLevel,
      usedSpeechToText: usedVoice,
    });
    router.push(WIZARD_PATH);
  }

  return (
    <div className="overflow-hidden rounded-sm border border-warmgrau/15 bg-white shadow-[0_20px_50px_-30px_rgba(27,67,50,0.45)]">
      <div
        aria-hidden="true"
        className="h-2 w-full"
        style={{
          background:
            "repeating-linear-gradient(-45deg, #c1121f 0 10px, #faf8f5 10px 15px, #1d3557 15px 25px, #faf8f5 25px 30px)",
        }}
      />
      <div className="space-y-5 p-4 sm:space-y-8 sm:p-7">
        <section aria-labelledby="merz-thema-heading">
          <ExpandableTopicChips
            heading={
              <h2 id="merz-thema-heading" className="font-typewriter text-base font-bold text-waldgruen-dark sm:text-lg">
                <span aria-hidden="true" className="mr-2 text-waldgruen">1</span>
                Was nervt dich?
              </h2>
            }
            gridId="merz-thema-chips"
            topics={SCHREIB_MERZ_CAMPAIGN.topics}
            selectedIds={selectedTopicIds}
            limitReached={selectionLimitReached}
            onToggle={toggleTopic}
          />
        </section>

        <section aria-labelledby="merz-text-label">
          <h2 className="font-typewriter text-base font-bold text-waldgruen-dark sm:text-lg">
            <span aria-hidden="true" className="mr-2 text-waldgruen">2</span>
            <label id="merz-text-label" htmlFor="merz-issue-text">Was erlebst du selbst?</label>
          </h2>
          <p id="merz-text-help" className="mt-1 font-body text-sm leading-relaxed text-warmgrau/70">
            Ein Satz aus deinem Alltag wirkt mehr als jede Statistik. Sprechen geht auch.
          </p>
          <div className="relative mt-2 sm:mt-3">
            <textarea
              ref={textareaRef}
              id="merz-issue-text"
              value={issueText}
              maxLength={MAX_ISSUE_LENGTH}
              rows={3}
              aria-describedby="merz-text-help merz-counter merz-status"
              onChange={(event) => {
                setIssueText(event.target.value);
                fitTextarea(event.target);
              }}
              className="block min-h-32 w-full resize-y rounded-xl border border-warmgrau/30 bg-creme pb-12 pl-4 pr-4 pt-3 font-body text-base leading-relaxed text-warmgrau shadow-sm outline-none transition sm:min-h-44 focus:border-waldgruen focus:ring-2 focus:ring-waldgruen"
            />
            {!hasText && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-4 right-4 top-3 font-body text-base leading-relaxed text-warmgrau/40"
              >
                {typedPlaceholder.reducedMotion ? PLACEHOLDERS[0] : typedPlaceholder.text}
              </div>
            )}
            <p
              id="merz-counter"
              aria-live="polite"
              className={
                hasText
                  ? "pointer-events-none absolute bottom-3.5 left-4 rounded-md border border-warmgrau/20 bg-creme/80 px-2 py-0.5 font-body text-xs text-warmgrau/50 md:text-sm"
                  : "sr-only"
              }
            >
              {hasText
                ? issueText.trim().length < MIN_ISSUE_LENGTH
                  ? `${issueText.trim().length} von mind. ${MIN_ISSUE_LENGTH} Zeichen`
                  : `${issueText.trim().length.toLocaleString("de-DE")} Zeichen`
                : ""}
            </p>
            <VoiceRecorder
              language="de"
              hasText={hasText}
              charCount={issueText.length}
              minChars={MIN_ISSUE_LENGTH}
              fieldHeight={fieldHeight}
              pinToBottom
              hideMetaRow
              onTranscription={(text) => {
                setUsedVoice(true);
                setIssueText((prev) => (prev ? `${prev}\n${text}` : text).slice(0, MAX_ISSUE_LENGTH));
              }}
            />
          </div>
          <p id="merz-status" aria-live="polite" className="font-body text-sm font-semibold text-waldgruen-dark empty:hidden mt-2">
            {statusMessage}
          </p>
        </section>

        <div>
          <button
            type="button"
            onClick={continueToWizard}
            className={`inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-waldgruen px-6 py-3 font-body text-base font-bold text-creme transition-colors hover:bg-waldgruen-dark ${focusRing}`}
          >
            Brief entwerfen
            <WizardForwardIcon />
          </button>
          <p className="mt-3 font-body text-sm leading-relaxed text-warmgrau/70">
            Im nächsten Schritt wählst du: Merz oder deine Abgeordneten im Bundestag.
          </p>
        </div>
      </div>
    </div>
  );
}
