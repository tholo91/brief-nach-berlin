jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: jest.fn() },
  })),
}));
jest.mock("@/lib/feedback/token", () => ({
  signFeedbackToken: jest.fn(() => "signed-feedback-token"),
}));

import { buildEmailHtml } from "@/lib/email/buildEmailHtml";
import { getBundeskanzlerRecipient } from "@/lib/lookup/bundeskanzlerRecipient";

describe("Schreib-Merz email", () => {
  const originalBrevoKey = process.env.BREVO_API_KEY;

  beforeAll(() => {
    process.env.BREVO_API_KEY = "test-key";
  });

  afterAll(() => {
    if (originalBrevoKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = originalBrevoKey;
  });

  it("maps the trusted recipient without party or MdB profile data", async () => {
    const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
    const recipient = getBundeskanzlerRecipient();
    const { params } = prepareLetterEmail({
      recipientEmail: "test@example.org",
      recipient,
      letterText: "Sehr geehrter Herr Bundeskanzler,\n\nTest.",
      issueText: "Testanliegen",
      debug: {} as never,
    });

    expect(params).toMatchObject({
      recipientKind: "bundeskanzler",
      politicianName: "Friedrich Merz",
      politicianFirstName: "Friedrich",
      politicianLastName: "Merz",
      politicianTitle: null,
      politicianParty: null,
      politicianAbgeordnetenwatchUrl: null,
      politicianPostalAddress:
        "Bundeskanzleramt, Bundeskanzler, Friedrich Merz, Willy-Brandt-Straße 1, 10557 Berlin",
      bundeskanzlerSource: {
        title: "Kontakt zum Bundeskanzler",
        url: recipient.address.sourceUrl,
        stand: "2026-09-10",
      },
    });
  });

  it("renders the official address and source without an MdB profile", async () => {
    const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
    const { params } = prepareLetterEmail({
      recipientEmail: "test@example.org",
      recipient: getBundeskanzlerRecipient(),
      letterText: "Sehr geehrter Herr Bundeskanzler,\n\nTest.",
      issueText: "Testanliegen",
      debug: {} as never,
    });
    const html = buildEmailHtml(params);

    expect(html).toContain("Sehr geehrter Herr Bundeskanzler,");
    expect(html).toContain("<strong>Bundeskanzler Friedrich Merz</strong><br>");
    expect(html).toContain("Bundeskanzleramt<br>");
    expect(html).toContain("Willy-Brandt-Straße 1<br>10557 Berlin");
    expect(html).toContain("Kontakt zum Bundeskanzler");
    expect(html).toContain("geprüft am 10.09.2026");
    expect(html).toContain(
      'margin:8px 0 0;font-family:Georgia,\'Times New Roman\',serif;font-size:12px;color:#b0b0b0;line-height:1.4;">Quelle: <a href=',
    );
    expect(html).not.toContain(
      'font-size:12px;color:#666666;line-height:1.5;">Quelle: <a href=',
    );
    expect(html).not.toContain("abgeordnetenwatch.de/profile");
    expect(html).not.toContain(", MdB (");
  });
});
