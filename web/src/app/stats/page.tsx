import type { Metadata } from "next";
import { cookies } from "next/headers";
import { StatsPie } from "@/components/internalStats/StatsPie";
import { formatDecimal, formatNumber } from "@/lib/formatNumber";
import { lockInternalStats, unlockInternalStats } from "@/lib/internalStats/actions";
import {
  INTERNAL_STATS_COOKIE,
  isInternalStatsCookieValid,
} from "@/lib/internalStats/access";
import { getInternalStats } from "@/lib/internalStats/getInternalStats";
import {
  POLITICAL_LEVELS,
  type InternalStats,
  type PoliticalLevel,
  type SendBreakdown,
  topicCategoryLabel,
} from "@/lib/internalStats/aggregate";
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

function percent(value: number, total: number): string {
  return total > 0 ? `${((value / total) * 100).toFixed(1).replace(".", ",")} %` : "0,0 %";
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
  value: string;
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

function RankedBars({ values, labels }: { values: Record<string, number>; labels?: (key: string) => string }) {
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const max = entries[0]?.[1] ?? 0;
  if (!entries.length) return <EmptyState />;
  return <div className="grid gap-3">{entries.map(([key, value]) => (
    <div key={key}>
      <div className="flex items-baseline justify-between gap-3"><span className="font-body text-sm font-semibold text-waldgruen-dark">{labels?.(key) ?? key}</span><span className="font-typewriter text-xs tabular-nums text-warmgrau/60">{formatNumber(value)}</span></div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-warmgrau/10"><div className="h-full rounded-full bg-airmail-rot" style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div>
    </div>
  ))}</div>;
}

function RatingBars({ stats }: { stats: InternalStats }) {
  return (
    <div className="grid gap-3">
      {([5, 4, 3, 2, 1] as const).map((rating) => {
        const count = stats.ratingDistribution[rating];
        const share = stats.reviewCount > 0 ? (count / stats.reviewCount) * 100 : 0;
        return (
          <div key={rating} className="grid grid-cols-[42px_1fr_42px] items-center gap-3">
            <span className="font-typewriter text-sm text-warmgrau/70">{rating} ★</span>
            <div className="h-2 overflow-hidden rounded-full bg-warmgrau/10">
              <div className="h-full rounded-full bg-bernstein" style={{ width: `${share}%` }} />
            </div>
            <span className="text-right font-typewriter text-sm tabular-nums text-waldgruen-dark">
              {formatNumber(count)}
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
}: {
  values: Record<string, number>;
  options: readonly { key: string; label: string }[];
  total: number;
  color: string;
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
              </span>
              <span className="font-typewriter text-xs tabular-nums text-warmgrau/60">
                {formatNumber(count)} · {percent(count, total)}
              </span>
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

function LevelBars({ stats }: { stats: InternalStats }) {
  return (
    <div className="grid gap-4">
      {POLITICAL_LEVELS.map((level: PoliticalLevel) => {
        const count = stats.levelCounts[level];
        const share = percent(count, stats.resolvedLevelCount);
        return (
          <div key={level}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-body text-sm font-semibold text-waldgruen-dark">{level}</span>
              <span className="font-typewriter text-xs tabular-nums text-warmgrau/60">
                {formatNumber(count)} · {share}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-warmgrau/10">
              <div
                className="h-full rounded-full bg-waldgruen"
                style={{ width: `${stats.resolvedLevelCount > 0 ? (count / stats.resolvedLevelCount) * 100 : 0}%` }}
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
}: {
  stats: InternalStats;
  signals: readonly { key: string; label: string }[];
  color: string;
}) {
  return (
    <div className="grid gap-4">
      {signals.map((signal) => {
        const values = stats.feedbackTagStats[signal.key];
        if (!values || values.total === 0) return null;

        const share = values.known > 0 ? values.ratePercent : 0;
        return (
          <div key={signal.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-body text-sm font-semibold text-waldgruen-dark">
                {signal.label}
              </span>
              <span className="font-typewriter text-xs tabular-nums text-warmgrau/60">
                {values.known > 0 ? `${formatDecimal(values.ratePercent)} %` : "—"}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-warmgrau/10">
              <div
                className="h-full rounded-full"
                style={{ backgroundColor: color, width: `${share}%` }}
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
  searchParams?: Promise<{ error?: string }>;
};

export default async function InternalStatsPage({ searchParams }: InternalStatsPageProps) {
  const configuredPassword = process.env.INTERNAL_STATS_PASSWORD;
  const cookieValue = (await cookies()).get(INTERNAL_STATS_COOKIE)?.value;
  if (!isInternalStatsCookieValid(cookieValue, configuredPassword)) {
    const params = await searchParams;
    return <StatsLogin configured={Boolean(configuredPassword)} error={params?.error === "1"} />;
  }

  let stats: InternalStats;
  try {
    stats = await getInternalStats();
  } catch (error) {
    console.error("[internal-stats] read failed", error);
    return <DataError />;
  }
  const activation = stats.politicalActivation;
  const hasActivationCrossData = Object.values(
    activation.efficacyByPowerlessness,
  ).some((item) => item.answered > 0);

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
              Wirkung, nicht nur Klicks.
            </h1>
            <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-warmgrau/70 sm:text-lg">
              Aggregierte Produktdaten für Gespräche mit Organisationen, Medien und Multiplikator:innen.
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

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <StatCard
            eyebrow="Reichweite"
            value={formatNumber(stats.letterCount)}
            label="gezählte Brief-Erstellungen seit Produktstart"
          />
          <StatCard
            eyebrow="Vom Interesse zur Handlung"
            value={`${formatDecimal(stats.sendRatePercent)} %`}
            label={`${formatNumber(stats.sentCount)} von ${formatNumber(stats.knownSendCount)} beantworteten Versandfragen mit positivem Signal`}
            tone="green"
          />
        </section>

        <section className="mt-10 rounded-2xl border border-airmail-rot/15 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
          <SectionHeading eyebrow="Freiwillige Themensignale" title="Was bewegt die Menschen?" detail={`${formatNumber(stats.letterSignals.signalCount)} erfolgreich erzeugte Signale · keine Brieftexte oder Einzelzeilen`} />
          {stats.letterSignals.signalCount === 0 ? <EmptyState>Es gibt noch keine freigegebenen Themensignale. Diese Übersicht füllt sich erst nach dem freiwilligen Opt-in.</EmptyState> : (
            <div className="grid gap-8 lg:grid-cols-2">
              <div><h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Oberkategorien</h3><RankedBars values={stats.letterSignals.categoryCounts} labels={topicCategoryLabel} /></div>
              <div><h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Unterthemen</h3><RankedBars values={stats.letterSignals.labelCounts} /></div>
              <div><h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Politische Ebene</h3><RankedBars values={stats.letterSignals.levelCounts} /></div>
              <div><h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Bundesländer</h3><RankedBars values={stats.letterSignals.bundeslandCounts} /></div>
              <div><h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">PLZ-Regionen</h3><RankedBars values={stats.letterSignals.plzPrefixCounts} /></div>
              <div><h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Monatsverlauf</h3><RankedBars values={stats.letterSignals.monthCounts} /></div>
              <div className="lg:col-span-2"><h3 className="mb-4 font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">Bewertung & Versandabsicht nach Oberkategorie</h3>{Object.keys(stats.letterSignals.reviewByCategory).length === 0 ? <EmptyState>Noch keine verknüpften Reviews mit diesen Signalen.</EmptyState> : <div className="grid gap-3 sm:grid-cols-2">{TOPIC_CATEGORY_CODES.filter((code) => stats.letterSignals.reviewByCategory[code]).map((code) => { const item = stats.letterSignals.reviewByCategory[code]; const average = item.ratings ? (item.ratingSum / item.ratings).toFixed(1).replace(".", ",") : "—"; const sent = item.knownSent ? `${Math.round((item.sent / item.knownSent) * 100)} %` : "—"; return <div key={code} className="rounded-lg border border-warmgrau/10 bg-creme/60 px-4 py-3"><p className="font-body text-sm font-semibold text-waldgruen-dark">{topicCategoryLabel(code)}</p><p className="mt-1 font-typewriter text-xs text-warmgrau/60">{item.ratings} Bewertungen · Ø {average} · Versandabsicht {sent}</p></div>; })}</div>}</div>
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-warmgrau/10 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
          <SectionHeading
            eyebrow="Der wichtigste Pitch"
            title="Was passiert nach dem Brief?"
            detail="Selbstauskunft aus dem Feedbackprozess. „Verschickt / gleich“ ist kein physischer Versandnachweis."
          />
          <StatsPie stats={stats} />
          <p className="mt-8 border-t border-warmgrau/10 pt-4 font-typewriter text-xs leading-relaxed text-warmgrau/55">
            Basis: {formatNumber(stats.reviewCount)} Feedbackzeilen · {formatNumber(stats.knownSendCount)} beantwortete Versandfragen · {formatNumber(stats.noAnswerCount)} ohne Angabe
          </p>
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
                „Fühlst du dich durch diesen Brief eher in der Lage, dich
                politisch einzubringen?“
              </p>
              {activation.selfEfficacyAnswerCount === 0 ? (
                <div className="mt-5">
                  <EmptyState>Noch keine Antworten zur politischen Handlungsfähigkeit.</EmptyState>
                </div>
              ) : (
                <>
                  <p className="mt-5 font-typewriter text-4xl font-bold tabular-nums text-waldgruen-dark">
                    {formatDecimal(activation.selfEfficacyPositiveRatePercent)} %
                  </p>
                  <p className="mt-1 font-body text-xs leading-relaxed text-warmgrau/60">
                    „Ja, deutlich“ oder „Eher ja“ unter den gerichteten
                    Antworten
                  </p>
                  <div className="mt-6">
                    <SurveyDistributionBars
                      values={activation.selfEfficacyDistribution}
                      options={selfEfficacyOptions}
                      total={activation.selfEfficacyAnswerCount}
                      color="#2D6A4F"
                    />
                  </div>
                </>
              )}
              <p className="mt-5 border-t border-warmgrau/10 pt-4 font-typewriter text-[11px] leading-relaxed text-warmgrau/55">
                Basis: {formatNumber(activation.selfEfficacyAnswerCount)} beantwortet · {formatNumber(activation.selfEfficacyDirectionalCount)} gerichtet · {formatNumber(activation.selfEfficacyNoAnswerCount)} ältere Versand-Ja-Antworten ohne diese Frage
              </p>
            </article>

            <article>
              <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                Politische Ohnmacht im Alltag
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/65">
                Wie oft politische Inhalte beschäftigen, ohne dass ein
                konkreter nächster Schritt klar ist.
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
                  />
                </div>
              )}
              <p className="mt-5 border-t border-warmgrau/10 pt-4 font-typewriter text-[11px] leading-relaxed text-warmgrau/55">
                Basis: {formatNumber(activation.powerlessnessAnswerCount)} freiwillig beantwortet · {formatNumber(activation.powerlessnessNoAnswerCount)} vollständige Reviews ohne Angabe
              </p>
            </article>
          </div>

          <div className="mt-10 border-t border-warmgrau/10 pt-8">
            <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
              Positive Wirkung nach Ohnmachtsfrequenz
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/65">
              Nur Reviews mit Antworten auf beide Fragen. „Kann ich noch nicht
              sagen“ bleibt sichtbar, zählt aber nicht in die positive Quote.
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
                      <p className="mt-2 font-typewriter text-2xl font-bold tabular-nums text-waldgruen-dark">
                        {item.directional > 0
                          ? `${formatDecimal(item.positiveRatePercent)} %`
                          : "—"}
                      </p>
                      <p className="mt-1 font-typewriter text-[11px] leading-relaxed text-warmgrau/55">
                        {formatNumber(item.positive)} von {formatNumber(item.directional)} gerichtet · {formatNumber(item.unsure)} unsicher
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-warmgrau/10 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
            <SectionHeading
              eyebrow="Vertrauen"
              title={`${formatDecimal(stats.averageRating)} von 5 Sternen`}
              detail={`${formatNumber(stats.reviewCount)} Bewertungen insgesamt`}
            />
            <RatingBars stats={stats} />
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
          </article>

          <article className="rounded-2xl border border-warmgrau/10 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
            <SectionHeading
              eyebrow="Zuständigkeit"
              title="Wohin gehen die Anliegen?"
              detail={`${formatNumber(stats.resolvedLevelCount)} Feedbacks mit auswertbarer Ebene`}
            />
            <LevelBars stats={stats} />
            {stats.unknownLevelCount > 0 && (
              <p className="mt-6 border-t border-warmgrau/10 pt-4 font-body text-xs leading-relaxed text-warmgrau/55">
                {formatNumber(stats.unknownLevelCount)} ältere oder unvollständige Payloads ohne auswertbare Ebene.
              </p>
            )}
          </article>
        </section>

        <section className="mt-10 rounded-2xl border border-warmgrau/10 bg-white/75 p-5 shadow-[0_16px_36px_rgba(27,67,50,0.06)] sm:p-8">
          <SectionHeading
            eyebrow="Was wir lernen"
            title="Qualität entscheidet mit"
            detail="In den Rückmeldungen zeigt sich ein klarer Zusammenhang zwischen Briefbewertung und Versandabsicht. Das ist eine Korrelation, kein Kausalitätsnachweis."
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
                        </span>
                        <span className="font-typewriter text-xs tabular-nums text-warmgrau/60">
                          {values.known > 0 ? `${formatDecimal(values.ratePercent)} %` : "—"}
                        </span>
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
                  <SignalList stats={stats} signals={positiveSignals} color="#2D6A4F" />
                </div>
              </div>
              <div>
                <h3 className="font-typewriter text-sm font-bold uppercase tracking-[0.12em] text-waldgruen-dark">
                  Das bremst
                </h3>
                <div className="mt-5">
                  <SignalList stats={stats} signals={frictionSignals} color="#C1121F" />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-8 border-t border-warmgrau/10 pt-4 font-typewriter text-xs leading-relaxed text-warmgrau/55">
            Feedback-Markierungen können sich überschneiden. „Verschickt / gleich“ bleibt eine Selbstauskunft und kein physischer Versandnachweis.
          </p>
        </section>

        <footer className="mt-10 grid gap-3 border-t border-warmgrau/10 pt-6 font-typewriter text-xs leading-relaxed text-warmgrau/55 sm:grid-cols-2">
          <p>
            Bewertungszeitraum: {formatDate(stats.oldestReviewAt)} bis {formatDate(stats.newestReviewAt)}
          </p>
          <p className="sm:text-right">
            Nur Aggregate · keine Anliegen · keine E-Mail-Adressen · keine Einzelzeilen
          </p>
        </footer>
      </div>
    </main>
  );
}
