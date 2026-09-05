"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GermanyContributionMap } from "@/components/letter-signals/GermanyContributionMap";
import { createLetterSignalAction } from "@/lib/actions/letterSignals";
import type { LetterMapData } from "@/lib/letterSignals/mapTypes";

type ContributionState = "idle" | "saving" | "flying" | "contributed" | "error";
type MapState = "loading" | "ready" | "error";

const EMPTY_MAP: LetterMapData = {
  points: [],
  totalContributions: 0,
  postcodeAreas: 0,
};

export function LetterSignalCard({
  contextToken,
  generationProof,
  email,
  letterPending = false,
}: {
  contextToken: string;
  generationProof?: string | null;
  email: string;
  /** Der freiwillige Kartenbeitrag ist nicht vom fertigen Brief abhängig. */
  letterPending?: boolean;
}) {
  const [mapData, setMapData] = useState<LetterMapData>(EMPTY_MAP);
  const [mapState, setMapState] = useState<MapState>("loading");
  const [state, setState] = useState<ContributionState>("idle");
  const [ownPoint, setOwnPoint] = useState<{ x: number; y: number } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

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

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (state !== "flying") return;
    const timer = window.setTimeout(() => setState("contributed"), 780);
    return () => window.clearTimeout(timer);
  }, [state]);

  const handleConsent = useCallback(async () => {
    if (state === "saving" || state === "flying" || state === "contributed") return;
    setState("saving");
    const result = await createLetterSignalAction({
      contextToken,
      email,
      ...(generationProof ? { generationProof } : {}),
    });
    if ("error" in result) {
      setState("error");
      return;
    }

    if (result.mapPoint) {
      setOwnPoint(result.mapPoint);
      if (result.created) {
        setMapData((current) => {
          const mapPoint = result.mapPoint!;
          const existingIndex = current.points.findIndex(
            (point) => point.x === mapPoint.x && point.y === mapPoint.y,
          );
          const points = [...current.points];
          if (existingIndex >= 0) {
            points[existingIndex] = {
              ...points[existingIndex],
              count: points[existingIndex].count + 1,
            };
          } else {
            points.push({ ...mapPoint, count: 1 });
          }
          return {
            points,
            totalContributions: current.totalContributions + 1,
            postcodeAreas:
              current.postcodeAreas + (existingIndex >= 0 ? 0 : 1),
          };
        });
      }
    }
    setState(reducedMotion || !result.mapPoint ? "contributed" : "flying");
  }, [contextToken, email, generationProof, reducedMotion, state]);

  return (
    <section aria-labelledby="letter-signal-title">
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_11rem] md:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_10rem]">
        <div className="min-w-0">
          <h2 id="letter-signal-title" className="font-body text-lg font-semibold leading-snug text-waldgruen-dark">
            Zeig, woher dein Brief kommt
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/75">
            Setz dein Anliegen auf die Karte und mach sichtbar, von wo aus Menschen ihre Briefe nach Berlin schreiben.
          </p>
          {letterPending && (
            <p className="mt-2 font-body text-xs leading-relaxed text-warmgrau/60">
              Du kannst dein Anliegen schon jetzt unabhängig vom Briefentwurf eintragen.
            </p>
          )}
        </div>

        <div className={mapState === "loading" ? "animate-pulse opacity-55" : "opacity-100"}>
          <GermanyContributionMap
            points={mapData.points}
            ownPoint={ownPoint}
            ownPointState={state === "flying" ? "flying" : state === "contributed" ? "contributed" : "idle"}
            reducedMotion={reducedMotion}
            label={`Deutschlandkarte mit ${mapData.totalContributions} freiwilligen Kartenbeiträgen${state === "contributed" ? "; dein Anliegen ist dabei" : ""}`}
          />
        </div>
      </div>

      {mapState === "error" && (
        <p className="mt-1 font-body text-xs text-warmgrau/55">
          Die bisherigen Punkte konnten gerade nicht geladen werden. Dein Beitrag funktioniert trotzdem.
        </p>
      )}

      <div className="mt-4">
        {state === "contributed" || state === "flying" ? (
          <p role="status" aria-live="polite" className="rounded-lg bg-waldgruen/8 px-4 py-3 font-body text-sm font-semibold text-waldgruen-dark">
            Dein Anliegen ist auf der Karte.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleConsent}
            disabled={state === "saving"}
            className="inline-flex w-full items-center justify-center rounded-lg border border-waldgruen/35 bg-transparent px-4 py-2.5 font-body text-sm font-semibold text-waldgruen transition-[border-color,background-color,transform] hover:border-waldgruen hover:bg-waldgruen/5 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === "saving" ? "Anliegen wird eingetragen …" : "Mein Anliegen auf die Karte setzen"}
          </button>
        )}
        {state === "error" && (
          <p role="alert" className="mt-2 font-body text-xs leading-relaxed text-airmail-rot">
            Das hat gerade nicht geklappt. Versuch es bitte noch einmal. Dein Brief ist davon unabhängig.
          </p>
        )}
      </div>

      <p className="mt-3 font-body text-xs leading-relaxed text-warmgrau/60">
        Mit dem Klick PLZ, E-Mail-Adresse, Zeitpunkt und ein grobes Thema bis zum Widerruf speichern. Öffentlich erscheint nur ein Punkt bei deiner ungefähren PLZ. Dein Brief wird nicht gespeichert.{" "}
        <Link href="/datenschutz#freiwillige-themensignale" className="underline underline-offset-2 hover:text-warmgrau">
          Datenschutz
        </Link>
      </p>
    </section>
  );
}
