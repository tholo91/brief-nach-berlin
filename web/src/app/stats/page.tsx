import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { StatsPie } from "@/components/internalStats/StatsPie";
import { FilterBar } from "@/components/internalStats/FilterBar";
import { ValueEmphasis } from "@/components/internalStats/ValueEmphasis";
import {
  TimelineBars,
  type TimelinePoint,
} from "@/components/internalStats/TimelineBars";
import { formatDecimal, formatNumber } from "@/lib/formatNumber";
import { lockInternalStats, unlockInternalStats } from "@/lib/internalStats/actions";
import {
  INTERNAL_STATS_COOKIE,
  isInternalStatsCookieValid,
} from "@/lib/internalStats/access";
import { getInternalStats } from "@/lib/internalStats/getInternalStats";
import {
  campaignSourceTotal,
  topCampaignSlug,
  type InternalStats,
  type SendBreakdown,
  topicCategoryLabel,
} from "@/lib/internalStats/aggregate";
import {
  bucketTimeline,
  granularityForTimeRange,
  isSmallBasis,
  parseStatsFilter,
  shareParts,
  VIEW_MODES,
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
}: {
  eyebrow: string;
  value: ReactNode;
  label: string;
  tone?: "light" | "green";
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
      <p className="mt-3 font-typewriter text-4xl font-bold tabular-nums sm:text-5xl">
        {value}
      </p>
      <p
        className={`mt-2 font-body text-sm leading-relaxed ${
          tone === "green" ? "text-creme/75" : "text-warmgrau/70"
        }`}
      >
        {label}
      </p>
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

function ViewToggle({
  mode,
  zeitraum,
  quelle,
  kampagne,
}: {
  mode: ViewMode;
  zeitraum: string;
  quelle: string;
  kampagne: string | null;
}) {
  const hrefFor = (next: ViewMode) => {
    const params = new URLSearchParams();
    if (zeitraum !== "all") params.set("zeitraum", zeitraum);
    if (quelle !== "all") {
      params.set("quelle", quelle);
      if (quelle === "campaign" && kampagne) params.set("kampagne", kampagne);
    }
    if (next === "absolut") params.set("ansicht", next);
    const qs = params.toString();
    return `/stats${qs ? `?${qs}` : ""}`;
  };
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
}: {
  values: Record<string, number>;
  labels?: (key: string) => string;
  total?: number;
  mode?: ViewMode;
  smallBasis?: boolean;
}) {
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const max = entries[0]?.[1] ?? 0;
  if (!entries.length) return <EmptyState />;
  return (
    <div className="grid gap-3">
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-body text-sm font-semibold text-waldgruen-dark">
              {labels?.(key) ?? key}
              {smallBasis && isSmallBasis(value) && <BasisBadge />}
            </span>
            {total !== undefined && mode ? (
              <ShareStat mode={mode} value={value} total={total} />
            ) : (
              <span className="font-typewriter text-xs tabular-nums text-warmgrau/60">
                {formatNumber(value)}
              </span>
            )}
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-warmgrau/10">
            <div
              className="h-full rounded-full bg-airmail-rot"
              style={{ width: `${max ? (value / max) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RatingBars({ stats, mode }: { stats: InternalStats; mode: ViewMode }) {
  return (
    <div className="grid gap-3">
      {([5, 4, 3, 2, 1] as const).map((rating) => {
        const count = stats.ratingDistribution[rating];
        const share = stats.reviewCount > 0 ? (count / stats.reviewCount) * 100 : 0;
        return (
          <div key={rating} className="grid grid-cols-[42px_1fr_max-content] items-center gap-3">
            <span className="font-typewriter text-sm text-warmgrau/70">{rating} ★</span>
            <div className="h-2 overflow-hidden rounded-full bg-warmgrau/10">
              <div className="h-full rounded-full bg-bernstein" style={{ width: `${share}%` }} />
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
}: {
  values: Record<string, number>;
  options: readonly { key: string; label: string }[];
  total: number;
  color: string;
  mode: ViewMode;
}) {
  return (
    <div className="grid gap-3">
      {options.map(({ key, label }) => {
        const count = values[key] ?? 0;
        const share = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-body text-sm font-semibold text-waldgruen-dark">
                {label}
                {isSmallBasis(count) && <BasisBadge />}
              </span>
              <ShareStat mode={mode} value={count} total={total} />
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-warmgrau/10">
              <div
                className="h-full rounded-full"
                style={{ backgroundColor: color, width: `${share}%` }}
              />
            </div>
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
}: {
  stats: InternalStats;
  signals: readonly { key: string; label: string }[];
  color: string;
  mode: ViewMode;
}) {
  return (
    <div className="grid gap-4">
      {signals.map((signal) => {
        const values = stats.feedbackTagStats[signal.key];
        if (!values || values.total === 0) return null;
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
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-warmgrau/10">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: color,
                  width: `${values.known > 0 ? (values.sent / values.known) * 100 : 0}%`,
                }}
              />
            </div>
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

function CoreValues({
  stats,
  mode,
  activation,
}: {
  stats: InternalStats;
  mode: ViewMode;
  activation: InternalStats["politicalActivation"];
}) {
  const efficacyDirectional = activation.selfEfficacyDirectionalCount;
  const efficacyPositive = activation.selfEfficacyPositiveCount;
  const efficacyUnsure =
    activation.selfEfficacyAnswerCount - activation.selfEfficacyDirectionalCount;

  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        eyebrow="Brief-Erstellungen"
        value={formatNumber(stats.letterCount)}
        label="gezählte Briefe seit Produktstart · kein 30-/90-Tage-Verlauf verfügbar"
      />
      <StatCard
        eyebrow="Durchschnittliche Bewertung"
        value={`${formatDecimal(stats.averageRating)} / 5`}
        label={`${formatNumber(stats.reviewCount)} Bewertungen im gewählten Zeitraum`}
      />
      <StatCard
        eyebrow="Versandsignal aus dem Feedback"
        tone="green"
        value={
          <ValueEmphasis
            mode={mode}
            value={stats.sentCount}
            total={stats.knownSendCount}
            unit="beantwortete Versandfragen"
          />
        }
        label={`„Ja, geht raus\" umfasst verschickt und unmittelbar geplanten Versand · fehlende Angabe: ${formatNumber(stats.noAnswerCount)}`}
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
      />
    </section>
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
    { label: "Vollständiges Feedback", value: stats.fullFeedbackCount },
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
  const zeitraumRaw = filter.timeRange === "all" ? "all" : String(filter.timeRange);
  const quelleRaw =
    filter.source.kind === "free"
      ? "free"
      : filter.source.kind === "campaign"
        ? "campaign"
        : "all";
  const kampagneRaw =
    filter.source.kind === "campaign" && filter.source.campaignSlug
      ? filter.source.campaignSlug
      : null;

  let stats: InternalStats;
  try {
    stats = await getInternalStats(filter);
  } catch (error) {
    console.error("[internal-stats] read failed", error);
    return <DataError />;
  }
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

  const granularity = granularityForTimeRange(filter.timeRange);
  const signalTimeline: TimelinePoint[] = bucketTimeline(
    stats.letterSignals.signalTimelineDayCounts,
    granularity,
  );
  const reviewTimeline: TimelinePoint[] = bucketTimeline(
    stats.reviewTimelineDayCounts,
    granularity,
  );

  const rangeLabel =
    filter.timeRange === "all"
      ? "Gesamtzeitraum"
      : `letzte ${String(filter.timeRange)} Tage`;

  const sourceLabel =
    filter.source.kind === "free"
      ? "freie Anliegen"
      : filter.source.kind === "campaign"
        ? `Kampagne: ${stats.campaignLabels[kampagneRaw ?? ""] ?? kampagneRaw ?? "alle"}`
        : "alle Quellen";

  const se = activation.selfEfficacyDistribution;
  const sePositive = (se.clearly_yes ?? 0) + (se.rather_yes ?? 0);
  const seNegative = (se.rather_no ?? 0) + (se.no ?? 0);
  const seUnsure = se.unsure ?? 0;

  return (
    <main className="min-h-screen overflow-hidden bg-creme text-warmgrau">
      <AirmailStripe />
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-warmgrau/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-typewriter text-[11px] font-bold uppercase tracking-[0.18em] text-waldgruen/65">
              <span className="h-2 w-2 rounded-full bg-waldgruen" />
              Brief-nach-Berlin · intern
            </div>
            <h1 className="mt-4 max-w-2xl font-typewriter text-4xl font-bold leading-[0.98] tracking-tight text-waldgruen-dark sm:text-6xl">
              Nutzung, Qualität und Selbstauskunft.
            </h1>
            <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-warmgrau/70 sm:text-lg">
              Aggregierte Produktdaten für Gespräche mit Organisationen, Medien und
              Multiplikator:innen. Alle Werte sind Selbstauskünfte und Aggregate.
            </p>
          </div>
          <div className="font-typewriter text-xs leading-relaxed text-warmgrau/55 sm:text-right">
            <p>Live aus Supabase</p>
            <p>Abgerufen: {formatDateTime(stats.fetchedAt)}</p>
            <form action={lockInternalStats} className="mt-2">
              <button type="submit" className="underline underline-offset-2 hover:text-waldgruen-dark">
                Zugang sperren
              </button>
            </form>
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-warmgrau/10 bg-white/60 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <FilterBar
            zeitraum={zeitraumRaw}
            quelle={quelleRaw}
            kampagne={kampagneRaw}
            campaignOptions={campaignOptions}
          />
          <div className="sm:pb-1">
            <ViewToggle
              mode={mode}
              zeitraum={zeitraumRaw}
              quelle={quelleRaw}
              kampagne={kampagneRaw}
            />
          </div>
        </div>

        <p className="mt-4 font-typewriter text-xs text-warmgrau/55">
          Ansicht: {rangeLabel} · {sourceLabel} · {mode === "prozentual" ? "prozentual" : "absolut"}
        </p>

        <CoreValues stats={stats} mode={mode} activation={activation} />

        <section className="mt-10 rounded-2xl border border-warmgrau/10 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
          <SectionHeading
            eyebrow="Der Weg zum versendeten Brief"
            title="Vom Erstellen bis zum Versandsignal"
            detail="Funnel auf Basis der gefilterten Bewertungen. Prozentwerte gelten jeweils relativ zu allen Bewertungen; die Brief-Erstellungen sind ein Gesamtzähler ohne Verlauf und daher nicht prozentual verrechenbar."
          />
          <Funnel stats={stats} />
          <BasisNote>
            Erhebungszeitraum: {formatDate(stats.oldestReviewAt)} bis {formatDate(stats.newestReviewAt)} ·
            Basis: {formatNumber(stats.reviewCount)} Reviews · {formatNumber(stats.knownSendCount)} beantwortete
            Versandfragen · {formatNumber(stats.noAnswerCount)} ohne Angabe
          </BasisNote>
        </section>

        <section className="mt-10 rounded-2xl border border-warmgrau/10 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
          <SectionHeading
            eyebrow="Entwicklung im Zeitverlauf"
            title="Wann kommen die Signale?"
            detail="Themensignale nach freiwilliger Einwilligung (created_at), Reviews nach Erstellung. Signale ohne generated_at werden hier nicht ausgeblendet."
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                Themensignale · {rangeLabel.toLowerCase()}
              </h3>
              <TimelineBars data={signalTimeline} />
            </div>
            <div>
              <h3 className="mb-3 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                Reviews · {rangeLabel.toLowerCase()}
              </h3>
              <TimelineBars data={reviewTimeline} />
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-airmail-rot/15 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
          <SectionHeading
            eyebrow="Freiwillige Themensignale"
            title="Themen und politische Ebene"
            detail={`${formatNumber(stats.letterSignals.signalCount)} erfolgreich erzeugte Signale · keine Brieftexte oder Einzelzeilen · Mehrfachzuordnungen möglich, deshalb kann die Summe der Anteile über 100 % liegen`}
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
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Oberkategorien</h3>
                <RankedBars values={stats.letterSignals.categoryCounts} labels={topicCategoryLabel} total={stats.letterSignals.signalCount} mode={mode} />
              </div>
              <div>
                <h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Unterthemen</h3>
                <RankedBars values={stats.letterSignals.labelCounts} total={stats.letterSignals.signalCount} mode={mode} />
              </div>
              <div>
                <h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Politische Ebene</h3>
                <RankedBars values={stats.letterSignals.levelCounts} total={stats.letterSignals.signalCount} mode={mode} />
              </div>
              <div>
                <h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Bundesländer</h3>
                <RankedBars values={stats.letterSignals.bundeslandCounts} labels={bundeslandLabel} total={stats.letterSignals.signalCount} mode={mode} />
              </div>
              <div>
                <h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">PLZ-Regionen</h3>
                <RankedBars values={stats.letterSignals.plzPrefixCounts} labels={(key) => `${key} · Region`} total={stats.letterSignals.signalCount} mode={mode} />
              </div>
              <div className="lg:col-span-2">
                <h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Bewertung & Versandabsicht nach Oberkategorie</h3>
                {Object.keys(stats.letterSignals.reviewByCategory).length === 0 ? (
                  <EmptyState>Noch keine verknüpften Reviews mit diesen Signalen.</EmptyState>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {TOPIC_CATEGORY_CODES.filter((code) => stats.letterSignals.reviewByCategory[code]).map((code) => {
                      const item = stats.letterSignals.reviewByCategory[code];
                      const average = item.ratings ? (item.ratingSum / item.ratings).toFixed(1).replace(".", ",") : "—";
                      return (
                        <div key={code} className="rounded-lg border border-warmgrau/10 bg-creme/60 px-4 py-3">
                          <p className="font-body text-sm font-semibold text-waldgruen-dark">{topicCategoryLabel(code)}</p>
                          <p className="mt-1 font-typewriter text-xs text-warmgrau/60">
                            {item.reviews} Reviews verknüpft · {item.ratings} Bewertungen · Ø {average}
                          </p>
                          <p className="mt-0.5 font-typewriter text-[11px] leading-relaxed text-warmgrau/55">
                            Versandfrage: {item.knownSent} beantwortet ({item.sent} positiv) · {item.noAnswer} ohne Angabe
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <BasisNote>
            Basis: {formatNumber(stats.letterSignals.signalCount)} Themensignale · {formatNumber(signalCampaignTotal)}{" "}
            aus Kampagnen · {formatNumber(stats.letterSignals.sourceCounts.free)} freie Anliegen · Erhebung ab{" "}
            {formatDate(stats.oldestReviewAt)}
          </BasisNote>
        </section>

        <section className="mt-10 rounded-2xl border border-warmgrau/10 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
          <SectionHeading
            eyebrow="Bewertung & Versandsignal"
            title="Wie kommt der Brief an?"
            detail="Selbstauskunft aus dem Feedbackprozess. „Ja, geht raus“ umfasst bereits verschickte und unmittelbar geplante Briefe — es ist kein physischer Versandnachweis."
          />
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                Bewertung ({formatDecimal(stats.averageRating)} / 5)
              </h3>
              <div className="mt-5">
                <RatingBars stats={stats} mode={mode} />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-warmgrau/10 pt-5">
                <div>
                  <p className="font-typewriter text-2xl font-bold tabular-nums text-waldgruen-dark">{formatNumber(stats.fullFeedbackCount)}</p>
                  <p className="mt-1 font-body text-xs text-warmgrau/60">vollständig ausgefüllt</p>
                </div>
                <div>
                  <p className="font-typewriter text-2xl font-bold tabular-nums text-waldgruen-dark">{formatNumber(stats.knownSendCount)}</p>
                  <p className="mt-1 font-body text-xs text-warmgrau/60">Versandfrage beantwortet</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                Versandsignal
              </h3>
              <div className="mt-5">
                <StatsPie stats={stats} mode={mode} />
              </div>
              <p className="mt-4 font-typewriter text-xs leading-relaxed text-warmgrau/55">
                Positive Quote nur auf beantworteter Basis: {formatNumber(stats.sentCount)} von{" "}
                {formatNumber(stats.knownSendCount)} ({formatDecimal(stats.sendRatePercent)} %) —{" "}
                {formatNumber(stats.noAnswerCount)} ohne Angabe.
              </p>
            </div>
          </div>
          <BasisNote>
            Erhebungszeitraum: {formatDate(stats.oldestReviewAt)} bis {formatDate(stats.newestReviewAt)} · Basis:{" "}
            {formatNumber(stats.reviewCount)} Feedbackzeilen · {formatNumber(stats.knownSendCount)} beantwortete
            Versandfragen · {formatNumber(stats.noAnswerCount)} ohne Angabe
          </BasisNote>
        </section>

        <section className="mt-10 rounded-2xl border border-warmgrau/10 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
          <SectionHeading
            eyebrow="Was wir lernen"
            title="Qualität entscheidet mit"
            detail="Zwischen Briefbewertung und Versandabsicht zeigt sich ein Zusammenhang. Das ist eine Korrelation, kein Kausalitätsnachweis."
          />
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                Versandabsicht nach Bewertung
              </h3>
              <div className="mt-5 grid gap-5">
                {ratingBands.map((band) => {
                  const values = sumRatingBreakdowns(stats, band.ratings);
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
                      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-warmgrau/10">
                        <div
                          className="h-full rounded-full"
                          style={{ backgroundColor: band.color, width: `${values.ratePercent}%` }}
                        />
                      </div>
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
                <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                  Das hilft beim Abschicken
                </h3>
                <div className="mt-5">
                  <SignalList stats={stats} signals={positiveSignals} color="#2D6A4F" mode={mode} />
                </div>
              </div>
              <div>
                <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                  Das bremst
                </h3>
                <div className="mt-5">
                  <SignalList stats={stats} signals={frictionSignals} color="#C1121F" mode={mode} />
                </div>
              </div>
            </div>
          </div>
          <BasisNote>
            Feedback-Markierungen können sich überschneiden. „Ja, geht raus“ bleibt eine Selbstauskunft und kein
            physischer Versandnachweis. Anteile beziehen sich auf Markierungen mit Versandangabe.
          </BasisNote>
        </section>

        <section className="mt-10 rounded-2xl border border-waldgruen/15 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
          <SectionHeading
            eyebrow="Politische Selbstwirksamkeit"
            title="Vom Betroffensein ins Handeln"
            detail="Selbstauskunft direkt im Review. Die Werte zeigen ein wahrgenommenes Gefühl, keine tatsächlich beobachtete spätere Handlung."
          />
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <article>
              <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                Handlungsfähiger durch den Brief
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/65">
                „Fühlst du dich durch diesen Brief eher in der Lage, dich politisch einzubringen?“
              </p>
              {activation.selfEfficacyAnswerCount === 0 ? (
                <div className="mt-5">
                  <EmptyState>Noch keine Antworten zur politischen Handlungsfähigkeit.</EmptyState>
                </div>
              ) : (
                <>
                  <div className="mt-5 flex flex-wrap gap-6">
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
              <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                Politische Ohnmacht im Alltag
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/65">
                Wie oft politische Inhalte beschäftigen, ohne dass ein konkreter nächster Schritt klar ist.
              </p>
              {activation.powerlessnessAnswerCount === 0 ? (
                <div className="mt-5">
                  <EmptyState>Noch keine freiwilligen Antworten zur politischen Ohnmacht.</EmptyState>
                </div>
              ) : (
                <div className="mt-6">
                  <SurveyDistributionBars
                    values={activation.powerlessnessDistribution}
                    options={powerlessnessOptions}
                    total={activation.powerlessnessAnswerCount}
                    color="#C58B18"
                    mode={mode}
                  />
                </div>
              )}
              <BasisNote>
                Basis: {formatNumber(activation.powerlessnessAnswerCount)} freiwillig beantwortet ·{" "}
                {formatNumber(activation.powerlessnessNoAnswerCount)} vollständige Reviews ohne Angabe
              </BasisNote>
            </article>
          </div>

          <div className="mt-10 border-t border-warmgrau/10 pt-8">
            <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
              Positive Selbstauskunft nach berichteter Ohnmachtsfrequenz
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/65">
              Nur Reviews mit Antworten auf beide Fragen. „Kann ich noch nicht sagen“ bleibt sichtbar, zählt aber
              nicht in die positive Quote.
            </p>
            {!hasActivationCrossData ? (
              <div className="mt-5">
                <EmptyState>Noch keine gemeinsam auswertbaren Antworten.</EmptyState>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        </section>

        <section className="mt-10 rounded-2xl border border-warmgrau/10 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
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
              title="„Ja, geht raus“"
              body="Umfasst bereits verschickte und unmittelbar geplante Briefe. Es ist eine Selbstauskunft, kein physischer Versandnachweis."
            />
            <Definition
              title="Themensignale"
              body={`${formatNumber(stats.letterSignals.signalCount)} freigegebene Signale nach freiwilliger Einwilligung · Mehrfachzuordnungen möglich, Summe der Anteile kann über 100 % liegen.`}
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
        </section>

        <footer className="mt-10 grid gap-3 border-t border-warmgrau/10 pt-6 font-typewriter text-xs leading-relaxed text-warmgrau/55 sm:grid-cols-2">
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

function Definition({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-warmgrau/10 bg-creme/60 px-4 py-3">
      <p className="font-body text-sm font-semibold text-waldgruen-dark">{title}</p>
      <p className="mt-1 font-body text-xs leading-relaxed text-warmgrau/60">{body}</p>
    </div>
  );
}

function bundeslandLabel(key: string): string {
  const labels: Record<string, string> = {
    BW: "Baden-Württemberg", BY: "Bayern", BE: "Berlin", BB: "Brandenburg",
    HB: "Bremen", HH: "Hamburg", HE: "Hessen", MV: "Mecklenburg-Vorpommern",
    NI: "Niedersachsen", NW: "Nordrhein-Westfalen", RP: "Rheinland-Pfalz",
    SL: "Saarland", SN: "Sachsen", ST: "Sachsen-Anhalt", SH: "Schleswig-Holstein",
    TH: "Thüringen",
  };
  return labels[key] ?? key;
}