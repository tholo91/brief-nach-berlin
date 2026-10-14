const mockSendTransacEmail = jest.fn();
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: (...args: unknown[]) => mockSendTransacEmail(...args) },
  })),
}));

import { CONTACT } from "@/lib/contact";

type NoticeModule = typeof import("@/lib/email/sendCampaignEndedAdminNotice");

const params = {
  slug: "sichere-schulwege",
  title: 'Schulwege <script>alert("t")</script>',
  letterCount: 120,
  creatorName: "<b>Initiative</b>",
};

describe("campaign ended admin notice", () => {
  const originalKey = process.env.BREVO_API_KEY;
  const originalThomas = process.env.THOMAS_MAIL;
  let mod: NoticeModule;

  beforeAll(async () => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.THOMAS_MAIL = "thomas@example.org";
    mod = await import("@/lib/email/sendCampaignEndedAdminNotice");
  });

  afterAll(() => {
    if (originalKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = originalKey;
    if (originalThomas === undefined) delete process.env.THOMAS_MAIL;
    else process.env.THOMAS_MAIL = originalThomas;
  });

  beforeEach(() => {
    mockSendTransacEmail.mockReset();
    mockSendTransacEmail.mockResolvedValue({});
  });

  it("names the command to prepare the closing mail from 10 letters", () => {
    const html = mod.buildCampaignEndedAdminNoticeHtml(params);

    expect(html).toContain("Abschluss-Mail vorbereiten:");
    expect(html).toContain(
      "cd web &amp;&amp; npx tsx scripts/send-campaign-ended-mail.ts --slug sichere-schulwege --preview-to-me",
    );
    expect(html).toContain("Briefe: 120");
    expect(html).not.toMatch(/[–—]/);
  });

  it("says no closing mail is planned below 10 letters", () => {
    const html = mod.buildCampaignEndedAdminNoticeHtml({ ...params, letterCount: 9 });

    expect(html).toContain("Unter 10 Briefen: keine Abschluss-Mail vorgesehen.");
    expect(html).not.toContain("Abschluss-Mail vorbereiten:");
  });

  it("escapes title and creator name and falls back for a missing name", () => {
    const html = mod.buildCampaignEndedAdminNoticeHtml(params);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Initiative</b>");
    expect(html).toContain("&lt;b&gt;Initiative&lt;/b&gt;");
    expect(mod.buildCampaignEndedAdminNoticeHtml({ ...params, creatorName: null })).toContain(
      "ohne Namen",
    );
  });

  it("sends to Thomas only, tagged, with no creator address", async () => {
    await expect(mod.sendCampaignEndedAdminNotice(params)).resolves.toEqual({ success: true });

    const payload = mockSendTransacEmail.mock.calls[0]![0];
    expect(payload.to).toEqual([{ email: "thomas@example.org" }]);
    expect(payload.tags).toEqual(["campaign-ended-admin"]);
    expect(payload.subject).toBe("[BnB Kampagne beendet] sichere-schulwege");
    expect(payload.replyTo).toBeUndefined();
    expect(payload.bcc).toBeUndefined();
  });

  it("falls back to the contact address and resolves success false on errors", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    delete process.env.THOMAS_MAIL;
    try {
      await mod.sendCampaignEndedAdminNotice(params);
      expect(mockSendTransacEmail.mock.calls[0]![0].to).toEqual([{ email: CONTACT.email }]);

      mockSendTransacEmail.mockRejectedValue(new Error("boom"));
      await expect(mod.sendCampaignEndedAdminNotice(params)).resolves.toEqual({ success: false });
    } finally {
      process.env.THOMAS_MAIL = "thomas@example.org";
      spy.mockRestore();
    }
  });
});
