"use server";

import { z } from "zod";
import type { WizardData } from "@/lib/types/wizard";
import type { RecipientSelection } from "@/lib/lookup/rathausRecipient";
import {
  firstZodIssueMessage,
  step1Schema,
  step1bSchema,
  step2Schema,
} from "@/lib/validation/wizardSchemas";
import { moderateText } from "@/lib/moderation/moderateText";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { sendLetterEmail, prepareLetterEmail } from "@/lib/email/sendLetterEmail";
import { buildResendDebugPayload } from "@/lib/email/buildDebugPayload";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";
import { doesGenerationProofMatch, verifyGenerationProof } from "@/lib/letterSignals/token";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";
import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";

const RESEND_LIMIT_MESSAGE =
  "Der Brief wurde jetzt mehrfach gesendet. Bitte prüfe noch einmal deinen Spam-Ordner und die E-Mail-Adresse. Falls weiterhin nichts ankommt, melde dich gerne direkt.";

const recipientSelectionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("mdb"), selectedPoliticianId: z.number().int() }),
  z.object({ kind: z.literal("mdl"), selectedPoliticianId: z.number().int() }).strict(),
  z.object({ kind: z.literal("landesregierung") }).strict(),
  z.object({ kind: z.literal("rathaus") }).strict(),
]);
const generationProofSchema = z.string().min(20).max(4096).optional();

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
  selection: RecipientSelection | number,
  cachedLetterText: string,
  generationProof?: string,
): Promise<{ success: true } | { error: string; message: string; retryAfterSeconds?: number }> {
  try {
    const rawSelection: unknown =
      typeof selection === "number" ? { kind: "mdb", selectedPoliticianId: selection } : selection;
    const parsedSelection = recipientSelectionSchema.safeParse(rawSelection);
    if (!parsedSelection.success) {
      return { error: "validation", message: "Ungültige Eingabe." };
    }
    const normalizedSelection: RecipientSelection = parsedSelection.data;
    const parsedProof = generationProofSchema.safeParse(generationProof);
    if (!parsedProof.success) {
      return { error: "validation", message: "Ungültige Eingabe." };
    }
    const verifiedProof = parsedProof.data ? verifyGenerationProof(parsedProof.data) : null;
    const letterId = verifiedProof?.letterId;
    if (parsedProof.data && !verifiedProof) return { error: "validation", message: "Ungültige Eingabe." };
    console.log("[resendLetter] start", { email: "***", kind: normalizedSelection.kind });

    const s1 = step1Schema.safeParse(data);
    if (!s1.success) return { error: "validation", message: "Ungültige Eingabe." };

    const s1b = step1bSchema.safeParse(data);
    if (!s1b.success) {
      data.letterLength = DEFAULT_LETTER_LENGTH;
    }

    const s2 = step2Schema.safeParse({ issueText: data.issueText });
    if (!s2.success) {
      return {
        error: "validation",
        message: firstZodIssueMessage(s2.error, "Anliegen fehlt."),
      };
    }

    if (!cachedLetterText || typeof cachedLetterText !== "string" || !cachedLetterText.trim()) {
      return { error: "validation", message: "Ungültige Eingabe." };
    }

    const campaign = data.campaign?.slug
      ? await getActiveCampaignBySlug(data.campaign.slug)
      : null;
    if (data.campaign?.slug && !campaign) {
      return { error: "validation", message: "Diese Kampagne ist aktuell nicht aktiv." };
    }
    const allowedPoliticianIds = campaign?.targetPoliticianIds ?? [];
    if (allowedPoliticianIds.length > 0 && normalizedSelection.kind !== "mdb") {
      return { error: "validation", message: "Empfänger nicht gefunden." };
    }

    // Rate limit BEFORE moderation spend (matches submitWizard pattern).
    // IP and email are salted-hashed before use as bucket keys (DSGVO M7).
    const ipHash = hashIdentifier(await getClientIp());
    const ipLimit = checkRateLimit(
      `resend:ip:${ipHash}`,
      LIMITS.RESEND_PER_IP.max,
      LIMITS.RESEND_PER_IP.windowMs
    );
    if (!ipLimit.allowed) {
      console.log("[resendLetter] rate limited by ip", { retryAfterSeconds: ipLimit.retryAfterSeconds });
      return { error: "rate_limited", message: RESEND_LIMIT_MESSAGE, retryAfterSeconds: ipLimit.retryAfterSeconds };
    }
    const emailLimit = checkRateLimit(
      `resend:email:${hashIdentifier(data.email.toLowerCase())}`,
      LIMITS.RESEND_PER_EMAIL.max,
      LIMITS.RESEND_PER_EMAIL.windowMs
    );
    if (!emailLimit.allowed) {
      console.log("[resendLetter] rate limited by email", { retryAfterSeconds: emailLimit.retryAfterSeconds });
      return { error: "rate_limited", message: RESEND_LIMIT_MESSAGE, retryAfterSeconds: emailLimit.retryAfterSeconds };
    }

    // Re-derive recipient server-side — never trust client-supplied recipient
    // data. mdb/mdl: ID muss in der PLZ-abgeleiteten Ebenen-Liste stehen;
    // rathaus/landesregierung werden komplett aus der PLZ gebaut (LOCK-5).
    const resolved = allowedPoliticianIds.length > 0
      ? resolveRecipientSelection(data.plz, normalizedSelection, { allowedPoliticianIds })
      : resolveRecipientSelection(data.plz, normalizedSelection);
    if (!resolved.ok) {
      console.warn("[resendLetter] selection not resolvable", {
        plz: data.plz,
        kind: normalizedSelection.kind,
        reason: resolved.reason,
      });
      return { error: "validation", message: "Ungültige Eingabe." };
    }
    const recipient = resolved.recipient;
    if (verifiedProof && !doesGenerationProofMatch(verifiedProof, {
      issueText: data.issueText,
      plz: data.plz,
      recipient,
      letterText: cachedLetterText,
      campaignSlug: campaign?.slug ?? null,
    })) {
      return { error: "validation", message: "Ungültige Eingabe." };
    }

    // Moderate the cached letter text before re-sending (defense-in-depth)
    const outMod = await moderateText(cachedLetterText);
    if (outMod.flagged) {
      return { error: "moderation", message: "Brief kann nicht gesendet werden." };
    }

    // Resend bekommt dieselbe Mail wie der Erstversand: Debug-Link im Footer +
    // 5-Sterne-Leiste statt des statischen "Profil auf abgeordnetenwatch"-Buttons.
    // Beim Resend gibt es keinen Generierungslauf, daher eine Teil-Payload mit
    // resent: true (generierungs-spezifische Felder sind Platzhalter).
    const debugPayload = buildResendDebugPayload(
      data,
      recipient,
      resolved.availableCount,
      cachedLetterText,
      letterId,
    );
    const { params } = prepareLetterEmail({
      locale: data.locale ?? "de",
      recipientEmail: data.email,
      recipient,
      letterText: cachedLetterText,
      issueText: data.issueText,
      debug: debugPayload,
      campaign: data.campaign,
      letterId,
    });

    const emailResult = await sendLetterEmail(params);

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
