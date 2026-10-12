"use client";

import { useEffect, useRef, useState } from "react";
import type { LetterMapData } from "@/lib/letterSignals/mapTypes";
import { loadPublicLetterMapData } from "@/lib/letterSignals/publicMapClient";
import { ContributionMapDialog } from "./ContributionMapDialog";
import { GermanyContributionMap } from "./GermanyContributionMap";

type MapState = "loading" | "ready" | "error";

const EMPTY_MAP: LetterMapData = {
  points: [],
  totalContributions: 0,
  postcodeAreas: 0,
};

const SHORT_MAP_ATTRIBUTION = "Karte: © OSM (ODbL) · GeoNames (CC BY 4.0) · Natural Earth (PD)";

export function LetterActivityCard({ letterCount, expandable = false }: { letterCount: number; expandable?: boolean }) {
  const [mapData, setMapData] = useState<LetterMapData>(EMPTY_MAP);
  const [mapState, setMapState] = useState<MapState>("loading");
  const [mapOpen, setMapOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    loadPublicLetterMapData()
      .then((body) => {
        if (!active) return;
        if (!Array.isArray(body.points)) throw new Error("Invalid map response");
        setMapData(body);
        setMapState("ready");
      })
      .catch((error: Error) => {
        if (active && error.name !== "AbortError") setMapState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!expandable) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, [expandable]);

  const map = <GermanyContributionMap points={mapData.points} variant="landing" label={`Deutschlandkarte mit Briefen aus ${mapData.postcodeAreas} Orten`} />;

  return (
    <div className="mx-auto max-w-md border border-waldgruen/10 bg-waldgruen-dark/[0.025] px-5 py-6">
      <p className="font-typewriter text-[11px] font-bold uppercase tracking-[0.13em] text-waldgruen/55">Gemeinsam sichtbar</p>
      <h3 className="mt-2 font-body text-2xl font-bold tracking-tight text-waldgruen-dark">Anliegen aus ganz Deutschland</h3>
      <p className="mt-3 font-body text-sm leading-relaxed text-warmgrau/80">Hier zeigen freiwillige Kartenbeiträge, welche Anliegen Menschen in Deutschland beschäftigen.</p>

      <div className="mt-4 min-h-6" aria-live="polite">
        {mapState === "loading" && <div className="h-4 w-48 animate-pulse rounded bg-waldgruen/10" aria-label="Kartenbeiträge werden geladen" />}
        {mapState === "ready" && mapData.totalContributions > 0 && (
          <p className="font-body text-sm font-semibold text-waldgruen-dark">
            {letterCount.toLocaleString("de-DE")} Briefe <span className="sm:hidden">aus ganz Deutschland</span>
            <span className="hidden sm:inline">aus {mapData.postcodeAreas.toLocaleString("de-DE")}+ Städten, Dörfern und Gemeinden</span>
          </p>
        )}
        {mapState === "ready" && mapData.totalContributions === 0 && <p className="font-body text-sm text-warmgrau/65">Die ersten freiwilligen Punkte erscheinen hier in Kürze.</p>}
        {mapState === "error" && <p className="font-body text-sm text-warmgrau/65">Die aktuellen Punkte konnten gerade nicht geladen werden.</p>}
      </div>

      <figure className="m-0 mt-4">
        <div className={mapState === "loading" ? "animate-pulse opacity-55" : "opacity-100"}>
          {expandable ? (
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="dialog"
              aria-label="Karte vergrößern"
              onClick={() => setMapOpen(true)}
              className="group block w-full cursor-zoom-in rounded-xl border border-transparent p-1 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-waldgruen/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
            >
              <span className="relative mx-auto block w-full max-w-[18rem] md:max-w-[29rem]">
                {map}
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 right-0 inline-flex items-center gap-1 rounded-full border border-waldgruen/20 bg-creme px-2 py-1 font-body text-[11px] font-semibold leading-none text-waldgruen shadow-sm transition-colors group-hover:border-waldgruen/40"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="10.5" cy="10.5" r="6.5" />
                    <path d="m15.5 15.5 5 5M10.5 8v5M8 10.5h5" />
                  </svg>
                  Vergrößern
                </span>
              </span>
            </button>
          ) : (
            map
          )}
        </div>
        <figcaption className="mx-auto mt-3 max-w-md whitespace-nowrap text-center font-body text-[10px] leading-relaxed tracking-tight text-warmgrau/45">{SHORT_MAP_ATTRIBUTION}</figcaption>
      </figure>
      {expandable && (
        <ContributionMapDialog
          open={mapOpen}
          onClose={() => {
            setMapOpen(false);
            triggerRef.current?.focus();
          }}
          points={mapData.points}
          ownPoint={null}
          ownVisible={false}
          totalContributions={mapData.totalContributions}
          postcodeAreas={mapData.postcodeAreas}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}
