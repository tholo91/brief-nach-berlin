"use server";

import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import { moderateText } from "@/lib/moderation/moderateText";
import { generateLetter } from "@/lib/generation/generateLetter";

export async function selectPoliticianAction(
  data: WizardData,
  selectedPoliticianId: number,
  politicians: Politician[]
): Promise<WizardActionResult> {
  try {
    const selectedPolitician = politicians.find(
      (p) => p.id === selectedPoliticianId
    );
    if (!selectedPolitician) {
      return { error: "server_error", message: "Politiker nicht gefunden." };
    }

    // Generate letter with only the selected politician in the list (D-09 disambiguation path)
    const result = await generateLetter({
      issueText: data.issueText,
      politicians: [selectedPolitician],
      name: data.name,
      party: data.party,
      ngo: data.ngo,
    });

    // Moderate output (SAFE-02, T-02-15)
    const outputModeration = await moderateText(result.letter);
    if (outputModeration.flagged) {
      return {
        error: "output_moderation_rejected",
        message:
          "Beim Erstellen deines Briefes ist ein Problem aufgetreten. Bitte formuliere dein Anliegen anders und versuche es erneut.",
      };
    }

    // Log for Phase 3 email pickup (D-14 resolution)
    console.log("[brief-nach-berlin] Letter generated (disambiguation):", {
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
    console.error("[brief-nach-berlin] selectPoliticianAction error:", error);
    return {
      error: "server_error",
      message:
        "Es ist ein Fehler aufgetreten. Bitte versuche es in einem Moment erneut.",
    };
  }
}
