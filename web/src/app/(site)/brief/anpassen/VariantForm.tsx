"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setPendingLetterVariantSubmission } from "@/lib/client/letterVariantSubmission";
import {
  DEFAULT_LETTER_LENGTH,
  LETTER_LENGTHS,
  letterLengthFromWordCount,
  type LetterLength,
} from "@/lib/config";

const MIN_LETTER_LENGTH = 500;
const SUCCESS_HANDOFF_DELAY_MS = 1500;
const TONE_LABELS = ["freundlich", "höflich", "sachlich", "bestimmt", "nachdrücklich"] as const;
const CHANGE_PRESETS = [
  { label: "Klingt nach mir", text: "Der Brief soll mehr nach mir klingen und weniger wie eine Vorlage." },
  { label: "Anliegen im Zentrum", text: "Mein eigentliches Anliegen soll im Mittelpunkt stehen." },
  { label: "Eigene Worte behalten", text: "Gute eigene Formulierungen aus dem Original sollen erhalten bleiben." },
  { label: "Nur sichere Fakten", text: "Bitte nur sichere Fakten verwenden und keine neuen Details ergänzen." },
  { label: "Klarer roter Faden", text: "Der Brief soll einen klaren roten Faden haben: Anlass, Begründung, Bitte." },
] as const;

type SubmitState = "idle" | "sending";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function parseToneLevel(value: string | null): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : undefined;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function variantDataFromHash(): { email: string; originalToneLevel?: number } {
  if (typeof window === "undefined") return { email: "" };
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  return {
    email: params.get("email")?.trim() ?? "",
    originalToneLevel: parseToneLevel(params.get("originalToneLevel")),
  };
}

