// Muss zur Server-Regel in resolveRecipient.ts passen: Kampagnen akzeptieren
// keine freie Auswahl außerhalb ihrer Zielliste. Eigene Datei, damit der
// Client keine PLZ-Daten mitlädt.
export function allowsAlternativeRecipients(campaignSlug?: string | null): boolean {
  return !campaignSlug;
}
