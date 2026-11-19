import Link from "next/link";
import type { ReactNode } from "react";
import { ColumnChart } from "@/components/internalStats/ColumnChart";
import { CopyButton } from "@/components/internalStats/CopyButton";
import { KeyFigures } from "@/components/internalStats/KeyFigures";
import { PressStatsFilters } from "@/components/internalStats/PressStatsFilters";
import { formatNumber } from "@/lib/formatNumber";
import { lockInternalStats } from "@/lib/internalStats/actions";
import { campaignSourceTotal, topicCategoryLabel, type InternalStats, type StatsFilter } from "@/lib/internalStats/aggregate";
import type { OutcomeRoundStats } from "@/lib/internalStats/outcomes";
import type { WeeklyDraftsResult } from "@/lib/internalStats/getWeeklyDrafts";
import { keyFigureQuoteLines, type KeyFigures as KeyFiguresData } from "@/lib/internalStats/keyFigures";
import { formatPressDate, SEND_SIGNAL_LABEL } from "@/lib/internalStats/pressCopy";
import { LASTCALL_COHORT } from "@/lib/rueckmeldung/cohort";
import { buildStatsHref, bundeslandName, SHARE_PERCENT_MIN_BASE, shareParts, type StatsQuery } from "@/lib/internalStats/view";

type PressStatsDashboardProps = {
  stats: InternalStats;
  outcomes: OutcomeRoundStats[];
  regions: Record<string, number>;
  topicSignalCount: number;
  keyFigures: KeyFiguresData;
  weekly: WeeklyDraftsResult;
  filter: StatsFilter;
  query: StatsQuery;
};

const titleClass = "font-typewriter text-xl font-bold leading-tight text-waldgruen-dark sm:text-2xl";
const bodyClass = "font-body text-sm leading-relaxed text-warmgrau";
const panelClass = "min-w-0 rounded-2xl border border-waldgruen/15 bg-white/85 p-4 sm:p-6";
const linkClass = "rounded-sm text-waldgruen-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen";
const minimumTopicBasis = 10;
const minimumExternalCell = 5;

type Rate = { positive: number; base: number };

function countText(positive: number, base: number): string {
  return `${formatNumber(positive)} von ${formatNumber(base)}`;
}

function percentageText(positive: number, base: number): string {
  return `${shareParts(positive, base).shareText} %`;
}

function RateValue({ positive, base, showPercent }: Rate & { showPercent: boolean }) {
  if (base === 0) return <span className="text-sm text-warmgrau">Keine Angaben</span>;
  return (
    <span className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
      {showPercent && <strong className="font-typewriter text-lg">{percentageText(positive, base)}</strong>}
      <span className="text-sm">{countText(positive, base)}</span>
    </span>
  );
}

function Disclosure({ title, children, level = "h2" }: { title: string; children: ReactNode; level?: "h2" | "h3" }) {
  const Heading = level;
  return (
    <details className="group rounded-xl border border-waldgruen/15 bg-white/70">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 font-body font-semibold text-waldgruen-dark focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-waldgruen sm:px-5 [&::-webkit-details-marker]:hidden">
        <Heading className="text-base">{title}</Heading>
        <span aria-hidden="true" className="shrink-0 text-lg leading-none group-open:rotate-180">⌄</span>
      </summary>
      <div className="border-t border-waldgruen/10 px-4 py-4 sm:px-5">{children}</div>
    </details>
  );
}

