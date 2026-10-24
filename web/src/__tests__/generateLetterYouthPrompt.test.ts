/**
 * Jugendmodus-Prompt (S1): Klassenstufe, Wahlstatus, Unterrichtsprojekt und
 * Wortbereich 150 bis 200. Mistral ist gemockt.
 */

jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "mistral-large-latest", levelRouting: "mistral-small-latest" },
  MistralStageError: class extends Error {},
}));

import { mistral } from "@/lib/mistral";
import { buildUserPrompt, generateLetter } from "@/lib/generation/generateLetter";
import type { GenerateLetterInput } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";

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

function input(klasse: number, viaClassLink: boolean): GenerateLetterInput {
  return {
    issueText: "An unserer Schule fällt oft der Unterricht aus, weil Lehrkräfte fehlen.",
    politicians: [mdb],
    youth: { klasse, viaClassLink },
  };
}

function youthBlock(prompt: string): string {
  const match = prompt.match(/<absender_jugend>[\s\S]*<\/absender_jugend>/);
  if (!match) throw new Error("Jugend-Block fehlt");
  return match[0];
}

describe("Jugend-Block im User-Prompt", () => {
  it.each([
    [8, false],
    [8, true],
    [10, false],
    [10, true],
    [12, false],
    [12, true],
  ])("Klasse %i, Klassenlink %s", (klasse, viaClassLink) => {
    const prompt = buildUserPrompt(input(klasse, viaClassLink), 150, 200, 3);
    const block = youthBlock(prompt);

    expect(block).toMatchSnapshot();
    expect(block).toContain(`Ich gehe in die ${klasse}. Klasse.`);
    if (klasse <= 11) {
      expect(block).toContain("noch nicht wählen");
      expect(block).not.toContain("bald zum ersten Mal");
    } else {
      expect(block).toContain("bald zum ersten Mal wählen");
      expect(block).not.toContain("noch nicht wählen");
    }
    if (viaClassLink) {
      expect(block).toContain("Unterrichtsprojekt");
    } else {
      expect(block).not.toContain("Unterrichtsprojekt");
    }
    expect(block).not.toMatch(/20\d\d/);
    expect(prompt).toContain("woerter: 150 bis 200");
  });

  it("Erwachsene bekommen keinen Jugend-Block", () => {
    const adult: GenerateLetterInput = { issueText: "Test", politicians: [mdb] };
    expect(buildUserPrompt(adult, 200, 240, 3)).not.toContain("absender_jugend");
  });
});

describe("generateLetter im Jugendmodus", () => {
  beforeEach(() => {
    (mistral.chat.complete as jest.Mock).mockReset();
  });

  it("berechnet maxTokens aus 200 Wörtern, auch bei gewählter Länge 2", async () => {
    const letter = Array.from({ length: 175 }, (_, i) => `Wort${i}`).join(" ");
    (mistral.chat.complete as jest.Mock).mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ selected_politician_id: 1, letter }) } }],
    });

    await generateLetter({ ...input(8, true), letterLength: "2" });

    expect(mistral.chat.complete).toHaveBeenCalledTimes(1);
    const args = (mistral.chat.complete as jest.Mock).mock.calls[0][0];
    expect(args.maxTokens).toBe(Math.ceil(200 * 2.2) + 250);
    expect(args.messages[1].content).toContain("woerter: 150 bis 200");
  });

  it("nutzt für den Retry-Korridor 150 bis 200 Wörter", async () => {
    const long = Array.from({ length: 300 }, (_, i) => `Wort${i}`).join(" ");
    const ok = Array.from({ length: 175 }, (_, i) => `Wort${i}`).join(" ");
    (mistral.chat.complete as jest.Mock)
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ selected_politician_id: 1, letter: long }) } }],
      })
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ selected_politician_id: 1, letter: ok }) } }],
      });
    jest.spyOn(console, "warn").mockImplementation(() => {});

    await generateLetter(input(10, false));

    expect(mistral.chat.complete).toHaveBeenCalledTimes(2);
    const directive = (mistral.chat.complete as jest.Mock).mock.calls[1][0].messages[3].content;
    expect(directive).toContain("Das Zielfenster ist 150–200 Wörter");
  });
});
