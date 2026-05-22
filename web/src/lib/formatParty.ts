export function formatPartyShort(party: string | null | undefined): string {
  if (!party) return "";
  const normalized = party.trim().toLowerCase().replace(/\s+/g, " ");
  if (normalized.startsWith("bündnis 90") && normalized.includes("grünen")) {
    return "GRÜNE";
  }
  return party;
}
