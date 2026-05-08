import type { SendLetterEmailParams, LetterDebugPayload } from "./sendLetterEmail";
import {
  APP_URL,
  WIZARD_PATH,
  WIZARD_TEXT_PARAM_MAX_LENGTH,
  SHARE_TEXT_CAUSE,
  FOUNDER_HOMEPAGE,
  FOUNDER_FEEDBACK_URL,
  abgeordnetenwatchProfileUrl,
} from "@/lib/config";

function buildDebugUrl(d: LetterDebugPayload): string {
  // base64url-encode JSON payload so it survives URLs without padding/+/ issues
  const json = JSON.stringify(d);
  const b64 = Buffer.from(json, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${APP_URL}/debug?d=${b64}`;
}

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

  // Profile link (Abgeordnetenwatch: voting record, public Q&A, transparent source).
  // Prefer the API-provided URL; fall back to a slug-derived URL.
  const profileUrl =
    data.politicianAbgeordnetenwatchUrl ??
    abgeordnetenwatchProfileUrl(
      data.politicianFirstName,
      data.politicianLastName
    );

  // Cause-recruit shares (motivate recipient to write their own letter)
  const causeText = encodeURIComponent(SHARE_TEXT_CAUSE);
  const whatsappUrl = `https://wa.me/?text=${causeText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${causeText}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent("Schreibst du auch einen Brief nach Berlin?")}&body=${causeText}`;

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
                      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">Hier ist dein Briefentwurf. Lies ihn gründlich durch und pass ihn an, damit es <em style="font-style:italic;">dein Brief</em> wird. Wir bieten dir einen Schnellstart, damit dein Anliegen ratzfatz auf dem richtigen Schreibtisch landet.<br>Riesen Dankeschön, dass du dich engagierst!</p>
                    </div>
                  </td>
                </tr>

                <!-- Brief block (D-08, section 1) -->
                <tr>
                  <td colspan="7" style="padding:0 32px 8px;background-color:#ffffff;">
                    <div style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:24px;">
                      <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.7;color:#4A4A4A;white-space:pre-wrap;">${letterHtml}</p>
                    </div>
                  </td>
                </tr>

                <!-- Postadresse (D-08, section 2) -->
                <tr>
                  <td colspan="7" style="padding:16px 32px 24px;background-color:#ffffff;">
                    <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Adresse</h2>
                    <div style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:16px 20px;">
                      <p style="margin:0 0 10px;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.8;color:#4A4A4A;">
                        <strong>${fullName}, MdB</strong><br>
                        Deutscher Bundestag<br>
                        ${addressLines}
                      </p>
                      <p style="margin:0;padding-top:10px;border-top:1px solid #E0DCD7;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.5;">
                        <a href="${profileUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:none;font-weight:bold;">Profil auf abgeordnetenwatch ansehen <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;display:inline-block;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Empfehlung: Brief von Hand abschreiben (sets the frame before the steps) -->
                <tr>
                  <td colspan="7" style="padding:0 32px 20px;background-color:#ffffff;">
                    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#333333;font-weight:bold;">Unsere Empfehlung: Brief von Hand abschreiben</p>
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">Handgeschriebene Briefe werden im Bundestag tatsächlich gelesen und besprochen. Sie signalisieren echtes persönliches Engagement und werden nicht wie Massenpost behandelt. Die Handschrift macht deinen Brief unverwechselbar persönlich.</p>
                  </td>
                </tr>

                <!-- Naechste Schritte (D-08, section 3) -->
                <tr>
                  <td colspan="7" style="padding:0 32px 24px;background-color:#ffffff;">
                    <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Nächste Schritte</h2>

                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">1</span>
                          Brief von Hand abschreiben (oder ausdrucken)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">2</span>
                          Empfangs-Adresse mittig auf den Umschlag schreiben
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">3</span>
                          Eigene Absende-Adresse oben links eintragen
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">4</span>
                          <a href="https://www.deutschepost.de/de/m/mobile-briefmarke.html" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">Briefmarke aufkleben</a> (aktuell 0,95 EUR für Standardbrief)
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

                <!-- Personal sign-off from Thomas (handwritten Caveat) -->
                <tr>
                  <td colspan="7" style="padding:8px 32px 16px;background-color:#ffffff;text-align:left;">
                    <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                      Toll, dass du dir die Zeit für unsere Demokratie nimmst. Melde dich super gerne bei Fragen oder weiteren Anregungen. Beste Grüße aus Bremen ✌️
                    </p>
                    <p style="margin:0;font-family:'Caveat','Brush Script MT','Lucida Handwriting',cursive;font-size:32px;color:#1D3557;line-height:1.1;">
                      Thomas
                    </p>
                    <p style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#bcbcbc;line-height:1.5;">
                      Eine Initiative von <a href="${FOUNDER_HOMEPAGE}" target="_blank" rel="noopener noreferrer" style="color:#bcbcbc;text-decoration:underline;">www.thomas-lorenz.eu</a>
                    </p>
                  </td>
                </tr>

                <!-- Action buttons: stretched two-column row, equal width -->
                <tr>
                  <td colspan="7" style="padding:8px 32px 20px;background-color:#ffffff;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;">
                      <tr>
                        <td style="padding-right:6px;width:50%;" valign="top">
                          <a href="${regenerateUrl}" style="display:block;text-align:center;background-color:#2D5016;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 16px;border-radius:6px;border:2px solid #2D5016;">Neuen Brief schreiben</a>
                        </td>
                        <td style="padding-left:6px;width:50%;" valign="top">
                          <a href="${FOUNDER_FEEDBACK_URL}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 16px;border-radius:6px;border:2px solid #2D5016;">Feedback &amp; Anregungen</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Cause-recruit block: motivate sender to invite Wahlkreis-people to write their own letters -->
                <tr>
                  <td colspan="7" style="padding:8px 32px 24px;background-color:#ffffff;">
                    <div style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:20px 22px;">
                      <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Gemeinsam noch lauter</h2>
                      <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                        Dein Brief wirkt. Und er wirkt noch stärker, wenn weitere Stimmen aus deinem Wahlkreis dazukommen. Briefe aus derselben Gegend zum gleichen Thema bekommen im Bundestag besonderes Gewicht.<br><br>
                        Wer regt sich noch gerne über die Zustände auf? Teile Brief-nach-Berlin per…
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding-right:6px;width:34%;" valign="top">
                            <a href="${whatsappUrl}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 8px;border-radius:6px;border:2px solid #2D5016;">WhatsApp</a>
                          </td>
                          <td style="padding:0 3px;width:33%;" valign="top">
                            <a href="${telegramUrl}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 8px;border-radius:6px;border:2px solid #2D5016;">Telegram</a>
                          </td>
                          <td style="padding-left:6px;width:33%;" valign="top">
                            <a href="${emailShareUrl}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 8px;border-radius:6px;border:2px solid #2D5016;">E-Mail</a>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Airmail stripe before footer (mirrors header) -->
                <tr>
                  <td colspan="7" style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td colspan="7" style="padding:24px 32px 16px;background-color:#FAF8F5;text-align:center;">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;">
                      <a href="${APP_URL}" style="color:#2D5016;text-decoration:none;">Brief nach Berlin</a> · Deine Stimme zählt.
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
                      Bitte prüfe Politikerdaten und Brieftext vor dem Versand anhand offizieller Quellen (<a href="${profileUrl}" target="_blank" rel="noopener noreferrer" style="color:#888888;">abgeordnetenwatch.de</a>, <a href="https://www.bundestag.de" style="color:#888888;">bundestag.de</a>, Landtags- oder Rathauswebsite).
                    </p>
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#aaaaaa;line-height:1.5;">
                      <a href="${APP_URL}/datenschutz" style="color:#888888;">Datenschutzerklärung</a>: deine Daten werden nach Versand dieser E-Mail nicht gespeichert.${data.debug ? ` · <a href="${buildDebugUrl(data.debug)}" style="color:#888888;text-decoration:none;">Debug</a>` : ""}
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
