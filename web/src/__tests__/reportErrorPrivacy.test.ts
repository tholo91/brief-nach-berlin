jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(async () => "127.0.0.1"),
  hashIdentifier: jest.fn(() => "ip-hash"),
  LIMITS: { REPORT_ERROR_PER_IP: { max: 5, windowMs: 600_000 } },
}));
jest.mock("@/lib/email/sendErrorReportEmail", () => ({
  sendErrorReportEmail: jest.fn(async () => ({ success: true })),
}));

import { reportErrorAction } from "@/lib/actions/reportError";
import { sendErrorReportEmail } from "@/lib/email/sendErrorReportEmail";

describe("error report privacy boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("drops free text, console output, stack content and URL queries before email", async () => {
    const privateText = "Mein vollständiges politisches Anliegen und mein Brieftext";
    await reportErrorAction({
      httpStatus: 500,
      serverMessage: privateText,
      errorId: "abc123",
      detail: { name: "ProviderError", message: privateText, stack: privateText, status: 503 },
      clientError: privateText,
      consoleLogs: [{ level: "error", ts: "2026-09-02T12:00:00Z", msg: privateText }],
      context: { plz: "28203", email: "test@example.org", politicianId: 1, retryCount: 1 },
      userAgent: "Test Browser",
      pageUrl: `https://brief-nach-berlin.de/app?issue=${encodeURIComponent(privateText)}`,
    });

    const payload = jest.mocked(sendErrorReportEmail).mock.calls[0]![0];
    expect(JSON.stringify(payload)).not.toContain(privateText);
    expect(payload).toMatchObject({
      serverMessage: "HTTP 500",
      clientError: "Client- oder Netzwerkfehler",
      consoleLogs: [],
      detail: { name: "ProviderError", status: 503 },
      pageUrl: "https://brief-nach-berlin.de/app",
    });
  });

  it("keeps only an allow-listed Mistral stage", async () => {
    await reportErrorAction({
      httpStatus: 502,
      detail: { name: "MistralStageError", status: 400, stage: "generation", body: "private" },
      context: { plz: "28203", email: "test@example.org", politicianId: 1, retryCount: 1 },
    });

    const payload = jest.mocked(sendErrorReportEmail).mock.calls[0]![0];
    expect(payload.detail).toEqual({ name: "MistralStageError", status: 400, stage: "generation" });
  });
});
