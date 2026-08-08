import { ISSUE_TEXT_MAX, step2Schema } from "@/lib/validation/wizardSchemas";

describe("step2Schema issueText limits", () => {
  it("accepts text within the max length", () => {
    const issueText = "a".repeat(ISSUE_TEXT_MAX);
    expect(step2Schema.safeParse({ issueText }).success).toBe(true);
  });

  it("rejects text above the max length with a clear message", () => {
    const issueText = "a".repeat(ISSUE_TEXT_MAX + 1);
    const result = step2Schema.safeParse({ issueText });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Dein Anliegen ist zu lang. Bitte kürze es.");
    }
  });
});
