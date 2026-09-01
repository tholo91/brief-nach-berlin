import {
  BUNDESLAND_NAMES,
  createCampaignSchema,
  resolveCampaignTarget,
} from "@/lib/campaigns/schema";

const baseInput = {
  slug: "sichere-schulwege",
  creatorEmail: "test@example.org",
  title: "Mehr sichere Schulwege",
  issueText:
    "Vor mehreren Grundschulen entstehen morgens gefährliche Situationen, die Politik sollte handeln.",
};

describe("createCampaignSchema targetLevel/targetState", () => {
  it("defaults targetLevel to Bund and targetState to null", () => {
    const parsed = createCampaignSchema.parse(baseInput);
    expect(parsed.targetLevel).toBe("Bund");
    expect(parsed.targetState).toBeNull();
  });

  it("rejects targetState when targetLevel is Bund", () => {
    const result = createCampaignSchema.safeParse({
      ...baseInput,
      targetLevel: "Bund",
      targetState: "HB",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "targetState")).toBe(true);
    }
  });

  it("keeps a valid bundeslandKey when targetLevel is Land", () => {
    const parsed = createCampaignSchema.parse({
      ...baseInput,
      targetLevel: "Land",
      targetState: "NI",
    });
    expect(parsed.targetLevel).toBe("Land");
    expect(parsed.targetState).toBe("NI");
  });

  it("allows Land without a fixed Bundesland (targetState null)", () => {
    const parsed = createCampaignSchema.parse({
      ...baseInput,
      targetLevel: "Land",
      targetState: null,
    });
    expect(parsed.targetLevel).toBe("Land");
    expect(parsed.targetState).toBeNull();
  });

  it("rejects an invalid bundeslandKey", () => {
    const result = createCampaignSchema.safeParse({
      ...baseInput,
      targetLevel: "Land",
      targetState: "XX",
    });
    expect(result.success).toBe(false);
  });

  it("rejects Kommune as targetLevel", () => {
    const result = createCampaignSchema.safeParse({
      ...baseInput,
      targetLevel: "Kommune",
    });
    expect(result.success).toBe(false);
  });
});

describe("resolveCampaignTarget (mapCampaign default for legacy rows)", () => {
  it("defaults rows without target_level to Bund with targetState null", () => {
    expect(resolveCampaignTarget({ target_level: null, target_state: null })).toEqual({
      targetLevel: "Bund",
      targetState: null,
    });
    expect(resolveCampaignTarget({})).toEqual({
      targetLevel: "Bund",
      targetState: null,
    });
  });

  it("passes through explicit Land binding", () => {
    expect(resolveCampaignTarget({ target_level: "Land", target_state: "HB" })).toEqual({
      targetLevel: "Land",
      targetState: "HB",
    });
  });

  it("rejects malformed target data read from the database", () => {
    expect(() =>
      resolveCampaignTarget({ target_level: "Land", target_state: "XX" })
    ).toThrow();
    expect(() =>
      resolveCampaignTarget({ target_level: "Bund", target_state: "HB" })
    ).toThrow();
    expect(() =>
      resolveCampaignTarget({ target_level: "Kommune", target_state: null })
    ).toThrow();
  });
});

describe("BUNDESLAND_NAMES", () => {
  it("contains all 16 bundeslandKeys", () => {
    const expectedKeys = [
      "BB", "BE", "BW", "BY", "HB", "HE", "HH", "MV",
      "NI", "NW", "RP", "SH", "SL", "SN", "ST", "TH",
    ] as const;
    expect(Object.keys(BUNDESLAND_NAMES).sort()).toEqual(expectedKeys);
    for (const key of expectedKeys) {
      expect(BUNDESLAND_NAMES[key]).toBeTruthy();
    }
  });
});
