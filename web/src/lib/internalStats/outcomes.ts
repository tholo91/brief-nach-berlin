import type { OutcomeRound } from "@/lib/rueckmeldung/cohort";
import {
  POLITICAL_SELF_EFFICACY_VALUES,
  type PoliticalSelfEfficacy,
} from "@/lib/feedback/politicalActivation";
import {
  EXPECTATION_VALUES,
  LETTER_SENT_VALUES,
  NOT_SENT_REASON_VALUES,
  OUTCOME_ENTRY_CHOICES,
  REPLY_ADDRESSED_VALUES,
  REPLY_CHANNEL_VALUES,
  WRITE_AGAIN_VALUES,
} from "@/lib/rueckmeldung/schema";
import type { InternalReviewRow } from "./aggregate";

type LetterSent = (typeof LETTER_SENT_VALUES)[number];
type NotSentReason = (typeof NOT_SENT_REASON_VALUES)[number];
type ReplyChannel = (typeof REPLY_CHANNEL_VALUES)[number];
type ReplyAddressed = (typeof REPLY_ADDRESSED_VALUES)[number];
type Expectation = (typeof EXPECTATION_VALUES)[number];
type WriteAgain = (typeof WRITE_AGAIN_VALUES)[number];

/** Spalten aus letter_outcomes. Die E-Mail-Adresse wird bewusst nie gelesen. */
export type InternalOutcomeRow = {
  cohort: string | null;
  created_at: string | null;
  completed: boolean | null;
  completed_at: string | null;
  entry_choice: string | null;
  letter_sent: string | null;
  not_sent_reason: string | null;
  reply_channels: string[] | null;
  reply_addressed: string | null;
  expectation: string | null;
  political_self_efficacy: string | null;
  write_again: string | null;
  body: string | null;
  consent: boolean | null;
  display_name: string | null;
  call_ok: boolean | null;
};

export const OUTCOME_ROW_COLUMNS = [
  "cohort",
  "created_at",
  "completed",
  "completed_at",
  "entry_choice",
  "letter_sent",
  "not_sent_reason",
  "reply_channels",
  "reply_addressed",
  "expectation",
  "political_self_efficacy",
  "write_again",
  "body",
  "consent",
  "display_name",
  "call_ok",
] as const;

export const OUTCOME_LABELS: {
  letterSent: Record<LetterSent, string>;
  notSentReason: Record<NotSentReason, string>;
  replyChannel: Record<ReplyChannel, string>;
  replyAddressed: Record<ReplyAddressed, string>;
  expectation: Record<Expectation, string>;
  writeAgain: Record<WriteAgain, string>;
} = {
  letterSent: {
    handwritten: "Von Hand geschrieben",
    typed: "Getippt oder ausgedruckt",
    not_sent: "Nein",
  },
  notSentReason: {
    no_time: "Keine Zeit",
    postage_or_address: "Briefmarke oder Adresse",
    doubt: "Zweifel, ob es was bringt",
    forgot: "Vergessen",
    other: "Anderes",
  },
  replyChannel: {
    letter: "Brief",
    email: "E-Mail",
    phone: "Anruf",
    callback: "Bitte um Rückruf",
    meeting: "Termin oder Einladung",
    acknowledgement: "Nur Eingangsbestätigung",
    none: "Noch nichts",
  },
  replyAddressed: {
    concrete: "Ja, konkret",
    partly: "Teilweise",
    generic: "Eher allgemein",
  },
  expectation: {
    answer: "Eine Antwort",
    read: "Dass es gelesen wird",
    said_it: "Es einmal gesagt zu haben",
    nothing_specific: "Nichts Bestimmtes",
  },
  writeAgain: {
    already_did: "Hab ich schon",
    yes: "Ja, gern",
    maybe: "Vielleicht",
    rather_not: "Eher nicht",
  },
};

export type OutcomeFreeText = {
  text: string;
  consent: boolean;
  displayName: string | null;
  day: string | null;
};

export type OutcomeRoundStats = {
  cohort: string;
  label: string;
  sentAt: string;
  sentCount: number;
  deliveredCount: number;
  letterWindowLabel: string;
  respondentCount: number;
  completedCount: number;
  path: {
    delivered: number;
    responded: number;
    sent: number;
    sentHandwritten: number;
    sentTyped: number;
    sentMethodUnknown: number;
    notSent: number;
    replied: number;
    concrete: number;
    addressedBase: number;
  };
  returnDayCounts: Record<string, number>;
  replyRateByMethod: {
    handwritten: { sent: number; replied: number };
    typed: { sent: number; replied: number };
  };
  channelCounts: Record<ReplyChannel, number>;
  channelBase: number;
  addressedCounts: Record<ReplyAddressed, number>;
  addressedBase: number;
  notSentReasonCounts: Record<NotSentReason, number>;
  notSentReasonBase: number;
  expectationVsResult: Record<Expectation, { total: number; replied: number }>;
  expectationBase: number;
  writeAgainCounts: Record<WriteAgain, number>;
  writeAgainBase: number;
  selfEfficacy: {
    outcomes: Record<PoliticalSelfEfficacy, number>;
    outcomesBase: number;
    reviews: Record<PoliticalSelfEfficacy, number>;
    reviewsBase: number;
    reviewsSince: string | null;
  };
  freeTexts: OutcomeFreeText[];
  callOkCount: number;
};

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

