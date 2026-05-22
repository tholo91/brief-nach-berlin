import {
  APP_URL,
  FOUNDER_HOMEPAGE,
  SHARE_URL_WHATSAPP,
  SHARE_URL_TELEGRAM,
  SHARE_URL_EMAIL,
} from "@/lib/config";
import { buildStarBarHtml } from "./buildEmailHtml";

export interface BuildFollowupParams {
  token: string;
  politicianName?: string;
  // Overrides die Basis-URL für absolute Links und Bild-Assets in der Mail.
  // Default: APP_URL aus config (prod). Für lokale Vorschau im npm run dev:
  // baseUrl: "http://localhost:3000" durchreichen, damit das Envelope-Bild
  // aus public/images/ statt aus prod gezogen wird.
  baseUrl?: string;
}

export interface FollowupRender {
  subject: string;
  html: string;
  text: string;
}

export function buildFollowupHtml(params: BuildFollowupParams): FollowupRender {
  const { token } = params;
  const base = params.baseUrl ?? APP_URL;

  const subject = "Wie fandest du deinen Brief?";

  const text = [
    `Moin 👋`,
    ``,
    `Vor ein paar Tagen hast du deinen Brief nach Berlin (${base}) erstellt und das freut mich sehr. Ich hoffe, du hast ihn in deinem Stil personalisiert und handgeschrieben bereits eingeworfen?`,
    ``,
    `Wichtig für die Zukunft des Projekts ist das Feedback von Menschen wie dir: Wie hat dir dein Brief gefallen? Sei bitte schonungslos ehrlich bei Kritik, gerne aber auch bei Lob 😉`,
    ``,
    `1 Stern: ${base}/feedback?r=1&t=${token}`,
    `2 Sterne: ${base}/feedback?r=2&t=${token}`,
    `3 Sterne: ${base}/feedback?r=3&t=${token}`,
    `4 Sterne: ${base}/feedback?r=4&t=${token}`,
    `5 Sterne: ${base}/feedback?r=5&t=${token}`,
    ``,
    `Falls du schon deinen Brief bewertet hast, kannst du diese Mail ignorieren.`,
    `Tausend Dank dir und beste Grüße aus Bremen`,
    ``,
    `Thomas`,
    `${FOUNDER_HOMEPAGE}`,
    ``,
    `--`,
    `Gemeinsam noch lauter: Briefe aus dem gleichen Wahlkreis bekommen im Bundestag mehr Gewicht. Teile Brief nach Berlin supergerne in deinem Umfeld: ${base}/weitersagen`,
    `WhatsApp: ${SHARE_URL_WHATSAPP}`,
    `Telegram: ${SHARE_URL_TELEGRAM}`,
    `E-Mail:   ${SHARE_URL_EMAIL}`,
    ``,
    `--`,
    `Einmalige automatische Nachfrage an Brief-Schreiber:innen. Kein Newsletter, kein Marketing, keine weiteren automatischen Mails von dieser Adresse.`,
    `Datenschutz: ${base}/datenschutz`,
    `Fragen oder Adresse löschen: thomas_lorenz@posteo.de`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap" rel="stylesheet">
  <title>${subject}</title>
  <style>
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
    Dein Feedback mit nur 1 Klick, hilft mir sehr bei der Weiterentwicklung.
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
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;letter-spacing:0.5px;">Brief nach Berlin</h1>
                    <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;">Wie fandest du deinen Brief?</p>
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
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">Moin 👋</p>
              <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Vor ein paar Tagen hast du deinen <a href="${base}" style="color:#2D5016;text-decoration:underline;">Brief nach Berlin</a> erstellt und das freut mich sehr. Ich hoffe, du hast ihn in deinem Stil personalisiert und handgeschrieben bereits eingeworfen?
              </p>
              <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Wichtig für die Zukunft des Projekts ist das <strong style="font-weight:700;color:#2D5016;">Feedback von Menschen wie dir</strong>: Wie hat dir dein Brief gefallen? Sei bitte schonungslos ehrlich bei Kritik, gerne aber auch bei Lob 😉
              </p>
            </td>
          </tr>

          <!-- Star bar, centered -->
          <tr>
            <td style="padding:8px 32px 20px;background-color:#ffffff;text-align:center;">
              <div style="display:inline-block;background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:18px 24px;">
                ${buildStarBarHtml(token)}
              </div>
            </td>
          </tr>

          <!-- Sign-off paragraph + Caveat signature -->
          <tr>
            <td style="padding:16px 32px 24px;background-color:#ffffff;text-align:left;">
              <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">
                Falls du schon deinen Brief bewertet hast, kannst du diese Mail ignorieren.<br>
                Tausend Dank dir und beste Grüße aus Bremen
              </p>
              <p style="margin:0;font-family:'Caveat','Brush Script MT','Lucida Handwriting',cursive;font-size:32px;color:#1D3557;line-height:1.1;">
                Thomas
              </p>
              <p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#bcbcbc;line-height:1.5;">
                Eine Initiative von <a href="${FOUNDER_HOMEPAGE}" target="_blank" rel="noopener noreferrer" style="color:#bcbcbc;text-decoration:underline;">www.thomas-lorenz.eu</a>
              </p>
            </td>
          </tr>

          <!-- Share container -->
          <tr>
            <td style="padding:8px 32px 24px;background-color:#ffffff;">
              <div style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:20px 22px;">
                <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Gemeinsam noch lauter</h2>
                <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                  Briefe aus dem gleichen Wahlkreis bekommen im Bundestag mehr Gewicht. Teile Brief nach Berlin supergerne in deinem Umfeld (<a href="${base}/weitersagen" style="color:#2D5016;text-decoration:underline;">mehr Infos</a>).
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-right:6px;width:34%;" valign="top">
                      <a href="${SHARE_URL_WHATSAPP}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 8px;border-radius:6px;border:2px solid #2D5016;">WhatsApp</a>
                    </td>
                    <td style="padding:0 3px;width:33%;" valign="top">
                      <a href="${SHARE_URL_TELEGRAM}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 8px;border-radius:6px;border:2px solid #2D5016;">Telegram</a>
                    </td>
                    <td style="padding-left:6px;width:33%;" valign="top">
                      <a href="${SHARE_URL_EMAIL}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 8px;border-radius:6px;border:2px solid #2D5016;">E-Mail</a>
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
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;">
                <a href="${APP_URL}" style="color:#2D5016;text-decoration:none;">Brief nach Berlin</a> · Deine Stimme zählt.
              </p>
              <p style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#aaaaaa;line-height:1.5;">
                Einmalige automatische Nachfrage an Brief-Schreiber:innen.<br>
                Kein Newsletter, kein Marketing, keine weiteren automatischen Mails von dieser Adresse.<br>
                <a href="${APP_URL}/datenschutz" style="color:#888888;">Datenschutz</a> · <a href="mailto:thomas_lorenz@posteo.de?subject=Brief%20nach%20Berlin%3A%20Adresse%20l%C3%B6schen" style="color:#888888;">Fragen oder Adresse löschen</a>
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
