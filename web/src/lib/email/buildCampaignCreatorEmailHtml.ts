import {
  APP_NAME,
  APP_URL,
  CAMPAIGN_CREATOR_FEEDBACK_URL,
  DONATION_PROVIDER_URL,
} from "@/lib/config";
import {
  formatLetterCount,
  formatMilestoneList,
} from "@/lib/campaigns/milestones";
import { BRIEF_EMAIL } from "@/lib/contact";
import { buildShareTarget } from "@/lib/share";
import { SUPPORT_CAMPAIGN_CREATOR_COPY, SUPPORT_CONTENT } from "@/lib/support-content";
import { buildSocialFollowHtml } from "./buildSocialFollowHtml";
import { buildFinancingNoticeHtml } from "./financingNotice";

export type CampaignCreatorEmailKind =
  | "verify_email"
  | "management_pending"
  | "management"
  | "transfer"
  | "milestone";

export interface CampaignMilestoneEmailParams {
  count: number;
  milestones: number[];
  imageUrl: string;
  downloadUrl: string;
}

export interface BuildCampaignCreatorEmailHtmlParams {
  kind: CampaignCreatorEmailKind;
  campaignTitle: string;
  slug: string;
  campaignUrl: string;
  actionUrl: string;
  creatorName?: string | null;
  campaignStatus?: "awaiting_approval" | "active" | "paused";
  milestone?: CampaignMilestoneEmailParams;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const HEAD_STYLE = `<style>
    @media only screen and (max-width: 600px) {
      .bnb-pad { padding-left: 18px !important; padding-right: 18px !important; }
      .bnb-cta-cell { display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; }
      .bnb-cta-link { padding: 14px 10px !important; }
      .bnb-share-label { display: none !important; }
      .bnb-share-btn { padding: 0 !important; height: 48px !important; line-height: 46px !important; box-sizing: border-box !important; }
      .bnb-share-icon { width: 22px !important; height: 22px !important; margin: 0 !important; vertical-align: middle !important; }
      .bnb-share-badge { line-height: 22px !important; font-size: 14px !important; }
      .bnb-inner-pad { padding-left: 14px !important; padding-right: 14px !important; }
      .bnb-support-action { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
      .bnb-support-action-primary { padding-bottom: 8px !important; }
    }
  </style>`;

const STRIPE_ROW = `<tr>
            <td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
          </tr>`;

type ShareButton = {
  icon: "whatsapp" | "telegram" | "email" | "linkedin";
  label: string;
  href: string;
  external: boolean;
};

function shareIconHtml(icon: ShareButton["icon"]): string {
  if (icon === "linkedin") {
    return `<span class="bnb-share-icon bnb-share-badge" style="display:inline-block;width:16px;height:16px;line-height:16px;vertical-align:middle;margin-right:6px;border-radius:2px;background-color:#2D6A4F;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;">in</span>`;
  }
  return `<img src="${APP_URL}/images/icon-${icon}.png" alt="" width="16" height="16" class="bnb-share-icon" style="width:16px;height:16px;vertical-align:middle;border:0;margin-right:6px;">`;
}

function buildShareButtonsTable(buttons: ShareButton[]): string {
  const width = Math.floor(100 / buttons.length);
  const cells = buttons
    .map((button, index) => {
      const padding =
        index === 0
          ? "padding-right:4px;"
          : index === buttons.length - 1
            ? "padding-left:4px;"
            : "padding:0 2px;";
      const target = button.external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<td style="${padding}width:${width}%;" valign="top">
                      <a href="${button.href}"${target} class="bnb-share-btn" style="display:block;text-align:center;background-color:#ffffff;color:#2D6A4F;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:4px;border:1px solid #2D6A4F;line-height:1;white-space:nowrap;">${shareIconHtml(button.icon)}<span class="bnb-share-label">${button.label}</span></a>
                    </td>`;
    })
    .join("\n                    ");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    ${cells}
                  </tr>
                </table>`;
}

function buildMilestoneEmailHtml(
  params: BuildCampaignCreatorEmailHtmlParams,
  milestone: CampaignMilestoneEmailParams
): string {
  const title = escapeHtml(params.campaignTitle);
  const creatorName = params.creatorName?.trim();
  const greeting = creatorName ? `Moin ${escapeHtml(creatorName)},` : "Moin,";
  const count = formatLetterCount(milestone.count);
  const showSupport = milestone.count >= 500;
  const outlineButton = (href: string, label: string, external: boolean) =>
    `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""} class="bnb-cta-link" style="display:block;text-align:center;background-color:#ffffff;color:#2D6A4F;font-size:15px;font-weight:bold;text-decoration:none;padding:12px 8px;border-radius:4px;border:1px solid #2D6A4F;line-height:1.25;">${label}</a>`;
  const buttons = showSupport
    ? [
        outlineButton(params.actionUrl, "&#9998;&nbsp;Kampagne verwalten", true),
        outlineButton(`mailto:${BRIEF_EMAIL}`, "Thomas schreiben", false),
      ]
    : [
        outlineButton(params.actionUrl, "&#9998;&nbsp;Verwalten", true),
        outlineButton(DONATION_PROVIDER_URL, "&#9829;&nbsp;Unterstützen", true),
        outlineButton(`mailto:${BRIEF_EMAIL}`, "Thomas schreiben", false),
      ];
  const cellWidth = showSupport ? "50%" : "33.33%";
  const buttonCells = buttons
    .map((button, index) => {
      const padding =
        index === 0
          ? "padding-right:5px;"
          : index === buttons.length - 1
            ? "padding-left:5px;"
            : "padding:0 5px;";
      return `<td class="bnb-cta-cell" style="width:${cellWidth};${padding}" valign="top">${button}</td>`;
    })
    .join("\n                  ");
  const supportBlock = showSupport
    ? `<div style="margin:0 0 22px;">${buildFinancingNoticeHtml(
        {
          ...SUPPORT_CAMPAIGN_CREATOR_COPY,
          heading: SUPPORT_CAMPAIGN_CREATOR_COPY.milestoneHeading,
        },
        {
          src: `${APP_URL}${SUPPORT_CONTENT.founder.avatarPath}`,
          alt: SUPPORT_CONTENT.founder.name,
        },
      )}</div>`
    : "";
  const shareTarget = buildShareTarget(
    { slug: params.slug, title: params.campaignTitle, letterCount: milestone.count },
    "milestone"
  );
  const shareBox = `<div style="margin:0 0 22px;padding:16px 18px;background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;">
                <p style="margin:0 0 10px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">Fortschritt teilen</p>
                <a href="${escapeHtml(milestone.downloadUrl)}" target="_blank" rel="noopener noreferrer" class="bnb-cta-link" style="display:block;text-align:center;background-color:#2D6A4F;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:13px 10px;border-radius:4px;line-height:1.25;margin:0 0 10px;"><img src="${APP_URL}/images/icon-download.png" width="16" height="16" alt="" style="width:16px;height:16px;vertical-align:middle;border:0;margin-right:8px;">Bild speichern</a>
                ${buildShareButtonsTable([
                  { icon: "whatsapp", label: "WhatsApp", href: shareTarget.whatsappUrl, external: true },
                  { icon: "telegram", label: "Telegram", href: shareTarget.telegramUrl, external: true },
                  { icon: "linkedin", label: "LinkedIn", href: shareTarget.linkedinUrl, external: true },
                  { icon: "email", label: "E-Mail", href: shareTarget.emailUrl, external: false },
                ])}
              </div>`;
  const footerLink = (href: string, label: string) =>
    `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#888888;text-decoration:underline;">${label}</a>`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${HEAD_STYLE}
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;color:#3D3D3D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">
          ${STRIPE_ROW}
          <tr>
            <td style="padding:0;font-size:0;line-height:0;">
              <img src="${escapeHtml(milestone.imageUrl)}" width="600" alt="${count} Briefe für „${title}“" style="display:block;width:100%;max-width:600px;height:auto;border:0;">
            </td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:22px 28px 0;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">${greeting}</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">${count} Briefe und kein Ende in Sicht. So viele Menschen haben die Argumente deiner Kampagne aufgegriffen und daraus ihren eigenen, persönlichen Brief geschrieben.</p>
              <p style="margin:0 0 22px;font-size:16px;line-height:1.65;">Wenn du magst, teil deinen Fortschritt auf Instagram, LinkedIn oder WhatsApp. Das Bild dafür ist schon fertig.</p>
              ${shareBox}
              ${supportBlock}
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 26px;">
                <tr>
                  ${buttonCells}
                </tr>
              </table>
            </td>
          </tr>
          ${STRIPE_ROW}
          <tr>
            <td class="bnb-pad" style="padding:22px 28px 26px;background-color:#FAF8F5;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#999999;"><a href="${APP_URL}" target="_blank" rel="noopener noreferrer" style="color:#2D6A4F;text-decoration:none;">Brief-nach-Berlin</a> · Meilenstein-Mail</p>
              <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#aaaaaa;">Du bekommst diese Mail bei ${formatMilestoneList(milestone.milestones)} Briefen. <a href="${params.actionUrl}#meilenstein-mails" target="_blank" rel="noopener noreferrer" style="color:#888888;text-decoration:underline;">Diese Mails abbestellen</a></p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#aaaaaa;">${footerLink(params.campaignUrl, "Kampagnenseite")} · ${footerLink(`${APP_URL}/impressum`, "Impressum")} · ${footerLink(`${APP_URL}/datenschutz`, "Datenschutz")} · ${footerLink(CAMPAIGN_CREATOR_FEEDBACK_URL, "Feedback")}</p>
              ${buildSocialFollowHtml({ marginTop: 14 })}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildCampaignCreatorEmailHtml(
  params: BuildCampaignCreatorEmailHtmlParams
): string {
  if (params.kind === "milestone") {
    if (!params.milestone) {
      throw new Error("milestone params are required for kind milestone");
    }
    return buildMilestoneEmailHtml(params, params.milestone);
  }
  const title = escapeHtml(params.campaignTitle);
  const creatorName = params.creatorName?.trim();
  const greeting = creatorName ? `Moin ${escapeHtml(creatorName)},` : "Moin,";
  const isVerification = params.kind === "verify_email";
  const isPendingManagement = params.kind === "management_pending";
  const isPausedManagement = params.kind === "management" && params.campaignStatus === "paused";
  const isPublicManagement = params.kind === "management" && !isPausedManagement;
  const isTransfer = params.kind === "transfer";
  const hasManagementLink = params.kind === "management_pending" || params.kind === "management";
  const share = isPublicManagement
    ? buildShareTarget(
        {
          slug: params.slug,
          title: params.campaignTitle,
        },
        "creator"
      )
    : null;
  const headline = isVerification
    ? "Bitte bestätige deine Kampagne"
    : isTransfer
      ? "Kampagne übernehmen"
    : isPendingManagement
      ? "Deine Kampagne wird geprüft"
      : isPausedManagement
        ? "Deine Kampagne ist pausiert"
        : "Deine Kampagne ist aktiv";
  const intro = isVerification
    ? "Ein Klick bestätigt deine E-Mail. Danach prüfe ich deine Kampagne für die Freigabe."
    : isTransfer
      ? "Du wurdest eingeladen, diese Kampagne zu übernehmen. Ein Klick bestätigt deine E-Mail-Adresse und öffnet den Verwaltungszugang."
    : isPendingManagement
      ? "Deine E-Mail ist bestätigt. Ich prüfe deine Kampagne in der Regel innerhalb von 24 Stunden."
      : isPausedManagement
        ? "Die Kampagnenseite ist aktuell pausiert. Du kannst sie über den Verwaltungslink prüfen und wieder aktivieren."
        : "Deine Kampagnenseite ist jetzt öffentlich. Teile den Link mit Menschen, die einen eigenen Brief mit ihren Worten schreiben sollen.";
  const buttonText = isVerification
    ? "E-Mail bestätigen"
    : isTransfer
      ? "Kampagne übernehmen"
    : "Kampagne verwalten";
  const buttonIcon = isVerification ? "&#10003;" : isTransfer ? "&#8594;" : "&#9998;";
  const statusText = isVerification
    ? "Status: wartet auf E-Mail-Bestätigung"
    : isTransfer
      ? "Status: Übergabe wartet auf deine Bestätigung"
    : isPendingManagement
      ? "Status: wartet auf Freigabe"
      : isPausedManagement
        ? "Status: pausiert"
        : "Status: aktiv und öffentlich teilbar";
  const ctaTable = (margin: string) => `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:${margin};">
                <tr>
                  <td class="bnb-cta-cell" style="width:50%;padding-right:5px;" valign="top">
                    <a href="${params.actionUrl}" target="_blank" rel="noopener noreferrer" class="bnb-cta-link" style="display:block;text-align:center;background-color:#2D6A4F;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:13px 10px;border-radius:4px;line-height:1.25;">${buttonIcon}&nbsp;${buttonText}</a>
                  </td>
                  <td class="bnb-cta-cell" style="width:50%;padding-left:5px;" valign="top">
                    <a href="mailto:${BRIEF_EMAIL}" class="bnb-cta-link" style="display:block;text-align:center;background-color:#ffffff;color:#2D6A4F;font-size:16px;font-weight:bold;text-decoration:none;padding:12px 10px;border-radius:4px;border:1px solid #2D6A4F;line-height:1.25;">Thomas schreiben</a>
                  </td>
                </tr>
              </table>`;
  const managementHelp = isVerification
    ? `<div style="margin:0 0 22px;padding:16px 18px;background-color:#ffffff;border:1px solid #E0DCD7;border-radius:4px;">
        <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">Danach</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#666666;">Du bekommst eine zweite E-Mail mit deinem Verwaltungslink. Darüber kannst du Inhalte ändern, die Kampagne pausieren oder beenden.</p>
      </div>`
    : isTransfer
      ? `<div style="margin:0 0 22px;padding:16px 18px;background-color:#ffffff;border:1px solid #E0DCD7;border-radius:4px;">
        <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">Wichtig</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#666666;">Der Link ist nur einmal verwendbar. Nach deiner Bestätigung erhältst du zusätzlich eine E-Mail mit deinem dauerhaften Verwaltungslink.</p>
      </div>`
      : `<div style="margin:0 0 22px;padding:16px 18px;background-color:#ffffff;border:1px solid #E0DCD7;border-radius:4px;">
        <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">Verwaltungszugang</p>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#1B4332;"><strong>WICHTIG: DIESE E-MAIL AUFBEWAHREN</strong></p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#666666;">${isPendingManagement ? "Über den Link siehst du den aktuellen Status und kannst die Angaben bis zur Freigabe noch korrigieren." : "Du kannst deine Kampagne ohne Account per Klick auf &bdquo;Kampagne verwalten&ldquo; anpassen."}</p>
        ${ctaTable("14px 0 0")}
      </div>`;
  const campaignLink = isPublicManagement
    ? `<p style="margin:10px 0 0;font-size:14px;line-height:1.5;"><a href="${params.campaignUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D6A4F;text-decoration:underline;">Kampagnenseite öffnen</a></p>`
    : "";
  const shareBlock =
    isPublicManagement && share
      ? `<div style="margin:0 0 22px;padding:16px 18px;background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;">
                <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">Kampagne teilen</p>
                <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#666666;">Lade andere ein, einen eigenen Brief mit ihren Worten zu schreiben.</p>
                ${buildShareButtonsTable([
                  { icon: "whatsapp", label: "WhatsApp", href: share.whatsappUrl, external: true },
                  { icon: "telegram", label: "Telegram", href: share.telegramUrl, external: true },
                  { icon: "email", label: "E-Mail", href: share.emailUrl, external: false },
                  { icon: "linkedin", label: "LinkedIn", href: share.linkedinUrl, external: true },
                ])}
              </div>`
      : "";
  const supportBlock = hasManagementLink
    ? `<div style="margin:0 0 22px;">${buildFinancingNoticeHtml(SUPPORT_CAMPAIGN_CREATOR_COPY, {
        src: `${APP_URL}${SUPPORT_CONTENT.founder.avatarPath}`,
        alt: SUPPORT_CONTENT.founder.name,
      })}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${HEAD_STYLE}
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;color:#3D3D3D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">
          ${STRIPE_ROW}
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
              ${hasManagementLink ? "" : ctaTable("0 0 22px")}
              ${
                isVerification
                  ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#666666;">Wenn du diese Kampagne nicht angelegt hast, kannst du diese E-Mail ignorieren. Ohne Bestätigung wird die Seite nicht öffentlich.</p>`
                  : isTransfer
                    ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#666666;">Wenn du diese Übergabe nicht erwartest, kannst du diese E-Mail ignorieren.</p>`
                    : ""
              }
              ${managementHelp}
              ${shareBlock}
              ${supportBlock}
            </td>
          </tr>
          ${STRIPE_ROW}
          <tr>
            <td class="bnb-pad" style="padding:22px 28px 12px;background-color:#FAF8F5;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#999999;"><a href="${APP_URL}" target="_blank" rel="noopener noreferrer" style="color:#2D6A4F;text-decoration:none;">Brief-nach-Berlin</a> · Kampagnenzugang</p>
            </td>
          </tr>
          <tr>
            <td class="bnb-pad" style="padding:0 28px 26px;background-color:#FAF8F5;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#aaaaaa;">Gespeichert werden nur deine öffentlichen Kampagnentexte und deine E-Mail für diesen Zugriff. Besucherbriefe werden dadurch nicht gespeichert.</p>
              <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#aaaaaa;">Mehr dazu: <a href="${APP_URL}/petition-starten" target="_blank" rel="noopener noreferrer" style="color:#888888;text-decoration:underline;">Petition starten</a> · <a href="${APP_URL}/kampagne-starten" target="_blank" rel="noopener noreferrer" style="color:#888888;text-decoration:underline;">Kampagne starten</a></p>
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
