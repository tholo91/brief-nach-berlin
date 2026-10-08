import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { StatsPie } from "@/components/internalStats/StatsPie";
import { FilterBar } from "@/components/internalStats/FilterBar";
import { ValueEmphasis } from "@/components/internalStats/ValueEmphasis";
import { ColumnChart, type ColumnPoint } from "@/components/internalStats/ColumnChart";
import { TopicHeatmap } from "@/components/internalStats/TopicHeatmap";
import { SubtopicClusters } from "@/components/internalStats/SubtopicClusters";
import { CopyButton } from "@/components/internalStats/CopyButton";
import { SectionNav } from "@/components/internalStats/SectionNav";
import { formatDecimal, formatNumber } from "@/lib/formatNumber";
import { lockInternalStats, unlockInternalStats } from "@/lib/internalStats/actions";
import {
  INTERNAL_STATS_COOKIE,
  isInternalStatsCookieValid,
} from "@/lib/internalStats/access";
import { getInternalStatsWithBaseline } from "@/lib/internalStats/getInternalStats";
import { BarTrack } from "@/components/internalStats/BarTrack";
import {
  campaignSourceTotal,
  topCampaignSlug,
  type InternalStats,
  type SendBreakdown,
  topicCategoryLabel,
} from "@/lib/internalStats/aggregate";
import {
  activeFilterChips,
  buildStatsHref,
  bucketCategoryTimeline,
  bucketCounterTimeline,
  bucketTimeline,
  bundeslandName,
  daySpan,
  granularityForTimeRange,
  isSmallBasis,
  parseStatsFilter,
  peakPoint,
  shareParts,
  statsQueryFromFilter,
  timeRangeFromDay,
  topLabelsByCategory,
  VIEW_MODES,
  type StatsQuery,
  type ViewMode,
} from "@/lib/internalStats/view";
import { TOPIC_CATEGORY_CODES } from "@/lib/topics/topicTaxonomy";
import {
  POLITICAL_POWERLESSNESS_FREQUENCY_LABELS,
  POLITICAL_POWERLESSNESS_FREQUENCY_VALUES,
  POLITICAL_SELF_EFFICACY_LABELS,
  POLITICAL_SELF_EFFICACY_VALUES,
} from "@/lib/feedback/politicalActivation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Interne Wirkung | Brief-nach-Berlin",
  description: "Interne, aggregierte Produktstatistik von Brief-nach-Berlin.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string | null): string {
  return value ? dateFormatter.format(new Date(value)) : "—";
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)} Uhr`;
}

function AirmailStripe() {
  return (
    <div
      aria-hidden="true"
      className="h-2"
      style={{
        background:
          "repeating-linear-gradient(-45deg, #C1121F 0 12px, #FAF8F5 12px 18px, #1D3557 18px 30px, #FAF8F5 30px 36px)",
      }}
    />
  );
}

function StatCard({
  eyebrow,
  value,
  label,
  tone = "light",
  footer,
}: {
  eyebrow: string;
  value: ReactNode;
  label: string;
  tone?: "light" | "green";
  footer?: ReactNode;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-[0_16px_36px_rgba(27,67,50,0.07)] sm:p-6 ${
        tone === "green"
          ? "border-waldgruen-dark/20 bg-waldgruen-dark text-creme"
          : "border-warmgrau/10 bg-white/75 text-waldgruen-dark"
      }`}
    >
      <p
        className={`font-typewriter text-[11px] font-bold uppercase tracking-[0.18em] ${
          tone === "green" ? "text-creme/65" : "text-waldgruen/65"
        }`}
      >
        {eyebrow}
      </p>
      <p className="mt-3 font-typewriter text-3xl font-bold tabular-nums sm:text-4xl lg:text-5xl">
        {value}
      </p>
      <p
        className={`mt-2 font-body text-sm leading-relaxed ${
          tone === "green" ? "text-creme/75" : "text-warmgrau/70"
        }`}
      >
        {label}
      </p>
      {footer && <div className={tone === "green" ? "[&_span]:text-creme/70 [&_span>span]:bg-creme/70" : ""}>{footer}</div>}
    </article>
  );
}

function SectionHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return (
    <div className="mb-6">
      <p className="font-typewriter text-[11px] font-bold uppercase tracking-[0.18em] text-waldgruen/65">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-typewriter text-2xl font-bold leading-tight text-waldgruen-dark sm:text-3xl">
        {title}
      </h2>
      {detail && <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/65">{detail}</p>}
    </div>
  );
}

function EmptyState({ children = "Noch keine freigegebenen Signale." }: { children?: string }) {
  return <p className="rounded-lg bg-warmgrau/5 px-4 py-5 font-body text-sm leading-relaxed text-warmgrau/60">{children}</p>;
}

function BasisNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 border-t border-warmgrau/10 pt-4 font-typewriter text-xs leading-relaxed text-warmgrau/55">
      {children}
    </p>
  );
}

function BasisBadge() {
  return (
    <span className="ml-2 inline-block rounded-full border border-bernstein/40 bg-bernstein/10 px-2 py-0.5 font-typewriter text-[10px] font-bold uppercase tracking-[0.1em] text-warmgrau/70">
      kleine Basis
    </span>
  );
}

const SECTION_LINKS = [
  { id: "ueberblick", label: "Überblick" },
  { id: "verlauf", label: "Verlauf" },
  { id: "themen", label: "Themen" },
  { id: "feedback", label: "Feedback" },
  { id: "wirkung", label: "Wirkung" },
  { id: "definitionen", label: "Definitionen" },
] as const;

function Section({
  id,
  accent = "neutral",
  children,
}: {
  id: string;
  accent?: "neutral" | "rot" | "gruen";
  children: ReactNode;
}) {
  const border =
    accent === "rot"
      ? "border-airmail-rot/15"
      : accent === "gruen"
        ? "border-waldgruen/15"
        : "border-warmgrau/10";
  return (
    <section
      id={id}
      className={`mt-8 scroll-mt-16 rounded-2xl border ${border} bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:mt-10 sm:p-8`}
    >
      {children}
    </section>
  );
}

function SubHeading({ children, detail }: { children: ReactNode; detail?: string }) {
  return (
    <div className="mb-4">
      <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
        {children}
      </h3>
      {detail && <p className="mt-1 font-body text-xs leading-relaxed text-warmgrau/60">{detail}</p>}
    </div>
  );
}

