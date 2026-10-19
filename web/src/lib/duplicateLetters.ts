// Brevo-Versandlog 05.-12.10.2026: ca. 3 bis 5 % der Brief-Mails gehen kurz
// nacheinander an dieselbe Adresse, weil derselbe Brief zweimal erzeugt wurde.
// Siehe .planning/todos/pending/2026-10-11-doppelte-briefmails-dedup.md
const DUPLICATE_LETTER_SHARE = 0.04;

export function estimateLettersWithoutDuplicates(count: number): number {
  return Math.round(count * (1 - DUPLICATE_LETTER_SHARE));
}

export const DUPLICATE_LETTER_SHARE_NOTE =
  "Etwa 3 bis 5 % der Briefe entstehen doppelt, meist wenn jemand die Seite neu lädt und noch einmal abschickt.";

export const DUPLICATE_LETTER_NOTE = `${DUPLICATE_LETTER_SHARE_NOTE} „Ohne Doppelte“ zieht dafür pauschal 4 % ab.`;
