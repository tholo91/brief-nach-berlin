import {
  APP_URL,
  FOUNDER_INITIATIVE_URL,
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
import { isWinterFollowupActive } from "@/lib/winter-action";

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
  const winterAction = isWinterFollowupActive();
  const winterUrl = `${base}/weihnachten`;
  const winterCopy = {
    de: {
      heading: "Dieses Weihnachten teile ich meine Reichweite",
      mobileHeading: "Im Winter gemeinsam helfen",
      body: "Ich sammle sonst Spenden für Brief-nach-Berlin. Diesen Winter unterstütze ich lieber Projekte, die dringender Unterstützung brauchen. Hier findest du meine Auswahl.",
      button: "Jetzt unterstützen",
      note: "Im Winter leite ich meine Spendenbitte an ausgewählte Hilfsprojekte weiter.",
      status: "Die Spendenseite bündelt ausgewählte Hilfsprojekte.",
    },
    en: {
      heading: "This Christmas, I’m sharing my reach",
      mobileHeading: "Help others this winter",
      body: "I usually ask for donations to support Brief-nach-Berlin. This winter, I’d rather support projects facing urgent needs. Here’s my selection.",
      button: "Support winter projects",
      note: "This winter, I’m directing my donation request to selected aid projects.",
      status: "The page brings together selected aid projects.",
    },
    tr: {
      heading: "Bu Noel erişimimi paylaşıyorum",
      mobileHeading: "Bu kış birlikte destek olalım",
      body: "Normalde Brief-nach-Berlin için bağış çağrısı yapıyorum. Bu kış, acil desteğe ihtiyaç duyan projelere öncelik vermek istiyorum. Seçtiklerimi burada bulabilirsin.",
      button: "Kış projelerini destekle",
      note: "Bu kış bağış çağrımı seçtiğim yardım projelerine yönlendiriyorum.",
      status: "Bu sayfada seçilmiş yardım projeleri yer alıyor.",
    },
  }[locale];
  const winterSupportCopy = winterAction
    ? {
        ...supportCopy,
        heading: winterCopy.heading,
        followupHeadingMobile: winterCopy.mobileHeading,
        followupBody: winterCopy.body,
        compactButton: winterCopy.button,
        button: winterCopy.button,
        followupCostNote: winterCopy.note,
      }
    : supportCopy;
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
    winterAction ? winterSupportCopy.heading : `${winterSupportCopy.heading}*`,
    winterSupportCopy.followupBody,
    `${winterSupportCopy.compactButton}: ${winterAction ? winterUrl : SUPPORT_CONTENT.ctas.donate.href}`,
    ``,
    copy.thanks,
    ``,
    `Thomas`,
    `${emailCopy.initiative} ${FOUNDER_INITIATIVE_URL}`,
    ``,
    buildGoodToKnowText(goodToKnow, fullName, base, false),
    ``,
    `--`,
    ...(winterAction ? [] : [
      supportCopy.followupCostNote,
      `${supportCopy.compactButton}: ${SUPPORT_CONTENT.ctas.donate.href}`,
    ]),
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
      /* Spendenbox: rundes Foto mittig neben dem Text, Button über die ganze Breite. */
      .bnb-support-text { padding-left: 14px !important; padding-right: 14px !important; }
      .bnb-support-photo { width: 68px !important; height: 68px !important; margin: 2px 14px 0 10px !important; border-radius: 50% !important; background-color: #EDEAE6 !important; }
      .bnb-support-actions { clear: both !important; padding: 2px 14px 14px !important; }
      .bnb-support-cta { display: block !important; width: auto !important; }
      .bnb-support-note { display: block !important; margin: 8px 0 0 !important; text-align: center !important; }
      .bnb-support-note-break { display: none !important; }
    }
    /* Schmale Screens: Sterne unter der Frage plus Hinweis. */
    @media only screen and (max-width: 480px) {
      .bnb-rating-cell { display: block !important; padding: 0 !important; text-align: center !important; }
      .bnb-rating-hint { display: block !important; }
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
                {
                  ...winterSupportCopy,
                  heading: winterAction ? winterSupportCopy.heading : `${winterSupportCopy.heading}*`,
                  headingMobile: winterAction ? winterSupportCopy.followupHeadingMobile : `${winterSupportCopy.followupHeadingMobile}*`,
                  body: winterSupportCopy.followupBody,
                  status: winterAction ? winterCopy.status : supportCopy.followupStatus,
                },
                {
                  src: `${base}${winterAction ? "/images/thomas-weihnachten.png" : SUPPORT_CONTENT.founder.cutoutPath}`,
                  alt: SUPPORT_CONTENT.founder.name,
                },
                {
                  showHeart: !winterAction,
                  portraitPlacement: "corner",
                  ...(winterAction ? { donationUrl: winterUrl, learnMoreUrl: winterUrl } : {}),
                },
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
                ${emailCopy.initiative} <a href="${FOUNDER_INITIATIVE_URL}" target="_blank" rel="noopener noreferrer" style="color:#bcbcbc;text-decoration:underline;">www.thomas-lorenz.eu</a>
              </p>
            </td>
          </tr>

          ${buildGoodToKnowHtml(goodToKnow, escapeHtml(fullName), { compact: true, baseUrl: base, heading: false })}

          <!-- Airmail stripe before footer -->
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>

          <!-- Footer, same structure as the letter mail -->
          <tr>
            <td class="bnb-pad" style="padding:20px 32px 24px;background-color:#FAF8F5;text-align:center;">
              ${winterAction ? "" : `<p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#888888;line-height:1.6;">${supportCopy.followupCostNote}</p><p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#888888;line-height:1.5;"><a href="${SUPPORT_CONTENT.ctas.donate.href}" target="_blank" rel="noopener noreferrer" style="color:#888888;text-decoration:underline;">${supportCopy.compactButton}</a></p>`}
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
