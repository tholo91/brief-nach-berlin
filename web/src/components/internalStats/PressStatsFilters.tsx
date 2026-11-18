"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BUNDESLAND_KEYS, BUNDESLAND_NAMES } from "@/lib/campaigns/schema";
import { buildStatsHref, type StatsQuery } from "@/lib/internalStats/view";

const controlClass = "min-h-11 w-full rounded-lg border border-waldgruen/25 bg-white px-3 text-sm text-waldgruen-dark focus-visible:outline-2 focus-visible:outline-waldgruen";

export function PressStatsFilters({ query }: { query: StatsQuery }) {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState<number>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-app-header]");
    if (!header) return;
    const update = () => setHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const updateFilter = (patch: Partial<StatsQuery>) => {
    startTransition(() => router.replace(buildStatsHref(query, patch), { scroll: false }));
  };
  const timeLabel = query.zeitraum ? `${query.zeitraum} Tage` : "Gesamtzeitraum";
  const region = query.bundesland ? BUNDESLAND_NAMES[query.bundesland as keyof typeof BUNDESLAND_NAMES] : "Bundesweit";
  const sourceLabel = query.quelle === "free" ? "Ohne Kampagnen" : "Mit Kampagnen";

  return (
    <details
      style={{ top: headerHeight }}
      className="group sticky top-14 z-30 -mx-4 border-y border-waldgruen/15 bg-creme/95 shadow-sm backdrop-blur sm:-mx-7"
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-x-3 px-4 py-2 font-body text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-waldgruen sm:px-7 [&::-webkit-details-marker]:hidden">
        <span className="shrink-0 font-semibold text-waldgruen-dark">Filter</span>
        <span className="flex flex-1 flex-wrap gap-x-1.5 text-xs leading-normal text-warmgrau sm:text-sm">
          <span>{timeLabel} ·</span>
          <span>{region} ·</span>
          <span>{sourceLabel}</span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-lg leading-none text-waldgruen group-open:rotate-180">⌄</span>
      </summary>
      <fieldset
        disabled={pending}
        className="grid min-w-0 gap-3 border-t border-waldgruen/10 px-4 py-3 font-body sm:grid-cols-[1fr_1.4fr_auto] sm:items-end sm:px-7"
      >
        <legend className="sr-only">Statistik filtern</legend>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-waldgruen-dark">
          Zeitraum
          <select
            className={controlClass}
            value={query.zeitraum ?? "all"}
            onChange={(event) => updateFilter({ zeitraum: event.target.value === "all" ? null : event.target.value })}
          >
            <option value="all">Gesamt</option>
            <option value="30">Letzte 30 Tage</option>
            <option value="90">Letzte 90 Tage</option>
          </select>
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-waldgruen-dark">
          Bundesland
          <select className={controlClass} value={query.bundesland ?? ""} onChange={(event) => updateFilter({ bundesland: event.target.value || null })}>
            <option value="">Alle Bundesländer</option>
            {BUNDESLAND_KEYS.map((key) => <option key={key} value={key}>{BUNDESLAND_NAMES[key]}</option>)}
          </select>
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-waldgruen-dark">
          <input
            type="checkbox"
            className="h-5 w-5 accent-waldgruen focus-visible:outline-2 focus-visible:outline-waldgruen"
            checked={query.quelle === "free"}
            onChange={(event) => updateFilter({ quelle: event.target.checked ? "free" : null, kampagne: null })}
          />
          Ohne Kampagnen
        </label>
      </fieldset>
      <span className="sr-only" role="status">{pending ? "Statistik wird aktualisiert" : ""}</span>
    </details>
  );
}
