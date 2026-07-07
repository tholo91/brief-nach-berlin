import { BrevoClient } from "@getbrevo/brevo";
import { EMAIL_SENDER_NAME } from "@/lib/config";
import { buildVariantEmailHtml } from "./buildVariantEmailHtml";
import type { LetterVariantDebugPayload } from "./variantDebugPayload";

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  throw new Error("[brief-nach-berlin] BREVO_API_KEY environment variable is not set");
}

const brevo = new BrevoClient({ apiKey });

export async function sendVariantEmail(params: {
  recipientEmail: string;
  letterText: string;
  debug?: LetterVariantDebugPayload;
}): Promise<{ success: boolean; messageId?: string }> {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: "Dein angepasster Brief nach Berlin ist fertig",
      htmlContent: buildVariantEmailHtml(params.letterText, params.recipientEmail, params.debug),
      sender: {
        name: EMAIL_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
      },
      to: [{ email: params.recipientEmail }],
      tags: ["brief_variant"],
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[brief-nach-berlin] Brevo variant send failed:", error);
    return { success: false };
  }
}
