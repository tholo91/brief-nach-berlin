import {
  clearHandoff,
  entryStepForHandoff,
  peekHandoff,
  saveHandoff,
} from "@/lib/wizard-handoff";

class SessionStorageMock {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe("wizard handoff", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(global, "sessionStorage", {
      value: new SessionStorageMock(),
      configurable: true,
    });
  });

  it("keeps an unfinished landing handoff available across repeated wizard mounts", () => {
    saveHandoff({
      issueText: "Der sichere Schulweg braucht dringend einen Radweg.",
      source: "landing",
    });

    expect(peekHandoff()).toMatchObject({
      issueText: "Der sichere Schulweg braucht dringend einen Radweg.",
      source: "landing",
    });
    expect(peekHandoff()).toMatchObject({
      issueText: "Der sichere Schulweg braucht dringend einen Radweg.",
    });
  });

  it("starts handoffs at contact details and direct visits at the issue", () => {
    expect(entryStepForHandoff(null)).toBe(1);
    expect(entryStepForHandoff({ issueText: "Landing", source: "landing" })).toBe(2);
    expect(entryStepForHandoff({ issueText: "Kampagne", source: "campaign" })).toBe(2);
  });

  it("removes the handoff once the recipient flow has started", () => {
    saveHandoff({ issueText: "Mehr sichere Schulwege in unserem Stadtteil." });

    clearHandoff();

    expect(peekHandoff()).toBeNull();
  });

  it("removes an abandoned sensitive handoff after 30 minutes", () => {
    const dateNow = jest.spyOn(Date, "now").mockReturnValue(1_000_000);
    saveHandoff({ issueText: "Dieser Entwurf soll nicht im Tab liegen bleiben." });

    dateNow.mockReturnValue(1_000_000 + 30 * 60 * 1000 + 1);

    expect(peekHandoff()).toBeNull();
    expect(sessionStorage.getItem("wizard-handoff")).toBeNull();
  });

  it("preserves a campaign source across reloads so its direct contact entry can be restored", () => {
    saveHandoff({
      issueText: "Der Entwurf der Kampagne bleibt erhalten.",
      source: "campaign",
      campaignSlug: "sichere-schulwege",
    });

    expect(peekHandoff()).toMatchObject({
      source: "campaign",
      campaignSlug: "sichere-schulwege",
    });
  });

  it("keeps an edited landing issue available when the contact step reloads", () => {
    saveHandoff({
      issueText: "Erster Entwurf.",
      source: "landing",
    });
    const existing = peekHandoff();
    saveHandoff({
      ...existing,
      issueText: "Überarbeiteter Entwurf mit konkreter Bitte.",
      source: "landing",
    });

    expect(peekHandoff()).toMatchObject({
      source: "landing",
      issueText: "Überarbeiteter Entwurf mit konkreter Bitte.",
    });
  });
});
