jest.mock("@/lib/campaigns/repository", () => ({
  getActiveCampaignBySlug: jest.fn(),
}));
jest.mock("@/lib/lookup/plzLookup", () => ({
  lookupPLZ: jest.fn(),
  lookupPLZWithLevel: jest.fn(),
  buildCoverageHint: jest.fn(() => null),
  getBundestagPoliticiansByIds: jest.fn(() => []),
}));
jest.mock("@/lib/lookup/levelRouter", () => ({
  routeToLevel: jest.fn(),
}));
jest.mock("@/lib/lookup/routingToken", () => ({
  hashRoutingIssue: jest.fn(() => "issue-hash"),
  normalizeRoutingIssue: jest.fn((value: string) => value.trim()),
  signRoutingToken: jest.fn(() => "routing-token"),
  verifyRoutingToken: jest.fn(() => null),
}));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(async () => "127.0.0.1"),
  hashIdentifier: jest.fn((value: string) => `hash:${value}`),
  LIMITS: {
    LETTERS_PER_IP: { max: 10, windowMs: 60_000 },
    LETTERS_PER_EMAIL: { max: 10, windowMs: 60_000 },
  },
}));

import { submitWizardAction } from "@/lib/actions/submitWizard";
import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import { routeToLevel } from "@/lib/lookup/levelRouter";
import { lookupPLZ, lookupPLZWithLevel } from "@/lib/lookup/plzLookup";
import type { Politician } from "@/lib/types/politician";
import type { WizardData } from "@/lib/types/wizard";

const localMdb: Politician = {
  id: 42,
  politicianId: 42,
  firstName: "Lokal",
  lastName: "MdB",
  title: null,
  party: "SPD",
  wahlkreisId: 3,
  wahlkreisName: "Köln",
  level: "Bund",
  postalAddress: "Platz der Republik 1, 11011 Berlin",
  isDirect: true,
  abgeordnetenwatchUrl: null,
};

const data: WizardData = {
  plz: "50667",
  email: "test@example.org",
  issueText: "Bezahlbarer Wohnraum ist für junge Menschen wichtig.",
  letterLength: "1",
  campaign: {
    slug: "schreib-merz",
    title: "Schreib Merz",
    targetLevel: "Bund",
  },
};

function activeCampaign(overrides: Record<string, unknown> = {}) {
  return {
    slug: "schreib-merz",
    targetLevel: "Bund",
    targetState: null,
    targetPoliticianIds: [],
    ...overrides,
  } as never;
}

describe("Schreib-Merz recipient choice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(activeCampaign());
    jest.mocked(lookupPLZ).mockReturnValue({
      wahlkreisIds: [3],
      politicians: [localMdb],
    });
    jest.mocked(lookupPLZWithLevel).mockReturnValue({
      byLevel: { Bund: [localMdb], Land: [], Kommune: [] },
      optionalByLevel: { Land: [] },
      coverage: {
        landSupported: false,
        kommuneSupported: false,
        stadtstaatEinheitsgemeinde: false,
        landAmbiguous: false,
        landWahlkreisIds: [],
        kommuneAmbiguous: false,
        kommuneBezirke: [],
      },
      bundeslandKey: "NW",
      bundeslandName: "Nordrhein-Westfalen",
      ortsname: "Köln",
      gemeindeName: "Köln",
    });
    jest.mocked(routeToLevel).mockResolvedValue({
      primary: { level: "Bund", confidence: "high" },
      reasoning: "Bundesthema",
    });
  });

  it("returns the chancellor as featured default and keeps local MdBs available", async () => {
    await expect(submitWizardAction(data)).resolves.toMatchObject({
      disambiguationNeeded: true,
      campaignTargetLevel: "Bund",
      politicians: [localMdb],
      featuredRecipient: {
        kind: "bundeskanzler",
        label: "Bundeskanzler Friedrich Merz",
      },
    });
  });

  it("refuses a special campaign configured with an MdB allowlist", async () => {
    jest.mocked(getActiveCampaignBySlug).mockResolvedValue(
      activeCampaign({ targetPoliticianIds: [localMdb.id] }),
    );

    await expect(submitWizardAction(data)).resolves.toEqual({
      error: "server_error",
      message: "Diese Kampagne ist aktuell nicht korrekt konfiguriert.",
    });
  });
});
