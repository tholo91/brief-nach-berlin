import type {
  CampaignCreatorStatsView,
  CreatorStatsKpi,
} from "@/lib/campaigns/creatorStats";

const numberFormatter = new Intl.NumberFormat("de-DE");
const ratingFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const SOURCE_SENTENCE =
  "Woher die Zahlen kommen: Wer über deine Kampagne einen Brief schreibt, bekommt ein paar Tage später eine kurze Frage von uns per Mail.";

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

  return (
    <section
      id="creator-stats"
      aria-labelledby="creator-stats-heading"
      className="rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7"
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
        {stats.liveSinceLabel && (
          <p className="font-body text-sm text-warmgrau/60 sm:ml-auto">
            {stats.ended ? "Gestartet am" : "Live seit"} {stats.liveSinceLabel}
          </p>
        )}
      </div>

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
          <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-warmgrau/65">
            {SOURCE_SENTENCE}
          </p>
        </div>
      )}

      {feedback.status === "ready" && (
        <div className="mt-5 border-t border-warmgrau/12 pt-4">
          <dl className="m-0 grid gap-3 sm:grid-cols-3">
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
              label="So zufrieden sind Schreibende mit ihrem Brief"
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
          </dl>

          {feedback.comments.length > 0 && (
            <div className="mt-6">
              <h3 className="font-typewriter text-base font-bold text-waldgruen-dark">
                Was Schreibende dazu sagen
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

          <p className="mt-5 max-w-xl font-body text-xs leading-relaxed text-warmgrau/60">
            {SOURCE_SENTENCE}
          </p>
        </div>
      )}
    </section>
  );
}
