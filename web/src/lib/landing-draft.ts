// Landing-Entwurf: merkt sich pro Tab, was im Anliegen-Feld der Startseite
// (Hero, Step2Issue variant="landing") getippt wurde. So bleibt der Text
// erhalten, wenn jemand den Browser-"Zurück"-Button aus dem Wizard nutzt (oder
// die Landing aus anderem Grund neu mountet) statt auf ein leeres Feld zu
// stoßen.
//
// Bewusst sessionStorage (per Tab, beim Schließen weg), analog zum
// Datenschutz-Ansatz des Wizard-Handoffs (siehe wizard-handoff.ts). Jeder
// Zugriff ist in try/catch gekapselt, weil sessionStorage im Private-Mode oder
// bei Quota werfen kann — die Persistenz ist nur eine progressive Verbesserung.

const LANDING_DRAFT_KEY = "landing-issue-draft";

function draftKey(campaignSlug?: string): string {
  return campaignSlug ? `${LANDING_DRAFT_KEY}:campaign:${campaignSlug}` : LANDING_DRAFT_KEY;
}

export function readLandingDraft(campaignSlug?: string): string {
  try {
    return sessionStorage.getItem(draftKey(campaignSlug)) ?? "";
  } catch {
    return "";
  }
}

export function writeLandingDraft(text: string, campaignSlug?: string): void {
  try {
    sessionStorage.setItem(draftKey(campaignSlug), text);
  } catch {
    // sessionStorage nicht verfügbar -> Entwurf still verwerfen.
  }
}

export function clearLandingDraft(campaignSlug?: string): void {
  try {
    sessionStorage.removeItem(draftKey(campaignSlug));
    if (campaignSlug) sessionStorage.removeItem(`${draftKey(campaignSlug)}:selection`);
  } catch {
    // ignorieren
  }
}

export function readCampaignIssueSelection(slug: string, issueTexts: string[]): string {
  try {
    const raw = sessionStorage.getItem(`${draftKey(slug)}:selection`);
    if (!raw) return "";
    const saved = JSON.parse(raw);
    if (
      saved?.signature === JSON.stringify(issueTexts)
      && typeof saved.text === "string"
      && issueTexts.includes(saved.text)
    ) return saved.text;
  } catch {
    // Wie Entwürfe ist die Auswahl nur eine Verbesserung pro Browser-Tab.
  }
  return "";
}

export function writeCampaignIssueSelection(slug: string, issueTexts: string[], text: string): void {
  try {
    sessionStorage.setItem(`${draftKey(slug)}:selection`, JSON.stringify({
      signature: JSON.stringify(issueTexts),
      text,
    }));
  } catch {
    // Ohne Tab-Speicher bleibt die Auswahl im Komponenten-State erhalten.
  }
}
