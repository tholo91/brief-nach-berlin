// Mistral SDK is ESM-only and breaks ts-jest's CommonJS transform; stub it.
jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "mistral-large-latest", levelRouting: "mistral-small-latest" },
  MistralStageError: class extends Error {},
}));

import { mistral } from "@/lib/mistral";
import { generateLetter } from "@/lib/generation/generateLetter";
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

function input(overrides: Partial<GenerateLetterInput> = {}): GenerateLetterInput {
  return {
    issueText: "Die Busse in meinem Viertel fahren abends kaum noch.",
    politicians: [mdb],
    ...overrides,
  };
}

function letterWith(sentence: string, fillerWords = 210): string {
  const filler = Array.from({ length: fillerWords }, (_, index) => `Wort${index}`).join(" ");
  return `Sehr geehrte Frau Müller,\n\n${filler}. ${sentence}\n\nMit freundlichen Grüßen\n[Ihr Name]`;
}

function respond(...letters: string[]) {
  const mock = mistral.chat.complete as jest.Mock;
  for (const letter of letters) {
    mock.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ selected_politician_id: 1, letter }) } }],
    });
  }
}

const GENDER = "Als Bürgerin dieses Landes erwarte ich das.";
const CLEAN = "Ich erwarte das.";

describe("generateLetter: Nachbearbeitung und Korrektur-Runde", () => {
  beforeEach(() => {
    (mistral.chat.complete as jest.Mock).mockReset();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("ersetzt Gedankenstriche ohne zweiten Call", async () => {
    respond(letterWith("Der Bus fehlt – gerade abends."));

    const result = await generateLetter(input());

    expect(mistral.chat.complete).toHaveBeenCalledTimes(1);
    expect(result.letter).toContain("Der Bus fehlt, gerade abends.");
    expect(result.letter).not.toMatch(/[–—]/);
    expect(result.retried).toBe(false);
  });

  it("korrigiert ein erfundenes Geschlecht mit genau einem zweiten Call", async () => {
    respond(letterWith(GENDER), letterWith(CLEAN));

    const result = await generateLetter(input());

    expect(mistral.chat.complete).toHaveBeenCalledTimes(2);
    expect(result.letter).toContain(CLEAN);
    expect(result.letter).not.toContain("Bürgerin");
    expect(result.retried).toBe(true);
    const retryMessages = (mistral.chat.complete as jest.Mock).mock.calls[1][0].messages;
    expect(retryMessages.at(-1).content).toContain(`"${GENDER}"`);
  });

  it("löst bei nicht nur ... sondern keinen zweiten Call aus", async () => {
    respond(letterWith("Das ist nicht nur ärgerlich, sondern gefährlich."));

    await generateLetter(input());

    expect(mistral.chat.complete).toHaveBeenCalledTimes(1);
  });

  it("lässt Selbstbezeichnungen aus dem Transkript stehen", async () => {
    respond(letterWith("Als Lehrerin sehe ich das jeden Tag."));

    const result = await generateLetter(input({ issueText: "Ich bin Lehrerin und die Busse fahren abends kaum." }));

    expect(mistral.chat.complete).toHaveBeenCalledTimes(1);
    expect(result.letter).toContain("Als Lehrerin sehe ich das jeden Tag.");
  });

  it("behält den ersten Brief, wenn die Korrektur den Fehler nicht behebt", async () => {
    respond(letterWith(`${GENDER} Der Bus fehlt – gerade abends.`), letterWith("Als Rentnerin erwarte ich das."));

    const result = await generateLetter(input());

    expect(result.letter).toContain(GENDER);
    expect(result.letter).toContain("Der Bus fehlt, gerade abends.");
  });

  it("verwirft eine Korrektur, die aus dem Längenfenster fällt", async () => {
    respond(letterWith(GENDER), letterWith(CLEAN, 30));

    const result = await generateLetter(input());

    expect(result.letter).toContain(GENDER);
    expect(result.wordCountInRange).toBe(true);
  });

  it("behält den ersten Brief, wenn der Korrektur-Call fehlschlägt", async () => {
    respond(letterWith(GENDER));
    (mistral.chat.complete as jest.Mock).mockRejectedValueOnce(new Error("Service unavailable"));
    jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await generateLetter(input());

    expect(result.letter).toContain(GENDER);
    expect(result.retried).toBe(true);
  });

  it("teilt sich die eine Korrektur-Runde mit der Längenprüfung", async () => {
    respond(letterWith(GENDER, 30), letterWith(GENDER, 30));

    await generateLetter(input());

    expect(mistral.chat.complete).toHaveBeenCalledTimes(2);
    const directive = (mistral.chat.complete as jest.Mock).mock.calls[1][0].messages.at(-1).content;
    expect(directive).toContain("Wörter");
    expect(directive).toContain("Ändere dabei außerdem diese Stellen:");
  });
});