function FollowupRound({ round, early = false }: { round: OutcomeRoundStats; early?: boolean }) {
  const { withReply, withoutReply } = round.efficacyByReply;
  const comparable = withReply.base >= SHARE_PERCENT_MIN_BASE && withoutReply.base >= SHARE_PERCENT_MIN_BASE;
  const survey = `Nachbefragung vom ${formatPressDate(round.sentAt)} zu Briefen aus dem Zeitraum ${round.letterWindowLabel}.`;
  const copyText = comparable ? [
    `Freiwillige Nachbefragung von Brief-nach-Berlin vom ${formatPressDate(round.sentAt)} (Briefe: ${round.letterWindowLabel}).`,
    `Auf die Frage, ob sie durch den Brief eher das Gefühl haben, sich politisch einbringen zu können, antworteten ${countText(withoutReply.positive, withoutReply.base)} der Absender:innen ohne politische Antwort mit „Ja, deutlich“ oder „Eher ja“ (${percentageText(withoutReply.positive, withoutReply.base)}).`,
    `Bei Absender:innen mit politischer Antwort waren es ${countText(withReply.positive, withReply.base)} (${percentageText(withReply.positive, withReply.base)}).`,
    "Quelle: Brief-nach-Berlin, freiwillige Nachbefragung. Beide Gruppen umfassen nur Personen, die beide Fragen beantwortet haben.",
  ].join("\n") : null;
  return (
    <article className="min-w-0 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="font-body text-base font-semibold text-waldgruen-dark">{round.label}</h3>
        {early && (
          <span className="rounded-full bg-bernstein/20 px-2.5 py-0.5 font-body text-xs font-semibold text-waldgruen-dark">
            Erste Werte
          </span>
        )}
      </div>
      <p className={bodyClass}>{survey}</p>
      {early && (
        <p className={`mt-1 ${bodyClass}`}>Es kommen noch Antworten herein, die Werte können sich ändern.</p>
      )}
      {round.cohort === LASTCALL_COHORT && (
        <p className={`mt-3 rounded-lg bg-bernstein/15 px-3 py-2 ${bodyClass}`}>
          Diese Briefe stammen aus der Anfangszeit, als Brief-nach-Berlin fast nur an Bundestagsabgeordnete
          ging und das Abschreiben von Hand noch nicht im Mittelpunkt stand. Die Werte sind deshalb verzerrt
          und nur teilweise vergleichbar.
        </p>
      )}

      <h4 className="mt-4 font-body font-semibold text-waldgruen-dark">Politische Handlungsfähigkeit nach dem Brief</h4>
      <p className={bodyClass}>„Ja, deutlich“ oder „Eher ja“ auf die Frage, ob man sich eher politisch einbringen kann.</p>
      <dl className="mt-2 grid gap-2 text-waldgruen-dark sm:grid-cols-2">
        <div className="rounded-lg bg-creme p-3">
          <dt className="text-sm font-semibold">Ohne politische Antwort</dt>
          <dd><RateValue {...withoutReply} showPercent={comparable} /></dd>
        </div>
        <div className="rounded-lg bg-creme p-3">
          <dt className="text-sm font-semibold">Mit politischer Antwort</dt>
          <dd><RateValue {...withReply} showPercent={comparable} /></dd>
        </div>
      </dl>
      <p className={`mt-2 ${bodyClass}`}>
        Basis sind Absender:innen mit Angaben zu beiden Fragen. Eine Eingangsbestätigung zählt als Antwort.
        {!comparable && ` Prozentwerte erscheinen ab ${SHARE_PERCENT_MIN_BASE} Antworten je Gruppe.`}
      </p>
      {copyText && <div className="mt-3"><CopyButton text={copyText} label="Vergleich zitieren" /></div>}

      <h4 className="mt-5 font-body font-semibold text-waldgruen-dark">Ein weiterer Brief</h4>
      <dl className="mt-2 grid gap-2 text-waldgruen-dark sm:grid-cols-2">
        <div className="rounded-lg bg-creme p-3">
          <dt className="text-sm font-semibold">Bereits erneut geschrieben</dt>
          <dd><RateValue positive={round.writeAgainCounts.already_did} base={round.writeAgainBase} showPercent={round.writeAgainBase >= SHARE_PERCENT_MIN_BASE} /></dd>
        </div>
        <div className="rounded-lg bg-creme p-3">
          <dt className="text-sm font-semibold">Würde wieder schreiben</dt>
          <dd><RateValue positive={round.writeAgainCounts.yes} base={round.writeAgainBase} showPercent={round.writeAgainBase >= SHARE_PERCENT_MIN_BASE} /></dd>
        </div>
      </dl>
      <p className={`mt-2 ${bodyClass}`}>Basis sind freiwillige Antworten auf die Frage „Würdest du wieder einen Brief schreiben?“, inklusive „Vielleicht“ und „Eher nicht“.</p>
    </article>
  );
}

