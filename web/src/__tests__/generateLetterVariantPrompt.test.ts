jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "mistral-large-latest" },
}));

import {
  generateLetterVariant,
  buildVariantUserPrompt,
  VARIANT_SYSTEM_PROMPT,
} from "@/lib/generation/generateLetterVariant";
import { mistral } from "@/lib/mistral";

describe("letter variant prompt", () => {
  it("frames the task as rewriting an existing letter", () => {
    expect(VARIANT_SYSTEM_PROMPT).toContain("bereits fertigen politischen Brief");
    expect(VARIANT_SYSTEM_PROMPT).toContain("keine neuen Fakten");
    expect(VARIANT_SYSTEM_PROMPT).toContain("Empfängeranrede");
    expect(VARIANT_SYSTEM_PROMPT).toContain("Grußformel");
    expect(VARIANT_SYSTEM_PROMPT).toContain("derselben Grußformel und derselben Namenszeile");
    expect(VARIANT_SYSTEM_PROMPT).toContain("keine neue lokale Lage");
    expect(VARIANT_SYSTEM_PROMPT).toContain("so hoch wie nie");
    expect(VARIANT_SYSTEM_PROMPT).toContain("Tonalität als Obergrenze");
    expect(VARIANT_SYSTEM_PROMPT).toContain("Verrat");
    expect(VARIANT_SYSTEM_PROMPT).toContain("dramatischen Zuspitzungen");
  });

  it("embeds the existing letter and optional change request in separate blocks", () => {
    const prompt = buildVariantUserPrompt({
      originalLetter: "Sehr geehrte Frau Mustermann,\n\nbitte setzen Sie sich für sichere Radwege ein.\n\nMit freundlichen Grüßen,\nMax",
      toneLevel: 4,
      changeRequest: "Bitte sachlicher und kürzer.",
    });

    expect(prompt).toContain("<bestehender_brief>");
    expect(prompt).toContain("Sehr geehrte Frau Mustermann");
    expect(prompt).toContain("<aenderungswunsch>");
    expect(prompt).toContain("Bitte sachlicher und kürzer.");
    expect(prompt).toContain("register: scharf-pointiert");
  });

  it("keeps the original closing when the model drops it", async () => {
    (mistral.chat.complete as jest.Mock).mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              preservation_check: "Fakten und Forderung blieben erhalten.",
              letter:
                "Sehr geehrte Frau Mustermann,\n\nich bitte Sie eindringlich, sich für sichere Radwege einzusetzen. Viele Menschen sind täglich darauf angewiesen, dass politische Entscheidungen den Schutz im Straßenverkehr ernster nehmen. Bitte unterstützen Sie konkrete Verbesserungen für mehr Sicherheit.",
            }),
          },
        },
      ],
    });

    const result = await generateLetterVariant({
      originalLetter:
        "Sehr geehrte Frau Mustermann,\n\nbitte setzen Sie sich für sichere Radwege ein.\n\nMit freundlichen Grüßen,\nMax",
      toneLevel: 4,
    });

    expect(result.letter).toContain("Mit freundlichen Grüßen,\nMax");
  });
});
