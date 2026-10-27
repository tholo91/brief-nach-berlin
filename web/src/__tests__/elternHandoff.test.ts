import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch: jest.fn(), push: jest.fn() }),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));
jest.mock("@/components/audio/VoiceRecorder", () => ({ VoiceRecorder: () => null }));
jest.mock("@/lib/mistral", () => ({}));

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

describe("/eltern page", () => {
  it("renders two doors, the form anchor and the unchanged privacy copy", async () => {
    const { default: ElternPage } = await import("@/app/(site)/eltern/page");
    const html = renderToStaticMarkup(createElement(ElternPage));
    expect(html).toContain("Schreib der Politik, was an der Schule deiner Kinder fehlt.");
    expect(html).toContain("Ich will selbst einen Brief schreiben");
    expect(html).toContain("Mein Kind will Brief-nach-Berlin mit seiner Klasse nutzen");
    expect(html).toContain("Was mit den Daten passiert und wie die Lehrkraft startet.");
    expect(html).not.toContain("Mein Kind hat es in der Schule genutzt");
    expect(html).not.toContain("Ich will selbst schreiben");
    expect(html).not.toContain("Welche Daten verarbeitet werden und welche nicht.");
    expect(html).toContain("Alle Themen");
    expect(html).toContain('aria-controls="eltern-thema-chips"');
    expect(html).toContain('id="eltern-thema-chips"');
    expect(html).toContain('href="#schreiben"');
    expect(html).toContain('href="#sicher"');
    expect(html).toContain('id="schreiben"');
    expect(html).toContain('id="sicher"');
    expect(html).toContain("Ist das sicher?");
    expect(html).toContain(
      "Im Jugendmodus bekommt dein Kind nur die eine Mail mit dem Entwurf: keine Erinnerungen, keine Spendenbitte, keine Frage nach einer Partei, keine Kartenfunktion.",
    );
    expect(html).toContain("sie stammt vom Niedersächsischen Kultusministerium.");
    expect(html).toContain("application/ld+json");
    expect(html).not.toContain("font-handwriting");
    expect(html).not.toMatch(/[–—]/);
  });
});
