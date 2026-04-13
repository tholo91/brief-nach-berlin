"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, type Step1Data } from "@/lib/validation/wizardSchemas";

interface Step1FormProps {
  onNext: (data: Step1Data) => void;
}

export function Step1Form({ onNext }: Step1FormProps) {
  const [optionalOpen, setOptionalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      plz: "",
      email: "",
      name: "",
      party: "",
      ngo: "",
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
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-8">
        Schritt 1: Kontaktdaten
      </h1>

      <div className="space-y-4">
        {/* PLZ */}
        <div>
          <label htmlFor="plz" className="block font-body text-sm font-semibold text-warmgrau mb-1">
            Postleitzahl
          </label>
          <input
            id="plz"
            type="text"
            inputMode="numeric"
            maxLength={5}
            className={inputClassName(!!errors.plz)}
            aria-describedby={errors.plz ? "plz-error" : undefined}
            aria-invalid={!!errors.plz}
            {...register("plz")}
          />
          <p className="text-sm text-warmgrau/60 mt-1">
            Damit finden wir deinen zustaendigen Abgeordneten
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
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            className={inputClassName(!!errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <p className="text-sm text-warmgrau/60 mt-1">
            Wir schicken dir deinen Brief per Mail zu
          </p>
          {errors.email && (
            <p id="email-error" role="alert" className="text-sm text-airmail-rot mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Collapsible optional section */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOptionalOpen(!optionalOpen)}
          className="flex items-center gap-2 font-body text-sm font-semibold text-waldgruen hover:text-waldgruen-dark transition-colors"
          aria-expanded={optionalOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${optionalOpen ? "rotate-90" : ""}`}
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          Angaben zu deiner Person (optional)
        </button>

        {optionalOpen && (
          <div className="space-y-4 mt-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block font-body text-sm font-semibold text-warmgrau mb-1">
                Dein Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Max Mustermann"
                className={inputClassName(false)}
                {...register("name")}
              />
            </div>

            {/* Party */}
            <div>
              <label htmlFor="party" className="block font-body text-sm font-semibold text-warmgrau mb-1">
                Parteimitgliedschaft
              </label>
              <input
                id="party"
                type="text"
                placeholder="z.B. SPD, Gruene, CDU"
                className={inputClassName(false)}
                {...register("party")}
              />
            </div>

            {/* NGO */}
            <div>
              <label htmlFor="ngo" className="block font-body text-sm font-semibold text-warmgrau mb-1">
                Organisation / Gewerkschaft
              </label>
              <input
                id="ngo"
                type="text"
                placeholder="z.B. Greenpeace, ver.di"
                className={inputClassName(false)}
                {...register("ngo")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="mt-8">
        <button
          type="submit"
          className="bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full sm:w-auto cursor-pointer"
        >
          Weiter zum Anliegen
        </button>
      </div>
    </form>
  );
}
