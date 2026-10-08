// Feste Kategorien für Client-Fehler beim /api/generate-letter-Fetch.
// Der "Fehler melden"-Report überträgt nur die Kategorie, nie den Fehlertext.
export const CLIENT_ERROR_KINDS = [
  "load_failed",
  "failed_to_fetch",
  "network_error",
  "no_letter_text",
  "invalid_json",
  "other",
] as const;

export type ClientErrorKind = (typeof CLIENT_ERROR_KINDS)[number];

export function classifyClientError(err: Error): ClientErrorKind {
  if (err.name === "SyntaxError") return "invalid_json";
  if (err.message === "No letterText") return "no_letter_text";
  if (/^Load failed/i.test(err.message)) return "load_failed";
  if (/^Failed to fetch/i.test(err.message)) return "failed_to_fetch";
  if (/^NetworkError/i.test(err.message)) return "network_error";
  return "other";
}
