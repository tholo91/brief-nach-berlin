const mockSendTransacEmail = jest.fn();
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: (...args: unknown[]) => mockSendTransacEmail(...args) },
  })),
}));

describe("sendGlobalLetterMilestoneEmail", () => {
  const original = {
    brevo: process.env.BREVO_API_KEY,
    thomas: process.env.THOMAS_MAIL,
    password: process.env.INTERNAL_STATS_PASSWORD,
  };
  let sendGlobalLetterMilestoneEmail: typeof import("@/lib/email/sendGlobalLetterMilestoneEmail").sendGlobalLetterMilestoneEmail;

  beforeAll(async () => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.THOMAS_MAIL = "thomas@example.org";
    process.env.INTERNAL_STATS_PASSWORD = "my test password";
    ({ sendGlobalLetterMilestoneEmail } = await import(
      "@/lib/email/sendGlobalLetterMilestoneEmail"
    ));
  });

  afterAll(() => {
    if (original.brevo === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = original.brevo;
    if (original.thomas === undefined) delete process.env.THOMAS_MAIL;
    else process.env.THOMAS_MAIL = original.thomas;
    if (original.password === undefined) delete process.env.INTERNAL_STATS_PASSWORD;
    else process.env.INTERNAL_STATS_PASSWORD = original.password;
  });

  beforeEach(() => {
    mockSendTransacEmail.mockReset();
    mockSendTransacEmail.mockResolvedValue({ messageId: "message-1" });
  });

  it("sends the image-first email to THOMAS_MAIL with a password-bearing stats CTA", async () => {
    await expect(sendGlobalLetterMilestoneEmail(1000)).resolves.toEqual({
      success: true,
      messageId: "message-1",
    });

    const payload = mockSendTransacEmail.mock.calls[0]![0];
    expect(payload.to).toEqual([{ email: "thomas@example.org" }]);
    expect(payload.subject).toContain("1.000");
    expect(payload.htmlContent).toContain("/stats/meilenstein/1000/bild");
    expect(payload.htmlContent).toContain("/stats/unlock?pw=my+test+password");
    expect(payload.tags).toContain("global-letter-milestone");
  });

  it("fails closed when the stats password is not configured", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
    delete process.env.INTERNAL_STATS_PASSWORD;
    await expect(sendGlobalLetterMilestoneEmail(2000)).resolves.toEqual({ success: false });
    expect(mockSendTransacEmail).not.toHaveBeenCalled();
    process.env.INTERNAL_STATS_PASSWORD = "my test password";
    consoleError.mockRestore();
  });
});
