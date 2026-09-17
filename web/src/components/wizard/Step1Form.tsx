"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, type Step1Data } from "@/lib/validation/wizardSchemas";
import { suggestEmailCorrection } from "@/lib/email/emailProviders";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";
import { useUiCopy } from "@/components/i18n/LocaleProvider";

interface Step1FormProps {
  onNext: (data: Step1Data) => void;
  defaultValues?: Partial<Step1Data>;
  plzError?: string | null;
  onPlzErrorDismiss?: () => void;
}

export function Step1Form({
  onNext,
  defaultValues,
  plzError,
  onPlzErrorDismiss,
}: Step1FormProps) {
  const copy = useUiCopy();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, touchedFields },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: "onTouched",
    defaultValues: {
      plz: defaultValues?.plz ?? "",
      email: defaultValues?.email ?? "",
    },
  });

  const plzValue = watch("plz");
  const [locality, setLocality] = useState<{ ort: string } | null>(null);
  const [pendingSubmission, setPendingSubmission] = useState<Step1Data | null>(null);
  const [suggestedEmail, setSuggestedEmail] = useState("");
  const [suggestedEmailInvalid, setSuggestedEmailInvalid] = useState(false);

  useEffect(() => {
    if (!/^\d{5}$/.test(plzValue ?? "")) {
      setLocality(null);
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `https://openplzapi.org/de/Localities?postalCode=${plzValue}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;
        if (data.length > 1) return; // mehrere Orte – keinen irreführenden Einzelnamen anzeigen
        const first = data[0] as {
          name?: unknown;
          district?: unknown;
        };
        const ort = typeof first.name === "string" ? first.name : null;
        if (!ort) return;
        setLocality({ ort });
      } catch {
        // silent fail (network error, abort, JSON parse error)
      }
    })();

    return () => controller.abort();
  }, [plzValue]);

  const onSubmit = (data: Step1Data) => {
    const suggestion = suggestEmailCorrection(data.email);
    if (!suggestion) {
      onNext(data);
      return;
    }

    setPendingSubmission(data);
    setSuggestedEmail(suggestion);
    setSuggestedEmailInvalid(false);
  };

  const closeSuggestion = () => {
    setPendingSubmission(null);
    setSuggestedEmailInvalid(false);
  };

  const acceptSuggestion = () => {
    if (!pendingSubmission) return;

    const email = suggestedEmail.trim();
    if (!step1Schema.shape.email.safeParse(email).success) {
      setSuggestedEmailInvalid(true);
      return;
    }

    setValue("email", email, { shouldDirty: true, shouldValidate: true });
    onNext({ ...pendingSubmission, email });
  };

  const keepOriginalEmail = () => {
    if (!pendingSubmission) return;
    onNext(pendingSubmission);
  };

  useEffect(() => {
    if (!pendingSubmission) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPendingSubmission(null);
        setSuggestedEmailInvalid(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [pendingSubmission]);

  const inputClassName = (hasError: boolean) =>
    [
      "bg-creme border rounded-lg px-4 py-3 text-base font-body text-warmgrau",
      "focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen w-full",
      hasError ? "border-airmail-rot" : "border-warmgrau/30",
    ].join(" ");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-2">
        {copy.contact.heading}
      </h1>
      <p className="font-body text-sm text-warmgrau/70 mb-8">
        {copy.contact.intro}
      </p>

      <div className="space-y-4">
        {/* PLZ */}
        <div>
          <label htmlFor="plz" className="block font-body text-sm font-semibold text-warmgrau mb-1">
            {copy.contact.postalCodeLabel}
          </label>
          <input
            id="plz"
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder={copy.contact.postalCodePlaceholder}
            className={inputClassName((!!errors.plz && !!touchedFields.plz) || !!plzError)}
            aria-describedby={errors.plz && touchedFields.plz ? "plz-error" : plzError ? "plz-server-error" : "plz-hint"}
            aria-invalid={(!!errors.plz && !!touchedFields.plz) || !!plzError}
            onFocus={() => onPlzErrorDismiss?.()}
            {...register("plz")}
          />
          <p
            id="plz-hint"
            className="text-sm text-warmgrau/60 mt-1 truncate"
            aria-live="polite"
          >
            {locality
              ? copy.contact.localityLookup.replace("{locality}", locality.ort)
              : copy.contact.postalCodeHint}
          </p>
          {errors.plz && touchedFields.plz && (
            <p id="plz-error" role="alert" className="text-sm text-airmail-rot mt-1">
              {copy.contact.postalCodeInvalid}
            </p>
          )}
          {plzError && !errors.plz && (
            <p id="plz-server-error" role="alert" className="text-sm text-airmail-rot mt-1">
              {plzError}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block font-body text-sm font-semibold text-warmgrau mb-1">
            {copy.contact.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            placeholder={copy.contact.emailPlaceholder}
            className={inputClassName(!!errors.email && !!touchedFields.email)}
            aria-describedby={errors.email && touchedFields.email ? "email-error" : "email-hint"}
            aria-invalid={!!errors.email && !!touchedFields.email}
            {...register("email")}
          />
          <p id="email-hint" className="text-sm text-warmgrau/60 mt-1">
            {copy.contact.emailHint}
          </p>
          {errors.email && touchedFields.email && (
            <p id="email-error" role="alert" className="text-sm text-airmail-rot mt-1">
              {copy.contact.emailInvalid}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8">
        <button
          type="submit"
          disabled={!isValid}
          className={[
            "relative bg-waldgruen text-creme font-semibold text-base px-8 pr-14 py-4 rounded-xl whitespace-nowrap",
            "transition-colors min-h-[44px] w-full",
            isValid
              ? "hover:bg-waldgruen-dark cursor-pointer"
              : "opacity-50 cursor-not-allowed",
          ].join(" ")}
        >
          {copy.contact.next}
          <WizardForwardIcon className="absolute right-5 top-1/2 -translate-y-1/2" />
        </button>
      </div>

      {pendingSubmission && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-waldgruen-dark/45 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-suggestion-title"
            aria-describedby="email-suggestion-description"
            className="relative w-full max-w-md rounded-xl border border-waldgruen/20 bg-creme p-5 shadow-xl md:p-6"
          >
            <button
              type="button"
              onClick={closeSuggestion}
              aria-label={copy.progress.close}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-xl text-warmgrau/60 transition-colors hover:bg-waldgruen/8 hover:text-waldgruen"
            >
              ×
            </button>

            <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60">
              {copy.contact.emailSuggestionEntered}
            </p>
            <p className="mt-1 break-all pr-10 font-body text-sm text-warmgrau/70">
              {pendingSubmission.email}
            </p>
            <h2
              id="email-suggestion-title"
              className="mt-5 font-typewriter text-2xl font-bold leading-tight text-waldgruen-dark"
            >
              {copy.contact.emailSuggestionTitle}
            </h2>
            <p
              id="email-suggestion-description"
              className="mt-2 font-body text-sm leading-relaxed text-warmgrau/75"
            >
              {copy.contact.emailSuggestionIntro}
            </p>

            <label
              htmlFor="suggested-email"
              className="mt-5 block font-body text-xs font-bold uppercase tracking-wide text-waldgruen/70"
            >
              {copy.contact.emailSuggestionLabel}
            </label>
            <input
              id="suggested-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              value={suggestedEmail}
              onChange={(event) => {
                setSuggestedEmail(event.target.value);
                setSuggestedEmailInvalid(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  acceptSuggestion();
                }
              }}
              aria-invalid={suggestedEmailInvalid}
              aria-describedby={suggestedEmailInvalid ? "suggested-email-error" : undefined}
              className="mt-1 w-full rounded-lg border border-waldgruen/35 bg-waldgruen/5 px-4 py-3 font-body text-base font-bold text-waldgruen focus:border-waldgruen focus:outline-none focus:ring-2 focus:ring-waldgruen"
            />
            {suggestedEmailInvalid && (
              <p id="suggested-email-error" role="alert" className="mt-2 font-body text-sm text-airmail-rot">
                {copy.contact.emailInvalid}
              </p>
            )}

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={acceptSuggestion}
                className="min-h-11 w-full rounded-lg bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
              >
                {copy.contact.emailSuggestionAccept}
              </button>
              <button
                type="button"
                onClick={keepOriginalEmail}
                className="min-h-11 w-full rounded-lg px-5 py-3 font-body text-sm font-semibold text-waldgruen transition-colors hover:bg-waldgruen/8"
              >
                {copy.contact.emailSuggestionKeep}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
