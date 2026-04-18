"use client";

import { useForm } from "react-hook-form";
import type { Step1bData } from "@/lib/types/wizard";
import { LETTER_LENGTHS, DEFAULT_LETTER_LENGTH, type LetterLength } from "@/lib/config";

interface Step1bOptionalProps {
  onNext: (data: Step1bData) => void;
  onSkip: () => void;
  defaultValues?: Partial<Step1bData>;
}

export function Step1bOptional({ onNext, onSkip, defaultValues }: Step1bOptionalProps) {
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

  // We consider "has value" if anything but the default length is changed,
  // or if name/party/ngo are set.
  const hasAnyValue =
    (values.name?.trim().length ?? 0) > 0 ||
    (values.party?.trim().length ?? 0) > 0 ||
    (values.ngo?.trim().length ?? 0) > 0 ||
    selectedLength !== DEFAULT_LETTER_LENGTH;

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
        Hier kannst du zusätzliche Infos eingeben, um den Brief noch aussagekräftiger zu machen und die gewünschte Länge festlegen.
      </p>

      <div className="space-y-6">
        {/* Letter Length Selection */}
        <div>
          <label className="block font-body text-sm font-semibold text-warmgrau mb-3">
            Brieflänge
          </label>
          <div className="flex gap-2">
            {(Object.keys(LETTER_LENGTHS) as LetterLength[]).map((len) => {
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
          <p className="text-xs text-warmgrau/50 mt-2 italic">
            Standardmäßig sind 1,5 Seiten voreingestellt für eine gute Balance aus Tiefe und Prägnanz.
          </p>
        </div>

        <div className="w-full h-px bg-warmgrau/10" />

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
      <div className="mt-10 flex flex-col gap-3">
        <button
          type="submit"
          className="bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full cursor-pointer shadow-md"
        >
          {hasAnyValue ? "Weiter" : "Standard übernehmen & Weiter"}
        </button>
        {!hasAnyValue && (
          <button
            type="button"
            onClick={onSkip}
            className="font-body text-sm font-medium text-warmgrau/70 hover:text-warmgrau transition-colors py-2 cursor-pointer"
          >
            Überspringen
          </button>
        )}
      </div>
    </form>
  );
}
