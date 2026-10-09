import { BrevoClient } from "@getbrevo/brevo";
import { APP_URL, EMAIL_SENDER_NAME } from "@/lib/config";
import { CONTACT } from "@/lib/contact";
import {
  CREATOR_SURVEY_CONCERNS,
  CREATOR_SURVEY_HELP_OFFERS,
  CREATOR_SURVEY_REASONS,
  CREATOR_SURVEY_STATEMENTS,
  CREATOR_SURVEY_STATEMENT_ANSWERS,
  type CreatorSurveyAnswers,
} from "@/lib/campaigns/creatorSurvey";

// Interne Mail an Thomas, wenn ein Ersteller sein Feedback abschickt oder ändert.
// Hilfsangebote stehen oben, replyTo ist die Ersteller-Adresse, damit Thomas
// direkt antworten kann. Weicher apiKey-Guard: Das Absenden darf nie scheitern.
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

const SENDER = () => ({
  name: EMAIL_SENDER_NAME,
  email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
});

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 12px;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;color:#3D3D3D;">
  <div style="max-width:560px;margin:0 auto;padding:24px 28px;background-color:#ffffff;font-size:16px;line-height:1.65;">
    ${body}
  </div>
</body>
</html>`;
}

export type CreatorSurveyAdminEmailParams = {
  campaign: {
    slug: string;
    title: string;
    creatorName: string | null;
    creatorEmail: string;
  };
  answers: CreatorSurveyAnswers;
  isUpdate: boolean;
};

function labelsFor<T extends string>(
  options: readonly { slug: T; label: string }[],
  selected: readonly T[],
): string[] {
  return options.filter((option) => selected.includes(option.slug)).map((option) => option.label);
}

function list(labels: string[], empty: string): string {
  if (labels.length === 0) return `<p style="margin:0 0 12px;color:#6B6B6B;">${esc(empty)}</p>`;
  return `<ul style="margin:0 0 12px;padding-left:20px;">${labels
    .map((label) => `<li>${esc(label)}</li>`)
    .join("")}</ul>`;
}

function yesNo(value: boolean): string {
  return value ? "ja" : "nein";
}

export function buildCreatorSurveyAdminEmailHtml(params: CreatorSurveyAdminEmailParams): string {
  const { campaign, answers, isUpdate } = params;
  const url = `${APP_URL}/kampagne/${campaign.slug}`;
  const helpLabels = labelsFor(CREATOR_SURVEY_HELP_OFFERS, answers.helpOffers);
  const statementLines = CREATOR_SURVEY_STATEMENTS.map((statement) => {
    const answer = answers.statements[statement.key];
    const answerLabel =
      CREATOR_SURVEY_STATEMENT_ANSWERS.find((option) => option.slug === answer)?.label ??
      "keine Angabe";
    return `<li>${esc(statement.label)}<br><strong>${esc(answerLabel)}</strong></li>`;
  }).join("");

  const help =
    helpLabels.length > 0
      ? `<p style="margin:0 0 6px;"><strong>Hilfsangebote</strong></p>${list(helpLabels, "")}`
      : `<p style="margin:0 0 12px;"><strong>Keine Hilfsangebote angekreuzt</strong></p>`;

  const quote = answers.quote
    ? `<p style="margin:0 0 12px;padding-left:12px;border-left:3px solid #C9C3B8;">${esc(answers.quote)}</p>`
    : `<p style="margin:0 0 12px;color:#6B6B6B;">Kein Satz geschrieben.</p>`;

  return wrap(`<p style="margin:0 0 12px;"><strong>${isUpdate ? "Ersteller-Feedback geändert" : "Neues Ersteller-Feedback"}</strong></p>
    ${help}
    <p style="margin:0 0 6px;">Kampagne: <a href="${esc(url)}">${esc(campaign.title)}</a> (${esc(campaign.slug)})</p>
    <p style="margin:0 0 16px;">Ersteller:in: ${esc(campaign.creatorName?.trim() || "ohne Namen")}. Antworten geht direkt per Reply.</p>
    <p style="margin:0 0 6px;"><strong>Was hat überzeugt?</strong></p>
    ${list(labelsFor(CREATOR_SURVEY_REASONS, answers.reasons), "Nichts angekreuzt")}
    <p style="margin:0 0 6px;"><strong>Bedenken vorher</strong></p>
    ${list(labelsFor(CREATOR_SURVEY_CONCERNS, answers.concerns), "Nichts angekreuzt")}
    <p style="margin:0 0 6px;"><strong>Aussagen</strong></p>
    <ul style="margin:0 0 12px;padding-left:20px;">${statementLines}</ul>
    <p style="margin:0 0 6px;"><strong>Ein Satz an andere Initiativen</strong></p>
    ${quote}
    <p style="margin:0 0 4px;">Zitat mit Logo/Name freigegeben: ${yesNo(answers.consentQuote)}</p>
    <p style="margin:0;">Anonym in Zahlen: ${yesNo(answers.consentAggregate)}</p>`);
}

export async function sendCreatorSurveyAdminEmail(
  params: CreatorSurveyAdminEmailParams,
): Promise<{ success: boolean }> {
  if (!brevo) {
    console.error("[creator-survey] BREVO_API_KEY not set, admin mail skipped");
    return { success: false };
  }
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: `[BnB Ersteller-Feedback] ${params.campaign.slug}${params.isUpdate ? " (geändert)" : ""}`,
      htmlContent: buildCreatorSurveyAdminEmailHtml(params),
      sender: SENDER(),
      to: [{ email: process.env.THOMAS_MAIL || CONTACT.email }],
      replyTo: { email: params.campaign.creatorEmail },
      tags: ["creator-survey-admin"],
    });
    return { success: true };
  } catch {
    console.error("[creator-survey] admin mail failed");
    return { success: false };
  }
}
