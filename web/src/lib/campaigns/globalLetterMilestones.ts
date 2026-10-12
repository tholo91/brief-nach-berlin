export const GLOBAL_LETTER_MILESTONE_INTERVAL = 1000;

export function isGlobalLetterMilestone(letterNumber: number): boolean {
  return (
    Number.isSafeInteger(letterNumber) &&
    letterNumber > 0 &&
    letterNumber % GLOBAL_LETTER_MILESTONE_INTERVAL === 0
  );
}
