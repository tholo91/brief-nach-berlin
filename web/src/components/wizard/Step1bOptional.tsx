"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import type { Step1bData } from "@/lib/validation/wizardSchemas";
import { LETTER_LENGTHS, DEFAULT_LETTER_LENGTH, type LetterLength } from "@/lib/config";

interface Step1bOptionalProps {
  onNext: (data: Step1bData) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onErrorDismiss?: () => void;
  defaultValues?: Partial<Step1bData>;
  issueText?: string;
  onBackToIssue?: () => void;
}

const SHORT_INPUT_WORD_THRESHOLD = 60;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function PartyExplainer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 text-xs text-warmgrau/70 font-body">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
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
        Warum fragen wir das?
      </button>
      {open && (
        <div className="mt-2 border-l-4 border-waldgruen/50 bg-waldgruen/5 rounded-r-lg p-3 leading-relaxed text-warmgrau">
          <p>
            Wenn <span className="font-semibold text-waldgruen-dark">du selbst</span>{" "}Mitglied einer Partei bist und an Abgeordnete derselben Partei schreibst, kann der Brief das aufgreifen (&bdquo;als langjähriges Parteimitglied...&ldquo;). Das gibt deinem Anliegen mehr Gewicht.
          </p>
          <p className="mt-2 text-warmgrau/75">
            Die Info bleibt bei dir und kommt nur in deinen Brief: keine Datenbank, keine Weitergabe.
          </p>
        </div>
      )}
    </div>
  );
}

export function Step1bOptional({
  onNext,
  isSubmitting = false,
  errorMessage,
  onErrorDismiss,
  defaultValues,
  issueText,
  onBackToIssue,
}: Step1bOptionalProps) {
  const issueWordCount = issueText ? countWords(issueText) : 0;
  const isShortInput = issueWordCount > 0 && issueWordCount < SHORT_INPUT_WORD_THRESHOLD;
  const { register, handleSubmit, watch, setValue } = useForm<Step1bData>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      party: defaultValues?.party ?? "",
      ngo: defaultValues?.ngo ?? "",
      letterLength: defaultValues?.letterLength ?? DEFAULT_LETTER_LENGTH,
    },
  });

  const values = watch();
  const selectedLength = values.letterLength;

  const onSubmit = (data: Step1bData) => {
    onNext(data);
  };

  const inputClassName =
    "bg-creme border border-warmgrau/30 rounded-lg px-4 py-3 text-base font-body text-warmgrau focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen w-full";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-2">
        Zusätzliche Infos über dich
      </h1>
      <p className="font-body text-sm text-warmgrau/70 mb-8">
        Optional: Wenn du uns ein bisschen über dich erzählst, kann dein Brief gezielter formuliert werden. Du kannst diesen Schritt auch überspringen.
      </p>

      {/* Error banner */}
      {errorMessage && (
        <div
          role="alert"
          className="bg-airmail-rot/10 border-l-4 border-airmail-rot text-airmail-rot p-4 rounded-r-lg text-sm font-body mb-6"
        >
          {errorMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Party */}
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
            {...register("party")}
          />
          <PartyExplainer />
        </div>

        {/* NGO */}
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
            {...register("ngo")}
          />
        </div>

        <div className="w-full h-px bg-warmgrau/10" />

        {/* Letter Length Selection */}
        <div>
          <label className="block font-body text-sm font-semibold text-warmgrau mb-3">
            Gewünschte Brieflänge
          </label>
          <div className="flex gap-2">
            {(["1", "1.5", "2"] as LetterLength[]).map((len) => {
              const isActive = selectedLength === len;
              return (
                <button
                  key={len}
                  type="button"
                  onClick={() => setValue("letterLength", len)}
                  className={[
                    "flex-1 font-body text-sm py-2.5 rounded-lg border transition-all cursor-pointer",
                    isActive
                      ? "bg-waldgruen text-creme border-waldgruen shadow-sm"
                      : "bg-creme text-waldgruen-dark border-warmgrau/30 hover:border-waldgruen/50",
                  ].join(" ")}
                >
                  {LETTER_LENGTHS[len].label}
                </button>
              );
            })}
          </div>
          {!(isShortInput && selectedLength !== "1") && (
            <p className="text-xs text-warmgrau/50 mt-2">
              Standardmäßig ist eine Seite voreingestellt: prägnant und in 5-10 Minuten versandfertig auf Papier.
            </p>
          )}
          {isShortInput && selectedLength !== "1" && (
            <button
              type="button"
              onClick={() => onBackToIssue?.()}
              className="group mt-3 w-full text-left border-l-2 border-bernstein/60 bg-bernstein/5 hover:bg-bernstein/10 hover:border-bernstein rounded-r-md px-3 py-2 text-xs text-warmgrau/80 leading-relaxed flex items-start gap-2 cursor-pointer transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-bernstein/60 group-hover:text-bernstein group-hover:-translate-x-0.5 transition-all"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>
                Dein Text ist mit <span className="font-semibold text-bernstein">{issueWordCount} Wörtern</span> recht knapp für {LETTER_LENGTHS[selectedLength].label}. Lieber ein paar Sätze mehr ergänzen, sonst wird der Brief repetitiv.
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-10 flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            "bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl",
            "hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full shadow-md",
            isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-spin"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Wahlkreis finden...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              Abgeordnete auswählen
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
