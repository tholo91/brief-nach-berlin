"use client";

import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { Step1bData } from "@/lib/validation/wizardSchemas";
import { DEFAULT_LETTER_LENGTH, type LetterLength } from "@/lib/config";
import { useLocale, useUiCopy } from "@/components/i18n/LocaleProvider";
import { VoiceRecorder, type VoiceRecorderState } from "@/components/audio/VoiceRecorder";
import { useTypewriterPlaceholder } from "@/components/wizard/useTypewriterPlaceholder";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";
import { ToneSlider } from "@/components/wizard/ToneSlider";

export const PERSONAL_NOTE_MAX = 400;
const PERSONAL_NOTE_FIELD_HEIGHT = 128;

export function appendPersonalHook(note: string, hook: string): string {
  const current = note.trimEnd();
  const addition = hook.trim();
  if (!addition || current.includes(addition)) return current;
  return `${current}${current ? " " : ""}${addition} `;
}

export interface StepPreferencesData extends Step1bData {
  toneLevel: number;
  /** Nur im Kampagnenmodus bei unverändertem Kampagnentext: eigener Satz zur Betroffenheit. */
  personalNote?: string;
}

interface StepPreferencesProps {
  onNext: (data: StepPreferencesData) => void;
  onChange?: (data: StepPreferencesData) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onErrorDismiss?: () => void;
  defaultValues?: Partial<StepPreferencesData>;
  isCampaign?: boolean;
  isYouth?: boolean;
  /** Kasten "Bist du selbst betroffen?" zeigen (Kampagne, Text unverändert). */
  showPersonalNote?: boolean;
  /** Aufhänger der Kampagne; leer: allgemeine Vorschläge aus der Copy. */
  personalHooks?: readonly string[];
}

function PartyExplainer() {
  const [open, setOpen] = useState(false);
  const copy = useUiCopy();

  return (
    <div className="mt-2 text-xs text-warmgrau/70 font-body">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-waldgruen/80 hover:text-waldgruen-dark underline underline-offset-2 cursor-pointer transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        {copy.preferences.partyWhy}
      </button>
      {open && (
        <div className="mt-2 border-l-4 border-waldgruen/50 bg-waldgruen/5 rounded-r-lg p-3 leading-relaxed text-warmgrau">
          <p>
            {copy.preferences.partyExplanation}
          </p>
          <p className="mt-2 text-warmgrau/75">
            {copy.preferences.partyPrivacy}
          </p>
        </div>
      )}
    </div>
  );
}

