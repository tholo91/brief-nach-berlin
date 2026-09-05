"use client";

import { useEffect, useState } from "react";
import { GERMANY_MAP_ATTRIBUTION } from "@/lib/letterSignals/germanyMapGeometry.generated";
import type { LetterMapData } from "@/lib/letterSignals/mapTypes";
import { GermanyContributionMap } from "./GermanyContributionMap";

type MapState = "loading" | "ready" | "error";

const EMPTY_MAP: LetterMapData = {
  points: [],
  totalContributions: 0,
  postcodeAreas: 0,
};

export function LetterActivityCard() {
  const [mapData, setMapData] = useState<LetterMapData>(EMPTY_MAP);
  const [mapState, setMapState] = useState<MapState>("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/letter-signals/map", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<LetterMapData>;
      })
      .then((body) => {
        if (!Array.isArray(body.points)) throw new Error("Invalid map response");
        setMapData(body);
        setMapState("ready");
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setMapState("error");
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="mx-auto max-w-md border border-waldgruen/10 bg-waldgruen-dark/[0.025] px-5 py-6">
      <p className="font-typewriter text-[11px] font-bold uppercase tracking-[0.13em] text-waldgruen/55">Gemeinsam sichtbar</p>
      <h3 className="mt-2 font-body text-2xl font-bold tracking-tight text-waldgruen-dark">Anliegen aus ganz Deutschland</h3>
      <p className="mt-3 font-body text-sm leading-relaxed text-warmgrau/80">Hier zeigen freiwillige Kartenbeiträge, welche Anliegen Menschen in Deutschland beschäftigen.</p>

      <div className="mt-4 min-h-6" aria-live="polite">
        {mapState === "loading" && <div className="h-4 w-48 animate-pulse rounded bg-waldgruen/10" aria-label="Kartenbeiträge werden geladen" />}
        {mapState === "ready" && mapData.totalContributions > 0 && (
          <p className="font-body text-sm font-semibold text-waldgruen-dark">
            {mapData.totalContributions.toLocaleString("de-DE")} freiwillige {mapData.totalContributions === 1 ? "Kartenbeitrag" : "Kartenbeiträge"} aus {mapData.postcodeAreas.toLocaleString("de-DE")} {mapData.postcodeAreas === 1 ? "Ort" : "Orten"}
          </p>
        )}
        {mapState === "ready" && mapData.totalContributions === 0 && <p className="font-body text-sm text-warmgrau/65">Die ersten freiwilligen Punkte erscheinen hier in Kürze.</p>}
        {mapState === "error" && <p className="font-body text-sm text-warmgrau/65">Die aktuellen Punkte konnten gerade nicht geladen werden.</p>}
      </div>

      <figure className="m-0 mt-4">
        <div className={mapState === "loading" ? "animate-pulse opacity-55" : "opacity-100"}>
          <GermanyContributionMap points={mapData.points} variant="landing" label={`Deutschlandkarte mit ${mapData.totalContributions} freiwilligen Kartenbeiträgen aus ${mapData.postcodeAreas} ${mapData.postcodeAreas === 1 ? "Ort" : "Orten"}`} />
        </div>
        <figcaption className="mx-auto mt-3 max-w-md text-center font-body text-[11px] leading-relaxed text-warmgrau/45">{GERMANY_MAP_ATTRIBUTION}</figcaption>
      </figure>
    </div>
  );
}
