import { BrevoClient } from "@getbrevo/brevo";
import { APP_NAME, APP_URL, EMAIL_SENDER_NAME } from "@/lib/config";
import { formatLetterCount } from "@/lib/campaigns/milestones";
import { buildGlobalLetterMilestoneEmailHtml } from "./buildGlobalLetterMilestoneEmailHtml";

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  throw new Error("[brief-nach-berlin] BREVO_API_KEY environment variable is not set");
}
const brevo = new BrevoClient({ apiKey });

export async function sendGlobalLetterMilestoneEmail(
  count: number,
): Promise<{ success: boolean; messageId?: string }> {
  const recipientEmail = process.env.THOMAS_MAIL;
  if (!recipientEmail) {
    console.error("[brief-nach-berlin][global-milestone] recipient is not configured");
    return { success: false };
  }

  const imageUrl = `${APP_URL}/stats/meilenstein/${count}/bild`;
  const statsUrl = `${APP_URL}/stats`;

  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: `${formatLetterCount(count)} Briefe mit ${APP_NAME}`,
      htmlContent: buildGlobalLetterMilestoneEmailHtml({
        count,
        imageUrl,
        statsUrl,
      }),
      sender: {
        name: EMAIL_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
      },
      to: [{ email: recipientEmail }],
      tags: ["global-letter-milestone"],
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[brief-nach-berlin][global-milestone] email send failed:", error);
    return { success: false };
  }
}
