"use server";

import type { WizardData } from "@/lib/types/wizard";
import { step1Schema, step1bSchema, step2Schema } from "@/lib/validation/wizardSchemas";
import { moderateText } from "@/lib/moderation/moderateText";
import { lookupPLZ } from "@/lib/lookup/plzLookup";
import { sendLetterEmail } from "@/lib/email/sendLetterEmail";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rateLimit";

const RESEND_LIMIT_MESSAGE =
  "Wir haben dir den Brief jetzt mehrfach gesendet. Bitte prüfe noch einmal deinen Spam-Ordner und die E-Mail-Adresse. Falls weiterhin nichts ankommt, melde dich gerne direkt bei uns.";

// SECURITY NOTE (2026-04-27):
// Previous signature accepted a full Politician object from the client, which
// could be tampered to inject arbitrary postal/profile data into outbound emails.
// Fix: accept only a numeric ID + PLZ (already in WizardData); re-derive the
// politician server-side from the authoritative static lookup. Nothing
// politician-shaped from the client is used beyond the numeric ID.
//
// Letter text is now cached on the client from the initial generation and passed
// back here, avoiding a redundant Mistral API call on each resend. The cached
// text is re-moderated before sending as a defense-in-depth measure.
export async function resendLetterAction(
  data: WizardData,
  selectedPoliticianId: number,
  cachedLetterText: string
): Promise<{ success: true } | { error: string; message: string; retryAfterSeconds?: number }> {
  try {
    console.log("[resendLetter] start", { email: "***", politicianId: selectedPoliticianId });

    const s1 = step1Schema.safeParse(data);
    if (!s1.success) return { error: "validation", message: "Ungültige Eingabe." };

    const s1b = step1bSchema.safeParse(data);
    if (!s1b.success) {
      data.letterLength = DEFAULT_LETTER_LENGTH;
    }

    const s2 = step2Schema.safeParse({ issueText: data.issueText });
    if (!s2.success) return { error: "validation", message: "Anliegen fehlt." };

    if (!cachedLetterText || typeof cachedLetterText !== "string" || !cachedLetterText.trim()) {
      return { error: "validation", message: "Ungültige Eingabe." };
    }

    // Rate limit BEFORE moderation spend (matches submitWizard pattern)
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

    // Re-derive politician server-side — never trust a client-supplied politician
    // object. The selectedPoliticianId MUST be in the PLZ-derived list, otherwise
    // the request is tampered or stale.
    const { politicians: derivedPoliticians } = lookupPLZ(data.plz);
    if (derivedPoliticians.length === 0) {
      return { error: "validation", message: "Ungültige Eingabe." };
    }
    const politician = derivedPoliticians.find((p) => p.id === selectedPoliticianId);
    if (!politician) {
      console.warn("[resendLetter] id not in derived list", {
        plz: data.plz,
        selectedPoliticianId,
        derivedIds: derivedPoliticians.map((p) => p.id),
      });
      return { error: "validation", message: "Ungültige Eingabe." };
    }

    // Moderate the cached letter text before re-sending (defense-in-depth)
    const outMod = await moderateText(cachedLetterText);
    if (outMod.flagged) {
      return { error: "moderation", message: "Brief kann nicht gesendet werden." };
    }

    const emailResult = await sendLetterEmail({
      recipientEmail: data.email,
      politicianName: `${politician.firstName} ${politician.lastName}`,
      politicianFirstName: politician.firstName,
      politicianLastName: politician.lastName,
      politicianTitle: politician.title,
      politicianPostalAddress: politician.postalAddress,
      politicianAbgeordnetenwatchUrl: politician.abgeordnetenwatchUrl,
      letterText: cachedLetterText,
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
