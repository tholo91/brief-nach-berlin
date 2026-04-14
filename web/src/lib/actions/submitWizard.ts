"use server";

import { after } from "next/server";
import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import { step1Schema, step2Schema } from "@/lib/validation/wizardSchemas";
import { lookupPLZ } from "@/lib/lookup/plzLookup";
import { moderateText } from "@/lib/moderation/moderateText";
import { generateLetter } from "@/lib/generation/generateLetter";
import { sendLetterEmail } from "@/lib/email/sendLetterEmail";

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
  });

  try {
    // 1. Validate input server-side with Zod (T-02-09)
    const step1Result = step1Schema.safeParse({
      plz: data.plz,
      email: data.email,
      name: data.name,
      party: data.party,
      ngo: data.ngo,
    });
    if (!step1Result.success) {
      console.warn("[submitWizard] step1 validation failed", step1Result.error.flatten());
      return { error: "server_error", message: "Ungueltige Eingabe." };
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

    // 2. Moderate user input BEFORE any AI call (SAFE-01, T-02-10, D-15)
    const inputModeration = await moderateText(data.issueText);
    log("input moderation", { flagged: inputModeration.flagged });
    if (inputModeration.flagged) {
      return {
        error: "moderation_rejected",
        message:
          "Wir koennen dieses Anliegen nicht weiterverarbeiten. Bitte formuliere dein Anliegen sachlich und ohne beleidigende Formulierungen.",
      };
    }

    // 3. PLZ lookup using Phase 1 static data
    const { wahlkreisIds, politicians } = lookupPLZ(data.plz);
    log("plz lookup", { wahlkreisCount: wahlkreisIds.length, politicianCount: politicians.length });
    if (wahlkreisIds.length === 0 || politicians.length === 0) {
      return {
        error: "plz_not_found",
        message:
          "Fuer diese Postleitzahl haben wir keine Daten. Bitte pruefe deine Eingabe.",
      };
    }

    // 4. D-09: Multiple Wahlkreise → return politician list for disambiguation
    if (wahlkreisIds.length > 1) {
      return { disambiguationNeeded: true, politicians };
    }

    // 5. Single Wahlkreis (D-10) → generate letter immediately
    log("generating letter");
    const result = await generateLetter({
      issueText: data.issueText,
      politicians,
      name: data.name,
      party: data.party,
      ngo: data.ngo,
    });
    log("letter generated", { letterLength: result.letter.length });

    // 6. Moderate generated letter output (SAFE-02, T-02-15, D-15)
    const outputModeration = await moderateText(result.letter);
    log("output moderation", { flagged: outputModeration.flagged });
    if (outputModeration.flagged) {
      return {
        error: "output_moderation_rejected",
        message:
          "Beim Erstellen deines Briefes ist ein Problem aufgetreten. Bitte formuliere dein Anliegen anders und versuche es erneut.",
      };
    }

    // 7. Send letter by email (fire-and-forget, D-03)
    after(async () => {
      await sendLetterEmail({
        recipientEmail: data.email,
        politicianName: `${result.selectedPolitician.firstName} ${result.selectedPolitician.lastName}`,
        politicianTitle: result.selectedPolitician.title,
        politicianPostalAddress: result.selectedPolitician.postalAddress,
        letterText: result.letter,
        issueText: data.issueText,
      });
    });

    return {
      success: true,
      politician: result.selectedPolitician,
      politicalLevel: result.politicalLevel,
      // letter field removed — sent by email only (D-03, PRIV-01)
    };
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
