/**
 * Erwachsenen-Regression (S1 Jugendmodus): Der Prompt für Erwachsene bleibt
 * byte-identisch. Die Snapshots wurden gegen den Code vor dem Jugendmodus erzeugt
 * und dürfen sich nicht ändern.
 */

jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "mistral-large-latest", levelRouting: "mistral-small-latest" },
  MistralStageError: class extends Error {},
}));

import { buildSystemPrompt, buildUserPrompt } from "@/lib/generation/generateLetter";
import type { GenerateLetterInput } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import { getLandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";
import { getCampaignFixedRecipient } from "@/lib/lookup/campaignFixedRecipient";

const mdb: Politician = {
  id: 1,
  politicianId: 10,
  firstName: "Anna",
  lastName: "Müller",
  title: null,
  party: "SPD",
  wahlkreisId: 55,
  wahlkreisName: "Bremen I",
  level: "Bund",
  postalAddress: "Platz der Republik 1, 11011 Berlin",
  isDirect: true,
  abgeordnetenwatchUrl: null,
};

const fixedCampaignRecipient = getCampaignFixedRecipient({
  targetLevel: "Fixed",
  targetRecipient: {
    organizationName: "Hessisches Ministerium der Justiz und für den Rechtsstaat",
    personName: null,
    salutation: "Sehr geehrte Damen und Herren,",
    street: "Luisenstraße",
    houseNumber: "13",
    postalCode: "65185",
    city: "Wiesbaden",
    countryCode: "DE",
  },
})!;

const base = {
  issueText: "Die Schlaglöcher in der Goethestraße sind gefährlich.",
  name: "Max Beispiel",
  toneLevel: 3,
};

const cases: Record<string, GenerateLetterInput> = {
  "Bund mit MdB": { ...base, politicians: [mdb], level: "Bund" },
  "Land Landesregierung": {
    ...base,
    politicians: [],
    level: "Land",
    landesregierung: getLandesregierungRecipient("NW")!,
  },
  "Kampagne mit festem Empfänger": {
    ...base,
    politicians: [],
    level: "Fixed",
    campaignFixedRecipient: fixedCampaignRecipient,
  },
};

describe("Erwachsenen-Prompt bleibt unverändert", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00Z"));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it.each(Object.keys(cases))("%s", (name) => {
    const input = cases[name];
    expect(buildSystemPrompt(input)).toMatchSnapshot("system");
    expect(buildUserPrompt(input, 220, 280, 3)).toMatchSnapshot("user");
  });
});
