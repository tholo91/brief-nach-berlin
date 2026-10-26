jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: jest.fn() },
  })),
}));
jest.mock("@/lib/feedback/token", () => ({
  signFeedbackToken: jest.fn(() => "signed-feedback-token"),
}));

import { getLandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";
import { buildEmailHtml, buildLetterEmailText } from "@/lib/email/buildEmailHtml";
import { DONATION_PROVIDER_URL } from "@/lib/config";

describe("Briefkopie im Jugendmodus", () => {
  const originalBrevoKey = process.env.BREVO_API_KEY;

  beforeAll(() => {
    process.env.BREVO_API_KEY = "test-key";
  });

  afterAll(() => {
    if (originalBrevoKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = originalBrevoKey;
  });

  async function prepare(audience?: "jung") {
    const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
    return prepareLetterEmail({
      recipientEmail: "test@example.org",
      recipient: getLandesregierungRecipient("HB")!,
      letterText: "Sehr geehrte Damen und Herren,\n\nTest.",
      issueText: "Testanliegen",
      debug: {} as never,
      audience,
    });
  }

  it("Jugend: weder Spendenlink noch Sterne-Bewertung in HTML und Text, Löschlink bleibt", async () => {
    const { params } = await prepare("jung");
    const html = buildEmailHtml(params);
    const text = buildLetterEmailText(params);

    expect(params.audience).toBe("jung");
    expect(params.feedbackToken).toBeUndefined();
    for (const output of [html, text]) {
      expect(output).not.toContain(DONATION_PROVIDER_URL);
      expect(output).not.toContain("/feedback?r=");
    }
    expect(html).toContain("/datenloeschen");
    expect(text).toContain("/datenloeschen");
    expect(text).toContain("Test.");
  });

  it("Erwachsene: Sterne-Bewertung bleibt, Spendenbitte steht nur noch in der Follow-up-Mail", async () => {
    const { params } = await prepare();
    const html = buildEmailHtml(params);
    const text = buildLetterEmailText(params);

    expect(params.audience).toBeUndefined();
    expect(params.feedbackToken).toBe("signed-feedback-token");
    expect(html).toContain("/feedback?r=");
    expect(html).not.toContain(DONATION_PROVIDER_URL);
    expect(text).not.toContain(DONATION_PROVIDER_URL);
  });
});
