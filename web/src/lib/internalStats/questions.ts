import {
  FACT_CHECK_FEEDBACK_TAGS,
  NEGATIVE_FEEDBACK_TAGS,
  POSITIVE_FEEDBACK_TAGS,
} from "@/lib/feedback/feedbackTags";

export type StatQuestionInfo = {
  /** Fragetext wortgleich, wie ihn Nutzer:innen sehen. */
  question: string;
  /** Zusatzzeile unter der Frage, falls die Frage eine hat. */
  hint?: string;
  /** Zweite Formulierung derselben Frage (z. B. bei wenigen Sternen). */
  alternativeQuestion?: { question: string; when: string };
  /** Wer die Frage zu sehen bekommt. */
  asked: string;
  /** Nur dort, wo das Diagramm nicht alle Antwortmöglichkeiten zeigt. */
  options?: readonly string[];
  optionGroups?: readonly { title: string; options: readonly string[] }[];
};

export type StatQuestionKey =
  | "rating"
  | "sendSignal"
  | "efficacy"
  | "letterHistory"
  | "priorContact"
  | "powerlessness"
  | "age"
  | "tags"
  | "briefweg"
  | "outcomeSent"
  | "outcomeNotSentReason"
  | "outcomeChannels"
  | "outcomeAddressed"
  | "outcomeFeeling"
  | "outcomeExpectation"
  | "outcomeEfficacy"
  | "outcomeWriteAgain";

const labels = (tags: readonly { label: string }[]) => tags.map((tag) => tag.label);

const tagGroups = [
  { title: "Bei 4 und 5 Sternen", options: labels(POSITIVE_FEEDBACK_TAGS) },
  { title: "Bei 1 bis 3 Sternen", options: labels(NEGATIVE_FEEDBACK_TAGS) },
  { title: "Bei jeder Bewertung (Faktencheck)", options: labels(FACT_CHECK_FEEDBACK_TAGS) },
] as const;

const OUTCOME_ASKED =
  "Alle, die die Rückmeldungs-Mail zu ihrem Brief bekommen und das Formular bis zum Ende ausgefüllt haben.";

export const STAT_QUESTIONS: Record<StatQuestionKey, StatQuestionInfo> = {
  rating: {
    question: "Wie findest du deinen Brief?",
    asked:
      "Alle, die ihren Brief bewertet haben, per Stern in der Mail oder im Formular.",
  },
  sendSignal: {
    question: "Hast du deinen Brief schon verschickt oder verschickst ihn gleich?",
    asked: "Alle, die das Feedback-Formular geöffnet haben. Pflichtfrage im Formular.",
  },
  efficacy: {
    question:
      "Fühlst du dich durch diesen Brief eher in der Lage, dich politisch einzubringen?",
    asked: "Nur wer bei der Versandfrage „Ja, geht raus“ angegeben hat.",
  },
  letterHistory: {
    question: "Hast du schon mal einen Brief an Politiker:innen geschrieben?",
    asked: "Alle im Feedback-Formular, freiwillig.",
  },
  priorContact: {
    question:
      "Hattest du davor schon mal anders Kontakt zu Politiker:innen, z. B. per Mail oder Anruf?",
    asked:
      "Nur wer angegeben hat, dass es der erste Brief ist oder bisher nur mit Brief-nach-Berlin, freiwillig.",
  },
  powerlessness: {
    question:
      "Wie oft kennst du das: Du liest, siehst oder hörst etwas Politisches, das dich beschäftigt, aber weißt nicht, was du konkret tun kannst?",
    asked: "Alle im Feedback-Formular, freiwillig.",
  },
  age: {
    question: "Wie alt bist du?",
    asked: "Alle im Feedback-Formular, freiwillig.",
  },
  tags: {
    question: "Was hat geklappt?",
    alternativeQuestion: { question: "Was war's?", when: "Bei 1 bis 3 Sternen" },
    asked:
      "Alle im Feedback-Formular, freiwillig, Mehrfachauswahl. Die Frage hängt an der Sternebewertung. Das Diagramm zeigt nur sechs der Markierungen.",
    options: tagGroups.flatMap((group) => group.options),
    optionGroups: tagGroups,
  },
  briefweg: {
    question: "Hat sich jemand auf deinen Brief gemeldet?",
    asked:
      "Alle, die die Rückmeldungs-Mail bekommen haben. Beantwortet wird per Klick in der Mail.",
    options: [
      "Ja, es kam etwas",
      "Nein, noch nichts",
      "Ich habe den Brief nicht abgeschickt",
    ],
  },
  outcomeSent: {
    question: "Hast du deinen Brief abgeschickt?",
    asked:
      "Alle im Rückmeldeformular, außer wer in der Mail „Ich habe den Brief nicht abgeschickt“ geklickt hat.",
  },
  outcomeNotSentReason: {
    question: "Was hat dich gebremst?",
    asked: "Nur wer den Brief nicht abgeschickt hat, im Rückmeldeformular.",
  },
  outcomeChannels: {
    question: "Kam eine Reaktion?",
    hint: "Du kannst mehrere Antworten auswählen.",
    asked: "Nur wer den Brief abgeschickt hat, im Rückmeldeformular.",
  },
  outcomeAddressed: {
    question: "Wurde auf dein Anliegen eingegangen?",
    asked: "Nur wer eine Reaktion angegeben hat, im Rückmeldeformular.",
  },
  outcomeFeeling: {
    question: "Wie war die Reaktion für dich?",
    asked: "Nur wer eine Reaktion angegeben hat, im Rückmeldeformular.",
  },
  outcomeExpectation: {
    question: "Was hast du dir vorher erwartet?",
    asked: OUTCOME_ASKED,
  },
  outcomeEfficacy: {
    question: "Wie fühlst du dich jetzt damit?",
    hint: "Hast du durch den Brief eher das Gefühl, dich politisch einbringen zu können?",
    asked: `${OUTCOME_ASKED} Ausgewertet werden nur die Antworten derer, die den Brief abgeschickt haben.`,
  },
  outcomeWriteAgain: {
    question: "Würdest du wieder einen Brief schreiben?",
    asked: OUTCOME_ASKED,
  },
};
