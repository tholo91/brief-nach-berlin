"use server";

import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import { step1Schema, step1bSchema, step2Schema } from "@/lib/validation/wizardSchemas";
import { lookupPLZ } from "@/lib/lookup/plzLookup";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rateLimit";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";

const RATE_LIMIT_MESSAGE =
  "Du hast in kurzer Zeit viele Briefe erstellt. Bitte versuche es später erneut.";

export async function submitWizardAction(
  data: WizardData
): Promise<WizardActionResult> {
  const log = (stage: string, extra?: Record<string, unknown>) => {
    console.log(`[submitWizard] ${stage}`, extra ?? "");
  };

  log("start", {
    plz: data.plz,
    issueTextLength: data.issueText?.length ?? 0,
    hasName: Boolean(data.name),
    hasParty: Boolean(data.party),
    hasNgo: Boolean(data.ngo),
    letterLength: data.letterLength,
  });

  try {
    // 1. Validate input server-side with Zod (T-02-09)
    const step1Result = step1Schema.safeParse(data);
    if (!step1Result.success) {
      console.warn("[submitWizard] step1 validation failed", step1Result.error.flatten());
      return { error: "server_error", message: "Ungültige Eingabe." };
    }

    const step1bResult = step1bSchema.safeParse(data);
    if (!step1bResult.success) {
      console.warn("[submitWizard] step1b validation failed", step1bResult.error.flatten());
      // Fallback to default length if validation fails
      data.letterLength = DEFAULT_LETTER_LENGTH;
    }

    const step2Result = step2Schema.safeParse({ issueText: data.issueText });
    if (!step2Result.success) {
      console.warn("[submitWizard] step2 validation failed", step2Result.error.flatten());
      return {
        error: "server_error",
        message: "Bitte beschreibe dein Anliegen.",
      };
    }
    log("validated");

    // 1b. Rate limit check (IP + email) BEFORE moderation/AI spend.
    const ip = await getClientIp();
    const ipLimit = checkRateLimit(`letter:ip:${ip}`, LIMITS.LETTERS_PER_IP.max, LIMITS.LETTERS_PER_IP.windowMs);
    if (!ipLimit.allowed) {
      log("rate limited by ip", { ip, retryAfterSeconds: ipLimit.retryAfterSeconds });
      return {
        error: "rate_limited",
        message: RATE_LIMIT_MESSAGE,
        retryAfterSeconds: ipLimit.retryAfterSeconds,
      };
    }
    const emailLimit = checkRateLimit(
      `letter:email:${data.email.toLowerCase()}`,
      LIMITS.LETTERS_PER_EMAIL.max,
      LIMITS.LETTERS_PER_EMAIL.windowMs
    );
    if (!emailLimit.allowed) {
      log("rate limited by email", { retryAfterSeconds: emailLimit.retryAfterSeconds });
      return {
        error: "rate_limited",
        message: RATE_LIMIT_MESSAGE,
        retryAfterSeconds: emailLimit.retryAfterSeconds,
      };
    }

    // PLZ lookup using Phase 1 static data
    const { wahlkreisIds, politicians } = lookupPLZ(data.plz);
    log("plz lookup", { wahlkreisCount: wahlkreisIds.length, politicianCount: politicians.length });
    if (wahlkreisIds.length === 0 || politicians.length === 0) {
      return {
        error: "plz_not_found",
        message:
          "Für diese Postleitzahl haben wir derzeit keinen direkt gewählten Wahlkreisabgeordneten in unseren Daten. Entweder stimmt die PLZ nicht, oder dein Wahlkreis wird aktuell nur durch Listenabgeordnete vertreten. Du findest deine Abgeordneten unter bundestag.de.",
      };
    }

    // 4. Always route through the politician picker. Even for a single
    // Wahlkreis there are typically 4-5 candidates (1 Direktmandat + list
    // candidates) and the user benefits from being able to (a) see who
    // they're writing to and (b) open the Abgeordnetenwatch profile before
    // committing. The Direktmandat holder is pre-selected in Step3Success,
    // so users on a confident-1-Wahlkreis flow can confirm with one click.
    // Letter generation + email send happen in selectPoliticianAction once
    // the user picks (or confirms the pre-selected) candidate.
    return { disambiguationNeeded: true, politicians };
  } catch (error) {
    const err = error as Error & { status?: number; code?: string; cause?: unknown };
    console.error("[submitWizard] FAILED", {
      name: err?.name,
      message: err?.message,
      status: err?.status,
      code: err?.code,
      cause: err?.cause,
      issueTextLength: data.issueText?.length ?? 0,
      plz: data.plz,
      stack: err?.stack,
    });
    return {
      error: "server_error",
      message:
        "Es ist ein Fehler aufgetreten. Bitte versuche es in einem Moment erneut.",
    };
  }
}
