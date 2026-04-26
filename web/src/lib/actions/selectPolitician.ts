"use server";

import { after } from "next/server";
import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import { step1Schema, step1bSchema, step2Schema } from "@/lib/validation/wizardSchemas";
import { lookupPLZ } from "@/lib/lookup/plzLookup";
import { moderateText } from "@/lib/moderation/moderateText";
import { generateLetter } from "@/lib/generation/generateLetter";
import { sendLetterEmail } from "@/lib/email/sendLetterEmail";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rateLimit";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";

const RATE_LIMIT_MESSAGE =
  "Du hast in kurzer Zeit viele Briefe erstellt. Bitte versuche es später erneut.";

// SECURITY NOTE (2026-04-17):
// The previous signature accepted `politicians: Politician[]` directly from the
// client. A modified client could inject arbitrary politician objects (fake
// names, fake postal addresses, wrong Wahlkreise) and the server would happily
// send a letter to whatever address was supplied.
// Fix: the server re-derives the politician list from `data.plz` via the
// authoritative `lookupPLZ` helper, then verifies that `selectedPoliticianId`
// belongs to that derived list. Nothing politician-shaped that reaches this
// action from the client is trusted beyond the numeric ID.
export async function selectPoliticianAction(
  data: WizardData,
  selectedPoliticianId: number
): Promise<WizardActionResult> {
  try {
    // Re-validate user-supplied input (WR-02: prevent bypassing initial validation)
    const step1Result = step1Schema.safeParse(data);
    if (!step1Result.success) {
      return { error: "server_error", message: "Ungültige Eingabe." };
    }

    const step1bResult = step1bSchema.safeParse(data);
    if (!step1bResult.success) {
      data.letterLength = DEFAULT_LETTER_LENGTH;
    }

    const step2Result = step2Schema.safeParse({ issueText: data.issueText });
    if (!step2Result.success) {
      return { error: "server_error", message: "Bitte beschreibe dein Anliegen." };
    }

    // Rate limit check (IP + email) — shares buckets with submitWizardAction,
    // so disambiguation doesn't let users bypass the overall letter cap.
    const ip = await getClientIp();
    const ipLimit = checkRateLimit(`letter:ip:${ip}`, LIMITS.LETTERS_PER_IP.max, LIMITS.LETTERS_PER_IP.windowMs);
    if (!ipLimit.allowed) {
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
      return {
        error: "rate_limited",
        message: RATE_LIMIT_MESSAGE,
        retryAfterSeconds: emailLimit.retryAfterSeconds,
      };
    }

    // Re-moderate user input before AI call (WR-02: prevent bypassing initial moderation)
    const inputModeration = await moderateText(data.issueText);
    if (inputModeration.flagged) {
      return {
        error: "moderation_rejected",
        message:
          "Wir können dieses Anliegen nicht weiterverarbeiten. Bitte formuliere dein Anliegen sachlich.",
      };
    }

    // Re-derive politicians server-side from PLZ — never trust a client-sent
    // politician list. The selectedPoliticianId MUST be in the derived list,
    // otherwise someone is tampering with the request.
    const { politicians: derivedPoliticians } = lookupPLZ(data.plz);
    if (derivedPoliticians.length === 0) {
      return {
        error: "plz_not_found",
        message:
          "Für diese Postleitzahl haben wir derzeit keinen direkt gewählten Wahlkreisabgeordneten in unseren Daten. Bitte prüfe deine Eingabe.",
      };
    }
    const selectedPolitician = derivedPoliticians.find(
      (p) => p.id === selectedPoliticianId
    );
    if (!selectedPolitician) {
      // Either stale client state (rare) or tampering (likely) — refuse rather
      // than silently falling back, so the user is forced to re-pick from the
      // authoritative server-rendered list.
      console.warn("[selectPolitician] id not in derived list", {
        plz: data.plz,
        selectedPoliticianId,
        derivedIds: derivedPoliticians.map((p) => p.id),
      });
      return { error: "server_error", message: "Politiker nicht gefunden." };
    }

    // Generate letter with only the selected politician in the list (D-09 disambiguation path)
    const result = await generateLetter({
      issueText: data.issueText,
      politicians: [selectedPolitician],
      name: data.name,
      party: data.party,
      ngo: data.ngo,
      letterLength: data.letterLength,
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
        politicianFirstName: result.selectedPolitician.firstName,
        politicianLastName: result.selectedPolitician.lastName,
        politicianTitle: result.selectedPolitician.title,
        politicianPostalAddress: result.selectedPolitician.postalAddress,
        politicianAbgeordnetenwatchUrl: result.selectedPolitician.abgeordnetenwatchUrl,
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
