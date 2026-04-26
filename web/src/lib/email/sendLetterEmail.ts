import { BrevoClient } from "@getbrevo/brevo";
import { buildEmailHtml } from "./buildEmailHtml";
import { EMAIL_SUBJECT, EMAIL_SENDER_NAME } from "@/lib/config";

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  throw new Error("[brief-nach-berlin] BREVO_API_KEY environment variable is not set");
}
const brevo = new BrevoClient({ apiKey });

export interface LetterDebugPayload {
  toneLevel: number | undefined;
  toneLabel: string;
  letterLengthKey: string;
  letterLengthMin: number;
  letterLengthMax: number;
  issueTextLength: number;
  wordCount: number;
  wordCountInRange: boolean;
  fallbackUsed: boolean;
  politicalLevel: string;
  selectedPoliticianParty: string | null;
  availablePoliticianCount: number;
  model: string;
  temperature: number;
  generationMs: number;
  hasName: boolean;
  hasParty: boolean;
  hasNgo: boolean;
}

export interface SendLetterEmailParams {
  recipientEmail: string;
  politicianName: string;
  politicianFirstName: string;
  politicianLastName: string;
  politicianTitle: string | null;
  politicianPostalAddress: string;
  politicianAbgeordnetenwatchUrl: string | null;
  letterText: string;
  issueText: string;
  debug?: LetterDebugPayload;
}


export async function sendLetterEmail(
  params: SendLetterEmailParams
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: EMAIL_SUBJECT,
      htmlContent: buildEmailHtml(params),
      sender: {
        name: EMAIL_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL || "brief@brief-nach-berlin.de",
      },
      to: [{ email: params.recipientEmail }],
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[brief-nach-berlin] Brevo send failed:", error);
    return { success: false };
  }
}
