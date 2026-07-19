/**
 * Level-aware Prompt-Tests (999.6, LOCK-1):
 * - Bund bleibt byte-identisch zum heutigen Prompt (Snapshot-Gleichheit).
 * - Flag aus → alle Ebenen bekommen den Bund-Prompt.
 * - Land/Kommune-Branches enthalten ihre Strategie-Blöcke, keine GG-Artikel.
 * - Kompetenz-Mismatch-Block nur bei bewusstem Override.
 */

// Mistral SDK is ESM-only and breaks ts-jest's CommonJS transform. We don't
// call it here — only the pure prompt helpers — so stub the module out.
jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "mistral-large-latest", levelRouting: "mistral-small-latest" },
}));

import { mistral } from "@/lib/mistral";
import {
  buildSystemPrompt,
  buildUserPrompt,
  generateLetter,
  tonalityBlock,
} from "@/lib/generation/generateLetter";
import type { GenerateLetterInput } from "@/lib/types/wizard";
import type { Politician } from "@/lib/types/politician";
import type { RathausRecipient } from "@/lib/lookup/rathausRecipient";

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

const mdl: Politician = {
  ...mdb,
  id: 2,
  firstName: "Karl",
  lastName: "Schmidt",
  level: "Land",
  wahlkreisName: "Köln II",
  bundeslandKey: "NW",
  postalAddress: "Landtag Nordrhein-Westfalen, Platz des Landtags 1, 40221 Düsseldorf",
};

const rathaus: RathausRecipient = {
  kind: "rathaus",
  level: "Kommune",
  recipientKind: "buergermeisteramt",
  gemeindeName: "Köln",
  plz: "50667",
  label: "Bürgermeisteramt Köln",
  postalAddress: "Bürgermeisteramt Köln",
  address: { source: "fallback" },
};

function input(overrides: Partial<GenerateLetterInput> = {}): GenerateLetterInput {
  return {
    issueText: "Die Schlaglöcher in der Goethestraße sind gefährlich.",
    politicians: [mdb],
    ...overrides,
  };
}

const originalFlag = process.env.LETTER_PROMPT_LEVEL_AWARE;
afterEach(() => {
  if (originalFlag === undefined) delete process.env.LETTER_PROMPT_LEVEL_AWARE;
  else process.env.LETTER_PROMPT_LEVEL_AWARE = originalFlag;
});

describe("buildSystemPrompt: Flag aus (gemeinsamer Grundprompt)", () => {
  it("liefert für alle Ebenen denselben Bund-Prompt", () => {
    process.env.LETTER_PROMPT_LEVEL_AWARE = "false";
    const bund = buildSystemPrompt(input({ level: "Bund" }));
    const land = buildSystemPrompt(input({ level: "Land", politicians: [mdl] }));
    const kommune = buildSystemPrompt(input({ level: "Kommune", rathaus, politicians: [] }));
    expect(land).toBe(bund);
    expect(kommune).toBe(bund);
    expect(bund).toContain("Alle verfügbaren Politiker sind Bundestagsabgeordnete.");
  });

  it("hängt auch bei Override keinen Mismatch-Block an", () => {
    process.env.LETTER_PROMPT_LEVEL_AWARE = "false";
    const prompt = buildSystemPrompt(input({ level: "Bund", mismatchRecommendedLevel: "Land" }));
    expect(prompt).not.toContain("KOMPETENZ-HINWEIS");
  });
});

