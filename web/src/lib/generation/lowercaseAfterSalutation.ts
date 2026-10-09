const LOWERCASE_START_WORDS = [
  "Ich", "Wir", "Es", "Mein", "Meine", "Meinen", "Meinem", "Meiner",
  "Unser", "Unsere", "Unseren", "Unserem", "Dies", "Diese", "Dieser", "Dieses",
  "Das", "Der", "Die", "Den", "Dem", "Ein", "Eine", "Einen", "Einem", "Einer", "Man",
  "Mit", "Seit", "Als", "In", "Im", "Vor", "Nach", "Da", "Bei", "Beim", "Über",
  "Wie", "Nun", "Heute", "Hiermit", "Gerne", "Gern", "Schon", "Bereits", "Leider",
  "Zunächst", "Zuerst", "Seitdem", "Wenn", "Weil", "Obwohl", "Auch", "Am", "An",
  "Auf", "Aus", "Durch", "Für", "Gegen", "Um", "Zu", "Zum", "Zur", "Täglich",
  "Immer", "Jeden", "Jede", "Jeder", "Jedes", "Vielen", "Erst", "Kürzlich",
  "Gestern", "Vergangene", "Letzte", "Letzten", "Letztes", "Was", "Warum",
  "Mehrere", "Viele", "Alle",
];

const SALUTATION_LINE = /^[ \t]*(?:Sehr geehrte|Guten Tag|Liebe)[^\r\n]*,[ \t]*$/m;

export function lowercaseAfterSalutation(text: string): string {
  const salutation = SALUTATION_LINE.exec(text);
  if (!salutation) return text;
  const bodyStart = salutation.index + salutation[0].length;
  const firstWord = /\S+/.exec(text.slice(bodyStart));
  if (!firstWord) return text;
  const word = /^[\p{L}]+/u.exec(firstWord[0])?.[0];
  if (!word || !LOWERCASE_START_WORDS.includes(word)) return text;
  const index = bodyStart + firstWord.index;
  return `${text.slice(0, index)}${word.charAt(0).toLowerCase()}${text.slice(index + 1)}`;
}
