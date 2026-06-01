import { BrevoClient } from "@getbrevo/brevo";
import { CONTACT } from "@/lib/contact";

// Selbst-enthaltende Fehler-Report-Mail an Thomas (Frühwarnsystem).
// Bewusst KEIN Vercel-Abruf: Free/Hobby-Logs verfallen nach ~1h und sind aus
// App-Code nicht erreichbar. Stattdessen trägt diese Mail den vollen Kontext:
// echte Server-Fehlermeldung + Stack + Mistral-Status/Body (aus dem detail-Feld
// der generate-letter-Route), HTTP-Status, Client-Console-Logs und den
// User-Kontext inkl. Eingabetext. Geht NUR an CONTACT.email.
//
// apiKey-Guard ist hier weich (return success:false statt throw): Das
// Fehler-Melde-Feature darf selbst nicht crashen, wenn der Key fehlt.
const apiKey = process.env.BREVO_API_KEY;
const brevo = apiKey ? new BrevoClient({ apiKey }) : null;

export interface ErrorReportInput {
  httpStatus: number | null;
  serverMessage: string | null;
  errorId: string | null;
  detail?: unknown;
  clientError: string | null;
  consoleLogs: { level: string; ts: string; msg: string }[];
  context: {
    plz: string | null;
    email: string | null;
    issueText: string | null;
    politicianId: number | null;
    retryCount: number;
  };
  userAgent: string | null;
  pageUrl: string | null;
}

function esc(value: unknown): string {
  const s = typeof value === "string" ? value : String(value ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stringifyDetail(detail: unknown): string {
  if (detail == null) return "(kein Server-Detail - Fehler stammt evtl. vom Client oder einer Nicht-500-Antwort)";
  if (typeof detail === "string") return detail;
  try {
    return JSON.stringify(detail, null, 2);
  } catch {
    return String(detail);
  }
}

function buildHtml(input: ErrorReportInput): string {
  const { context } = input;
  const consoleBlock = input.consoleLogs.length
    ? input.consoleLogs
        .map((e) => `[${esc(e.ts)}] ${esc(e.level.toUpperCase())}: ${esc(e.msg)}`)
        .join("\n")
    : "(keine Client-Console-Einträge)";

  const row = (label: string, value: unknown) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;white-space:nowrap;">${esc(label)}</td><td style="padding:4px 0;"><strong>${esc(value)}</strong></td></tr>`;

  return `<!DOCTYPE html>
<html lang="de"><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;line-height:1.5;max-width:680px;">
  <h2 style="margin:0 0 4px;">Fehler-Report: Brief nach Berlin</h2>
  <p style="margin:0 0 16px;color:#666;">Ein User hat auf der Success-Page "Fehler melden" geklickt.</p>

  <table style="border-collapse:collapse;font-size:14px;margin-bottom:20px;">
    ${row("HTTP-Status", input.httpStatus ?? "kein (Client-/Netzwerkfehler)")}
    ${row("Error-ID", input.errorId ?? "-")}
    ${row("User-Meldung", input.serverMessage ?? "-")}
    ${row("Client-Fehler", input.clientError ?? "-")}
    ${row("PLZ", context.plz ?? "-")}
    ${row("E-Mail (User)", context.email ?? "-")}
    ${row("Politiker-ID", context.politicianId ?? "-")}
    ${row("Versuche (retry)", context.retryCount)}
    ${row("Seite", input.pageUrl ?? "-")}
    ${row("Browser", input.userAgent ?? "-")}
  </table>

  <h3 style="margin:0 0 6px;">Server-Fehler (detail)</h3>
  <pre style="background:#f5f5f5;padding:12px;border-radius:6px;overflow:auto;font-size:12px;white-space:pre-wrap;">${esc(stringifyDetail(input.detail))}</pre>

  <h3 style="margin:16px 0 6px;">Anliegen-Text des Users</h3>
  <pre style="background:#f5f5f5;padding:12px;border-radius:6px;overflow:auto;font-size:12px;white-space:pre-wrap;">${esc(context.issueText ?? "(leer)")}</pre>

  <h3 style="margin:16px 0 6px;">Client-Console (letzte Einträge)</h3>
  <pre style="background:#f5f5f5;padding:12px;border-radius:6px;overflow:auto;font-size:12px;white-space:pre-wrap;">${esc(consoleBlock)}</pre>
</body></html>`;
}

export async function sendErrorReportEmail(
  input: ErrorReportInput
): Promise<{ success: boolean }> {
  if (!brevo) {
    console.error("[error-report] BREVO_API_KEY fehlt - Report kann nicht gesendet werden");
    return { success: false };
  }
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: `[BnB Fehler] HTTP ${input.httpStatus ?? "client"} / ${input.errorId ?? "?"}`,
      htmlContent: buildHtml(input),
      sender: {
        name: "Brief nach Berlin Fehlermelder",
        email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
      },
      to: [{ email: CONTACT.email }],
      tags: ["error-report"],
    });
    return { success: true };
  } catch (error) {
    console.error("[error-report] Brevo send failed:", error);
    return { success: false };
  }
}
