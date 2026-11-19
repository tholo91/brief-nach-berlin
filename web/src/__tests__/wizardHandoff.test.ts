import {
  clearHandoff,
  entryStepForHandoff,
  peekHandoff,
  saveHandoff,
  schoolFieldsFromStoredLink,
  skipsContactStep,
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

  it("skips the PLZ and contact step for a PDF class link (A3)", () => {
    const pdf = {
      issueText: "Die Toiletten sind kaputt.",
      source: "landing" as const,
      audience: "jung" as const,
      klasse: 7,
      classToken: "tok",
      classDelivery: "pdf" as const,
      plz: "28195",
    };
    expect(entryStepForHandoff(pdf)).toBe("2b");
    expect(skipsContactStep(pdf)).toBe(true);
  });

  it("keeps the contact step for mail class links and every other handoff (A3)", () => {
    const mail = {
      issueText: "Die Toiletten sind kaputt.",
      source: "landing" as const,
      audience: "jung" as const,
      klasse: 7,
      classToken: "tok",
      plz: "28195",
    };
    expect(entryStepForHandoff(mail)).toBe(2);
    expect(entryStepForHandoff({ ...mail, classDelivery: "pdf", plz: undefined })).toBe(2);
    expect(entryStepForHandoff({ ...mail, classDelivery: "pdf", classToken: undefined })).toBe(2);
    expect(entryStepForHandoff({ ...mail, classDelivery: "pdf", source: "campaign" })).toBe(2);
    expect(entryStepForHandoff({ issueText: "Landing", source: "landing" })).toBe(2);
  });

  it("round-trips the PDF class link fields so the skip survives a reload", () => {
    saveHandoff({
      issueText: "Die Toiletten sind kaputt.",
      source: "landing",
      audience: "jung",
      klasse: 7,
      classToken: "tok",
      classDelivery: "pdf",
      plz: "28195",
    });
    expect(entryStepForHandoff(peekHandoff())).toBe("2b");
  });

  it("restores school mode from the stored class link when the handoff is gone (A1)", () => {
    const link = { token: "tok", klasse: 7, plz: "28195", delivery: "pdf" as const };
    expect(schoolFieldsFromStoredLink(null, link)).toEqual({
      audience: "jung",
      klasse: 7,
      classToken: "tok",
      plz: "28195",
      classDelivery: "pdf",
    });
    expect(schoolFieldsFromStoredLink(null, { ...link, delivery: "email" })).not.toHaveProperty("classDelivery");
    expect(schoolFieldsFromStoredLink(null, null)).toBeNull();
    // Jugend-Handoff ohne Token (Klasse im Formular gewählt): der Link gewinnt.
    expect(
      schoolFieldsFromStoredLink({ issueText: "x", source: "landing", audience: "jung", klasse: 9 }, link),
    ).toMatchObject({ klasse: 7, classToken: "tok" });
  });

  it("never turns an adult, campaign or already tokened handoff into school mode (A1)", () => {
    const link = { token: "tok", klasse: 7, plz: "28195", delivery: "pdf" as const };
    expect(schoolFieldsFromStoredLink({ issueText: "x", source: "landing" }, link)).toBeNull();
    expect(
      schoolFieldsFromStoredLink({ issueText: "x", source: "campaign", campaignSlug: "a", audience: "jung" }, link),
    ).toBeNull();
    expect(
      schoolFieldsFromStoredLink(
        { issueText: "x", source: "landing", audience: "jung", klasse: 9, classToken: "other" },
        link,
      ),
    ).toBeNull();
  });

  it("carries the unchanged-text flag and at most three trimmed hooks for campaigns", () => {
    saveHandoff({
      issueText: "Der Nahverkehr auf dem Land muss ausgebaut werden.",
      source: "campaign",
      campaignSlug: "nahverkehr",
      campaignTextUnchanged: true,
      campaignPersonalHooks: [" Meine Kinder sind direkt betroffen: ", "", "Ich pendle täglich:", "Eins", "Vier"],
    });

    expect(peekHandoff()).toMatchObject({
      campaignTextUnchanged: true,
      campaignPersonalHooks: ["Meine Kinder sind direkt betroffen:", "Ich pendle täglich:", "Eins"],
    });
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

  it("keeps valid youth fields", () => {
    saveHandoff({
      issueText: "Unser Schulbus kommt zu selten.",
      audience: "jung",
      klasse: 9,
      classToken: "tok.en",
      plz: "28195",
    });

    expect(peekHandoff()).toMatchObject({
      audience: "jung",
      klasse: 9,
      classToken: "tok.en",
      plz: "28195",
    });
  });

  it("keeps classDelivery pdf and drops any other value", () => {
    saveHandoff({ issueText: "Unser Schulbus kommt zu selten.", audience: "jung", klasse: 9, classDelivery: "pdf" });
    expect(peekHandoff()?.classDelivery).toBe("pdf");
    sessionStorage.setItem(
      "wizard-handoff",
      JSON.stringify({ issueText: "Unser Schulbus kommt zu selten.", classDelivery: "email", savedAt: Date.now() }),
    );
    expect(peekHandoff()?.classDelivery).toBeUndefined();
  });

  it("drops invalid youth fields but keeps the rest of the handoff", () => {
    sessionStorage.setItem(
      "wizard-handoff",
      JSON.stringify({
        issueText: "Unser Schulbus kommt zu selten.",
        audience: "erwachsen",
        klasse: 4,
        classToken: "x".repeat(513),
        plz: "2819",
        savedAt: Date.now(),
      })
    );

    const handoff = peekHandoff();
    expect(handoff?.issueText).toBe("Unser Schulbus kommt zu selten.");
    expect(handoff?.audience).toBeUndefined();
    expect(handoff?.klasse).toBeUndefined();
    expect(handoff?.classToken).toBeUndefined();
    expect(handoff?.plz).toBeUndefined();
  });

  it("rejects non-numeric klasse and non-string token or plz", () => {
    sessionStorage.setItem(
      "wizard-handoff",
      JSON.stringify({
        issueText: "Unser Schulbus kommt zu selten.",
        audience: "jung",
        klasse: "8",
        classToken: 12,
        plz: 28195,
        savedAt: Date.now(),
      })
    );

    expect(peekHandoff()).toMatchObject({ audience: "jung", klasse: undefined, classToken: undefined, plz: undefined });
  });
});
