import type { ReactNode } from "react";
import { StarBar } from "@/components/reviews/RatingStat";
import { formatDecimal, formatNumber } from "@/lib/formatNumber";
import type { KeyFigures as KeyFiguresData } from "@/lib/internalStats/keyFigures";
import { formatPressDate } from "@/lib/internalStats/pressCopy";
import { SHARE_PERCENT_MIN_BASE } from "@/lib/internalStats/view";

type KeyFiguresProps = {
  figures: KeyFiguresData;
  headingId?: string;
  /** Platz neben der Überschrift, z. B. der Zitieren-Knopf der Presseansicht. */
  action?: ReactNode;
};

const valueClass =
  "font-typewriter text-4xl font-bold leading-none tabular-nums text-waldgruen-dark sm:text-5xl";
const labelClass = "mt-3 font-body text-base font-semibold leading-snug text-waldgruen-dark";
const noteClass = "mt-1.5 font-body text-sm leading-snug text-warmgrau/75";

function Tile({ value, label, note }: { value: ReactNode; label: string; note: string }) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl bg-waldgruen/[0.06] p-5 sm:p-6">
      <dt className={`order-2 ${labelClass}`}>{label}</dt>
      <dd className={`order-1 ${valueClass}`}>{value}</dd>
      <dd className={`order-3 ${noteClass}`}>{note}</dd>
    </div>
  );
}

export function KeyFigures({ figures, headingId = "key-figures", action }: KeyFiguresProps) {
  const { firstTimers, efficacy, writeAgain, rating } = figures;
  const tiles: ReactNode[] = [];

  if (firstTimers.percent !== null) {
    tiles.push(
      <Tile
        key="first"
        value={`${firstTimers.percent} %`}
        label="schreiben zum ersten Mal an die Politik"
        note={`aus ${formatNumber(firstTimers.base)} Antworten im Feedback`}
      />,
    );
  }
  if (efficacy.percent !== null) {
    tiles.push(
      <Tile
        key="efficacy"
        value={`${efficacy.percent} %`}
        label="fühlen sich durch den Brief eher politisch handlungsfähig"
        note={`aus ${formatNumber(efficacy.base)} Antworten im Feedback`}
      />,
    );
  }
  if (writeAgain.percent !== null) {
    tiles.push(
      <Tile
        key="again"
        value={`${writeAgain.percent} %`}
        label="würden wieder schreiben oder haben es schon getan"
        note={`aus ${formatNumber(writeAgain.base)} Antworten der Nachbefragung${writeAgain.roundLabel ? ` (${writeAgain.roundLabel})` : ""}`}
      />,
    );
  }
  if (rating.average !== null) {
    tiles.push(
      <Tile
        key="rating"
        value={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>{formatDecimal(rating.average)}</span>
            <span className="flex items-center gap-2 text-base font-normal">
              <StarBar rating={rating.average} size="sm" />
              <span className="sr-only">von 5 Sternen</span>
            </span>
          </span>
        }
        label="durchschnittliche Bewertung"
        note={`aus ${formatNumber(rating.count)} Bewertungen`}
      />,
    );
  }

  return (
    <section aria-labelledby={headingId} className="@container">
      <div
        aria-hidden="true"
        className="h-1.5 w-full bg-[repeating-linear-gradient(-45deg,var(--color-airmail-rot)_0_10px,var(--color-creme)_10px_15px,var(--color-airmail-blau)_15px_25px,var(--color-creme)_25px_30px)]"
      />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-5">
        <h2 id={headingId} className="font-typewriter text-sm font-bold text-waldgruen/80">
          Die Kernzahlen
        </h2>
        {action}
      </div>

      <dl className="mt-4">
        <div className="flex flex-col pb-6 sm:pb-8">
          <dt className="order-2 mt-3 font-body text-lg font-semibold text-waldgruen-dark">
            Briefentwürfe mit Brief-nach-Berlin
          </dt>
          <dd className="order-1 font-typewriter text-6xl font-bold leading-none tabular-nums text-waldgruen-dark sm:text-7xl">
            {formatNumber(figures.letterCount)}
          </dd>
          <dd className={`order-3 ${noteClass}`}>Bundesweiter Gesamtzähler, einschließlich Kampagnen</dd>
        </div>

        {tiles.length > 0 && <div className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-4">{tiles}</div>}
      </dl>

      <p className="mt-5 font-body text-sm leading-relaxed text-warmgrau/70">
        Stand {formatPressDate(figures.fetchedAt)}. Alle Antworten sind freiwillig und anonym.
        Prozentwerte erscheinen ab {SHARE_PERCENT_MIN_BASE} Antworten.
      </p>
    </section>
  );
}
