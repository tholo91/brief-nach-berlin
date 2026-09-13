import {
  FOUNDER_INSTAGRAM,
  FOUNDER_LINKEDIN,
} from "@/lib/config";
import { buildCampaignCreatorEmailHtml } from "@/lib/email/buildCampaignCreatorEmailHtml";
import {
  buildEmailHtml,
  buildLetterEmailText,
} from "@/lib/email/buildEmailHtml";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import { buildLastcallHtml } from "@/lib/email/buildLastcallHtml";
import { buildVariantEmailHtml } from "@/lib/email/buildVariantEmailHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

const letterParams: SendLetterEmailParams = {
  locale: "de",
  recipientEmail: "test@example.org",
  politicianName: "Anna Müller",
  politicianFirstName: "Anna",
  politicianLastName: "Müller",
  politicianTitle: null,
  politicianParty: "SPD",
  politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
  politicianAbgeordnetenwatchUrl: null,
  recipientKind: "mdb",
  letterText: "Sehr geehrte Frau Müller,\n\nTestbrief.\n\nMit freundlichen Grüßen",
  issueText: "Testanliegen",
};

describe("email social follow footer", () => {
  it("adds the compact Instagram and LinkedIn links to user journey emails", () => {
    const userMailHtml = [
      buildEmailHtml(letterParams),
      buildFollowupHtml({ token: "signed-token" }).html,
      buildLastcallHtml().html,
      buildVariantEmailHtml(letterParams.letterText, letterParams.recipientEmail),
    ];

    for (const html of userMailHtml) {
      expect(html).toContain("Updates von Thomas zu Brief-nach-Berlin:");
      expect(html).toContain(`href="${FOUNDER_INSTAGRAM}"`);
      expect(html).toContain(`href="${FOUNDER_LINKEDIN}"`);
      expect(html).toContain('width="32" height="32"');
    }
  });

  it("keeps social profiles in the plain-text alternatives", () => {
    const texts = [
      buildLetterEmailText(letterParams),
      buildFollowupHtml({ token: "signed-token" }).text,
      buildLastcallHtml().text,
    ];

    for (const text of texts) {
      expect(text).toContain(FOUNDER_INSTAGRAM);
      expect(text).toContain(FOUNDER_LINKEDIN);
    }
  });

  it("keeps campaign access emails focused on their administrative action", () => {
    const html = buildCampaignCreatorEmailHtml({
      kind: "verify_email",
      campaignTitle: "Saubere Radwege",
      slug: "saubere-radwege",
      campaignUrl: "https://brief-nach-berlin.de/kampagne/saubere-radwege",
      actionUrl: "https://brief-nach-berlin.de/kampagne/saubere-radwege/verifizieren",
    });

    expect(html).not.toContain(FOUNDER_INSTAGRAM);
    expect(html).not.toContain(FOUNDER_LINKEDIN);
  });
});
