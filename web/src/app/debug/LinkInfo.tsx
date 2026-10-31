"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// lastWord bleibt am Icon, damit es nie allein in der letzten Zeile steht.
export default function LinkInfo({ children, lastWord }: { children: ReactNode; lastWord: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    }
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="relative mt-3">
      <p className="text-base leading-relaxed">
        {children}{" "}
        <span className="whitespace-nowrap">
          {lastWord}{" "}
          <button
            ref={button}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="link-info"
            aria-label="So funktioniert dieser Link"
            className="-m-1 inline-flex cursor-pointer rounded-full p-1 align-[-3px] text-waldgruen/80 transition-colors hover:text-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-waldgruen"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        </span>
      </p>
      {open && (
        <div
          id="link-info"
          className="animate-feedback-in absolute inset-x-0 top-full z-20 mt-2 rounded-xl border border-warmgrau/15 bg-white p-4 text-[15px] leading-relaxed shadow-lg"
        >
          <p className="font-semibold text-waldgruen-dark">So funktioniert dieser Link</p>
          <p className="mt-2">
            Deine Angaben stehen direkt im Link aus deiner Mail, als langer Code hinter „?d=“. Die
            Seite liest sie beim Öffnen daraus und zeigt sie an.
          </p>
          <p className="mt-2">
            Der Code ist nicht verschlüsselt: Wer den Link hat, kann alles lesen, auch deine
            E-Mail-Adresse und dein Anliegen. Leite ihn also nur weiter, wenn du das möchtest.
          </p>
        </div>
      )}
    </div>
  );
}
