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

describe("prepareLetterEmail — Landesregierung", () => {
  const originalBrevoKey = process.env.BREVO_API_KEY;

  beforeAll(() => {
    process.env.BREVO_API_KEY = "test-key";
  });

  afterAll(() => {
    if (originalBrevoKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = originalBrevoKey;
  });

  it("mappt den serverseitigen Bremen-Recipient ohne Partei- oder Personenprofil", async () => {
    const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
    const recipient = getLandesregierungRecipient("HB")!;
    const { params } = prepareLetterEmail({
      recipientEmail: "test@example.org",
      recipient,
      letterText: "Sehr geehrte Damen und Herren,\n\nTest.",
      issueText: "Testanliegen",
      debug: {} as never,
    });

    expect(params).toMatchObject({
      recipientKind: "landesregierung",
      politicianName: "Senat der Freien Hansestadt Bremen",
      politicianFirstName: "",
      politicianParty: null,
      politicianAbgeordnetenwatchUrl: null,
      bundeslandKey: "HB",
      politicianPostalAddress: "Senatskanzlei Bremen, Am Markt 21, 28195 Bremen",
      governmentSource: {
        institutionKind: "senat",
        officeName: "Senatskanzlei Bremen",
        url: "https://www.rathaus.bremen.de/impressum-744",
      },
    });
  });
});