export function PressStatsDashboard({ stats, outcomes, regions, topicSignalCount, keyFigures, weekly, filter, query }: PressStatsDashboardProps) {
  const date = formatPressDate(stats.fetchedAt);
  const withoutCampaigns = filter.source.kind === "free";
  const timeLabel = filter.timeRange === "all" ? "Gesamtzeitraum" : `letzte ${filter.timeRange} Tage`;
  const regionLabel = filter.bundesland ? bundeslandName(filter.bundesland) : "bundesweit";
  const sourceLabel = withoutCampaigns ? "ohne Kampagnen" : "mit Kampagnen";
  const scopeText = `${timeLabel} · ${regionLabel} · ${sourceLabel}`;
  const signals = stats.letterSignals;
  const campaignSignals = campaignSourceTotal(signals.sourceCounts);
  const topTopics = topicSignalCount >= minimumTopicBasis
    ? Object.entries(signals.categoryCounts)
      .filter(([, count]) => count >= minimumExternalCell)
      .sort((a, b) => b[1] - a[1] || topicCategoryLabel(a[0]).localeCompare(topicCategoryLabel(b[0]), "de"))
      .slice(0, 5)
    : [];
  const regionRows = Object.entries(regions)
    .filter(([, count]) => count >= minimumExternalCell)
    .sort((a, b) => b[1] - a[1] || bundeslandName(a[0]).localeCompare(bundeslandName(b[0]), "de"));
  const latestRound = outcomes.length > 0 ? outcomes[outcomes.length - 1] : null;
  const earlierRounds = outcomes.slice(0, -1).reverse();
  const quoteLines = [
    `Bis zum ${formatPressDate(keyFigures.fetchedAt)} wurden bundesweit ${formatNumber(keyFigures.letterCount)} Briefentwürfe mit Brief-nach-Berlin erstellt, einschließlich Kampagnen.`,
    ...keyFigureQuoteLines(keyFigures),
  ];
  const topTopic = topTopics[0];
  if (topTopic && topicSignalCount >= SHARE_PERCENT_MIN_BASE) {
    quoteLines.push(`Unter ${formatNumber(topicSignalCount)} freiwilligen Themenfreigaben (${scopeText}) wurde „${topicCategoryLabel(topTopic[0])}“ mit ${formatNumber(topTopic[1])} Nennungen am häufigsten genannt. Pro Brief waren mehrere Themen möglich.`);
  }
  quoteLines.push("Quelle: Brief-nach-Berlin, https://brief-nach-berlin.de/stats.");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-7 sm:pb-16">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-5 sm:py-7">
        <h1 className="font-typewriter text-2xl font-bold leading-tight text-waldgruen-dark sm:text-4xl">
          Brief-nach-Berlin in Zahlen
        </h1>
        <form action={lockInternalStats}>
          <button type="submit" className={`min-h-11 font-body text-sm ${linkClass}`}>Abmelden</button>
        </form>
      </header>

      <KeyFigures
        figures={keyFigures}
        headingId="press-key-figures"
        action={<CopyButton text={quoteLines.join("\n\n")} label="Zahlen zitieren" />}
      />

      <div className="mt-10">
        <p className={`mb-3 ${bodyClass}`}>
          Die Kernzahlen oben gelten immer für alle Briefe. Die Auswahl wirkt auf Themen, Wochenzahlen und Versandangaben.
        </p>
        <PressStatsFilters query={query} />
        <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <section aria-labelledby="press-topics" className={panelClass}>
            <h2 id="press-topics" className={titleClass}>Häufigste Themen</h2>
            <p className={`mt-1 ${bodyClass}`}>{scopeText}</p>
            {topTopics.length ? (
              <>
                <ol className="mt-4 space-y-2.5">
                  {topTopics.map(([key, count]) => (
                    <li key={key}>
                      <div className="flex justify-between gap-3 font-body text-sm font-semibold text-waldgruen-dark">
                        <span>{topicCategoryLabel(key)}</span>
                        <span className="tabular-nums">{formatNumber(count)}</span>
                      </div>
                      <div aria-hidden="true" className="mt-1 h-1.5 rounded-full bg-waldgruen/10">
                        <div className="h-full rounded-full bg-waldgruen" style={{ width: `${(count / topicSignalCount) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ol>
                <p className={`mt-4 ${bodyClass}`}>
                  {formatNumber(topicSignalCount)} freiwillige Themenfreigaben. Mehrere Themen pro Brief sind möglich.
                  {!withoutCampaigns && ` ${formatNumber(campaignSignals)} Freigaben stammen aus Kampagnen.`}
                </p>
              </>
            ) : (
              <p className={`mt-4 ${bodyClass}`}>Für diese Auswahl liegen zu wenige Themenfreigaben vor.</p>
            )}
          </section>

          <section aria-labelledby="press-weekly" className={panelClass}>
            <h2 id="press-weekly" className={titleClass}>Entwürfe pro Woche</h2>
            <p className={`mt-1 ${bodyClass}`}>
              Bundesweit · {sourceLabel}. Der Bundeslandfilter gilt für die Themen und das Feedback.
            </p>
            {weekly.status === "ready" ? (
              <div className="mt-3">
                <p className={`mb-1 ${bodyClass}`}>
                  Letzte {weekly.points.length} vollständig erfasste Kalenderwochen.
                </p>
                <ColumnChart
                  data={weekly.points}
                  axisLabel="Kalenderwoche"
                  unit="Entwürfe"
                  emphasizePeak={false}
                  tableSummary="Wochenzahlen als Tabelle"
                  compact
                />
              </div>
            ) : (
              <p className={`mt-4 rounded-lg bg-creme px-3 py-3 ${bodyClass}`}>
                {weekly.status === "collecting"
                  ? "Der Verlauf erscheint, sobald mindestens vier vollständige Wochen erfasst sind."
                  : "Wochenzahlen sind gerade nicht verfügbar."}
              </p>
            )}
          </section>
        </div>

        <section aria-labelledby="press-followup" className="mt-8">
          <h2 id="press-followup" className={titleClass}>Was die Nachbefragung zeigt</h2>
          <p className={`mt-1 ${bodyClass}`}>Die Nachbefragungen haben eigene Zeiträume und gelten bundesweit.</p>
          {latestRound ? (
            <div className={`mt-4 ${panelClass}`}>
              <FollowupRound round={latestRound} early />
            </div>
          ) : (
            <p className={`mt-4 ${bodyClass}`}>Es liegen noch keine Nachbefragungen vor.</p>
          )}
          {earlierRounds.length > 0 && (
            <div className="mt-3">
              <Disclosure title="Frühere Runden" level="h3">
                <div className="divide-y divide-waldgruen/15">
                  {earlierRounds.map((round) => <FollowupRound key={round.cohort} round={round} />)}
                </div>
              </Disclosure>
            </div>
          )}
        </section>

        <div className="mt-6 space-y-3">
          <Disclosure title="Versandangaben">
            <p className={bodyClass}>{scopeText} · freiwillige Angaben im Feedback</p>
            <dl className="mt-3 grid gap-3 text-waldgruen-dark sm:grid-cols-2">
              <div className="rounded-lg bg-creme p-3">
                <dt className="text-sm font-semibold first-letter:uppercase">{SEND_SIGNAL_LABEL}</dt>
                <dd>
                  <RateValue positive={stats.sentCount} base={stats.knownSendCount} showPercent={stats.knownSendCount >= SHARE_PERCENT_MIN_BASE} />
                </dd>
              </div>
            </dl>
          </Disclosure>

          <Disclosure title="Zahlen nach Bundesland">
            <p className={bodyClass}>{timeLabel} · {sourceLabel} · freiwillige Themenfreigaben nach Bundesland.</p>
            {regionRows.length ? (
              <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
                {regionRows.map(([key, count]) => (
                  <li key={key} className="border-b border-waldgruen/10">
                    <Link
                      href={buildStatsHref(query, { bundesland: key === filter.bundesland ? null : key })}
                      scroll={false}
                      aria-current={key === filter.bundesland ? "true" : undefined}
                      aria-label={key === filter.bundesland ? `Filter ${bundeslandName(key)} entfernen, ${formatNumber(count)} Angaben` : `Nach ${bundeslandName(key)} filtern, ${formatNumber(count)} Angaben`}
                      className="flex min-h-11 items-center justify-between gap-3 rounded-sm text-sm text-waldgruen-dark hover:underline focus-visible:outline-2 focus-visible:outline-waldgruen aria-current:font-bold"
                    >
                      <span>{bundeslandName(key)}</span>
                      <span className="tabular-nums">{formatNumber(count)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`mt-2 ${bodyClass}`}>Für diese Auswahl liegen zu wenige regionale Angaben vor.</p>
            )}
          </Disclosure>
        </div>

        <footer className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-waldgruen/15 pt-4 font-body text-sm">
          <span className="text-warmgrau">Quelle: Brief-nach-Berlin · Stand {date}</span>
          <Link href="/stats/intern" className={linkClass}>Interne Auswertung</Link>
        </footer>
      </div>
    </div>
  );
}
