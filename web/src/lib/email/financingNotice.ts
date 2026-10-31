import { APP_URL } from "@/lib/config";
import { SUPPORT_CONTENT } from "@/lib/support-content";

export interface FinancingNoticeCopy {
  heading: string;
  body: string;
  button: string;
  infoButton: string;
  status: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface FinancingNoticePortrait {
  src: string;
  alt: string;
}

export function buildDonationButtonLabelHtml(label: string, baseUrl: string = APP_URL): string {
  return `<img src="${escapeHtml(baseUrl)}/images/icon-heart-white.png" alt="" aria-hidden="true" width="16" height="16" style="width:16px;height:16px;vertical-align:middle;border:0;margin-right:6px;">${escapeHtml(label)}`;
}

// Follow-up: freigestelltes Foto rechts im Fließtext (align="right" wie die Briefmarke
// in der Briefmail), der Text läuft drumherum. Es ist das höchste Element neben dem
// Text und sitzt dadurch unten rechts in der Ecke. Mobil-Regeln (bnb-support-*) setzt
// die Mail im <head>: Button über die ganze Breite, graue Zeile darunter.
function buildCornerPortraitNoticeHtml(
  copy: FinancingNoticeCopy,
  portrait: FinancingNoticePortrait,
  donationUrl: string,
  showHeart: boolean,
): string {
  return `<div class="bnb-support-corner" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;overflow:hidden;">
      <h2 class="bnb-support-text" style="margin:0;padding:18px 20px 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">${escapeHtml(copy.heading)}</h2>
      <img class="bnb-support-photo" src="${escapeHtml(portrait.src)}" width="124" height="124" align="right" alt="${escapeHtml(portrait.alt)}" style="float:right;width:124px;height:124px;margin:0 0 0 10px;border:0;outline:none;">
      <p class="bnb-support-text" style="margin:0;padding:0 20px 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">${escapeHtml(copy.body)}</p>
      <div class="bnb-support-actions" style="padding:0 0 16px 20px;">
        <a class="bnb-support-cta" href="${donationUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#2D5016;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:11px 22px;border:2px solid #2D5016;border-radius:4px;line-height:1.4;text-align:center;vertical-align:middle;">${showHeart ? buildDonationButtonLabelHtml(copy.button) : escapeHtml(copy.button)}</a>
        <span class="bnb-support-note" style="display:inline-block;max-width:190px;margin-left:10px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#bcbcbc;line-height:1.4;vertical-align:middle;">${escapeHtml(copy.status)}</span>
      </div>
      <div style="clear:both;height:0;font-size:0;line-height:0;">&nbsp;</div>
    </div>`;
}

export function buildFinancingNoticeHtml(
  copy: FinancingNoticeCopy,
  portrait?: FinancingNoticePortrait,
  options: { showHeart?: boolean; providerLabel?: string; portraitPlacement?: "heading" | "corner" } = {},
): string {
  const donationUrl = SUPPORT_CONTENT.ctas.donate.href;
  if (portrait && options.portraitPlacement === "corner") {
    return buildCornerPortraitNoticeHtml(copy, portrait, donationUrl, Boolean(options.showHeart));
  }
  const learnMoreUrl = `${APP_URL}${SUPPORT_CONTENT.ctas.learnMore.href}?src=email`;
  const heading = (margin: string) =>
    `<h2 style="margin:${margin};font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">${escapeHtml(copy.heading)}</h2>`;
  const headingHtml = portrait
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td valign="middle" style="padding:0 12px 8px 0;">
            ${heading("0")}
          </td>
          <td width="52" valign="top" align="right" style="width:52px;padding:0 0 8px 0;">
            <img src="${escapeHtml(portrait.src)}" width="52" height="52" alt="${escapeHtml(portrait.alt)}" style="display:block;width:52px;height:52px;border:0;border-radius:50%;">
          </td>
        </tr>
      </table>`
    : heading("0 0 8px");
  return `<div class="bnb-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:18px 20px;">
      ${headingHtml}
      <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">${escapeHtml(copy.body)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td class="bnb-support-action bnb-support-action-primary" width="52%" valign="top" style="width:52%;padding-right:5px;">
            <a href="${donationUrl}" target="_blank" rel="noopener noreferrer" style="display:block;background-color:#2D5016;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:11px 10px;border:2px solid #2D5016;border-radius:4px;line-height:1.4;text-align:center;">${options.showHeart ? buildDonationButtonLabelHtml(copy.button) : escapeHtml(copy.button)}</a>
            ${options.providerLabel ? `<p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#b0b0b0;line-height:1.4;text-align:center;">${escapeHtml(options.providerLabel)}</p>` : ""}
          </td>
          <td class="bnb-support-action" width="48%" valign="top" style="width:48%;padding-left:5px;">
            <a href="${learnMoreUrl}" target="_blank" rel="noopener noreferrer" style="display:block;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:11px 10px;border:2px solid #2D5016;border-radius:4px;line-height:1.4;text-align:center;">${escapeHtml(copy.infoButton)}</a>
          </td>
        </tr>
      </table>
      <p style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#bcbcbc;line-height:1.5;">${escapeHtml(copy.status)}</p>
    </div>`;
}