describe("tonalityBlock", () => {
  it("enthält keine Beispiel-Opener oder Beispiel-Schlüsse mehr", () => {
    for (const tone of [1, 2, 3, 4, 5]) {
      const block = tonalityBlock(tone);
      expect(block).not.toContain("beispiel_opener");
      expect(block).not.toContain("beispiel_schluss");
      expect(block).not.toContain("Sitzungsperiode");
      expect(block).not.toContain("Geduldsfaden");
    }
  });

  it("hält Stufe 5 deutlich schärfer als Stufe 2, ohne Wut zu erfinden", () => {
    const polite = tonalityBlock(2);
    const sharp = tonalityBlock(5);

    expect(polite).toContain("höflich-konstruktiv");
    expect(polite).toContain("zugewandt");
    expect(sharp).toContain("konfrontativ-aber-respektvoll");
    expect(sharp).toContain("Kantig, fordernd, ungeglättet");
    expect(sharp).toContain("Forderung unmissverständlich");
    expect(sharp).toContain("Bewahre ausdrücklich geäußerte Wut");
    expect(sharp).toContain("Erfinde keine Enttäuschung oder Vorgeschichte");
  });
});

describe("buildSystemPrompt — Flag an", () => {
  beforeEach(() => {
    process.env.LETTER_PROMPT_LEVEL_AWARE = "true";
  });

  it("Bund bleibt byte-identisch zum Flag-aus-Prompt (LOCK-1)", () => {
    const flagOn = buildSystemPrompt(input({ level: "Bund" }));
    process.env.LETTER_PROMPT_LEVEL_AWARE = "false";
    const flagOff = buildSystemPrompt(input({ level: "Bund" }));
    expect(flagOn).toBe(flagOff);
  });

  it("Bund default (level fehlt) bleibt ebenfalls der heutige Prompt", () => {
    const prompt = buildSystemPrompt(input());
    expect(prompt).toContain("Alle verfügbaren Politiker sind Bundestagsabgeordnete.");
    expect(prompt).not.toContain("STRATEGIE FÜR DIE LAND-EBENE");
  });

  it("Land: Strategie-Block ersetzt den Bund-Zuständigkeitshinweis", () => {
    const prompt = buildSystemPrompt(input({ level: "Land", politicians: [mdl] }));
    expect(prompt).toContain("Alle verfügbaren Politiker sind Landtagsabgeordnete.");
    expect(prompt).toContain("STRATEGIE FÜR DIE LAND-EBENE");
    expect(prompt).toContain("Landesgesetze");
    expect(prompt).toContain("Zitiere KEINE Grundgesetz-Artikel mit Nummern");
    expect(prompt).not.toContain("Alle verfügbaren Politiker sind Bundestagsabgeordnete.");
    expect(prompt).toContain("ABGEORDNETEN-KONTEXT NUTZEN");
    expect(prompt).not.toContain("MdB-KONTEXT NUTZEN");
    // Anrede bleibt für Land unverändert (kein Gender-Resolve in v1)
    expect(prompt).toContain('Anrede: "Sehr geehrte/r [Titel] [Name],"');
  });

  it("Kommune: politischer Empfänger + neutrale Anrede + Partei-Neutralität", () => {
    const prompt = buildSystemPrompt(input({ level: "Kommune", rathaus, politicians: [] }));
    expect(prompt).toContain("STRATEGIE FÜR DIE KOMMUNALE EBENE");
    expect(prompt).toContain("Der Empfänger ist das Bürgermeisteramt der Gemeinde");
    expect(prompt).toContain('Anrede: exakt "Sehr geehrte Damen und Herren,"');
    expect(prompt).toContain("PARTEI-NEUTRALITÄT (Kommune)");
    expect(prompt).toContain("kommunaler Haushalt, örtliche Planung, Infrastruktur");
    expect(prompt).toContain("Nenne kein Fachamt, keinen Ausschuss und kein Programm");
    expect(prompt).not.toContain("Bauamt");
    expect(prompt).not.toContain("Verkehrsausschuss");
    expect(prompt).not.toContain("was die/der Abgeordnete konkret tun soll");
    expect(prompt).not.toContain("an seinen Abgeordneten schreibt");
    expect(prompt).not.toContain('Anrede: "Sehr geehrte/r [Titel] [Name],"');
    expect(prompt).not.toContain("PARTEI-BEWUSSTES FRAMING");
    expect(prompt).not.toContain("- SPD:");
    expect(prompt).not.toContain("MdB-KONTEXT NUTZEN");
  });

  it("keine GG-Artikelnummern in keinem Branch (außer als Verbots-Beispiel)", () => {
    for (const prompt of [
      buildSystemPrompt(input({ level: "Bund" })),
      buildSystemPrompt(input({ level: "Land", politicians: [mdl] })),
      buildSystemPrompt(input({ level: "Kommune", rathaus, politicians: [] })),
    ]) {
      // Die Strategie-Blöcke NENNEN GG-Artikel nur als explizites Verbot
      // ('kein "Art. 70 GG"') — diese Instruktions-Beispiele sind erlaubt.
      const stripped = prompt.replace(/kein "Art\.\s*\d+\s*GG"/g, "");
      expect(stripped).not.toMatch(/Art\.\s*\d+\s*GG/);
    }
  });

  it("Mismatch-Block erscheint nur bei bewusst abweichender Ebene", () => {
    const withMismatch = buildSystemPrompt(
      input({ level: "Land", politicians: [mdl], mismatchRecommendedLevel: "Kommune" })
    );
    expect(withMismatch).toContain("KOMPETENZ-HINWEIS");
    expect(withMismatch).toContain("unmittelbare Zuständigkeit woanders liegt");

    const samLevel = buildSystemPrompt(
      input({ level: "Land", politicians: [mdl], mismatchRecommendedLevel: "Land" })
    );
    expect(samLevel).not.toContain("KOMPETENZ-HINWEIS");

    const noRouting = buildSystemPrompt(input({ level: "Land", politicians: [mdl] }));
    expect(noRouting).not.toContain("KOMPETENZ-HINWEIS");

    const kommuneMismatch = buildSystemPrompt(
      input({
        level: "Kommune",
        rathaus,
        politicians: [],
        mismatchRecommendedLevel: "Land",
      })
    );
    expect(kommuneMismatch).toContain("öffentliche Verantwortung der Verwaltung");
    expect(kommuneMismatch).not.toContain("Verantwortung als gewählte Stimme");
    expect(kommuneMismatch).not.toContain("Beispiel-Formulierung");
    expect(kommuneMismatch).not.toContain("Trotzdem schreibe ich Ihnen, weil");
  });

  it("verbietet erfundene Vorgeschichten, Drohungen und Konsequenzen", () => {
    const prompt = buildSystemPrompt(input({ level: "Bund" }));
    expect(prompt).toContain("Zeiträume, Dauerangaben");
    expect(prompt).toContain("früheren Kontaktversuche");
    expect(prompt).toContain("keine Drohungen oder Eskalationsschritte");
    expect(prompt).toContain("Medien oder Öffentlichkeit, rechtliche Schritte");
    expect(prompt).toContain("Vertrauensverlust und andere Konsequenzen");
    expect(prompt).toContain("Unterstelle keine Untätigkeit, Pflichtverletzung");
    expect(prompt).toContain("Ausdrücklich geäußerte Wut, Frustration");
    expect(prompt).toContain("erfinde sie nicht als Tonverstärker");
    expect(prompt).toContain("Erfinde keinen Ausschuss, kein Programm und keine Zuständigkeit");
    expect(prompt).not.toContain("Sonderprogramm");
  });

  it("keine Em-Dashes in den neuen Blöcken", () => {
    const land = buildSystemPrompt(input({ level: "Land", politicians: [mdl] }));
    const kommune = buildSystemPrompt(input({ level: "Kommune", rathaus, politicians: [] }));
    const bund = buildSystemPrompt(input({ level: "Bund" }));
    // Nur NEUE Inhalte prüfen: alles, was nicht im Bund-Template steht
    for (const prompt of [land, kommune]) {
      const newLines = prompt.split("\n").filter((line) => !bund.includes(line));
      expect(newLines.join("\n")).not.toContain("—");
    }
  });
});

