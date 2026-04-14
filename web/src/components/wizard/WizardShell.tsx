"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { WizardStep, WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import type { Step1Data } from "@/lib/validation/wizardSchemas";
import type { Step1bData } from "@/lib/validation/wizardSchemas";
import { submitWizardAction } from "@/lib/actions/submitWizard";
import { Step1Form } from "./Step1Form";
import { Step1bOptional } from "./Step1bOptional";
import { Step2Issue } from "./Step2Issue";
import { Step3Success } from "./Step3Success";

const PARAM_KEYS = ["plz"] as const;

const STEP_LABELS = [
  "Kontaktdaten",
  "Zusätzliche Infos",
  "Dein Anliegen",
] as const;

function readParamsToData(searchParams: URLSearchParams): Partial<WizardData> {
  const data: Record<string, string> = {};
  for (const key of PARAM_KEYS) {
    const val = searchParams.get(key);
    if (val) data[key] = val;
  }
  return data;
}

function writeDataToParams(router: ReturnType<typeof useRouter>, data: Partial<WizardData>, step: WizardStep) {
  const params = new URLSearchParams();
  for (const key of PARAM_KEYS) {
    const val = data[key as keyof WizardData];
    if (val) params.set(key, val);
  }
  params.set("step", String(step));
  router.replace(`?${params.toString()}`, { scroll: false });
}

// Map internal steps to the 3 progress dots
function stepToProgress(step: WizardStep): number {
  if (step === 1) return 1;
  if (step === "1b") return 2;
  if (step === 2) return 3;
  return 3; // step 3 (success) — hide indicator
}

export function WizardShell() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [wizardData, setWizardData] = useState<Partial<WizardData>>(() => {
    const data = readParamsToData(searchParams);
    const textParam = searchParams.get("text");
    if (textParam) {
      data.issueText = textParam;
    }
    return data;
  });
  const [step, setStep] = useState<WizardStep>(() => {
    const sp = searchParams.get("step");
    const textParam = searchParams.get("text");
    // Email is never persisted to URL (privacy), so direct navigation to step 1b/2
    // always lacks email — force back to step 1.
    const hasEmail = Boolean(searchParams.get("email"));
    if ((sp === "1b" || sp === "2") && !hasEmail) return 1;
    if (sp === "1b") return "1b";
    if (sp === "2") return 2;
    // If ?text= is present but no step param, pre-fill text but stay on step 1
    if (textParam) return 1;
    return 1;
  });
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [actionResult, setActionResult] = useState<WizardActionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync URL params when step/data change
  useEffect(() => {
    if (step !== 3) {
      writeDataToParams(router, wizardData, step);
    }
  }, [step, wizardData, router]);

  const handleStep1Complete = useCallback((data: Step1Data) => {
    setWizardData((prev) => ({ ...prev, ...data }));
    setStep("1b");
  }, []);

  const handleStep1bComplete = useCallback((data: Step1bData) => {
    setWizardData((prev) => ({ ...prev, ...data }));
    setStep(2);
  }, []);

  const handleStep1bSkip = useCallback(() => {
    setStep(2);
  }, []);

  const handleBack = useCallback(() => {
    if (step === "1b") setStep(1);
    else if (step === 2) setStep("1b");
  }, [step]);

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

  const progress = stepToProgress(step);
  const showIndicator = step !== 3;
  const showBack = step === "1b" || step === 2;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-8 py-16">
      {/* Progress indicator */}
      {showIndicator && (
        <div className="flex items-center justify-center gap-6 mb-12">
          {STEP_LABELS.map((label, i) => {
            const dotNum = i + 1;
            const isActive = dotNum === progress;
            const isDone = dotNum < progress;
            return (
              <div key={label} className="relative flex items-center gap-2 group">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-150 ${
                    isActive
                      ? "bg-waldgruen"
                      : isDone
                        ? "bg-waldgruen/40"
                        : "bg-warmgrau/30"
                  }`}
                  aria-hidden="true"
                />
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 font-body text-xs text-warmgrau/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Back button */}
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          className="font-body text-sm text-warmgrau/60 hover:text-warmgrau transition-colors mb-6 cursor-pointer flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          zurück
        </button>
      )}

      {/* Step content */}
      <div className="transition-opacity duration-150 ease-in" key={step}>
        {step === 1 && (
          <Step1Form
            onNext={handleStep1Complete}
            defaultValues={{ plz: wizardData.plz, email: wizardData.email }}
          />
        )}
        {step === "1b" && (
          <Step1bOptional
            onNext={handleStep1bComplete}
            onSkip={handleStep1bSkip}
            defaultValues={{ name: wizardData.name, party: wizardData.party, ngo: wizardData.ngo }}
          />
        )}
        {step === 2 && (
          <Step2Issue
            onSubmit={handleStep2Submit}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onErrorDismiss={handleErrorDismiss}
            defaultValue={wizardData.issueText}
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
