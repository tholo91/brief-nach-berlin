import { appendPersonalHook } from "@/components/wizard/StepPreferences";

describe("appendPersonalHook", () => {
  it("keeps the person's text and appends the selected hook", () => {
    expect(appendPersonalHook("Meine Schwester wartet lange.", "Ich kenne Betroffene:")).toBe(
      "Meine Schwester wartet lange. Ich kenne Betroffene: "
    );
  });

  it("does not append the same hook twice", () => {
    expect(appendPersonalHook("Ich kenne Betroffene: Meine Schwester.", "Ich kenne Betroffene:")).toBe(
      "Ich kenne Betroffene: Meine Schwester."
    );
  });
});
