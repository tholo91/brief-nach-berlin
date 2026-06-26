"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const WIZARD_PROGRESS_EVENT = "wizard-progress-change";

const WIZARD_PROGRESS_STEPS = [1, 2, 3] as const;

function progressFromStepParam(step: string | null): number | null {
  if (step === null || step === "1") return 1;
  if (step === "2") return 2;
  if (step === "2b") return 3;
  return null;
}

export default function AppHeader() {
  const [wizardProgress, setWizardProgress] = useState<number | null>(null);

  useEffect(() => {
    const readProgressFromUrl = () => {
      if (window.location.pathname !== "/app") {
        setWizardProgress(null);
        return;
      }
      setWizardProgress(
        progressFromStepParam(new URLSearchParams(window.location.search).get("step"))
      );
    };
    const handleProgressChange = (event: Event) => {
      const detail = (event as CustomEvent<{ progress?: number | null }>).detail;
      setWizardProgress(
        typeof detail?.progress === "number" ? detail.progress : null
      );
    };

    readProgressFromUrl();
    window.addEventListener(WIZARD_PROGRESS_EVENT, handleProgressChange);
    window.addEventListener("popstate", readProgressFromUrl);
    return () => {
      window.removeEventListener(WIZARD_PROGRESS_EVENT, handleProgressChange);
      window.removeEventListener("popstate", readProgressFromUrl);
    };
  }, []);

  return (
    <>
      {/* Airmail stripe */}
      <div
        className="h-2 w-full"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            var(--color-airmail-rot),
            var(--color-airmail-rot) 8px,
            var(--color-creme) 8px,
            var(--color-creme) 12px,
            var(--color-airmail-blau) 12px,
            var(--color-airmail-blau) 20px,
            var(--color-creme) 20px,
            var(--color-creme) 24px
          )`,
        }}
      />
      <header className="sticky top-0 z-50 bg-creme/95 backdrop-blur-sm border-b border-warmgrau/8">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-typewriter text-base md:text-lg font-bold text-waldgruen-dark tracking-tight hover:text-waldgruen transition-colors"
          >
            Brief nach Berlin
          </Link>

          {wizardProgress !== null && (
            <div
              className="sm:hidden flex items-center gap-3"
              role="status"
              aria-label={`Schritt ${wizardProgress} von 3`}
            >
              {WIZARD_PROGRESS_STEPS.map((dot) => (
                <span
                  key={dot}
                  aria-hidden="true"
                  className={[
                    "h-2.5 w-2.5 rounded-full transition-colors duration-150",
                    dot === wizardProgress
                      ? "bg-waldgruen"
                      : dot < wizardProgress
                        ? "bg-waldgruen/40"
                        : "bg-warmgrau/30",
                  ].join(" ")}
                />
              ))}
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
