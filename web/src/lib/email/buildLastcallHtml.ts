import {
  APP_URL,
  FOUNDER_HOMEPAGE,
  SHARE_URL_WHATSAPP,
  SHARE_URL_TELEGRAM,
  SHARE_URL_EMAIL,
} from "@/lib/config";

// Dritte und letzte Follow-up-Mail ("Last-Call"), ~2-3 Monate nach dem
// Briefversand. Reine Neugier-Mail: Hat sich das MdB gemeldet? Mag die
// Person ihre Geschichte teilen? Zwei CTAs (heyspeak-Sprachnachricht +
// Mail-Antwort), Share-Reihe wie in der Letter-Mail, prominenter
// Abschluss-Hinweis (allerletzte Mail, kein Newsletter, nichts gespeichert).
//
// Anders als buildFollowupHtml.ts braucht diese Mail KEINEN Feedback-Token:
// die CTAs sind ein heyspeak-Link und ein mailto, keine /feedback-Sterne.

const STORY_VOICE_URL = "https://www.heyspeak.io/l/_AkL8g0mlosEDTMU6vDxuA";
const STORY_REPLY_MAILTO =
  "mailto:thomas@visualmakers.de?subject=" +
  encodeURIComponent("Meine Brief-nach-Berlin-Geschichte");

export interface BuildLastcallParams {
  // Überschreibt die Basis-URL für absolute Links und Bild-Assets in der Mail.
  // Default: APP_URL aus config (prod). Für lokale Vorschau im npm run dev:
  // baseUrl: "http://localhost:3000" durchreichen, damit die Icon-Bilder aus
  // public/images/ statt aus prod gezogen werden.
  baseUrl?: string;
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

  const instagramUrl = `${base}/weitersagen#insta`;

