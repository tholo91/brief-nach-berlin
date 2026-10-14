import { formatNumber } from "@/lib/formatNumber";
import { formatShare } from "@/lib/internalStats/view";
import {
  OUTCOME_LABELS,
  type OutcomeRoundStats,
} from "@/lib/internalStats/outcomes";
import { REPLY_CHANNEL_VALUES } from "@/lib/rueckmeldung/schema";

type Stage = {
  key: string;
  glyph: string;
  label: string;
  value: number;
  share: string | null;
  detail: string;
  barPercent: number | null;
  barColor: string;
};

function percentOf(count: number, base: number): number {
  return base > 0 ? Math.min(100, (count / base) * 100) : 0;
}

function channelLine(round: OutcomeRoundStats): string {
  const parts = REPLY_CHANNEL_VALUES.filter(
    (channel) => channel !== "none" && round.channelCounts[channel] > 0,
  )
    .sort((a, b) => round.channelCounts[b] - round.channelCounts[a])
    .map(
      (channel) =>
        `${OUTCOME_LABELS.replyChannel[channel]} ${formatNumber(round.channelCounts[channel])}`,
    );
  return parts.length > 0 ? `Kanal: ${parts.join(" · ")}` : "Kanal: noch keine Angabe";
}

function buildStages(round: OutcomeRoundStats): Stage[] {
  const { path } = round;
  return [
    {
      key: "zugestellt",
      glyph: "✉",
      label: "zugestellt",
      value: path.delivered,
      share: null,
      detail: `von ${formatNumber(round.sentCount)} verschickt`,
      barPercent: null,
      barColor: "var(--color-airmail-blau)",
    },
    {
      key: "geantwortet",
      glyph: "✎",
      label: "geantwortet",
      value: path.responded,
      share: formatShare(path.responded, path.delivered),
      detail: "per Klick in der Mail",
      barPercent: path.responded > 0 ? 100 : 0,
      barColor: "var(--color-airmail-blau)",
    },
    {
      key: "abgeschickt",
      glyph: "📮",
      label: "abgeschickt",
      value: path.sent,
      share: formatShare(path.sent, path.responded),
      detail: `${formatNumber(path.sentHandwritten)} von Hand · ${formatNumber(path.sentTyped)} getippt · ${formatNumber(path.sentMethodUnknown)} ohne Angabe`,
      barPercent: percentOf(path.sent, path.responded),
      barColor: "var(--color-waldgruen)",
    },
    {
      key: "reaktion",
      glyph: "↩",
      label: "Reaktion",
      value: path.replied,
      share: formatShare(path.replied, path.responded),
      detail: channelLine(round),
      barPercent: percentOf(path.replied, path.responded),
      barColor: "var(--color-airmail-rot)",
    },
  ];
}

/**
 * Der Weg eines Briefs nach der Last-Call-Mail: zugestellt, geantwortet,
 * abgeschickt, Reaktion. Alle Zahlen stehen im Text, die Balken sind Dekor.
 */
export function Briefweg({ round }: { round: OutcomeRoundStats }) {
  const stages = buildStages(round);
  const { path } = round;
  const summary =
    `Von ${formatNumber(path.delivered)} zugestellten Mails haben ${formatNumber(path.responded)} geantwortet. ` +
    `${formatNumber(path.sent)} haben den Brief abgeschickt, bei ${formatNumber(path.replied)} kam eine Reaktion.`;

  return (
    <figure className="overflow-hidden rounded-xl border border-warmgrau/15 bg-[#fffdf9]">
      <div
        aria-hidden="true"
        className="h-2"
        style={{
          background:
            "repeating-linear-gradient(-45deg, var(--color-airmail-rot) 0 12px, var(--color-creme) 12px 18px, var(--color-airmail-blau) 18px 30px, var(--color-creme) 30px 36px)",
        }}
      />
      <p className="sr-only">{summary}</p>
      <ol className="grid gap-9 p-5 sm:p-6 lg:grid-cols-4 lg:gap-8">
        {stages.map((stage, index) => (
          <li key={stage.key} className="relative min-w-0">
            <p className="flex items-center gap-2 font-typewriter text-sm font-bold text-waldgruen-dark">
              <span aria-hidden="true" className="text-lg leading-none">
                {stage.glyph}
              </span>
              {stage.label}
            </p>
            <p className="mt-2 font-typewriter text-4xl font-bold tabular-nums leading-none text-waldgruen-dark sm:text-5xl">
              {formatNumber(stage.value)}
            </p>
            {stage.share && (
              <p className="mt-2 font-typewriter text-sm font-bold tabular-nums text-warmgrau/80">
                {stage.share}
              </p>
            )}
            <div
              aria-hidden="true"
              className="mt-3 h-2 overflow-hidden rounded-full bg-warmgrau/10"
            >
              {stage.barPercent !== null && (
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${stage.barPercent}%`,
                    backgroundColor: stage.barColor,
                  }}
                />
              )}
            </div>
            <p className="mt-2 font-body text-xs leading-relaxed text-warmgrau/70">
              {stage.detail}
            </p>
            {index < stages.length - 1 && (
              <>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-8 left-2 font-typewriter text-lg text-warmgrau/45 lg:hidden"
                >
                  ↓
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -right-6 top-9 hidden font-typewriter text-lg text-warmgrau/45 lg:block"
                >
                  →
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
      <figcaption className="border-t border-warmgrau/10 px-5 py-3 font-body text-sm text-warmgrau/80 sm:px-6">
        davon konkret eingegangen:{" "}
        <span className="font-typewriter font-bold tabular-nums text-waldgruen-dark">
          {formatShare(path.concrete, path.addressedBase)}
        </span>
      </figcaption>
    </figure>
  );
}
