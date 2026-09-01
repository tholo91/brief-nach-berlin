"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Step1bData } from "@/lib/validation/wizardSchemas";
import { DEFAULT_LETTER_LENGTH, type LetterLength } from "@/lib/config";
import { useUiCopy } from "@/components/i18n/LocaleProvider";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";

export interface StepPreferencesData extends Step1bData {
  toneLevel: number;
}

interface StepPreferencesProps {
  onNext: (data: StepPreferencesData) => void;
  onChange?: (data: StepPreferencesData) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onErrorDismiss?: () => void;
  defaultValues?: Partial<StepPreferencesData>;
  isCampaign?: boolean;
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
}: StepPreferencesProps) {
  const copy = useUiCopy();
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
    });
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
        })
      )}
      noValidate
    >
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-2">
        {copy.preferences.heading}
      </h1>
      <p className="font-body text-sm text-warmgrau/70 mb-8">
        {copy.preferences.intro}
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
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={toneLevel}
            onChange={(event) => {
              onErrorDismiss?.();
              const nextToneLevel = Number(event.target.value);
              setToneLevel(nextToneLevel);
              notifyChange({ toneLevel: nextToneLevel });
            }}
            className="w-full accent-waldgruen cursor-pointer"
            aria-label={copy.preferences.toneAriaLabel}
          />
          <div className="mt-1 flex justify-between gap-2">
            {copy.preferences.tones.map((label, index) => (
              <span
                key={label}
                className={[
                  "font-body text-xs text-center transition-colors",
                  toneLevel === index + 1
                    ? "text-waldgruen font-semibold"
                    : "text-warmgrau/45",
                ].join(" ")}
              >
                {label}
              </span>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="block font-body text-sm font-semibold text-warmgrau mb-3">
            {copy.preferences.lengthLegend}
          </legend>
          <div className="flex gap-2">
            {(["1", "1.5", "2"] as LetterLength[]).map((length) => {
              const active = selectedLength === length;
              return (
                <button
                  key={length}
                  type="button"
                  onClick={() => {
                    onErrorDismiss?.();
                    setValue("letterLength", length);
                    setSelectedLength(length);
                    notifyChange({ letterLength: length });
                  }}
                  className={[
                    "flex-1 font-body text-sm py-2.5 rounded-lg border transition-all cursor-pointer active:scale-[0.98]",
                    active
                      ? "bg-waldgruen text-creme border-waldgruen shadow-sm"
                      : "bg-creme text-waldgruen-dark border-warmgrau/30 hover:border-waldgruen/50",
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
