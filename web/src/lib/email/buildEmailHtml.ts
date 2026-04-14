import type { SendLetterEmailParams } from "./sendLetterEmail";

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
  const maxTextLength = 1500;
  const truncatedText =
    data.issueText.length > maxTextLength
      ? data.issueText.slice(0, maxTextLength) + "..."
      : data.issueText;
  const regenerateUrl = `https://brief-nach-berlin.de/app?text=${encodeURIComponent(truncatedText)}`;

  // Share text for WhatsApp and Twitter buttons (D-09)
  const shareText = encodeURIComponent(
    "Ich habe gerade einen Brief an meinen Abgeordneten geschrieben \u2014 in unter 3 Minuten. Probier es selbst: https://brief-nach-berlin.de"
  );
  const whatsappUrl = `https://wa.me/?text=${shareText}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  // Letter text: escape then convert newlines to <br> for email clients
  const letterHtml = nlToBr(data.letterText);

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]>
  <style>td { font-family: 'Courier New', Courier, monospace !important; }</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:20px 0;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">

          <!-- Airmail stripe header (D-06): alternating red/white/blue cells -->
          <tr>
            <td style="height:8px;width:20%;background-color:#C62828;font-size:0;line-height:0;">&nbsp;</td>
            <td style="height:8px;width:10%;background-color:#ffffff;font-size:0;line-height:0;">&nbsp;</td>
            <td style="height:8px;width:20%;background-color:#1565C0;font-size:0;line-height:0;">&nbsp;</td>
            <td style="height:8px;width:10%;background-color:#ffffff;font-size:0;line-height:0;">&nbsp;</td>
            <td style="height:8px;width:20%;background-color:#C62828;font-size:0;line-height:0;">&nbsp;</td>
            <td style="height:8px;width:10%;background-color:#ffffff;font-size:0;line-height:0;">&nbsp;</td>
            <td style="height:8px;width:10%;background-color:#1565C0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Title: "Brief nach Berlin" -->
          <tr>
            <td colspan="7" style="padding:28px 32px 16px;text-align:center;background-color:#ffffff;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;letter-spacing:0.5px;">Brief nach Berlin</h1>
              <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;">Dein Brief ist fertig zum Absenden.</p>
            </td>
          </tr>

          <!-- Brief block (D-08, section 1) -->
          <tr>
            <td colspan="7" style="padding:0 32px 24px;background-color:#ffffff;">
              <div style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:24px;">
                <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;text-transform:uppercase;letter-spacing:1px;">Dein generierter Brief</p>
                <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.7;color:#4A4A4A;white-space:pre-wrap;">${letterHtml}</p>
              </div>
            </td>
          </tr>

          <!-- Postadresse (D-08, section 2) -->
          <tr>
            <td colspan="7" style="padding:0 32px 24px;background-color:#ffffff;">
              <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Postadresse</h2>
              <div style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:16px 20px;">
                <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.8;color:#4A4A4A;">
                  <strong>${fullName}</strong><br>
                  ${addressLines}
                </p>
              </div>
              <p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#666666;">Diese Adresse auf den Umschlag schreiben (mittig, als Empfaenger).</p>
            </td>
          </tr>

          <!-- Naechste Schritte (D-08, section 3) -->
          <tr>
            <td colspan="7" style="padding:0 32px 24px;background-color:#ffffff;">
              <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Naechste Schritte</h2>

              <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#333333;font-weight:bold;">Empfehlung: Brief von Hand abschreiben</p>
              <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">Handgeschriebene Briefe werden im Bundestag tatsaechlich gelesen und besprochen. Sie signalisieren echtes persoenliches Engagement und werden nicht wie Massenpost behandelt. Die Handschrift macht Ihren Brief unverwechselbar persoenlich.</p>
              <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;line-height:1.6;">Sie koennen den Brief auch ausdrucken &mdash; das ist immer noch besser als gar nichts.</p>

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
                    Empfaenger-Adresse mittig auf den Umschlag schreiben
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
                    Briefmarke aufkleben (aktuell 0,95 EUR fuer Standardbrief)
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

          <!-- Disclaimer (D-08, section 4) -->
          <tr>
            <td colspan="7" style="padding:0 32px 24px;background-color:#ffffff;">
              <div style="border-top:1px solid #E0DCD7;padding-top:16px;">
                <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;line-height:1.6;">
                  <strong>Hinweis:</strong> Brief nach Berlin nutzt kuenstliche Intelligenz zur Brieferstellung. KI kann Fehler machen. Bitte pruefen Sie Politikerdaten und Brieftext vor dem Versand anhand offizieller Quellen
                  (<a href="https://www.bundestag.de" style="color:#2D5016;">bundestag.de</a>, Landtags- oder Rathauswebsite).
                </p>
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;line-height:1.6;">
                  <a href="https://brief-nach-berlin.de/datenschutz" style="color:#2D5016;">Datenschutzerklaerung</a> &mdash; Ihre Daten werden nach Versand dieser E-Mail nicht gespeichert.
                </p>
              </div>
            </td>
          </tr>

          <!-- Action buttons (D-08, section 5 / D-09) -->
          <tr>
            <td colspan="7" style="padding:0 32px 32px;background-color:#ffffff;">
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

          <!-- Footer -->
          <tr>
            <td colspan="7" style="padding:16px 32px 24px;background-color:#FAF8F5;border-top:1px solid #E0DCD7;text-align:center;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;">
                <a href="https://brief-nach-berlin.de" style="color:#2D5016;text-decoration:none;">Brief nach Berlin</a> &mdash; Deine Stimme zaehlt.
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
