import {
  APP_URL,
  FOUNDER_INSTAGRAM,
  FOUNDER_LINKEDIN,
} from "@/lib/config";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";

const COPY: Record<Locale, string> = {
  de: "Updates von Thomas zu Brief-nach-Berlin:",
  en: "Updates from Thomas:",
  tr: "Thomas'tan güncellemeler:",
};

export function buildSocialFollowText(locale: Locale = DEFAULT_LOCALE): string {
  return `${COPY[locale]} Instagram: ${FOUNDER_INSTAGRAM} · LinkedIn: ${FOUNDER_LINKEDIN}`;
}

export function buildSocialFollowHtml({
  locale = DEFAULT_LOCALE,
  baseUrl = APP_URL,
}: {
  locale?: Locale;
  baseUrl?: string;
} = {}): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:10px auto 0;border-collapse:collapse;">
    <tr>
      <td style="padding-right:10px;font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.4;color:#999999;white-space:nowrap;">${COPY[locale]}</td>
      <td width="32" height="32" style="width:32px;height:32px;padding-right:6px;">
        <a href="${FOUNDER_INSTAGRAM}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" style="display:block;width:30px;height:30px;line-height:30px;mso-line-height-rule:exactly;background-color:#ffffff;border:1px solid #CBD5CE;border-radius:16px;text-align:center;text-decoration:none;">
          <img src="${baseUrl}/images/icon-instagram.png" alt="Instagram" width="16" height="16" style="display:inline-block;width:16px;height:16px;vertical-align:middle;border:0;outline:none;">
        </a>
      </td>
      <td width="32" height="32" style="width:32px;height:32px;">
        <a href="${FOUNDER_LINKEDIN}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" style="display:block;width:30px;height:30px;line-height:30px;mso-line-height-rule:exactly;background-color:#ffffff;border:1px solid #CBD5CE;border-radius:16px;text-align:center;text-decoration:none;">
          <span aria-hidden="true" style="display:inline-block;width:16px;height:16px;line-height:16px;vertical-align:middle;border-radius:2px;background-color:#2D5016;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;text-align:center;">in</span>
        </a>
      </td>
    </tr>
  </table>`;
}
