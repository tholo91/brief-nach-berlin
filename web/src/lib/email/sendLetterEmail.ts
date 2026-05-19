import { BrevoClient } from "@getbrevo/brevo";
import { buildEmailHtml } from "./buildEmailHtml";
import { EMAIL_SUBJECT, EMAIL_SENDER_NAME } from "@/lib/config";

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  throw new Error("[brief-nach-berlin] BREVO_API_KEY environment variable is not set");
}
// DSGVO: Open- und Click-Tracking muss im Brevo-Account deaktiviert sein
// (Senders, Domains & Dedicated IPs → Tracking). Andernfalls würde Brevo einen
// Tracking-Pixel in jede Mail einbetten und Consent wäre erforderlich.
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
  retried: boolean;
  politicalLevel: string;
  representativeName: string;
  representativeWahlkreis: string;
  representativeLevel: string;
  representativeParty: string | null;
  mdbContextUsed: boolean;
  availablePoliticianCount: number;
  model: string;
  temperature: number;
  generationMs: number;
  hasName: boolean;
  hasParty: boolean;
  hasNgo: boolean;
  usedSpeechToText: boolean;
  // Feedback-Loop additions (optional so older serialized payloads still decode).
  // The /feedback page reads these from the signed token; they are never displayed
  // publicly and never trusted from client-supplied inputs.
  userEmail?: string;
  politicianId?: number;
  plz?: string;
}

export interface SendLetterEmailParams {
  recipientEmail: string;
  politicianName: string;
  politicianFirstName: string;
  politicianLastName: string;
  politicianTitle: string | null;
  politicianParty: string;
  politicianPostalAddress: string;
  politicianAbgeordnetenwatchUrl: string | null;
  letterText: string;
  issueText: string;
  debug?: LetterDebugPayload;
  // HMAC-signed token carrying the debug payload, used by the email's star bar
  // to authenticate clicks to /feedback. Missing in legacy callers (resend);
  // when missing, the star bar is omitted from the rendered email.
  feedbackToken?: string;
}


export async function sendLetterEmail(
  params: SendLetterEmailParams
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: EMAIL_SUBJECT,
      htmlContent: buildEmailHtml(params),
      // params.feedbackToken is read by buildEmailHtml to render the star bar
      // in place of the static "Profil auf abgeordnetenwatch" button.
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
