import { BrevoClient } from "@getbrevo/brevo";
import { APP_URL, EMAIL_SENDER_NAME } from "@/lib/config";
import { CONTACT } from "@/lib/contact";
import { CREATOR_SURVEY_MIN_LETTERS_ENDED } from "@/lib/campaigns/creatorSurvey";

// Interne Mail an Thomas, sobald eine Kampagne ueber "Kampagne beenden" beendet
// wurde. Nichts geht an die Ersteller:innen. Enthaelt keine Ersteller-Adresse.
// Weicher apiKey-Guard: Das Beenden darf nie an dieser Mail scheitern.
const apiKey = process.env.BREVO_API_KEY;
const brevo = apiKey ? new BrevoClient({ apiKey }) : null;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type CampaignEndedAdminNoticeParams = {
  slug: string;
  title: string;
  letterCount: number;
  creatorName: string | null;
};

export function buildCampaignEndedAdminNoticeHtml(params: CampaignEndedAdminNoticeParams): string {
  const url = `${APP_URL}/kampagne/${params.slug}`;
  const eligible = params.letterCount >= CREATOR_SURVEY_MIN_LETTERS_ENDED;
  const command = `cd web && npx tsx scripts/send-campaign-ended-mail.ts --slug ${params.slug} --preview-to-me`;
  const next = eligible
    ? `<p style="margin:0 0 6px;"><strong>Abschluss-Mail vorbereiten:</strong></p>
    <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:14px;">${esc(command)}</p>`
    : `<p style="margin:0 0 12px;">Unter ${CREATOR_SURVEY_MIN_LETTERS_ENDED} Briefen: keine Abschluss-Mail vorgesehen.</p>`;

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 12px;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;color:#3D3D3D;">
  <div style="max-width:560px;margin:0 auto;padding:24px 28px;background-color:#ffffff;font-size:16px;line-height:1.65;">
    <p style="margin:0 0 12px;"><strong>Kampagne beendet</strong></p>
    <p style="margin:0 0 6px;"><a href="${esc(url)}">${esc(params.title)}</a> (${esc(params.slug)})</p>
    <p style="margin:0 0 6px;">Briefe: ${params.letterCount}</p>
    <p style="margin:0 0 16px;">Ersteller:in: ${esc(params.creatorName?.trim() || "ohne Namen")}</p>
    ${next}
  </div>
</body>
</html>`;
}

export async function sendCampaignEndedAdminNotice(
  params: CampaignEndedAdminNoticeParams,
): Promise<{ success: boolean }> {
  if (!brevo) {
    console.error("[campaign-ended-admin] BREVO_API_KEY not set, notice skipped");
    return { success: false };
  }
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: `[BnB Kampagne beendet] ${params.slug}`,
      htmlContent: buildCampaignEndedAdminNoticeHtml(params),
      sender: {
        name: EMAIL_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
      },
      to: [{ email: process.env.THOMAS_MAIL || CONTACT.email }],
      tags: ["campaign-ended-admin"],
    });
    return { success: true };
  } catch {
    console.error("[campaign-ended-admin] notice failed");
    return { success: false };
  }
}
