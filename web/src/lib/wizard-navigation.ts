import type { WizardStep } from "@/lib/types/wizard";

export type WizardStepDirection = "forward" | "backward" | "none";

const WIZARD_STEP_ORDER: Record<WizardStep, number> = {
  1: 1,
  2: 2,
  "2b": 3,
  level: 4,
  3: 5,
};

export function wizardStepDirection(
  from: WizardStep,
  to: WizardStep,
): WizardStepDirection {
  if (from === to) return "none";
  return WIZARD_STEP_ORDER[to] > WIZARD_STEP_ORDER[from]
    ? "forward"
    : "backward";
}
