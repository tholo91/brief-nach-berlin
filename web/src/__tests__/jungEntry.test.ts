import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("server-only", () => ({}), { virtual: true });
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
jest.mock("@/components/topics/useTopicStarters", () => {
  const actual = jest.requireActual("@/components/topics/useTopicStarters");
  return { ...actual, useTopicStarters: jest.fn(actual.useTopicStarters) };
});

import { JungExperience } from "@/components/jung/JungExperience";
import { resolveJungEntry } from "@/components/jung/jungEntry";
import {
  JUNG_DRAFT_KEY,
  JUNG_KLASSE_KEY,
  buildJungHandoff,
  clearJungDraft,
  validateJungSubmit,
} from "@/components/jung/jungHandoff";
import { useTopicStarters } from "@/components/topics/useTopicStarters";
import { signClassToken } from "@/lib/schule/classToken";
import { JUNG_TOPICS } from "@/lib/schule/jungTopics";

const LIMIT_MESSAGE = "Ein Brief mit einem Thema wirkt stärker.";

describe("resolveJungEntry", () => {
  const verify = jest.fn();
  const originalSecret = process.env.FEEDBACK_TOKEN_SECRET;
  beforeEach(() => {
    verify.mockReset();
    process.env.FEEDBACK_TOKEN_SECRET = "test-class-token-secret";
  });
  afterAll(() => {
    process.env.FEEDBACK_TOKEN_SECRET = originalSecret;
  });

  it("returns none without k", () => {
    expect(resolveJungEntry(undefined, verify)).toEqual({ status: "none" });
    expect(resolveJungEntry("", verify)).toEqual({ status: "none" });
    expect(verify).not.toHaveBeenCalled();
  });
  it("returns invalid for a bad token", () => {
    verify.mockReturnValue(null);
    expect(resolveJungEntry("kaputt", verify)).toEqual({ status: "invalid" });
  });
  it("returns klasse, plz and token but never bucketId", () => {
    verify.mockReturnValue({ klasse: 9, plz: "28195", issuedAt: 1, bucketId: "geheim" });
    const entry = resolveJungEntry(["tok", "zweites"], verify);
    expect(entry).toEqual({ status: "valid", klasse: 9, plz: "28195", token: "tok" });
    expect(JSON.stringify(entry)).not.toContain("geheim");
  });
  it("works with the real verifier", () => {
    const token = signClassToken({ klasse: 10, plz: "28195" });
    expect(resolveJungEntry(token)).toEqual({ status: "valid", klasse: 10, plz: "28195", token });
    expect(resolveJungEntry("kaputt")).toEqual({ status: "invalid" });
  });
});

describe("validateJungSubmit", () => {
  it("requires a Klasse first", () => {
    expect(validateJungSubmit({ klasse: null, issueText: "genug Text hier" })).toEqual({ ok: false, reason: "klasse" });
    expect(validateJungSubmit({ klasse: 6, issueText: "genug Text hier" })).toEqual({ ok: false, reason: "klasse" });
  });
  it("requires the minimum text length after trimming", () => {
    expect(validateJungSubmit({ klasse: 9, issueText: "   kurz   " })).toEqual({ ok: false, reason: "text-short" });
    expect(validateJungSubmit({ klasse: 9, issueText: "x".repeat(5001) })).toEqual({ ok: false, reason: "text-long" });
  });
  it("accepts and trims", () => {
    expect(validateJungSubmit({ klasse: 9, issueText: "  zehn Zeichen!  " })).toEqual({ ok: true, issueText: "zehn Zeichen!" });
  });
});

describe("buildJungHandoff", () => {
  it("builds the plain youth handoff without a class link", () => {
    expect(
      buildJungHandoff({ issueText: "Text", klasse: 8, entry: { status: "none" }, usedSpeechToText: false }),
    ).toEqual({ issueText: "Text", source: "landing", audience: "jung", klasse: 8 });
  });
  it("adds token and plz only for a valid class link, plus voice flag", () => {
    expect(
      buildJungHandoff({
        issueText: "Text",
        klasse: 9,
        entry: { status: "valid", klasse: 9, plz: "28195", token: "tok" },
        usedSpeechToText: true,
      }),
    ).toEqual({
      issueText: "Text",
      source: "landing",
      audience: "jung",
      klasse: 9,
      classToken: "tok",
      plz: "28195",
      usedSpeechToText: true,
    });
    expect(
      buildJungHandoff({ issueText: "T", klasse: 9, entry: { status: "invalid" }, usedSpeechToText: false }),
    ).not.toHaveProperty("classToken");
  });
});

describe("clearJungDraft", () => {
  it("removes text, topics and klasse so the next person starts empty", () => {
    const store = new Map<string, string>([
      [JUNG_DRAFT_KEY, '{"issueText":"Mein Bus kommt nie"}'],
      [JUNG_KLASSE_KEY, "9"],
      ["wizard-handoff", "{}"],
    ]);
    clearJungDraft({ removeItem: (key: string) => void store.delete(key) });
    expect([...store.keys()]).toEqual(["wizard-handoff"]);
  });
});

