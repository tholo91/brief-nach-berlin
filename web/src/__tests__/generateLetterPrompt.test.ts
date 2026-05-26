// Mistral SDK is ESM-only and breaks ts-jest's CommonJS transform. We don't
// call it here — only the pure prompt helpers — so stub the module out.
jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
}));

import { mdbContextBlock, buildUserPrompt } from "@/lib/generation/generateLetter";
import type { GenerateLetterInput, MdbContext } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";

const DEFENSIVE_MARKER =
  "Es liegen KEINE verifizierten Informationen über Ausschüsse";

function makePolitician(): Politician {
  return {
    id: 1,
    politicianId: 100,
    firstName: "Erika",
    lastName: "Mustermann",
    title: null,
    party: "SPD",
    wahlkreisId: 55,
    wahlkreisName: "Bremen I",
    level: "Bund",
    postalAddress: "Platz der Republik 1, 11011 Berlin",
    isDirect: true,
    abgeordnetenwatchUrl: null,
    committees: [],
  };
}

function makeInput(mdbContext?: MdbContext): GenerateLetterInput {
  return {
    issueText: "Tempo 30 in der Innenstadt",
    politicians: [makePolitician()],
    mdbContext,
  };
}

describe("mdbContextBlock", () => {
  it("returns defensive block when ctx is undefined", () => {
    const block = mdbContextBlock(undefined);
    expect(block).toContain(DEFENSIVE_MARKER);
    expect(block).toContain("<mdb_kontext>");
  });

  it("returns defensive block when ctx has empty committees and empty recentRelevant", () => {
    const block = mdbContextBlock({ committees: [], recentRelevant: [] });
    expect(block).toContain(DEFENSIVE_MARKER);
  });

  it("returns real block when ctx has committees", () => {
    const block = mdbContextBlock({
      committees: ["Verkehrsausschuss", "Haushaltsausschuss"],
      recentRelevant: [],
    });
    expect(block).not.toContain(DEFENSIVE_MARKER);
    expect(block).toContain("Verkehrsausschuss");
    expect(block).toContain("Haushaltsausschuss");
  });

  it("returns real block when ctx has recentRelevant entries", () => {
    const block = mdbContextBlock({
      committees: [],
      recentRelevant: [
        { date: "10.02.2024", title: "Antrag Verkehrswende", snippet: "Stimme: ja" },
      ],
    });
    expect(block).not.toContain(DEFENSIVE_MARKER);
    expect(block).toContain("Antrag Verkehrswende");
  });
});

describe("buildUserPrompt", () => {
  it("embeds the defensive mdb_kontext block when mdbContext is undefined", () => {
    const prompt = buildUserPrompt(makeInput(undefined), 200, 280, 3);
    expect(prompt).toContain(DEFENSIVE_MARKER);
    expect(prompt).toContain("<empfaenger>");
  });

  it("embeds the defensive mdb_kontext block when mdbContext is fully empty", () => {
    const prompt = buildUserPrompt(
      makeInput({ committees: [], recentRelevant: [] }),
      200,
      280,
      3
    );
    expect(prompt).toContain(DEFENSIVE_MARKER);
  });

  it("embeds the real mdb_kontext block when ctx has data", () => {
    const prompt = buildUserPrompt(
      makeInput({ committees: ["Innenausschuss"], recentRelevant: [] }),
      200,
      280,
      3
    );
    expect(prompt).not.toContain(DEFENSIVE_MARKER);
    expect(prompt).toContain("Innenausschuss");
  });
});
