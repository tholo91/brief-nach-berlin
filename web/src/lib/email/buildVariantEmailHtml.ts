import { APP_URL, FOUNDER_FEEDBACK_URL, FOUNDER_HOMEPAGE } from "@/lib/config";
import type { LetterVariantDebugPayload } from "./variantDebugPayload";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nlToBr(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function feedbackUrl(email?: string): string {
  if (!email) return FOUNDER_FEEDBACK_URL;
  const url = new URL(FOUNDER_FEEDBACK_URL);
  url.searchParams.set("email", email);
  return url.toString();
}

function buildDebugUrl(d: LetterVariantDebugPayload): string {
  const json = JSON.stringify(d);
  const b64 = Buffer.from(json, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${APP_URL}/debug?d=${b64}`;
}

export function buildVariantEmailHtml(
  letterText: string,
  recipientEmail?: string,
  debug?: LetterVariantDebugPayload
): string {
  const letterHtml = nlToBr(letterText);
  const variantFeedbackUrl = feedbackUrl(recipientEmail);

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .bnb-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .bnb-inner-pad { padding-left: 14px !important; padding-right: 14px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:28px 32px 18px;text-align:center;background-color:#ffffff;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;letter-spacing:0.5px;">Brief-nach-Berlin</h1>
              <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;">Dein angepasster Briefentwurf ist fertig.</p>
            </td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:0 32px 20px;background-color:#ffffff;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">Hier ist die umformulierte Variante deines bestehenden Briefs. Aus Datenschutzgründen wurde dein eingefügter Brieftext nicht gespeichert.</p>
            </td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:0 32px 24px;background-color:#ffffff;">
              <div class="bnb-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:24px;">
                <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.7;color:#4A4A4A;white-space:pre-wrap;">${letterHtml}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:0 32px 28px;background-color:#ffffff;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">Die Anschrift findest du in deiner ursprünglichen Brief-Mail. Bitte lies die Variante vor dem Abschreiben noch einmal gründlich durch.</p>
            </td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:0 32px 28px;background-color:#ffffff;">
              <div class="bnb-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:18px 20px;text-align:center;">
                <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#2D5016;font-weight:bold;line-height:1.5;">War die neue Variante besser?</p>
                <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">Sag mir kurz, was noch fehlt. Das hilft, den Anpassungsflow besser zu machen.</p>
                <a href="${variantFeedbackUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#2D5016;color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 18px;border-radius:6px;">Feedback geben</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:24px 32px;background-color:#FAF8F5;text-align:center;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;">
                <a href="${APP_URL}" style="color:#2D5016;text-decoration:none;">Brief-nach-Berlin</a> · Eine Initiative von <a href="${FOUNDER_HOMEPAGE}" target="_blank" rel="noopener noreferrer" style="color:#999999;text-decoration:underline;">Thomas Lorenz</a>${debug ? ` · <a href="${buildDebugUrl(debug)}" style="color:#888888;text-decoration:none;">Debug</a>` : ""}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
