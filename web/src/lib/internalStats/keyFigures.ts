import { formatDecimal, formatNumber } from "@/lib/formatNumber";
import type { InternalStats } from "@/lib/internalStats/aggregate";
import type { OutcomeRoundStats } from "@/lib/internalStats/outcomes";
import { SHARE_PERCENT_MIN_BASE } from "@/lib/internalStats/view";

export type KeyShare = {
  positive: number;
  base: number;
  /** Ganze Prozent, null unter SHARE_PERCENT_MIN_BASE Antworten. */
  percent: number | null;
};

export type KeyFigures = {
  /** letterCount: globaler Zähler (stats.letterCount), enthält Kampagnen. */
  letterCount: number;
  /** firstTimers: Feedback direkt nach dem Brief, letterHistory "first" von allen Antworten. */
  firstTimers: KeyShare;
  /** efficacy: Feedback direkt nach dem Brief, "Ja, deutlich" + "Eher ja"; Basis inklusive "unsicher". */
  efficacy: KeyShare;
  /** writeAgain: neueste versendete Nachbefragung, "Hab ich schon" + "Ja, gern"; Basis inklusive "Vielleicht" und "Eher nicht". */
  writeAgain: KeyShare & { roundLabel: string | null };
  /** rating: getReviewStats() seit MIN_PUBLIC_REVIEW_DATE, dieselbe Zahl wie auf /stimmen. */
  rating: { average: number | null; count: number };
  fetchedAt: string;
};

function share(positive: number, base: number): KeyShare {
  return {
    positive,
    base,
    percent: base >= SHARE_PERCENT_MIN_BASE ? Math.round((positive / base) * 100) : null,
  };
}

/** Kernzahlen immer ungefiltert (Gesamtzeitraum, bundesweit, mit Kampagnen). */
export function buildKeyFigures(
  stats: InternalStats,
  outcomes: OutcomeRoundStats[],
  rating: { averageRating: number; totalCount: number },
): KeyFigures {
  const { letterHistory, politicalActivation } = stats;
  const efficacy = politicalActivation.selfEfficacyDistribution;
  const latest = outcomes.length > 0 ? outcomes[outcomes.length - 1] : null;
  const writeAgain = latest
    ? share(latest.writeAgainCounts.already_did + latest.writeAgainCounts.yes, latest.writeAgainBase)
    : share(0, 0);

  return {
    letterCount: stats.letterCount,
    firstTimers: share(letterHistory.distribution.first, letterHistory.answerCount),
    efficacy: share(efficacy.clearly_yes + efficacy.rather_yes, politicalActivation.selfEfficacyAnswerCount),
    writeAgain: { ...writeAgain, roundLabel: latest ? latest.label : null },
    rating: {
      average: rating.totalCount >= SHARE_PERCENT_MIN_BASE ? rating.averageRating : null,
      count: rating.totalCount,
    },
    fetchedAt: stats.fetchedAt,
  };
}

function countText(share: KeyShare): string {
  return `${formatNumber(share.positive)} von ${formatNumber(share.base)}`;
}

/** Zitierfähige Sätze für „Zahlen zitieren“: nur Kernzahlen, die ihre Mindestbasis erreichen. */
export function keyFigureQuoteLines(figures: KeyFigures): string[] {
  const lines: string[] = [];
  const { firstTimers, efficacy, writeAgain, rating } = figures;

  if (firstTimers.percent !== null) {
    lines.push(
      `${firstTimers.percent} % der Schreibenden schreiben nach eigener Angabe zum ersten Mal an Politiker:innen (${countText(firstTimers)} Antworten im freiwilligen Feedback direkt nach dem Brief).`,
    );
  }
  if (efficacy.percent !== null) {
    lines.push(
      `${efficacy.percent} % fühlen sich durch den Brief eher politisch handlungsfähig, sie antworteten mit „Ja, deutlich“ oder „Eher ja“ (${countText(efficacy)} Antworten im freiwilligen Feedback direkt nach dem Brief).`,
    );
  }
  if (writeAgain.percent !== null) {
    const source = writeAgain.roundLabel
      ? `freiwillige Nachbefragung, ${writeAgain.roundLabel}`
      : "freiwillige Nachbefragung";
    lines.push(
      `${writeAgain.percent} % würden wieder einen Brief schreiben oder haben es schon getan (${countText(writeAgain)} Antworten, ${source}).`,
    );
  }
  if (rating.average !== null) {
    lines.push(
      `Die durchschnittliche Bewertung liegt bei ${formatDecimal(rating.average)} von 5 Sternen (${formatNumber(rating.count)} Bewertungen).`,
    );
  }
  return lines;
}
