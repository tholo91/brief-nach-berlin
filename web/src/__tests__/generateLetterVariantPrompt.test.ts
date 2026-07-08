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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("frames the task as rewriting an existing letter", () => {
    expect(VARIANT_SYSTEM_PROMPT).toContain("bereits fertigen politischen Brief");
    expect(VARIANT_SYSTEM_PROMPT).toContain("keine neuen Fakten");
    expect(VARIANT_SYSTEM_PROMPT).toContain("Empfängeranrede");
    expect(VARIANT_SYSTEM_PROMPT).toContain("Grußformel");
    expect(VARIANT_SYSTEM_PROMPT).toContain("derselben Grußformel und derselben Namenszeile");
    expect(VARIANT_SYSTEM_PROMPT).toContain('"Mit freundlichen Grüßen"');
    expect(VARIANT_SYSTEM_PROMPT).not.toContain('"Mit freundlichen Grüßen,"');
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
    expect(prompt).toContain("<laengenvorgabe>");
    expect(prompt).toContain("vollständiger Brief");
    expect(prompt).toContain("1 Seite");
    expect(prompt).toContain("200 bis 240 Wörter");
    expect(prompt).toContain("keinen Teaser");
    expect(prompt).toContain("Sehr geehrte Frau Mustermann");
    expect(prompt).toContain("<aenderungswunsch>");
    expect(prompt).toContain("Bitte sachlicher und kürzer.");
    expect(prompt).toContain("register: scharf-pointiert");
  });

  it("uses the requested length in the Mistral prompt", () => {
    const prompt = buildVariantUserPrompt({
      originalLetter: "Sehr geehrte Frau Mustermann,\n\n" + Array.from({ length: 220 }, (_, i) => `Wort${i}`).join(" "),
      letterLength: "2",
    });

    expect(prompt).toContain("2 Seiten");
    expect(prompt).toContain("420 bis 460 Wörter");
  });

  it("keeps the original closing when the model drops it", async () => {
    (mistral.chat.complete as jest.Mock).mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              preservation_check: "Fakten und Forderung blieben erhalten.",
              letter:
                "Sehr geehrte Frau Mustermann,\n\n" +
                Array.from({ length: 205 }, (_, i) => `Sicherheit${i}`).join(" "),
            }),
          },
        },
      ],
    });

    const result = await generateLetterVariant({
      originalLetter:
        "Sehr geehrte Frau Mustermann,\n\n" +
        Array.from({ length: 205 }, (_, i) => `Radweg${i}`).join(" ") +
        "\n\nMit freundlichen Grüßen,\nMax",
      toneLevel: 4,
    });

    expect(result.letter).toContain("Mit freundlichen Grüßen,\nMax");
  });

  it("retries when the first variant is too short", async () => {
    const originalBody = Array.from({ length: 180 }, (_, i) => `Wort${i}`).join(" ");
    const fullVariantBody = Array.from({ length: 220 }, (_, i) => `Variante${i}`).join(" ");
    const originalLetter = [
      "Sehr geehrte Frau Mustermann,",
      "",
      originalBody,
      "",
      "Mit freundlichen Grüßen,",
      "Max",
    ].join("\n");

    (mistral.chat.complete as jest.Mock)
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                preservation_check: "Zu kurz.",
                letter:
                  "Sehr geehrte Frau Mustermann,\n\nDas ist nur ein kurzer Auszug, der zwar technisch wie ein Brief beginnt, aber die Argumente des ursprünglichen Schreibens nicht vollständig ausführt.\n\nMit freundlichen Grüßen,\nMax",
              }),
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                preservation_check: "Fakten, Forderung, Anrede und Grußformel erhalten.",
                letter: [
                  "Sehr geehrte Frau Mustermann,",
                  "",
                  fullVariantBody,
                  "",
                  "Mit freundlichen Grüßen,",
                  "Max",
                ].join("\n"),
              }),
            },
          },
        ],
      });

    const result = await generateLetterVariant({
      originalLetter,
      toneLevel: 4,
    });

    expect(mistral.chat.complete).toHaveBeenCalledTimes(2);
    expect(result.lengthRetried).toBe(true);
    expect(result.wordCount).toBeGreaterThanOrEqual(200);
    expect(result.wordCount).toBeLessThanOrEqual(240);
  });
});
