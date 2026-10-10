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
    ["de", "Briefmarke drauf (0,95 EUR, ", "online kaufen</a>) + ab in den Briefkasten!"],
    ["en", "Add a stamp (€0.95, ", "buy online</a>) + into the postbox!"],
    ["tr", "Pul yapıştırın (0,95 €, ", "online satın al</a>) + posta kutusuna atın!"],
  ] as const)("links the stamp purchase in step 3 for %s", (locale, lead, linkTail) => {
    const html = buildEmailHtml(params(locale));

    expect(html).toContain(lead);
    expect(html).toContain(linkTail);
    expect(html).toContain("deutschepost.de/de/m/mobile-briefmarke.html");
  });

  it.each([
    [25, true],
    [1234, true],
    [24, false],
    [undefined, false],
  ] as const)("shows the campaign letter count %s: %s", (campaignLetterCount, shown) => {
    const html = buildEmailHtml({
      ...params("de"),
      campaign: { slug: "afd-vor-gericht", title: "AfD vor Gericht", creatorName: "AfD vor Gericht" },
      campaignLetterCount,
    });

    expect(html).toContain("Diese Kampagne wurde von <strong>AfD vor Gericht</strong> gestartet.");
    expect(html.includes("Mit deinem Engagement sind es schon")).toBe(shown);
    if (campaignLetterCount === 1234) expect(html).toContain("<strong>1.234 Briefe</strong>");
  });

  it("uses the short step copy on mobile", () => {
    const html = buildEmailHtml(params("de"));

    expect(html).toContain("Adressen auf den Umschlag");
    expect(html).toContain("Briefmarke (<a");
    expect(html).toContain("hier kaufen</a>) + ab die Post");
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
