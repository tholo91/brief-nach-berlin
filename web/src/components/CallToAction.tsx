"use client";

import Image from "next/image";
import { scrollToAnliegen } from "@/lib/scroll-to-input";
import { useUiCopy } from "@/components/i18n/LocaleProvider";

export default function CallToAction() {
  const copy = useUiCopy();
  return (
    <section
      id="cta"
      className="py-20 md:py-28 px-6 bg-waldgruen-dark relative overflow-hidden"
    >
      {/* Ghibli vignette: letterbox in Berlin */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <Image
          src="/images/letterbox-berlin.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25 mix-blend-luminosity"
          priority={false}
        />
        <div className="absolute inset-0 bg-waldgruen-dark/60" />
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="font-body text-3xl md:text-4xl font-bold text-creme mb-6 leading-snug tracking-tight">
          {copy.callToAction.title}
        </h2>

        <p className="font-body text-base text-creme/85 leading-relaxed mb-10 max-w-md mx-auto">
          {copy.callToAction.description}
        </p>

        <button
          onClick={scrollToAnliegen}
          className="inline-block bg-creme text-waldgruen-dark font-body font-semibold text-base px-10 py-4 rounded-xl hover:bg-creme/90 transition-colors cursor-pointer shadow-lg active:scale-[0.98]"
        >
          {copy.callToAction.button} &rarr;
        </button>

        <p className="mt-5 font-body text-sm text-creme/70">
          {copy.callToAction.trustLine}
        </p>
      </div>
    </section>
  );
}
