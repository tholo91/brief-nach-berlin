import {
  APP_URL,
  FOUNDER_HOMEPAGE,
} from "@/lib/config";
import {
  buildGoodToKnowHtml,
  buildGoodToKnowText,
  buildStarBarHtml,
  type GoodToKnowInput,
} from "./buildEmailHtml";
import type { SendLetterEmailParams } from "./sendLetterEmail";
import { getEmailCopy, resolveEmailLocale } from "./mailLocale";
import type { Locale } from "@/lib/i18n/locale";
import { buildFinancingNoticeHtml } from "./financingNotice";
import { SUPPORT_CONTENT, SUPPORT_EMAIL_COPY } from "@/lib/support-content";
import {
  buildSocialFollowHtml,
  buildSocialFollowText,
} from "./buildSocialFollowHtml";

export interface BuildFollowupParams {
  locale?: Locale;
  token: string;
  politicianName?: string;
  politicianTitle?: string | null;
  politicianId?: number;
  // Nur für den Sprechstunden-Link in "Gut zu wissen", wie in der Briefmail.
  plz?: string;
  recipientKind?: SendLetterEmailParams["recipientKind"];
  // Overrides die Basis-URL für absolute Links und Bild-Assets in der Mail.
  // Default: APP_URL aus config (prod). Für lokale Vorschau im npm run dev:
  // baseUrl: "http://localhost:3000" durchreichen, damit das Foto
  // aus public/images/ statt aus prod gezogen wird.
  baseUrl?: string;
  // Persönlicher /datenloeschen?t=-Link, pro Empfänger erzeugt. Default für
  // Vorschau und Tests: die Seite ohne Token.
  deleteUrl?: string;
}

export interface FollowupRender {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildFollowupHtml(params: BuildFollowupParams): FollowupRender {
  const { token } = params;
  const base = params.baseUrl ?? APP_URL;
  const locale = resolveEmailLocale(params.locale);
  const emailCopy = getEmailCopy(locale);
  const copy = emailCopy.followup;
  const supportCopy = SUPPORT_EMAIL_COPY[locale];
  const subject = emailCopy.feedbackSubject;
  const deleteUrl = params.deleteUrl ?? `${base}/datenloeschen`;
  const name = params.politicianName?.trim() ?? "";
  const fullName = [params.politicianTitle, name].filter(Boolean).join(" ");
  // Ohne Namen kein "persönlich treffen"-Tipp, dann bleibt nur der Aktionen-Link.
  const goodToKnow: GoodToKnowInput = {
    locale,
    recipientKind: params.recipientKind === "mdb" && !name ? undefined : params.recipientKind,
    politicianId: params.politicianId,
    plz: params.plz,
  };

