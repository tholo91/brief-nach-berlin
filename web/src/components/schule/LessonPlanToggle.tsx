"use client";

import { useState } from "react";
import { LESSON_45, LESSON_90_EXTRAS, formatMinuteRange } from "@/lib/schule/lessonPlan";

const EXTRAS_ID = "schule-90-extras";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";

const MODES = [
  { value: 45, label: "45 Min" },
  { value: 90, label: "90 Min" },
] as const;

export function LessonPlanToggle() {
  const [mode, setMode] = useState<45 | 90>(45);

  return (
    <div>
      <div role="group" aria-label="Länge der Stunde" className="mt-4 inline-flex rounded-xl border border-waldgruen/25 bg-white p-1">
        {MODES.map((option) => {
          const pressed = mode === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={pressed}
              aria-controls={option.value === 90 ? EXTRAS_ID : undefined}
              onClick={() => setMode(option.value)}
              className={`min-h-10 rounded-lg px-4 font-body text-sm font-semibold transition-colors ${focusRing} ${
                pressed ? "bg-waldgruen text-creme" : "text-warmgrau hover:bg-waldgruen/5"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <ol className="mt-6">
        {LESSON_45.map((row, index) => {
          const last = index === LESSON_45.length - 1;
          return (
            <li key={row.phase} className="grid grid-cols-[5.5rem_1fr] gap-x-4">
              <span className="pt-0.5 font-typewriter text-sm font-bold text-waldgruen">{formatMinuteRange(row)} Min</span>
              <div className={`border-l-2 border-dashed border-waldgruen/25 pl-4 ${last ? "" : "pb-6"}`}>
                <p className="font-body text-base font-bold text-waldgruen-dark">{row.phase}</p>
                <p className="mt-1 font-body text-base leading-relaxed text-warmgrau">{row.what}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div id={EXTRAS_ID} hidden={mode === 45} className="mt-6">
        <p className="font-body text-base leading-relaxed text-warmgrau">Zusätzlich zum Ablauf oben:</p>
        <ul className="mt-3 space-y-3">
          {LESSON_90_EXTRAS.map((item, index) => (
            <li
              key={item}
              className="fade-in-row flex gap-3 font-body text-base leading-relaxed text-warmgrau"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span aria-hidden="true" className="font-typewriter font-bold text-waldgruen">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
