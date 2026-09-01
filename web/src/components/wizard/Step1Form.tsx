"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, type Step1Data } from "@/lib/validation/wizardSchemas";
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
    onNext(data);
  };

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
    </form>
  );
}
