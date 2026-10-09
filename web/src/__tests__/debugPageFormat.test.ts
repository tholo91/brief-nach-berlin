import { format } from "@/app/debug/formatDebug";
import type { LetterDebugPayload } from "@/lib/email/sendLetterEmail";
import type { LetterVariantDebugPayload } from "@/lib/email/variantDebugPayload";

const basePayload: LetterDebugPayload = {
  toneLevel: 3,
  toneLabel: "sachlich-engagiert",
  letterLengthKey: "1",
  letterLengthMin: 200,
  letterLengthMax: 280,
  issueTextLength: 120,
  issueTextPreview: "Kurzes Anliegen",
  wordCount: 230,
  wordCountInRange: true,
  fallbackUsed: false,
  retried: false,
  politicalLevel: "Bund",
  representativeName: "Serdar Yüksel",
  representativeWahlkreis: "Bochum I",
  representativeLevel: "Bund",
  representativeParty: "SPD",
  representativeKind: "mdb",
  mdbContextUsed: true,
  availablePoliticianCount: 6,
  model: "mistral-large-latest",
  temperature: 0.4,
  generationMs: 1000,
  hasParty: false,
  hasNgo: false,
  usedSpeechToText: false,
};

describe("/debug format", () => {
  it("rendert alte Payloads ohne neue Felder ohne Fehler", () => {
    const { issueTextPreview: _omit, ...oldPayload } = basePayload;
    void _omit;
    const text = format({ ...oldPayload, issueTextLength: 10 });

    expect(text).toContain("Anliegen (Auszug, max 2000 Zeichen):");
    expect(text).not.toContain("gekürzt");
    expect(text).not.toContain("Routed level");
    expect(text).not.toContain("Mismatch framing");
    expect(text).toContain("Letter ID             —");
    expect(text).toContain("Code version          —");
  });

  it("rendert Routing, Mismatch, Letter-ID, Code-Version und Kürzung", () => {
    const text = format({
      ...basePayload,
      issueTextLength: 2450,
      issueTextPreview: "x".repeat(2000),
      routedPrimaryLevel: "Land",
      routedPrimaryConfidence: "high",
      wasOverridden: true,
      selectedLevel: "Bund",
      letterId: "abc-123",
      codeVersion: "290b27e",
    });

    expect(text).toContain("gekürzt: 2000 von 2450 Zeichen");
    expect(text).toContain("Routed level          Land (high)");
    expect(text).toContain("Selected level        Bund");
    expect(text).toContain("Overridden            true");
    expect(text).toContain("Mismatch framing      ja (empfohlene Ebene: Land)");
    expect(text).toContain("Letter ID             abc-123");
    expect(text).toContain("Code version          290b27e");
  });

  it("kein Mismatch ohne Override", () => {
    const text = format({
      ...basePayload,
      routedPrimaryLevel: "Bund",
      routedPrimaryConfidence: "medium",
      wasOverridden: false,
      selectedLevel: "Bund",
    });

    expect(text).toContain("Mismatch framing      nein");
  });

  it("kein Mismatch, wenn Override ohne geroutete Ebene", () => {
    const text = format({
      ...basePayload,
      routedPrimaryLevel: null,
      routedPrimaryConfidence: null,
      wasOverridden: true,
      selectedLevel: "Kommune",
    });

    expect(text).toContain("Routed level          —");
    expect(text).toContain("Mismatch framing      nein");
  });

  it("zeigt die Code-Version in der Variant-Ansicht", () => {
    const variant: LetterVariantDebugPayload = {
      source: "brief_variant",
      originalToneLabel: "sachlich-engagiert",
      requestedToneLevel: 3,
      requestedToneLabel: "sachlich-engagiert",
      originalLetterLength: 100,
      originalLetterWordCount: 20,
      originalLetterPreview: "Brief",
      changeRequestLength: 0,
      letterLengthKey: "1",
      letterLengthMin: 200,
      letterLengthMax: 280,
      wordCount: 230,
      wordCountInRange: true,
      model: "m",
      temperature: 0.4,
      generationMs: 10,
      lengthRetried: false,
      codeVersion: "290b27e",
    };

    expect(format(variant)).toContain("Code version         290b27e");
    const { codeVersion: _c, ...old } = variant;
    void _c;
    expect(format(old)).toContain("Code version         —");
  });
});
