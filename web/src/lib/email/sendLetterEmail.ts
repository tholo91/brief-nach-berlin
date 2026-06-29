import { BrevoClient } from "@getbrevo/brevo";
import { buildEmailHtml } from "./buildEmailHtml";
import { signFeedbackToken } from "@/lib/feedback/token";
import type { Politician } from "@/lib/types/politician";
import { EMAIL_SUBJECT, EMAIL_SENDER_NAME } from "@/lib/config";
import type { WizardData } from "@/lib/types/wizard";

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
  // Gekürzter Auszug des Original-Anliegens (max 600 Zeichen), damit /debug
  // den Kontext zeigt, ohne die Mail zurückzuverfolgen. Optional, da ältere
  // serialisierte Payloads das Feld nicht haben. Nur der briefschreibende
  // Nutzer sieht diesen Link — kein Fremd-PII-Risiko.
  issueTextPreview?: string;
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
  hasParty: boolean;
  hasNgo: boolean;
  usedSpeechToText: boolean;
  // Ob der Nutzer die Tipps-Ausklappleiste je geöffnet hat (Landing oder
  // Wizard). Optional, damit ältere serialisierte Payloads weiter dekodieren.
  tipsOpened?: boolean;
  // Feedback-Loop additions (optional so older serialized payloads still decode).
  // The /feedback page reads these from the signed token; they are never displayed
  // publicly and never trusted from client-supplied inputs.
  userEmail?: string;
  politicianId?: number;
  plz?: string;
  // True für Resends: es gab keinen neuen Generierungslauf, daher sind die
  // generierungs-spezifischen Felder (model/temperature/generationMs/…) Platzhalter.
  // /debug zeigt das als Hinweis an, damit man die Werte nicht fehlinterpretiert.
  resent?: boolean;
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
  campaign?: WizardData["campaign"];
  letterNumber?: number;
}

// Gemeinsamer Versand-Tail für Erst- UND Resend-Pfad: mappt einen Politician +
// Brieftext + (bereits gebaute) Debug-Payload auf das SendLetterEmailParams-Objekt
// und signiert den feedbackToken. Damit lebt die E-Mail-Form an genau EINER Stelle.
// Die Debug-Payload selbst bleibt pfad-spezifisch (Generierung vs. Resend), den
// signierten Token gibt die Funktion zurück, weil der Erstversand ihn zusätzlich
// für die Followup-Mail wiederverwendet.
export function prepareLetterEmail(args: {
  recipientEmail: string;
  politician: Politician;
  letterText: string;
  issueText: string;
  debug: LetterDebugPayload;
  campaign?: WizardData["campaign"];
  letterNumber?: number;
}): { params: SendLetterEmailParams; feedbackToken: string } {
  const { recipientEmail, politician, letterText, issueText, debug, campaign, letterNumber } = args;
  const feedbackToken = signFeedbackToken(debug);
  return {
    feedbackToken,
    params: {
      recipientEmail,
      politicianName: `${politician.firstName} ${politician.lastName}`,
      politicianFirstName: politician.firstName,
      politicianLastName: politician.lastName,
      politicianTitle: politician.title,
      politicianParty: politician.party,
      politicianPostalAddress: politician.postalAddress,
      politicianAbgeordnetenwatchUrl: politician.abgeordnetenwatchUrl,
      letterText,
      issueText,
      debug,
      feedbackToken,
      campaign,
      letterNumber,
    },
  };
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
      // Resends tragen "brief-resend" statt "brief", damit sie sich in Brevo
      // sauber von Erstversänden trennen lassen. Das resent-Flag setzt der
      // Resend-Pfad in buildResendDebugPayload.
      tags: [params.debug?.resent ? "brief-resend" : "brief"],
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[brief-nach-berlin] Brevo send failed:", error);
    return { success: false };
  }
}