/** Zugeklappter Nebenbereich; spart auf dem Handy Scrollweg. */
function Collapsible({
  summary,
  detail,
  children,
}: {
  summary: string;
  detail?: string;
  children: ReactNode;
}) {
  return (
    <details className="group/collapsible">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark underline-offset-2 hover:underline">
          <svg
            aria-hidden="true"
            viewBox="0 0 10 10"
            className="h-3 w-3 transition-transform group-open/collapsible:rotate-90"
          >
            <path d="M3 1.5 6.5 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {summary}
        </span>
        {detail && <p className="mt-1 pl-5 font-body text-xs leading-relaxed text-warmgrau/60">{detail}</p>}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function ViewToggle({ mode, query }: { mode: ViewMode; query: StatsQuery }) {
  const hrefFor = (next: ViewMode) =>
    buildStatsHref(query, { ansicht: next === "absolut" ? "absolut" : null });
  const base =
    "rounded-md px-3 py-1.5 font-typewriter text-xs font-bold uppercase tracking-[0.12em] transition-colors";
  return (
    <fieldset>
      <legend className="sr-only">Darstellungsart</legend>
      <div className="inline-flex rounded-lg border border-warmgrau/15 bg-white/70 p-1">
        {VIEW_MODES.map((next) => (
          <Link
            key={next}
            href={hrefFor(next)}
            className={`${base} ${
              mode === next
                ? "bg-waldgruen-dark text-creme"
                : "text-warmgrau/60 hover:text-waldgruen-dark"
            }`}
          >
            {next === "prozentual" ? "Prozentual" : "Absolut"}
          </Link>
        ))}
      </div>
    </fieldset>
  );
}

function ShareStat({
  mode,
  value,
  total,
}: {
  mode: ViewMode;
  value: number;
  total: number;
}) {
  const parts = shareParts(value, total);
  return mode === "prozentual" ? (
    <span className="flex flex-col items-end gap-0.5">
      <span className="font-typewriter text-sm font-bold tabular-nums text-waldgruen-dark">
        {parts.shareText} %
      </span>
      <span className="font-typewriter text-[11px] tabular-nums text-warmgrau/55">
        {parts.count} von {parts.totalText}
      </span>
    </span>
  ) : (
    <span className="flex flex-col items-end gap-0.5">
      <span className="font-typewriter text-sm font-bold tabular-nums text-waldgruen-dark">
        {parts.count}
      </span>
      <span className="font-typewriter text-[11px] tabular-nums text-warmgrau/55">
        ({parts.shareText} % · von {parts.totalText})
      </span>
    </span>
  );
}

function RankedBars({
  values,
  labels,
  total,
  mode,
  smallBasis = true,
  baseline,
  baselineTotal,
  hrefFor,
  activeKey,
}: {
  values: Record<string, number>;
  labels?: (key: string) => string;
  total?: number;
  mode?: ViewMode;
  smallBasis?: boolean;
  /** Gleiche Kennzahl ohne Filter; zeigt eine Vergleichsmarke je Balken. */
  baseline?: Record<string, number>;
  baselineTotal?: number;
  /** Macht Zeilen klickbar (Filter setzen oder aufheben). */
  hrefFor?: (key: string, isActive: boolean) => string;
  activeKey?: string | null;
}) {
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (!entries.length) return <EmptyState />;
  const shareBased = total !== undefined && total > 0;
  const share = (value: number) => (shareBased ? (value / total) * 100 : value);
  const baselineShare = (key: string): number | null =>
    shareBased && baseline && baselineTotal
      ? ((baseline[key] ?? 0) / baselineTotal) * 100
      : null;
  const scale = Math.max(
    ...entries.map(([key, value]) => Math.max(share(value), baselineShare(key) ?? 0)),
    0,
  );
  return (
    <div className="grid gap-3">
      {entries.map(([key, value]) => {
        const isActive = activeKey === key;
        const body = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-body text-sm font-semibold text-waldgruen-dark">
                {labels?.(key) ?? key}
                {smallBasis && isSmallBasis(value) && <BasisBadge />}
                {isActive && (
                  <span className="ml-2 inline-block rounded-full bg-waldgruen-dark px-2 py-0.5 font-typewriter text-[10px] font-bold uppercase tracking-[0.1em] text-creme">
                    Filter · ×
                  </span>
                )}
              </span>
              {total !== undefined && mode ? (
                <ShareStat mode={mode} value={value} total={total} />
              ) : (
                <span className="font-typewriter text-xs tabular-nums text-warmgrau/60">
                  {formatNumber(value)}
                </span>
              )}
            </div>
            <BarTrack value={share(value)} scale={scale} baseline={baselineShare(key)} />
          </>
        );
        if (!hrefFor) return <div key={key}>{body}</div>;
        return (
          <Link
            key={key}
            href={hrefFor(key, isActive)}
            scroll={false}
            title={isActive ? "Filter aufheben" : `Nur ${labels?.(key) ?? key} anzeigen`}
            className={`-mx-2 block rounded-lg px-2 py-1 transition-colors hover:bg-waldgruen/5 focus:outline-none focus:ring-2 focus:ring-waldgruen/30 ${
              isActive ? "bg-waldgruen/10" : ""
            }`}
          >
            {body}
          </Link>
        );
      })}
    </div>
  );
}

function RatingBars({
  stats,
  mode,
  baseline,
}: {
  stats: InternalStats;
  mode: ViewMode;
  baseline?: InternalStats | null;
}) {
  return (
    <div className="grid gap-3">
      {([5, 4, 3, 2, 1] as const).map((rating) => {
        const count = stats.ratingDistribution[rating];
        const share = stats.reviewCount > 0 ? (count / stats.reviewCount) * 100 : 0;
        const baselineShare =
          baseline && baseline.reviewCount > 0
            ? (baseline.ratingDistribution[rating] / baseline.reviewCount) * 100
            : null;
        return (
          <div key={rating} className="grid grid-cols-[42px_1fr_max-content] items-center gap-3">
            <span className="font-typewriter text-sm text-warmgrau/70">{rating} ★</span>
            <div className="-mt-1.5">
              <BarTrack value={share} scale={100} baseline={baselineShare} colorClassName="bg-bernstein" />
            </div>
            <span className="flex min-w-28 justify-end">
              <ShareStat mode={mode} value={count} total={stats.reviewCount} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SurveyDistributionBars({
  values,
  options,
  total,
  color,
  mode,
  baselineValues,
  baselineTotal,
}: {
  values: Record<string, number>;
  options: readonly { key: string; label: string }[];
  total: number;
  color: string;
  mode: ViewMode;
  baselineValues?: Record<string, number>;
  baselineTotal?: number;
}) {
  return (
    <div className="grid gap-3">
      {options.map(({ key, label }) => {
        const count = values[key] ?? 0;
        const share = total > 0 ? (count / total) * 100 : 0;
        const baselineShare =
          baselineValues && baselineTotal
            ? ((baselineValues[key] ?? 0) / baselineTotal) * 100
            : null;
        return (
          <div key={key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-body text-sm font-semibold text-waldgruen-dark">
                {label}
                {isSmallBasis(count) && <BasisBadge />}
              </span>
              <ShareStat mode={mode} value={count} total={total} />
            </div>
            <BarTrack value={share} scale={100} baseline={baselineShare} color={color} />
          </div>
        );
      })}
    </div>
  );
}

const ratingBands = [
  { label: "1–2 Sterne", ratings: [1, 2] as const, color: "#C1121F" },
  { label: "3 Sterne", ratings: [3] as const, color: "#C58B18" },
  { label: "4–5 Sterne", ratings: [4, 5] as const, color: "#2D6A4F" },
] as const;

const selfEfficacyOptions = POLITICAL_SELF_EFFICACY_VALUES.map((key) => ({
  key,
  label: POLITICAL_SELF_EFFICACY_LABELS[key],
}));

const powerlessnessOptions = POLITICAL_POWERLESSNESS_FREQUENCY_VALUES.map(
  (key) => ({
    key,
    label: POLITICAL_POWERLESSNESS_FREQUENCY_LABELS[key],
  }),
);

const positiveSignals = [
  { key: "sofort_verschickbar", label: "Sofort verschickbar" },
  { key: "argumente_stark", label: "Argumente stark" },
  { key: "tonfall_passt", label: "Tonfall passt" },
] as const;

const frictionSignals = [
  { key: "anliegen_verfehlt", label: "Anliegen verfehlt" },
  { key: "klingt_nicht_nach_mir", label: "Klingt nicht nach mir" },
  { key: "zu_generisch", label: "Zu generisch" },
] as const;

function sumRatingBreakdowns(
  stats: InternalStats,
  ratings: readonly (1 | 2 | 3 | 4 | 5)[],
): SendBreakdown {
  const result: SendBreakdown = {
    sent: 0,
    notSent: 0,
    noAnswer: 0,
    known: 0,
    ratePercent: 0,
  };

  for (const rating of ratings) {
    const breakdown = stats.sendByRating[rating];
    result.sent += breakdown.sent;
    result.notSent += breakdown.notSent;
    result.noAnswer += breakdown.noAnswer;
  }

  result.known = result.sent + result.notSent;
  result.ratePercent = result.known > 0 ? (result.sent / result.known) * 100 : 0;
  return result;
}

function SignalList({
  stats,
  signals,
  color,
  mode,
  baseline,
}: {
  stats: InternalStats;
  signals: readonly { key: string; label: string }[];
  color: string;
  mode: ViewMode;
  baseline?: InternalStats | null;
}) {
  return (
    <div className="grid gap-4">
      {signals.map((signal) => {
        const values = stats.feedbackTagStats[signal.key];
        if (!values || values.total === 0) return null;
        const baselineValues = baseline?.feedbackTagStats[signal.key];
        const baselineRate =
          baselineValues && baselineValues.known > 0 ? baselineValues.ratePercent : null;
        return (
          <div key={signal.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-body text-sm font-semibold text-waldgruen-dark">
                {signal.label}
                {isSmallBasis(values.total) && <BasisBadge />}
              </span>
              {values.known > 0 ? (
                <ShareStat mode={mode} value={values.sent} total={values.known} />
              ) : (
                <span className="font-typewriter text-xs tabular-nums text-warmgrau/60">
                  {formatNumber(values.total)} Markierungen
                </span>
              )}
            </div>
            <BarTrack
              value={values.known > 0 ? (values.sent / values.known) * 100 : 0}
              scale={100}
              baseline={baselineRate}
              color={color}
            />
            <p className="mt-1 font-typewriter text-[11px] text-warmgrau/55">
              {values.known > 0
                ? `${formatNumber(values.sent)} von ${formatNumber(values.known)} mit Angabe`
                : `${formatNumber(values.total)} Markierungen`}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function BaselineLine({ children }: { children: ReactNode }) {
  return (
    <span className="mt-2 block font-typewriter text-[11px] tabular-nums text-warmgrau/55">
      <span className="mr-1 inline-block h-2.5 w-[2px] translate-y-[1px] rounded-full bg-warmgrau/70" aria-hidden="true" />
      Gesamt: {children}
    </span>
  );
}

function CoreValues({
  stats,
  mode,
  activation,
  baseline,
}: {
  stats: InternalStats;
  mode: ViewMode;
  activation: InternalStats["politicalActivation"];
  baseline?: InternalStats | null;
}) {
  const efficacyDirectional = activation.selfEfficacyDirectionalCount;
  const efficacyPositive = activation.selfEfficacyPositiveCount;
  const efficacyUnsure =
    activation.selfEfficacyAnswerCount - activation.selfEfficacyDirectionalCount;

  return (
    <div className="mt-6 grid gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      <StatCard
        eyebrow="Brief-Erstellungen"
        value={formatNumber(stats.letterCount)}
        label="gezählte Briefe seit Produktstart · Verlauf seit Einführung der Briefnummer unter „Verlauf“"
      />
      <StatCard
        eyebrow="Durchschnittliche Bewertung"
        value={`${formatDecimal(stats.averageRating)} / 5`}
        label={`${formatNumber(stats.reviewCount)} Bewertungen im gewählten Zeitraum`}
        footer={
          baseline ? (
            <BaselineLine>
              {formatDecimal(baseline.averageRating)} / 5 · {formatNumber(baseline.reviewCount)} Bewertungen
            </BaselineLine>
          ) : null
        }
      />
      <StatCard
        eyebrow="Versandsignal aus dem Feedback"
        tone="green"
        value={
          <ValueEmphasis
            mode={mode}
            tone="dark"
            value={stats.sentCount}
            total={stats.knownSendCount}
            unit="beantwortete Versandfragen"
          />
        }
        label={`„Ja, geht raus\" umfasst verschickt und unmittelbar geplanten Versand · fehlende Angabe: ${formatNumber(stats.noAnswerCount)}`}
        footer={
          baseline ? (
            <BaselineLine>
              {formatDecimal(baseline.sendRatePercent)} % · {formatNumber(baseline.sentCount)} von{" "}
              {formatNumber(baseline.knownSendCount)}
            </BaselineLine>
          ) : null
        }
      />
      <StatCard
        eyebrow="Wahrgenommene Handlungsfähigkeit"
        value={
          efficacyDirectional > 0
            ? `${formatDecimal(activation.selfEfficacyPositiveRatePercent)} %`
            : "—"
        }
        label={`„Ja, deutlich\" / „Eher ja\" · ${formatNumber(
          efficacyPositive,
        )} von ${formatNumber(efficacyDirectional)} gerichteten Antworten · ${formatNumber(
          efficacyUnsure,
        )} unsicher`}
        footer={
          baseline && baseline.politicalActivation.selfEfficacyDirectionalCount > 0 ? (
            <BaselineLine>
              {formatDecimal(baseline.politicalActivation.selfEfficacyPositiveRatePercent)} % ·{" "}
              {formatNumber(baseline.politicalActivation.selfEfficacyPositiveCount)} von{" "}
              {formatNumber(baseline.politicalActivation.selfEfficacyDirectionalCount)}
            </BaselineLine>
          ) : null
        }
      />
    </div>
  );
}

function Funnel({ stats }: { stats: InternalStats }) {
  const steps = [
    {
      label: "Brief erstellt",
      value: stats.letterCount,
      note: "Gesamtzähler ohne Ereignisverlauf — wird vom Zeitraum-/Quellenfilter nicht verändert.",
    },
    { label: "Bewertung abgegeben", value: stats.reviewCount },
    { label: "Versandfrage beantwortet", value: stats.knownSendCount },
    { label: "Positives Versandsignal", value: stats.sentCount },
  ];
  const max = Math.max(...steps.map((step) => step.value), 1);
  return (
    <ol className="grid gap-4">
      {steps.map((step, index) => (
        <li key={step.label} className="rounded-lg border border-warmgrau/10 bg-creme/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-waldgruen-dark font-typewriter text-xs font-bold text-creme">
              {index + 1}
            </span>
            <span className="min-w-40 font-body text-sm font-semibold text-waldgruen-dark">
              {step.label}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-warmgrau/10">
              <div
                className="h-full rounded-full bg-waldgruen"
                style={{ width: `${(step.value / max) * 100}%` }}
              />
            </div>
            <div className="grid gap-0.5 text-right">
              <span className="font-typewriter text-lg font-bold tabular-nums text-waldgruen-dark">
                {formatNumber(step.value)}
              </span>
              {index > 0 && stats.reviewCount > 0 && (
                <span className="font-typewriter text-[11px] tabular-nums text-warmgrau/55">
                  {shareParts(step.value, stats.reviewCount).shareText} % der Bewertungen
                </span>
              )}
            </div>
          </div>
          {step.label === "Bewertung abgegeben" && stats.reviewCount > 0 && (
            <div className="mt-3 grid gap-3 border-t border-warmgrau/10 pt-3 sm:grid-cols-2">
              {[
                { label: "Feedback-Formular abgeschickt", value: stats.fullFeedbackCount },
                { label: "Kurzbewertung · nur Sterne", value: stats.quickRatingCount },
              ].map((group) => (
                <div key={group.label} className="flex items-baseline justify-between gap-3">
                  <span className="font-body text-xs text-warmgrau/65">{group.label}</span>
                  <span className="shrink-0 font-typewriter text-xs tabular-nums text-waldgruen-dark">
                    {formatNumber(group.value)} · {shareParts(group.value, stats.reviewCount).shareText} %
                  </span>
                </div>
              ))}
              <p className="font-body text-xs leading-relaxed text-warmgrau/55 sm:col-span-2">
                „Formular abgeschickt“ bezeichnet den gesendeten Formularschritt; optionale Fragen waren freiwillig.
              </p>
            </div>
          )}
          {step.note && (
            <p className="mt-2 font-body text-xs leading-relaxed text-warmgrau/55">{step.note}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

function DataError() {
  return (
    <main className="min-h-screen bg-creme px-5 py-10 sm:px-8 sm:py-16">
      <AirmailStripe />
      <section className="mx-auto mt-10 max-w-xl rounded-2xl border border-airmail-rot/20 bg-white/75 p-6 shadow-sm sm:p-8">
        <p className="font-typewriter text-xs font-bold uppercase tracking-[0.18em] text-airmail-rot">
          Brief-nach-Berlin · intern
        </p>
        <h1 className="mt-3 font-typewriter text-3xl font-bold text-waldgruen-dark">
          Statistik gerade nicht erreichbar
        </h1>
        <p className="mt-4 font-body leading-relaxed text-warmgrau/70">
          Supabase konnte die aggregierten Werte nicht liefern. Bitte lade die Seite später erneut.
        </p>
      </section>
    </main>
  );
}

function StatsLogin({ configured, error }: { configured: boolean; error: boolean }) {
  return (
    <main className="min-h-screen bg-creme px-5 py-10 sm:px-8 sm:py-16">
      <AirmailStripe />
      <section className="mx-auto mt-10 max-w-md rounded-2xl border border-warmgrau/10 bg-white/75 p-6 shadow-sm sm:p-8">
        <p className="font-typewriter text-xs font-bold uppercase tracking-[0.18em] text-waldgruen/65">
          Brief-nach-Berlin · intern
        </p>
        <h1 className="mt-3 font-typewriter text-3xl font-bold text-waldgruen-dark">
          Interne Statistik
        </h1>
        {configured ? (
          <form action={unlockInternalStats} className="mt-6 grid gap-4">
            <label htmlFor="stats-password" className="font-body text-sm text-warmgrau/75">
              Passwort für die Demo-Ansicht
            </label>
            <input
              id="stats-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-md border border-warmgrau/20 bg-white px-3 py-2 font-body text-warmgrau outline-none focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20"
            />
            {error && <p className="font-body text-sm text-airmail-rot">Das Passwort stimmt nicht.</p>}
            <button
              type="submit"
              className="rounded-md bg-waldgruen-dark px-4 py-2.5 font-body font-semibold text-creme transition-colors hover:bg-waldgruen"
            >
              Statistik öffnen
            </button>
          </form>
        ) : (
          <p className="mt-4 font-body leading-relaxed text-warmgrau/70">
            Der interne Zugang ist noch nicht konfiguriert.
          </p>
        )}
      </section>
    </main>
  );
}

type InternalStatsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InternalStatsPage({ searchParams }: InternalStatsPageProps) {
  const configuredPassword = process.env.INTERNAL_STATS_PASSWORD;
  const cookieValue = (await cookies()).get(INTERNAL_STATS_COOKIE)?.value;
  if (!isInternalStatsCookieValid(cookieValue, configuredPassword)) {
    const params = await searchParams;
    return <StatsLogin configured={Boolean(configuredPassword)} error={params?.error === "1"} />;
  }

  const params = (await searchParams) ?? {};
  const { filter, mode } = parseStatsFilter(params);
  const query = statsQueryFromFilter(filter, mode);
  const kampagneRaw = query.kampagne;

  let stats: InternalStats;
  let baseline: InternalStats | null;
  try {
    ({ stats, baseline } = await getInternalStatsWithBaseline(filter));
  } catch (error) {
    console.error("[internal-stats] read failed", error);
    return <DataError />;
  }
  const chips = activeFilterChips(query, stats.campaignLabels);
  const campaignSignalCounts = stats.letterSignals.sourceCounts.campaign;
  const hasCampaignSignals = Object.keys(campaignSignalCounts).length > 0;
  const activation = stats.politicalActivation;
  const hasActivationCrossData = Object.values(
    activation.efficacyByPowerlessness,
  ).some((item) => item.answered > 0);

  const campaignSlugs = new Set<string>([
    ...Object.keys(stats.letterSignals.sourceCounts.campaign),
    ...Object.keys(stats.reviewSourceCounts.campaign),
  ]);
  const campaignOptions = [...campaignSlugs]
    .sort()
    .map((slug) => ({ slug, label: stats.campaignLabels[slug] ?? slug }));

  const signalCampaignTotal = campaignSourceTotal(stats.letterSignals.sourceCounts);
  const signalCampaignShare =
    stats.letterSignals.signalCount > 0
      ? signalCampaignTotal / stats.letterSignals.signalCount
      : 0;
  const dominantCampaign = topCampaignSlug(stats.letterSignals.sourceCounts);

  const granularity = granularityForTimeRange(
    filter.timeRange,
    daySpan(stats.oldestReviewAt, stats.newestReviewAt),
  );
  const granularityLabel =
    granularity === "day" ? "pro Tag" : granularity === "week" ? "pro Kalenderwoche" : "pro Monat";
  const fromDay = timeRangeFromDay(stats.fetchedAt, filter.timeRange);

  const counterTimeline = bucketCounterTimeline(stats.letterCounterDayRange, granularity, fromDay);
  const counterPoints: ColumnPoint[] = counterTimeline.map((point) => ({
    key: point.key,
    label: point.label,
    count: point.count,
    partial: point.partial,
    detail: `Zählerstand ${formatNumber(point.counterEnd)}`,
  }));
  const counterPeak = peakPoint(counterTimeline.filter((point) => !point.partial));
  const lettersInCounterPeriod = counterTimeline.reduce((sum, point) => sum + point.count, 0);
  const counterDays = Object.keys(stats.letterCounterDayRange).sort();
  const counterSinceLabel = counterDays[0] ? formatDate(counterDays[0]) : null;
  const signalCoverage =
    filter.source.kind === "all" && lettersInCounterPeriod > 0
      ? Math.min(100, (stats.letterSignals.numberedSignalCount / lettersInCounterPeriod) * 100)
      : null;

  const signalTimeline: ColumnPoint[] = bucketTimeline(
    stats.letterSignals.signalTimelineDayCounts,
    granularity,
  );
  const reviewTimeline: ColumnPoint[] = bucketTimeline(
    stats.reviewTimelineDayCounts,
    granularity,
  );
  const signalPeak = peakPoint(signalTimeline);

  const heatmapGranularity = granularity === "day" ? "week" : granularity;
  const heatmapGranularityLabel =
    heatmapGranularity === "week" ? "pro Kalenderwoche" : "pro Monat";
  const topicHeatmap = bucketCategoryTimeline(
    stats.letterSignals.categoryTimelineDayCounts,
    heatmapGranularity,
  );
  const subtopicClusters = topLabelsByCategory(
    stats.letterSignals.labelsByCategory,
    stats.letterSignals.categoryCounts,
  );
  const topCategory = Object.entries(stats.letterSignals.categoryCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const rangeLabel =
    filter.timeRange === "all"
      ? "Gesamtzeitraum"
      : `letzte ${String(filter.timeRange)} Tage`;

  const sourceLabel = [
    filter.source.kind === "free"
      ? "freie Anliegen"
      : filter.source.kind === "campaign"
        ? `Kampagne: ${stats.campaignLabels[kampagneRaw ?? ""] ?? kampagneRaw ?? "alle"}`
        : "alle Quellen",
    filter.bundesland ? bundeslandName(filter.bundesland) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const se = activation.selfEfficacyDistribution;
  const sePositive = (se.clearly_yes ?? 0) + (se.rather_yes ?? 0);
  const seNegative = (se.rather_no ?? 0) + (se.no ?? 0);
  const seUnsure = se.unsure ?? 0;

  const quoteLines: string[] = [
    `Stand ${formatDate(stats.fetchedAt)}: ${formatNumber(stats.letterCount)} Briefe wurden über Brief-nach-Berlin erstellt.`,
  ];
  if (stats.knownSendCount > 0) {
    quoteLines.push(
      `${formatDecimal(stats.sendRatePercent)} % der Nutzer:innen, die die Versandfrage beantwortet haben, geben an, den Brief verschickt zu haben oder ihn unmittelbar zu verschicken (${formatNumber(stats.sentCount)} von ${formatNumber(stats.knownSendCount)}).`,
    );
  }
  if (stats.reviewCount > 0) {
    quoteLines.push(
      `Die generierten Briefe werden im Schnitt mit ${formatDecimal(stats.averageRating)} von 5 Sternen bewertet (${formatNumber(stats.reviewCount)} Bewertungen).`,
    );
  }
  if (topCategory && stats.letterSignals.signalCount > 0) {
    quoteLines.push(
      `Häufigstes Thema: ${topicCategoryLabel(topCategory[0])} mit ${shareParts(topCategory[1], stats.letterSignals.signalCount).shareText} % der ${formatNumber(stats.letterSignals.signalCount)} freiwillig geteilten Themensignale.`,
    );
  }
  if (activation.selfEfficacyDirectionalCount > 0) {
    quoteLines.push(
      `${formatDecimal(activation.selfEfficacyPositiveRatePercent)} % der Antwortenden fühlen sich durch den Brief eher in der Lage, sich politisch einzubringen (${formatNumber(activation.selfEfficacyPositiveCount)} von ${formatNumber(activation.selfEfficacyDirectionalCount)} gerichteten Antworten).`,
    );
  }
  if (counterPeak) {
    quoteLines.push(
      `Stärkster Abschnitt (${granularityLabel.replace("pro ", "")}): ${counterPeak.label} mit ${formatNumber(counterPeak.count)} Briefen.`,
    );
  }
  const quoteText = `${quoteLines.join("\n")}\n\nQuelle: Brief-nach-Berlin, interne Auswertung (${rangeLabel}, ${sourceLabel}). Selbstauskünfte, nur Aggregate.`;

  return (
    <main id="top" className="min-h-screen bg-creme text-warmgrau">
      <AirmailStripe />
      <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-10 lg:px-10">
        <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
          <div>
            <div className="flex items-center gap-2 font-typewriter text-[11px] font-bold uppercase tracking-[0.18em] text-waldgruen/65">
              <span className="h-2 w-2 rounded-full bg-waldgruen" />
              Brief-nach-Berlin · intern
            </div>
            <h1 className="mt-3 max-w-2xl font-typewriter text-3xl font-bold leading-[1.02] tracking-tight text-waldgruen-dark sm:text-5xl lg:text-6xl">
              Nutzung, Qualität und Selbstauskunft.
            </h1>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-warmgrau/70 sm:text-lg">
              Aggregierte Produktdaten für Gespräche mit Organisationen, Medien und
              Multiplikator:innen. Alle Werte sind Selbstauskünfte und Aggregate.
            </p>
          </div>
          <div className="flex items-baseline gap-3 font-typewriter text-xs leading-relaxed text-warmgrau/55 sm:flex-col sm:items-end sm:gap-0 sm:text-right">
            <p>Live aus Supabase · {formatDateTime(stats.fetchedAt)}</p>
            <form action={lockInternalStats} className="sm:mt-2">
              <button type="submit" className="underline underline-offset-2 hover:text-waldgruen-dark">
                Zugang sperren
              </button>
            </form>
          </div>
        </header>

        <SectionNav links={[...SECTION_LINKS]} />

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-warmgrau/10 bg-white/60 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <FilterBar query={query} campaignOptions={campaignOptions} />
          <div className="sm:pb-1">
            <ViewToggle mode={mode} query={query} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 font-typewriter text-xs text-warmgrau/55">
          {chips.length === 0 ? (
            <span>Ansicht: {rangeLabel} · alle Quellen · alle Bundesländer</span>
          ) : (
            <>
              <span>Aktiv:</span>
              {chips.map((chip) => (
                <Link
                  key={chip.key}
                  href={chip.href}
                  scroll={false}
                  className="inline-flex items-center gap-1.5 rounded-full border border-waldgruen-dark/20 bg-waldgruen-dark px-2.5 py-1 font-bold text-creme transition-colors hover:bg-waldgruen"
                  title={`Filter „${chip.label}“ entfernen`}
                >
                  {chip.label}
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">entfernen</span>
                </Link>
              ))}
              <Link
                href={buildStatsHref(query, { zeitraum: null, quelle: null, kampagne: null, bundesland: null })}
                scroll={false}
                className="underline underline-offset-2 hover:text-waldgruen-dark"
              >
                alle zurücksetzen
              </Link>
            </>
          )}
          <span className="ml-auto">
            {mode === "prozentual" ? "prozentual" : "absolut"} · {granularityLabel}
          </span>
        </div>
        {baseline && (
          <p className="mt-2 font-body text-xs leading-relaxed text-warmgrau/60">
            <span className="mr-1.5 inline-block h-3 w-[2px] translate-y-[2px] rounded-full bg-warmgrau/70" aria-hidden="true" />
            Grauer Strich und „Gesamt“ zeigen denselben Wert ohne Quellen- und Bundesland-Filter im gleichen Zeitraum.
          </p>
        )}

        <div id="ueberblick" className="scroll-mt-16">
          <CoreValues stats={stats} mode={mode} activation={activation} baseline={baseline} />

          <div className="mt-4 rounded-2xl border border-waldgruen/15 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-typewriter text-[11px] font-bold uppercase tracking-[0.18em] text-waldgruen/65">
                  Zahlen zum Zitieren
                </p>
                <p className="mt-1 font-body text-xs leading-relaxed text-warmgrau/60">
                  Fertige Sätze für Presseanfragen und Posts · Filter werden übernommen · Quelle hängt am Ende dran
                </p>
              </div>
              <CopyButton text={quoteText} label="Alle kopieren" />
            </div>
            <ol className="mt-4 grid gap-2">
              {quoteLines.map((line) => (
                <li
                  key={line}
                  className="rounded-lg border border-warmgrau/10 bg-creme/60 px-4 py-2.5 font-body text-sm leading-relaxed text-waldgruen-dark"
                >
                  {line}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <Section id="verlauf">
          <SectionHeading
            eyebrow="Entwicklung im Zeitverlauf"
            title="Wann wurden Briefe geschrieben?"
            detail="Briefvolumen aus dem globalen Zähler, dazu freiwillige Themensignale und Reviews. Die Spitze ist rot markiert."
          />
          <SubHeading
            detail={`Seit dem ${counterSinceLabel ?? "Start der Briefnummer"} trägt jeder freigegebene Themenbeitrag die laufende Briefnummer. Aus der Differenz zwischen zwei Abschnitten ergibt sich das Volumen aller Briefe, nicht nur der Opt-ins. Der Quellenfilter wirkt hier nicht.`}
          >
            Brief-Erstellungen · {granularityLabel}
          </SubHeading>
          {counterPoints.length === 0 ? (
            <EmptyState>
              Noch keine Briefnummern im gewählten Zeitraum. Der Verlauf füllt sich automatisch, sobald Nutzer:innen nach dem Start der Briefnummer ihr Thema freigeben.
            </EmptyState>
          ) : (
            <>
              <ColumnChart
                data={counterPoints}
                unit="Briefe"
                axisLabel={granularity === "day" ? "Tag" : granularity === "week" ? "Kalenderwoche" : "Monat"}
                tableSummary="Briefe je Abschnitt als Tabelle"
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Briefe im Zeitraum" value={formatNumber(lettersInCounterPeriod)} />
                {counterPeak && (
                  <MiniStat label={`Spitze · ${counterPeak.label}`} value={`${formatNumber(counterPeak.count)} Briefe`} />
                )}
                {signalCoverage !== null && (
                  <MiniStat
                    label="Themensignal-Abdeckung"
                    value={`${formatDecimal(signalCoverage)} %`}
                    detail={`${formatNumber(stats.letterSignals.numberedSignalCount)} Signale mit Briefnummer`}
                  />
                )}
              </div>
              {counterTimeline.some((point) => point.partial) && (
                <p className="mt-3 font-body text-xs leading-relaxed text-warmgrau/55">
                  Der erste Abschnitt (blass) hat keinen Vorwert und zeigt nur eine Untergrenze.
                </p>
              )}
            </>
          )}

          <div className="mt-8 grid gap-8 border-t border-warmgrau/10 pt-6 lg:grid-cols-2 [&>*]:min-w-0">
            <div>
              <SubHeading detail="Nach Zeitpunkt der freiwilligen Einwilligung. Signale ohne generated_at bleiben enthalten.">
                Themensignale · {granularityLabel}
              </SubHeading>
              {signalTimeline.length === 0 ? (
                <EmptyState />
              ) : (
                <ColumnChart data={signalTimeline} unit="Signale" tableSummary="Signale als Tabelle" />
              )}
              {signalPeak && signalTimeline.length > 1 && (
                <p className="mt-2 font-typewriter text-[11px] text-warmgrau/55">
                  Spitze: {signalPeak.label} mit {formatNumber(signalPeak.count)} Signalen
                </p>
              )}
            </div>
            <div>
              <SubHeading detail="Nach Erstellung der Bewertung, Kurzbewertungen eingeschlossen.">
                Reviews · {granularityLabel}
              </SubHeading>
              {reviewTimeline.length === 0 ? (
                <EmptyState />
              ) : (
                <ColumnChart
                  data={reviewTimeline}
                  unit="Reviews"
                  color="#D4A017"
                  emphasisColor="#C1121F"
                  tableSummary="Reviews als Tabelle"
                />
              )}
            </div>
          </div>
          <BasisNote>
            Basis: {formatNumber(stats.letterSignals.signalCount)} Themensignale · {formatNumber(stats.reviewCount)} Reviews ·
            Briefnummern seit {counterSinceLabel ?? "—"} · Abschnitte ohne Beobachtung werden dem nächsten Abschnitt zugeschlagen
          </BasisNote>
        </Section>

        <Section id="themen" accent="rot">
          <SectionHeading
            eyebrow="Freiwillige Themensignale"
            title="Worüber wird geschrieben?"
            detail={`${formatNumber(stats.letterSignals.signalCount)} freigegebene Signale · keine Brieftexte oder Einzelzeilen · bis zu drei Oberkategorien je Brief, deshalb kann die Summe der Anteile über 100 % liegen`}
          />
          {signalCampaignShare > 0.5 && dominantCampaign && (
            <div className="mb-6 rounded-lg border border-bernstein/40 bg-bernstein/10 px-4 py-3">
              <p className="font-body text-sm leading-relaxed text-warmgrau">
                <strong>Achtung:</strong> {Math.round(signalCampaignShare * 100)} % der Themensignale stammen
                aus Kampagnen (dominant: {stats.campaignLabels[dominantCampaign.slug] ?? dominantCampaign.slug},{" "}
                {formatNumber(dominantCampaign.count)} Signale). Die Themenverteilung ist damit kein allgemeines
                Stimmungsbild.
              </p>
            </div>
          )}
          {stats.letterSignals.signalCount === 0 ? (
            <EmptyState>Es gibt noch keine freigegebenen Themensignale. Diese Übersicht füllt sich erst nach dem freiwilligen Opt-in.</EmptyState>
          ) : (
            <div className="grid gap-8 [&>*]:min-w-0">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] [&>*]:min-w-0">
                <div>
                  <SubHeading detail="Anteil an allen gefilterten Signalen.">Oberkategorien</SubHeading>
                  <RankedBars
                    values={stats.letterSignals.categoryCounts}
                    labels={topicCategoryLabel}
                    total={stats.letterSignals.signalCount}
                    mode={mode}
                    baseline={baseline?.letterSignals.categoryCounts}
                    baselineTotal={baseline?.letterSignals.signalCount}
                  />
                </div>
                <div>
                  <SubHeading detail="Die häufigsten neutralen Unterthemen je Oberkategorie. Zuordnung über die erste Oberkategorie eines Briefs.">
                    Unterthemen je Oberkategorie
                  </SubHeading>
                  <SubtopicClusters
                    clusters={subtopicClusters}
                    categoryLabel={topicCategoryLabel}
                    total={stats.letterSignals.signalCount}
                  />
                </div>
              </div>

              <div className="border-t border-warmgrau/10 pt-6">
                <SubHeading detail={`Signale je Oberkategorie und Abschnitt (${heatmapGranularityLabel}). Dunkler bedeutet mehr. Auf dem Handy horizontal wischen.`}>
                  Themen im Zeitverlauf
                </SubHeading>
                {topicHeatmap.rows.length === 0 ? (
                  <EmptyState />
                ) : (
                  <TopicHeatmap data={topicHeatmap} rowLabel={topicCategoryLabel} />
                )}
              </div>

              <div className="grid gap-8 border-t border-warmgrau/10 pt-6 sm:grid-cols-2 [&>*]:min-w-0">
                <div>
                  <SubHeading detail="Klick setzt den Bundesland-Filter für die ganze Seite.">Bundesländer</SubHeading>
                  <RankedBars
                    values={filter.bundesland && baseline ? baseline.letterSignals.bundeslandCounts : stats.letterSignals.bundeslandCounts}
                    labels={bundeslandName}
                    total={filter.bundesland && baseline ? baseline.letterSignals.signalCount : stats.letterSignals.signalCount}
                    mode={mode}
                    hrefFor={(key, isActive) => buildStatsHref(query, { bundesland: isActive ? null : key })}
                    activeKey={filter.bundesland}
                  />
                </div>
                <div className="grid content-start gap-8">
                  <div>
                    <SubHeading>Politische Ebene</SubHeading>
                    <RankedBars
                      values={stats.letterSignals.levelCounts}
                      total={stats.letterSignals.signalCount}
                      mode={mode}
                      baseline={baseline?.letterSignals.levelCounts}
                      baselineTotal={baseline?.letterSignals.signalCount}
                    />
                  </div>
                  {hasCampaignSignals && (
                    <div>
                      <SubHeading detail="Signale je Kampagne. Klick setzt den Kampagnen-Filter.">Kampagnen</SubHeading>
                      <RankedBars
                        values={campaignSignalCounts}
                        labels={(slug) => stats.campaignLabels[slug] ?? slug}
                        total={stats.letterSignals.signalCount}
                        mode={mode}
                        hrefFor={(slug, isActive) =>
                          buildStatsHref(query, isActive ? { quelle: null, kampagne: null } : { quelle: "campaign", kampagne: slug })
                        }
                        activeKey={kampagneRaw}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-warmgrau/10 pt-6">
                <Collapsible summary="PLZ-Regionen" detail="Zweistellige Postleitzahl-Regionen, höchstens zwölf.">
                  <div className="sm:max-w-md">
                    <RankedBars
                      values={stats.letterSignals.plzPrefixCounts}
                      labels={(key) => `${key} · Region`}
                      total={stats.letterSignals.signalCount}
                      mode={mode}
                      baseline={baseline?.letterSignals.plzPrefixCounts}
                      baselineTotal={baseline?.letterSignals.signalCount}
                    />
                  </div>
                </Collapsible>
              </div>

              <div className="border-t border-warmgrau/10 pt-6">
                <Collapsible
                  summary="Bewertung & Versandabsicht nach Oberkategorie"
                  detail="Nur Briefe mit verknüpftem Review. Bewertungen, beantwortete Versandfragen und fehlende Angaben getrennt."
                >
                {Object.keys(stats.letterSignals.reviewByCategory).length === 0 ? (
                  <EmptyState>Noch keine verknüpften Reviews mit diesen Signalen.</EmptyState>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {TOPIC_CATEGORY_CODES.filter((code) => stats.letterSignals.reviewByCategory[code]).map((code) => {
                      const item = stats.letterSignals.reviewByCategory[code];
                      const average = item.ratings ? (item.ratingSum / item.ratings).toFixed(1).replace(".", ",") : "—";
                      return (
                        <div key={code} className="rounded-lg border border-warmgrau/10 bg-creme/60 px-4 py-3">
                          <p className="font-body text-sm font-semibold text-waldgruen-dark">{topicCategoryLabel(code)}</p>
                          <p className="mt-1 font-typewriter text-xs text-warmgrau/60">
                            {item.reviews} Reviews · Ø {average} ({item.ratings} Bewertungen)
                          </p>
                          <p className="mt-0.5 font-typewriter text-[11px] leading-relaxed text-warmgrau/55">
                            Versandfrage: {item.sent} von {item.knownSent} positiv · {item.noAnswer} ohne Angabe
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
                </Collapsible>
              </div>
            </div>
          )}
          <BasisNote>
            Basis: {formatNumber(stats.letterSignals.signalCount)} Themensignale · {formatNumber(signalCampaignTotal)}{" "}
            aus Kampagnen · {formatNumber(stats.letterSignals.sourceCounts.free)} freie Anliegen · Erhebung ab{" "}
            {formatDate(stats.oldestReviewAt)}
          </BasisNote>
        </Section>

        <Section id="feedback">
          <SectionHeading
            eyebrow="Feedback & Versandsignal"
            title="Wie kommt der Brief an?"
            detail="Selbstauskunft aus dem Feedbackprozess. „Ja, geht raus“ umfasst bereits verschickte und unmittelbar geplante Briefe — es ist kein physischer Versandnachweis."
          />
          <SubHeading detail="Prozentwerte gelten relativ zu allen Bewertungen; die Brief-Erstellungen sind ein Gesamtzähler ohne Verlauf und daher nicht prozentual verrechenbar.">
            Vom Erstellen bis zum Versandsignal
          </SubHeading>
          <Funnel stats={stats} />

          <div className="mt-8 grid gap-8 border-t border-warmgrau/10 pt-6 lg:grid-cols-2 lg:gap-12">
            <div>
              <SubHeading>Bewertung ({formatDecimal(stats.averageRating)} / 5)</SubHeading>
              <RatingBars stats={stats} mode={mode} baseline={baseline} />
            </div>
            <div>
              <SubHeading>Versandsignal</SubHeading>
              <StatsPie stats={stats} mode={mode} />
              <p className="mt-4 font-typewriter text-xs leading-relaxed text-warmgrau/55">
                Positive Quote nur auf beantworteter Basis: {formatNumber(stats.sentCount)} von{" "}
                {formatNumber(stats.knownSendCount)} ({formatDecimal(stats.sendRatePercent)} %) —{" "}
                {formatNumber(stats.noAnswerCount)} ohne Angabe.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-warmgrau/10 pt-6">
            <SubHeading detail="Zwischen Briefbewertung und Versandabsicht zeigt sich ein Zusammenhang. Das ist eine Korrelation, kein Kausalitätsnachweis.">
              Qualität entscheidet mit
            </SubHeading>
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-warmgrau/55">
                  Versandabsicht nach Bewertung
                </p>
                <div className="mt-4 grid gap-5">
                  {ratingBands.map((band) => {
                    const values = sumRatingBreakdowns(stats, band.ratings);
                    const baselineValues = baseline ? sumRatingBreakdowns(baseline, band.ratings) : null;
                    return (
                      <div key={band.label}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-body text-sm font-semibold text-waldgruen-dark">
                            {band.label}
                            {isSmallBasis(values.known) && <BasisBadge />}
                          </span>
                          {values.known > 0 ? (
                            <ShareStat mode={mode} value={values.sent} total={values.known} />
                          ) : (
                            <span className="font-typewriter text-xs tabular-nums text-warmgrau/60">—</span>
                          )}
                        </div>
                        <BarTrack
                          value={values.ratePercent}
                          scale={100}
                          baseline={baselineValues && baselineValues.known > 0 ? baselineValues.ratePercent : null}
                          color={band.color}
                          height="md"
                        />
                        <p className="mt-1 font-typewriter text-[11px] text-warmgrau/55">
                          {values.known > 0
                            ? `${formatNumber(values.sent)} von ${formatNumber(values.known)} mit Angabe`
                            : "Keine beantworteten Versandfragen"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 lg:gap-7">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-warmgrau/55">
                    Das hilft beim Abschicken
                  </p>
                  <div className="mt-4">
                    <SignalList stats={stats} signals={positiveSignals} color="#2D6A4F" mode={mode} baseline={baseline} />
                  </div>
                </div>
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-warmgrau/55">
                    Das bremst
                  </p>
                  <div className="mt-4">
                    <SignalList stats={stats} signals={frictionSignals} color="#C1121F" mode={mode} baseline={baseline} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <BasisNote>
            Erhebungszeitraum: {formatDate(stats.oldestReviewAt)} bis {formatDate(stats.newestReviewAt)} · Basis:{" "}
            {formatNumber(stats.reviewCount)} Feedbackzeilen · {formatNumber(stats.knownSendCount)} beantwortete
            Versandfragen · {formatNumber(stats.noAnswerCount)} ohne Angabe · Feedback-Markierungen können sich überschneiden
          </BasisNote>
        </Section>

        <Section id="wirkung" accent="gruen">
          <SectionHeading
            eyebrow="Politische Selbstwirksamkeit"
            title="Vom Betroffensein ins Handeln"
            detail="Selbstauskunft direkt im Review. Die Werte zeigen ein wahrgenommenes Gefühl, keine tatsächlich beobachtete spätere Handlung."
          />
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <article>
              <SubHeading detail="„Fühlst du dich durch diesen Brief eher in der Lage, dich politisch einzubringen?“">
                Handlungsfähiger durch den Brief
              </SubHeading>
              {activation.selfEfficacyAnswerCount === 0 ? (
                <EmptyState>Noch keine Antworten zur politischen Handlungsfähigkeit.</EmptyState>
              ) : (
                <>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex-1">
                      <ValueEmphasis
                        mode={mode}
                        value={activation.selfEfficacyPositiveCount}
                        total={activation.selfEfficacyDirectionalCount}
                        unit="gerichtete Antworten"
                      />
                      <p className="mt-2 font-body text-xs leading-relaxed text-warmgrau/60">
                        „Ja, deutlich“ oder „Eher ja“ · „Unsicher“ bleibt in dieser Quote unberücksichtigt
                      </p>
                    </div>
                    <div className="grid min-w-40 gap-2 self-start">
                      <p className="flex items-baseline justify-between gap-3 rounded-md bg-creme/70 px-3 py-2 font-body text-sm text-waldgruen-dark">
                        Ja <span className="font-typewriter text-base font-bold tabular-nums">{formatNumber(sePositive)}</span>
                      </p>
                      <p className="flex items-baseline justify-between gap-3 rounded-md bg-creme/70 px-3 py-2 font-body text-sm text-waldgruen-dark">
                        Nein <span className="font-typewriter text-base font-bold tabular-nums">{formatNumber(seNegative)}</span>
                      </p>
                      <p className="flex items-baseline justify-between gap-3 rounded-md bg-creme/70 px-3 py-2 font-body text-sm text-waldgruen-dark">
                        Unsicher <span className="font-typewriter text-base font-bold tabular-nums">{formatNumber(seUnsure)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <SurveyDistributionBars
                      values={activation.selfEfficacyDistribution}
                      options={selfEfficacyOptions}
                      total={activation.selfEfficacyAnswerCount}
                      color="#2D6A4F"
                      mode={mode}
                      baselineValues={baseline?.politicalActivation.selfEfficacyDistribution}
                      baselineTotal={baseline?.politicalActivation.selfEfficacyAnswerCount}
                    />
                  </div>
                </>
              )}
              <BasisNote>
                Basis: {formatNumber(activation.selfEfficacyAnswerCount)} beantwortet ·{" "}
                {formatNumber(activation.selfEfficacyDirectionalCount)} gerichtet ·{" "}
                {formatNumber(activation.selfEfficacyNoAnswerCount)} vollständige Reviews ohne diese Frage
              </BasisNote>
            </article>

            <article>
              <SubHeading detail="Wie oft politische Inhalte beschäftigen, ohne dass ein konkreter nächster Schritt klar ist.">
                Politische Ohnmacht im Alltag
              </SubHeading>
              {activation.powerlessnessAnswerCount === 0 ? (
                <EmptyState>Noch keine freiwilligen Antworten zur politischen Ohnmacht.</EmptyState>
              ) : (
                <SurveyDistributionBars
                  values={activation.powerlessnessDistribution}
                  options={powerlessnessOptions}
                  total={activation.powerlessnessAnswerCount}
                  color="#C58B18"
                  mode={mode}
                  baselineValues={baseline?.politicalActivation.powerlessnessDistribution}
                  baselineTotal={baseline?.politicalActivation.powerlessnessAnswerCount}
                />
              )}
              <BasisNote>
                Basis: {formatNumber(activation.powerlessnessAnswerCount)} freiwillig beantwortet ·{" "}
                {formatNumber(activation.powerlessnessNoAnswerCount)} vollständige Reviews ohne Angabe
              </BasisNote>
            </article>
          </div>

          <div className="mt-8 border-t border-warmgrau/10 pt-6">
            <SubHeading detail="Nur Reviews mit Antworten auf beide Fragen. „Kann ich noch nicht sagen“ bleibt sichtbar, zählt aber nicht in die positive Quote.">
              Positive Selbstauskunft nach berichteter Ohnmachtsfrequenz
            </SubHeading>
            {!hasActivationCrossData ? (
              <EmptyState>Noch keine gemeinsam auswertbaren Antworten.</EmptyState>
            ) : (
              <div className="grid gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
                {POLITICAL_POWERLESSNESS_FREQUENCY_VALUES.map((frequency) => {
                  const item = activation.efficacyByPowerlessness[frequency];
                  return (
                    <div
                      key={frequency}
                      className="rounded-lg border border-warmgrau/10 bg-creme/60 px-4 py-4"
                    >
                      <p className="font-body text-sm font-semibold text-waldgruen-dark">
                        {POLITICAL_POWERLESSNESS_FREQUENCY_LABELS[frequency]}
                      </p>
                      {item.directional > 0 ? (
                        <p className="mt-2 font-typewriter text-2xl font-bold tabular-nums text-waldgruen-dark">
                          {(mode === "prozentual" ? `${formatDecimal(item.positiveRatePercent)} %` : formatNumber(item.positive))}
                        </p>
                      ) : (
                        <p className="mt-2 font-typewriter text-2xl font-bold tabular-nums text-warmgrau/40">—</p>
                      )}
                      <p className="mt-1 font-typewriter text-[11px] leading-relaxed text-warmgrau/55">
                        {formatNumber(item.positive)} von {formatNumber(item.directional)} gerichtet
                        {item.directional > 0 && ` (${formatDecimal(item.positiveRatePercent)} %)`} ·{" "}
                        {formatNumber(item.unsure)} unsicher
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Section>

        <Section id="definitionen">
          <SectionHeading
            eyebrow="Datenqualität & Definitionen"
            title="Worauf sich die Zahlen beziehen"
            detail="Einheitliche Basis für die Einordnung der Werte auf dieser Seite."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Definition
              title="Erhebungszeitraum"
              body={`${formatDate(stats.oldestReviewAt)} bis ${formatDate(stats.newestReviewAt)} · ${rangeLabel} · ${sourceLabel}. Abruf: ${formatDateTime(stats.fetchedAt)}.`}
            />
            <Definition
              title="Brief-Erstellungen im Verlauf"
              body={`Jeder freigegebene Themenbeitrag speichert seit dem ${counterSinceLabel ?? "Start der Briefnummer"} die laufende Briefnummer. Die Differenz der höchsten Nummern zweier Abschnitte ergibt das Volumen aller Briefe dazwischen. Abschnitte ohne Beitrag fallen weg und werden dem nächsten zugeschlagen.`}
            />
            <Definition
              title="„Ja, geht raus“"
              body="Umfasst bereits verschickte und unmittelbar geplante Briefe. Es ist eine Selbstauskunft, kein physischer Versandnachweis."
            />
            <Definition
              title="Themensignale"
              body={`${formatNumber(stats.letterSignals.signalCount)} freigegebene Signale nach freiwilliger Einwilligung · bis zu drei Oberkategorien und drei Unterthemen je Brief · Unterthemen werden der ersten Oberkategorie zugeordnet.`}
            />
            <Definition
              title="Filter & Vergleich"
              body="Bundesland- und Quellenfilter wirken auf Signale und auf Reviews mit verknüpftem Signal; Reviews ohne Signal fallen bei aktivem Bundesland-Filter heraus. Die Vergleichsmarke zeigt denselben Wert ohne diese Filter im gleichen Zeitraum."
            />
            <Definition
              title="Quellen"
              body={`In Reviews ohne verknüpfte Signal-Zeile fehlt die Kampagnen-Zuordnung (Bucket „ohne Signal“): ${formatNumber(stats.reviewSourceCounts.unknown)} Reviews.`}
            />
            <Definition
              title="Kleine Basen"
              body="Werte mit weniger als 10 Beobachtungen sind markiert und werden nicht als belastbarer Haupterfolg hervorgehoben."
            />
            <Definition
              title="Datenschutz"
              body="Nur Aggregate · keine Brieftexte · keine E-Mail-Adressen · keine Einzelzeilen · keine vollständigen PLZ. Seite ist passwortgeschützt und für Suchmaschinen gesperrt (noindex)."
            />
          </div>
        </Section>

        <footer className="mt-8 grid gap-3 border-t border-warmgrau/10 pt-6 font-typewriter text-xs leading-relaxed text-warmgrau/55 sm:grid-cols-2">
          <p>
            Erhebungszeitraum: {formatDate(stats.oldestReviewAt)} bis {formatDate(stats.newestReviewAt)} ·{" "}
            {rangeLabel} · {sourceLabel}
          </p>
          <p className="sm:text-right">
            Nur Aggregate · keine Anliegen · keine E-Mail-Adressen · keine Einzelzeilen
          </p>
        </footer>
      </div>
    </main>
  );
}

function MiniStat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-warmgrau/10 bg-creme/60 px-4 py-3">
      <p className="font-typewriter text-[11px] font-bold uppercase tracking-[0.12em] text-warmgrau/55">{label}</p>
      <p className="mt-1 font-typewriter text-xl font-bold tabular-nums text-waldgruen-dark">{value}</p>
      {detail && <p className="mt-0.5 font-body text-xs text-warmgrau/55">{detail}</p>}
    </div>
  );
}

function Definition({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-warmgrau/10 bg-creme/60 px-4 py-3">
      <p className="font-body text-sm font-semibold text-waldgruen-dark">{title}</p>
      <p className="mt-1 font-body text-xs leading-relaxed text-warmgrau/60">{body}</p>
    </div>
  );
}

