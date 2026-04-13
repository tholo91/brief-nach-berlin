"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, type Step1Data } from "@/lib/validation/wizardSchemas";

interface Step1FormProps {
  onNext: (data: Step1Data) => void;
  defaultValues?: Partial<Step1Data>;
}

export function Step1Form({ onNext, defaultValues }: Step1FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: "onChange",
    defaultValues: {
      plz: defaultValues?.plz ?? "",
      email: defaultValues?.email ?? "",
    },
  });

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
        Dein Brief beginnt hier
      </h1>
      <p className="font-body text-sm text-warmgrau/70 mb-8">
        Damit wir den richtigen Abgeordneten finden und dir deinen Brief zuschicken können.
      </p>

      <div className="space-y-4">
        {/* PLZ */}
        <div>
          <label htmlFor="plz" className="block font-body text-sm font-semibold text-warmgrau mb-1">
            Postleitzahl *
          </label>
          <input
            id="plz"
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="z.B. 10115"
            className={inputClassName(!!errors.plz)}
            aria-describedby={errors.plz ? "plz-error" : "plz-hint"}
            aria-invalid={!!errors.plz}
            {...register("plz")}
          />
          <p id="plz-hint" className="text-sm text-warmgrau/60 mt-1">
            Damit finden wir deinen zuständigen Abgeordneten
          </p>
          {errors.plz && (
            <p id="plz-error" role="alert" className="text-sm text-airmail-rot mt-1">
              {errors.plz.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block font-body text-sm font-semibold text-warmgrau mb-1">
            E-Mail-Adresse *
          </label>
          <input
            id="email"
            type="email"
            placeholder="deine@email.de"
            className={inputClassName(!!errors.email)}
            aria-describedby={errors.email ? "email-error" : "email-hint"}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <p id="email-hint" className="text-sm text-warmgrau/60 mt-1">
            Wir schicken dir deinen Brief per Mail zu
          </p>
          {errors.email && (
            <p id="email-error" role="alert" className="text-sm text-airmail-rot mt-1">
              {errors.email.message}
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
            "bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl",
            "transition-colors min-h-[44px] w-full",
            isValid
              ? "hover:bg-waldgruen-dark cursor-pointer"
              : "opacity-50 cursor-not-allowed",
          ].join(" ")}
        >
          Weiter
        </button>
      </div>
    </form>
  );
}
