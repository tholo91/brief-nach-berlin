jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(async () => "127.0.0.1"),
  hashIdentifier: jest.fn(() => "ip-hash"),
  LIMITS: {
    LETTER_SIGNALS_PER_IP: { max: 20, windowMs: 3_600_000 },
    LETTER_SIGNALS_PER_EMAIL: { max: 10, windowMs: 86_400_000 },
  },
}));

import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  createLetterSignalAction,
  markLetterSignalGeneratedAction,
} from "@/lib/actions/letterSignals";
import { createGenerationProof, createLetterSignalContext } from "@/lib/letterSignals/token";
import type { LetterSignalContext } from "@/lib/letterSignals/types";
import { createLetterSignalEmailHash } from "@/lib/letterSignals/emailHash";
import { getPlzMapPoint } from "@/lib/letterSignals/plzMapPoint";
import { checkRateLimit } from "@/lib/rateLimit";

const TEST_EMAIL = "person@example.org";
const TEST_EMAIL_SECRET = "test-letter-signal-email-secret";
const context: LetterSignalContext = {
  letterId: "6f5a0e93-3bb8-43cf-bb94-9bb7d0052ed0",
  plz: "28203",
  bundeslandKey: "HB",
  politicalLevel: "Land" as const,
  recipientKind: "landesregierung" as const,
  issueBinding: "b".repeat(64),
  topicCategories: ["bildung"],
  topicLabels: ["Lehrermangel"],
  topicTaxonomyVersion: "v1",
  topicSource: "routing" as const,
  topicModel: "mistral-small-latest",
  campaignSlug: null,
  emailLookupHash: createLetterSignalEmailHash(TEST_EMAIL, TEST_EMAIL_SECRET),
};

function query(result = { data: [{ plz_prefix: "28" }], error: null }) {
  const terminal = jest.fn().mockResolvedValue({ error: null });
  const upsertSelect = jest.fn().mockResolvedValue(result);
  const upsert = jest.fn().mockReturnValue({ select: upsertSelect });
  const updateTerminal = jest.fn().mockResolvedValue({ data: [{ letter_id: context.letterId }], error: null });
  const updateEq = jest.fn().mockReturnValue({ select: updateTerminal });
  const twice = jest.fn().mockReturnValue({ eq: terminal });
  return {
    upsert,
    update: jest.fn().mockReturnValue({ eq: updateEq }),
    delete: jest.fn().mockReturnValue({ eq: twice, lt: jest.fn().mockReturnValue({ eq: terminal }) }),
  };
}

describe("letter signal lifecycle actions", () => {
  const mockedClient = jest.mocked(getServiceRoleClient);
  const originalSecret = process.env.LETTER_SIGNAL_TOKEN_SECRET;
  const originalEmailSecret = process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LETTER_SIGNAL_TOKEN_SECRET = "test-letter-signal-secret";
    process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = TEST_EMAIL_SECRET;
  });

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.LETTER_SIGNAL_TOKEN_SECRET;
    else process.env.LETTER_SIGNAL_TOKEN_SECRET = originalSecret;
    if (originalEmailSecret === undefined) delete process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;
    else process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET = originalEmailSecret;
  });

  it("stores exactly one independent contribution from a valid context", async () => {
    const builder = query();
    mockedClient.mockReturnValue({ from: jest.fn().mockReturnValue(builder) } as never);
    const token = createLetterSignalContext(context);

    await expect(
      createLetterSignalAction({ contextToken: token, email: TEST_EMAIL }),
    ).resolves.toEqual({
      success: true,
      mapPoint: { x: getPlzMapPoint("28203")![0], y: getPlzMapPoint("28203")![1] },
      created: true,
    });

    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        letter_id: context.letterId,
        status: "contributed",
        plz: "28203",
        email_normalized: TEST_EMAIL,
        email_lookup_hash: context.emailLookupHash,
        generated_at: null,
      }),
      { onConflict: "letter_id", ignoreDuplicates: true },
    );
  });

  it("confirms an existing contribution without incrementing it again", async () => {
    const builder = query({ data: [], error: null });
    mockedClient.mockReturnValue({ from: jest.fn().mockReturnValue(builder) } as never);
    const token = createLetterSignalContext(context);

    await expect(createLetterSignalAction({ contextToken: token, email: TEST_EMAIL })).resolves.toEqual({
      success: true,
      mapPoint: { x: getPlzMapPoint("28203")![0], y: getPlzMapPoint("28203")![1] },
      created: false,
    });
  });

  it("rejects a changed clear-text email before writing", async () => {
    const token = createLetterSignalContext(context);

    await expect(createLetterSignalAction({
      contextToken: token,
      email: "other@example.org",
    })).resolves.toEqual({ error: "invalid_context" });
    expect(mockedClient).not.toHaveBeenCalled();
  });

  it("rejects an invalid context before touching Supabase", async () => {
    await expect(
      createLetterSignalAction({ contextToken: "not-a-token-but-long-enough", email: TEST_EMAIL }),
    ).resolves.toEqual({ error: "invalid_context" });
    expect(mockedClient).not.toHaveBeenCalled();
  });

  it("bounds contribution writes before touching Supabase", async () => {
    jest.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false });
    const token = createLetterSignalContext(context);

    await expect(createLetterSignalAction({ contextToken: token, email: TEST_EMAIL })).resolves.toEqual({
      error: "rate_limited",
    });
    expect(mockedClient).not.toHaveBeenCalled();
  });

  it("records generation separately without changing contribution status", async () => {
    const builder = query();
    mockedClient.mockReturnValue({ from: jest.fn().mockReturnValue(builder) } as never);
    const proof = createGenerationProof(context.letterId);

    await expect(markLetterSignalGeneratedAction({ generationProof: proof })).resolves.toEqual({ success: true });
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ generated_at: expect.any(String) }));
    expect(builder.update).not.toHaveBeenCalledWith(expect.objectContaining({ status: "generated" }));
  });

  it("does not report success when the proof has no pending or generated row", async () => {
    const updateSelect = jest.fn().mockResolvedValue({ data: [], error: null });
    const updateEq = jest.fn().mockReturnValue({ select: updateSelect });
    mockedClient.mockReturnValue({
      from: jest.fn().mockReturnValue({ update: jest.fn().mockReturnValue({ eq: updateEq }) }),
    } as never);

    await expect(
      markLetterSignalGeneratedAction({ generationProof: createGenerationProof(context.letterId) }),
    ).resolves.toEqual({ error: "invalid_context" });
  });
});
