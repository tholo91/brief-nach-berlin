/**
 * Erwachsenen-Regression: buildEmailHtml und buildLetterEmailText ohne Jugend-Option
 * müssen exakt das HTML und den Text von vor dem Jugendmodus liefern.
 */

import { buildEmailHtml, buildLetterEmailText } from "@/lib/email/buildEmailHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

const base: SendLetterEmailParams = {
  recipientEmail: "test@example.org",
  politicianName: "Anna Müller",
  politicianFirstName: "Anna",
  politicianLastName: "Müller",
  politicianTitle: null,
  politicianParty: "SPD",
  politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
  politicianAbgeordnetenwatchUrl: "https://www.abgeordnetenwatch.de/profile/anna-mueller",
  politicianId: 42,
  recipientKind: "mdb",
  letterText: "Sehr geehrte Frau Müller,\n\nTestbrief.\n\nMit freundlichen Grüßen",
  issueText: "Testanliegen",
  deleteUrl: "https://example.org/datenloeschen?t=fixed",
  letterNumber: 7,
  letterId: "letter-1",
};

describe("Erwachsenen-Mail bleibt unverändert", () => {
  it("mit Feedback-Token (Sterne-Bar)", () => {
    const data = { ...base, feedbackToken: "fixed-token" };
    expect(buildEmailHtml(data)).toMatchSnapshot("html");
    expect(buildLetterEmailText(data)).toMatchSnapshot("text");
  });

  it("ohne Feedback-Token (Profil-Button)", () => {
    expect(buildEmailHtml(base)).toMatchSnapshot("html");
    expect(buildLetterEmailText(base)).toMatchSnapshot("text");
  });

  it("Kampagne", () => {
    const data: SendLetterEmailParams = {
      ...base,
      feedbackToken: "fixed-token",
      campaign: { slug: "test", title: "Testkampagne" } as SendLetterEmailParams["campaign"],
      campaignLetterCount: 40,
    };
    expect(buildEmailHtml(data)).toMatchSnapshot("html");
    expect(buildLetterEmailText(data)).toMatchSnapshot("text");
  });
});
