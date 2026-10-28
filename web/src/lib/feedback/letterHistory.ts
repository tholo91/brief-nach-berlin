export const LETTER_HISTORY_VALUES = ["first", "bnb_only", "before"] as const;

export type LetterHistory = (typeof LETTER_HISTORY_VALUES)[number];

export const LETTER_HISTORY_LABELS: Record<LetterHistory, string> = {
  first: "Nein, das ist mein erster",
  bnb_only: "Ja, aber nur mit Brief-nach-Berlin",
  before: "Ja, auch schon vorher",
};

// The follow-up question (other contact before) only makes sense for people
// who had not written a letter to politicians before Brief-nach-Berlin.
export function needsPriorContactQuestion(
  value: LetterHistory | null,
): boolean {
  return value === "first" || value === "bnb_only";
}

export function validateLetterHistoryAnswers({
  letterHistory,
  priorOtherContact,
}: {
  letterHistory: LetterHistory | null;
  priorOtherContact: boolean | null;
}): string | null {
  if (priorOtherContact !== null && !needsPriorContactQuestion(letterHistory)) {
    return "Ungültige Antwort zu früheren Briefen an Politiker:innen.";
  }
  return null;
}
