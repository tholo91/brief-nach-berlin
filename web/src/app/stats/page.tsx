import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PublicStatsLanding } from "@/components/internalStats/PublicStatsLanding";
import { PressStatsDashboard } from "@/components/internalStats/PressStatsDashboard";
import { INTERNAL_STATS_COOKIE, isInternalStatsCookieValid } from "@/lib/internalStats/access";
import { getPressStats } from "@/lib/internalStats/getInternalStats";
import { getWeeklyDrafts } from "@/lib/internalStats/getWeeklyDrafts";
import { getPublicStatsTeaser } from "@/lib/internalStats/publicTeaser";
import { parseStatsFilter, statsQueryFromFilter } from "@/lib/internalStats/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zahlen für Presse und Partner | Brief-nach-Berlin",
  description: "Anonyme, zusammengefasste Zahlen zu Brief-nach-Berlin: Wie Schreiben per Hand Menschen aktiviert.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

type PressStatsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PressStatsPage({ searchParams }: PressStatsPageProps) {
  const configuredPassword = process.env.INTERNAL_STATS_PASSWORD;
  const cookieValue = (await cookies()).get(INTERNAL_STATS_COOKIE)?.value;
  const params = (await searchParams) ?? {};

  if (!isInternalStatsCookieValid(cookieValue, configuredPassword)) {
    return (
      <PublicStatsLanding
        configured={Boolean(configuredPassword)}
        error={params.error === "1"}
        figures={await getPublicStatsTeaser()}
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
