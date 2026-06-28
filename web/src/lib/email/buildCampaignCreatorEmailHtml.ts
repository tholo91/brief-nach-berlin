import { APP_NAME, APP_URL } from "@/lib/config";

export type CampaignCreatorEmailKind = "verify_email" | "management";

export interface BuildCampaignCreatorEmailHtmlParams {
  kind: CampaignCreatorEmailKind;
  campaignTitle: string;
  campaignUrl: string;
  actionUrl: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildCampaignCreatorEmailHtml(
  params: BuildCampaignCreatorEmailHtmlParams
): string {
  const title = escapeHtml(params.campaignTitle);
  const isVerification = params.kind === "verify_email";
  const headline = isVerification
    ? "Bitte bestaetige deine Kampagne"
    : "Deine Kampagne ist aktiv";
  const intro = isVerification
    ? "Ein letzter Klick: Danach pruefe ich den aktuellen Kampagnentext noch einmal automatisch und schalte die Seite frei, wenn alles passt."
    : "Deine Kampagnenseite ist jetzt oeffentlich. Teile den Link mit Menschen, die aus ihrem Wahlkreis einen eigenen Brief schreiben sollen.";
  const buttonText = isVerification
    ? "E-Mail bestaetigen"
    : "Kampagne verwalten";
  const statusText = isVerification
    ? "Status: wartet auf E-Mail-Bestaetigung, noch nicht oeffentlich"
    : "Status: aktiv und oeffentlich teilbar";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;color:#3D3D3D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;text-align:center;">
              <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#2D6A4F;">${APP_NAME}</p>
              <h1 style="margin:0;font-size:24px;line-height:1.25;color:#1B4332;">${headline}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 0;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">Hallo,</p>
              <p style="margin:0 0 18px;font-size:16px;line-height:1.65;">${intro}</p>
              <div style="margin:0 0 22px;padding:16px 18px;background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;">
                <p style="margin:0 0 6px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">Kampagne</p>
                <p style="margin:0;font-size:18px;line-height:1.45;color:#1B4332;"><strong>${title}</strong></p>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.5;color:#666666;">${statusText}</p>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.5;"><a href="${params.campaignUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D6A4F;text-decoration:underline;">${params.campaignUrl}</a></p>
              </div>
              <p style="margin:0 0 22px;text-align:center;">
                <a href="${params.actionUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#2D6A4F;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:13px 18px;border-radius:4px;">${buttonText}</a>
              </p>
              ${
                isVerification
                  ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#666666;">Wenn du diese Kampagne nicht angelegt hast, kannst du diese E-Mail ignorieren. Ohne Bestaetigung wird die Seite nicht oeffentlich.</p>`
                  : `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#666666;">Der Verwaltungslink funktioniert ohne Account. Bewahre diese E-Mail auf. Darueber kannst du spaeter Inhalte bearbeiten oder die Kampagne pausieren.</p>`
              }
            </td>
          </tr>
          <tr>
            <td style="padding:10px 28px 28px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#999999;">Brief nach Berlin speichert in Kampagnen nur die creator-seitig eingegebenen oeffentlichen Texte und deine E-Mail fuer diesen Zugriff. Besucherbriefe werden dadurch nicht gespeichert.</p>
              <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#999999;"><a href="${APP_URL}" target="_blank" rel="noopener noreferrer" style="color:#999999;text-decoration:underline;">brief-nach-berlin.de</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
