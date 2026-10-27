"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/audio/VoiceRecorder";
import { ExpandableTopicChips } from "@/components/topics/ExpandableTopicChips";
import { useTopicStarters } from "@/components/topics/useTopicStarters";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";
import { WIZARD_PATH } from "@/lib/config";
import { JUNG_MAX_TOPICS, JUNG_TOPICS } from "@/lib/schule/jungTopics";
import { KLASSE_MAX, KLASSE_MIN, isValidKlasse } from "@/lib/schule/youth";
import { ISSUE_TEXT_MAX, ISSUE_TEXT_MIN } from "@/lib/validation/wizardSchemas";
import { saveHandoff } from "@/lib/wizard-handoff";
import type { JungEntry } from "./jungEntry";
import {
  JUNG_DRAFT_KEY,
  JUNG_KLASSE_KEY,
  buildJungHandoff,
  clearJungDraft,
  validateJungSubmit,
} from "./jungHandoff";

const KLASSEN = Array.from({ length: KLASSE_MAX - KLASSE_MIN + 1 }, (_, i) => KLASSE_MIN + i);

const TOPIC_MESSAGES = {
  limit: "Du kannst höchstens zwei Themen wählen.",
  "removed-text": "Satzanfang entfernt.",
  "removed-kept": "Thema entfernt. Deinen bearbeiteten Text habe ich stehen lassen.",
  added: "Satzanfang eingefügt. Schreib ihn selbst zu Ende.",
  "added-max": "Zwei Satzanfänge eingefügt. Schreib sie selbst zu Ende.",
};