function isOneOf<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}

function zeroRecord<T extends string>(values: readonly T[]): Record<T, number> {
  return Object.fromEntries(values.map((value) => [value, 0])) as Record<T, number>;
}

function emptyExpectationVsResult(): Record<
  Expectation,
  { total: number; replied: number }
> {
  return Object.fromEntries(
    EXPECTATION_VALUES.map((value) => [value, { total: 0, replied: 0 }]),
  ) as Record<Expectation, { total: number; replied: number }>;
}

function emptyOutcomeRoundStats(
  round: OutcomeRound,
  returnDayCounts: Record<string, number>,
): OutcomeRoundStats {
  return {
    cohort: round.cohort,
    label: round.label,
    sentAt: round.sentAt,
    sentCount: round.sentCount,
    deliveredCount: round.deliveredCount,
    letterWindowLabel: round.letterWindowLabel,
    respondentCount: 0,
    completedCount: 0,
    path: {
      delivered: round.deliveredCount,
      responded: 0,
      sent: 0,
      sentHandwritten: 0,
      sentTyped: 0,
      sentMethodUnknown: 0,
      notSent: 0,
      replied: 0,
      concrete: 0,
      addressedBase: 0,
    },
    returnDayCounts,
    replyRateByMethod: {
      handwritten: { sent: 0, replied: 0 },
      typed: { sent: 0, replied: 0 },
    },
    channelCounts: zeroRecord(REPLY_CHANNEL_VALUES),
    channelBase: 0,
    addressedCounts: zeroRecord(REPLY_ADDRESSED_VALUES),
    addressedBase: 0,
    notSentReasonCounts: zeroRecord(NOT_SENT_REASON_VALUES),
    notSentReasonBase: 0,
    expectationVsResult: emptyExpectationVsResult(),
    expectationBase: 0,
    writeAgainCounts: zeroRecord(WRITE_AGAIN_VALUES),
    writeAgainBase: 0,
    selfEfficacy: {
      outcomes: zeroRecord(POLITICAL_SELF_EFFICACY_VALUES),
      outcomesBase: 0,
      reviews: zeroRecord(POLITICAL_SELF_EFFICACY_VALUES),
      reviewsBase: 0,
      reviewsSince: null,
    },
    freeTexts: [],
    callOkCount: 0,
  };
}

function zeroFilledDays(fromIso: string, toIso: string): Record<string, number> {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  const result: Record<string, number> = {};
  if (!Number.isFinite(from) || !Number.isFinite(to)) return result;
  const start = Math.floor(from / DAY_MS) * DAY_MS;
  const end = Math.floor(to / DAY_MS) * DAY_MS;
  for (let time = start; time <= end; time += DAY_MS) {
    result[new Date(time).toISOString().slice(0, 10)] = 0;
  }
  return result;
}

function validChannels(row: InternalOutcomeRow): ReplyChannel[] {
  const channels = (row.reply_channels ?? []).filter((value): value is ReplyChannel =>
    isOneOf(REPLY_CHANNEL_VALUES, value),
  );
  return [...new Set(channels)];
}

