import { BrevoClient } from "@getbrevo/brevo";
import { buildFollowupHtml } from "./buildFollowupHtml";
import { EMAIL_SENDER_NAME } from "@/lib/config";

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  throw new Error("[brief-nach-berlin] BREVO_API_KEY environment variable is not set");
}
// DSGVO: Open- und Click-Tracking ist im Brevo-Account global deaktiviert
// (siehe sendLetterEmail.ts). Gilt auch für scheduled sends.
const brevo = new BrevoClient({ apiKey });

export interface SendFollowupEmailParams {
  recipientEmail: string;
  politicianName?: string;
  // Selber signierter Token wie für die Originalmail. Wir signieren NICHT neu —
  // /feedback erwartet den vollen debug_payload aus dem ursprünglichen Token.
  feedbackToken: string;
  // UTC ISO-String oder Date. Wird an Brevos scheduledAt durchgereicht.
  // Brevo-Limit laut historischer Doku
  // (developers.brevo.com/reference/sendtransacemail): bis zu 72h ab Anfrage.
  // Bei Limit-Verletzung schlägt nur dieser Aufruf fehl; der Original-Versand
  // bleibt unberührt (Promise.allSettled im Caller).
  scheduledAt: Date | string;
}

export async function sendFollowupEmail(
  params: SendFollowupEmailParams,
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const { subject, html, text } = buildFollowupHtml({
      token: params.feedbackToken,
      politicianName: params.politicianName,
    });
    const scheduledAt =
      params.scheduledAt instanceof Date
        ? params.scheduledAt.toISOString()
        : params.scheduledAt;

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      textContent: text,
      sender: {
        name: EMAIL_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
      },
      to: [{ email: params.recipientEmail }],
      replyTo: { email: "thomas@visualmakers.de" },
      tags: ["followup-3d"],
      scheduledAt,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[brief-nach-berlin][followup] Brevo send failed:", error);
    return { success: false };
  }
}
