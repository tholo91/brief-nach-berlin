import {
  APP_URL,
  FOUNDER_HOMEPAGE,
  SHARE_URL_WHATSAPP,
  SHARE_URL_TELEGRAM,
  SHARE_URL_EMAIL,
} from "@/lib/config";
import { buildStarBarHtml } from "./buildEmailHtml";
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
  recipientKind?: SendLetterEmailParams["recipientKind"];
  // Overrides die Basis-URL für absolute Links und Bild-Assets in der Mail.
  // Default: APP_URL aus config (prod). Für lokale Vorschau im npm run dev:
  // baseUrl: "http://localhost:3000" durchreichen, damit das Envelope-Bild
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
  const copy = getEmailCopy(locale).followup;
  const supportCopy = SUPPORT_EMAIL_COPY[locale];
  const subject = getEmailCopy(locale).feedbackSubject;
  const isTurkish = locale === "tr";
  const shareText = isTurkish
    ? `Brief-nach-Berlin ile siyasete kişisel bir mektup hazırladım. Sen de kendi sözlerinle bir mektup yazmak ister misin? ${base}`
    : locale === "en"
      ? `I just prepared a personal letter to politicians with Brief-nach-Berlin. Would you also like to write a letter in your own words? ${base}`
      : undefined;
  const shareWhatsappUrl = shareText
    ? `https://wa.me/?text=${encodeURIComponent(shareText)}`
    : SHARE_URL_WHATSAPP;
  const shareTelegramUrl = shareText
    ? `https://t.me/share/url?url=${encodeURIComponent(base)}&text=${encodeURIComponent(shareText)}`
    : SHARE_URL_TELEGRAM;
  const shareEmailUrl = shareText
    ? `mailto:?subject=${encodeURIComponent(isTurkish ? "Sen de Brief-nach-Berlin ile bir mektup yazar mısın?" : "Would you also write a letter with Brief-nach-Berlin?")}&body=${encodeURIComponent(shareText)}`
    : SHARE_URL_EMAIL;
  const instagramUrl = `${base}/weitersagen#insta`;
  const deleteUrl = params.deleteUrl ?? `${base}/datenloeschen`;
  const meetMdb =
    params.recipientKind === "mdb" && params.politicianName
      ? {
          sentence: copy.meetMdb(params.politicianName),
          linkLabel: copy.meetMdbLink,
          url: `${base}/aktiv-werden#wahlkreisbuero`,
        }
      : null;

  const text = [
    copy.greeting,
    ``,
    `${copy.created} (${base})`,
    ``,
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
    ...(meetMdb ? [`${meetMdb.sentence} ${meetMdb.linkLabel}: ${meetMdb.url}`, ``] : []),
    copy.ignore,
    copy.thanks,
    ``,
    `Thomas`,
    `${FOUNDER_HOMEPAGE} · ${copy.roadmap}: ${base}/was-noch-kommt`,
    ``,
    `--`,
    `${copy.shareHeading}: ${copy.share}: ${base}/weitersagen`,
    `WhatsApp: ${shareWhatsappUrl}`,
    `Telegram: ${shareTelegramUrl}`,
    `Instagram: ${instagramUrl}`,
    `E-Mail:   ${shareEmailUrl}`,
    ``,
    `--`,
    copy.oneOff,
    buildSocialFollowText(locale),
    `${copy.write} ${base}/wer-darf-mdb-schreiben`,
    `${copy.privacy}: ${base}/datenschutz · ${copy.delete}: ${deleteUrl} · ${copy.roadmap}: ${base}/was-noch-kommt`,
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
      .bnb-share-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .bnb-share-inner-pad { padding-left: 14px !important; padding-right: 14px !important; }
      .bnb-share-label { display: none !important; }
      .bnb-share-btn { padding: 14px 0 !important; }
      .bnb-share-icon { width: 24px !important; height: 24px !important; margin: 0 !important; }
      .bnb-inner-pad { padding-left: 14px !important; padding-right: 14px !important; }
      .bnb-support-action { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
      .bnb-support-action-primary { padding-bottom: 8px !important; }
    }
    /* Mobile: ausreichend schmale Viewports lassen das absolut platzierte
       Envelope-Bild mit dem zentrierten Titel kollidieren. Bei <= 480px
       wird es deshalb ausgeblendet — der Header bleibt sauber zentriert.
       Gmail / Apple Mail respektieren @media im head; Outlook ignoriert es,
       zeigt das Bild dort weiter an (in Outlook gibt es eh kein Mobile-Layout). */
    @media only screen and (max-width: 480px) {
      .followup-envelope { display: none !important; }
      .followup-title-cell { padding: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;">
  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#FAF8F5;opacity:0;">
    ${getEmailCopy(locale).feedbackPreview}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:20px 0;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">

          <!-- Airmail stripe header (matches the letter mail) -->
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>

          <!-- Title row: centered title with envelope watermark top-right.
               Envelope ist absolut platziert + opacity 0.6, schiebt nichts.
               Auf Mobile (@media <=480px) wird das Bild ausgeblendet, damit
               der zentrierte Titel nicht mit dem Bild kollidiert. -->
          <tr>
            <td style="padding:28px 32px 22px;background-color:#ffffff;position:relative;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td class="followup-title-cell" style="vertical-align:middle;text-align:center;padding:0 130px;">
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;letter-spacing:0.5px;">Brief-nach-Berlin</h1>
                    <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;">${subject}</p>
                  </td>
                </tr>
              </table>
              <!--[if !mso]><!-->
              <img class="followup-envelope" src="${base}/images/email-followup-envelope.png" alt="" width="140" height="140" style="position:absolute;top:4px;right:8px;width:140px;height:140px;border:0;outline:none;display:block;opacity:0.6;-ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=60)';filter:alpha(opacity=60);" />
              <!--<![endif]-->
              <!--[if mso]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="position:absolute;top:4px;right:8px;width:140px;height:140px;mso-position-horizontal:right;mso-position-vertical:top;opacity:0.6;">
                <v:fill type="frame" src="${base}/images/email-followup-envelope.png" opacity="60%" />
              </v:rect>
              <![endif]-->
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:8px 32px 8px;background-color:#ffffff;">
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">${copy.greeting}</p>
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                ${copy.created}
              </p>
            </td>
          </tr>

          <!-- Primary rating action, full width -->
          <tr>
            <td style="padding:4px 32px 24px;background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td class="followup-rating-column" width="100%" valign="middle" style="width:100%;padding:0;text-align:center;">
                    ${buildStarBarHtml(token, 2, locale, { showQuestion: false })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Donation box, same component as the campaign creator mails -->
          <tr>
            <td style="padding:0 32px 20px;background-color:#ffffff;">
              ${buildFinancingNoticeHtml(
                { ...supportCopy, body: supportCopy.followupBody },
                { src: `${base}${SUPPORT_CONTENT.founder.avatarPath}`, alt: SUPPORT_CONTENT.founder.name },
                { showHeart: true },
              )}
            </td>
          </tr>

          ${
            meetMdb
              ? `<!-- Wahlkreisbüro-Hinweis (nur MdB-Briefe) -->
          <tr>
            <td style="padding:0 32px 8px;background-color:#ffffff;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                ${escapeHtml(meetMdb.sentence)} <a href="${meetMdb.url}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${escapeHtml(meetMdb.linkLabel)}</a>
              </p>
            </td>
          </tr>
`
              : ""
          }
          <!-- Sign-off paragraph + Caveat signature -->
          <tr>
            <td style="padding:16px 32px 24px;background-color:#ffffff;text-align:left;">
              <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                ${copy.ignore}<br>
                ${copy.thanks}
              </p>
              <p style="margin:0;font-family:'Caveat','Brush Script MT','Lucida Handwriting',cursive;font-size:32px;color:#1D3557;line-height:1.1;">
                Thomas
              </p>
              <p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#bcbcbc;line-height:1.5;">
                ${getEmailCopy(locale).initiative} <a href="${FOUNDER_HOMEPAGE}" target="_blank" rel="noopener noreferrer" style="color:#bcbcbc;text-decoration:underline;">www.thomas-lorenz.eu</a> · <a href="${base}/was-noch-kommt" target="_blank" rel="noopener noreferrer" style="color:#bcbcbc;text-decoration:underline;">${copy.roadmap}</a>
              </p>
            </td>
          </tr>

          <!-- Share container -->
          <tr>
            <td class="bnb-share-pad" style="padding:8px 32px 24px;background-color:#ffffff;">
              <div class="bnb-share-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:20px 22px;">
                <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">${copy.shareHeading}</h2>
                <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                  ${copy.share} (<a href="${base}/weitersagen" style="color:#2D5016;text-decoration:underline;">${copy.moreInfo}</a>).
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-right:4px;width:25%;" valign="top">
                      <a href="${shareWhatsappUrl}" class="bnb-share-btn" aria-label="WhatsApp" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${base}/images/icon-whatsapp.png" alt="" width="18" height="18" class="bnb-share-icon" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">WhatsApp</span></a>
                    </td>
                    <td style="padding:0 2px;width:25%;" valign="top">
                      <a href="${shareTelegramUrl}" class="bnb-share-btn" aria-label="Telegram" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${base}/images/icon-telegram.png" alt="" width="18" height="18" class="bnb-share-icon" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">Telegram</span></a>
                    </td>
                    <td style="padding:0 2px;width:25%;" valign="top">
                      <a href="${instagramUrl}" class="bnb-share-btn" aria-label="Instagram" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${base}/images/icon-instagram.png" alt="" width="18" height="18" class="bnb-share-icon" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">Instagram</span></a>
                    </td>
                    <td style="padding-left:4px;width:25%;" valign="top">
                      <a href="${shareEmailUrl}" class="bnb-share-btn" aria-label="E-Mail" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${base}/images/icon-email.png" alt="" width="18" height="18" class="bnb-share-icon" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">E-Mail</span></a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Airmail stripe before footer -->
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 24px;background-color:#FAF8F5;text-align:center;">
              ${buildSocialFollowHtml({ locale, baseUrl: base })}
              <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#aaaaaa;line-height:1.5;">
                ${copy.oneOff} <a href="${APP_URL}/datenschutz" style="color:#888888;">${copy.privacy}</a> · <a href="${deleteUrl}" style="color:#888888;">${copy.delete}</a> · <a href="${APP_URL}/was-noch-kommt" style="color:#888888;">${copy.roadmap}</a> · <a href="${APP_URL}/wer-darf-mdb-schreiben" style="color:#888888;">${copy.write}</a>
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