describe("/schule page (Schüler:innen)", () => {
  const originalSecret = process.env.FEEDBACK_TOKEN_SECRET;
  beforeAll(() => {
    process.env.FEEDBACK_TOKEN_SECRET = "test-class-token-secret";
  });
  afterAll(() => {
    process.env.FEEDBACK_TOKEN_SECRET = originalSecret;
  });

  async function render(k?: string) {
    const { default: JungPage } = await import("@/app/(site)/schule/page");
    const element = await JungPage({ searchParams: Promise.resolve(k === undefined ? {} : { k }) });
    return renderToStaticMarkup(element);
  }

  it("sets the /schule canonical and puts the teacher link before the form", async () => {
    const { metadata } = await import("@/app/(site)/schule/page");
    expect(metadata.alternates?.canonical).toBe("https://www.brief-nach-berlin.de/schule");
    const html = await render();
    const link = html.indexOf("Du bist Lehrkraft?");
    expect(link).toBeGreaterThan(-1);
    expect(link).toBeLessThan(html.indexOf('id="schreiben"'));
    expect(html).toContain('href="/unterricht"');
    expect(html.split("Du bist Lehrkraft?")).toHaveLength(2);
    expect(html).not.toContain("Du bist Elternteil");
  });

  it("renders the form with chips, connector and reveal without a class link", async () => {
    const html = await render();
    expect(html).toContain('id="schreiben"');
    expect(html).toContain("Wählen darfst du noch nicht.");
    expect(html).toContain("Schreiben schon.");
    expect(html).not.toContain('name="klasse"');
    expect(html).toContain("Ein, zwei eigene Sätze reichen.");
    expect(html).not.toContain("Brief entwerfen");
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("step-connector");
    expect(html).toContain("reveal");
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("font-handwriting");
    expect(html).not.toMatch(/[–—]/);
  });

  it("shows the new intro, first placeholder, short after-button line and expandable chips", async () => {
    const html = await render();
    expect(html).toContain(
      "Erzähl, was dich stört. Das Tool macht daraus einen Brief an die Politik.",
    );
    expect(html).toContain(
      'placeholder="Seit den Herbstferien hatten wir in Mathe drei Vertretungen. Ich fühle mich allein gelassen."',
    );
    expect(html).not.toContain("Ein Erlebnis reicht");
    expect(html).not.toContain("bis zu zwei");
    expect(html).not.toContain(LIMIT_MESSAGE);
    expect(html).not.toContain("An wen dein Brief geht, schlägt dir das Tool vor.");
    expect(html).not.toContain("Als Nächstes gibst du");
    expect(html).toContain("Alle Themen");
    expect(html).toContain('aria-controls="jung-thema-chips"');
    expect(html).toContain('id="jung-thema-chips"');
    expect(html).toContain('src="/jung-bg.webm"');
    expect(html).toContain('poster="/jung-bg.webp"');
    expect(html).not.toContain("img-jung-treppe");
  });

  it("replaces the class picker with a confirmation for a valid link", async () => {
    const html = await render(signClassToken({ klasse: 9, plz: "28195" }));
    expect(html).not.toContain("Klasse 9, PLZ 28195 eingetragen.");
    expect(html).toContain("ändern");
    expect(html).not.toContain('name="klasse"');
  });

  it("shows the invalid-link note for a broken token", async () => {
    const html = await render("kaputt");
    expect(html).toContain("Dieser Klassenlink ist abgelaufen oder ungültig.");
  });
});

describe("JungExperience step by step", () => {
  const hookState = (issueText: string, topicInsertions: Record<string, string>) =>
    ({
      selectedTopicIds: Object.keys(topicInsertions),
      topicInsertions,
      issueText,
      setIssueText: jest.fn(),
      statusMessage: "",
      setStatusMessage: jest.fn(),
      toggleTopic: jest.fn(),
      selectionLimitReached: false,
    }) as ReturnType<typeof useTopicStarters>;

  it("keeps class and button hidden while only a starter is in the field", () => {
    const starter = JUNG_TOPICS[0].issueText;
    jest.mocked(useTopicStarters).mockReturnValueOnce(hookState(starter, { [JUNG_TOPICS[0].id]: starter }));
    const html = renderToStaticMarkup(createElement(JungExperience, { entry: { status: "none" } }));
    expect(html).not.toContain('name="klasse"');
    expect(html).not.toContain("Brief entwerfen");
  });

  it("shows class after the topic and the button once there is own text", () => {
    const starter = JUNG_TOPICS[0].issueText;
    jest
      .mocked(useTopicStarters)
      .mockReturnValueOnce(hookState(`${starter}die Fenster gehen nicht auf.`, { [JUNG_TOPICS[0].id]: starter }));
    const html = renderToStaticMarkup(createElement(JungExperience, { entry: { status: "none" } }));
    expect(html.match(/name="klasse"/g)).toHaveLength(7);
    expect(html).toContain("Brief entwerfen");
    expect(html.indexOf("Was nervt dich?")).toBeLessThan(html.indexOf('name="klasse"'));
  });
});

describe("JungExperience topic limit", () => {
  it("explains the greyed-out chips once two topics are selected", () => {
    jest.mocked(useTopicStarters).mockReturnValueOnce({
      selectedTopicIds: JUNG_TOPICS.slice(0, 2).map((topic) => topic.id),
      topicInsertions: {},
      issueText: "",
      setIssueText: jest.fn(),
      statusMessage: "",
      setStatusMessage: jest.fn(),
      toggleTopic: jest.fn(),
      selectionLimitReached: true,
    } as ReturnType<typeof useTopicStarters>);
    const html = renderToStaticMarkup(createElement(JungExperience, { entry: { status: "none" } }));
    expect(html.match(new RegExp(LIMIT_MESSAGE, "g"))).toHaveLength(1);
    expect(html).toContain('disabled=""');
  });
});
