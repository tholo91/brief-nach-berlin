import { BundeslandMap } from "@/components/campaigns/BundeslandMap";
import type {
  CampaignCreatorStatsView,
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

function lettersLabel(count: number) {
  return count === 1 ? "1 Brief" : `${numberFormatter.format(count)} Briefe`;
}

function lettersLabelDative(count: number) {
  return count === 1 ? "1 Brief" : `${numberFormatter.format(count)} Briefen`;
}

const OPT_IN_NOTE =
  "Mitgezählt wird nur, wer beim Schreiben „Mein Anliegen auf die Karte setzen“ gewählt hat.";

const SOURCE_SENTENCE =
  "Woher die Zahlen kommen: Wer über deine Kampagne einen Brief schreibt, bekommt ein paar Tage später eine kurze Frage von mir per Mail.";

type TileProps = {
  value: string;
  unit?: string;
  label: string;
  kpi: CreatorStatsKpi;
};

function Tile({ value, unit, label, kpi }: TileProps) {
  const shown = kpi.status === "shown";
  return (
    <div className="grid grid-cols-[6rem_1fr] items-baseline gap-x-3 rounded-md border border-warmgrau/12 bg-creme/70 px-4 py-3 sm:flex sm:flex-col sm:py-4">
      <dd className="m-0 sm:order-1">
        {shown ? (
          <>
            <span className="font-typewriter text-2xl font-bold leading-none text-waldgruen-dark sm:text-3xl">
              {value}
            </span>
            {unit && (
              <span className="mt-1 block font-body text-xs font-semibold text-waldgruen-dark sm:ml-1.5 sm:mt-0 sm:inline sm:text-sm">
                {unit}
              </span>
            )}
          </>
        ) : (
          <span
            aria-hidden="true"
            className="font-typewriter text-2xl font-bold leading-none text-warmgrau/25 sm:text-3xl"
          >
            …
          </span>
        )}
      </dd>
      <div className="sm:order-2 sm:mt-1">
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
      </div>
    </div>
  );
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
    daily ? dateLabel(start) : `Woche ab ${dateLabel(start)}`;

  return (
    <div className="flex h-full flex-col">
      <h3 className="font-typewriter text-base font-bold text-waldgruen-dark">
        Verlauf
      </h3>
      <div
        role="img"
        aria-label={`${unitLabel} von ${dateLabel(first.start)} bis ${dateLabel(last.start)} ${summary}`}
        className="mt-3 flex min-h-24 flex-1 items-end justify-end gap-0.5"
      >
        {buckets.map((bucket) => {
          const isPeak = bucket.start === peak.start;
          return bucket.count === 0 ? (
            <div
              key={bucket.start}
              title={`${bucketLabel(bucket.start)}: 0 Briefe`}
              className="h-px max-w-6 flex-1 bg-warmgrau/15"
            />
          ) : (
            <div
              key={bucket.start}
              title={`${bucketLabel(bucket.start)}: ${lettersLabel(bucket.count)}`}
              className={`max-w-6 flex-1 rounded-t-sm ${isPeak ? "bg-waldgruen" : "bg-waldgruen/35"}`}
              style={{ height: `${Math.max(4, Math.round((bucket.count / peak.count) * 100))}%` }}
            />
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
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
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
    stats.letterCount === 1 ? "Brief geschrieben" : "Briefe geschrieben";

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
  if (feedback.status === "collecting" || feedback.status === "ready") {
    footnotes.push(SOURCE_SENTENCE);
  }

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

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-typewriter text-4xl font-bold leading-none text-waldgruen-dark">
          {numberFormatter.format(stats.letterCount)}
        </p>
        <p className="font-body text-base font-semibold text-waldgruen-dark">
          {letterLabel}
        </p>
      </div>

      <OriginSection signals={stats.signals} />

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
              kpi={feedback.sendRate}
              value={
                feedback.sendRate.status === "shown"
                  ? `${feedback.sendRate.value} %`
                  : ""
              }
              label="schicken ihren Brief ab"
            />
            <Tile
              kpi={feedback.averageRating}
              value={
                feedback.averageRating.status === "shown"
                  ? ratingFormatter.format(feedback.averageRating.value)
                  : ""
              }
              unit="von 5 Sternen"
              label="Zufriedenheit mit dem fertigen Brief"
            />
            <Tile
              kpi={feedback.selfEfficacy}
              value={
                feedback.selfEfficacy.status === "shown"
                  ? `${feedback.selfEfficacy.value} %`
                  : ""
              }
              label="fühlen sich danach eher in der Lage, sich politisch einzubringen"
            />
            <Tile
              kpi={feedback.powerlessness}
              value={
                feedback.powerlessness.status === "shown"
                  ? `${feedback.powerlessness.value} %`
                  : ""
              }
              label="wissen oft oder manchmal nicht, was sie politisch konkret tun können"
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
