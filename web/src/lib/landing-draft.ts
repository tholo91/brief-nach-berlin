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

export function readLandingDraft(): string {
  try {
    return sessionStorage.getItem(LANDING_DRAFT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLandingDraft(text: string): void {
  try {
    sessionStorage.setItem(LANDING_DRAFT_KEY, text);
  } catch {
    // sessionStorage nicht verfügbar -> Entwurf still verwerfen.
  }
}

export function clearLandingDraft(): void {
  try {
    sessionStorage.removeItem(LANDING_DRAFT_KEY);
  } catch {
    // ignorieren
  }
}
