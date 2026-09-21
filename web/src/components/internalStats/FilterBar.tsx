"use client";

import { usePathname, useRouter } from "next/navigation";

type FilterBarProps = {
  zeitraum: string;
  quelle: string;
  kampagne: string | null;
  campaignOptions: { slug: string; label: string }[];
};

export function FilterBar({
  zeitraum,
  quelle,
  kampagne,
  campaignOptions,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const apply = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams();
    const base: Record<string, string | null> = {
      zeitraum: zeitraum === "all" ? null : zeitraum,
      quelle: quelle === "all" ? null : quelle,
      kampagne: quelle === "campaign" && kampagne ? kampagne : null,
    };
    const merged = { ...base, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    router.replace(pathname + (qs ? `?${qs}` : ""));
  };

  const controlClass =
    "rounded-md border border-warmgrau/20 bg-white px-2.5 py-1.5 font-body text-sm text-warmgrau outline-none focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20";
  const labelClass =
    "font-typewriter text-[11px] font-bold uppercase tracking-[0.14em] text-warmgrau/55";

  return (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
      <label className="grid gap-1">
        <span className={labelClass}>Zeitraum</span>
        <select
          className={controlClass}
          value={zeitraum}
          onChange={(event) => apply({ zeitraum: event.target.value })}
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
          value={quelle}
          onChange={(event) =>
            apply({ quelle: event.target.value, kampagne: null })
          }
        >
          <option value="all">Alle</option>
          <option value="free">Freie Anliegen</option>
          <option value="campaign">Kampagnen</option>
        </select>
      </label>

      {quelle === "campaign" && (
        <label className="grid gap-1">
          <span className={labelClass}>Kampagne</span>
          <select
            className={controlClass}
            value={kampagne ?? ""}
            onChange={(event) => apply({ kampagne: event.target.value })}
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

      <p className="max-w-prose font-body text-xs leading-relaxed text-warmgrau/50">
        Der Filter steuert die Datenbasis der Abschnitte. Der Brief-Zähler und
        die Durchschnittsbewertung bleiben unverändert, weil ihnen kein
        Ereignisverlauf zugrunde liegt.
      </p>
    </div>
  );
}