import { BrevoClient } from "@getbrevo/brevo";
import { APP_NAME, APP_URL, EMAIL_SENDER_NAME, FOUNDER_EMAIL } from "@/lib/config";
import { CONTACT } from "@/lib/contact";

// Zusatzmails zur Kampagnen-Meldung: kurze Admin-Mail an Thomas (nur wenn die
// meldende Person eine Mail angegeben hat) und Eingangsbestätigung an diese
// Person. Die Mail an den Ersteller läuft über sendCampaignCreatorEmail.
//
// apiKey-Guard ist weich (return success:false statt throw): Der Meldeweg darf
// nicht crashen, wenn der Key fehlt.
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

const SENDER = () => ({
  name: EMAIL_SENDER_NAME,
  email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
});

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 12px;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;color:#3D3D3D;">
  <div style="max-width:560px;margin:0 auto;padding:24px 28px;background-color:#ffffff;font-size:16px;line-height:1.65;">
    ${body}
  </div>
</body>
</html>`;
}

export async function sendCampaignReportAdminEmail(params: {
  reporterEmail: string;
  slug: string;
  campaignTitle: string;
  reasonLabel: string;
}): Promise<{ success: boolean }> {
  if (!brevo) {
    console.error("[campaign-report] BREVO_API_KEY not set, admin mail skipped");
    return { success: false };
  }
  const url = `${APP_URL}/kampagne/${params.slug}`;
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: `[BnB Kampagnen-Meldung] ${params.slug}`,
      htmlContent: wrap(`<p style="margin:0 0 12px;"><strong>Meldung zu einer Kampagne</strong></p>
    <p style="margin:0 0 6px;">Kampagne: <a href="${esc(url)}">${esc(params.campaignTitle)}</a> (${esc(params.slug)})</p>
    <p style="margin:0 0 6px;">Grund: ${esc(params.reasonLabel)}</p>
    <p style="margin:0;">E-Mail der meldenden Person: ${esc(params.reporterEmail)}</p>`),
      sender: SENDER(),
      to: [{ email: process.env.THOMAS_MAIL || CONTACT.email }],
      replyTo: { email: FOUNDER_EMAIL },
      tags: ["campaign-report-admin"],
    });
    return { success: true };
  } catch {
    console.error("[campaign-report] admin mail failed");
    return { success: false };
  }
}

export async function sendCampaignReportConfirmationEmail(params: {
  reporterEmail: string;
  campaignTitle: string;
}): Promise<{ success: boolean }> {
  if (!brevo) {
    console.error("[campaign-report] BREVO_API_KEY not set, confirmation mail skipped");
    return { success: false };
  }
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: `${APP_NAME}: Deine Meldung ist angekommen`,
      htmlContent: wrap(`<p style="margin:0 0 12px;">Moin,</p>
    <p style="margin:0 0 12px;">Danke, deine Meldung zur Kampagne &bdquo;${esc(params.campaignTitle)}&ldquo; ist angekommen. Ich schaue drauf.</p>
    <p style="margin:0;">Thomas von ${APP_NAME}</p>`),
      sender: SENDER(),
      to: [{ email: params.reporterEmail }],
      replyTo: { email: FOUNDER_EMAIL },
      tags: ["campaign-report-confirmation"],
    });
    return { success: true };
  } catch {
    console.error("[campaign-report] confirmation mail failed");
    return { success: false };
  }
}
