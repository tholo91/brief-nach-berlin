import { buildEmailHtml } from "@/lib/email/buildEmailHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

function makeParams(): SendLetterEmailParams {
  return {
    recipientEmail: "test+variant@example.com",
    politicianName: "Erika Mustermann",
    politicianFirstName: "Erika",
    politicianLastName: "Mustermann",
    politicianTitle: null,
    politicianParty: "SPD",
    politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
    politicianAbgeordnetenwatchUrl: null,
    letterText: "Sehr geehrte Frau Mustermann,\n\nbitte setzen Sie sich für sichere Radwege ein.\n\nMit freundlichen Grüßen,\nMax",
    issueText: "Sichere Radwege",
  };
}

describe("letter email variant CTA", () => {
  it("links to the no-storage variant flow with email only in the hash", () => {
    const html = buildEmailHtml(makeParams());

    expect(html).toContain("Nicht ganz dein Ton? Hier deinen &rarr;");
    expect(html).toContain("Briefentwurf schnell anpassen");
    expect(html).toContain(
      "https://www.brief-nach-berlin.de/brief/anpassen#email=test%2Bvariant%40example.com"
    );
    expect(html).not.toContain("briefText=");
    expect(html).not.toContain("letterText=");
  });
});
