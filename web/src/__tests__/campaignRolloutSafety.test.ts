import type { Campaign } from "@/lib/campaigns/schema";
import type { WizardData } from "@/lib/types/wizard";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/campaigns/repository", () => ({
  getActiveCampaignBySlug: jest.fn(),
}));
jest.mock("@/lib/lookup/plzLookup", () => ({
  lookupPLZ: jest.fn(),
  lookupPLZWithLevel: jest.fn(),
  buildCoverageHint: jest.fn(() => null),
}));
jest.mock("@/lib/lookup/levelRouter", () => ({
  routeToLevel: jest.fn(),
}));
jest.mock("@/lib/lookup/routingToken", () => ({
  hashRoutingIssue: jest.fn(() => "issue-hash"),
  normalizeRoutingIssue: jest.fn((value: string) => value.trim().replace(/\s+/g, " ")),
  signRoutingToken: jest.fn(() => "fresh-routing-token"),
  verifyRoutingToken: jest.fn(() => null),
}));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, retryAfterSeconds: 0 })),
  getClientIp: jest.fn(async () => "127.0.0.1"),
  hashIdentifier: jest.fn((value: string) => `hash:${value}`),
  LIMITS: {
    LETTERS_PER_IP: { max: 10, windowMs: 60_000 },
    LETTERS_PER_EMAIL: { max: 10, windowMs: 60_000 },
  },
}));

import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import { lookupPLZ, lookupPLZWithLevel } from "@/lib/lookup/plzLookup";
import { routeToLevel } from "@/lib/lookup/levelRouter";
import { signRoutingToken } from "@/lib/lookup/routingToken";
import { submitWizardAction } from "@/lib/actions/submitWizard";

const politician = {
  id: 1,
  politicianId: 2,
  firstName: "Ada",
  lastName: "Beispiel",
  title: null,
  party: "SPD",
  wahlkreisId: 3,
  wahlkreisName: "Beispiel",
  level: "Bund" as const,
  postalAddress: "Platz der Republik 1, 11011 Berlin",
  isDirect: true,
  abgeordnetenwatchUrl: null,
};

const baseData: WizardData = {
  plz: "50667",
  email: "test@example.org",
  issueText: "Ich wünsche mir sichere Schulwege in meiner Stadt.",
  letterLength: "1",
};

function campaign(targetLevel: "Bund" | "Land", targetState: Campaign["targetState"]): Campaign {
  return {
    id: "campaign-1",
    slug: "sichere-schulwege",
    creatorEmail: "creator@example.org",
    title: "Sichere Schulwege",
    issueText: baseData.issueText,
    description: null,
    creatorName: null,
    externalUrl: null,
    logoPath: null,
    status: "active",
    moderationStatus: "approved",
    moderationCategories: [],
    targetLevel,
    targetState,
    emailVerifiedAt: "2026-07-19T00:00:00.000Z",
    activatedAt: "2026-07-19T00:00:00.000Z",
    pausedAt: null,
    archivedAt: null,
    lastPublishedRevisionId: null,
    letterCount: 0,
    createdAt: "2026-07-19T00:00:00.000Z",
    updatedAt: "2026-07-19T00:00:00.000Z",
  };
}

const levelLookup = {
  byLevel: { Bund: [politician], Land: [], Kommune: [] },
  coverage: {
    landSupported: false,
    kommuneSupported: true,
    stadtstaatEinheitsgemeinde: false,
    landAmbiguous: false,
    landWahlkreisIds: [],
    kommuneAmbiguous: false,
    kommuneBezirke: [],
  },
  bundeslandKey: "NW",
  bundeslandName: "Nordrhein-Westfalen",
  ortsname: "Köln",
};

describe("campaign rollout safety", () => {
  const originalFlag = process.env.LANDTAG_ROUTING_ENABLED;
  const originalPromptFlag = process.env.LETTER_PROMPT_LEVEL_AWARE;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LETTER_PROMPT_LEVEL_AWARE = "true";
    jest.mocked(lookupPLZ).mockReturnValue({
      wahlkreisIds: [3],
      politicians: [politician],
    });
    jest.mocked(lookupPLZWithLevel).mockReturnValue(levelLookup);
    jest.mocked(routeToLevel).mockResolvedValue({
      primary: { level: "Bund", confidence: "high" },
      reasoning: "Bundesthema",
    });
  });

  afterAll(() => {
    process.env.LANDTAG_ROUTING_ENABLED = originalFlag;
    process.env.LETTER_PROMPT_LEVEL_AWARE = originalPromptFlag;
  });

  it("uses the server campaign target and never falls back from Land to Bund when routing is off", async () => {
    process.env.LANDTAG_ROUTING_ENABLED = "false";
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(campaign("Land", null));

    const result = await submitWizardAction({
      ...baseData,
      campaign: {
        slug: "sichere-schulwege",
        title: "Manipulierter Client-Titel",
        targetLevel: "Bund",
      },
    });

    expect(getActiveCampaignBySlug).toHaveBeenCalledWith("sichere-schulwege");
    expect(result).toMatchObject({ error: "level_data_missing", level: "Land" });
  });

  it("returns a recoverable error when the server-bound Land campaign has no coverage", async () => {
    process.env.LANDTAG_ROUTING_ENABLED = "true";
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(campaign("Land", "NW"));

    const result = await submitWizardAction({
      ...baseData,
      campaign: {
        slug: "sichere-schulwege",
        title: "Sichere Schulwege",
        targetLevel: "Bund",
        targetState: "HE",
      },
    });

    expect(result).toMatchObject({
      error: "level_data_missing",
      level: "Land",
      fallbackUrl: "/",
    });
  });

  it("returns a newly signed token after foreground routing", async () => {
    process.env.LANDTAG_ROUTING_ENABLED = "true";
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(campaign("Bund", null));

    const result = await submitWizardAction({
      ...baseData,
      campaign: {
        slug: "sichere-schulwege",
        title: "Sichere Schulwege",
        targetLevel: "Land",
        targetState: "HE",
      },
    });

    expect(signRoutingToken).toHaveBeenCalled();
    expect(result).toMatchObject({
      disambiguationNeeded: true,
      routingToken: "fresh-routing-token",
      campaignTargetLevel: "Bund",
    });
  });

  it("preserves the legacy non-campaign Bund path when routing is off", async () => {
    process.env.LANDTAG_ROUTING_ENABLED = "false";

    const result = await submitWizardAction(baseData);

    expect(getActiveCampaignBySlug).not.toHaveBeenCalled();
    expect(result).toEqual({
      disambiguationNeeded: true,
      politicians: [politician],
    });
  });
});
