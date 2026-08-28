"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Step1bData } from "@/lib/validation/wizardSchemas";
import { DEFAULT_LETTER_LENGTH, LETTER_LENGTHS, type LetterLength } from "@/lib/config";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";

const TONE_LABELS = ["freundlich", "höflich", "sachlich", "bestimmt", "nachdrücklich"] as const;

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
        Warum wird das gefragt?
      </button>
      {open && (
        <div className="mt-2 border-l-4 border-waldgruen/50 bg-waldgruen/5 rounded-r-lg p-3 leading-relaxed text-warmgrau">
          <p>
            Wenn <span className="font-semibold text-waldgruen-dark">du selbst</span> Mitglied einer Partei bist und an Abgeordnete derselben Partei schreibst, kann der Brief das aufgreifen.
          </p>
          <p className="mt-2 text-warmgrau/75">
            Die Angabe wird nicht gespeichert und nicht weitergegeben.
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
        Wie soll dein Brief klingen?
      </h1>
      <p className="font-body text-sm text-warmgrau/70 mb-8">
        Wähle noch Ton und Länge. Zusätzliche Angaben über dich sind freiwillig.
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
            Tonalität des Briefes
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
            aria-label="Tonlage des Briefes"
          />
          <div className="mt-1 flex justify-between gap-2">
            {TONE_LABELS.map((label, index) => (
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
            Gewünschte Brieflänge
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
                  {LETTER_LENGTHS[length].label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-warmgrau/50 mt-2">
            Eine Seite ist voreingestellt: prägnant und in 5–10 Minuten auf Papier abgeschrieben.
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
                Erweitert
              </span>
              <span className="mt-1 block font-body text-sm text-warmgrau/65">
                Zusätzliche Infos über dich (optional)
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
                  Bist du selbst Mitglied einer Partei?
                </label>
                <input
                  id="party"
                  type="text"
                  placeholder="z.B. SPD, Grüne, CDU"
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
                  Bist du in einer Organisation oder Gewerkschaft aktiv?
                </label>
                <input
                  id="ngo"
                  type="text"
                  placeholder="z.B. Greenpeace, ver.di"
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
                Diese Angaben helfen nur bei der Formulierung deines aktuellen Briefs. Sie werden nicht dauerhaft gespeichert.
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
            ? "Wahlkreis finden..."
            : isCampaign
              ? "Abgeordnete auswählen"
              : "Politische Ebene wählen"}
          {!isSubmitting && <WizardForwardIcon className="absolute right-5 top-1/2 -translate-y-1/2" />}
        </button>
      </div>
    </form>
  );
}
