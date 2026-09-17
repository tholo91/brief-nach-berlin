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
  labelHtml,
  marginTop = 6,
  wrapLabel = false,
}: {
  locale?: Locale;
  baseUrl?: string;
  labelHtml?: string;
  marginTop?: number;
  wrapLabel?: boolean;
} = {}): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:${marginTop}px auto 0;border-collapse:collapse;">
    <tr>
      <td style="padding-right:8px;font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.4;color:#999999;white-space:${wrapLabel ? "normal" : "nowrap"};vertical-align:middle;">${labelHtml ?? COPY[locale]}</td>
      <td width="34" height="30" style="width:34px;height:30px;vertical-align:middle;">
        <a href="${FOUNDER_INSTAGRAM}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" style="display:block;width:30px;height:30px;line-height:30px;mso-line-height-rule:exactly;background-color:transparent;border:0;text-align:center;text-decoration:none;">
          <img src="${baseUrl}/images/icon-instagram.png" alt="Instagram" width="18" height="18" style="display:block;width:18px;height:18px;margin:6px auto;border:0;outline:none;">
        </a>
      </td>
      <td width="30" height="30" style="width:30px;height:30px;vertical-align:middle;">
        <a href="${FOUNDER_LINKEDIN}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" style="display:block;width:30px;height:30px;line-height:30px;mso-line-height-rule:exactly;background-color:transparent;border:0;text-align:center;text-decoration:none;">
          <span aria-hidden="true" style="display:block;width:18px;height:18px;line-height:18px;margin:6px auto;border-radius:2px;background-color:#2D5016;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;text-align:center;">in</span>
        </a>
      </td>
    </tr>
  </table>`;
}
