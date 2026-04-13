"use client";

import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";

interface Step3SuccessProps {
  result: WizardActionResult | null;
  wizardData: WizardData;
  politicians: Politician[];
}

export function Step3Success({ result, wizardData, politicians }: Step3SuccessProps) {
  return <div>Step3Success placeholder</div>;
}
