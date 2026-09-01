import { buildEmailHtml, buildLetterEmailSubject } from "@/lib/email/buildEmailHtml";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

function params(locale: "de" | "en" | "tr"): SendLetterEmailParams {
  return {
    locale,
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
    issueText: "Test concern",
  };
}

describe("email localization", () => {
  it.each([
    ["de", "Dein Brief nach Berlin ist fertig", "<html lang=\"de\">", true],
    ["en", "Your letter to Berlin is ready", "<html lang=\"en\">", false],
    ["tr", "Berlin'e mektubunuz hazır", "<html lang=\"tr\">", false],
  ] as const)("renders the %s letter email in its selected locale", (locale, subject, lang, hasVariantCta) => {
    const html = buildEmailHtml(params(locale));

    expect(buildLetterEmailSubject(params(locale))).toBe(subject);
    expect(html).toContain(lang);
    expect(html).toContain("Sehr geehrte Frau Müller");
    expect(html.includes("/brief/anpassen#")).toBe(hasVariantCta);
  });

  it.each([
    ["en", "How did you find your letter?", "<html lang=\"en\">", "Privacy policy (in German)"],
    ["tr", "Mektubunuzu nasıl buldunuz?", "<html lang=\"tr\">", "Gizlilik politikası (Almanca)"],
  ] as const)("marks German follow-up links in %s", (locale, subject, lang, germanLabel) => {
    const followup = buildFollowupHtml({ token: "signed-token", locale });

    expect(followup.subject).toBe(subject);
    expect(followup.html).toContain(lang);
    expect(followup.html).toContain(germanLabel);
  });
});
