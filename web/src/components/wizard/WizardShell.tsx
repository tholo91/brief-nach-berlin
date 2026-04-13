"use client";

import { useState, useCallback } from "react";
import type { WizardStep, WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import type { Step1Data } from "@/lib/validation/wizardSchemas";
import { submitWizardAction } from "@/lib/actions/submitWizard";
import { Step1Form } from "./Step1Form";
import { Step2Issue } from "./Step2Issue";
import { Step3Success } from "./Step3Success";

export function WizardShell() {
  const [step, setStep] = useState<WizardStep>(1);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>({});
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [actionResult, setActionResult] = useState<WizardActionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStep1Complete = useCallback((data: Step1Data) => {
    setWizardData((prev) => ({ ...prev, ...data }));
    setStep(2);
  }, []);

  const handleStep2Submit = useCallback(
    async (issueText: string) => {
      setIsSubmitting(true);
      setErrorMessage(null);

      const fullData: WizardData = {
        plz: wizardData.plz ?? "",
        email: wizardData.email ?? "",
        name: wizardData.name,
        party: wizardData.party,
        ngo: wizardData.ngo,
        issueText,
      };

      try {
        const result = await submitWizardAction(fullData);

        if ("error" in result) {
          setErrorMessage(result.message);
          setIsSubmitting(false);
          return;
        }

        if ("disambiguationNeeded" in result && result.disambiguationNeeded) {
          setPoliticians(result.politicians);
          setActionResult(result);
          setWizardData((prev) => ({ ...prev, issueText }));
          setStep(3);
        } else if ("success" in result && result.success) {
          setActionResult(result);
          setWizardData((prev) => ({ ...prev, issueText }));
          setStep(3);
        }
      } catch {
        setErrorMessage("Es ist ein Fehler aufgetreten. Bitte versuche es erneut.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [wizardData]
  );

  const handleErrorDismiss = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-8 py-16">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-colors duration-150 ${
              s === step ? "bg-waldgruen" : "bg-warmgrau/30"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Step content with fade transition */}
      <div className="transition-opacity duration-150 ease-in" key={step}>
        {step === 1 && <Step1Form onNext={handleStep1Complete} />}
        {step === 2 && (
          <Step2Issue
            onSubmit={handleStep2Submit}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onErrorDismiss={handleErrorDismiss}
          />
        )}
        {step === 3 && (
          <Step3Success
            result={actionResult}
            wizardData={wizardData as WizardData}
            politicians={politicians}
          />
        )}
      </div>
    </div>
  );
}
