"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { GermanyContributionMap } from "@/components/letter-signals/GermanyContributionMap";
import { loadPublicLetterMapData } from "@/lib/letterSignals/publicMapClient";
import { createLetterSignalAction } from "@/lib/actions/letterSignals";
import type { LetterMapData } from "@/lib/letterSignals/mapTypes";
import { detectDeviceClass } from "@/lib/letterSignals/deviceClass";

type ContributionState = "idle" | "saving" | "flying" | "contributed" | "error";
type MapState = "loading" | "ready" | "error";

// Unter md liegt die Karte über dem Spendenaufruf; nach dem Eintragen klappt sie dort ein.
const MOBILE_QUERY = "(max-width: 767px)";
const AUTO_COLLAPSE_DELAY_MS = 1200;

const EMPTY_MAP: LetterMapData = {
  points: [],
  totalContributions: 0,
  postcodeAreas: 0,
};

export function LetterSignalCard({
  contextToken,
  generationProof,
  email,
  hasPersonalNote,
  campaignTextEdited,
}: {
  contextToken: string;
  generationProof?: string | null;
  email: string;
  /** Nur bei Kampagnenbriefen gesetzt (ja/nein, nie der Inhalt). */
  hasPersonalNote?: boolean;
  campaignTextEdited?: boolean;
}) {
  const [mapData, setMapData] = useState<LetterMapData>(EMPTY_MAP);
  const [mapState, setMapState] = useState<MapState>("loading");
  const [state, setState] = useState<ContributionState>("idle");
  const [ownPoint, setOwnPoint] = useState<{ x: number; y: number } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [collapsible, setCollapsible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const autoCollapsedRef = useRef(false);
  const bodyId = useId();

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

  useEffect(() => {
    if (state !== "contributed" || autoCollapsedRef.current) return;
    if (!window.matchMedia(MOBILE_QUERY).matches) return;
    autoCollapsedRef.current = true;
    const timer = window.setTimeout(() => {
      setCollapsible(true);
      setCollapsed(true);
    }, AUTO_COLLAPSE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  const handleConsent = useCallback(async () => {
    if (state === "saving" || state === "flying" || state === "contributed") return;
    setState("saving");
    const result = await createLetterSignalAction({
      contextToken,
      email,
      ...(generationProof ? { generationProof } : {}),
      deviceClass: detectDeviceClass(),
      ...(hasPersonalNote !== undefined ? { hasPersonalNote } : {}),
      ...(campaignTextEdited !== undefined ? { campaignTextEdited } : {}),
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
  }, [campaignTextEdited, contextToken, email, generationProof, hasPersonalNote, reducedMotion, state]);

  return (
    <section aria-labelledby="letter-signal-title">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          aria-controls={bodyId}
          className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          <span className="min-w-0">
            <h2 id="letter-signal-title" className="font-body text-lg font-semibold leading-snug text-waldgruen-dark">
              Zeig, woher dein Brief kommt
            </h2>
            {collapsed && (
              <span className="mt-0.5 block font-body text-sm text-waldgruen">
                Dein Anliegen ist auf der Karte.
              </span>
            )}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-5 w-5 shrink-0 text-waldgruen transition-transform duration-300 motion-reduce:transition-none ${collapsed ? "" : "rotate-180"}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : (
        <h2 id="letter-signal-title" className="font-body text-lg font-semibold leading-snug text-waldgruen-dark">
          Zeig, woher dein Brief kommt
        </h2>
      )}

      <div
        id={bodyId}
        inert={collapsed}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}
      >
      <div className="min-h-0 overflow-hidden">
      <div className="mt-2 grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_11rem] md:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_10rem]">
        <p className="min-w-0 font-body text-sm leading-relaxed text-warmgrau/75">
          Setz dein Anliegen auf die Karte und mach sichtbar, von wo aus Menschen ihre Briefe nach Berlin schreiben.
        </p>

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
        Mit dem Klick PLZ, E-Mail-Adresse, Zeitpunkt, Gerätetyp, Thema und bis zu drei Stichworte deines Anliegens bis zum Widerruf speichern. Öffentlich erscheint nur ein Punkt bei deiner ungefähren PLZ. Dein Brief wird nicht gespeichert.
        {campaignTextEdited !== undefined &&
          " Bei Kampagnenbriefen zusätzlich, ob du den Kampagnentext geändert oder einen Satz zu deiner Betroffenheit ergänzt hast (nur ja oder nein, nie der Inhalt)."}{" "}
        <Link href="/datenschutz#freiwillige-themensignale" className="underline underline-offset-2 hover:text-warmgrau">
          Datenschutz
        </Link>
      </p>
      </div>
      </div>
    </section>
  );
}
