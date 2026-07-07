"use server";

import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { RecipientSelection } from "@/lib/lookup/rathausRecipient";
import { step1Schema, step1bSchema, step2Schema } from "@/lib/validation/wizardSchemas";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";

// SECURITY NOTE (2026-04-17, erweitert 2026-07-07 für 999.6):
// Der Client liefert nie Politician-Objekte, sondern nur eine diskriminierte
// Auswahl (kind + optional numerische ID). Der Server leitet den Empfänger
// komplett aus der PLZ ab:
// - mdb/mdl: die ID muss in der PLZ-abgeleiteten Liste der Ebene stehen.
// - rathaus: es gibt keine ID; der Verwaltungs-Empfänger wird zu 100% aus
//   der PLZ gebaut (LOCK-5). Client-Daten können die Adresse nicht beeinflussen.
// Legacy-Aufrufe mit nackter Zahl werden als Bund-Auswahl (mdb) behandelt.
export async function selectPoliticianAction(
  data: WizardData,
  selection: RecipientSelection | number
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

    const normalizedSelection: RecipientSelection =
      typeof selection === "number" ? { kind: "mdb", selectedPoliticianId: selection } : selection;

    if (
      normalizedSelection.kind !== "rathaus" &&
      typeof normalizedSelection.selectedPoliticianId !== "number"
    ) {
      return { error: "server_error", message: "Ungültige Eingabe." };
    }

    const resolved = resolveRecipientSelection(data.plz, normalizedSelection);
    if (!resolved.ok) {
      console.warn("[selectPolitician] selection not resolvable", {
        plz: data.plz,
        kind: normalizedSelection.kind,
        reason: resolved.reason,
      });
      return { error: "server_error", message: "Empfänger nicht gefunden." };
    }

    // Pre-checks passed — letter generation happens async via /api/generate-letter
    // on the Success-Page, so we return immediately without blocking the user.
    return {
      preCheckOk: true,
      recipient: resolved.recipient,
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
