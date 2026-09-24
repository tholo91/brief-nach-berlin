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
import { signFeedbackToken } from "@/lib/feedback/token";
import { buildEmailHtml, buildLetterEmailText } from "@/lib/email/buildEmailHtml";

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

  it("zeigt bei Personenwahl Name und Amt im kopierbaren E-Mail-Anschriftblock", async () => {
    const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
    const recipient = getLandesregierungRecipient("HB", "head")!;
    const { params } = prepareLetterEmail({
      recipientEmail: "test@example.org",
      recipient,
      letterText: `${recipient.salutation}\n\nTest.`,
      issueText: "Testanliegen",
      debug: {} as never,
    });

    expect(params).toMatchObject({
      recipientKind: "landesregierung",
      politicianName: recipient.headName,
      politicianTitle: recipient.headTitle,
      politicianPostalAddress: recipient.postalAddress,
      governmentSource: {
        addressee: "head",
        addressLines: recipient.address.addressLines,
        url: recipient.address.sourceUrl,
      },
    });
    const html = buildEmailHtml(params);
    const [nameLine, ...otherLines] = recipient.address.addressLines;
    expect(html).toContain(`<strong>${nameLine}</strong><br>`);
    expect(html).toContain(otherLines.join("<br>"));
    expect(html).toContain(recipient.salutation);
    expect(html).toContain(recipient.address.sourceUrl);
    expect(html).not.toContain("abgeordnetenwatch.de/profile");
    expect(buildLetterEmailText(params)).toContain(
      `Postanschrift:\n${recipient.address.addressLines.join("\n")}`,
    );
  });

  it("hält den Anliegen-Auszug aus dem Feedback-Token heraus", async () => {
    const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
    prepareLetterEmail({
      recipientEmail: "test@example.org",
      recipient: getLandesregierungRecipient("HB")!,
      letterText: "Testbrief",
      issueText: "Testanliegen",
      debug: { issueTextPreview: "vertraulicher Auszug" } as never,
    });

    expect(signFeedbackToken).toHaveBeenLastCalledWith({});
  });
});
