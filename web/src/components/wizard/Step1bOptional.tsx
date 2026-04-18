"use client";

import { useForm } from "react-hook-form";
import type { Step1bData } from "@/lib/validation/wizardSchemas";

interface Step1bOptionalProps {
  onNext: (data: Step1bData) => void;
  onSkip: () => void;
  defaultValues?: Partial<Step1bData>;
}

export function Step1bOptional({ onNext, onSkip, defaultValues }: Step1bOptionalProps) {
  const { register, handleSubmit, watch } = useForm<Step1bData>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      party: defaultValues?.party ?? "",
      ngo: defaultValues?.ngo ?? "",
    },
  });

  const values = watch();
  const hasAnyValue = Object.values(values).some((v) => v && v.trim().length > 0);

  const onSubmit = (data: Step1bData) => {
    onNext(data);
  };

  const inputClassName =
    "bg-creme border border-warmgrau/30 rounded-lg px-4 py-3 text-base font-body text-warmgrau focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen w-full";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-2">
        Zusätzliche Infos
      </h1>
      <p className="font-body text-sm text-warmgrau/70 mb-8">
        Hier kannst du zusätzliche Infos eingeben, um den Brief und die Argumente noch aussagekräftiger zu machen. Du kannst diesen Schritt auch überspringen.
      </p>

      <div className="space-y-4">
        {/* Name field hidden for now — user feedback: reduces friction without
            losing functionality, name defaults to "[Ihr Name]" placeholder in
            letter so recipient can fill it in themselves when copying by hand. */}

        {/* Party */}
        <div>
          <label htmlFor="party" className="block font-body text-sm font-semibold text-warmgrau mb-1">
            Parteimitgliedschaft
          </label>
          <input
            id="party"
            type="text"
            placeholder="z.B. SPD, Grüne, CDU"
            className={inputClassName}
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
            className={inputClassName}
            {...register("ngo")}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex flex-col gap-3">
        {hasAnyValue && (
          <button
            type="submit"
            className="bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full cursor-pointer"
          >
            Weiter
          </button>
        )}
        <button
          type="button"
          onClick={onSkip}
          className="font-body text-sm font-medium text-warmgrau/70 hover:text-warmgrau transition-colors py-2 cursor-pointer"
        >
          Überspringen
        </button>
      </div>
    </form>
  );
}