export function VariantForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [originalLetter, setOriginalLetter] = useState("");
  const [toneLevel, setToneLevel] = useState(3);
  const [originalToneLevel, setOriginalToneLevel] = useState<number | undefined>();
  const [letterLength, setLetterLength] = useState<LetterLength>(DEFAULT_LETTER_LENGTH);
  const [letterLengthTouched, setLetterLengthTouched] = useState(false);
  const [changeRequest, setChangeRequest] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const readHashData = () => {
      const data = variantDataFromHash();
      setEmail(data.email);
      setOriginalToneLevel(data.originalToneLevel);
    };
    const timer = window.setTimeout(readHashData, 0);
    window.addEventListener("hashchange", readHashData);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", readHashData);
    };
  }, []);

  const trimmedLetter = originalLetter.trim();
  const originalWordCount = useMemo(() => countWords(trimmedLetter), [trimmedLetter]);

  useEffect(() => {
    if (letterLengthTouched) return;
    setLetterLength(letterLengthFromWordCount(originalWordCount));
  }, [letterLengthTouched, originalWordCount]);

  const emailError = touchedSubmit && !isValidEmail(email)
    ? "Bitte gib eine gültige E-Mail-Adresse ein."
    : null;
  const letterError = touchedSubmit && trimmedLetter.length < MIN_LETTER_LENGTH
    ? "Bitte füge den ganzen Briefentwurf aus der E-Mail ein."
    : null;
  const letterCountText = useMemo(
    () =>
      trimmedLetter.length < MIN_LETTER_LENGTH
        ? `${trimmedLetter.length} von mind. ${MIN_LETTER_LENGTH} Zeichen`
        : `${originalWordCount} Wörter, ${trimmedLetter.length} Zeichen`,
    [originalWordCount, trimmedLetter.length]
  );
  const canSubmit =
    isValidEmail(email) &&
    trimmedLetter.length >= MIN_LETTER_LENGTH &&
    submitState !== "sending";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouchedSubmit(true);
    setServerError(null);

    if (!canSubmit) return;

    const submission = {
      email: email.trim(),
      originalLetter: trimmedLetter,
      toneLevel,
      originalToneLevel,
      letterLength,
      changeRequest: changeRequest.trim() || undefined,
    };

    setSubmitState("sending");
    setPendingLetterVariantSubmission(submission);
    await new Promise((resolve) => setTimeout(resolve, SUCCESS_HANDOFF_DELAY_MS));
    router.push("/brief/anpassen/erfolg");
  }

  function toggleChangePreset(text: string) {
    setChangeRequest((current) => {
      const bullet = `- ${text}`;
      const lines = current
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.includes(bullet)) {
        return lines.filter((line) => line !== bullet).join("\n");
      }
      return [...lines, bullet].join("\n");
    });
  }

  const inputClassName = (hasError: boolean) =>
    [
      "bg-creme border rounded-lg px-4 py-3 text-base font-body text-warmgrau",
      "focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen w-full",
      hasError ? "border-airmail-rot" : "border-warmgrau/30",
    ].join(" ");

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {serverError && (
        <div
          role="alert"
          className="rounded-r-lg border-l-4 border-airmail-rot bg-airmail-rot/10 p-4 font-body text-sm text-airmail-rot"
        >
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="variant-email" className="block font-body text-sm font-semibold text-warmgrau mb-1">
          E-Mail-Adresse *
        </label>
        <input
          id="variant-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onInput={(event) => setEmail(event.currentTarget.value)}
          placeholder="deine@email.de"
          disabled={submitState === "sending"}
          className={inputClassName(Boolean(emailError))}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "variant-email-error" : "variant-email-hint"}
        />
        <p id="variant-email-hint" className="text-sm text-warmgrau/60 mt-1">
          An diese Adresse schicken wir die angepasste Variante.
        </p>
        {emailError && (
          <p id="variant-email-error" role="alert" className="text-sm text-airmail-rot mt-1">
            {emailError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="variant-letter" className="block font-body text-sm font-semibold text-warmgrau mb-1">
          Bestehenden Brief einfügen *
        </label>
        <textarea
          id="variant-letter"
          value={originalLetter}
          onChange={(event) => setOriginalLetter(event.target.value)}
          onInput={(event) => setOriginalLetter(event.currentTarget.value)}
          rows={12}
          placeholder="Füge hier den ganzen Briefentwurf aus deiner E-Mail ein."
          disabled={submitState === "sending"}
          className={[
            inputClassName(Boolean(letterError)),
            "min-h-[300px] resize-y leading-relaxed",
          ].join(" ")}
          aria-invalid={Boolean(letterError)}
          aria-describedby={letterError ? "variant-letter-error" : "variant-letter-counter"}
        />
        <div className="mt-1 flex min-h-[22px] items-start justify-between gap-4">
          <p id="variant-letter-counter" className="text-sm text-warmgrau/60">
            {letterCountText}
          </p>
        </div>
        {letterError && (
          <p id="variant-letter-error" role="alert" className="text-sm text-airmail-rot mt-1">
            {letterError}
          </p>
        )}
      </div>

      <div>
        <label className="block font-body text-sm font-semibold text-waldgruen-dark mb-3">
          Tonalität der neuen Variante
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={toneLevel}
          onChange={(event) => setToneLevel(Number(event.target.value))}
          disabled={submitState === "sending"}
          className="w-full accent-waldgruen cursor-pointer disabled:cursor-not-allowed"
          aria-label="Tonlage der neuen Briefvariante"
        />
        <div className="flex justify-between mt-1">
          {TONE_LABELS.map((label, i) => (
            <span
              key={label}
              className={[
                "font-body text-xs transition-colors",
                toneLevel === i + 1 ? "text-waldgruen font-semibold" : "text-warmgrau/40",
              ].join(" ")}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-body text-sm font-semibold text-warmgrau mb-3">
          Gewünschte Länge
        </label>
        <div className="flex gap-2">
          {(["1", "1.5", "2"] as LetterLength[]).map((len) => {
            const isActive = letterLength === len;
            return (
              <button
                key={len}
                type="button"
                onClick={() => {
                  setLetterLength(len);
                  setLetterLengthTouched(true);
                }}
                disabled={submitState === "sending"}
                className={[
                  "flex-1 rounded-lg border py-2.5 font-body text-sm transition-all disabled:cursor-not-allowed",
                  isActive
                    ? "border-waldgruen bg-waldgruen text-creme shadow-sm"
                    : "border-warmgrau/30 bg-creme text-waldgruen-dark hover:border-waldgruen/50",
                ].join(" ")}
              >
                {LETTER_LENGTHS[len].label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-warmgrau/50">
          Voreinstellung nach eingefügtem Brief: {LETTER_LENGTHS[letterLength].label}.
        </p>
      </div>

      <div>
        <label htmlFor="variant-change" className="block font-body text-sm font-semibold text-warmgrau mb-1">
          Was soll anders werden?
        </label>
        <div className="mb-3 flex flex-wrap gap-2">
          {CHANGE_PRESETS.map((preset) => {
            const isActive = changeRequest.includes(preset.text);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => toggleChangePreset(preset.text)}
                disabled={submitState === "sending"}
                className={[
                  "inline-flex min-h-[40px] items-center justify-center rounded-lg px-3 py-2 font-body text-sm transition-all disabled:cursor-not-allowed",
                  isActive
                    ? "bg-waldgruen text-creme font-semibold shadow-sm"
                    : "border border-warmgrau/20 bg-creme/60 text-warmgrau/70 hover:border-warmgrau/40 hover:text-warmgrau",
                ].join(" ")}
                aria-pressed={isActive}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <textarea
          id="variant-change"
          value={changeRequest}
          onChange={(event) => setChangeRequest(event.target.value)}
          onInput={(event) => setChangeRequest(event.currentTarget.value)}
          rows={5}
          placeholder={"Optional, z.B. als Stichpunkte:\n- Mein persönlicher Satz aus Absatz 2 soll bleiben\n- Die Bitte am Ende soll konkreter werden"}
          disabled={submitState === "sending"}
          className={[
            inputClassName(false),
            "resize-y leading-relaxed",
          ].join(" ")}
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={[
          "bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl",
          "transition-colors min-h-[44px] w-full shadow-md active:translate-y-px",
          canSubmit
            ? "hover:bg-waldgruen-dark cursor-pointer"
            : "opacity-60 cursor-not-allowed",
        ].join(" ")}
      >
        {submitState === "sending" ? "Variante wird erstellt..." : "Angepassten Brief zuschicken"}
      </button>
    </form>
  );
}
