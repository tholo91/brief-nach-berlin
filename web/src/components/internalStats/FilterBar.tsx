"use client";

import { useRouter } from "next/navigation";
import { BUNDESLAND_KEYS, BUNDESLAND_NAMES } from "@/lib/campaigns/schema";
import { buildStatsHref, type StatsQuery } from "@/lib/internalStats/view";

type FilterBarProps = {
  query: StatsQuery;
  campaignOptions: { slug: string; label: string }[];
};

export function FilterBar({ query, campaignOptions }: FilterBarProps) {
  const router = useRouter();

  const apply = (patch: Partial<StatsQuery>) => {
    router.replace(buildStatsHref(query, patch));
  };

  const controlClass =
    "max-w-full rounded-md border border-warmgrau/20 bg-white px-2.5 py-1.5 font-body text-sm text-warmgrau outline-none focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20";
  const labelClass =
    "font-typewriter text-[11px] font-bold uppercase tracking-[0.14em] text-warmgrau/55";

  return (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
      <label className="grid gap-1">
        <span className={labelClass}>Zeitraum</span>
        <select
          className={controlClass}
          value={query.zeitraum ?? "all"}
          onChange={(event) =>
            apply({ zeitraum: event.target.value === "all" ? null : event.target.value })
          }
        >
          <option value="all">Gesamt</option>
          <option value="30">30 Tage</option>
          <option value="90">90 Tage</option>
        </select>
      </label>

      <label className="grid gap-1">
        <span className={labelClass}>Quelle</span>
        <select
          className={controlClass}
          value={query.quelle ?? "all"}
          onChange={(event) =>
            apply({
              quelle: event.target.value === "all" ? null : event.target.value,
              kampagne: null,
            })
          }
        >
          <option value="all">Alle</option>
          <option value="free">Freie Anliegen</option>
          <option value="campaign">Kampagnen</option>
        </select>
      </label>

      {query.quelle === "campaign" && (
        <label className="grid gap-1">
          <span className={labelClass}>Kampagne</span>
          <select
            className={controlClass}
            value={query.kampagne ?? ""}
            onChange={(event) => apply({ kampagne: event.target.value || null })}
          >
            <option value="">Alle Kampagnen</option>
            {campaignOptions.map((campaign) => (
              <option key={campaign.slug} value={campaign.slug}>
                {campaign.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="grid gap-1">
        <span className={labelClass}>Bundesland</span>
        <select
          className={controlClass}
          value={query.bundesland ?? ""}
          onChange={(event) => apply({ bundesland: event.target.value || null })}
        >
          <option value="">Alle</option>
          {BUNDESLAND_KEYS.map((key) => (
            <option key={key} value={key}>
              {BUNDESLAND_NAMES[key]}
            </option>
          ))}
        </select>
      </label>

      <p className="max-w-prose font-body text-xs leading-relaxed text-warmgrau/50">
        Filter wirken auf alle Abschnitte, nur der Brief-Zähler bleibt. Klick auf
        ein Bundesland oder eine Kampagne in den Balken setzt den Filter ebenfalls.
      </p>
    </div>
  );
}
