"use client";

export interface PendingLetterVariantSubmission {
  email: string;
  originalLetter: string;
  toneLevel: number;
  originalToneLevel?: number;
  letterLength?: "1" | "1.5" | "2";
  changeRequest?: string;
}

export type LetterVariantSubmissionResult =
  | { status: "success" }
  | { status: "missing" }
  | { status: "error"; message: string; retryAfterSeconds?: number };

let pendingSubmission: PendingLetterVariantSubmission | null = null;
let inFlight: Promise<LetterVariantSubmissionResult> | null = null;
let lastResult: LetterVariantSubmissionResult | null = null;

export function setPendingLetterVariantSubmission(submission: PendingLetterVariantSubmission) {
  pendingSubmission = submission;
  inFlight = null;
  lastResult = null;
}

export function getPendingLetterVariantSubmission() {
  return pendingSubmission;
}

export function clearPendingLetterVariantSubmission() {
  pendingSubmission = null;
  inFlight = null;
  lastResult = null;
}

async function postVariantSubmission(
  submission: PendingLetterVariantSubmission
): Promise<LetterVariantSubmissionResult> {
  try {
    const response = await fetch("/api/generate-letter-variant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      const retryAfterHeader = response.headers.get("Retry-After");
      const parsedRetryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
      return {
        status: "error",
        message: payload.error ?? "Der Brief konnte nicht angepasst werden.",
        retryAfterSeconds: Number.isFinite(parsedRetryAfterSeconds) ? parsedRetryAfterSeconds : undefined,
      };
    }
    return { status: "success" };
  } catch {
    return {
      status: "error",
      message: "Der Brief konnte nicht angepasst werden. Bitte versuche es erneut.",
    };
  }
}

export function submitPendingLetterVariant(): Promise<LetterVariantSubmissionResult> {
  if (lastResult?.status === "success") return Promise.resolve(lastResult);
  if (!pendingSubmission) return Promise.resolve({ status: "missing" });
  if (inFlight) return inFlight;

  inFlight = postVariantSubmission(pendingSubmission).then((result) => {
    lastResult = result;
    inFlight = null;
    if (result.status === "success") {
      pendingSubmission = null;
    }
    return result;
  });
  return inFlight;
}

export function retryPendingLetterVariant() {
  inFlight = null;
  lastResult = null;
  return submitPendingLetterVariant();
}