function trimmedOrNull(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function timeOf(row: InternalOutcomeRow): number {
  const parsed = Date.parse(row.completed_at ?? row.created_at ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Zählt die Rückmeldungen einer Runde. Der Klick in der Mail entscheidet die
 * Hauptfrage, ein fertiges Formular geht vor. Alle Details kommen nur aus
 * fertigen Formularen. Outcomes und Reviews werden nie über Personen verknüpft.
 */
export function aggregateOutcomes(
  rows: InternalOutcomeRow[],
  reviewRows: InternalReviewRow[],
  round: OutcomeRound,
  fetchedAt: string,
): OutcomeRoundStats {
  const stats = emptyOutcomeRoundStats(
    round,
    zeroFilledDays(round.sentAt, fetchedAt),
  );
  const completedRows: InternalOutcomeRow[] = [];

  for (const row of rows) {
    if (row.cohort !== round.cohort) continue;
    const completed = row.completed === true;
    const formSent = completed && isOneOf(LETTER_SENT_VALUES, row.letter_sent);
    const click = isOneOf(OUTCOME_ENTRY_CHOICES, row.entry_choice)
      ? row.entry_choice
      : null;
    if (!formSent && !click) continue;

    stats.respondentCount += 1;
    const day = row.created_at?.slice(0, 10);
    if (day && DAY_KEY_PATTERN.test(day)) {
      stats.returnDayCounts[day] = (stats.returnDayCounts[day] ?? 0) + 1;
    }
    if (completed) {
      completedRows.push(row);
      stats.completedCount += 1;
    }

    const state = effectiveState(row, formSent, click);
    if (state.notSent) stats.path.notSent += 1;
    if (state.sent) stats.path.sent += 1;
    if (state.replied) stats.path.replied += 1;
    if (state.method === "handwritten") stats.path.sentHandwritten += 1;
    if (state.method === "typed") stats.path.sentTyped += 1;
  }
  stats.path.responded = stats.respondentCount;
  stats.path.sentMethodUnknown =
    stats.path.sent - stats.path.sentHandwritten - stats.path.sentTyped;

  for (const row of completedRows) {
    const formSent = isOneOf(LETTER_SENT_VALUES, row.letter_sent);
    const click = isOneOf(OUTCOME_ENTRY_CHOICES, row.entry_choice)
      ? row.entry_choice
      : null;
    const state = effectiveState(row, formSent, click);

    if (row.letter_sent === "handwritten" || row.letter_sent === "typed") {
      const bucket = stats.replyRateByMethod[row.letter_sent];
      bucket.sent += 1;
      if (state.replied) bucket.replied += 1;

      const channels = validChannels(row);
      if (channels.length > 0) {
        stats.channelBase += 1;
        for (const channel of channels) stats.channelCounts[channel] += 1;
      }
      if (isOneOf(REPLY_ADDRESSED_VALUES, row.reply_addressed)) {
        stats.addressedBase += 1;
        stats.addressedCounts[row.reply_addressed] += 1;
      }
    }

    if (row.letter_sent === "not_sent" && isOneOf(NOT_SENT_REASON_VALUES, row.not_sent_reason)) {
      stats.notSentReasonBase += 1;
      stats.notSentReasonCounts[row.not_sent_reason] += 1;
    }

    if (isOneOf(EXPECTATION_VALUES, row.expectation)) {
      stats.expectationBase += 1;
      const entry = stats.expectationVsResult[row.expectation];
      entry.total += 1;
      if (state.replied) entry.replied += 1;
    }

    if (isOneOf(WRITE_AGAIN_VALUES, row.write_again)) {
      stats.writeAgainBase += 1;
      stats.writeAgainCounts[row.write_again] += 1;
    }

    if (isOneOf(POLITICAL_SELF_EFFICACY_VALUES, row.political_self_efficacy)) {
      stats.selfEfficacy.outcomesBase += 1;
      stats.selfEfficacy.outcomes[row.political_self_efficacy] += 1;
    }

    if (row.call_ok === true) stats.callOkCount += 1;
  }
  stats.path.addressedBase = stats.addressedBase;
  stats.path.concrete = stats.addressedCounts.concrete;

  // The reviews only ask this question since 06.09.2026, so the comparison uses every answered review.
  let earliestReview = Number.POSITIVE_INFINITY;
  for (const review of reviewRows) {
    if (!isOneOf(POLITICAL_SELF_EFFICACY_VALUES, review.political_self_efficacy)) continue;
    stats.selfEfficacy.reviewsBase += 1;
    stats.selfEfficacy.reviews[review.political_self_efficacy] += 1;
    const createdAt = Date.parse(review.created_at ?? "");
    if (Number.isFinite(createdAt) && createdAt < earliestReview) earliestReview = createdAt;
  }
  if (Number.isFinite(earliestReview)) stats.selfEfficacy.reviewsSince = new Date(earliestReview).toISOString();

  stats.freeTexts = completedRows
    .filter((row) => trimmedOrNull(row.body) !== null)
    .sort((a, b) => timeOf(b) - timeOf(a))
    .map((row) => {
      const consent = row.consent === true;
      const timestamp = row.completed_at ?? row.created_at;
      const day = timestamp?.slice(0, 10) ?? null;
      return {
        text: trimmedOrNull(row.body) as string,
        consent,
        displayName: consent ? trimmedOrNull(row.display_name) : null,
        day: day && DAY_KEY_PATTERN.test(day) ? day : null,
      };
    });

  return stats;
}

type EffectiveState = {
  sent: boolean;
  notSent: boolean;
  replied: boolean;
  method: "handwritten" | "typed" | null;
};

function effectiveState(
  row: InternalOutcomeRow,
  formSent: boolean,
  click: (typeof OUTCOME_ENTRY_CHOICES)[number] | null,
): EffectiveState {
  if (formSent) {
    if (row.letter_sent === "not_sent") {
      return { sent: false, notSent: true, replied: false, method: null };
    }
    const replied = validChannels(row).some((channel) => channel !== "none");
    return {
      sent: true,
      notSent: false,
      replied,
      method: row.letter_sent === "typed" ? "typed" : "handwritten",
    };
  }
  if (click === "yes") return { sent: true, notSent: false, replied: true, method: null };
  if (click === "no") return { sent: true, notSent: false, replied: false, method: null };
  return { sent: false, notSent: click === "not_sent", replied: false, method: null };
}