  const text = [
    copy.greeting,
    ``,
    copy.created,
    ``,
    emailCopy.feedbackQuestion.replace("<br>", " "),
    `1 Stern: ${base}/feedback?r=1&t=${token}&s=2`,
    `2 Sterne: ${base}/feedback?r=2&t=${token}&s=2`,
    `3 Sterne: ${base}/feedback?r=3&t=${token}&s=2`,
    `4 Sterne: ${base}/feedback?r=4&t=${token}&s=2`,
    `5 Sterne: ${base}/feedback?r=5&t=${token}&s=2`,
    ``,
    supportCopy.heading,
    supportCopy.followupBody,
    `${supportCopy.compactButton}: ${SUPPORT_CONTENT.ctas.donate.href}`,
    ``,
    copy.thanks,
    ``,
    `Thomas`,
    `${emailCopy.initiative} ${FOUNDER_HOMEPAGE}`,
    ``,
    buildGoodToKnowText(goodToKnow, fullName, base),
    ``,
    `--`,
    buildSocialFollowText(locale),
    `${copy.privacy}: ${copy.oneOff} ${base}/datenschutz`,
    `${copy.delete}: ${deleteUrl}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap" rel="stylesheet">
  <title>${subject}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .bnb-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .bnb-desk { display: none !important; }
      .bnb-mob { display: inline !important; }
    }
    /* Schmale Screens: Sterne unter der Frage plus Hinweis, Spenden-Button über die
       ganze Breite unter dem Foto, graue Zeile darunter. */
    @media only screen and (max-width: 480px) {
      .bnb-rating-cell { display: block !important; padding: 0 !important; text-align: center !important; }
      .bnb-rating-hint { display: block !important; }
      .bnb-support-text { padding-left: 14px !important; padding-right: 14px !important; }
      .bnb-support-photo { width: 100px !important; height: 100px !important; }
      .bnb-support-actions { clear: both !important; padding: 0 14px 14px !important; }
      .bnb-support-cta { display: block !important; }
      .bnb-support-note { display: block !important; max-width: none !important; margin: 8px 0 0 !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;">
  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#FAF8F5;opacity:0;">
    ${emailCopy.feedbackPreview}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:20px 0;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">

          <!-- Airmail stripe header (matches the letter mail) -->
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>

          <!-- Title -->
          <tr>
            <td class="bnb-pad" style="padding:28px 32px 22px;background-color:#ffffff;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;letter-spacing:0.5px;">Brief-nach-Berlin</h1>
              <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;">${subject}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="bnb-pad" style="padding:8px 32px 6px;background-color:#ffffff;">
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">${copy.greeting}</p>
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                ${copy.created}
              </p>
            </td>
          </tr>

          <!-- Compact rating: question and stars in one row, stars below on mobile -->
          <tr>
            <td class="bnb-pad" style="padding:0 32px 20px;background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0;">
                <tr>
                  <td class="followup-rating-column" width="100%" valign="middle" bgcolor="#FAF8F5" style="width:100%;background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:8px 16px;text-align:center;">
                    ${buildStarBarHtml(token, 2, locale, { compact: true })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Donation box with Thomas in the bottom-right corner -->
          <tr>
            <td class="bnb-pad" style="padding:0 32px 20px;background-color:#ffffff;">
              ${buildFinancingNoticeHtml(
                { ...supportCopy, body: supportCopy.followupBody, status: supportCopy.followupStatus },
                { src: `${base}${SUPPORT_CONTENT.founder.cutoutPath}`, alt: SUPPORT_CONTENT.founder.name },
                { showHeart: true, portraitPlacement: "corner" },
              )}
            </td>
          </tr>

          <!-- Sign-off paragraph + Caveat signature -->
          <tr>
            <td class="bnb-pad" style="padding:8px 32px 24px;background-color:#ffffff;text-align:left;">
              <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                ${copy.thanks}
              </p>
              <p style="margin:0;font-family:'Caveat','Brush Script MT','Lucida Handwriting',cursive;font-size:32px;color:#1D3557;line-height:1.1;">
                Thomas
              </p>
              <p style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#bcbcbc;line-height:1.5;">
                ${emailCopy.initiative} <a href="${FOUNDER_HOMEPAGE}" target="_blank" rel="noopener noreferrer" style="color:#bcbcbc;text-decoration:underline;">www.thomas-lorenz.eu</a>
              </p>
            </td>
          </tr>

          ${buildGoodToKnowHtml(goodToKnow, escapeHtml(fullName), { compact: true, baseUrl: base })}

          <!-- Airmail stripe before footer -->
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>

          <!-- Footer, same structure as the letter mail -->
          <tr>
            <td class="bnb-pad" style="padding:20px 32px 24px;background-color:#FAF8F5;text-align:center;">
              ${buildSocialFollowHtml({ locale, baseUrl: base, marginTop: 0 })}
              <p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#aaaaaa;line-height:1.5;">
                <a href="${base}/datenschutz" style="color:#888888;">${copy.privacy}</a>: ${copy.oneOff} · <a href="${deleteUrl}" style="color:#888888;">${copy.delete}</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
