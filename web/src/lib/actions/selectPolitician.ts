"use server";

import { after } from "next/server";
import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import { moderateText } from "@/lib/moderation/moderateText";
import { generateLetter } from "@/lib/generation/generateLetter";
import { sendLetterEmail } from "@/lib/email/sendLetterEmail";

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

    // Phase 3: Send letter by email (fire-and-forget, D-04 disambiguation path)
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
    console.error("[brief-nach-berlin] selectPoliticianAction error:", error);
    return {
      error: "server_error",
      message:
        "Es ist ein Fehler aufgetreten. Bitte versuche es in einem Moment erneut.",
    };
  }
}
