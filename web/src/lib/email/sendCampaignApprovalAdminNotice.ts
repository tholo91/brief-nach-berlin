import { BrevoClient } from "@getbrevo/brevo";
import { APP_URL, EMAIL_SENDER_NAME } from "@/lib/config";
import { CONTACT } from "@/lib/contact";
import { campaignLogoPublicUrl } from "@/lib/campaigns/logo";
import { BUNDESLAND_NAMES, type Campaign } from "@/lib/campaigns/schema";

// Interne Mail an Thomas, sobald eine Ersteller:in ihre E-Mail zum ersten Mal
// bestaetigt hat und die Kampagne auf Freigabe wartet. Nichts geht an Dritte.
// Weicher apiKey-Guard: Die Bestaetigung darf nie an dieser Mail scheitern.
const apiKey = process.env.BREVO_API_KEY;
const brevo = apiKey ? new BrevoClient({ apiKey }) : null;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type CampaignApprovalAdminNoticeParams = Pick<
  Campaign,
  | "id"
  | "slug"
  | "title"
  | "creatorName"
  | "creatorEmail"
  | "issueText"
  | "description"
  | "externalUrl"
  | "logoPath"
  | "moderationCategories"
  | "targetLevel"
  | "targetState"
  | "targetRecipient"
  | "targetPoliticianIds"
>;

function describeTarget(params: CampaignApprovalAdminNoticeParams): string {
  const state = params.targetState ? BUNDESLAND_NAMES[params.targetState] : null;
  if (params.targetLevel === "Fixed" && params.targetRecipient) {
    const r = params.targetRecipient;
    const name = [r.organizationName, r.personName].filter(Boolean).join(", ");
    return `Fester Empfänger: ${name}, ${r.street} ${r.houseNumber}, ${r.postalCode} ${r.city}`;
  }
  const parts: string[] = [params.targetLevel];
  if (state) parts.push(state);
  if (params.targetPoliticianIds.length > 0) {
    parts.push(`Politiker-IDs: ${params.targetPoliticianIds.join(", ")}`);
  }
  return parts.join(" / ");
}

function field(label: string, valueHtml: string): string {
  return `<p style="margin:0 0 4px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;text-transform:uppercase;color:#2D6A4F;">${label}</p>
    <div style="margin:0 0 14px;">${valueHtml}</div>`;
}

function multiline(value: string): string {
  return esc(value).replace(/\n/g, "<br>");
}

export function buildCampaignApprovalAdminNoticeHtml(
  params: CampaignApprovalAdminNoticeParams,
): string {
  const logoUrl = campaignLogoPublicUrl(params.logoPath);
  const sql = `select id, title, status from public.approve_campaign('${params.id}');`;
  const external = params.externalUrl?.trim();
  const categories = params.moderationCategories.length
    ? esc(params.moderationCategories.join(", "))
    : "keine";

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 12px;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;color:#3D3D3D;">
  <div style="max-width:560px;margin:0 auto;padding:24px 28px;background-color:#ffffff;font-size:16px;line-height:1.65;">
    <p style="margin:0 0 16px;font-size:18px;"><strong>Neue Kampagne wartet auf Freigabe</strong></p>
    ${field("Titel", esc(params.title))}
    ${field("Ersteller:in", `${esc(params.creatorName?.trim() || "ohne Namen")} (${esc(params.creatorEmail)})`)}
    ${field("Empfänger", esc(describeTarget(params)))}
    ${field("Anliegen", multiline(params.issueText))}
    ${field("Beschreibung", params.description?.trim() ? multiline(params.description) : "keine")}
    ${field("Externe URL", external ? esc(external) : "keine")}
    ${field(
      "Logo",
      logoUrl
        ? `<img src="${esc(logoUrl)}" alt="" style="max-width:160px;max-height:160px;border:0;"><br><span style="font-size:13px;color:#666666;">${esc(logoUrl)}</span>`
        : "keins",
    )}
    ${field("Moderation", categories)}
    ${field(
      "Kampagne",
      `ID: ${esc(params.id)}<br>Slug: ${esc(params.slug)}<br>URL ab Freigabe: ${esc(`${APP_URL}/kampagne/${params.slug}`)}`,
    )}
    <p style="margin:0 0 6px;"><strong>Freigabe per SQL:</strong></p>
    <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:14px;">${esc(sql)}</p>
    <p style="margin:0;font-size:14px;color:#666666;">Oder lokal: /kampagne-freigeben</p>
  </div>
</body>
</html>`;
}

export async function sendCampaignApprovalAdminNotice(
  params: CampaignApprovalAdminNoticeParams,
): Promise<{ success: boolean }> {
  if (!brevo) {
    console.error("[campaign-approval-admin] BREVO_API_KEY not set, notice skipped");
    return { success: false };
  }
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: `[BnB Freigabe] ${params.title}`,
      htmlContent: buildCampaignApprovalAdminNoticeHtml(params),
      sender: {
        name: EMAIL_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
      },
      to: [{ email: process.env.THOMAS_MAIL || CONTACT.email }],
      tags: ["campaign-approval-admin"],
    });
    return { success: true };
  } catch {
    console.error("[campaign-approval-admin] notice failed");
    return { success: false };
  }
}
