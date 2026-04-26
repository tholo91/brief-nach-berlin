"use server";

import type { WizardData } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import { step1Schema, step1bSchema, step2Schema } from "@/lib/validation/wizardSchemas";
import { moderateText } from "@/lib/moderation/moderateText";
import { generateLetter } from "@/lib/generation/generateLetter";
import { sendLetterEmail } from "@/lib/email/sendLetterEmail";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";

export async function resendLetterAction(
  data: WizardData,
  politician: Politician
): Promise<{ success: true } | { error: string; message: string }> {
  try {
    console.log("[resendLetter] start", { email: "***", politicianId: politician.id });

    const s1 = step1Schema.safeParse(data);
    if (!s1.success) return { error: "validation", message: "Ungültige Eingabe." };

    const s1b = step1bSchema.safeParse(data);
    if (!s1b.success) {
      data.letterLength = DEFAULT_LETTER_LENGTH;
    }

    const s2 = step2Schema.safeParse({ issueText: data.issueText });
    if (!s2.success) return { error: "validation", message: "Anliegen fehlt." };

    const mod = await moderateText(data.issueText);
    if (mod.flagged) {
      return { error: "moderation", message: "Anliegen kann nicht verarbeitet werden." };
    }

    const result = await generateLetter({
      issueText: data.issueText,
      politicians: [politician],
      name: data.name,
      party: data.party,
      ngo: data.ngo,
      letterLength: data.letterLength,
    });

    const outMod = await moderateText(result.letter);
    if (outMod.flagged) {
      return { error: "moderation", message: "Brief konnte nicht erstellt werden." };
    }

    const emailResult = await sendLetterEmail({
      recipientEmail: data.email,
      politicianName: `${result.selectedPolitician.firstName} ${result.selectedPolitician.lastName}`,
      politicianFirstName: result.selectedPolitician.firstName,
      politicianLastName: result.selectedPolitician.lastName,
      politicianTitle: result.selectedPolitician.title,
      politicianPostalAddress: result.selectedPolitician.postalAddress,
      politicianAbgeordnetenwatchUrl: result.selectedPolitician.abgeordnetenwatchUrl,
      letterText: result.letter,
      issueText: data.issueText,
    });

    if (!emailResult.success) {
      console.error("[resendLetter] email send failed");
      return { error: "email", message: "E-Mail konnte nicht gesendet werden." };
    }

    console.log("[resendLetter] success", { messageId: emailResult.messageId });
    return { success: true };
  } catch (error) {
    console.error("[resendLetter] FAILED", error);
    return { error: "server_error", message: "Etwas ist schiefgelaufen." };
  }
}
