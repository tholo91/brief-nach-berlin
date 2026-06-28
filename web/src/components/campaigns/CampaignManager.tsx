"use client";

import { useState, useTransition } from "react";
import {
  updateCampaignAction,
  type UpdateCampaignResult,
} from "@/lib/actions/updateCampaign";
import {
  pauseCampaignAction,
  type PauseCampaignResult,
} from "@/lib/actions/pauseCampaign";
import {
  archiveCampaignAction,
  type ArchiveCampaignResult,
} from "@/lib/actions/archiveCampaign";
import type { Campaign } from "@/lib/campaigns/schema";

type ActionResult =
  | UpdateCampaignResult
  | PauseCampaignResult
  | ArchiveCampaignResult
  | null;

const statusLabels: Record<Campaign["status"], string> = {
  draft: "Entwurf",
  awaiting_email_verification: "wartet auf E-Mail-Bestätigung",
  active: "aktiv",
  paused: "pausiert",
  archived: "archiviert",
  blocked: "blockiert",
};

export function CampaignManager({ campaign }: { campaign: Campaign }) {
  const [result, setResult] = useState<ActionResult>(null);
  const [isPending, startTransition] = useTransition();
  const canEdit = campaign.status !== "archived" && campaign.status !== "blocked";
  const canPause = campaign.status === "active";
  const canArchive = campaign.status !== "archived";

  return (
    <div className="grid gap-8">
      <section className="rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
              Status
            </p>
            <h1 className="mt-2 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
              {campaign.title}
            </h1>
            <p className="mt-3 font-body text-sm text-warmgrau/65">
              /kampagne/{campaign.slug}
            </p>
          </div>
          <div className="rounded-md border border-waldgruen/15 bg-creme px-4 py-3 font-body text-sm font-semibold text-waldgruen-dark">
            {statusLabels[campaign.status]}
          </div>
        </div>
        <p className="mt-5 font-body text-sm leading-relaxed text-warmgrau/70">
          Änderungen werden vor der Veröffentlichung automatisch geprüft. Wenn die
          Prüfung scheitert, bleibt der bisherige öffentliche Text unverändert.
        </p>
      </section>

      <form
        className="grid gap-5 rounded-md border border-warmgrau/12 bg-creme/80 p-5 shadow-sm md:p-7"
        action={(formData) => {
          setResult(null);
          startTransition(async () => {
            setResult(await updateCampaignAction(formData));
          });
        }}
      >
        <input type="hidden" name="campaignId" value={campaign.id} />

        <div className="grid gap-2">
          <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="title">
            Kampagnentitel
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={120}
            defaultValue={campaign.title}
            disabled={!canEdit || isPending}
            className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen disabled:opacity-60"
          />
          {result?.ok === false && "fieldErrors" in result && result.fieldErrors?.title && (
            <p className="font-body text-sm text-airmail-rot">{result.fieldErrors.title}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="issueText">
            Anliegen
          </label>
          <textarea
            id="issueText"
            name="issueText"
            required
            minLength={20}
            maxLength={4000}
            rows={9}
            defaultValue={campaign.issueText}
            disabled={!canEdit || isPending}
            className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base leading-relaxed outline-none focus:border-waldgruen disabled:opacity-60"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="creatorName">
              Name oder Organisation
            </label>
            <input
              id="creatorName"
              name="creatorName"
              maxLength={120}
              defaultValue={campaign.creatorName ?? ""}
              disabled={!canEdit || isPending}
              className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen disabled:opacity-60"
            />
          </div>
          <div className="grid gap-2">
            <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="externalUrl">
              Externer Link
            </label>
            <input
              id="externalUrl"
              name="externalUrl"
              type="url"
              maxLength={500}
              defaultValue={campaign.externalUrl ?? ""}
              disabled={!canEdit || isPending}
              className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="description">
            Kurze Beschreibung
          </label>
          <textarea
            id="description"
            name="description"
            maxLength={400}
            rows={3}
            defaultValue={campaign.description ?? ""}
            disabled={!canEdit || isPending}
            className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base leading-relaxed outline-none focus:border-waldgruen disabled:opacity-60"
          />
        </div>

        {result && (
          <div
            className={`rounded-md border px-4 py-3 font-body text-sm ${
              result.ok
                ? "border-waldgruen/20 bg-waldgruen/8 text-waldgruen-dark"
                : "border-airmail-rot/25 bg-airmail-rot/5 text-airmail-rot"
            }`}
          >
            {result.message}
          </div>
        )}

        <button
          type="submit"
          disabled={!canEdit || isPending}
          className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Wird geprüft..." : "Änderungen veröffentlichen"}
        </button>
      </form>

      <section className="grid gap-4 rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7">
        <div>
          <h2 className="font-typewriter text-xl font-bold text-waldgruen-dark">
            Kampagne pausieren oder archivieren
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/70">
            Pausieren blendet die öffentliche Seite aus. Archivieren beendet die
            Kampagne dauerhaft, ohne die gespeicherte Historie zu löschen.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={!canPause || isPending}
            onClick={() => {
              setResult(null);
              startTransition(async () => {
                setResult(await pauseCampaignAction(campaign.id));
              });
            }}
            className="rounded-md border border-waldgruen/25 px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kampagne pausieren
          </button>
          <button
            type="button"
            disabled={!canArchive || isPending}
            onClick={() => {
              setResult(null);
              startTransition(async () => {
                setResult(await archiveCampaignAction(campaign.id));
              });
            }}
            className="rounded-md border border-airmail-rot/30 px-5 py-3 font-body text-base font-semibold text-airmail-rot transition-colors hover:border-airmail-rot disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kampagne archivieren
          </button>
        </div>
      </section>
    </div>
  );
}
