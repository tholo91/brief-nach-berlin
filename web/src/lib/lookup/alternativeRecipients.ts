// Muss zur Server-Regel in resolveRecipient.ts passen: Kampagnen akzeptieren
// freie Auswahl nur, wenn im Wahlkreis niemand zugeordnet ist. Eigene Datei,
// damit der Client keine PLZ-Daten mitlädt.
export function allowsAlternativeRecipients(
  campaignSlug: string | null | undefined,
  localRecipientCount: number
): boolean {
  return !campaignSlug || localRecipientCount === 0;
}
