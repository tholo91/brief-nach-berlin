import { readFileSync } from "fs";
import { join } from "path";
import {
  FEEDBACK_TAG_SLUGS,
} from "@/lib/feedback/feedbackTags";
import {
  STAT_QUESTIONS,
  type StatQuestionKey,
} from "@/lib/internalStats/questions";

const SRC = join(process.cwd(), "src");

function normalize(value: string): string {
  return value
    .replace(/<br\s*\/?>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[„“”]/g, '"')
    .replace(/\s+/g, " ");
}

const sources = [
  "app/(site)/feedback/FeedbackForm.tsx",
  "app/(site)/rueckmeldung/RueckmeldungForm.tsx",
  "lib/email/buildLastcallHtml.ts",
  "lib/email/mailLocale.ts",
].map((file) => normalize(readFileSync(join(SRC, file), "utf8")));

function appearsInForms(text: string): boolean {
  const needle = normalize(text);
  return sources.some((source) => source.includes(needle));
}

describe("STAT_QUESTIONS", () => {
  const entries = Object.entries(STAT_QUESTIONS) as [
    StatQuestionKey,
    (typeof STAT_QUESTIONS)[StatQuestionKey],
  ][];

  it.each(entries)("%s: question text occurs verbatim in a form or mail", (_key, info) => {
    expect(appearsInForms(info.question)).toBe(true);
    if (info.hint) expect(appearsInForms(info.hint)).toBe(true);
    if (info.alternativeQuestion) {
      expect(appearsInForms(info.alternativeQuestion.question)).toBe(true);
    }
  });

  it("covers the questions behind the stat cards", () => {
    expect(Object.keys(STAT_QUESTIONS).sort()).toEqual(
      [
        "rating",
        "sendSignal",
        "efficacy",
        "letterHistory",
        "priorContact",
        "powerlessness",
        "age",
        "tags",
        "briefweg",
        "outcomeSent",
        "outcomeNotSentReason",
        "outcomeChannels",
        "outcomeAddressed",
        "outcomeFeeling",
        "outcomeExpectation",
        "outcomeEfficacy",
        "outcomeWriteAgain",
      ].sort(),
    );
    for (const [, info] of entries) {
      expect(info.question.trim()).not.toBe("");
      expect(info.asked.trim()).not.toBe("");
    }
  });

  it("lists every feedback tag, grouped", () => {
    const tags = STAT_QUESTIONS.tags;
    expect(tags.options).toHaveLength(FEEDBACK_TAG_SLUGS.length);
    expect(tags.optionGroups?.flatMap((group) => group.options)).toEqual(tags.options);
    expect(tags.options).toContain("Klingt zu sehr nach KI");
    expect(tags.options).toContain("Anliegen falsch verstanden");
  });

  it("Briefweg options match the buttons and links of the last-call mail", () => {
    for (const option of STAT_QUESTIONS.briefweg.options ?? []) {
      expect(appearsInForms(option)).toBe(true);
    }
  });

  it("uses no em dashes", () => {
    expect(JSON.stringify(STAT_QUESTIONS)).not.toContain("—");
  });
});
