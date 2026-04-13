import { Suspense } from "react";
import { WizardShell } from "@/components/wizard/WizardShell";

export default function AppPage() {
  return (
    <main className="min-h-screen bg-creme">
      <Suspense>
        <WizardShell />
      </Suspense>
    </main>
  );
}
