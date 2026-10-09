jest.mock("server-only", () => ({}), { virtual: true });

const mockSendTransacEmail = jest.fn();
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: (...args: unknown[]) => mockSendTransacEmail(...args) },
  })),
}));
jest.mock("@/lib/campaigns/repository", () => ({
  getActiveCampaignBySlug: jest.fn(),
}));

let mockClientIp = "203.0.113.1";
jest.mock("@/lib/rateLimit", () => ({
  ...jest.requireActual("@/lib/rateLimit"),
  getClientIp: async () => mockClientIp,
}));

import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import { FOUNDER_EMAIL } from "@/lib/config";

type ReportAction = typeof import("@/lib/actions/reportCampaign").reportCampaignAction;

const CREATOR = "creator@example.org";
const THOMAS = "thomas@example.org";
const REPORTER = "melder@example.org";

const campaign = {
  slug: "sichere-schulwege",
  title: "Sichere Schulwege",
  creatorEmail: CREATOR,
  creatorName: "Initiative Beispiel",
  status: "active",
};

const validInput = {
  slug: "sichere-schulwege",
  reason: "falsche-angaben",
  role: "briefschreiber",
  message: "Die Adresse im Brief stimmt nicht mehr.",
  goodFaith: true,
};

describe("reportCampaignAction", () => {
  const originalBrevoKey = process.env.BREVO_API_KEY;
  const originalThomasMail = process.env.THOMAS_MAIL;
  let reportCampaignAction: ReportAction;
  let ipCounter = 0;

  beforeAll(async () => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.THOMAS_MAIL = THOMAS;
    ({ reportCampaignAction } = await import("@/lib/actions/reportCampaign"));
  });

  afterAll(() => {
    if (originalBrevoKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = originalBrevoKey;
    if (originalThomasMail === undefined) delete process.env.THOMAS_MAIL;
    else process.env.THOMAS_MAIL = originalThomasMail;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ipCounter += 1;
    mockClientIp = `198.51.100.${ipCounter}`;
    mockSendTransacEmail.mockResolvedValue({ messageId: "m1" });
    (getActiveCampaignBySlug as jest.Mock).mockResolvedValue(campaign);
  });

  it("mails the creator with BCC to Thomas and replyTo the founder address", async () => {
    const result = await reportCampaignAction(validInput);

    expect(result).toEqual({ success: true });
    expect(mockSendTransacEmail).toHaveBeenCalledTimes(1);
    const payload = mockSendTransacEmail.mock.calls[0][0];
    expect(payload.to).toEqual([{ email: CREATOR }]);
    expect(payload.bcc).toEqual([{ email: THOMAS }]);
    expect(payload.replyTo).toEqual({ email: FOUNDER_EMAIL });
    expect(payload.tags).toContain("campaign-report");
    expect(payload.htmlContent).toContain("Falsche Angaben");
    expect(payload.htmlContent).toContain("Briefschreiber:in");
    expect(payload.htmlContent).toContain("Die Adresse im Brief stimmt nicht mehr.");
    expect(payload.htmlContent).toContain("Ich melde mich, falls etwas zu tun ist");
  });

  it("never returns the creator email", async () => {
    const result = await reportCampaignAction(validInput);
    expect(JSON.stringify(result)).not.toContain(CREATOR);
  });

  it("sends admin and receipt mails only when a reporter email is given", async () => {
    const result = await reportCampaignAction({ ...validInput, reporterEmail: REPORTER });

    expect(result).toEqual({ success: true });
    expect(mockSendTransacEmail).toHaveBeenCalledTimes(3);
    const payloads = mockSendTransacEmail.mock.calls.map((call) => call[0]);

    const creatorMail = payloads.find((p) => p.to[0].email === CREATOR);
    const adminMail = payloads.find((p) => p.to[0].email === THOMAS);
    const receiptMail = payloads.find((p) => p.to[0].email === REPORTER);
    expect(creatorMail).toBeDefined();
    expect(adminMail).toBeDefined();
    expect(receiptMail).toBeDefined();

    expect(JSON.stringify(creatorMail)).not.toContain(REPORTER);
    expect(JSON.stringify(adminMail)).toContain(REPORTER);
    expect(JSON.stringify(adminMail)).toContain("sichere-schulwege");
    expect(JSON.stringify(receiptMail)).not.toContain(CREATOR);
    expect(JSON.stringify(receiptMail)).not.toContain("Die Adresse im Brief stimmt nicht mehr.");
  });

  it("treats an empty reporter email as not given", async () => {
    const result = await reportCampaignAction({ ...validInput, reporterEmail: "  " });
    expect(result).toEqual({ success: true });
    expect(mockSendTransacEmail).toHaveBeenCalledTimes(1);
  });

  it("escapes HTML in the message", async () => {
    await reportCampaignAction({ ...validInput, message: "<script>alert(1)</script> bitte prüfen" });
    const html: string = mockSendTransacEmail.mock.calls[0][0].htmlContent;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it.each([
    ["message too short", { message: "zu kurz" }],
    ["message too long", { message: "a".repeat(1001) }],
    ["unknown reason", { reason: "spam" }],
    ["unknown role", { role: "chef" }],
    ["invalid reporter email", { reporterEmail: "kein-mail" }],
    ["goodFaith false", { goodFaith: false }],
    ["goodFaith missing", { goodFaith: undefined }],
    ["invalid slug", { slug: "!!!" }],
  ])("rejects input without sending: %s", async (_name, override) => {
    const result = await reportCampaignAction({ ...validInput, ...override });
    expect(result).toEqual({ success: false });
    expect(mockSendTransacEmail).not.toHaveBeenCalled();
  });

  it("rejects non-object input", async () => {
    expect(await reportCampaignAction(null)).toEqual({ success: false });
    expect(mockSendTransacEmail).not.toHaveBeenCalled();
  });

  it("fails without sending when the campaign is unknown or inactive", async () => {
    (getActiveCampaignBySlug as jest.Mock).mockResolvedValue(null);
    expect(await reportCampaignAction(validInput)).toEqual({ success: false });
    expect(mockSendTransacEmail).not.toHaveBeenCalled();
  });

  it("fails without sending when the repository throws", async () => {
    (getActiveCampaignBySlug as jest.Mock).mockRejectedValue(new Error("db down"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await reportCampaignAction(validInput)).toEqual({ success: false });
    expect(mockSendTransacEmail).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("sends no extra mails when the creator mail fails", async () => {
    mockSendTransacEmail.mockRejectedValue(new Error("brevo down"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await reportCampaignAction({ ...validInput, reporterEmail: REPORTER });
    expect(result).toEqual({ success: false });
    expect(mockSendTransacEmail).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });

  it("rejects the 4th report from the same IP within an hour", async () => {
    mockClientIp = "192.0.2.77";
    for (let i = 0; i < 3; i += 1) {
      expect(await reportCampaignAction(validInput)).toEqual({ success: true });
    }
    mockSendTransacEmail.mockClear();
    expect(await reportCampaignAction(validInput)).toEqual({ success: false });
    expect(mockSendTransacEmail).not.toHaveBeenCalled();
  });
});