export function StepPreferences({
  onNext,
  onChange,
  isSubmitting = false,
  errorMessage,
  onErrorDismiss,
  defaultValues,
  isCampaign = false,
  isYouth = false,
  showPersonalNote = false,
  personalHooks,
}: StepPreferencesProps) {
  const copy = useUiCopy();
  const { locale } = useLocale();
  const personalVisible = isCampaign && showPersonalNote && !isYouth;
  const hooks =
    personalHooks && personalHooks.length > 0
      ? personalHooks.slice(0, 3)
      : copy.preferences.personalGenericHooks;
  const personalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [personalNote, setPersonalNote] = useState(
    personalVisible ? (defaultValues?.personalNote ?? "").slice(0, PERSONAL_NOTE_MAX) : ""
  );
  const personalNoteRef = useRef(personalNote);
  const [voiceState, setVoiceState] = useState<VoiceRecorderState>("idle");
  const handleVoiceStateChange = useCallback((state: VoiceRecorderState) => setVoiceState(state), []);
  const { text: animatedPlaceholder, reducedMotion } = useTypewriterPlaceholder(
    copy.preferences.personalPlaceholders,
    personalVisible && personalNote.length === 0 && voiceState === "idle"
  );
  const [advancedOpen, setAdvancedOpen] = useState(
    Boolean(defaultValues?.party?.trim() || defaultValues?.ngo?.trim())
  );
  const [toneLevel, setToneLevel] = useState(defaultValues?.toneLevel ?? 3);
  const [selectedLength, setSelectedLength] = useState<LetterLength>(
    defaultValues?.letterLength ?? DEFAULT_LETTER_LENGTH
  );
  const { register, handleSubmit, setValue, getValues } = useForm<Step1bData>({
    defaultValues: {
      party: defaultValues?.party ?? "",
      ngo: defaultValues?.ngo ?? "",
      letterLength: defaultValues?.letterLength ?? DEFAULT_LETTER_LENGTH,
    },
  });

  const inputClassName =
    "bg-creme border border-warmgrau/30 rounded-lg px-4 py-3 text-base font-body text-warmgrau focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen w-full";

  const notifyChange = (changes: Partial<StepPreferencesData>) => {
    const values = { ...getValues(), ...changes };
    onChange?.({
      party: values.party?.trim() || undefined,
      ngo: values.ngo?.trim() || undefined,
      letterLength: values.letterLength ?? DEFAULT_LETTER_LENGTH,
      toneLevel: values.toneLevel ?? toneLevel,
      ...(personalVisible ? { personalNote: (changes.personalNote ?? personalNoteRef.current).trim() || undefined } : {}),
    });
  };

  const updatePersonalNote = (value: string) => {
    const next = value.slice(0, PERSONAL_NOTE_MAX);
    personalNoteRef.current = next;
    setPersonalNote(next);
    notifyChange({ personalNote: next });
  };

  const pickPersonalHook = (hook: string) => {
    onErrorDismiss?.();
    const next = appendPersonalHook(personalNoteRef.current, hook);
    updatePersonalNote(next);
    window.setTimeout(() => {
      const el = personalTextareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(next.length, next.length);
    }, 0);
  };

  const appendPersonalTranscription = (text: string) => {
    const current = personalNoteRef.current.trimEnd();
    updatePersonalNote(current ? `${current} ${text.trim()}` : text.trim());
  };

  const partyField = register("party");
  const ngoField = register("ngo");

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onNext({
          ...data,
          party: data.party?.trim() || undefined,
          ngo: data.ngo?.trim() || undefined,
          toneLevel,
          ...(personalVisible ? { personalNote: personalNote.trim() || undefined } : {}),
        })
      )}
      noValidate
    >
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-2">
        {copy.preferences.heading}
      </h1>
      <p className="font-body text-sm text-warmgrau/70 mb-8">
        {isYouth ? copy.preferences.introYouth : copy.preferences.intro}
      </p>

      {errorMessage && (
        <div
          role="alert"
          className="bg-airmail-rot/10 border-l-4 border-airmail-rot text-airmail-rot p-4 rounded-r-lg text-sm font-body mb-6"
        >
          {errorMessage}
        </div>
      )}

      <div className="space-y-8">
        <fieldset>
          <legend className="block font-body text-sm font-semibold text-warmgrau mb-3">
            {copy.preferences.toneLegend}
          </legend>
          <ToneSlider
            value={toneLevel}
            labels={copy.preferences.tones}
            ariaLabel={copy.preferences.toneAriaLabel}
            onChange={(nextToneLevel) => {
              onErrorDismiss?.();
              setToneLevel(nextToneLevel);
              notifyChange({ toneLevel: nextToneLevel });
            }}
          />
        </fieldset>

        {!isYouth && (
          <fieldset>
            <legend className="block font-body text-sm font-semibold text-warmgrau mb-3">
              {copy.preferences.lengthLegend}
            </legend>
            <div
              role="group"
              aria-label={copy.preferences.lengthLegend}
              className="flex overflow-hidden rounded-lg border border-warmgrau/30 bg-creme divide-x divide-warmgrau/25"
            >
              {(["1", "1.5", "2"] as LetterLength[]).map((length) => {
                const active = selectedLength === length;
                return (
                  <button
                    key={length}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      onErrorDismiss?.();
                      setValue("letterLength", length);
                      setSelectedLength(length);
                      notifyChange({ letterLength: length });
                    }}
                    className={[
                      "min-w-0 min-h-[44px] flex-1 px-2 py-2.5 font-body text-sm transition-colors cursor-pointer",
                      active
                        ? "bg-waldgruen text-creme font-semibold"
                        : "text-waldgruen-dark hover:bg-waldgruen/5",
                    ].join(" ")}
                  >
                    {length === "1"
                      ? copy.preferences.lengthOne
                      : length === "1.5"
                        ? copy.preferences.lengthOneHalf
                        : copy.preferences.lengthTwo}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-warmgrau/50 mt-2">
              {copy.preferences.lengthHint}
            </p>
          </fieldset>
        )}

        {personalVisible && (
          <section aria-labelledby="personal-note-heading">
            <div className="flex items-baseline gap-2">
              <h2
                id="personal-note-heading"
                className="font-body text-sm font-semibold text-warmgrau"
              >
                {copy.preferences.personalHeading}
              </h2>
              <span className="font-body text-xs text-warmgrau/50 whitespace-nowrap">
                ({copy.preferences.personalOptional})
              </span>
            </div>
            <p className="mt-1 mb-3 font-body text-xs leading-relaxed text-warmgrau/65">
              {copy.preferences.personalHint}
            </p>
            <div className="relative">
              <textarea
                ref={personalTextareaRef}
                id="personal-note"
                value={personalNote}
                maxLength={PERSONAL_NOTE_MAX}
                aria-label={copy.preferences.personalFieldLabel}
                placeholder={reducedMotion ? copy.preferences.personalPlaceholders[0] : ""}
                onChange={(event) => {
                  onErrorDismiss?.();
                  updatePersonalNote(event.target.value);
                }}
                onFocus={() => onErrorDismiss?.()}
                style={{ height: PERSONAL_NOTE_FIELD_HEIGHT }}
                className={[
                  inputClassName,
                  "resize-none overflow-y-auto scrollbar-hide px-4 pt-3 pb-12 pr-14 leading-relaxed placeholder:text-warmgrau/40",
                ].join(" ")}
              />
              {!reducedMotion && personalNote.length === 0 && voiceState === "idle" && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 right-14 top-3 overflow-hidden text-left font-body text-base leading-relaxed text-warmgrau/40"
                >
                  {animatedPlaceholder}
                </div>
              )}
              <div
                role="group"
                aria-label={copy.preferences.personalHooksLabel}
                className="mt-1 flex flex-wrap gap-1"
              >
                {hooks.map((hook) => {
                  const hookText = hook.trim();
                  const active = personalNote.startsWith(hookText);
                  return (
                    <button
                      key={hook}
                      type="button"
                      aria-pressed={active}
                      title={hookText}
                      onClick={() => pickPersonalHook(hook)}
                      className={[
                        "max-w-[calc(50%-0.25rem)] min-h-[44px] rounded-full border px-3 py-1.5 text-left font-body text-sm leading-5 transition-colors cursor-pointer",
                        active
                          ? "border-waldgruen/50 bg-waldgruen/10 text-waldgruen-dark"
                          : "border-warmgrau/25 bg-creme/60 text-waldgruen-dark hover:border-waldgruen/40 hover:bg-waldgruen/5",
                      ].join(" ")}
                    >
                      <span className="line-clamp-2">{hookText.replace(/:\s*$/, "")}</span>
                    </button>
                  );
                })}
              </div>
              <VoiceRecorder
                key={locale}
                language={locale === "en" ? "en" : "de"}
                hidden={locale === "tr"}
                hasText={personalNote.length > 0}
                charCount={personalNote.length}
                fieldHeight={PERSONAL_NOTE_FIELD_HEIGHT}
                controlRightClass="right-2.5"
                pinToBottom
                hideCounter
                onTranscription={appendPersonalTranscription}
                onStateChange={handleVoiceStateChange}
              />
              {personalNote.length >= PERSONAL_NOTE_MAX - 80 && (
                <p
                  aria-live="polite"
                  className="absolute left-4 font-body text-xs text-warmgrau/50"
                  style={{ top: PERSONAL_NOTE_FIELD_HEIGHT - 32 }}
                >
                  {personalNote.length} / {PERSONAL_NOTE_MAX}
                </p>
              )}
            </div>
          </section>
        )}

        {!isYouth && (
          <div className="border-t border-warmgrau/10 pt-5">
            <button
              type="button"
              onClick={() => setAdvancedOpen((value) => !value)}
              aria-expanded={advancedOpen}
              aria-controls="advanced-personal-details"
              className="flex w-full items-center justify-between gap-4 text-left cursor-pointer"
            >
              <span>
                <span className="block font-body text-base font-semibold text-waldgruen-dark">
                  {copy.preferences.advanced}
                </span>
                <span className="mt-1 block font-body text-sm text-warmgrau/65">
                  {copy.preferences.advancedDescription}
                </span>
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`shrink-0 transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {advancedOpen && (
              <div
                id="advanced-personal-details"
                className="mt-5 space-y-6 rounded-r-lg border-l-4 border-waldgruen/35 bg-waldgruen/5 px-4 py-4"
              >
                <div>
                  <label htmlFor="party" className="block font-body text-sm font-semibold text-warmgrau mb-1">
                    {copy.preferences.partyLabel}
                  </label>
                  <input
                    id="party"
                    type="text"
                    placeholder={copy.preferences.partyPlaceholder}
                    className={inputClassName}
                    onFocus={() => onErrorDismiss?.()}
                    {...partyField}
                    onChange={(event) => {
                      partyField.onChange(event);
                      notifyChange({ party: event.target.value });
                    }}
                  />
                  <PartyExplainer />
                </div>

                <div>
                  <label htmlFor="ngo" className="block font-body text-sm font-semibold text-warmgrau mb-1">
                    {copy.preferences.organisationLabel}
                  </label>
                  <input
                    id="ngo"
                    type="text"
                    placeholder={copy.preferences.organisationPlaceholder}
                    className={inputClassName}
                    onFocus={() => onErrorDismiss?.()}
                    {...ngoField}
                    onChange={(event) => {
                      ngoField.onChange(event);
                      notifyChange({ ngo: event.target.value });
                    }}
                  />
                </div>

                <p className="font-body text-xs leading-relaxed text-warmgrau/65">
                  {copy.preferences.advancedPrivacy}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-10">
        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            "relative bg-waldgruen text-creme font-semibold text-base px-8 pr-14 py-4 rounded-xl whitespace-nowrap",
            "hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full shadow-md",
            isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-[0.99]",
          ].join(" ")}
        >
          {isSubmitting
            ? copy.preferences.findingDistrict
            : isCampaign
              ? copy.preferences.chooseRecipients
              : copy.preferences.chooseLevel}
          {!isSubmitting && <WizardForwardIcon className="absolute right-5 top-1/2 -translate-y-1/2" />}
        </button>
      </div>
    </form>
  );
}
