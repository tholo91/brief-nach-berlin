"use server";

import { createHmac } from "node:crypto";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, hashIdentifier } from "@/lib/rateLimit";
import { outcomeAnswersSchema, OUTCOME_ENTRY_CHOICES, type OutcomeAnswers } from "@/lib/rueckmeldung/schema";
import { RUECKMELDUNG_COHORT, verifyRueckmeldungToken } from "@/lib/rueckmeldung/token";

const inputSchema = z.object({
  mode: z.enum(["initial", "progress", "full"]),
  token: z.string().min(20).max(4096),
  entryChoice: z.enum(OUTCOME_ENTRY_CHOICES),
  answers: outcomeAnswersSchema.optional(),
  processingConsent: z.boolean().optional().default(false),
  lastStep: z.string().trim().max(60).default("entry"),
  body: z.string().max(3000).optional(),
  consent: z.boolean().optional(),
  displayName: z.string().max(80).optional(),
  callOk: z.boolean().optional(),
});

export type SubmitOutcomeResult =
  | { success: true }
  | { error: "invalid_token" | "validation" | "rate_limited" | "server_error"; message: string; retryAfterSeconds?: number };

function validateFull(answers: OutcomeAnswers): string | null {
  if (!answers.issueScope || !answers.expectation || !answers.politicalSelfEfficacy || !answers.writeAgain) {
    return "Bitte beantworte noch die offenen Fragen.";
  }
  if (!answers.letterSent) return "Bitte beantworte noch, ob du den Brief abgeschickt hast.";
  if (answers.letterSent === "not_sent") {
    if (!answers.notSentReason) return "Bitte sag uns noch, was dich gebremst hat.";
    if (answers.replyChannels.length || answers.replyAddressed || answers.replyFeeling) return "Ungültige Antworten zum Brief.";
  } else {
    if (answers.notSentReason) return "Ungültige Antwort zum Versand.";
    if (answers.replyChannels.length === 0) return "Bitte wähle noch aus, ob eine Reaktion kam.";
    const noneSelected = answers.replyChannels.includes("none");
    if (noneSelected && answers.replyChannels.length !== 1) return "Bitte wähle entweder „Noch nichts“ oder eine Reaktion.";
    const hadReply = !noneSelected;
    if (hadReply !== Boolean(answers.replyAddressed)) return "Bitte beantworte noch, ob auf dein Anliegen eingegangen wurde.";
    if (hadReply && !answers.replyFeeling) return "Bitte beantworte noch, wie die Reaktion für dich war.";
    if (!hadReply && answers.replyFeeling) return "Ungültige Antwort zur Reaktion.";
  }
  return null;
}

export async function submitOutcomeAction(input: unknown): Promise<SubmitOutcomeResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { error: "validation", message: "Ungültige Eingabe." };
  const data = parsed.data;
  const token = verifyRueckmeldungToken(data.token);
  if (!token || token.cohort !== RUECKMELDUNG_COHORT) {
    return { error: "invalid_token", message: "Dieser Rückmelde-Link ist ungültig oder abgelaufen." };
  }
  const answers = data.answers ?? outcomeAnswersSchema.parse({});
  if (answers.replyChannels.includes("none") && answers.replyChannels.length > 1) {
    return { error: "validation", message: "Bitte wähle entweder „Noch nichts“ oder eine Reaktion." };
  }
  if (data.mode !== "initial" && !data.processingConsent) {
    return { error: "validation", message: "Bitte stimme der Verarbeitung deiner Antworten zu, bevor du fortfährst." };
  }
  if (data.mode === "full") {
    const problem = validateFull(answers);
    if (problem) return { error: "validation", message: problem };
    if (data.consent === undefined || data.callOk === undefined) return { error: "validation", message: "Bitte prüfe noch deine Freigabe für eine Veröffentlichung." };
  }

  let ip: string;
  try { ip = await getClientIp(); } catch { ip = "unknown"; }
  const perHour = data.mode === "progress" ? 120 : data.mode === "initial" ? 5 : 10;
  const limit = checkRateLimit(`outcome:${data.mode}:ip:${hashIdentifier(ip)}`, perHour, 60 * 60_000);
  if (!limit.allowed) return { error: "rate_limited", message: "Du hast gerade sehr viele Antworten gespeichert. Bitte versuche es später noch einmal.", retryAfterSeconds: limit.retryAfterSeconds };
  const salt = process.env.REVIEW_IP_SALT;
  if (!salt) {
    console.error("[submitOutcome] REVIEW_IP_SALT not set; refusing to store an unsalted IP");
    return { error: "server_error", message: "Rückmeldungen sind gerade nicht verfügbar. Bitte später erneut versuchen." };
  }
  const noReply = answers.letterSent === "not_sent" || answers.replyChannels.length === 0 || answers.replyChannels.includes("none");
  const ipHash = createHmac("sha256", salt).update(ip).digest("hex");
  try {
    const { error } = await getServiceRoleClient().rpc("submit_letter_outcome", {
      p_mode: data.mode,
      p_email: token.email,
      p_cohort: token.cohort,
      p_entry_choice: data.entryChoice,
      p_answers: data.mode === "initial" ? {} : {
        ...answers,
        notSentReason: answers.letterSent === "not_sent" ? answers.notSentReason : null,
        replyChannels: answers.letterSent === "not_sent" ? [] : answers.replyChannels,
        replyAddressed: answers.letterSent === "not_sent" ? null : answers.replyAddressed,
        replyFeeling: noReply ? null : answers.replyFeeling,
      },
      p_processing_consent: data.mode !== "initial" && data.processingConsent,
      p_last_step: data.lastStep,
      p_body: data.mode === "full" ? (data.body?.trim() || null) : null,
      p_consent: data.mode === "full" ? data.consent : null,
      p_display_name: data.mode === "full" && data.consent ? (data.displayName?.trim() || null) : null,
      p_call_ok: data.mode === "full" ? data.callOk : null,
      p_ip_hash: ipHash,
    });
    if (error) {
      console.error("[submitOutcome] database write failed");
      return { error: "server_error", message: "Deine Rückmeldung konnte nicht gespeichert werden." };
    }
    return { success: true };
  } catch {
    console.error("[submitOutcome] unexpected database error");
    return { error: "server_error", message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }
}
