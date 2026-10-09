import type { ReactNode } from "react";
import { BundeslandMap } from "@/components/campaigns/BundeslandMap";
import { CreatorStatsRefresh } from "@/components/campaigns/CreatorStatsRefresh";
import { StarBar } from "@/components/reviews/RatingStat";
import type {
  CampaignCreatorStatsView,
  CreatorSendBreakdown,
  CreatorStatsKpi,
  CreatorTimeline,
} from "@/lib/campaigns/creatorStats";

const numberFormatter = new Intl.NumberFormat("de-DE");
const ratingFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function dateLabel(isoDate: string) {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

function isoWeekNumber(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
  const yearStart = Date.UTC(thursday.getUTCFullYear(), 0, 1);
  return Math.ceil(((thursday.getTime() - yearStart) / 86_400_000 + 1) / 7);
}

function lettersLabel(count: number) {
  return count === 1 ? "1 Brief" : `${numberFormatter.format(count)} Briefe`;
}

function lettersLabelDative(count: number) {
  return count === 1 ? "1 Brief" : `${numberFormatter.format(count)} Briefen`;
}

const OPT_IN_NOTE =
  "Mitgezählt wird nur, wer beim Schreiben „Mein Anliegen auf die Karte setzen“ gewählt hat.";

const SOURCE_SENTENCE =
  "Diese Rückmeldungen kommen aus den Feedbacks zu deiner Briefkampagne.";

type TileProps = {
  value: string;
  label: ReactNode;
  kpi: CreatorStatsKpi;
  watermark: ReactNode;
  /** Ersetzt das Wasserzeichen, sobald die Kachel einen Wert zeigt. */
  visual?: ReactNode;
  extra?: ReactNode;
  note?: ReactNode;
  tone?: "outcome" | "baseline" | "highlight";
};

const TILE_TONE_CLASS = {
  outcome: "border-warmgrau/12 bg-creme/70",
  baseline: "border-dashed border-warmgrau/25 bg-transparent",
  highlight: "border-waldgruen/35 bg-waldgruen/[0.07]",
} as const;

function Tile({
  value,
  label,
  kpi,
  watermark,
  visual,
  extra,
  note,
  tone = "outcome",
}: TileProps) {
  const shown = kpi.status === "shown";
  const showVisual = shown && Boolean(visual);
  return (
    <div
      className={`relative grid grid-cols-[6rem_1fr] items-baseline gap-x-3 rounded-md border px-4 py-3 sm:flex sm:flex-col sm:py-4 ${
        showVisual ? "pr-16 sm:pr-4" : "overflow-clip"
      } ${TILE_TONE_CLASS[tone]}`}
    >
      {showVisual ? (
        <div className="absolute right-4 top-3 z-10 sm:top-4">{visual}</div>
      ) : (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-5 -right-5 h-20 w-20 sm:h-24 sm:w-24 ${
            tone === "baseline" ? "text-warmgrau/[0.09]" : "text-waldgruen/[0.11]"
          }`}
        >
          {watermark}
        </div>
      )}
      <dd className="relative m-0 sm:order-1">
        {shown ? (
          <span
            className={`font-typewriter text-2xl font-bold leading-none sm:text-3xl ${
              tone === "baseline" ? "text-warmgrau/75" : "text-waldgruen-dark"
            }`}
          >
            {value}
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="font-typewriter text-2xl font-bold leading-none text-warmgrau/25 sm:text-3xl"
          >
            …
          </span>
        )}
      </dd>
      <div className="relative sm:order-2 sm:mt-1">
        {shown && extra}
        <dt
          className={`font-body text-sm leading-snug ${shown ? "text-warmgrau/80" : "text-warmgrau/55"}`}
        >
          {label}
        </dt>
        <p className="mt-1 font-body text-xs text-warmgrau/60 sm:mt-2">
          {shown
            ? `aus ${numberFormatter.format(kpi.responses)} Rückmeldungen`
            : `Noch zu wenige Antworten, bisher ${numberFormatter.format(kpi.responses)}`}
        </p>
        {shown && note && (
          <p className="mt-0.5 font-body text-xs text-warmgrau/60">{note}</p>
        )}
      </div>
    </div>
  );
}

function TileIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
    >
      {children}
    </svg>
  );
}

const starIcon = (
  <TileIcon>
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" />
  </TileIcon>
);

const unsureIcon = (
  <TileIcon>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6" />
    <path d="M12 17h.01" />
  </TileIcon>
);

const envelopeIcon = (
  <TileIcon>
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </TileIcon>
);

const sproutIcon = (
  <TileIcon>
    <path d="M12 20v-8" />
    <path d="M12 12c0-3.5-2.5-6-6.5-6 0 3.5 2.5 6 6.5 6Z" />
    <path d="M12 14.5c0-3 2.2-5.5 6.5-5.5 0 3-2.2 5.5-6.5 5.5Z" />
  </TileIcon>
);

const RING_GAP = 2;

function SendRing({ breakdown }: { breakdown: CreatorSendBreakdown }) {
  const { sent, notSent, noAnswer } = breakdown;
  const sentLength = (sent / (sent + notSent)) * 100;
  const gap = sent > 0 && notSent > 0 ? RING_GAP : 0;
  const segments = [
    { key: "sent", start: 0, length: sentLength, className: "stroke-waldgruen" },
    { key: "notSent", start: sentLength, length: 100 - sentLength, className: "stroke-warmgrau/25" },
  ].filter((segment) => segment.length > 0);
  const rows = [
    { label: "Ja, geht raus", count: sent, swatch: "bg-waldgruen" },
    { label: "Eher nicht", count: notSent, swatch: "bg-warmgrau/25" },
    ...(noAnswer > 0
      ? [{ label: "Nur Sterne vergeben", count: noAnswer, swatch: null }]
      : []),
  ];

  return (
    <div
      role="img"
      tabIndex={0}
      aria-label={rows
        .map((row) => `${row.label}: ${numberFormatter.format(row.count)}`)
        .join(", ")}
      className="group relative block size-9 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-waldgruen/40"
    >
      <svg aria-hidden="true" viewBox="0 0 36 36" className="size-full -rotate-90">
        {segments.map((segment) => {
          const drawn = Math.max(segment.length - gap, 1);
          return (
            <circle
              key={segment.key}
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              strokeWidth="4"
              className={segment.className}
              strokeDasharray={`${drawn} ${100 - drawn}`}
              strokeDashoffset={-(segment.start + gap / 2)}
            />
          );
        })}
      </svg>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-full mt-1.5 grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1 whitespace-nowrap rounded border border-warmgrau/15 bg-white px-2.5 py-2 font-body text-xs leading-tight text-warmgrau/85 opacity-0 shadow-sm transition-opacity duration-100 group-hover:opacity-100 group-focus:opacity-100 motion-reduce:transition-none"
      >
        {rows.map((row) => (
          <span key={row.label} className="contents">
            <span
              className={`size-2 rounded-sm ${row.swatch ?? "border border-dashed border-warmgrau/40"}`}
            />
            <span className={row.swatch ? "" : "text-warmgrau/60"}>{row.label}</span>
            <span className="text-right font-semibold tabular-nums text-waldgruen-dark">
              {numberFormatter.format(row.count)}
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}

function noAnswerNote(count: number) {
  if (count === 0) return null;
  return count === 1
    ? "1 weitere Person hat nur Sterne vergeben"
    : `${numberFormatter.format(count)} weitere haben nur Sterne vergeben`;
}

type SignalsView = CampaignCreatorStatsView["signals"];

function Timeline({ timeline }: { timeline: CreatorTimeline }) {
  if (timeline.status !== "ready") {
    return (
      <div>
        <h3 className="font-typewriter text-base font-bold text-waldgruen-dark">
          Verlauf
        </h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-warmgrau/70">
          {timeline.status === "pending"
            ? "Der Verlauf erscheint ab dem dritten Tag."
            : "Zu diesen Briefen gibt es noch keine Zahlen für den Verlauf."}
        </p>
      </div>
    );
  }

  const { granularity, buckets, peak } = timeline;
  const daily = granularity === "day";
  const summary = daily
    ? `Stärkster Tag: ${dateLabel(peak.start)} mit ${lettersLabelDative(peak.count)}`
    : `Stärkste Woche: ab ${dateLabel(peak.start)} mit ${lettersLabelDative(peak.count)}`;
  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  const unitLabel = daily ? "Briefe pro Tag" : "Briefe pro Woche";
  const bucketLabel = (start: string) =>
    daily ? dateLabel(start) : `KW ${isoWeekNumber(start)}, ab ${dateLabel(start)}`;

  return (
    <div>
      <h3 className="font-typewriter text-base font-bold text-waldgruen-dark">
        Verlauf
      </h3>
      <div
        role="img"
        aria-label={`${unitLabel} von ${dateLabel(first.start)} bis ${dateLabel(last.start)} ${summary}`}
        className="mt-3 flex h-28 items-end justify-end gap-1 md:h-32"
      >
        {buckets.map((bucket) => {
          const isPeak = bucket.start === peak.start;
          return (
            <div
              key={bucket.start}
              className="group relative flex h-full max-w-4 flex-1 flex-col justify-end"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded border border-warmgrau/15 bg-white px-2 py-1 text-center font-body text-xs leading-tight text-warmgrau/85 opacity-0 shadow-sm transition-opacity duration-100 group-hover:opacity-100 motion-reduce:transition-none"
              >
                <span className="block font-semibold text-waldgruen-dark">
                  {bucketLabel(bucket.start)}
                </span>
                {lettersLabel(bucket.count)}
              </span>
              {bucket.count === 0 ? (
                <div className="h-px bg-warmgrau/15" />
              ) : (
                <div
                  className={`rounded-t-sm transition-colors ${
                    isPeak
                      ? "bg-waldgruen"
                      : "bg-waldgruen/35 group-hover:bg-waldgruen/60"
                  }`}
                  style={{ height: `${Math.max(4, Math.round((bucket.count / peak.count) * 100))}%` }}
                />
              )}
            </div>
          );
        })}
      </div>
      {buckets.length > 1 && (
        <div
          aria-hidden="true"
          className="mt-1.5 flex justify-between font-body text-xs text-warmgrau/60"
        >
          <span>{dateLabel(first.start)}</span>
          <span>{dateLabel(last.start)}</span>
        </div>
      )}
      <p className="mt-2 font-body text-sm text-warmgrau/85">{summary}</p>
    </div>
  );
}

function OriginSection({ signals }: { signals: SignalsView }) {
  if (signals.status === "unavailable") {
    return (
      <p className="mt-5 border-t border-warmgrau/12 pt-4 font-body text-sm leading-relaxed text-warmgrau/70">
        Woher die Briefe kommen, lässt sich gerade nicht laden. Schau später
        noch einmal vorbei.
      </p>
    );
  }

  if (signals.status === "collecting") {
    return (
      <div className="mt-5 border-t border-warmgrau/12 pt-4">
        <h3 className="font-typewriter text-base font-bold text-waldgruen-dark">
          Woher geschrieben wird
        </h3>
        <p className="mt-2 max-w-xl font-body text-base leading-relaxed text-warmgrau/85">
          Ab {signals.threshold} Briefen mit Kartenfreigabe siehst du hier, aus
          welchen Bundesländern geschrieben wird und wann am meisten los war.
        </p>
        <div className="mt-4 max-w-xl">
          <p className="font-body text-sm font-semibold text-waldgruen-dark">
            {signals.remaining === 1
              ? "Noch 1 Brief mit Kartenfreigabe bis dahin."
              : `Noch ${signals.remaining} Briefe mit Kartenfreigabe bis dahin.`}
          </p>
          <div
            role="progressbar"
            aria-label="Briefe mit Kartenfreigabe bis zur Anzeige"
            aria-valuemin={0}
            aria-valuemax={signals.threshold}
            aria-valuenow={signals.signals}
            aria-valuetext={`${signals.signals} von ${signals.threshold} Briefen`}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-warmgrau/10"
          >
            <div
              className="h-full rounded-full bg-waldgruen"
              style={{
                width: `${Math.round((signals.signals / signals.threshold) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-1.5 font-body text-xs text-warmgrau/60">
            {signals.signals} von {signals.threshold}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-warmgrau/12 pt-4">
      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
        <div>
          <h3 className="font-typewriter text-base font-bold text-waldgruen-dark">
            Woher geschrieben wird
          </h3>
          <div className="mt-3">
            <BundeslandMap
              regions={signals.regions}
              total={signals.signals}
              hideSmallStates
            />
          </div>
          {signals.recipients && (
            <p className="mt-3 font-body text-xs leading-relaxed text-warmgrau/70">
              Geschrieben an:{" "}
              {signals.recipients
                .map((bucket) => `${bucket.label} ${numberFormatter.format(bucket.count)}`)
                .join(", ")}
            </p>
          )}
        </div>
        <Timeline timeline={signals.timeline} />
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      role="img"
      aria-label={`${filled} von 5 Sternen`}
      className="font-body text-sm tracking-wide text-waldgruen"
    >
      <span aria-hidden="true">
        {"★".repeat(filled)}
        <span className="text-warmgrau/25">{"★".repeat(5 - filled)}</span>
      </span>
    </span>
  );
}

export function CampaignCreatorStats({
  stats,
}: {
  stats: CampaignCreatorStatsView;
}) {
  const { feedback } = stats;
  const heading = stats.ended
    ? "Endstand deiner Kampagne"
    : "So kommt deine Kampagne an";
  const letterLabel =
    stats.letterCount === 1
      ? "Brief nach Berlin geschrieben"
      : "Briefe nach Berlin geschrieben";

  const footnotes: string[] = [];
  if (stats.signals.status === "ready") {
    const { signals } = stats.signals;
    footnotes.push(
      signals > stats.letterCount
        ? `Basiert auf ${numberFormatter.format(signals)} Briefen.`
        : `Basiert auf ${numberFormatter.format(signals)} von ${numberFormatter.format(stats.letterCount)} Briefen.`,
    );
  }
  if (stats.signals.status === "ready" || stats.signals.status === "collecting") {
    footnotes.push(OPT_IN_NOTE);
  }
  const showSource = feedback.status === "collecting" || feedback.status === "ready";

  return (
    <section
      id="creator-stats"
      aria-labelledby="creator-stats-heading"
      className="scroll-mt-32 rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7"
    >
      <h2
        id="creator-stats-heading"
        className="text-balance font-typewriter text-lg font-bold text-waldgruen-dark md:text-2xl"
      >
        {heading}
      </h2>
      {showSource && (
        <p className="mt-1.5 font-body text-sm leading-relaxed text-warmgrau/70">
          {SOURCE_SENTENCE}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-typewriter text-4xl font-bold leading-none text-waldgruen-dark">
          {numberFormatter.format(stats.letterCount)}
        </p>
        <p className="font-body text-base font-semibold text-waldgruen-dark">
          {letterLabel}
        </p>
        {!stats.ended && <CreatorStatsRefresh />}
      </div>

      <OriginSection signals={stats.signals} />

      <div id="creator-feedback" className="scroll-mt-32">
        {feedback.status === "unavailable" && (
          <p className="mt-5 border-t border-warmgrau/12 pt-4 font-body text-sm leading-relaxed text-warmgrau/70">
            Die Rückmeldungen lassen sich gerade nicht laden. Schau später noch
            einmal vorbei.
          </p>
        )}

        {feedback.status === "collecting" && (
          <div className="mt-5 border-t border-warmgrau/12 pt-4">
            <p className="max-w-xl font-body text-base leading-relaxed text-warmgrau/85">
              Hier siehst du bald, wie viele ihren Brief abschicken und wie
              zufrieden sie sind.
            </p>
            <div className="mt-4 max-w-xl">
              <p className="font-body text-sm font-semibold text-waldgruen-dark">
                {feedback.remaining === 1
                  ? "Noch 1 Rückmeldung bis dahin."
                  : `Noch ${feedback.remaining} Rückmeldungen bis dahin.`}
              </p>
              <div
                role="progressbar"
                aria-label="Rückmeldungen bis zur Anzeige"
                aria-valuemin={0}
                aria-valuemax={feedback.threshold}
                aria-valuenow={feedback.responses}
                aria-valuetext={`${feedback.responses} von ${feedback.threshold} Rückmeldungen`}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-warmgrau/10"
              >
                <div
                  className="h-full rounded-full bg-waldgruen"
                  style={{
                    width: `${Math.round((feedback.responses / feedback.threshold) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 font-body text-xs text-warmgrau/60">
                {feedback.responses} von {feedback.threshold}
              </p>
            </div>
          </div>
        )}

        {feedback.status === "ready" && (
          <div className="mt-5 border-t border-warmgrau/12 pt-4">
            <dl className="m-0 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Tile
                watermark={envelopeIcon}
                visual={<SendRing breakdown={feedback.sendBreakdown} />}
                kpi={feedback.sendRate}
                value={
                  feedback.sendRate.status === "shown"
                    ? `${feedback.sendRate.value} %`
                    : ""
                }
                label="schicken ihren Brief ab"
                note={noAnswerNote(feedback.sendBreakdown.noAnswer)}
              />
              <Tile
                watermark={starIcon}
                kpi={feedback.averageRating}
                value={
                  feedback.averageRating.status === "shown"
                    ? `${ratingFormatter.format(feedback.averageRating.value)}/5`
                    : ""
                }
                label="Zufriedenheit mit dem fertigen Brief"
                extra={
                  feedback.averageRating.status === "shown" && (
                    <span
                      role="img"
                      aria-label={`${ratingFormatter.format(feedback.averageRating.value)} von 5 Sternen`}
                      className="mb-1.5 block sm:mb-2"
                    >
                      <span aria-hidden="true" className="block">
                        <StarBar rating={feedback.averageRating.value} size="sm" />
                      </span>
                    </span>
                  )
                }
              />
              <Tile
                tone="baseline"
                watermark={unsureIcon}
                kpi={feedback.powerlessness}
                value={
                  feedback.powerlessness.status === "shown"
                    ? `${feedback.powerlessness.value} %`
                    : ""
                }
                label={
                  <>
                    wussten <strong className="font-semibold text-warmgrau">vorher</strong> oft
                    oder manchmal nicht, was sie politisch konkret tun können
                  </>
                }
              />
              <Tile
                tone="highlight"
                watermark={sproutIcon}
                kpi={feedback.selfEfficacy}
                value={
                  feedback.selfEfficacy.status === "shown"
                    ? `${feedback.selfEfficacy.value} %`
                    : ""
                }
                label={
                  <>
                    fühlen sich{" "}
                    <strong className="font-semibold text-waldgruen-dark">danach</strong> eher
                    in der Lage, sich politisch einzubringen
                  </>
                }
              />
            </dl>

            {feedback.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="font-typewriter text-base font-bold text-waldgruen-dark">
                  Was über die Briefe gesagt wird
                </h3>
                <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
                  {feedback.tags.map((tag) => (
                    <li
                      key={tag.label}
                      className="rounded-full border border-warmgrau/15 bg-creme/70 px-3 py-1 font-body text-xs text-warmgrau/85"
                    >
                      {tag.label}{" "}
                      <span className="font-semibold text-waldgruen-dark">
                        {numberFormatter.format(tag.count)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.comments.length > 0 && (
              <div className="mt-6">
                <h3 className="font-typewriter text-base font-bold text-waldgruen-dark">
                  Stimmen zur Kampagne
                </h3>
                <ul className="m-0 mt-3 grid list-none gap-3 p-0">
                  {feedback.comments.map((comment, index) => (
                    <li
                      key={`${comment.monthLabel}-${index}`}
                      className="border-l-2 border-waldgruen/30 pl-4"
                    >
                      <p className="font-body text-base leading-relaxed text-warmgrau/90">
                        „{comment.text}“
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 font-body text-xs text-warmgrau/60">
                        <Stars rating={comment.rating} />
                        <span>{comment.monthLabel}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {footnotes.length > 0 && (
        <footer className="mt-5 grid gap-1 border-t border-warmgrau/12 pt-4">
          {footnotes.map((note) => (
            <p
              key={note}
              className="font-body text-xs leading-relaxed text-warmgrau/60"
            >
              {note}
            </p>
          ))}
        </footer>
      )}
    </section>
  );
}
