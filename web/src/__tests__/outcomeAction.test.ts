jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(async () => "203.0.113.5"),
  hashIdentifier: jest.fn(() => "ip-hash"),
}));

import { getServiceRoleClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { submitOutcomeAction } from "@/lib/actions/submitOutcome";
import { createRueckmeldungToken, RUECKMELDUNG_COHORT } from "@/lib/rueckmeldung/token";

const rpc = jest.fn<Promise<{ error: { message: string } | null }>, []>(async () => ({ error: null }));
const fullAnswers = {
  letterSent: "handwritten" as const, notSentReason: null, replyChannels: ["none"] as const,
  replyAddressed: null, replyFeeling: null, issueScope: "local" as const, expectation: "answer" as const,
  politicalSelfEfficacy: "rather_yes" as const, writeAgain: "yes" as const,
};

describe("submitOutcomeAction", () => {
  const previous = { secret: process.env.FEEDBACK_TOKEN_SECRET, salt: process.env.REVIEW_IP_SALT };
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FEEDBACK_TOKEN_SECRET = "test-secret";
    process.env.REVIEW_IP_SALT = "test-ip-salt";
    (getServiceRoleClient as jest.Mock).mockReturnValue({ rpc });
    (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true });
  });
  afterAll(() => {
    if (previous.secret === undefined) delete process.env.FEEDBACK_TOKEN_SECRET; else process.env.FEEDBACK_TOKEN_SECRET = previous.secret;
    if (previous.salt === undefined) delete process.env.REVIEW_IP_SALT; else process.env.REVIEW_IP_SALT = previous.salt;
  });

  it("writes a signed token identity and cohort through the guarded RPC", async () => {
    const token = createRueckmeldungToken("writer@example.org");
    const result = await submitOutcomeAction({ mode: "progress", token, entryChoice: "yes", processingConsent: true, answers: fullAnswers, lastStep: "reply" });
    expect(result).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith("submit_letter_outcome", expect.objectContaining({
      p_mode: "progress", p_email: "writer@example.org", p_cohort: RUECKMELDUNG_COHORT,
      p_entry_choice: "yes", p_processing_consent: true, p_answers: expect.objectContaining({ letterSent: "handwritten" }),
    }));
  });
  it("initial saves contain no answer, free text, or consent even if supplied", async () => {
    const result = await submitOutcomeAction({
      mode: "initial", token: createRueckmeldungToken("writer@example.org"), entryChoice: "no",
      answers: fullAnswers, body: "private text", consent: true, displayName: "Name", callOk: true,
    });
    expect(result).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith("submit_letter_outcome", expect.objectContaining({
      p_mode: "initial", p_entry_choice: "no", p_answers: {}, p_body: null,
      p_consent: null, p_display_name: null, p_call_ok: null, p_processing_consent: false,
    }));
  });
  it.each([
    ["yes", { ...fullAnswers, letterSent: "typed", replyChannels: ["email"], replyAddressed: "partly", replyFeeling: "as_expected" }],
    ["no", { ...fullAnswers, letterSent: "not_sent", notSentReason: "no_time", replyChannels: [], replyAddressed: null }],
    ["not_sent", { ...fullAnswers, letterSent: "handwritten", replyChannels: ["none"], replyAddressed: null }],
  ] as const)("allows the user to update the mail entry choice %s using actual answers", async (entryChoice, answers) => {
    const result = await submitOutcomeAction({ mode: "full", token: createRueckmeldungToken("writer@example.org"), entryChoice, processingConsent: true, answers, consent: false, callOk: false });
    expect(result).toEqual({ success: true });
  });
  it("requires at least one reply choice for a sent letter", async () => {
    const result = await submitOutcomeAction({
      mode: "full", token: createRueckmeldungToken("writer@example.org"), entryChoice: "yes", processingConsent: true,
      answers: { ...fullAnswers, replyChannels: [], replyAddressed: null }, consent: false, callOk: false,
    });
    expect(result).toMatchObject({ error: "validation" });
    expect(rpc).not.toHaveBeenCalled();
  });
  describe("replyFeeling", () => {
    const send = (mode: "full" | "progress", answers: object) => submitOutcomeAction({
      mode, token: createRueckmeldungToken("writer@example.org"), entryChoice: "yes", processingConsent: true,
      answers, ...(mode === "full" ? { consent: false, callOk: false } : {}),
    });
    const replied = { ...fullAnswers, replyChannels: ["email"], replyAddressed: "partly" };

    it("requires a feeling when a reply came", async () => {
      const result = await send("full", { ...replied, replyFeeling: null });
      expect(result).toEqual({ error: "validation", message: "Bitte beantworte noch, wie die Reaktion für dich war." });
      expect(rpc).not.toHaveBeenCalled();
    });
    it.each([
      ["no reply", { ...fullAnswers, replyChannels: ["none"], replyFeeling: "disappointing" }],
      ["letter not sent", { ...fullAnswers, letterSent: "not_sent", notSentReason: "no_time", replyChannels: [], replyFeeling: "as_expected" }],
    ])("rejects a feeling without a reply (%s)", async (_label, answers) => {
      const result = await send("full", answers);
      expect(result).toMatchObject({ error: "validation" });
      expect(rpc).not.toHaveBeenCalled();
    });
    it("passes the feeling to the RPC when a reply came", async () => {
      const result = await send("full", { ...replied, replyFeeling: "glad_someone_answered" });
      expect(result).toEqual({ success: true });
      expect(rpc).toHaveBeenCalledWith("submit_letter_outcome", expect.objectContaining({
        p_answers: expect.objectContaining({ replyFeeling: "glad_someone_answered" }),
      }));
    });
    it("nulls the feeling in progress saves when the letter was not sent", async () => {
      await send("progress", { ...fullAnswers, letterSent: "not_sent", notSentReason: "no_time", replyChannels: [], replyFeeling: "positive_surprise" });
      expect(rpc).toHaveBeenCalledWith("submit_letter_outcome", expect.objectContaining({
        p_answers: expect.objectContaining({ replyFeeling: null }),
      }));
    });
    it("nulls the feeling in progress saves when no reply came", async () => {
      await send("progress", { ...fullAnswers, replyChannels: ["none"], replyFeeling: "positive_surprise" });
      expect(rpc).toHaveBeenCalledWith("submit_letter_outcome", expect.objectContaining({
        p_answers: expect.objectContaining({ replyFeeling: null }),
      }));
    });
    it("nulls the feeling in progress saves while no reply channel is chosen yet", async () => {
      await send("progress", { ...fullAnswers, replyChannels: [], replyFeeling: "positive_surprise" });
      expect(rpc).toHaveBeenCalledWith("submit_letter_outcome", expect.objectContaining({
        p_answers: expect.objectContaining({ replyFeeling: null }),
      }));
    });
    it("rejects unknown feeling values", async () => {
      const result = await send("full", { ...replied, replyFeeling: "great" });
      expect(result).toMatchObject({ error: "validation" });
      expect(rpc).not.toHaveBeenCalled();
    });
  });
  it("uses separate generous progressive and final rate-limit buckets", async () => {
    const token = createRueckmeldungToken("writer@example.org");
    for (let i = 0; i < 6; i++) {
      await submitOutcomeAction({ mode: "progress", token, entryChoice: "yes", processingConsent: true, answers: fullAnswers });
    }
    await submitOutcomeAction({ mode: "full", token, entryChoice: "yes", processingConsent: true, answers: fullAnswers, consent: false, callOk: false });
    expect(checkRateLimit).toHaveBeenNthCalledWith(6, "outcome:progress:ip:ip-hash", 120, 60 * 60_000);
    expect(checkRateLimit).toHaveBeenNthCalledWith(7, "outcome:full:ip:ip-hash", 10, 60 * 60_000);
    expect(rpc).toHaveBeenCalledTimes(7);
  });
  it("requires the salted IP hash secret before writing", async () => {
    delete process.env.REVIEW_IP_SALT;
    const log = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await submitOutcomeAction({ mode: "initial", token: createRueckmeldungToken("writer@example.org"), entryChoice: "yes" });
    expect(result).toMatchObject({ error: "server_error" });
    expect(rpc).not.toHaveBeenCalled();
    log.mockRestore();
  });
  it("does not log database error details that could contain personal data", async () => {
    rpc.mockResolvedValueOnce({ error: { message: "writer@example.org leaked" } });
    const log = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await submitOutcomeAction({ mode: "initial", token: createRueckmeldungToken("writer@example.org"), entryChoice: "yes" });
    expect(result).toMatchObject({ error: "server_error" });
    expect(log.mock.calls.flat().join(" ")).not.toContain("writer@example.org");
    log.mockRestore();
  });
  it("does not retain an optional display name without publication consent", async () => {
    await submitOutcomeAction({ mode: "full", token: createRueckmeldungToken("writer@example.org"), entryChoice: "yes", processingConsent: true, answers: fullAnswers, consent: false, displayName: "Name", callOk: false });
    expect(rpc).toHaveBeenCalledWith("submit_letter_outcome", expect.objectContaining({ p_display_name: null }));
  });
  it("rejects incomplete full submissions before writing", async () => {
    const result = await submitOutcomeAction({ mode: "full", token: createRueckmeldungToken("writer@example.org"), entryChoice: "yes", processingConsent: true, answers: { ...fullAnswers, issueScope: null }, consent: false, callOk: false });
    expect(result).toMatchObject({ error: "validation" });
    expect(rpc).not.toHaveBeenCalled();
  });
  it("requires separate processing consent before any answer collection", async () => {
    const result = await submitOutcomeAction({ mode: "progress", token: createRueckmeldungToken("writer@example.org"), entryChoice: "yes", answers: fullAnswers });
    expect(result).toMatchObject({ error: "validation" });
    expect(rpc).not.toHaveBeenCalled();
  });
  it("rejects invalid signed tokens", async () => {
    const result = await submitOutcomeAction({ mode: "initial", token: "invalid-token-that-is-long-enough", entryChoice: "yes" });
    expect(result).toMatchObject({ error: "invalid_token" });
    expect(rpc).not.toHaveBeenCalled();
  });
});
