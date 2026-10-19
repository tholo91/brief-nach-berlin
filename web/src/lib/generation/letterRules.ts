export type RuleViolationKind = "nicht_nur_sondern" | "erfundenes_geschlecht";

export interface RuleViolation {
  kind: RuleViolationKind;
  sentence: string;
  word?: string;
}

const NICHT_NUR_SONDERN = /\bnicht\s+(?:nur|allein|bloß)(?=[\s,])[\s\S]*?\bsondern\b/i;

// "Als Bürgerin dieses Landes", "ich bin Rentnerin", "als Mutter": eine
// Selbstbezeichnung mit Geschlecht, die nicht aus dem Transkript stammt.
const GENDERED_SELF = /(?:^|[\s,(])(?:[Aa]ls|bin)\s+(?:\p{Ll}+\s+){0,2}(\p{Lu}\p{Ll}*[^aeiouäöü\s]in|Mutter|Vater)(?!\p{L})/gu;
const NOT_A_PERSON = new Set([
  "Termin", "Medizin", "Disziplin", "Benzin", "Vitamin", "Magazin", "Kamin", "Berlin",
  "Insulin", "Nikotin", "Delfin", "Jasmin", "Rosmarin", "Zeppelin", "Mandarin", "Bulletin",
]);
// Ämter der Empfängerin ("Sie als Ministerpräsidentin") sind keine Selbstbezeichnung.
const RECIPIENT_ROLE = /(?:minister|präsident|bürgermeister|senator|kanzler|landrät|staatssekretär|politiker|vertreter)in$/i;

export function replaceDashes(text: string): string {
  return text
    .replace(/(\d)[–—](\d)/g, "$1-$2")
    .replace(/(\p{L})–(\p{L})/gu, "$1-$2")
    .replace(/[ \t]*[–—][ \t]*(?=[,;:.!?])/g, "")
    .replace(/([,;:])[ \t]*[–—][ \t]*/g, "$1 ")
    .replace(/(?<=\S)[ \t]*[–—][ \t]*(?=\S)/g, ", ");
}

export function findRuleViolations(letter: string, sourceText: string): RuleViolation[] {
  const source = sourceText.toLowerCase();
  const violations: RuleViolation[] = [];
  for (const raw of letter.split(/(?<=[.!?])\s+/)) {
    const sentence = raw.trim();
    if (NICHT_NUR_SONDERN.test(sentence)) {
      violations.push({ kind: "nicht_nur_sondern", sentence });
    }
    for (const match of sentence.matchAll(GENDERED_SELF)) {
      const word = match[1];
      if (NOT_A_PERSON.has(word) || RECIPIENT_ROLE.test(word) || source.includes(word.toLowerCase())) continue;
      violations.push({ kind: "erfundenes_geschlecht", sentence, word });
    }
  }
  return violations;
}

export function ruleRetryDirective(violations: RuleViolation[], alsoRewriting: boolean): string {
  if (violations.length === 0) return "";
  const header = alsoRewriting
    ? "Ändere dabei außerdem diese Stellen:"
    : "Überarbeite den Brief nur an diesen Stellen. Inhalt, Ton, Anrede, Grußformel und Länge bleiben gleich.";
  const lines = violations.map((v) =>
    v.kind === "nicht_nur_sondern"
      ? `- Schreibe diesen Satz als zwei eigenständige Sätze: "${v.sentence}"`
      : `- Lass die Selbstbezeichnung "${v.word}" weg und schreibe neutral in Ich-Form: "${v.sentence}"`
  );
  return [header, ...lines].join("\n");
}
