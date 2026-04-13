"use client";

import type { WizardActionResult } from "@/lib/types/wizard";

interface Step2IssueProps {
  onSubmit: (issueText: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onErrorDismiss: () => void;
}

export function Step2Issue({ onSubmit, isSubmitting, errorMessage, onErrorDismiss }: Step2IssueProps) {
  return <div>Step2Issue placeholder</div>;
}
