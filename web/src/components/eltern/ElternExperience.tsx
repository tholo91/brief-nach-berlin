"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/audio/VoiceRecorder";
import { ExpandableTopicChips } from "@/components/topics/ExpandableTopicChips";
import { useTopicStarters } from "@/components/topics/useTopicStarters";
import { useLocale, useUiCopy } from "@/components/i18n/LocaleProvider";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";
import { WIZARD_PATH } from "@/lib/config";
import { ELTERN_MAX_TOPICS, ELTERN_TOPICS_BY_LOCALE } from "@/lib/schule/elternTopics";
import { ISSUE_TEXT_MAX, ISSUE_TEXT_MIN } from "@/lib/validation/wizardSchemas";
import { saveHandoff } from "@/lib/wizard-handoff";
import {
  ELTERN_DRAFT_KEY,
  ELTERN_KLASSE_MAX,
  ELTERN_KLASSE_MIN,
  buildElternHandoff,
  clearElternDraft,
  validateElternSubmit,
} from "./elternHandoff";

const KLASSEN = Array.from(
  { length: ELTERN_KLASSE_MAX - ELTERN_KLASSE_MIN + 1 },
  (_, i) => ELTERN_KLASSE_MIN + i,
);

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";

export function ElternExperience() {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = useUiCopy();
  const form = copy.eltern.form;
  const topics = ELTERN_TOPICS_BY_LOCALE[locale];
  const voiceUnavailable = locale === "tr";
  const [klasse, setKlasse] = useState<number | null>(null);
  const [usedVoice, setUsedVoice] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    selectedTopicIds,
    issueText,
    setIssueText,
    statusMessage,
    setStatusMessage,
    toggleTopic,
    selectionLimitReached,
  } = useTopicStarters({
    draftKey: ELTERN_DRAFT_KEY,
    topics,
    maxTopics: ELTERN_MAX_TOPICS,
    maxIssueLength: ISSUE_TEXT_MAX,
    messages: form.topicMessages,
  });

  useEffect(() => {
    router.prefetch(WIZARD_PATH);
  }, [router]);

  function continueToWizard() {
    const result = validateElternSubmit({ klasse, issueText, locale });
    if (!result.ok) {
      setStatusMessage(form.errors[result.reason]);
      textareaRef.current?.focus();
      return;
    }
    saveHandoff(buildElternHandoff({ issueText: result.issueText, usedSpeechToText: usedVoice }));
    try {
      clearElternDraft(sessionStorage);
    } catch {
      // Ohne sessionStorage gibt es auch keinen Entwurf zu löschen.
    }
    router.push(WIZARD_PATH);
  }

  const charCount = issueText.length;

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
      <div className="space-y-8 p-5 sm:p-7">
        <div>
          <label htmlFor="eltern-klasse" className="font-typewriter text-base font-bold text-waldgruen-dark sm:text-lg">
            {form.klasseLabel}{" "}
            <span className="font-body text-sm font-normal text-warmgrau/70">{form.optionalSuffix}</span>
          </label>
          <select
            id="eltern-klasse"
            value={klasse === null ? "" : String(klasse)}
            onChange={(event) => {
              setKlasse(event.target.value === "" ? null : Number(event.target.value));
              setStatusMessage("");
            }}
            className="mt-3 block min-h-11 w-full rounded-lg border border-waldgruen/25 bg-white px-3 font-body text-base text-warmgrau outline-none transition focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20 sm:w-56"
          >
            <option value="">{form.noClass}</option>
            {KLASSEN.map((value) => (
              <option key={value} value={value}>
                {form.optionTemplate.replace("{n}", String(value))}
              </option>
            ))}
          </select>
        </div>

        <section aria-labelledby="eltern-thema-heading">
          <ExpandableTopicChips
            heading={
              <h2 id="eltern-thema-heading" className="font-typewriter text-base font-bold text-waldgruen-dark sm:text-lg">
                {form.topicsHeading}
              </h2>
            }
            hint={
              <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau/70">
                {form.topicsHint}
              </p>
            }
            gridId="eltern-thema-chips"
            topics={topics}
            expandLabel={form.expandTopics}
            collapseLabel={form.collapseTopics}
            selectedIds={selectedTopicIds}
            limitReached={selectionLimitReached}
            onToggle={toggleTopic}
          />
        </section>

        <section aria-labelledby="eltern-text-label">
          <h2 className="font-typewriter text-base font-bold text-waldgruen-dark sm:text-lg">
            <label id="eltern-text-label" htmlFor="eltern-issue-text">{form.textLabel}</label>
          </h2>
          <p id="eltern-text-help" className="mt-1 font-body text-sm leading-relaxed text-warmgrau/70">
            {form.textHelp}
          </p>
          <div className="relative mt-3">
            <textarea
              ref={textareaRef}
              id="eltern-issue-text"
              value={issueText}
              maxLength={ISSUE_TEXT_MAX}
              rows={7}
              aria-describedby="eltern-text-help eltern-status"
              onChange={(event) => setIssueText(event.target.value)}
              placeholder={form.placeholder}
              className="min-h-44 w-full resize-y rounded-lg border border-dashed border-waldgruen/30 bg-white py-3 pl-4 pr-14 font-body text-base leading-relaxed text-warmgrau outline-none transition placeholder:text-warmgrau/40 focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20"
            />
            <VoiceRecorder
              key={locale}
              language={locale === "en" ? "en" : "de"}
              hidden={voiceUnavailable}
              hasText={charCount > 0}
              charCount={charCount}
              minChars={ISSUE_TEXT_MIN}
              onTranscription={(text) => {
                setUsedVoice(true);
                setIssueText((prev) => (prev ? `${prev}\n${text}` : text).slice(0, ISSUE_TEXT_MAX));
              }}
            />
          </div>
        </section>

        <div>
          <p id="eltern-status" aria-live="polite" className="min-h-5 font-body text-sm font-semibold text-waldgruen-dark">
            {statusMessage}
          </p>
          <button
            type="button"
            onClick={continueToWizard}
            className={`mt-2 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-waldgruen px-6 py-3 font-body text-base font-bold text-creme transition-colors hover:bg-waldgruen-dark ${focusRing}`}
          >
            {form.submit}
            <WizardForwardIcon />
          </button>
          <p className="mt-3 font-body text-sm leading-relaxed text-warmgrau/70">
            {form.nextStep}
          </p>
          {locale !== "de" && (
            <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/70">{copy.language.germanLetterNotice}</p>
          )}
        </div>
      </div>
    </div>
  );
}
