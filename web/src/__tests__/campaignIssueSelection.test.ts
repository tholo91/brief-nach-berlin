import {
  clearLandingDraft,
  readCampaignIssueSelection,
  readLandingDraft,
  writeCampaignIssueSelection,
  writeLandingDraft,
} from "@/lib/landing-draft";

class SessionStorageMock {
  private values = new Map<string, string>();
  blocked = false;

  getItem(key: string) {
    if (this.blocked) throw new Error("storage blocked");
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    if (this.blocked) throw new Error("storage blocked");
    this.values.set(key, value);
  }

  removeItem(key: string) {
    if (this.blocked) throw new Error("storage blocked");
    this.values.delete(key);
  }
}

describe("campaign issue selection storage", () => {
  let storage: SessionStorageMock;

  beforeEach(() => {
    storage = new SessionStorageMock();
    Object.defineProperty(global, "sessionStorage", {
      value: storage,
      configurable: true,
    });
  });

  it("restores a public template selection when its issue pool matches", () => {
    const texts = ["Hauptanliegen", "Alternative"];
    writeCampaignIssueSelection("eeg-so-nicht", texts, "Alternative");
    expect(readCampaignIssueSelection("eeg-so-nicht", texts)).toBe("Alternative");
  });

  it("ignores a saved selection after the main text changes", () => {
    writeCampaignIssueSelection("eeg-so-nicht", ["Haupttext", "Alternative"], "Alternative");
    expect(readCampaignIssueSelection("eeg-so-nicht", ["Neuer Haupttext", "Alternative"])).toBe("");
  });

  it("ignores a saved selection after the alternatives change", () => {
    writeCampaignIssueSelection("eeg-so-nicht", ["Haupttext", "Alte Alternative"], "Alte Alternative");
    expect(readCampaignIssueSelection("eeg-so-nicht", ["Haupttext", "Neue Alternative"])).toBe("");
  });

  it("falls back on invalid JSON or a selection outside the current pool", () => {
    sessionStorage.setItem("landing-issue-draft:campaign:eeg-so-nicht:selection", "{");
    expect(readCampaignIssueSelection("eeg-so-nicht", ["Haupttext", "Alternative"])).toBe("");

    sessionStorage.setItem("landing-issue-draft:campaign:eeg-so-nicht:selection", JSON.stringify({
      signature: JSON.stringify(["Haupttext", "Alternative"]),
      text: "Unbekannter Text",
    }));
    expect(readCampaignIssueSelection("eeg-so-nicht", ["Haupttext", "Alternative"])).toBe("");
  });

  it("stores template selection separately from the user's personal draft", () => {
    writeLandingDraft("Mein eigenes Anliegen", "eeg-so-nicht");
    writeCampaignIssueSelection("eeg-so-nicht", ["Haupttext", "Alternative"], "Alternative");

    expect(readLandingDraft("eeg-so-nicht")).toBe("Mein eigenes Anliegen");
    expect(readCampaignIssueSelection("eeg-so-nicht", ["Haupttext", "Alternative"])).toBe("Alternative");
  });

  it("does not throw when sessionStorage reads and writes are blocked", () => {
    storage.blocked = true;
    expect(() => writeCampaignIssueSelection("eeg-so-nicht", ["Haupttext"], "Haupttext")).not.toThrow();
    expect(() => readCampaignIssueSelection("eeg-so-nicht", ["Haupttext"])).not.toThrow();
    expect(readCampaignIssueSelection("eeg-so-nicht", ["Haupttext"])).toBe("");
  });

  it("clears the selection with a consumed draft so a new letter can draw again", () => {
    const texts = ["Haupttext", "Alternative"];
    writeLandingDraft("Mein eigenes Anliegen", "eeg-so-nicht");
    writeCampaignIssueSelection("eeg-so-nicht", texts, "Alternative");

    clearLandingDraft("eeg-so-nicht");

    expect(readLandingDraft("eeg-so-nicht")).toBe("");
    expect(readCampaignIssueSelection("eeg-so-nicht", texts)).toBe("");
  });
});