const ERROR_MESSAGES = {
  klasse: "Wähl zuerst deine Klassenstufe.",
  "text-short": "Schreib noch ein paar Worte zu deinem Erlebnis.",
  "text-long": "Dein Text ist zu lang. Bitte kürze ihn etwas.",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";

export function JungExperience({ entry }: { entry: JungEntry }) {
  const router = useRouter();
  const entryKlasse = entry.status === "valid" ? entry.klasse : null;
  const [klasse, setKlasse] = useState<number | null>(entryKlasse);
  const [usedVoice, setUsedVoice] = useState(false);
  const [showPicker, setShowPicker] = useState(entry.status !== "valid");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const klasseGroupRef = useRef<HTMLFieldSetElement>(null);

  const {
    selectedTopicIds,
    issueText,
    setIssueText,
    statusMessage,
    setStatusMessage,
    toggleTopic,
    selectionLimitReached,
  } = useTopicStarters({
    draftKey: JUNG_DRAFT_KEY,
    topics: JUNG_TOPICS,
    maxTopics: JUNG_MAX_TOPICS,
    maxIssueLength: ISSUE_TEXT_MAX,
    messages: TOPIC_MESSAGES,
  });

  useEffect(() => {
    router.prefetch(WIZARD_PATH);
  }, [router]);

  useEffect(() => {
    if (entryKlasse !== null) return;
    let saved: number | null = null;
    try {
      const raw = Number(sessionStorage.getItem(JUNG_KLASSE_KEY));
      if (isValidKlasse(raw)) saved = raw;
    } catch {
      // Ohne sessionStorage wählt man die Klasse eben noch einmal.
    }
    if (saved === null) return;
    const frame = requestAnimationFrame(() => setKlasse(saved));
    return () => cancelAnimationFrame(frame);
  }, [entryKlasse]);

  function selectKlasse(value: number) {
    setKlasse(value);
    setStatusMessage("");
    try {
      sessionStorage.setItem(JUNG_KLASSE_KEY, String(value));
    } catch {
      // egal
    }
  }

  function focusKlasseInput() {
    requestAnimationFrame(() => {
      const group = klasseGroupRef.current;
      const input = group?.querySelector<HTMLInputElement>("input:checked") ?? group?.querySelector<HTMLInputElement>("input");
      input?.focus();
    });
  }

  function revealPicker() {
    setShowPicker(true);
    focusKlasseInput();
  }

  function continueToWizard() {
    const result = validateJungSubmit({ klasse, issueText });
    if (!result.ok) {
      setStatusMessage(ERROR_MESSAGES[result.reason]);
      if (result.reason === "klasse") {
        if (showPicker) {
          klasseGroupRef.current?.querySelector<HTMLInputElement>("input")?.focus();
        } else {
          revealPicker();
        }
      } else {
        textareaRef.current?.focus();
      }
      return;
    }
    if (klasse === null) return;
    saveHandoff(buildJungHandoff({ issueText: result.issueText, klasse, entry, usedSpeechToText: usedVoice }));
    try {
      clearJungDraft(sessionStorage);
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
      <div className="space-y-3 p-4 sm:space-y-8 sm:p-7">
        {showPicker ? (
          <fieldset ref={klasseGroupRef} role="radiogroup" className="min-w-0">
            <legend className="font-typewriter text-base font-bold text-waldgruen-dark sm:text-lg">
              <span aria-hidden="true" className="mr-2 text-waldgruen">1</span>
              In welche Klasse gehst du?
            </legend>
            <div className="mt-2 grid max-w-sm grid-cols-7 gap-1.5 sm:mt-3">
              {KLASSEN.map((value) => (
                <label key={value} className="relative">
                  <input
                    type="radio"
                    name="klasse"
                    value={value}
                    checked={klasse === value}
                    onChange={() => selectKlasse(value)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex h-11 w-full cursor-pointer items-center justify-center rounded-lg border border-waldgruen/25 bg-white font-body text-base font-bold text-warmgrau transition-colors hover:border-waldgruen/50 hover:bg-waldgruen/5 peer-checked:border-waldgruen peer-checked:bg-waldgruen peer-checked:text-creme peer-focus-visible:ring-2 peer-focus-visible:ring-waldgruen peer-focus-visible:ring-offset-2`}
                  >
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          entry.status === "valid" && (
            <div className="flex items-start justify-between gap-3 rounded-lg border border-waldgruen/25 bg-waldgruen/5 px-3 py-2.5">
              <p role="status" className="font-body text-sm leading-snug text-waldgruen-dark">
                <span aria-hidden="true" className="mr-2 font-typewriter font-bold text-waldgruen">1</span>
                Klasse {entry.klasse}, PLZ {entry.plz} eingetragen.
              </p>
              <button
                type="button"
                aria-label="Klasse ändern"
                onClick={revealPicker}
                className={`-my-1 shrink-0 rounded-lg px-2 py-1 font-body text-sm font-semibold text-waldgruen underline underline-offset-2 hover:text-waldgruen-dark ${focusRing}`}
              >
                ändern
              </button>
            </div>
          )
        )}

        <section aria-labelledby="jung-thema-heading">
          <ExpandableTopicChips
            heading={
              <h2 id="jung-thema-heading" className="font-typewriter text-base font-bold text-waldgruen-dark sm:text-lg">
                <span aria-hidden="true" className="mr-2 text-waldgruen">2</span>
                Worum geht es dir?
              </h2>
            }
            gridId="jung-thema-chips"
            topics={JUNG_TOPICS}
            selectedIds={selectedTopicIds}
            limitReached={selectionLimitReached}
            onToggle={toggleTopic}
          />
        </section>

        <section aria-labelledby="jung-text-label">
          <h2 className="font-typewriter text-base font-bold text-waldgruen-dark sm:text-lg">
            <span aria-hidden="true" className="mr-2 text-waldgruen">3</span>
            <label id="jung-text-label" htmlFor="jung-issue-text">Was ist dir passiert?</label>
          </h2>
          <p id="jung-text-help" className="sr-only">
            Du kannst auch sprechen statt tippen.
          </p>
          <div className="relative mt-2 sm:mt-3">
            <textarea
              ref={textareaRef}
              id="jung-issue-text"
              value={issueText}
              maxLength={ISSUE_TEXT_MAX}
              rows={3}
              aria-describedby="jung-text-help jung-status"
              onChange={(event) => setIssueText(event.target.value)}
              placeholder="Ein Erlebnis reicht, zum Beispiel: Seit den Herbstferien hatten wir in Mathe drei Vertretungen."
              className="min-h-24 w-full resize-y rounded-lg border border-dashed border-waldgruen/30 bg-white py-3 pl-4 pr-14 font-body text-base leading-relaxed text-warmgrau outline-none transition sm:min-h-44 placeholder:text-warmgrau/40 focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20"
            />
            <VoiceRecorder
              language="de"
              hasText={charCount > 0}
              charCount={charCount}
              minChars={ISSUE_TEXT_MIN}
              classToken={entry.status === "valid" ? entry.token : undefined}
              onTranscription={(text) => {
                setUsedVoice(true);
                setIssueText((prev) => (prev ? `${prev}\n${text}` : text).slice(0, ISSUE_TEXT_MAX));
              }}
            />
          </div>
        </section>

        <div>
          <p id="jung-status" aria-live="polite" className="mb-3 font-body text-sm font-semibold text-waldgruen-dark empty:mb-0">
            {statusMessage}
          </p>
          <button
            type="button"
            onClick={continueToWizard}
            className={`inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-waldgruen px-6 py-3 font-body text-base font-bold text-creme transition-colors hover:bg-waldgruen-dark ${focusRing}`}
          >
            Brief entwerfen
            <WizardForwardIcon />
          </button>
          <p className="mt-3 font-body text-sm leading-relaxed text-warmgrau/70">
            Als Nächstes gibst du deine E-Mail-Adresse an und wählst, an wen der Brief geht. Den Entwurf siehst du danach direkt hier, eine Kopie kommt per Mail.
          </p>
        </div>
      </div>
    </div>
  );
}
