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
});
