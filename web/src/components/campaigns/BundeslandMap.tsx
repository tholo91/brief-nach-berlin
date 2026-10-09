"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BUNDESLAND_MAP_PATHS,
  BUNDESLAND_MAP_VIEWBOX,
} from "@/lib/campaigns/bundeslandMapGeometry.generated";
import { BUNDESLAND_KEYS, BUNDESLAND_NAMES, type BundeslandKey } from "@/lib/campaigns/schema";

export type BundeslandMapRegion = {
  key: BundeslandKey | null;
  label: string;
  count: number;
};

type Props = {
  regions: BundeslandMapRegion[];
  total: number;
  /** Nur für die interne Statistik: Klick auf ein Land öffnet denselben Filterlink wie die Liste. */
  hrefs?: Partial<Record<BundeslandKey, string>>;
  selected?: string | null;
  /** Creator-Ansicht: Länder unter der Mindestzahl bleiben grau und werden erklärt. */
  hideSmallStates?: boolean;
};

const numberFormatter = new Intl.NumberFormat("de-DE");
const LIGHT = [189, 205, 195] as const;
const DARK = [27, 67, 50] as const;

function lettersLabel(count: number) {
  return count === 1 ? "1 Brief" : `${numberFormatter.format(count)} Briefe`;
}

function percentLabel(count: number, total: number) {
  return `${total > 0 ? Math.round((count / total) * 100) : 0} %`;
}

function shade(count: number, largest: number) {
  const t = largest > 0 ? Math.min(1, count / largest) : 0;
  const [r, g, b] = LIGHT.map((from, index) => Math.round(from + (DARK[index] - from) * t));
  return `rgb(${r} ${g} ${b})`;
}

function MapLink({
  href,
  label,
  current,
  onFocus,
  onBlur,
  children,
}: {
  href: string;
  label: string;
  current: boolean;
  onFocus: () => void;
  onBlur: () => void;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <a
      href={href}
      aria-label={label}
      aria-current={current ? "true" : undefined}
      className="outline-none"
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        router.push(href);
      }}
    >
      {children}
    </a>
  );
}

