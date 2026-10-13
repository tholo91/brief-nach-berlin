import {
  APP_URL,
  FOUNDER_EMAIL,
  FOUNDER_HOMEPAGE,
  SHARE_URL_WHATSAPP,
  SHARE_URL_TELEGRAM,
  SHARE_URL_EMAIL,
} from "@/lib/config";
import {
  buildSocialFollowHtml,
  buildSocialFollowText,
} from "./buildSocialFollowHtml";

// Dritte und letzte Follow-up-Mail mit vorausgefüllten Rückmelde-Links.

const STORY_VOICE_URL = "https://www.heyspeak.io/l/_AkL8g0mlosEDTMU6vDxuA";
const STORY_REPLY_MAILTO =
  `mailto:${FOUNDER_EMAIL}?subject=` +
  encodeURIComponent("Meine Brief-nach-Berlin-Geschichte");

export interface BuildLastcallParams {
  // Überschreibt die Basis-URL für absolute Links und Bild-Assets in der Mail.
  // Default: APP_URL aus config (prod). Für lokale Vorschau im npm run dev:
  // baseUrl: "http://localhost:3000" durchreichen, damit die Icon-Bilder aus
  // public/images/ statt aus prod gezogen werden.
  baseUrl?: string;
  // Persönlicher /datenloeschen?t=-Link, pro Empfänger erzeugt. Default für
  // Vorschau und Tests: die Seite ohne Token.
  deleteUrl?: string;
  // Persönliche URL zu /rueckmeldung?t=..., signiert pro Empfänger.
  answerBaseUrl?: string;
}

export interface LastcallRender {
  subject: string;
  html: string;
  text: string;
}

