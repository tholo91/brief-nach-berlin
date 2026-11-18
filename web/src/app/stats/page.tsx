import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PressContactButton } from "@/components/PressContactButton";
import { PressStatsDashboard } from "@/components/internalStats/PressStatsDashboard";
import { formatNumber } from "@/lib/formatNumber";
import { INTERNAL_STATS_COOKIE, isInternalStatsCookieValid } from "@/lib/internalStats/access";
import { topicCategoryLabel } from "@/lib/internalStats/aggregate";
import { getPressStats } from "@/lib/internalStats/getInternalStats";
import { getWeeklyDrafts } from "@/lib/internalStats/getWeeklyDrafts";
import { formatPressDate, SEND_SIGNAL_LABEL } from "@/lib/internalStats/pressCopy";
import { getPublicStatsTeaser, type PublicStatsTeaser } from "@/lib/internalStats/publicTeaser";
import { parseStatsFilter, statsQueryFromFilter } from "@/lib/internalStats/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zahlen für Presse und Partner | Brief-nach-Berlin",
  description: "Anonyme, zusammengefasste Zahlen zu Brief-nach-Berlin für Presse, Förderer und Partner.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

const ACCESS_MAIL_SUBJECT = "Presseanfrage: Zugang Statistik";
const ACCESS_MAIL_BODY =
  "Hallo Thomas,\n\nich schreibe für [Medium] über [Thema] und hätte gern Zugang zur Statistik von Brief-nach-Berlin.\n\nViele Grüße\n";

function TeaserTile({ value, label, note }: { value: ReactNode; label: string; note?: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-warmgrau/10 bg-white/80 p-5">
      <p className="font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark sm:text-4xl">{value}</p>
      <p className="mt-2 font-body text-sm leading-snug text-warmgrau/80">{label}</p>
      {note && <p className="mt-1 font-body text-xs text-warmgrau/55">{note}</p>}
    </div>
  );
}

function StatsLogin({
  configured,
  error,
  teaser,
}: {
  configured: boolean;
  error: boolean;
  teaser: PublicStatsTeaser | null;
}) {
  const tiles: ReactNode[] = [];
  if (teaser) {
    tiles.push(
      <TeaserTile key="letters" value={formatNumber(teaser.letterCount)} label="Briefe mit Brief-nach-Berlin entworfen" />,
    );
    if (teaser.sendRatePercent !== null) {
      tiles.push(
        <TeaserTile
          key="sent"
          value={`${teaser.sendRatePercent} %`}
          label={SEND_SIGNAL_LABEL}
          note={`Selbstauskunft aus ${formatNumber(teaser.knownSendCount)} Antworten`}
        />,
      );
    }
    if (teaser.topCategories.length > 0) {
      tiles.push(
        <div key="topics" className="flex flex-col rounded-xl border border-warmgrau/10 bg-white/80 p-5">
          <ol className="grid gap-1.5 font-body text-base font-semibold leading-snug text-waldgruen-dark">
            {teaser.topCategories.map((code, index) => (
              <li key={code}>
                <span className="text-airmail-rot/80">{index + 1}.</span> {topicCategoryLabel(code)}
              </li>
            ))}
          </ol>
          <p className="mt-2 font-body text-sm leading-snug text-warmgrau/80">{`Häufigste Themen aus ${formatNumber(teaser.topicSignalCount)} freiwilligen Angaben`}</p>
        </div>,
      );
    }
  }

  return (
    <div className="flex-1 bg-creme">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <p className="font-typewriter text-xs font-bold uppercase tracking-[0.18em] text-waldgruen/65">
          Für Presse und Partner
        </p>
        <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark sm:text-5xl">
          Brief-nach-Berlin in Zahlen
        </h1>
        <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-warmgrau/80 sm:text-lg">
          Wie viele Entwürfe entstehen mit Brief-nach-Berlin? Welche Themen teilen Menschen
          freiwillig? Presse, Förderer und Partner können die Auswertung mit Wochenzahlen,
          Regionen und Nachbefragungen auf Anfrage öffnen.
        </p>

        {tiles.length > 0 && (
          <section aria-label="Ausgewählte Zahlen" className="mt-8">
            <div className="grid gap-3 sm:grid-cols-3">{tiles}</div>
            {teaser && (
              <p className="mt-3 font-body text-xs text-warmgrau/55">
                Stand {formatPressDate(teaser.fetchedAt)}. Versand und Themen beruhen auf freiwilligen Angaben.
              </p>
            )}
          </section>
        )}

        <section className="mt-10 rounded-2xl border-2 border-waldgruen/20 bg-white/60 p-6 sm:p-8">
          <h2 className="font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl">
            Mehr Zahlen für Ihren Artikel?
          </h2>
          <p className="mt-2 max-w-xl font-body leading-relaxed text-warmgrau/80">
            Schreiben Sie mir kurz, für welches Medium Sie berichten. Ich schicke Ihnen einen Link,
            mit dem Sie die Presse-Statistik öffnen können.
          </p>
          <div className="mt-5 max-w-xs">
            <PressContactButton subject={ACCESS_MAIL_SUBJECT} body={ACCESS_MAIL_BODY} label="Zugang anfragen" />
          </div>
        </section>

        <section className="mt-8 max-w-md">
          <h2 className="font-body text-sm font-semibold text-warmgrau/80">Sie haben schon ein Passwort?</h2>
          {configured ? (
            <form action="/stats/unlock" method="post" className="mt-3 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="stats-password" className="sr-only">
                Passwort
              </label>
              <input
                id="stats-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Passwort"
                required
                className="flex-1 rounded-md border border-warmgrau/20 bg-white px-3 py-2 font-body text-warmgrau outline-none focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20"
              />
              <button
                type="submit"
                className="rounded-md border-2 border-waldgruen-dark/30 px-4 py-2 font-body font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen-dark hover:bg-waldgruen/5"
              >
                Statistik öffnen
              </button>
            </form>
          ) : (
            <p className="mt-2 font-body text-sm text-warmgrau/70">Der Zugang ist noch nicht eingerichtet.</p>
          )}
          {error && <p className="mt-2 font-body text-sm text-airmail-rot">Das Passwort stimmt nicht.</p>}
        </section>
      </div>
    </div>
  );
}

type PressStatsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PressStatsPage({ searchParams }: PressStatsPageProps) {
  const configuredPassword = process.env.INTERNAL_STATS_PASSWORD;
  const cookieValue = (await cookies()).get(INTERNAL_STATS_COOKIE)?.value;
  const params = (await searchParams) ?? {};

  if (!isInternalStatsCookieValid(cookieValue, configuredPassword)) {
    return (
      <StatsLogin
        configured={Boolean(configuredPassword)}
        error={params.error === "1"}
        teaser={await getPublicStatsTeaser()}
      />
    );
  }

  const { filter, mode } = parseStatsFilter(params);
  if (filter.source.kind === "campaign") {
    const query = statsQueryFromFilter(filter, mode);
    const privateQuery = new URLSearchParams({ quelle: "campaign" });
    if (query.zeitraum) privateQuery.set("zeitraum", query.zeitraum);
    if (query.kampagne) privateQuery.set("kampagne", query.kampagne);
    if (query.bundesland) privateQuery.set("bundesland", query.bundesland);
    if (query.ansicht) privateQuery.set("ansicht", query.ansicht);
    redirect(`/stats/intern?${privateQuery}`);
  }
  const query = statsQueryFromFilter(filter, "prozentual");

  const [press, weekly] = await Promise.all([
    getPressStats(filter).catch((error) => {
      console.error("[press-stats] read failed", error);
      return null;
    }),
    getWeeklyDrafts(filter.timeRange, filter.source.kind === "free"),
  ]);
  if (!press) {
    return (
      <section className="mx-auto my-12 w-full max-w-xl px-5">
        <h1 className="font-typewriter text-2xl font-bold text-waldgruen-dark">
          Statistik gerade nicht erreichbar
        </h1>
        <p className="mt-3 font-body text-warmgrau">Bitte lade die Seite später erneut.</p>
      </section>
    );
  }
  return <PressStatsDashboard {...press} weekly={weekly} filter={filter} query={query} />;
}
