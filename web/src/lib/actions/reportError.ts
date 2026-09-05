"use server";

import { z } from "zod";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";
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
  errorId: z.string().regex(/^[a-f0-9-]{1,64}$/i).nullable().default(null),
  // Strukturiertes und bereinigtes Server-Detail (name/message/stack/status)
  // aus der generate-letter-Route. Unbekannte Form, daher passthrough.
  detail: z.unknown().optional(),
  clientError: z.string().max(2000).nullable().default(null),
  consoleLogs: z.array(consoleEntrySchema).max(60).default([]),
  context: z.object({
    plz: z.string().max(10).nullable().default(null),
    email: z.string().trim().email().max(200).nullable().default(null),
    politicianId: z.number().int().nullable().default(null),
    retryCount: z.number().int().default(0),
  }),
  userAgent: z.string().max(500).nullable().default(null),
  pageUrl: z.string().max(500).nullable().default(null),
});

const mistralStageSchema = z.enum(["routing", "generation", "moderation"]);

export type ReportErrorResult = { success: boolean };

export async function reportErrorAction(
  input: unknown
): Promise<ReportErrorResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { success: false };

  const ipHash = hashIdentifier(await getClientIp());
  const limit = checkRateLimit(
    `report:ip:${ipHash}`,
    LIMITS.REPORT_ERROR_PER_IP.max,
    LIMITS.REPORT_ERROR_PER_IP.windowMs
  );
  if (!limit.allowed) return { success: false };

  try {
    const rawDetail = parsed.data.detail;
    const detailRecord = rawDetail && typeof rawDetail === "object"
      ? rawDetail as Record<string, unknown>
      : null;
    const detailName = typeof detailRecord?.name === "string" && /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(detailRecord.name)
      ? detailRecord.name
      : "GenerationError";
    const detailStatus = typeof detailRecord?.status === "number" && Number.isInteger(detailRecord.status)
      ? detailRecord.status
      : undefined;
    const detailStage = mistralStageSchema.safeParse(detailRecord?.stage);
    let safePageUrl: string | null = null;
    if (parsed.data.pageUrl) {
      try {
        const url = new URL(parsed.data.pageUrl);
        safePageUrl = `${url.origin}${url.pathname}`;
      } catch {
        safePageUrl = null;
      }
    }
    return await sendErrorReportEmail({
      ...parsed.data,
      serverMessage: parsed.data.httpStatus === null ? null : `HTTP ${parsed.data.httpStatus}`,
      clientError: parsed.data.clientError ? "Client- oder Netzwerkfehler" : null,
      consoleLogs: [],
      detail: {
        name: detailName,
        ...(detailStatus === undefined ? {} : { status: detailStatus }),
        ...(detailStage.success ? { stage: detailStage.data } : {}),
      },
      pageUrl: safePageUrl,
    });
  } catch (err) {
    console.error("[reportError] unexpected error:", err);
    return { success: false };
  }
}
