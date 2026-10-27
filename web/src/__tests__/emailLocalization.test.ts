import { APP_URL } from "@/lib/config";
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

    const url = `${APP_URL}/kampagne/afd-vor-gericht`;
    expect(html).toContain(`Teil der <a href="${url}"`);
    expect(html).toContain(">Kampagne von <strong>AfD vor Gericht</strong></a>.");
    expect(html).not.toContain("wurde von");
    expect(html.split(`${url}"`).length - 1).toBe(1);
    expect(html.includes("Mit dir sind es schon")).toBe(shown);
    expect(html).toContain("Danke dir \u2764\uFE0F");
    if (campaignLetterCount === 1234) expect(html).toContain("Mit dir sind es schon <strong>1.234 Briefe</strong>.");
  });

  it("names a public campaign without creator in German", () => {
    const html = buildEmailHtml({
      ...params("de"),
      campaign: { slug: "afd-vor-gericht", title: "AfD vor Gericht" },
    });

    expect(html).toContain("Teil einer <a href=");
    expect(html).toContain(">öffentlichen Kampagne</a>.");
  });

  it("uses the same campaign structure in English", () => {
    const html = buildEmailHtml({
      ...params("en"),
      campaign: { slug: "afd-vor-gericht", title: "AfD vor Gericht", creatorName: "AfD vor Gericht" },
      campaignLetterCount: 30,
    });

    expect(html).toContain("Part of the <a href=");
    expect(html).toContain(">campaign by <strong>AfD vor Gericht</strong></a>.");
    expect(html).toContain("With you, there are already <strong>30 letters</strong>.");
    expect(html).toContain("Thank you \u2764\uFE0F");
  });

  describe("campaign logo", () => {
    const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    beforeEach(() => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    });

    afterEach(() => {
      if (originalSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      else process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    });

    it("shows the logo at 40x40 when the campaign has one", () => {
      const html = buildEmailHtml({
        ...params("de"),
        campaign: {
          slug: "afd-vor-gericht",
          title: "AfD vor Gericht",
          creatorName: "AfD vor Gericht",
          logoPath: "afd-vor-gericht/logo.webp",
        },
      });

      expect(html).toContain(
        'src="https://example.supabase.co/storage/v1/object/public/campaign-logos/afd-vor-gericht/logo.webp"',
      );
      expect(html).toContain('alt="AfD vor Gericht"');
      expect(html).toContain('width="40"');
      expect(html).toContain('height="40"');
    });

    it("leaves out the logo when the campaign has none", () => {
      const html = buildEmailHtml({
        ...params("de"),
        campaign: { slug: "afd-vor-gericht", title: "AfD vor Gericht", creatorName: "AfD vor Gericht" },
      });

      expect(html).not.toContain("campaign-logos/");
    });
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
