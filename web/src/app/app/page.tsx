import { Suspense } from "react";
import type { Metadata } from "next";
import { WizardShell } from "@/components/wizard/WizardShell";

export const metadata: Metadata = {
  alternates: { canonical: "/app" },
  robots: { index: false, follow: true },
};

function WizardShellFallback() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-8 py-16 w-full" aria-hidden="true">
      <div className="flex items-center justify-center gap-6 mb-12">
        {["Dein Anliegen", "Kontaktdaten", "Zusätzliche Infos"].map((label, i) => (
          <div key={label} className="relative flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                i === 0 ? "bg-waldgruen" : "bg-warmgrau/30"
              }`}
            />
          </div>
        ))}
      </div>

      <div>
        <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-2">
          Wer ist für dein Anliegen zuständig?
        </h1>
        <p className="font-body text-sm text-warmgrau/70 mb-4">
          Deine Postleitzahl und E-Mail-Adresse reichen für den nächsten Schritt.
        </p>
        <div className="space-y-4">
          <div className="h-12 w-full rounded-lg border border-warmgrau/30 bg-creme shadow-sm" />
          <div className="h-12 w-full rounded-lg border border-warmgrau/30 bg-creme shadow-sm" />
        </div>
      </div>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense fallback={<WizardShellFallback />}>
      <WizardShell />
    </Suspense>
  );
}
