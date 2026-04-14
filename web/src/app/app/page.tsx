import { Suspense } from "react";
import { WizardShell } from "@/components/wizard/WizardShell";

export default function AppPage() {
  return (
    <Suspense>
      <WizardShell />
    </Suspense>
  );
}
