jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "mistral-large-latest" },
}));

import {
  buildVariantUserPrompt,
  VARIANT_SYSTEM_PROMPT,
} from "@/lib/generation/generateLetterVariant";

describe("letter variant prompt", () => {
  it("frames the task as rewriting an existing letter", () => {
    expect(VARIANT_SYSTEM_PROMPT).toContain("bereits fertigen politischen Brief");
    expect(VARIANT_SYSTEM_PROMPT).toContain("keine neuen Fakten");
    expect(VARIANT_SYSTEM_PROMPT).toContain("Empfängeranrede");
    expect(VARIANT_SYSTEM_PROMPT).toContain("Grußformel");
    expect(VARIANT_SYSTEM_PROMPT).toContain("keine neue lokale Lage");
    expect(VARIANT_SYSTEM_PROMPT).toContain("so hoch wie nie");
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
});
