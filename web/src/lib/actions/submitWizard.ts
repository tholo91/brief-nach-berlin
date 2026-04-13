"use server";

import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import { step1Schema, step2Schema } from "@/lib/validation/wizardSchemas";
import { lookupPLZ } from "@/lib/lookup/plzLookup";
import { moderateText } from "@/lib/moderation/moderateText";
import { generateLetter } from "@/lib/generation/generateLetter";

export async function submitWizardAction(
  data: WizardData
): Promise<WizardActionResult> {
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
      return { error: "server_error", message: "Ungueltige Eingabe." };
    }

    const step2Result = step2Schema.safeParse({ issueText: data.issueText });
    if (!step2Result.success) {
      return {
        error: "server_error",
        message: "Bitte beschreibe dein Anliegen.",
      };
    }

    // 2. Moderate user input BEFORE any AI call (SAFE-01, T-02-10, D-15)
    const inputModeration = await moderateText(data.issueText);
    if (inputModeration.flagged) {
      return {
        error: "moderation_rejected",
        message:
          "Wir koennen dieses Anliegen nicht weiterverarbeiten. Bitte formuliere dein Anliegen sachlich und ohne beleidigende Formulierungen.",
      };
    }

    // 3. PLZ lookup using Phase 1 static data
    const { wahlkreisIds, politicians } = lookupPLZ(data.plz);
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
    const result = await generateLetter({
      issueText: data.issueText,
      politicians,
      name: data.name,
      party: data.party,
      ngo: data.ngo,
    });

    // 6. Moderate generated letter output (SAFE-02, T-02-15, D-15)
    const outputModeration = await moderateText(result.letter);
    if (outputModeration.flagged) {
      return {
        error: "output_moderation_rejected",
        message:
          "Beim Erstellen deines Briefes ist ein Problem aufgetreten. Bitte formuliere dein Anliegen anders und versuche es erneut.",
      };
    }

    // 7. Log generated letter for Phase 3 email pickup (D-14 resolution: no persistent storage per D-16)
    // Phase 3 will wire actual email delivery. For now, log the data server-side.
    console.log("[brief-nach-berlin] Letter generated:", {
      politician: `${result.selectedPolitician.firstName} ${result.selectedPolitician.lastName}`,
      level: result.politicalLevel,
      email: data.email,
      letterLength: result.letter.length,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      politician: result.selectedPolitician,
      politicalLevel: result.politicalLevel,
      letter: result.letter, // Preserved for Phase 3 email pickup (D-14 resolution)
    };
  } catch (error) {
    console.error("[brief-nach-berlin] submitWizardAction error:", error);
    return {
      error: "server_error",
      message:
        "Es ist ein Fehler aufgetreten. Bitte versuche es in einem Moment erneut.",
    };
  }
}
