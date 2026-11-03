"use client";

import { useId, useRef } from "react";
import type { StatQuestionInfo } from "@/lib/internalStats/questions";

/**
 * (i)-Knopf neben einem Kartentitel. Öffnet die Frage im Wortlaut, wer sie
 * gesehen hat und, wo das Diagramm nicht alle Antworten zeigt, die Optionen.
 */
export function StatInfo({ title, info }: { title: string; info: StatQuestionInfo }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-label={`Frage zu ${title} anzeigen`}
        onClick={() => dialogRef.current?.showModal()}
        className="-my-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full align-middle text-waldgruen/70 transition-colors hover:text-waldgruen-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          ) {
            dialogRef.current?.close();
          }
        }}
        onClose={() => buttonRef.current?.focus()}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-waldgruen/20 bg-creme p-6 text-left font-body normal-case tracking-normal text-waldgruen-dark shadow-xl backdrop:bg-waldgruen-dark/40 sm:p-7"
      >
        <h2 id={titleId} className="font-typewriter text-lg font-bold leading-snug">
          {title}
        </h2>

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-waldgruen/70">Gefragt:</p>
        <p className="mt-1 text-base leading-relaxed">„{info.question}“</p>
        {info.hint && (
          <p className="mt-1 text-sm leading-relaxed text-warmgrau/75">{info.hint}</p>
        )}
        {info.alternativeQuestion && (
          <p className="mt-2 text-sm leading-relaxed">
            <span className="text-warmgrau/75">{info.alternativeQuestion.when}: </span>
            „{info.alternativeQuestion.question}“
          </p>
        )}

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-waldgruen/70">Wer:</p>
        <p className="mt-1 text-sm leading-relaxed">{info.asked}</p>

        {info.optionGroups ? (
          <div className="mt-4 grid gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-waldgruen/70">
              Alle Antwortmöglichkeiten:
            </p>
            {info.optionGroups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold">{group.title}</p>
                <ul className="mt-1 list-disc pl-5 text-sm leading-relaxed">
                  {group.options.map((option) => (
                    <li key={option}>{option}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          info.options && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-waldgruen/70">
                Antwortmöglichkeiten:
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm leading-relaxed">
                {info.options.map((option) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
            </div>
          )
        )}

        <button
          type="button"
          autoFocus
          onClick={() => dialogRef.current?.close()}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-waldgruen px-5 text-sm font-semibold text-creme hover:bg-waldgruen-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          Schließen
        </button>
      </dialog>
    </>
  );
}
