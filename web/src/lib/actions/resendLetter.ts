"use server";

import type { WizardData } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import { step1Schema, step1bSchema, step2Schema } from "@/lib/validation/wizardSchemas";
import { moderateText } from "@/lib/moderation/moderateText";
import { generateLetter } from "@/lib/generation/generateLetter";
import { sendLetterEmail } from "@/lib/email/sendLetterEmail";
import { buildDebugPayload } from "@/lib/email/buildDebugPayload";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rateLimit";

const RESEND_LIMIT_MESSAGE =
  "Wir haben dir den Brief jetzt mehrfach gesendet. Bitte prüfe noch einmal deinen Spam-Ordner und die E-Mail-Adresse. Falls weiterhin nichts ankommt, melde dich gerne direkt bei uns.";

export async function resendLetterAction(
  data: WizardData,
  politician: Politician
): Promise<{ success: true } | { error: string; message: string; retryAfterSeconds?: number }> {
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

    // Rate limit BEFORE moderation/AI spend (matches submitWizard pattern)
    const ip = await getClientIp();
    const ipLimit = checkRateLimit(
      `resend:ip:${ip}`,
      LIMITS.RESEND_PER_IP.max,
      LIMITS.RESEND_PER_IP.windowMs
    );
    if (!ipLimit.allowed) {
      console.log("[resendLetter] rate limited by ip", { retryAfterSeconds: ipLimit.retryAfterSeconds });
      return { error: "rate_limited", message: RESEND_LIMIT_MESSAGE, retryAfterSeconds: ipLimit.retryAfterSeconds };
    }
    const emailLimit = checkRateLimit(
      `resend:email:${data.email.toLowerCase()}`,
      LIMITS.RESEND_PER_EMAIL.max,
      LIMITS.RESEND_PER_EMAIL.windowMs
    );
    if (!emailLimit.allowed) {
      console.log("[resendLetter] rate limited by email", { retryAfterSeconds: emailLimit.retryAfterSeconds });
      return { error: "rate_limited", message: RESEND_LIMIT_MESSAGE, retryAfterSeconds: emailLimit.retryAfterSeconds };
    }

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
      toneLevel: data.toneLevel,
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
      debug: buildDebugPayload(data, result, 1),
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
