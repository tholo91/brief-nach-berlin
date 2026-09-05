"use server";

import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { RecipientSelection } from "@/lib/lookup/rathausRecipient";
import {
  firstZodIssueMessage,
  step1Schema,
  step1bSchema,
  step2Schema,
} from "@/lib/validation/wizardSchemas";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";
import { deriveRoutingLetterId, verifyRoutingTokenEnvelope } from "@/lib/lookup/routingToken";
import { buildLetterSignalContext } from "@/lib/letterSignals/context";

const recipientSelectionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("mdb"), selectedPoliticianId: z.number().int() }),
  z.object({ kind: z.literal("mdl"), selectedPoliticianId: z.number().int() }).strict(),
  z.object({ kind: z.literal("landesregierung") }).strict(),
  z.object({ kind: z.literal("rathaus") }).strict(),
]);

// SECURITY NOTE (2026-04-17, erweitert 2026-07-07 für 999.6):
// Der Client liefert nie Politician-Objekte, sondern nur eine diskriminierte
// Auswahl (kind + optional numerische ID). Der Server leitet den Empfänger
// komplett aus der PLZ ab:
// - mdb/mdl: die ID muss in der PLZ-abgeleiteten Liste der Ebene stehen.
// - rathaus/landesregierung: es gibt keine ID; der institutionelle Empfänger
//   wird zu 100% aus der PLZ gebaut (LOCK-5). Client-Daten können die Adresse
//   nicht beeinflussen.
// Legacy-Aufrufe mit nackter Zahl werden als Bund-Auswahl (mdb) behandelt.
export async function selectPoliticianAction(
  data: WizardData,
  selection: RecipientSelection | number,
  routingToken?: string | null,
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
      return {
        error: "server_error",
        message: firstZodIssueMessage(
          step2Result.error,
          "Bitte beschreibe dein Anliegen.",
        ),
      };
    }

    const rawSelection: unknown =
      typeof selection === "number" ? { kind: "mdb", selectedPoliticianId: selection } : selection;
    const parsedSelection = recipientSelectionSchema.safeParse(rawSelection);
    if (!parsedSelection.success) {
      return { error: "server_error", message: "Ungültige Eingabe." };
    }
    const normalizedSelection: RecipientSelection = parsedSelection.data;
    const campaign = data.campaign?.slug
      ? await getActiveCampaignBySlug(data.campaign.slug)
      : null;
    if (data.campaign?.slug && !campaign) {
      return {
        error: "server_error",
        message: "Diese Kampagne ist aktuell nicht aktiv.",
      };
    }
    const allowedPoliticianIds = campaign?.targetPoliticianIds ?? [];
    if (allowedPoliticianIds.length > 0 && normalizedSelection.kind !== "mdb") {
      return { error: "server_error", message: "Empfänger nicht gefunden." };
    }

    const resolved = allowedPoliticianIds.length > 0
      ? resolveRecipientSelection(data.plz, normalizedSelection, { allowedPoliticianIds })
      : resolveRecipientSelection(data.plz, normalizedSelection);
    if (!resolved.ok) {
      console.warn("[selectPolitician] selection not resolvable", {
        plz: data.plz,
        kind: normalizedSelection.kind,
        reason: resolved.reason,
      });
      return { error: "server_error", message: "Empfänger nicht gefunden." };
    }

    const routingEnvelope = routingToken
      ? verifyRoutingTokenEnvelope(routingToken, data.issueText)
      : null;
    const letterId = routingEnvelope
      ? deriveRoutingLetterId(
          routingEnvelope.letterId,
          JSON.stringify({
            plz: data.plz,
            email: data.email.trim().toLowerCase(),
            selection: normalizedSelection,
            campaignSlug: campaign?.slug ?? null,
          }),
        )
      : randomUUID();
    const signal = buildLetterSignalContext({
      data,
      recipient: resolved.recipient,
      letterId,
      topic: routingEnvelope?.routing.topic,
      campaignSlug: campaign?.slug ?? null,
    });

    // Pre-checks passed — letter generation happens async via /api/generate-letter
    // on the Success-Page, so we return immediately without blocking the user.
    return {
      preCheckOk: true,
      recipient: resolved.recipient,
      letterId,
      letterSignalContext: signal?.token ?? null,
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
