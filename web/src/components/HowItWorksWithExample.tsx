"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUiCopy } from "@/components/i18n/LocaleProvider";
import { EXAMPLE_LETTERS } from "@/lib/example-letters";
import LetterPaper from "./LetterPaper";

const ROTATION_INTERVAL_MS = 5000;

const stepNumbers = ["1.", "2.", "3."] as const;

export default function HowItWorksWithExample() {
  const copy = useUiCopy();
  const steps = [
    {
      number: stepNumbers[0],
      title: copy.howItWorks.step1Title,
      description: copy.howItWorks.step1Description,
    },
    {
      number: stepNumbers[1],
      title: copy.howItWorks.step2Title,
      description: copy.howItWorks.step2Description,
    },
    {
      number: stepNumbers[2],
      title: copy.howItWorks.step3Title,
      description: copy.howItWorks.step3Description,
    },
  ];
  const letter = EXAMPLE_LETTERS[0];
  const recipients = letter.rotatingRecipients ?? [letter.recipient];

  const [recipientIndex, setRecipientIndex] = useState(0);

  useEffect(() => {
    if (recipients.length <= 1) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const id = window.setInterval(() => {
      setRecipientIndex((i) => (i + 1) % recipients.length);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [recipients.length]);

  const recipient = recipients[recipientIndex];

  return (
    <section
      id="so-funktionierts"
      className="scroll-mt-20 px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-14">
          <p className="mb-3 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/50">
            {copy.howItWorks.eyebrow}
          </p>
          <h2 className="font-body text-3xl font-bold tracking-tight text-waldgruen-dark md:text-4xl">
            {copy.howItWorks.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-balance font-body text-base leading-relaxed text-warmgrau/80">
            {copy.howItWorks.intro}
          </p>
        </div>

        <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
          <ol className="flex flex-col">
            {steps.map((step, index) => (
              <li
                key={step.number}
                className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-5 pb-10 last:pb-0 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-6 md:pb-12"
              >
                <div className="flex justify-center">
                  <span
                    aria-hidden="true"
                    className="-mt-1 font-typewriter text-4xl font-bold leading-none tracking-tight text-waldgruen md:text-5xl"
                  >
                    {step.number}
                  </span>
                </div>

                <div>
                  <span className="sr-only">
                    {copy.howItWorks.stepLabel.replace(
                      "{number}",
                      String(index + 1),
                    )}
                    {": "}
                  </span>
                  <h3 className="mb-2 font-body text-xl font-bold leading-snug tracking-tight text-waldgruen-dark md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="max-w-[34rem] font-body text-base leading-relaxed text-warmgrau/80">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div
            id="beispiel"
            className="scroll-mt-20 md:sticky md:top-24 md:pt-6"
          >
            <p className="mb-4 text-center font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/50">
              {copy.howItWorks.resultLabel}
            </p>
            <Link
              href="/beispiele"
              prefetch={false}
              className="group mx-auto block max-w-md cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-4 focus-visible:ring-offset-creme"
              aria-label={copy.howItWorks.exampleAriaLabel}
            >
              <div className="transition-[transform,filter] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:drop-shadow-[0_20px_40px_rgba(45,80,22,0.22)]">
                <LetterPaper
                  letter={letter}
                  recipientOverride={recipient}
                  truncated
                  truncatedParagraphCount={3}
                  size="compact"
                  rotate="left"
                />
              </div>

              <p className="mt-6 text-center font-handwriting text-xl text-waldgruen-dark transition-colors duration-150 group-hover:text-waldgruen">
                {copy.howItWorks.readExample}
                <span
                  aria-hidden="true"
                  className="ml-2 inline-block transition-transform duration-150 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
