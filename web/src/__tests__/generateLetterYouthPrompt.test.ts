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
import { buildSystemPrompt, buildUserPrompt, generateLetter } from "@/lib/generation/generateLetter";
import { getLandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";
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
      expect(block).toContain("in eigenen Worten");
      expect(block).not.toContain("im Rahmen");
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

describe("Kurz-Hinweis im Jugendmodus", () => {
  it("Jugend-Eingabe unter 200 Zeichen: konkreter Hinweis ohne Bürger und abstrakt", () => {
    const prompt = buildUserPrompt(input(8, false), 150, 200, 3);
    const match = prompt.match(/<hinweis>[\s\S]*<\/hinweis>/);
    expect(match).not.toBeNull();
    const hinweis = match![0];
    expect(hinweis).toContain("konkret");
    expect(hinweis).toContain("Erfinde keine Erlebnisse");
    expect(hinweis).not.toContain("Bürger");
    expect(hinweis).not.toContain("abstrakt");
  });

  it("Jugend-Eingabe ab 200 Zeichen: kein Hinweis", () => {
    const long: GenerateLetterInput = {
      ...input(8, false),
      issueText: "Unterricht fällt bei uns oft aus. ".repeat(8),
    };
    expect(buildUserPrompt(long, 150, 200, 3)).not.toContain("<hinweis>");
  });

  it("Erwachsene Kurz-Eingabe behält den bisherigen Hinweis wortgleich", () => {
    const adult: GenerateLetterInput = { issueText: "Test", politicians: [mdb] };
    expect(buildUserPrompt(adult, 200, 240, 3)).toContain(
      "Der Bürger hat sich knapp gehalten. Bleibe entsprechend abstrakt"
    );
  });
});

describe("Jugend-System-Prompt ohne Partei-Werte", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00Z"));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  function expectNeutral(prompt: string) {
    expect(prompt).not.toContain("PARTEI-BEWUSSTES FRAMING");
    expect(prompt).not.toContain("Bewahrung des Bewährten");
    expect(prompt).not.toContain("- SPD:");
    expect(prompt).toContain("PARTEI-NEUTRALITÄT (Jugendbrief):");
    expect(prompt).toContain("Verwende keine parteibezogene Werte-Sprache.");
  }

  it("Bund mit MdB: keine Partei-Werte, Neutralitätszeile", () => {
    expectNeutral(buildSystemPrompt(input(8, false)));
  });

  it("Land mit MdL: keine Partei-Werte, Neutralitätszeile", () => {
    const landInput: GenerateLetterInput = {
      ...input(8, false),
      level: "Land",
      politicians: [{ ...mdb, level: "Land" }],
    };
    expectNeutral(buildSystemPrompt(landInput));
  });

  it("Landesregierung behält ihren eigenen Neutralitätskopf", () => {
    const prompt = buildSystemPrompt({
      ...input(8, false),
      level: "Land",
      politicians: [],
      landesregierung: getLandesregierungRecipient("NW")!,
    });
    expect(prompt).toContain("PARTEI-NEUTRALITÄT (Landesregierung/Senat)");
    expect(prompt).not.toContain("(Jugendbrief)");
  });

  it("Diff-Wächter: Jugend- und Erwachsenen-Prompt unterscheiden sich nur im Partei-Abschnitt", () => {
    const normalize = (p: string) =>
      p.replace(/PARTEI-[^\n]*\n[\s\S]*?\n\nMdB-KONTEXT NUTZEN/, "PARTEI\n\nMdB-KONTEXT NUTZEN");
    const youth = buildSystemPrompt(input(8, false));
    const adult = buildSystemPrompt({ ...input(8, false), youth: undefined });
    expect(youth).not.toBe(adult);
    expect(normalize(youth)).toBe(normalize(adult));
  });

  it("Erwachsene Bund mit MdB behalten das Partei-Framing", () => {
    const adult = buildSystemPrompt({ ...input(8, false), youth: undefined });
    expect(adult).toContain("PARTEI-BEWUSSTES FRAMING");
    expect(adult).toContain("Bewahrung des Bewährten");
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

  it("schickt im Jugendmodus einen System-Prompt ohne Partei-Werte", async () => {
    const letter = Array.from({ length: 175 }, (_, i) => `Wort${i}`).join(" ");
    (mistral.chat.complete as jest.Mock).mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ selected_politician_id: 1, letter }) } }],
    });

    await generateLetter(input(12, true));

    const system = (mistral.chat.complete as jest.Mock).mock.calls[0][0].messages[0].content;
    expect(system).toContain("PARTEI-NEUTRALITÄT (Jugendbrief):");
    expect(system).not.toContain("Bewahrung des Bewährten");
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
