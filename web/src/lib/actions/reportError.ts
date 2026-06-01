"use server";

import { z } from "zod";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rateLimit";
import { sendErrorReportEmail } from "@/lib/email/sendErrorReportEmail";

// Server-Action für den "Fehler melden"-Button auf der Success-Page.
// Validiert den clientseitig gesammelten Kontext, throttlet per IP und
// versendet die selbst-enthaltende Report-Mail an Thomas. Gibt nie einen
// Fehler an den Client zurück - nur { success: boolean }.

const consoleEntrySchema = z.object({
  level: z.string().max(16),
  ts: z.string().max(40),
  msg: z.string().max(4000),
});

const reportSchema = z.object({
  httpStatus: z.number().int().nullable().default(null),
  serverMessage: z.string().max(2000).nullable().default(null),
  errorId: z.string().max(64).nullable().default(null),
  // Strukturiertes Server-Detail (name/message/stack/status/body) aus der
  // generate-letter-Route. Unbekannte Form, daher passthrough.
  detail: z.unknown().optional(),
  clientError: z.string().max(2000).nullable().default(null),
  consoleLogs: z.array(consoleEntrySchema).max(60).default([]),
  context: z.object({
    plz: z.string().max(10).nullable().default(null),
    email: z.string().max(200).nullable().default(null),
    issueText: z.string().max(8000).nullable().default(null),
    politicianId: z.number().int().nullable().default(null),
    retryCount: z.number().int().default(0),
  }),
  userAgent: z.string().max(500).nullable().default(null),
  pageUrl: z.string().max(500).nullable().default(null),
});

export type ReportErrorResult = { success: boolean };

export async function reportErrorAction(
  input: unknown
): Promise<ReportErrorResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { success: false };

  const ip = await getClientIp();
  const limit = checkRateLimit(
    `report:ip:${ip}`,
    LIMITS.REPORT_ERROR_PER_IP.max,
    LIMITS.REPORT_ERROR_PER_IP.windowMs
  );
  if (!limit.allowed) return { success: false };

  try {
    return await sendErrorReportEmail(parsed.data);
  } catch (err) {
    console.error("[reportError] unexpected error:", err);
    return { success: false };
  }
}
