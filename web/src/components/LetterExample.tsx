"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EXAMPLE_LETTERS } from "@/lib/example-letters";
import LetterPaper from "./LetterPaper";

const ROTATION_INTERVAL_MS = 5000;

export default function LetterExample() {
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
      id="beispiel"
      className="py-16 md:py-20 px-6 bg-creme/60 scroll-mt-20"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 max-w-xl mx-auto">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
            Ein echter Brief
          </p>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark tracking-tight mb-3">
            So sieht ein Brief aus, der ankommt
          </h2>
          <p className="font-body text-sm md:text-base text-warmgrau/80 leading-relaxed">
            Echter Brief, anonymisiert. Der Empfänger wechselt zur Anschauung.
          </p>
        </div>

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
    </section>
  );
}
