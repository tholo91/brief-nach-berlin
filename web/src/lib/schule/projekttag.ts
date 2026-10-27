import { LESSON_45 } from "@/lib/schule/lessonPlan";

export interface DayStep {
  title: string;
  duration: string;
  what: string;
}

const LESSON_MINUTES = LESSON_45[LESSON_45.length - 1].to;

export const PROJEKTTAG_STEPS: readonly DayStep[] = [
  {
    title: "Vorbereitung",
    duration: "vorher, ca. 10 Minuten pro Klasse",
    what: "Jede Klasse bekommt auf der Schule-Seite einen eigenen Klassenlink mit QR-Code und der Postleitzahl eurer Schule. Der Link gilt 14 Tage, also erstelle ihn ein paar Tage vor dem Projekttag. Papier, Umschläge und Briefmarken legst du bereit.",
  },
  {
    title: "Auftakt in der Schulversammlung",
    duration: "10 Minuten",
    what: "Eine Person fragt in die Halle: „Wer darf bei der nächsten Bundestagswahl wählen?“ Hände hoch, meist sind es wenige. Dann der Satz: „Schreiben dürft ihr alle.“ Mehr braucht es nicht, danach gehen die Klassen los.",
  },
  {
    title: "Schreiben in den Klassen",
    duration: `${LESSON_MINUTES} Minuten pro Klasse, versetzt`,
    what: `Jede Klasse folgt dem Ablauf von ${LESSON_MINUTES} Minuten aus dem Unterrichtsplan. Die Klassen starten die Phase „Entwurf erstellen“ im Abstand von etwa 15 Minuten, nicht alle gleichzeitig. Beispiel: 9a um 9:00 Uhr, 9b um 9:15 Uhr, 9c um 9:30 Uhr.`,
  },
  {
    title: "Ein Sammelumschlag pro Empfänger:in",
    duration: "am Ende der Stunde",
    what: "Du sammelst die Briefe ein und sortierst sie nach Adressat:in. Alle Briefe an dieselbe Person kommen zusammen in einen großen Umschlag, mit Anschreiben wie „23 Briefe der 9b“. Das ist günstiger als einzelne Marken und fällt auf dem Schreibtisch auf.",
  },
  {
    title: "Ausstellung und Antworten",
    duration: "in den Wochen danach",
    what: "Hängt Kopien der Briefe an eine Wand im Foyer (nur mit Einverständnis der Schüler:innen). Antworten kommen später dazu. Lade die Abgeordneten ein, in die Schule zu kommen und die Antworten selbst zu besprechen.",
  },
];
