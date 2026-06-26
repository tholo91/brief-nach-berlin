import { Suspense } from "react";
import { WizardShell } from "@/components/wizard/WizardShell";

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
          Was beschäftigt dich gerade?
        </h1>
        <p className="font-body text-sm text-warmgrau/70 mb-4">
          Sprich drauflos und passe deinen Text danach an. Oder nenne ein paar
          Stichpunkte, du musst keine ganzen Sätze schreiben.
        </p>
        <div className="mb-4 rounded-r-lg border-l-4 border-waldgruen bg-waldgruen/5 px-4 py-3">
          <div className="h-5 w-3/4 rounded bg-waldgruen/10" />
        </div>
        <div className="h-40 w-full rounded-lg border border-warmgrau/30 bg-creme shadow-sm" />
        <div className="mt-1 flex min-h-[22px] justify-end">
          <div className="h-4 w-20 rounded bg-warmgrau/10" />
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