export function buildLastcallHtml(
  params: BuildLastcallParams = {},
): LastcallRender {
  const base = params.baseUrl ?? APP_URL;

  const subject = "Brief aus Berlin?";
  const deleteUrl = params.deleteUrl ?? `${base}/datenloeschen`;
  const answerBaseUrl = params.answerBaseUrl ?? `${base}/rueckmeldung`;
  const answerUrl = (choice: "ja" | "nein" | "nicht") =>
    `${answerBaseUrl}${answerBaseUrl.includes("?") ? "&" : "?"}a=${choice}`;

  const instagramUrl = `${base}/weitersagen#insta`;

  const text = [
    `Moin 👋`,
    ``,
    `Meine Mutter war die erste Userin von Brief-nach-Berlin. Nach ihrem Brief hat das MdB-Büro sie angerufen und sogar besucht, und ihr lokales Anliegen wurde behoben. Genial!`,
    ``,
    `Vor einer Weile hast auch du deinen Brief-nach-Berlin (${base}) geschrieben. Ich bin neugierig, wie es damit gelaufen ist: Auch wenn nichts zurückkam oder du den Brief nicht abgeschickt hast, hilft mir deine Rückmeldung.`,
    ``,
    `Hat sich jemand auf deinen Brief gemeldet?`,
    `Ja, es kam etwas: ${answerUrl("ja")}`,
    `Nein, noch nichts: ${answerUrl("nein")}`,
    `Ich habe den Brief nicht abgeschickt: ${answerUrl("nicht")}`,
    `Nach Klick auf einen Button kannst du dein Erlebnis genauer schildern. Dein Klick wird mit deiner E-Mail-Adresse gespeichert. Dein Brief bleibt aber geheim (Datenschutz: ${base}/datenschutz).`,
    ``,
    `Lieber ausführlicher erzählen? Schick mir eine Sprachnachricht (${STORY_VOICE_URL}) oder antworte einfach auf diese Mail an ${FOUNDER_EMAIL}, gern auch mit einem Foto vom Antwortbrief.`,
    ``,
    `Danke dir und beste Grüße aus Bremen ✌️`,
    ``,
    `Thomas`,
    `Eine Initiative von ${FOUNDER_HOMEPAGE}`,
    ``,
    `--`,
    `Weitersagen:`,
    `WhatsApp:  ${SHARE_URL_WHATSAPP}`,
    `Telegram:  ${SHARE_URL_TELEGRAM}`,
    `Instagram: ${instagramUrl}`,
    `E-Mail:    ${SHARE_URL_EMAIL}`,
    ``,
    `--`,
    `Das ist meine letzte automatische Mail an dich, kein Newsletter. Dein Brief und dein Anliegen werden nicht gespeichert.`,
    buildSocialFollowText(),
    `Datenschutz: ${base}/datenschutz · Gespeicherte Daten löschen: ${deleteUrl}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap" rel="stylesheet">
  <title>${subject}</title>
  <style>
    /* Mobile: die beiden CTA-Buttons stehen auf schmalen Viewports
       untereinander statt nebeneinander, damit das iOS-44pt-Tap-Target
       sicher erreicht wird. Gmail / Apple Mail respektieren @media im head. */
    @media only screen and (max-width: 480px) {
      .lc-mailbox { display: none !important; }
      .lc-title-cell { padding: 0 !important; }
      .lc-cta-cell { display: block !important; width: 100% !important; padding: 0 0 12px 0 !important; }
      .lc-cta-cell a { display: block !important; }
      .lc-share-label { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;">
  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#FAF8F5;opacity:0;">
    Kurze Nachfrage, kein Newsletter.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:20px 0;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">

          <!-- Airmail stripe header -->
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>

          <!-- Title row: centered title with mailbox illustration top-right.
               Bild ist absolut platziert, schiebt nichts. Auf Mobile (<=480px)
               wird es ausgeblendet, damit der zentrierte Titel nicht kollidiert. -->
          <tr>
            <td style="padding:28px 32px 22px;background-color:#ffffff;position:relative;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td class="lc-title-cell" style="vertical-align:middle;text-align:center;padding:0 130px;">
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;letter-spacing:0.5px;">Brief-nach-Berlin</h1>
                    <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;">Eine letzte, neugierige Frage</p>
                  </td>
                </tr>
              </table>
              <!--[if !mso]><!-->
              <img class="lc-mailbox" src="${base}/images/email-lastcall-mailbox.png" alt="" width="132" height="132" style="position:absolute;top:6px;right:8px;width:132px;height:132px;border:0;outline:none;display:block;" />
              <!--<![endif]-->
              <!--[if mso]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="position:absolute;top:6px;right:8px;width:132px;height:132px;mso-position-horizontal:right;mso-position-vertical:top;">
                <v:fill type="frame" src="${base}/images/email-lastcall-mailbox.png" />
              </v:rect>
              <![endif]-->
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:8px 32px 8px;background-color:#ffffff;">
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">Moin 👋</p>
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">Meine Mutter war die erste Userin von Brief-nach-Berlin. Nach ihrem Brief hat das MdB-Büro sie angerufen und sogar besucht, und ihr lokales Anliegen wurde behoben. Genial!</p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Vor einer Weile hast auch du deinen <a href="${base}" style="color:#2D5016;text-decoration:underline;">Brief-nach-Berlin</a> geschrieben. Ich bin neugierig, wie es damit gelaufen ist: Auch wenn nichts zurückkam oder du den Brief nicht abgeschickt hast, hilft mir deine Rückmeldung.
              </p>
            </td>
          </tr>

          <!-- Antwort mit einem Klick: cremefarbene Box wie die Sterne-Box der Follow-up-Mail -->
          <tr>
            <td style="padding:16px 32px 8px;background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0;">
                <tr>
                  <td bgcolor="#FAF8F5" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:22px 20px 16px;text-align:center;">
                    <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;line-height:1.4;">Hat sich jemand auf deinen Brief gemeldet?</h2>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;"><tr>
                      <td class="lc-cta-cell" width="50%" style="width:50%;padding:0 6px 0 0;"><a href="${answerUrl("ja")}" style="display:block;text-align:center;background:#2D5016;color:#fff;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 18px;border-radius:6px;border:2px solid #2D5016;">😊 Ja, es kam etwas</a></td>
                      <td class="lc-cta-cell" width="50%" style="width:50%;padding:0 0 0 6px;"><a href="${answerUrl("nein")}" style="display:block;text-align:center;background:#fff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 18px;border-radius:6px;border:2px solid #2D5016;">😕 Nein, noch nichts</a></td>
                    </tr></table>
                    <p style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.5;"><a href="${answerUrl("nicht")}" style="display:inline-block;padding:6px 4px;color:#4A4A4A;text-decoration:underline;">Ich habe meinen Brief nicht abgeschickt</a></p>
                    <p style="margin:18px 0 0;padding-top:12px;border-top:1px solid #E0DCD7;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;line-height:1.5;">Nach Klick auf einen Button kannst du dein Erlebnis genauer schildern. Dein Klick wird mit deiner E-Mail-Adresse gespeichert. Dein Brief bleibt aber geheim (<a href="${base}/datenschutz" style="color:#888888;">Datenschutz</a>).</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Erzähl-Angebot + Sign-off + Caveat-Handschrift -->
          <tr>
            <td style="padding:20px 32px 24px;background-color:#ffffff;text-align:left;">
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Lieber ausführlicher erzählen? Schick mir eine <a href="${STORY_VOICE_URL}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">Sprachnachricht</a> oder <a href="${STORY_REPLY_MAILTO}" style="color:#2D5016;text-decoration:underline;">antworte einfach auf diese Mail</a>, gern auch mit einem Foto vom Antwortbrief.
              </p>
              <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Danke dir und beste Grüße aus Bremen ✌️
              </p>
              <p style="margin:0;font-family:'Caveat','Brush Script MT','Lucida Handwriting',cursive;font-size:32px;color:#1D3557;line-height:1.1;">
                Thomas
              </p>
              <p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#bcbcbc;line-height:1.5;">
                Eine Initiative von <a href="${FOUNDER_HOMEPAGE}" target="_blank" rel="noopener noreferrer" style="color:#bcbcbc;text-decoration:underline;">www.thomas-lorenz.eu</a>
              </p>
            </td>
          </tr>

          <!-- Share container: WhatsApp / Telegram / Instagram / E-Mail (wie Letter-Mail) -->
          <tr>
            <td style="padding:8px 32px 24px;background-color:#ffffff;">
              <div style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:20px 22px;">
                <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Gemeinsam noch lauter</h2>
                <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                  Briefe aus dem gleichen Wahlkreis bekommen im Bundestag mehr Gewicht. Teile Brief-nach-Berlin supergerne in deinem Umfeld (<a href="${base}/weitersagen" style="color:#2D5016;text-decoration:underline;">mehr Infos</a>).
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-right:4px;width:25%;" valign="top">
                      <a href="${SHARE_URL_WHATSAPP}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${base}/images/icon-whatsapp.png" alt="" width="18" height="18" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="lc-share-label">WhatsApp</span></a>
                    </td>
                    <td style="padding:0 2px;width:25%;" valign="top">
                      <a href="${SHARE_URL_TELEGRAM}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${base}/images/icon-telegram.png" alt="" width="18" height="18" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="lc-share-label">Telegram</span></a>
                    </td>
                    <td style="padding:0 2px;width:25%;" valign="top">
                      <a href="${instagramUrl}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${base}/images/icon-instagram.png" alt="" width="18" height="18" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="lc-share-label">Instagram</span></a>
                    </td>
                    <td style="padding-left:4px;width:25%;" valign="top">
                      <a href="${SHARE_URL_EMAIL}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${base}/images/icon-email.png" alt="" width="18" height="18" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="lc-share-label">E-Mail</span></a>
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

          <!-- Footer (wie Follow-up-Mail) -->
          <tr>
            <td style="padding:20px 32px 24px;background-color:#FAF8F5;text-align:center;">
              ${buildSocialFollowHtml({ baseUrl: base })}
              <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#aaaaaa;line-height:1.5;">
                Das ist meine letzte automatische Mail an dich, kein Newsletter. Dein Brief und dein Anliegen werden nicht gespeichert. <a href="${base}/datenschutz" style="color:#888888;">Datenschutz</a> · <a href="${deleteUrl}" style="color:#888888;">Gespeicherte Daten löschen</a>
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
