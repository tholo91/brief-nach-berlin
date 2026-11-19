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
import { youthBand, youthLetterWords } from "@/lib/schule/youth";
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

// Eingaben ab 200 Zeichen: die Wortzahl folgt der Altersstufe statt der Kurz-Eingabe.
function longInput(klasse: number, viaClassLink = false): GenerateLetterInput {
  return {
    ...input(klasse, viaClassLink),
    issueText: "Bei uns in der Schule fällt oft der Unterricht aus, weil Lehrkräfte fehlen. ".repeat(4),
  };
}

function wordsOf(n: number): string {
  return Array.from({ length: n }, (_, i) => `Wort${i}`).join(" ");
}

function mockLetter(wordCount: number) {
  (mistral.chat.complete as jest.Mock).mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({ selected_politician_id: 1, letter: wordsOf(wordCount) }) } }],
  });
}

describe("Altersstufen im Jugend-Block", () => {
  it.each([
    [5, "5-7"],
    [7, "5-7"],
    [8, "8-10"],
    [10, "8-10"],
    [11, "11-13"],
    [13, "11-13"],
  ])("Klasse %i liegt in Stufe %s", (klasse, band) => {
    expect(youthBand(klasse)).toBe(band);
  });

  it("Klasse 5 bis 7: klar, einfach, ein konkretes Beispiel aus der Eingabe", () => {
    for (const klasse of [5, 7]) {
      const block = youthBlock(buildUserPrompt(input(klasse, false), 80, 150, 3));
      expect(block).toContain("Aufbau: Schreibe klar und einfach");
      expect(block).toContain("einem konkreten Beispiel aus meiner Eingabe");
      expect(block).not.toContain("Frage nach dem Standpunkt");
    }
  });

  it("Klasse 8 bis 10: Problem, Begründung, konkrete Bitte", () => {
    for (const klasse of [8, 10]) {
      const block = youthBlock(buildUserPrompt(input(klasse, false), 100, 180, 3));
      expect(block).toContain("Aufbau: Nenne das Problem, begründe kurz");
      expect(block).toContain("konkrete Bitte");
      expect(block).not.toContain("Frage nach dem Standpunkt");
    }
  });

  it("Klasse 11 bis 13: sachlich, Begründung, eine Frage nach dem Standpunkt", () => {
    for (const klasse of [11, 13]) {
      const block = youthBlock(buildUserPrompt(input(klasse, false), 120, 200, 3));
      expect(block).toContain("Aufbau: Schreibe sachlich");
      expect(block).toContain("stelle am Ende eine Frage nach dem Standpunkt des Empfängers");
    }
  });

  it.each([5, 9, 12])("Klasse %i: nur Fakten aus der Eingabe, Länge folgt der Eingabe", (klasse) => {
    const block = youthBlock(buildUserPrompt(input(klasse, true), 80, 150, 3));
    expect(block).toContain("Nutze nur Fakten, Zahlen, Orte und Erlebnisse, die im <transkript> stehen");
    expect(block).toContain("Die Länge folgt der Eingabe");
    // Wahlstatus-Satz und Unterrichtsprojekt bleiben in jeder Stufe.
    expect(block).toContain("wählen darf");
    expect(block).toContain("Unterrichtsprojekt");
  });
});

describe("youthLetterWords", () => {
  it("kurze Eingabe: etwa 80 bis 120 Wörter, in jeder Stufe", () => {
    for (const klasse of [5, 9, 13]) {
      expect(youthLetterWords(klasse, 60)).toEqual({ min: 80, max: 120 });
    }
  });

  it("längere Eingabe: Obergrenze 150, 180 und 200 je Stufe", () => {
    expect(youthLetterWords(6, 400).max).toBe(150);
    expect(youthLetterWords(9, 400).max).toBe(180);
    expect(youthLetterWords(12, 400).max).toBe(200);
    expect(youthLetterWords(9, undefined).max).toBe(180);
  });
});

describe("generateLetter im Jugendmodus", () => {
  beforeEach(() => {
    (mistral.chat.complete as jest.Mock).mockReset();
  });

  it("berechnet maxTokens aus der Stufen-Obergrenze, auch bei gewählter Länge 2", async () => {
    mockLetter(140);

    await generateLetter({ ...longInput(8, true), letterLength: "2" });

    expect(mistral.chat.complete).toHaveBeenCalledTimes(1);
    const args = (mistral.chat.complete as jest.Mock).mock.calls[0][0];
    expect(args.maxTokens).toBe(Math.ceil(180 * 2.2) + 250);
    expect(args.messages[1].content).toContain("woerter: 100 bis 180");
  });

  it("verlangt in Klasse 5 bis 7 höchstens 150, in Klasse 11 bis 13 höchstens 200 Wörter", async () => {
    mockLetter(110);
    await generateLetter(longInput(6, false));
    const young = (mistral.chat.complete as jest.Mock).mock.calls[0][0];
    expect(young.maxTokens).toBe(Math.ceil(150 * 2.2) + 250);
    expect(young.messages[1].content).toContain("woerter: 80 bis 150");
    expect(young.messages[1].content).toContain("Ich gehe in die 6. Klasse.");

    mockLetter(160);
    await generateLetter(longInput(12, false));
    const old = (mistral.chat.complete as jest.Mock).mock.calls[1][0];
    expect(old.messages[1].content).toContain("woerter: 120 bis 200");
  });

  it("kurze Eingabe ergibt etwa 80 bis 120 Wörter", async () => {
    mockLetter(100);

    await generateLetter(input(12, false));

    const args = (mistral.chat.complete as jest.Mock).mock.calls[0][0];
    expect(args.messages[1].content).toContain("woerter: 80 bis 120");
    expect(args.maxTokens).toBe(Math.ceil(120 * 2.2) + 250);
  });

  it("schickt im Jugendmodus einen System-Prompt ohne Partei-Werte", async () => {
    mockLetter(150);

    await generateLetter(input(12, true));

    const system = (mistral.chat.complete as jest.Mock).mock.calls[0][0].messages[0].content;
    expect(system).toContain("PARTEI-NEUTRALITÄT (Jugendbrief):");
    expect(system).not.toContain("Bewahrung des Bewährten");
  });

  it("nutzt für den Retry-Korridor das Fenster der Stufe", async () => {
    (mistral.chat.complete as jest.Mock)
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ selected_politician_id: 1, letter: wordsOf(300) }) } }],
      })
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ selected_politician_id: 1, letter: wordsOf(140) }) } }],
      });
    jest.spyOn(console, "warn").mockImplementation(() => {});

    await generateLetter(longInput(10, false));

    expect(mistral.chat.complete).toHaveBeenCalledTimes(2);
    const directive = (mistral.chat.complete as jest.Mock).mock.calls[1][0].messages[3].content;
    expect(directive).toContain("Das Zielfenster ist 100–180 Wörter");
  });
});
