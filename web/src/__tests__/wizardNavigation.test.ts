import { wizardStepDirection } from "@/lib/wizard-navigation";

describe("wizardStepDirection", () => {
  it("marks all normal step advances as forward", () => {
    expect(wizardStepDirection(1, 2)).toBe("forward");
    expect(wizardStepDirection(2, "2b")).toBe("forward");
    expect(wizardStepDirection("2b", "level")).toBe("forward");
    expect(wizardStepDirection("level", 3)).toBe("forward");
  });

  it("marks step changes back toward the form as backward", () => {
    expect(wizardStepDirection(3, "level")).toBe("backward");
    expect(wizardStepDirection("level", "2b")).toBe("backward");
    expect(wizardStepDirection("2b", 2)).toBe("backward");
    expect(wizardStepDirection(2, 1)).toBe("backward");
  });

  it("does not animate a step that stays mounted", () => {
    expect(wizardStepDirection("2b", "2b")).toBe("none");
  });
});
