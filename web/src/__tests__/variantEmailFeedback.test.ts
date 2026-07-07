import { buildVariantEmailHtml } from "@/lib/email/buildVariantEmailHtml";
import { FOUNDER_FEEDBACK_URL } from "@/lib/config";

describe("variant email feedback CTA", () => {
  it("adds a Heyspeak feedback button to the variant email", () => {
    const html = buildVariantEmailHtml(
      "Sehr geehrte Frau Mustermann,\n\nbitte setzen Sie sich ein.\n\nMit freundlichen Grüßen,\nMax",
      "miriam@example.com"
    );

    expect(html).toContain("War die neue Variante besser?");
    expect(html).toContain("Feedback geben");
    expect(html).toContain("email=miriam%40example.com");
    expect(html).not.toContain(`${FOUNDER_FEEDBACK_URL}?email=`);
  });

  it("adds a debug link when variant debug data is present", () => {
    const html = buildVariantEmailHtml(
      "Sehr geehrte Frau Mustermann,\n\nbitte setzen Sie sich ein.\n\nMit freundlichen Grüßen,\nMax",
      "miriam@example.com",
      {
        source: "brief_variant",
        originalToneLevel: 3,
        originalToneLabel: "sachlich-engagiert",
        requestedToneLevel: 5,
        requestedToneLabel: "konfrontativ-aber-respektvoll",
        originalLetterLength: 650,
        originalLetterWordCount: 100,
        originalLetterPreview: "Sehr geehrte Frau Mustermann",
        changeRequestLength: 12,
        changeRequestPreview: "Mehr Druck.",
        wordCount: 95,
        model: "mistral-large-latest",
        temperature: 0.35,
        generationMs: 1200,
        preservationCheck: "Fakten, Forderung, Anrede und Grußformel erhalten.",
      }
    );

    expect(html).toContain("/debug?d=");
    expect(html).toContain(">Debug</a>");
  });
});
