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

  it("Jugend: Sterne-Bewertung mit Minimal-Token, aber kein Spendenlink in HTML und Text, Löschlink bleibt", async () => {
    const { params } = await prepare("jung");
    const html = buildEmailHtml(params);
    const text = buildLetterEmailText(params);

    expect(params.audience).toBe("jung");
    expect(params.feedbackToken).toBe("signed-feedback-token");
    expect(html).toContain("/feedback?r=");
    for (const output of [html, text]) {
      expect(output).not.toContain(DONATION_PROVIDER_URL);
    }
    expect(html).toContain("/datenloeschen");
    expect(text).toContain("/datenloeschen");
    expect(text).toContain("Test.");
  });

  it("Jugend: signierter Token enthält weder E-Mail noch PLZ, Brief- oder Politiker-ID", async () => {
    const { signFeedbackToken } = await import("@/lib/feedback/token");
    (signFeedbackToken as jest.Mock).mockClear();
    const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
    prepareLetterEmail({
      recipientEmail: "schueler@example.org",
      recipient: getLandesregierungRecipient("HB")!,
      letterText: "Test",
      issueText: "Test",
      debug: { klasse: 8, userEmail: "schueler@example.org", plz: "28195", letterId: "abc", politicianId: 7 } as never,
      letterId: "abc",
      audience: "jung",
    });
    const payloads = (signFeedbackToken as jest.Mock).mock.calls.map((c) => c[0]);
    const youthPayload = payloads[payloads.length - 1];

    expect(youthPayload).toMatchObject({ audience: "jung", klasse: 8 });
    expect(typeof youthPayload.nonce).toBe("string");
    expect(JSON.stringify(youthPayload)).not.toMatch(/schueler@|28195|abc|politicianId|letterId|userEmail/);
  });

  it("Jugend: eigene Einleitung ohne Bewertungsbitte, Teilen führt auf /schule", async () => {
    const { params } = await prepare("jung");
    const html = buildEmailHtml(params);

    expect(html).toContain("Nimm diesen Entwurf als Vorlage");
    expect(html).toContain("Handgeschriebene Briefe fallen auf.");
    expect(html).not.toContain("Bitte bewerte anschließend");
    expect(html).toContain("Je mehr junge Menschen schreiben");
    expect(html).toContain(encodeURIComponent("/schule"));
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
