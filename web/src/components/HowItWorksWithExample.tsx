"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EXAMPLE_LETTERS } from "@/lib/example-letters";
import LetterPaper from "./LetterPaper";

const ROTATION_INTERVAL_MS = 5000;

const steps = [
  {
    number: "01",
    title: "Erzähl, was dich beschäftigt",
    description:
      "Stichpunkte oder Gedanken per Sprachnachricht, wir übernehmen die Formulierung. Egal ob Müll auf dem Spielplatz, bezahlbarer Wohnraum oder Sorgen um die Demokratie.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-waldgruen">
        <path d="M10 10h28v24H22l-7 6v-6h-5V10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <line x1="17" y1="19" x2="31" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="17" y1="25" x2="27" y2="25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Wir finden die passende Adresse",
    description:
      "Anhand deiner PLZ ermitteln wir, wer politisch zuständig ist. Datenschutzkonform, ohne Account.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-waldgruen">
        <circle cx="24" cy="18" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M24 26c-8 0-14 5-14 10h28c0-5-6-10-14-10z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M36 10l-4 4m4-4l4 4m-4-4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Dein Brief, fertig zum Abschicken",
    description:
      "Wir formulieren einen persönlichen, sachlichen Brief mit den besten Argumenten. Eine Seite, in deinem Postfach.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-waldgruen">
        <rect x="8" y="6" width="28" height="36" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="14" y1="14" x2="30" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="26" x2="26" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="32" x2="22" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="32" y="4" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
      </svg>
    ),
  },
];

export default function HowItWorksWithExample() {
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
      className="py-16 md:py-20 px-6 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
            In drei Schritten
          </p>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark tracking-tight">
            So einfach geht&apos;s
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          <ol className="flex flex-col gap-10">
            {steps.map((step) => (
              <li key={step.number} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-2xl bg-waldgruen/10 shrink-0">
                    {step.icon}
                  </div>
                  <span className="font-typewriter text-[11px] tracking-widest text-warmgrau/50 font-bold uppercase">
                    Schritt {step.number}
                  </span>
                </div>

                <h3 className="font-body text-lg md:text-xl font-bold text-waldgruen-dark mb-3 tracking-tight leading-snug">
                  {step.title}
                </h3>

                <p className="font-body text-[15px] text-warmgrau/80 leading-relaxed">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          <div id="beispiel" className="md:sticky md:top-24 scroll-mt-20">
            <Link
              href="/beispiele"
              className="block max-w-md mx-auto group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-4 focus-visible:ring-offset-creme rounded-sm"
              aria-label="Vollständigen Brief und weitere Beispiele lesen"
            >
              <div className="transition-[transform,filter] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:drop-shadow-[0_20px_40px_rgba(45,80,22,0.22)]">
                <LetterPaper
                  letter={letter}
                  recipientOverride={recipient}
                  truncated
                  size="compact"
                  rotate="left"
                />
              </div>

              <p className="text-center mt-6 font-handwriting text-xl text-waldgruen-dark group-hover:text-waldgruen transition-colors duration-150">
                Ganzen Brief lesen
                <span aria-hidden="true" className="ml-2 inline-block transition-transform duration-150 group-hover:translate-x-1">
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
