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

import { buildSystemPrompt, buildUserPrompt } from "@/lib/generation/generateLetter";
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
  recipientKind: "stadtverwaltung",
  gemeindeName: "Köln",
  plz: "50667",
  label: "Stadtverwaltung Köln",
  postalAddress: "Stadtverwaltung Köln, 50667 Köln",
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

describe("buildSystemPrompt — Flag aus (heutiges Verhalten)", () => {
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
    // Anrede bleibt für Land unverändert (kein Gender-Resolve in v1)
    expect(prompt).toContain('Anrede: "Sehr geehrte/r [Titel] [Name],"');
  });

  it("Kommune: generische Verwaltungs-Anrede + Strategie + Partei-Neutralität", () => {
    const prompt = buildSystemPrompt(input({ level: "Kommune", rathaus, politicians: [] }));
    expect(prompt).toContain("STRATEGIE FÜR DIE KOMMUNALE EBENE");
    expect(prompt).toContain("Sehr geehrte Damen und Herren der Stadtverwaltung,");
    expect(prompt).toContain("PARTEI-NEUTRALITÄT (Verwaltung)");
    expect(prompt).not.toContain('Anrede: "Sehr geehrte/r [Titel] [Name],"');
    expect(prompt).not.toContain("PARTEI-BEWUSSTES FRAMING");
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
    expect(withMismatch).toContain("nicht unmittelbar zuständig");

    const samLevel = buildSystemPrompt(
      input({ level: "Land", politicians: [mdl], mismatchRecommendedLevel: "Land" })
    );
    expect(samLevel).not.toContain("KOMPETENZ-HINWEIS");

    const noRouting = buildSystemPrompt(input({ level: "Land", politicians: [mdl] }));
    expect(noRouting).not.toContain("KOMPETENZ-HINWEIS");
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
  it("ersetzt die Politikerliste durch den Verwaltungs-Empfänger mit Anrede", () => {
    const prompt = buildUserPrompt(
      input({ level: "Kommune", rathaus, politicians: [] }),
      200,
      280,
      3
    );
    expect(prompt).toContain("Stadtverwaltung Köln");
    expect(prompt).toContain("Sehr geehrte Damen und Herren der Stadtverwaltung,");
    expect(prompt).toContain('"id": 0');
    expect(prompt).not.toContain("Anna Müller");
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
    expect(prompt).toContain("Sehr geehrte Damen und Herren des Bezirksamts,");
  });
});
