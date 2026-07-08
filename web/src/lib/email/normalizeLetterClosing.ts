const CLOSING_PATTERN =
  /^\s*((?:Mit\s+(?:freundlichen|freundlichem|besten|herzlichen|solidarischen|kollegialen|respektvollen)\s+(?:Grüßen|Gruessen|Grüße|Gruesse|Gruß|Gruss)|(?:Freundliche|Viele|Beste|Herzliche|Liebe|Solidarische|Kollegiale|Respektvolle)\s+(?:Grüße|Gruesse)))\s*,\s*$/gim;

export function normalizeLetterClosing(text: string): string {
  return text.replace(CLOSING_PATTERN, "$1");
}