  const text = [
    `Moin 👋`,
    ``,
    `Vor einer Weile hast du deinen Brief nach Berlin (${base}) geschrieben. Das hier ist meine letzte Mail an dich, aus reiner Neugier: Hast du auf deinen Brief eine Reaktion bekommen?`,
    ``,
    `Ich kenne inzwischen ein paar Geschichten, in denen Abgeordnete tatsächlich reagiert haben, per Mail, per Brief oder sogar direkt am Telefon. Solche Momente zeigen, dass sich das Schreiben lohnt, und ich würde sie gern sammeln.`,
    ``,
    `Hat sich dein MdB bei dir gemeldet? Und wie ging es dir mit dem Brief überhaupt? Auch ein ehrliches "nie was gehört" oder "doch nicht abgeschickt" hilft mir weiter.`,
    ``,
    `Sprachnachricht schicken: ${STORY_VOICE_URL}`,
    `Per Mail antworten:       thomas@visualmakers.de`,
    `(Foto vom Brief oder einer Antwort? Häng es gerne an.)`,
    ``,
    `Ich würde mich mega freuen, wenn du dich kurz meldest. Und falls deine Geschichte anderen Mut macht, magst du sie vielleicht weitertragen und andere damit anstecken.`,
    ``,
    `Weitersagen:`,
    `WhatsApp:  ${SHARE_URL_WHATSAPP}`,
    `Telegram:  ${SHARE_URL_TELEGRAM}`,
    `Instagram: ${instagramUrl}`,
    `E-Mail:    ${SHARE_URL_EMAIL}`,
    ``,
    `Tausend Dank, dass du dir die Zeit nimmst, für deinen Brief und vielleicht für deine Geschichte.`,
    `Beste Grüße aus Bremen`,
    ``,
    `Thomas`,
    `Eine Initiative von ${FOUNDER_HOMEPAGE}`,
    ``,
    `--`,
    `Das war meine allerletzte Mail an dich. Kein Newsletter, keine weitere Nachricht.`,
    `Es wird kein Brief und kein Inhalt gespeichert. Deine E-Mail-Adresse nutze ich nur für diese einmalige Nachfrage.`,
    `Datenschutz: ${base}/datenschutz · Adresse löschen: thomas_lorenz@posteo.de`,
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

          <!-- Title -->
          <tr>
            <td style="padding:28px 32px 22px;background-color:#ffffff;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;letter-spacing:0.5px;">Brief nach Berlin</h1>
              <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;">Eine letzte, neugierige Frage</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:8px 32px 8px;background-color:#ffffff;">
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">Moin 👋</p>
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Vor einer Weile hast du deinen <a href="${base}" style="color:#2D5016;text-decoration:underline;">Brief nach Berlin</a> geschrieben. Das hier ist meine letzte Mail an dich, aus reiner Neugier: Hast du auf deinen Brief eine Reaktion bekommen?
              </p>
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Ich kenne inzwischen ein paar Geschichten, in denen Abgeordnete tatsächlich reagiert haben, per Mail, per Brief oder sogar direkt am Telefon. Solche Momente zeigen, dass sich das Schreiben lohnt, und ich würde sie gern sammeln.
              </p>
              <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Hat sich <strong style="font-weight:700;color:#2D5016;">dein MdB</strong> bei dir gemeldet? Und wie ging es dir mit dem Brief überhaupt? Auch ein ehrliches "nie was gehört" oder "doch nicht abgeschickt" hilft mir weiter.
              </p>
            </td>
          </tr>

          <!-- Zwei CTA-Buttons: Sprachnachricht + Mail-Antwort -->
          <tr>
            <td style="padding:16px 32px 8px;background-color:#ffffff;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
                <tr>
                  <td class="lc-cta-cell" style="padding:0 6px 0 0;">
                    <a href="${STORY_VOICE_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#2D5016;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 22px;border-radius:6px;text-align:center;">🎙️ Sprachnachricht</a>
                  </td>
                  <td class="lc-cta-cell" style="padding:0 0 0 6px;">
                    <a href="${STORY_REPLY_MAILTO}" style="display:inline-block;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 22px;border-radius:6px;border:2px solid #2D5016;text-align:center;">✉️ Per Mail antworten</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 16px;background-color:#ffffff;text-align:center;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#999999;line-height:1.6;">Foto vom Brief oder einer Antwort? Häng es gerne an.</p>
            </td>
          </tr>

          <!-- Sign-off + Caveat-Handschrift -->
          <tr>
            <td style="padding:8px 32px 24px;background-color:#ffffff;text-align:left;">
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Ich würde mich mega freuen, wenn du dich kurz meldest. Und falls deine Geschichte anderen Mut macht, magst du sie vielleicht weitertragen und andere damit anstecken.
              </p>
              <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Tausend Dank, dass du dir die Zeit nimmst, für deinen Brief und vielleicht für deine Geschichte.<br>Beste Grüße aus Bremen
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
                  Briefe aus dem gleichen Wahlkreis bekommen im Bundestag mehr Gewicht. Teile Brief nach Berlin supergerne in deinem Umfeld (<a href="${base}/weitersagen" style="color:#2D5016;text-decoration:underline;">mehr Infos</a>).
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

          <!-- Footer: prominenter Abschluss-Hinweis -->
          <tr>
            <td style="padding:20px 32px 24px;background-color:#FAF8F5;text-align:center;">
              <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#777777;line-height:1.6;">
                <strong style="color:#2D5016;">Das war meine allerletzte Mail an dich.</strong> Kein Newsletter, keine weitere Nachricht.
              </p>
              <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;line-height:1.6;">
                Es wird kein Brief und kein Inhalt gespeichert. Deine E-Mail-Adresse nutze ich nur für diese einmalige Nachfrage.
              </p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#aaaaaa;line-height:1.5;">
                <a href="${base}/datenschutz" style="color:#888888;">Datenschutz</a> · <a href="mailto:thomas_lorenz@posteo.de?subject=Brief%20nach%20Berlin%3A%20Adresse%20l%C3%B6schen&body=Hallo%20Thomas%2C%0A%0Abitte%20l%C3%B6sche%20meine%20E-Mail-Adresse%20aus%20deinen%20Followup-Listen.%0A%0ADanke!" style="color:#888888;">Adresse löschen</a>
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
