"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setPendingLetterVariantSubmission } from "@/lib/client/letterVariantSubmission";

const MIN_LETTER_LENGTH = 500;
const SUCCESS_HANDOFF_DELAY_MS = 1500;
const TONE_LABELS = ["freundlich", "höflich", "sachlich", "bestimmt", "nachdrücklich"] as const;

type SubmitState = "idle" | "sending";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function emailFromHash(): string {
  if (typeof window === "undefined") return "";
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  return params.get("email")?.trim() ?? "";
}

export function VariantForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [originalLetter, setOriginalLetter] = useState("");
  const [toneLevel, setToneLevel] = useState(3);
  const [changeRequest, setChangeRequest] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const readHashEmail = () => setEmail(emailFromHash());
    const timer = window.setTimeout(readHashEmail, 0);
    window.addEventListener("hashchange", readHashEmail);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", readHashEmail);
    };
  }, []);

  const trimmedLetter = originalLetter.trim();
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
        : `${trimmedLetter.length} Zeichen`,
    [trimmedLetter.length]
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
      changeRequest: changeRequest.trim() || undefined,
    };

    setSubmitState("sending");
    setPendingLetterVariantSubmission(submission);
    await new Promise((resolve) => setTimeout(resolve, SUCCESS_HANDOFF_DELAY_MS));
    router.push("/brief/anpassen/erfolg");
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
        <label htmlFor="variant-change" className="block font-body text-sm font-semibold text-warmgrau mb-1">
          Was soll anders werden?
        </label>
        <textarea
          id="variant-change"
          value={changeRequest}
          onChange={(event) => setChangeRequest(event.target.value)}
          rows={3}
          placeholder="Optional, z.B. kürzer, sachlicher, persönlicher, weniger scharf, mehr Druck"
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
