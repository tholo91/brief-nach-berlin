// Landing -> Wizard handoff via sessionStorage.
//
// When a visitor types their issue on the landing page and clicks "Weiter",
// we hand the text to /app so the wizard's step 1 opens pre-filled with what
// they already wrote (they pick the tone there). We also carry whether they
// opened the tips disclosure on the landing, so it surfaces in the debug
// payload. We use sessionStorage instead of a ?text= URL param so the issue
// text never lands in the address bar (privacy). The entry is short-lived:
// WizardShell clears it right after reading, so a manual reload of /app
// restarts cleanly.

const HANDOFF_KEY = "wizard-handoff";

export interface WizardHandoff {
  issueText: string;
  toneLevel?: number;
  tipsOpened?: boolean;
  source?: "landing" | "campaign";
  campaignSlug?: string;
  // Ob auf der Landing eine Sprachnachricht genutzt wurde. Muss mitwandern,
  // sonst startet der Wizard mit einem frischen "false" und der Debug-Payload
  // meldet faelschlich Voice=false, obwohl auf der Landing gesprochen wurde.
  usedSpeechToText?: boolean;
}

export function saveHandoff(data: WizardHandoff): void {
  try {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage can throw (private mode, quota). The handoff is a
    // progressive enhancement -- if it fails, the wizard simply starts on
    // step 1 with an empty field, which is fine.
  }
}

// Read the handoff without removing it. Safe to call repeatedly (e.g. during
// a React render or Strict Mode double-invoke) because it has no side effects.
export function peekHandoff(): WizardHandoff | null {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as WizardHandoff).issueText === "string"
    ) {
      const { issueText, toneLevel, tipsOpened, source, campaignSlug, usedSpeechToText } =
        parsed as WizardHandoff;
      return {
        issueText,
        toneLevel: typeof toneLevel === "number" ? toneLevel : undefined,
        tipsOpened: typeof tipsOpened === "boolean" ? tipsOpened : undefined,
        source: source === "campaign" ? "campaign" : "landing",
        campaignSlug: typeof campaignSlug === "string" ? campaignSlug : undefined,
        usedSpeechToText:
          typeof usedSpeechToText === "boolean" ? usedSpeechToText : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearHandoff(): void {
  try {
    sessionStorage.removeItem(HANDOFF_KEY);
  } catch {
    // ignore
  }
}
