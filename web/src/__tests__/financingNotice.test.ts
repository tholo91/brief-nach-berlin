import { APP_URL } from "@/lib/config";
import { buildEmailHtml } from "@/lib/email/buildEmailHtml";
import { buildFinancingNoticeHtml } from "@/lib/email/financingNotice";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";
import { SUPPORT_CONTENT, SUPPORT_EMAIL_COPY } from "@/lib/support-content";

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

describe("financing notice", () => {
  it("renders the copy, the donate link and the tracked info link", () => {
    const copy = SUPPORT_EMAIL_COPY.de;
    const html = buildFinancingNoticeHtml(copy);

    expect(html).toContain(SUPPORT_CONTENT.ctas.donate.href);
    expect(html).toContain(`${APP_URL}/spenden?src=email`);
    expect(html).toContain(copy.heading);
    expect(html).toContain(copy.button);
    expect(html).toContain(copy.infoButton);
  });

  it("escapes all copy fields", () => {
    const html = buildFinancingNoticeHtml({
      heading: `<b>"Tom's" & co</b>`,
      body: "<i>body</i>",
      button: "<u>button</u>",
      infoButton: "<s>info</s>",
      status: "<em>status</em>",
    });

    expect(html).toContain("&lt;b&gt;&quot;Tom&#39;s&quot; &amp; co&lt;/b&gt;");
    expect(html).not.toContain("<b>");
    expect(html).not.toContain("<i>");
    expect(html).not.toContain("<u>");
    expect(html).not.toContain("<s>");
    expect(html).not.toContain("<em>");
  });

  it("renders the portrait in the heading row, escaped", () => {
    const copy = SUPPORT_EMAIL_COPY.de;
    const html = buildFinancingNoticeHtml(copy, {
      src: "https://example.org/a.jpg?x=1&y=2",
      alt: `Tom "T" O'Neil`,
    });

    expect(html).toContain('<img src="https://example.org/a.jpg?x=1&amp;y=2"');
    expect(html).toContain('alt="Tom &quot;T&quot; O&#39;Neil"');
    expect(html.indexOf("<h2")).toBeLessThan(html.indexOf("<img"));
    expect(html.indexOf("<img")).toBeLessThan(html.indexOf(copy.body));
    expect(html.indexOf(copy.infoButton)).toBeLessThan(html.indexOf(copy.status));
  });

  it("renders no image without a portrait", () => {
    expect(buildFinancingNoticeHtml(SUPPORT_EMAIL_COPY.de)).not.toContain("<img");
  });

  it.each(["de", "en", "tr"] as const)("is embedded unchanged in the %s letter email", (locale) => {
    expect(buildEmailHtml(params(locale))).toContain(buildFinancingNoticeHtml(SUPPORT_EMAIL_COPY[locale]));
  });
});
