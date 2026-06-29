import {
  APP_NAME,
  APP_URL,
  CAMPAIGN_CREATOR_FEEDBACK_URL,
} from "@/lib/config";
import { buildShareTarget } from "@/lib/share";

export type CampaignCreatorEmailKind = "verify_email" | "management";

export interface BuildCampaignCreatorEmailHtmlParams {
  kind: CampaignCreatorEmailKind;
  campaignTitle: string;
  slug: string;
  campaignUrl: string;
  actionUrl: string;
  creatorName?: string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildCampaignCreatorEmailHtml(
  params: BuildCampaignCreatorEmailHtmlParams
): string {
  const title = escapeHtml(params.campaignTitle);
  const creatorName = params.creatorName?.trim();
  const greeting = creatorName ? `Moin ${escapeHtml(creatorName)},` : "Moin,";
  const isVerification = params.kind === "verify_email";
  const share = isVerification
    ? null
    : buildShareTarget(
        {
          slug: params.slug,
          title: params.campaignTitle,
        },
        "creator"
      );
  const headline = isVerification
    ? "Bitte bestätige deine Kampagne"
    : "Deine Kampagne ist aktiv";
  const intro = isVerification
    ? "Ein letzter Klick: Danach prüfe ich den Kampagnentext automatisch und schalte die Seite frei, wenn alles passt."
    : "Deine Kampagnenseite ist jetzt öffentlich. Teile den Link mit Menschen, die aus ihrem Wahlkreis einen eigenen Brief schreiben sollen.";
  const buttonText = isVerification
    ? "E-Mail bestätigen"
    : "Kampagne verwalten";
  const buttonIcon = isVerification ? "&#10003;" : "&#9998;";
  const statusText = isVerification
    ? "Status: wartet auf E-Mail-Bestätigung"
    : "Status: aktiv und öffentlich teilbar";
  const managementHelp = isVerification
    ? `<div style="margin:0 0 22px;padding:16px 18px;background-color:#ffffff;border:1px solid #E0DCD7;border-radius:4px;">
        <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">Danach</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#666666;">Du bekommst eine zweite E-Mail mit deinem Verwaltungslink. Darüber kannst du Inhalte ändern, die Kampagne pausieren oder archivieren.</p>
      </div>`
    : `<div style="margin:0 0 22px;padding:16px 18px;background-color:#ffffff;border:1px solid #E0DCD7;border-radius:4px;">
        <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">Verwaltungszugang</p>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#1B4332;"><strong>WICHTIG: DIESE E-MAIL AUFBEWAHREN</strong></p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#666666;">Du kannst deine Kampagne ohne Account per Klick auf &bdquo;Kampagne verwalten&ldquo; anpassen.</p>
      </div>`;
  const campaignLink = isVerification
    ? ""
    : `<p style="margin:10px 0 0;font-size:14px;line-height:1.5;"><a href="${params.campaignUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D6A4F;text-decoration:underline;">Kampagnenseite öffnen</a></p>`;
  const shareBlock =
    !isVerification && share
      ? `<div style="margin:0 0 22px;padding:16px 18px;background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;">
                <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">Kampagne teilen</p>
                <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#666666;">Lade andere ein, aus ihrem Wahlkreis einen eigenen Brief zu schreiben.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-right:4px;width:25%;" valign="top">
                      <a href="${share.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="bnb-share-btn" style="display:block;text-align:center;background-color:#ffffff;color:#2D6A4F;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:4px;border:1px solid #2D6A4F;line-height:1;white-space:nowrap;"><img src="${APP_URL}/images/icon-whatsapp.png" alt="" width="16" height="16" class="bnb-share-icon" style="width:16px;height:16px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">WhatsApp</span></a>
                    </td>
                    <td style="padding:0 2px;width:25%;" valign="top">
                      <a href="${share.telegramUrl}" target="_blank" rel="noopener noreferrer" class="bnb-share-btn" style="display:block;text-align:center;background-color:#ffffff;color:#2D6A4F;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:4px;border:1px solid #2D6A4F;line-height:1;white-space:nowrap;"><img src="${APP_URL}/images/icon-telegram.png" alt="" width="16" height="16" class="bnb-share-icon" style="width:16px;height:16px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">Telegram</span></a>
                    </td>
                    <td style="padding:0 2px;width:25%;" valign="top">
                      <a href="${share.emailUrl}" class="bnb-share-btn" style="display:block;text-align:center;background-color:#ffffff;color:#2D6A4F;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:4px;border:1px solid #2D6A4F;line-height:1;white-space:nowrap;"><img src="${APP_URL}/images/icon-email.png" alt="" width="16" height="16" class="bnb-share-icon" style="width:16px;height:16px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">E-Mail</span></a>
                    </td>
                    <td style="padding-left:4px;width:25%;" valign="top">
                      <a href="${share.linkedinUrl}" target="_blank" rel="noopener noreferrer" class="bnb-share-btn" style="display:block;text-align:center;background-color:#ffffff;color:#2D6A4F;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:4px;border:1px solid #2D6A4F;line-height:1;white-space:nowrap;"><span style="display:inline-block;width:16px;height:16px;line-height:16px;vertical-align:middle;margin-right:6px;border-radius:2px;background-color:#2D6A4F;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;">in</span><span class="bnb-share-label">LinkedIn</span></a>
                    </td>
                  </tr>
                </table>
              </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .bnb-pad { padding-left: 18px !important; padding-right: 18px !important; }
      .bnb-cta-cell { display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; }
      .bnb-cta-link { padding: 14px 10px !important; }
      .bnb-share-label { display: none !important; }
      .bnb-share-btn { padding: 13px 0 !important; }
      .bnb-share-icon { width: 22px !important; height: 22px !important; margin: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;color:#3D3D3D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:28px 28px 8px;text-align:center;">
              <img src="${APP_URL}/images/campaign-creator-icon.webp" width="58" height="58" alt="" style="display:block;width:58px;height:58px;margin:0 auto 12px;border:0;outline:none;text-decoration:none;">
              <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#2D6A4F;">${APP_NAME}</p>
              <h1 style="margin:0;font-size:24px;line-height:1.25;color:#1B4332;">${headline}</h1>
            </td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:18px 28px 0;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">${greeting}</p>
              <p style="margin:0 0 18px;font-size:16px;line-height:1.65;">${intro}</p>
              <div style="margin:0 0 22px;padding:16px 18px;background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;">
                <p style="margin:0 0 6px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">Kampagne</p>
                <p style="margin:0;font-size:18px;line-height:1.45;color:#1B4332;"><strong>${title}</strong></p>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.5;color:#666666;">${statusText}</p>
                ${campaignLink}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 22px;">
                <tr>
                  <td class="bnb-cta-cell" style="width:50%;padding-right:5px;" valign="top">
                    <a href="${params.actionUrl}" target="_blank" rel="noopener noreferrer" class="bnb-cta-link" style="display:block;text-align:center;background-color:#2D6A4F;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:13px 10px;border-radius:4px;line-height:1.25;">${buttonIcon}&nbsp;${buttonText}</a>
                  </td>
                  <td class="bnb-cta-cell" style="width:50%;padding-left:5px;" valign="top">
                    <a href="${CAMPAIGN_CREATOR_FEEDBACK_URL}" target="_blank" rel="noopener noreferrer" class="bnb-cta-link" style="display:block;text-align:center;background-color:#ffffff;color:#2D6A4F;font-size:16px;font-weight:bold;text-decoration:none;padding:12px 10px;border-radius:4px;border:1px solid #2D6A4F;line-height:1.25;">Feedback geben</a>
                  </td>
                </tr>
              </table>
              ${
                isVerification
                  ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#666666;">Wenn du diese Kampagne nicht angelegt hast, kannst du diese E-Mail ignorieren. Ohne Bestätigung wird die Seite nicht öffentlich.</p>`
                  : ""
              }
              ${managementHelp}
              ${shareBlock}
            </td>
          </tr>
          <tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:22px 28px 12px;background-color:#FAF8F5;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#999999;"><a href="${APP_URL}" target="_blank" rel="noopener noreferrer" style="color:#2D6A4F;text-decoration:none;">Brief nach Berlin</a> · Kampagnenzugang</p>
            </td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:0 28px 26px;background-color:#FAF8F5;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#aaaaaa;">Gespeichert werden nur deine öffentlichen Kampagnentexte und deine E-Mail für diesen Zugriff. Besucherbriefe werden dadurch nicht gespeichert.</p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#aaaaaa;"><a href="${APP_URL}/datenschutz" target="_blank" rel="noopener noreferrer" style="color:#888888;text-decoration:underline;">Datenschutz</a> · <a href="${CAMPAIGN_CREATOR_FEEDBACK_URL}" target="_blank" rel="noopener noreferrer" style="color:#888888;text-decoration:underline;">Feedback</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
