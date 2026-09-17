jest.mock("server-only", () => ({}), { virtual: true });

const mockFrom = jest.fn();
jest.mock("@/lib/supabase/server", () => ({
  getServiceRoleClient: () => ({ from: mockFrom }),
}));

import {
  claimLetterGeneration,
  markLetterGenerationIrreversible,
} from "@/lib/generation/idempotency";

const LETTER_ID = "11111111-1111-4111-8111-111111111111";
const OWNER_TOKEN = "22222222-2222-4222-8222-222222222222";

function insertResult(error: { code: string; message: string } | null) {
  return { insert: jest.fn().mockResolvedValue({ error }) };
}

function selectionResult(data: unknown, error: { message: string } | null = null) {
  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue({ data, error }),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
}

function updateResult(data: unknown, error: { message: string } | null = null) {
  const builder = {
    update: jest.fn(),
    eq: jest.fn(),
    is: jest.fn(),
    lte: jest.fn(),
    select: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue({ data, error }),
    single: jest.fn().mockResolvedValue({ data, error }),
  };
  builder.update.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.is.mockReturnValue(builder);
  builder.lte.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  return builder;
}

describe("letter generation idempotency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("claims a new letter id", async () => {
    mockFrom.mockReturnValueOnce(insertResult(null));

    await expect(claimLetterGeneration(LETTER_ID)).resolves.toMatchObject({
      status: "claimed",
      ownerToken: expect.any(String),
    });
  });

  it("keeps completed and irreversible claims permanently blocked", async () => {
    const uniqueViolation = { code: "23505", message: "duplicate key" };
    mockFrom
      .mockReturnValueOnce(insertResult(uniqueViolation))
      .mockReturnValueOnce(selectionResult({
        completed_at: "2026-09-17T10:00:00.000Z",
        irreversible_at: "2026-09-17T09:59:00.000Z",
        updated_at: "2026-09-17T10:00:00.000Z",
      }));

    await expect(claimLetterGeneration(LETTER_ID)).resolves.toEqual({ status: "duplicate" });
  });

  it("does not start a fresh claim in parallel", async () => {
    const uniqueViolation = { code: "23505", message: "duplicate key" };
    mockFrom
      .mockReturnValueOnce(insertResult(uniqueViolation))
      .mockReturnValueOnce(selectionResult({
        completed_at: null,
        irreversible_at: null,
        updated_at: new Date().toISOString(),
      }));

    await expect(claimLetterGeneration(LETTER_ID)).resolves.toEqual({ status: "in_progress" });
  });

  it("atomically reclaims a processing claim after the two-minute lease", async () => {
    const uniqueViolation = { code: "23505", message: "duplicate key" };
    const reclaim = updateResult({ letter_id: LETTER_ID });
    mockFrom
      .mockReturnValueOnce(insertResult(uniqueViolation))
      .mockReturnValueOnce(selectionResult({
        completed_at: null,
        irreversible_at: null,
        updated_at: new Date(Date.now() - 3 * 60_000).toISOString(),
      }))
      .mockReturnValueOnce(reclaim);

    await expect(claimLetterGeneration(LETTER_ID)).resolves.toMatchObject({
      status: "claimed",
      ownerToken: expect.any(String),
    });
    expect(reclaim.lte).toHaveBeenCalledWith("updated_at", expect.any(String));
  });

  it("marks the claim irreversible before external side effects", async () => {
    const update = updateResult({ letter_id: LETTER_ID });
    mockFrom.mockReturnValueOnce(update);

    await expect(
      markLetterGenerationIrreversible(LETTER_ID, OWNER_TOKEN),
    ).resolves.toBeUndefined();
    expect(update.update).toHaveBeenCalledWith({
      irreversible_at: expect.any(String),
      updated_at: expect.any(String),
    });
    expect(update.eq).toHaveBeenCalledWith("owner_token", OWNER_TOKEN);
  });
});
