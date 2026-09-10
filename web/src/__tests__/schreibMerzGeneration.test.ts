jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: {
    letter: "mistral-large-latest",
    levelRouting: "mistral-small-latest",
  },
  MistralStageError: class extends Error {
    constructor(stage: string, cause: unknown) {
      super(`Mistral ${stage} failed`);
      Object.assign(this, { stage, cause });
    }
  },
}));

import { mistral } from "@/lib/mistral";
import {
  buildSystemPrompt,
  buildUserPrompt,
  generateLetter,
} from "@/lib/generation/generateLetter";
import { getBundeskanzlerRecipient } from "@/lib/lookup/bundeskanzlerRecipient";
import type { GenerateLetterInput } from "@/lib/types/wizard";

const bundeskanzler = getBundeskanzlerRecipient();

function input(): GenerateLetterInput {
  return {
    issueText: "Bezahlbarer Wohnraum ist für junge Menschen wichtig.",
    politicians: [],
    level: "Bund",
    bundeskanzler,
  };
}

describe("Schreib-Merz letter generation", () => {
  beforeEach(() => {
    (mistral.chat.complete as jest.Mock).mockReset();
  });

  it("uses a chancellor-specific, party-neutral system prompt", () => {
    const prompt = buildSystemPrompt(input());

    expect(prompt).toContain("STRATEGIE FÜR DEN BUNDESKANZLER");
    expect(prompt).toContain(
      'Anrede: exakt "Sehr geehrter Herr Bundeskanzler,"',
    );
    expect(prompt).toContain("politische Führung der Bundesregierung");
    expect(prompt).toContain("PARTEI-NEUTRALITÄT (Bundeskanzler)");
    expect(prompt).toContain(
      "Versprich KEINE Weiterleitung, Bearbeitung, Antwort oder persönliche Kenntnisnahme.",
    );
    expect(prompt).not.toContain(
      "Alle verfügbaren Politiker sind Bundestagsabgeordnete.",
    );
    expect(prompt).not.toContain("MdB-KONTEXT NUTZEN");
    expect(prompt).not.toContain("WAHLKREIS-BEZUG KONKRET");
    expect(prompt).not.toContain("- CDU/CSU:");
  });

  it("sends only the trusted chancellor identity and salutation to the model", () => {
    const prompt = buildUserPrompt(input(), 200, 280, 3);

    expect(prompt).toContain("Bundeskanzler Friedrich Merz");
    expect(prompt).toContain("Sehr geehrter Herr Bundeskanzler,");
    expect(prompt).toContain("Bundeskanzleramt, Berlin");
    expect(prompt).toContain('"id": 0');
    expect(prompt).not.toContain('"party"');
    expect(prompt).not.toContain('"wahlkreis"');
    expect(prompt).not.toContain("<mdb_kontext>");
  });

  it("keeps the trusted chancellor regardless of the model-selected ID", async () => {
    const letter = Array.from(
      { length: 260 },
      (_, index) => `Wort${index}`,
    ).join(" ");
    (mistral.chat.complete as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              selected_politician_id: 999,
              letter,
            }),
          },
        },
      ],
    });

    const result = await generateLetter(input());

    expect(result.selectedRecipient).toBe(bundeskanzler);
    expect(result.selectedPolitician).toBeNull();
    expect(result.politicalLevel).toBe("Bund");
    expect(result.fallbackUsed).toBe(false);
    expect(result.mdbContextUsed).toBe(false);
  });
});
