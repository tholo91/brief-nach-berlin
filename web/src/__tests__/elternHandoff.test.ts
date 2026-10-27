import {
  ELTERN_DRAFT_KEY,
  buildElternHandoff,
  buildElternPrefix,
  clearElternDraft,
  validateElternSubmit,
} from "@/components/eltern/elternHandoff";
import { ELTERN_TOPICS } from "@/lib/schule/elternTopics";
import { ISSUE_TEXT_MAX, ISSUE_TEXT_MIN } from "@/lib/validation/wizardSchemas";

const longEnough = "x".repeat(ISSUE_TEXT_MIN);

describe("elternHandoff", () => {
  it("nennt die Klasse im Einleitungssatz", () => {
    expect(buildElternPrefix(5)).toBe("Mein Kind geht in die 5. Klasse.");
    const result = validateElternSubmit({ klasse: 5, issueText: ` ${longEnough} ` });
    expect(result).toEqual({ ok: true, issueText: `Mein Kind geht in die 5. Klasse.\n${longEnough}` });
  });

  it("nutzt ohne Klasse den allgemeinen Satz", () => {
    expect(buildElternPrefix(null)).toBe("Ich habe ein Kind in der Schule.");
    expect(buildElternPrefix(14)).toBe("Ich habe ein Kind in der Schule.");
    const result = validateElternSubmit({ klasse: null, issueText: longEnough });
    expect(result).toEqual({ ok: true, issueText: `Ich habe ein Kind in der Schule.\n${longEnough}` });
  });

  it("übernimmt Satzanfänge der Themen in den Text", () => {
    const topic = ELTERN_TOPICS.find((t) => t.id === "schulgebaeude");
    expect(topic?.issueText).toContain("Schulträger");
    const result = validateElternSubmit({ klasse: 3, issueText: `${topic?.issueText}Die Heizung fällt aus.` });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.issueText).toContain("Die Heizung fällt aus.");
  });

  it("prüft Mindest- und Höchstlänge", () => {
    expect(validateElternSubmit({ klasse: 5, issueText: "x".repeat(ISSUE_TEXT_MIN - 1) })).toEqual({
      ok: false,
      reason: "text-short",
    });
    expect(validateElternSubmit({ klasse: 5, issueText: "   " })).toEqual({ ok: false, reason: "text-short" });
    expect(validateElternSubmit({ klasse: 5, issueText: "x".repeat(ISSUE_TEXT_MAX) })).toEqual({
      ok: false,
      reason: "text-long",
    });
  });

  it("baut ein Erwachsenen-Handoff ohne Jugend-Felder", () => {
    const handoff = buildElternHandoff({ issueText: "Text", usedSpeechToText: false });
    expect(handoff).toEqual({ issueText: "Text", source: "landing" });
    for (const key of ["audience", "klasse", "classToken", "plz"]) expect(key in handoff).toBe(false);
    expect(buildElternHandoff({ issueText: "Text", usedSpeechToText: true }).usedSpeechToText).toBe(true);
  });

  it("löscht den Entwurf", () => {
    const removeItem = jest.fn();
    clearElternDraft({ removeItem });
    expect(removeItem).toHaveBeenCalledWith(ELTERN_DRAFT_KEY);
  });
});
