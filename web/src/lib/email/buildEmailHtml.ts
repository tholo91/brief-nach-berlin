import type { SendLetterEmailParams } from "./sendLetterEmail";
import {
  APP_URL,
  WIZARD_PATH,
  WIZARD_TEXT_PARAM_MAX_LENGTH,
  SHARE_TEXT,
} from "@/lib/config";

// Escape HTML entities to prevent HTML injection in email (T-03-02)
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Convert newlines to <br> for Outlook compatibility (RESEARCH.md pitfall 2 / assumption A5)
function nlToBr(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

export function buildEmailHtml(data: SendLetterEmailParams): string {
  const fullName = data.politicianTitle
    ? `${escapeHtml(data.politicianTitle)} ${escapeHtml(data.politicianName)}`
    : escapeHtml(data.politicianName);

  // Format postal address: split on comma, one part per line
  const addressLines = data.politicianPostalAddress
    .split(",")
    .map((part) => escapeHtml(part.trim()))
    .join("<br>");

  // URL-encode issueText for "Neuen Brief schreiben" link (T-03-03, pitfall 3)
  const truncatedText =
    data.issueText.length > WIZARD_TEXT_PARAM_MAX_LENGTH
      ? data.issueText.slice(0, WIZARD_TEXT_PARAM_MAX_LENGTH) + "..."
      : data.issueText;
  const regenerateUrl = `${APP_URL}${WIZARD_PATH}?text=${encodeURIComponent(truncatedText)}`;

  // Share text for WhatsApp and Twitter buttons (D-09): single source of truth in config.ts
  const shareText = encodeURIComponent(SHARE_TEXT);
  const whatsappUrl = `https://wa.me/?text=${shareText}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  // Letter text: escape then convert newlines to <br> for email clients
  const letterHtml = nlToBr(data.letterText);

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap" rel="stylesheet">
  <!--[if mso]>
  <style>td { font-family: 'Courier New', Courier, monospace !important; }</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:20px 0;">

        <!-- Outer 2-column wrapper: vertical airmail stripe + content -->
        <table role="presentation" width="608" cellpadding="0" cellspacing="0" style="max-width:608px;width:100%;border-collapse:collapse;">
          <tr>
            <!-- Vertical airmail stripe (left edge): solid red fallback for Outlook/Gmail; gradient for modern clients -->
            <td valign="top" width="8" bgcolor="#C1121F" style="width:8px;font-size:0;line-height:0;background:repeating-linear-gradient(180deg,#C1121F 0 14px,#FAF8F5 14px 18px,#1D3557 18px 32px,#FAF8F5 32px 36px);">&nbsp;</td>

            <!-- Content column -->
            <td valign="top" style="padding:0;">

              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">

                <!-- Airmail stripe header (D-06): thin diagonal red/white/blue like landing page -->
                <tr>
                  <td colspan="7" style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
                </tr>

                <!-- Title: "Brief nach Berlin" -->
                <tr>
                  <td colspan="7" style="padding:28px 32px 16px;text-align:center;background-color:#ffffff;">
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;letter-spacing:0.5px;">Brief nach Berlin</h1>
                    <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;">Dein Brief ist fertig zum Absenden.</p>
                  </td>
                </tr>

                <!-- Intro: warm founder voice, no AI mention -->
                <tr>
                  <td colspan="7" style="padding:0 32px 20px;background-color:#ffffff;">
                    <div style="border-left:3px solid rgba(45,80,22,0.45);padding-left:16px;">
                      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;font-style:italic;">Hier ist dein Briefentwurf. Lies ihn gründlich durch, bevor du ihn abschreibst, und pass ihn an, damit es dein Brief wird. Formulierungen, Ton, einzelne Argumente: alles darf von dir kommen. Wir helfen dir hoffentlich, damit dein Anliegen schneller auf dem richtigen Schreibtisch landet. Danke, dass du dich engagierst.</p>
                    </div>
                  </td>
                </tr>

                <!-- Brief block (D-08, section 1) -->
                <tr>
                  <td colspan="7" style="padding:0 32px 8px;background-color:#ffffff;">
                    <div style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:24px;">
                      <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.7;color:#4A4A4A;white-space:pre-wrap;">${letterHtml}</p>
                    </div>
                    <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#999999;font-style:italic;line-height:1.5;">
                      Lieber per Hand abschreiben. Aber wenn du den Text zwischendurch in Word brauchst: ins Feld klicken, Cmd/Strg + A, dann Cmd/Strg + C.
                    </p>
                  </td>
                </tr>

                <!-- Postadresse (D-08, section 2) -->
                <tr>
                  <td colspan="7" style="padding:16px 32px 24px;background-color:#ffffff;">
                    <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Empfänger (auf den Umschlag)</h2>
                    <div style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:16px 20px;">
                      <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.8;color:#4A4A4A;">
                        <strong>${fullName}, MdB</strong><br>
                        Deutscher Bundestag<br>
                        ${addressLines}
                      </p>
                    </div>
                    <p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#666666;">Vergiss nicht, deine eigene Adresse oben links auf den Umschlag und oben rechts in den Brief zu schreiben.</p>
                  </td>
                </tr>

                <!-- Naechste Schritte (D-08, section 3) -->
                <tr>
                  <td colspan="7" style="padding:0 32px 24px;background-color:#ffffff;">
                    <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Nächste Schritte</h2>

                    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#333333;font-weight:bold;">Empfehlung: Brief von Hand abschreiben</p>
                    <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">Handgeschriebene Briefe werden im Bundestag tatsächlich gelesen und besprochen. Sie signalisieren echtes persönliches Engagement und werden nicht wie Massenpost behandelt. Die Handschrift macht Ihren Brief unverwechselbar persönlich.</p>
                    <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;line-height:1.6;">Sie können den Brief auch ausdrucken. Das ist immer noch besser als gar nichts.</p>

                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">1</span>
                          Brief von Hand abschreiben oder ausdrucken
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">2</span>
                          Empfänger-Adresse mittig auf den Umschlag schreiben
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">3</span>
                          Eigene Adresse oben links als Absender eintragen
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">4</span>
                          Briefmarke aufkleben (aktuell 0,95 EUR für Standardbrief)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">5</span>
                          Ab in den Briefkasten!
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Action buttons (D-08, section 5 / D-09) -->
                <tr>
                  <td colspan="7" style="padding:0 32px 24px;background-color:#ffffff;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom:12px;">
                          <!-- "Neuen Brief schreiben" (primary) -->
                          <a href="${regenerateUrl}" style="display:inline-block;background-color:#2D5016;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:6px;">Neuen Brief schreiben</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:12px;">
                          <!-- "Brief nach Berlin teilen" via WhatsApp -->
                          <a href="${whatsappUrl}" style="display:inline-block;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:6px;border:2px solid #2D5016;">Brief nach Berlin teilen (WhatsApp)</a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <!-- "Teilen auf X" via Twitter -->
                          <a href="${twitterUrl}" style="display:inline-block;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:6px;border:2px solid #2D5016;">Teilen auf X</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Personal sign-off from Thomas (handwritten Caveat) -->
                <tr>
                  <td colspan="7" style="padding:0 32px 24px;background-color:#ffffff;text-align:left;">
                    <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                      Vielen Dank, dass du schreibst.
                    </p>
                    <p style="margin:0;font-family:'Caveat','Brush Script MT','Lucida Handwriting',cursive;font-size:32px;color:#1D3557;line-height:1.1;">
                      Thomas
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td colspan="7" style="padding:16px 32px 24px;background-color:#FAF8F5;border-top:1px solid #E0DCD7;text-align:center;">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;">
                      <a href="https://brief-nach-berlin.de" style="color:#2D5016;text-decoration:none;">Brief nach Berlin</a> · Deine Stimme zählt.
                    </p>
                  </td>
                </tr>

                <!-- Legal / disclaimer block (smaller, below footer) -->
                <tr>
                  <td colspan="7" style="padding:8px 32px 24px;background-color:#FAF8F5;text-align:center;">
                    <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#aaaaaa;line-height:1.5;">
                      <strong>Hinweis:</strong> Dieser Brief ist ein generierter Entwurf, keine Meinungsäußerung von Brief nach Berlin. Wir empfehlen, ihn an deinen eigenen Stil und deine persönliche Haltung anzupassen, bevor du ihn verschickst. Die Verantwortung für den Inhalt liegt bei dir.
                    </p>
                    <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#aaaaaa;line-height:1.5;">
                      Bitte prüfe Politikerdaten und Brieftext vor dem Versand anhand offizieller Quellen (<a href="https://www.bundestag.de" style="color:#888888;">bundestag.de</a>, Landtags- oder Rathauswebsite).
                    </p>
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#aaaaaa;line-height:1.5;">
                      <a href="https://brief-nach-berlin.de/datenschutz" style="color:#888888;">Datenschutzerklärung</a>: deine Daten werden nach Versand dieser E-Mail nicht gespeichert.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
