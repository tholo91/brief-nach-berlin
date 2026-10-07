/**
 * Nutzungsbedingungen-Hinweis + KI-Kennzeichnung (AI Act Art. 50 Abs. 2) in der Entwurfs-Mail.
 * Der Brieftext selbst darf dadurch nicht verändert werden.
 */

import { buildEmailHtml, buildLetterEmailText } from "@/lib/email/buildEmailHtml";
import { buildVariantEmailHtml } from "@/lib/email/buildVariantEmailHtml";
import { AI_CONTENT_EMAIL_HEADERS } from "@/lib/email/aiContentMarking";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

const letterText = "Sehr geehrte Frau Müller,\n\nTestbrief.\n\nMit freundlichen Grüßen";

function params(overrides: Partial<SendLetterEmailParams> = {}): SendLetterEmailParams {
  return {
    recipientEmail: "test@example.org",
    politicianName: "Anna Müller",
    politicianFirstName: "Anna",
    politicianLastName: "Müller",
    politicianTitle: null,
    politicianParty: "SPD",
    politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
    politicianAbgeordnetenwatchUrl: "https://www.abgeordnetenwatch.de/profile/anna-mueller",
    recipientKind: "mdb",
    letterText,
    issueText: "Testanliegen",
    ...overrides,
  };
}

describe("Entwurfs-Mail: Hinweis und Nutzungsbedingungen", () => {
  it("HTML enthält den neuen Hinweis mit Link auf die Nutzungsbedingungen", () => {
    const html = buildEmailHtml(params());
    expect(html).toContain("Dieser Entwurf ist von KI erstellt und ohne Gewähr. Bitte prüfe Inhalt, Fakten und Adresse");
    expect(html).toContain(", bevor du deinen Brief schreibst. Die Verantwortung für den Inhalt liegt bei dir.");
    expect(html).toContain("/nutzungsbedingungen\"");
    expect(html).toContain("Es gelten die <a");
    expect(html).not.toContain("Diese Mail ist ein generierter Entwurf");
  });

  it("Text-Version enthält Hinweis und Link auf die Nutzungsbedingungen", () => {
    const text = buildLetterEmailText(params());
    expect(text).toContain("Hinweis: Dieser Entwurf ist von KI erstellt und ohne Gewähr.");
    expect(text).toContain("Es gelten die Nutzungsbedingungen. ");
    expect(text).toContain("/nutzungsbedingungen");
  });

  it("englische und türkische Mail haben ebenfalls einen Hinweis mit Link", () => {
    expect(buildEmailHtml(params({ locale: "en" }))).toContain("terms of use (in German)</a> apply.");
    expect(buildEmailHtml(params({ locale: "tr" }))).toContain("Kullanım koşulları (Almanca)</a> geçerlidir.");
  });
});

describe("Entwurfs-Mail: maschinenlesbare KI-Kennzeichnung", () => {
  it("Brief-Mail und Varianten-Mail tragen Meta-Tag und markierten Briefblock", () => {
    for (const html of [buildEmailHtml(params()), buildVariantEmailHtml(letterText)]) {
      expect(html).toContain('<meta name="ai-generated" content="true">');
      expect(html).toContain("trainedAlgorithmicMedia");
      expect(html).toContain('data-ai-generated="true"');
    }
  });

  it("Header-Kennung ist gesetzt", () => {
    expect(AI_CONTENT_EMAIL_HEADERS["X-AI-Generated"]).toBe("true");
  });

  it("der Brieftext in der Text-Version bleibt unverändert", () => {
    expect(buildLetterEmailText(params()).startsWith("Sehr geehrte Frau Müller,\n\nTestbrief.")).toBe(true);
  });
});
