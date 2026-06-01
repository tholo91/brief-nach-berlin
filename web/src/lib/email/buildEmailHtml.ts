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
import { formatPartyShort } from "@/lib/formatParty";

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

// Email-client-safe star rating bar. Used inside the Postadresse box
// (replacing the static abgeordnetenwatch profile button). Each star is
// its own anchor pointing at /feedback with the chosen rating; no JS,
// no hover state (mail clients strip :hover).
//
// Visual: 3 gold-filled + 2 gold-outlined stars. The neutral midpoint
// invites a "besser/schlechter"-Polarität — leaving it as 4/5 made the
// rating look already-decided. The form on /feedback prefills with
// whichever star was clicked and lets the user change it.
export function buildStarBarHtml(token: string): string {
  const url = (n: number) => `${APP_URL}/feedback?r=${n}&t=${token}`;
  // Padding bumped to clear the 44pt iOS HIG tap target on mobile mail.
  const star = (n: number, glyph: "filled" | "outline") => `
    <a href="${url(n)}" target="_blank" rel="noopener noreferrer"
       style="color:#D4A017;mso-color-alt:#D4A017;text-decoration:none;font-size:26px;line-height:1;padding:8px 4px;display:inline-block;">${glyph === "filled" ? "&#9733;" : "&#9734;"}</a>`;
  return `
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#2D5016;font-weight:bold;">Wie findest du<br>deinen Brief?</p>
    <div style="white-space:nowrap;line-height:1;">${star(1, "filled")}${star(2, "filled")}${star(3, "filled")}${star(4, "outline")}${star(5, "outline")}</div>
    <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#b0b0b0;line-height:1.4;">Dauert 10 Sek, hilft mir sehr</p>`;
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
  const party = escapeHtml(formatPartyShort(data.politicianParty));

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
  <style>
    @media only screen and (max-width: 600px) {
      .bnb-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .bnb-inner-pad { padding-left: 14px !important; padding-right: 14px !important; }
      .bnb-stack { display: block !important; width: 100% !important; }
      .bnb-stack-left { padding: 0 0 14px 0 !important; width: 100% !important; }
      .bnb-stack-right { padding: 14px 0 0 0 !important; border-left: 0 !important; border-top: 1px solid #E0DCD7 !important; width: 100% !important; text-align: center !important; }
      .bnb-bleed { margin-left: -14px !important; margin-right: -14px !important; }
    }
  </style>
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

                <!-- Title: "Brief nach Berlin". Watermark wandert in den Brief-Kasten als Briefmarke. -->
                <tr>
                  <td colspan="7" class="bnb-pad" bgcolor="#ffffff" style="padding:28px 32px 28px;text-align:center;background-color:#ffffff;">
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;letter-spacing:0.5px;">Brief nach Berlin</h1>
                    <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;">Dein Briefentwurf ist fertig zum Absenden.</p>
                  </td>
                </tr>

                <!-- Intro: warm founder voice -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:0 32px 20px;background-color:#ffffff;">
                    <div style="border-left:3px solid rgba(45,80,22,0.45);padding-left:16px;">
                      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#4A4A4A;line-height:1.75;">Lies ihn gründlich durch und pass ihn an, damit es dein Brief wird. Dieser Entwurf dient als Schnellstart, <a href="${APP_URL}/brief-verbessern" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">verbessere ihn gern</a>, damit er sich wirklich nach dir anhört.<br>Bitte bewerte anschließend deinen Brief 🙏 Danke, dass du dich engagierst!</p>
                    </div>
                  </td>
                </tr>

                <!-- Brief block (D-08, section 1) — Briefmarke oben rechts, Text fließt drumherum.
                     align="right" floatet das Bild zuverlässig in allen Mail-Clients; Opacity ist
                     in die PNG eingebrannt (~80%), weil CSS opacity in Outlook nicht greift. -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:0 32px 8px;background-color:#ffffff;">
                    <div class="bnb-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:24px;">
                      <img src="${APP_URL}/images/email-title-watermark.png" width="110" height="110" alt="" align="right" style="display:inline-block;width:110px;height:110px;margin:0 0 6px 14px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                      <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.7;color:#4A4A4A;white-space:pre-wrap;">${letterHtml}</p>
                    </div>
                  </td>
                </tr>

                <!-- Postadresse (D-08, section 2): name links to abgeordnetenwatch,
                     right column hosts the star-rating widget instead of a static profile button. -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:16px 32px 24px;background-color:#ffffff;">
                    <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Adresse</h2>
                    <div class="bnb-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:16px 20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td class="bnb-stack bnb-stack-left" style="vertical-align:top;padding-right:16px;width:60%;">
                            <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.8;color:#4A4A4A;">
                              <strong><a href="${profileUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${fullName}, MdB (${party})</a></strong><br>
                              Deutscher Bundestag<br>
                              ${addressLines}
                            </p>
                          </td>
                          <td class="bnb-stack bnb-stack-right" style="vertical-align:middle;text-align:center;padding-left:16px;border-left:1px solid #E0DCD7;width:40%;">
                            ${data.feedbackToken ? buildStarBarHtml(data.feedbackToken) : `<a href="${profileUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#2D5016;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 14px;border-radius:4px;line-height:1.5;text-align:center;">Profil auf<br>abgeordnetenwatch</a>`}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Naechste Schritte (D-08, section 3) -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:0 32px 24px;background-color:#ffffff;">
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
                          Empfangs-Adresse mittig auf den Umschlag
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
                          <a href="https://www.deutschepost.de/de/m/mobile-briefmarke.html" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">Briefmarke aufkleben</a> (aktuell 0,95 EUR)
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
                  <td colspan="7" class="bnb-pad" style="padding:8px 32px 16px;background-color:#ffffff;text-align:left;">
                    <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                      Handgeschriebene Briefe werden im Bundestag tatsächlich gelesen und besprochen. Sie signalisieren echtes persönliches Engagement und werden nicht wie Massenpost behandelt. &rarr; <a href="${APP_URL}/tipps" style="color:#2D5016;text-decoration:underline;">Tipps für den perfekten Brief</a>
                    </p>
                    <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                      Toll, dass du dir die Zeit für unsere Demokratie nimmst. Melde dich super gerne bei <a href="${FOUNDER_FEEDBACK_URL}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">Fragen oder weiteren Anregungen</a>. Beste Grüße aus Bremen ✌️
                    </p>
                    <p style="margin:0;font-family:'Caveat','Brush Script MT','Lucida Handwriting',cursive;font-size:32px;color:#1D3557;line-height:1.1;">
                      Thomas
                    </p>
                    <p style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#bcbcbc;line-height:1.5;">
                      Eine Initiative von <a href="${FOUNDER_HOMEPAGE}" target="_blank" rel="noopener noreferrer" style="color:#bcbcbc;text-decoration:underline;">www.thomas-lorenz.eu</a> · <a href="${APP_URL}/aktiv-werden" target="_blank" rel="noopener noreferrer" style="color:#bcbcbc;text-decoration:underline;">Was du sonst noch tun kannst</a>
                    </p>
                  </td>
                </tr>

                <!-- Action buttons: stretched two-column row, equal width.
                     Both labels are forced to two lines via <br> so the buttons always match
                     in height — min-height on <a> is unreliable in Outlook / Gmail. -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:8px 32px 20px;background-color:#ffffff;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;">
                      <tr>
                        <td style="padding-right:6px;width:50%;" valign="top">
                          <a href="${regenerateUrl}" style="display:block;text-align:center;background-color:#2D5016;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 16px;border-radius:6px;border:2px solid #2D5016;line-height:1.3;">Neuen Brief<br>schreiben</a>
                        </td>
                        <td style="padding-left:6px;width:50%;" valign="top">
                          <a href="${FOUNDER_FEEDBACK_URL}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 16px;border-radius:6px;border:2px solid #2D5016;line-height:1.3;">Feedback<br>zum Tool</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Cause-recruit block: motivate sender to invite Wahlkreis-people to write their own letters -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:8px 32px 24px;background-color:#ffffff;">
                    <div class="bnb-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:20px 22px;">
                      <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">Gemeinsam noch lauter</h2>
                      <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                        Dein Brief wirkt. Und er wirkt noch stärker, wenn weitere Stimmen aus deinem Wahlkreis dazukommen. Teile Brief-nach-Berlin per…
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding-right:6px;width:34%;" valign="top">
                            <a href="${whatsappUrl}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 8px;border-radius:6px;border:2px solid #2D5016;">WhatsApp</a>
                          </td>
                          <td style="padding:0 3px;width:33%;" valign="top">
                            <a href="${telegramUrl}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 8px;border-radius:6px;border:2px solid #2D5016;">Telegram</a>
                          </td>
                          <td style="padding-left:6px;width:33%;" valign="top">
                            <a href="${emailShareUrl}" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 8px;border-radius:6px;border:2px solid #2D5016;">E-Mail</a>
                          </td>
                        </tr>
                      </table>
                      <!-- Ghibli silhouette: letters flying to the Reichstag, melts into the cream box.
                           Negative margin pulls the image to the card edges; .bnb-bleed switches the
                           horizontal value to -14px on mobile so it matches the smaller inner padding. -->
                      <div class="bnb-bleed" style="margin:18px -22px -20px;font-size:0;line-height:0;">
                        <img src="${APP_URL}/images/email-bundestag-banner.png" alt="" width="556" height="130" style="display:block;width:100%;max-width:556px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;border-bottom-left-radius:6px;border-bottom-right-radius:6px;">
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Airmail stripe before footer (mirrors header) -->
                <tr>
                  <td colspan="7" style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:24px 32px 16px;background-color:#FAF8F5;text-align:center;">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;">
                      <a href="${APP_URL}" style="color:#2D5016;text-decoration:none;">Brief nach Berlin</a> · Deine Stimme zählt.
                    </p>
                  </td>
                </tr>

                <!-- Legal / disclaimer block (smaller, below footer) -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:8px 32px 24px;background-color:#FAF8F5;text-align:center;">
                    <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#aaaaaa;line-height:1.5;">
                      <strong>Hinweis:</strong> Der Brief ist ein generierter Entwurf. Bitte passe ihn an und prüfe Politikerdaten vor dem Versand bei <a href="${profileUrl}" target="_blank" rel="noopener noreferrer" style="color:#888888;">abgeordnetenwatch.de</a>. Die Verantwortung für den Inhalt liegt bei dir.
                    </p>
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#aaaaaa;line-height:1.5;">
                      <a href="${APP_URL}/datenschutz" style="color:#888888;">Datenschutz</a>: deine Daten werden nicht gespeichert. · <a href="${APP_URL}/wer-darf-mdb-schreiben" style="color:#888888;">Wer darf MdBs schreiben?</a>${data.debug ? ` · <a href="${buildDebugUrl(data.debug)}" style="color:#888888;text-decoration:none;">Debug</a>` : ""}
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
