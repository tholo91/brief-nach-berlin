"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/audio/VoiceRecorder";
import { TopicStarterGrid } from "@/components/topics/TopicStarterGrid";
import { useTopicStarters } from "@/components/topics/useTopicStarters";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";
import { WIZARD_PATH } from "@/lib/config";
import { ELTERN_MAX_TOPICS, ELTERN_TOPICS } from "@/lib/schule/elternTopics";
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

const TOPIC_MESSAGES = {
  limit: "Du kannst höchstens zwei Themen wählen.",
  "removed-text": "Satzanfang entfernt.",
  "removed-kept": "Thema entfernt. Deinen bearbeiteten Text habe ich stehen lassen.",
  added: "Satzanfang eingefügt. Schreib ihn selbst zu Ende.",
  "added-max": "Zwei Satzanfänge eingefügt. Schreib sie selbst zu Ende.",
};

const ERROR_MESSAGES = {
  "text-short": "Schreib noch ein paar Worte zu deinem Anliegen.",
  "text-long": "Dein Text ist zu lang. Bitte kürze ihn etwas.",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";

export function ElternExperience() {
  const router = useRouter();
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
    topics: ELTERN_TOPICS,
    maxTopics: ELTERN_MAX_TOPICS,
    maxIssueLength: ISSUE_TEXT_MAX,
    messages: TOPIC_MESSAGES,
  });

  useEffect(() => {
    router.prefetch(WIZARD_PATH);
  }, [router]);

  function continueToWizard() {
    const result = validateElternSubmit({ klasse, issueText });
    if (!result.ok) {
      setStatusMessage(ERROR_MESSAGES[result.reason]);
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
          <label htmlFor="eltern-klasse" className="font-typewriter text-lg font-bold text-waldgruen-dark">
            Klasse deines Kindes <span className="font-body text-sm font-normal text-warmgrau/70">(optional)</span>
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
            <option value="">Keine Angabe</option>
            {KLASSEN.map((value) => (
              <option key={value} value={value}>
                {value}. Klasse
              </option>
            ))}
          </select>
        </div>

        <section aria-labelledby="eltern-thema-heading">
          <h2 id="eltern-thema-heading" className="font-typewriter text-lg font-bold text-waldgruen-dark">
            Worum geht es dir?
          </h2>
          <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau/70">
            Wähl bis zu zwei Themen. Jedes fügt einen Satzanfang ein, den du selbst zu Ende schreibst.
          </p>
          <TopicStarterGrid
            variant="plain"
            topics={ELTERN_TOPICS}
            selectedIds={selectedTopicIds}
            limitReached={selectionLimitReached}
            onToggle={toggleTopic}
          />
        </section>

        <section aria-labelledby="eltern-text-label">
          <h2 className="font-typewriter text-lg font-bold text-waldgruen-dark">
            <label id="eltern-text-label" htmlFor="eltern-issue-text">Was ist passiert?</label>
          </h2>
          <p id="eltern-text-help" className="mt-1 font-body text-sm leading-relaxed text-warmgrau/70">
            Je konkreter, desto besser: Was, wo, seit wann. Du kannst auch sprechen statt tippen.
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
              placeholder="Zum Beispiel: Seit den Herbstferien fällt in der Klasse meines Kindes Mathe fast jede Woche aus."
              className="min-h-44 w-full resize-y rounded-lg border border-dashed border-waldgruen/30 bg-white py-3 pl-4 pr-14 font-body text-base leading-relaxed text-warmgrau outline-none transition placeholder:text-warmgrau/40 focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20"
            />
            <VoiceRecorder
              language="de"
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
            Brief entwerfen
            <WizardForwardIcon />
          </button>
          <p className="mt-3 font-body text-sm leading-relaxed text-warmgrau/70">
            Als Nächstes gibst du deine E-Mail-Adresse und Postleitzahl an und wählst, an wen der Brief geht.
          </p>
        </div>
      </div>
    </div>
  );
}
