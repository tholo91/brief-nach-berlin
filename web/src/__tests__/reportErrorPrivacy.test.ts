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
import { classifyClientError } from "@/lib/clientErrorKind";

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

  it("forwards abort context only as categories and numbers", async () => {
    const privateText = "Load failed: Mein Anliegen";
    await reportErrorAction({
      httpStatus: null,
      clientError: privateText,
      clientErrorKind: "load_failed",
      elapsedMs: 23_456,
      wasHidden: true,
      campaignSlug: "eeg-so-nicht",
      letterLength: "1.5",
      context: { plz: "28203", email: "test@example.org", politicianId: 1, retryCount: 0 },
      userAgent: "Mozilla/5.0 (iPhone) Instagram 300.0",
    });

    const payload = jest.mocked(sendErrorReportEmail).mock.calls[0]![0];
    expect(JSON.stringify(payload)).not.toContain("Mein Anliegen");
    expect(payload).toMatchObject({
      clientError: "Client- oder Netzwerkfehler",
      clientErrorKind: "load_failed",
      elapsedMs: 23_456,
      wasHidden: true,
      campaignSlug: "eeg-so-nicht",
      letterLength: "1.5",
      inAppBrowser: "Instagram",
      detail: { name: "ClientNetworkError" },
    });
  });

  it("drops invalid categories but still sends the report", async () => {
    await reportErrorAction({
      httpStatus: null,
      clientErrorKind: "Mein Anliegen als Kategorie",
      elapsedMs: 9_999_999,
      wasHidden: "ja",
      campaignSlug: "Mein Anliegen",
      letterLength: "3",
      context: { plz: "28203", email: "test@example.org", politicianId: 1, retryCount: 0 },
      userAgent: "Mozilla/5.0 (Android) Firefox/130.0",
    });

    const payload = jest.mocked(sendErrorReportEmail).mock.calls[0]![0];
    expect(JSON.stringify(payload)).not.toContain("Mein Anliegen");
    expect(payload.clientErrorKind).toBeUndefined();
    expect(payload.elapsedMs).toBeUndefined();
    expect(payload.wasHidden).toBeUndefined();
    expect(payload.campaignSlug).toBeUndefined();
    expect(payload.letterLength).toBeUndefined();
    expect(payload.inAppBrowser).toBeNull();
  });
});

describe("classifyClientError", () => {
  it.each([
    [new TypeError("Load failed"), "load_failed"],
    [new TypeError("Failed to fetch"), "failed_to_fetch"],
    [new TypeError("NetworkError when attempting to fetch resource."), "network_error"],
    [new Error("No letterText"), "no_letter_text"],
    [new SyntaxError("Unexpected end of JSON input"), "invalid_json"],
    [new Error("something else"), "other"],
  ])("maps %s", (err, kind) => {
    expect(classifyClientError(err)).toBe(kind);
  });
});