describe("buildUserPrompt — Kommune-Empfänger", () => {
  it("ersetzt die Politikerliste durch das Bürgermeisteramt mit neutraler Anrede", () => {
    const prompt = buildUserPrompt(
      input({ level: "Kommune", rathaus, politicians: [] }),
      200,
      280,
      3
    );
    expect(prompt).toContain("Bürgermeisteramt Köln");
    expect(prompt).toContain("Sehr geehrte Damen und Herren,");
    expect(prompt).not.toContain("Stadtverwaltung Köln");
    expect(prompt).toContain('"id": 0');
    expect(prompt).not.toContain("Anna Müller");
  });

  it("gibt bei einem Adress-Fallback keinen unbestätigten Gemeindenamen an Mistral", () => {
    const fallbackRathaus: RathausRecipient = {
      ...rathaus,
      gemeindeName: "Commerzbank AG",
      label: "Zuständiges Bürgermeisteramt",
    };
    const prompt = buildUserPrompt(
      input({ level: "Kommune", rathaus: fallbackRathaus, politicians: [] }),
      200,
      280,
      3
    );

    expect(prompt).toContain("Zuständiges Bürgermeisteramt");
    expect(prompt).toContain("nicht eindeutig zugeordnet");
    expect(prompt).not.toContain("Commerzbank AG");
  });

  it("Bezirksamt bekommt die Bezirksamts-Anrede", () => {
    const bezirksamt: RathausRecipient = {
      ...rathaus,
      recipientKind: "bezirksamt",
      gemeindeName: "Friedrichshain-Kreuzberg",
      label: "Bezirksamt Friedrichshain-Kreuzberg",
      plz: "10245",
      postalAddress: "Bezirksamt Friedrichshain-Kreuzberg, 10245 Berlin",
    };
    const prompt = buildUserPrompt(
      input({ level: "Kommune", rathaus: bezirksamt, politicians: [] }),
      200,
      280,
      3
    );
    expect(prompt).toContain("Bezirksamt Friedrichshain-Kreuzberg");
    expect(prompt).toContain("Sehr geehrte Damen und Herren,");
    expect(prompt).not.toContain("Sehr geehrte Damen und Herren des Bezirksamts,");
  });

  it.each([3, 4, 5])("Kommune erhält Tonstufe %s ohne Bund- oder Fraktionsanker", (tone) => {
    process.env.LETTER_PROMPT_LEVEL_AWARE = "true";
    const prompt = buildUserPrompt(
      input({ level: "Kommune", rathaus, politicians: [] }),
      200,
      280,
      tone
    );
    expect(prompt).toContain(`Stufe ${tone} von 5`);
    expect(prompt).not.toContain("Fraktion");
    expect(prompt).not.toContain("Sitzungsperiode");
    expect(prompt).not.toContain("<mdb_kontext>");
  });
});

describe("generateLetter — serverseitig aufgelöste Ebene", () => {
  const letter = Array.from({ length: 260 }, (_, index) => `Wort${index}`).join(" ");

  beforeEach(() => {
    (mistral.chat.complete as jest.Mock).mockReset();
  });

  it.each([
    ["Land", { level: "Land" as const, politicians: [mdl] }, 2],
    ["Kommune", { level: "Kommune" as const, politicians: [], rathaus }, 0],
  ])(
    "liefert %s vom aufgelösten Empfänger statt der Modell-Antwort",
    async (expectedLevel, overrides, selectedId) => {
      (mistral.chat.complete as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                political_level: "Bund",
                selected_politician_id: selectedId,
                letter,
              }),
            },
          },
        ],
      });

      const result = await generateLetter(input(overrides));

      expect(result.politicalLevel).toBe(expectedLevel);
      expect(result.politicalLevel).toBe(result.selectedRecipient.level);
    }
  );
});
