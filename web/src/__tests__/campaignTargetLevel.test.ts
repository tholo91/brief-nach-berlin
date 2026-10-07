import {
  BUNDESLAND_NAMES,
  createCampaignSchema,
  isCampaignTargetLocked,
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
    expect(parsed.targetRecipient).toBeNull();
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
      targetRecipient: null,
    });
    expect(resolveCampaignTarget({})).toEqual({
      targetLevel: "Bund",
      targetState: null,
      targetRecipient: null,
    });
  });

  it("passes through explicit Land binding", () => {
    expect(resolveCampaignTarget({ target_level: "Land", target_state: "HB" })).toEqual({
      targetLevel: "Land",
      targetState: "HB",
      targetRecipient: null,
    });
  });

  it("parst einen festen Kampagnenempfänger als dritten Zieltyp", () => {
    expect(resolveCampaignTarget({
      target_level: "Fixed",
      target_state: null,
      target_recipient: {
        organizationName: "Hessisches Ministerium der Justiz und für den Rechtsstaat",
        personName: null,
        salutation: "Sehr geehrte Damen und Herren,",
        street: "Luisenstraße",
        houseNumber: "13",
        postalCode: "65185",
        city: "Wiesbaden",
        countryCode: "DE",
      },
    })).toMatchObject({
      targetLevel: "Fixed",
      targetState: null,
      targetRecipient: {
        organizationName: "Hessisches Ministerium der Justiz und für den Rechtsstaat",
        postalCode: "65185",
      },
    });
  });

  it("lehnt eine feste Adresse bei Bund oder Land ab", () => {
    expect(() => resolveCampaignTarget({
      target_level: "Land",
      target_state: null,
      target_recipient: {
        organizationName: "Beispielministerium",
        personName: null,
        salutation: "Sehr geehrte Damen und Herren,",
        street: "Beispielstraße",
        houseNumber: "1",
        postalCode: "12345",
        city: "Beispielstadt",
        countryCode: "DE",
      },
    })).toThrow("nur für feste Kampagnenempfänger");
  });

  it("verlangt bei Fixed mindestens Organisation oder Person", () => {
    const result = createCampaignSchema.safeParse({
      ...baseInput,
      targetLevel: "Fixed",
      targetRecipient: {
        organizationName: null,
        personName: null,
        salutation: "Sehr geehrte Damen und Herren,",
        street: "Beispielstraße",
        houseNumber: "1",
        postalCode: "12345",
        city: "Beispielstadt",
        countryCode: "DE",
      },
    });
    expect(result.success).toBe(false);
  });

  it.each([
    ["vierstellige PLZ", { recipient: { postalCode: "1234" } }],
    ["ausländischer Ländercode", { recipient: { countryCode: "AT" } }],
    ["Bundesland", { root: { targetState: "HE" } }],
    ["MdB-Auswahl", { root: { targetPoliticianIds: [1] } }],
  ] as const)("lehnt bei Fixed die ungültige Kombination %s ab", (_label, overrides) => {
    const result = createCampaignSchema.safeParse({
      ...baseInput,
      targetLevel: "Fixed",
      targetState: null,
      targetRecipient: {
        organizationName: "Beispielorganisation",
        personName: null,
        salutation: "Sehr geehrte Damen und Herren,",
        street: "Beispielstraße",
        houseNumber: "1",
        postalCode: "12345",
        city: "Beispielstadt",
        countryCode: "DE",
        ...("recipient" in overrides ? overrides.recipient : {}),
      },
      ...("root" in overrides ? overrides.root : {}),
    });
    expect(result.success).toBe(false);
  });

  it("verlangt bei Fixed eine Adresse und hält Bund/Land ohne Adresse", () => {
    expect(createCampaignSchema.safeParse({
      ...baseInput,
      targetLevel: "Fixed",
      targetRecipient: null,
    }).success).toBe(false);
    expect(createCampaignSchema.parse({
      ...baseInput,
      targetLevel: "Bund",
      targetRecipient: null,
    }).targetRecipient).toBeNull();
    expect(createCampaignSchema.parse({
      ...baseInput,
      targetLevel: "Land",
      targetState: "HE",
      targetRecipient: null,
    }).targetRecipient).toBeNull();
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

describe("campaign target lock", () => {
  it("ist nur vor der ersten Aktivierung offen", () => {
    expect(isCampaignTargetLocked({ activatedAt: null })).toBe(false);
    expect(isCampaignTargetLocked({ activatedAt: "2026-09-29T10:00:00.000Z" })).toBe(true);
  });

  it("bleibt nach einer Pause gesperrt, weil activatedAt erhalten bleibt", () => {
    expect(isCampaignTargetLocked({ activatedAt: "2026-09-29T10:00:00.000Z" })).toBe(true);
  });
});
