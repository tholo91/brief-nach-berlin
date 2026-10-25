// Ablauf für Lehrkräfte: /schule zeigt ihn, die Druckfassung (/schule/ablauf) nutzt dieselben Daten.

export interface LessonRow {
  from: number;
  to: number;
  phase: string;
  what: string;
}

export const LESSON_45: readonly LessonRow[] = [
  {
    from: 0,
    to: 5,
    phase: "Einstieg",
    what: "Frage an die Klasse: „Wer darf bei der nächsten Bundestagswahl wählen?“ Dann: „Schreiben dürft ihr trotzdem, und Handgeschriebenes wird gelesen.“",
  },
  {
    from: 5,
    to: 12,
    phase: "Thema finden",
    what: "Think-Pair-Share: „Was nervt dich an Schule, Ort, Zukunft?“ Die Themen auf der Seite helfen beim Einstieg.",
  },
  {
    from: 12,
    to: 25,
    phase: "Entwurf erstellen",
    what: "QR-Code scannen, Anliegen aufschreiben, Ebene wählen, Entwurf anfordern. In zwei Wellen: erst Reihe 1 bis 3, dann der Rest.",
  },
  {
    from: 25,
    to: 40,
    phase: "Abschreiben",
    what: "Von Hand abschreiben, ein eigenes Erlebnis einfügen, einen Satz in eigenen Worten neu schreiben.",
  },
  {
    from: 40,
    to: 45,
    phase: "Abschluss",
    what: "Zwei oder drei lesen vor. Du sammelst ein, Briefe an dieselbe Person gehen zusammen in einem großen Umschlag raus.",
  },
];

export const LESSON_90_EXTRAS: readonly string[] = [
  "Sortierübung: Wer ist zuständig, Bund, Land oder Kommune? Bildung ist Ländersache, das Schulgebäude gehört meist der Stadt oder dem Landkreis.",
  "Das Profil der eigenen Abgeordneten auf abgeordnetenwatch.de ansehen.",
  "Peer-Feedback in Paaren mit der Checkliste vom Arbeitsblatt.",
  "Reinschrift und Umschläge adressieren.",
  "Im Brief die Abgeordneten in die Klasse einladen.",
  "Ausblick: Antworten später gemeinsam im Unterricht besprechen.",
];

export const PRECHECK_ITEMS: readonly string[] = [
  "Jede Schülerin und jeder Schüler braucht eine eigene E-Mail-Adresse, zum Beispiel die Schul-Mail. Eine gemeinsame Adresse für alle funktioniert nicht.",
  "Den Entwurf sehen alle direkt auf dem Gerät. Eine Kopie mit der Anschrift für den Umschlag kommt per Mail.",
  "Lass die Entwürfe in zwei Wellen erstellen, erst die Hälfte der Klasse, dann den Rest. Wenn alle gleichzeitig klicken, dauert es länger.",
  "Leg Papier, Umschläge und Briefmarken bereit.",
];

export const COLLECTIVE_ENVELOPE_NOTE =
  "Alle schreiben an dieselben Abgeordneten. Ein großer Umschlag mit allen Briefen an eine Person ist günstiger und fällt mehr auf, zum Beispiel mit einem kurzen Anschreiben: „23 Briefe der 9b“.";

export const WORKSHEET_CHECKLIST: readonly string[] = [
  "Anrede mit dem richtigen Namen",
  "Ein eigenes Erlebnis, das nur du erzählen kannst",
  "Eine konkrete Bitte: Was soll die Person tun?",
  "Die Bitte um eine Antwort",
  "Eine Einladung in unsere Klasse",
];

export interface TafelbildColumn {
  level: string;
  decides: string;
  examples: readonly string[];
}

export const TAFELBILD: readonly TafelbildColumn[] = [
  {
    level: "Bund",
    decides: "Bundestag und Bundesregierung",
    examples: ["Wehrdienst", "Bahn", "Bundesgesetze zum Klimaschutz"],
  },
  {
    level: "Land",
    decides: "Landtag und Landesregierung",
    examples: ["Schule und Lehrkräfte", "Lehrpläne", "Polizei"],
  },
  {
    level: "Kommune",
    decides: "Gemeinderat oder Stadtrat und Bürgermeister:in, Kreistag",
    examples: [
      "Schulgebäude und Ausstattung (Schulträger)",
      "Busse im Ort oder Landkreis",
      "Jugendzentren und Spielplätze",
    ],
  },
];

export const TAFELBILD_MERKSATZ =
  "Bildung ist Ländersache. Das Schulgebäude gehört meist der Stadt oder dem Landkreis.";

export function formatMinuteRange(row: Pick<LessonRow, "from" | "to">): string {
  return `${row.from}–${row.to}`;
}
