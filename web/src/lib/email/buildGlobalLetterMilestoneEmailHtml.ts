import { APP_NAME, APP_URL } from "@/lib/config";
import { formatLetterCount } from "@/lib/campaigns/milestones";

export interface GlobalLetterMilestoneEmailParams {
  count: number;
  imageUrl: string;
  statsUrl: string;
}

export function buildGlobalLetterMilestoneEmailHtml({
  count,
  imageUrl,
  statsUrl,
}: GlobalLetterMilestoneEmailParams): string {
  const formattedCount = formatLetterCount(count);
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;color:#3D3D3D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">
        <tr><td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td></tr>
        <tr><td style="padding:0;font-size:0;line-height:0;"><img src="${imageUrl}" width="600" alt="${formattedCount} Briefe mit Brief-nach-Berlin" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>
        <tr><td style="padding:24px 28px 28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">Moin Thomas,</p>
          <h1 style="margin:0 0 16px;font-size:25px;line-height:1.3;color:#1B4332;">${formattedCount} Briefe sind entstanden!</h1>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.65;">Mit Brief-nach-Berlin wurden ${formattedCount} Briefe erstellt. Ein guter Moment, kurz innezuhalten und zu feiern. Jeder Brief gibt einem persönlichen Anliegen eine klare, gut adressierte Form.</p>
          <a href="${statsUrl}" style="display:block;text-align:center;background-color:#2D6A4F;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:15px 12px;border-radius:4px;line-height:1.25;">Zu den Statistiken</a>
        </td></tr>
        <tr><td style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td></tr>
        <tr><td style="padding:18px 28px 22px;background-color:#FAF8F5;text-align:center;font-size:12px;line-height:1.5;color:#999999;"><a href="${APP_URL}" style="color:#2D6A4F;text-decoration:none;">${APP_NAME}</a> · Interner Meilenstein</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