export function BundeslandMap({
  regions,
  total,
  hrefs,
  selected = null,
  hideSmallStates = false,
}: Props) {
  const [hovered, setHovered] = useState<BundeslandKey | null>(null);
  const interactive = Boolean(hrefs);
  const selectedKey = BUNDESLAND_KEYS.find((key) => key === selected) ?? null;

  const named = regions.filter(
    (region): region is BundeslandMapRegion & { key: BundeslandKey } => region.key !== null,
  );
  const byKey = new Map(named.map((region) => [region.key, region]));
  const other = regions.find((region) => region.key === null) ?? null;
  const ranked = [...named].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "de"),
  );
  const largest = ranked[0]?.count ?? 0;
  const top = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const restCount = rest.reduce((sum, region) => sum + region.count, 0) + (other?.count ?? 0);
  const restLabel =
    rest.length > 0
      ? other
        ? `+ ${rest.length} weitere und kleinere Länder`
        : `+ ${rest.length} weitere`
      : other
        ? "Weitere Bundesländer"
        : null;

  const focusKey = hovered ?? selectedKey;
  const focused = focusKey ? (byKey.get(focusKey) ?? null) : null;
  const summary = top.length
    ? `Karte der Bundesländer, eingefärbt nach Anteil der Briefe. Am meisten: ${top
        .map((region) => `${region.label} ${lettersLabel(region.count)}, ${percentLabel(region.count, total)}`)
        .join("; ")}.`
    : "Karte der Bundesländer, eingefärbt nach Anteil der Briefe.";

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <svg
          viewBox={BUNDESLAND_MAP_VIEWBOX}
          role={interactive ? "group" : "img"}
          aria-label={interactive ? "Bundesländer, Auswahl filtert die Statistik" : summary}
          className="mx-auto h-48 w-auto shrink-0 touch-manipulation sm:mx-0 sm:h-40"
          onClick={(event) => {
            if (event.target === event.currentTarget) setHovered(null);
          }}
        >
          {BUNDESLAND_KEYS.map((key) => {
            const region = byKey.get(key);
            const href = hrefs?.[key];
            const isOn = focusKey === key;
            const dimmed = focusKey !== null && !isOn;
            const canPoint = Boolean(region);
            const path = (
              <path
                d={BUNDESLAND_MAP_PATHS[key]}
                fill={region ? shade(region.count, largest) : undefined}
                className={`stroke-creme transition-opacity duration-150 motion-reduce:transition-none ${
                  region ? "" : "fill-warmgrau/12"
                } ${canPoint ? "cursor-pointer" : ""}`}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                style={{ opacity: dimmed ? 0.4 : 1 }}
                aria-hidden={interactive ? undefined : true}
                onMouseEnter={canPoint ? () => setHovered(key) : undefined}
                onMouseLeave={canPoint ? () => setHovered(null) : undefined}
                onClick={
                  interactive
                    ? undefined
                    : () => setHovered(canPoint ? key : null)
                }
              />
            );
            if (!href) return <g key={key}>{path}</g>;
            return (
              <MapLink
                key={key}
                href={href}
                label={
                  region ? `${region.label}: ${lettersLabel(region.count)}` : BUNDESLAND_NAMES[key]
                }
                current={selectedKey === key}
                onFocus={() => setHovered(key)}
                onBlur={() => setHovered(null)}
              >
                {path}
              </MapLink>
            );
          })}
          {focusKey && (
            <path
              d={BUNDESLAND_MAP_PATHS[focusKey]}
              fill="none"
              className="stroke-waldgruen-dark"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              pointerEvents="none"
              aria-hidden="true"
            />
          )}
        </svg>

        <div className="min-w-0 flex-1">
          {top.length > 0 && (
            <ul aria-hidden="true" className="m-0 grid list-none gap-1.5 p-0">
              {top.map((region) => (
                <li
                  key={region.key}
                  className="flex items-center gap-2 font-body text-sm text-warmgrau/85"
                  onMouseEnter={() => setHovered(region.key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span
                    className="size-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: shade(region.count, largest) }}
                  />
                  <span className="min-w-0 flex-1 truncate">{region.label}</span>
                  <span className="font-typewriter font-bold tabular-nums text-waldgruen-dark">
                    {percentLabel(region.count, total)}
                  </span>
                </li>
              ))}
              {restLabel && (
                <li className="flex items-center gap-2 pl-5 font-body text-sm text-warmgrau/60">
                  <span className="min-w-0 flex-1">{restLabel}</span>
                  <span className="font-typewriter tabular-nums">
                    {percentLabel(restCount, total)}
                  </span>
                </li>
              )}
            </ul>
          )}
          {hideSmallStates && (
            <p aria-hidden="true" className="mt-3 flex items-center gap-2 font-body text-xs text-warmgrau/60">
              <span className="size-3 shrink-0 rounded-sm bg-warmgrau/12" />
              grau = unter 5 Briefe
            </p>
          )}
        </div>
      </div>

      <p
        aria-hidden="true"
        className="mt-3 min-h-5 font-body text-sm text-warmgrau/85"
      >
        {focused ? (
          <>
            <span className="font-semibold text-waldgruen-dark">{focused.label}:</span>{" "}
            {lettersLabel(focused.count)} · {percentLabel(focused.count, total)}
          </>
        ) : (
          <span className="text-warmgrau/55">Bundesland berühren für die Zahl.</span>
        )}
      </p>

      {!interactive && (
        <ul className="sr-only">
          {regions.map((region) => (
            <li key={region.key ?? region.label}>
              {region.label}: {lettersLabel(region.count)}, {percentLabel(region.count, total)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
