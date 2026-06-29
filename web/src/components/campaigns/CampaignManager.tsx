"use client";

import {
  useEffect,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
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
import { campaignLogoPublicUrl } from "@/lib/campaigns/logo";
import type { Campaign } from "@/lib/campaigns/schema";
import { campaignPublicUrl } from "@/lib/share";
import { CampaignQrDownload } from "./CampaignQrDownload";
import { CampaignUrlCopyField } from "./CampaignUrlCopyField";

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

const maxClientLogoBytes = 4 * 1024 * 1024;
const maxLogoDisplaySize = 512;
const acceptedLogoTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const numberFormatter = new Intl.NumberFormat("de-DE");

async function resizeLogoFile(file: File): Promise<File> {
  if (!acceptedLogoTypes.has(file.type) || file.size <= 380_000) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = objectUrl;
    await image.decode();

    const scale = Math.min(
      1,
      maxLogoDisplaySize / Math.max(image.naturalWidth, image.naturalHeight)
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86)
    );
    if (!blob) return file;
    return new File([blob], "kampagnen-bild.webp", { type: "image/webp" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function CampaignManager({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>(null);
  const [actionPending, setActionPending] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const isBusy = isPending || actionPending;
  const canEdit = campaign.status !== "archived" && campaign.status !== "blocked";
  const canPause = campaign.status === "active";
  const canArchive = campaign.status !== "archived";
  const currentLogoUrl = campaignLogoPublicUrl(campaign.logoPath);
  const shownLogoUrl = logoPreviewUrl ?? currentLogoUrl;
  const logoFileButtonClass = shownLogoUrl
    ? "file:bg-warmgrau/18 file:text-waldgruen-dark hover:file:bg-warmgrau/25"
    : "file:bg-waldgruen file:text-creme hover:file:bg-waldgruen-dark";
  const publicUrl = campaignPublicUrl(campaign.slug);
  const formattedLetterCount = numberFormatter.format(campaign.letterCount);
  const letterCountLabel = campaign.letterCount === 1 ? "Brief erstellt" : "Briefe erstellt";
  const liveSinceLabel = campaign.activatedAt
    ? dateFormatter.format(new Date(campaign.activatedAt))
    : "noch nicht live";
  const logoServerError =
    result?.ok === false && "fieldErrors" in result ? result.fieldErrors?.logo : undefined;

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  function updateLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoPreviewUrl(null);
    setLogoError(null);

    if (!file) return;
    if (!acceptedLogoTypes.has(file.type)) {
      setLogoError("Bitte nutze PNG, JPG oder WebP.");
      event.target.value = "";
      return;
    }
    if (file.size > maxClientLogoBytes) {
      setLogoError("Bitte wähle ein Bild unter 4 MB.");
      event.target.value = "";
      return;
    }
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  async function submitCampaignUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (logoError) return;
    if (!event.currentTarget.reportValidity()) return;

    const formData = new FormData(event.currentTarget);
    const logo = formData.get("logo");
    setResult(null);
    setActionPending(true);

    if (logo instanceof File && logo.size > 0) {
      formData.set("logo", await resizeLogoFile(logo));
    }

    startTransition(async () => {
      try {
        const nextResult = await updateCampaignAction(formData);
        setResult(nextResult);
        if (nextResult.ok) router.refresh();
      } finally {
        setActionPending(false);
      }
    });
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
              Deine Kampagne
            </p>
            <h1 className="mt-2 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
              {campaign.title}
            </h1>
            <div className="mt-3 max-w-xl">
              <CampaignUrlCopyField url={publicUrl} variant="compact" />
            </div>
          </div>
          <div className="rounded-md border border-waldgruen/15 bg-creme px-4 py-3 font-body text-sm font-semibold text-waldgruen-dark">
            {statusLabels[campaign.status]}
          </div>
        </div>
        <p className="mt-5 font-body text-sm leading-relaxed text-warmgrau/70">
          Änderungen werden vor der Veröffentlichung automatisch geprüft. Wenn die
          Prüfung scheitert, bleibt der bisherige öffentliche Text unverändert.
        </p>
        <div className="mt-6 grid gap-4 border-y border-warmgrau/12 py-4 sm:grid-cols-2">
          <div>
            <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-warmgrau/50">
              Briefe über diese Kampagne
            </p>
            <p className="mt-1 font-body text-2xl font-bold text-waldgruen-dark">
              {formattedLetterCount}
            </p>
            <p className="font-body text-sm text-warmgrau/60">
              {letterCountLabel}
            </p>
          </div>
          <div>
            <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-warmgrau/50">
              Live seit
            </p>
            <p className="mt-1 font-body text-2xl font-bold text-waldgruen-dark">
              {liveSinceLabel}
            </p>
            <p className="font-body text-sm text-warmgrau/60">
              Öffentliche Kampagnenseite
            </p>
          </div>
        </div>
      </section>

      <form
        className="grid gap-5 rounded-md border border-warmgrau/12 bg-creme/80 p-5 shadow-sm md:p-7"
        onSubmit={submitCampaignUpdate}
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
            disabled={!canEdit || isBusy}
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
            disabled={!canEdit || isBusy}
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
              disabled={!canEdit || isBusy}
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
              disabled={!canEdit || isBusy}
              className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="logo">
            Logo oder Bild
          </label>
          <div className="grid gap-3 rounded-md border border-warmgrau/15 bg-white/45 p-4 sm:grid-cols-[72px_1fr] sm:items-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-md border border-warmgrau/18 bg-white">
              {shownLogoUrl ? (
                <div
                  aria-hidden="true"
                  className="h-full w-full p-1.5"
                  style={{
                    backgroundImage: `url(${shownLogoUrl})`,
                    backgroundClip: "content-box",
                    backgroundOrigin: "content-box",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                  }}
                />
              ) : (
                <span className="font-typewriter text-xs font-bold uppercase tracking-widest text-warmgrau/35">
                  Bild
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={!canEdit || isBusy}
                onChange={updateLogo}
                aria-invalid={Boolean(logoError || logoServerError)}
                aria-describedby={logoError || logoServerError ? "logo-error" : "logo-help"}
                className={`font-body text-sm text-warmgrau file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2 file:font-body file:text-sm file:font-semibold disabled:opacity-60 ${logoFileButtonClass}`}
              />
              <p id="logo-help" className="font-body text-sm text-warmgrau/60">
                PNG, JPG oder WebP. Quadratische Logos oder Bilder wirken am besten.
              </p>
              {(logoError || logoServerError) && (
                <p id="logo-error" className="font-body text-sm text-airmail-rot">
                  {logoError ?? logoServerError}
                </p>
              )}
            </div>
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
            disabled={!canEdit || isBusy}
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
          disabled={!canEdit || isBusy}
          className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? "Wird geprüft..." : "Änderungen veröffentlichen"}
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <section className="grid gap-4 rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7">
          <div>
            <h2 className="font-typewriter text-xl font-bold text-waldgruen-dark">
              Kampagne umstellen
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/70">
              Pausieren blendet die öffentliche Seite aus. Archivieren beendet die
              Kampagne dauerhaft, ohne die gespeicherte Historie zu löschen.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!canPause || isBusy}
              onClick={() => {
                setResult(null);
                setActionPending(true);
                startTransition(async () => {
                  try {
                    const nextResult = await pauseCampaignAction(campaign.id);
                    setResult(nextResult);
                    if (nextResult.ok) router.refresh();
                  } finally {
                    setActionPending(false);
                  }
                });
              }}
              className="rounded-md border border-waldgruen/25 px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen disabled:cursor-not-allowed disabled:opacity-50"
            >
              Kampagne pausieren
            </button>
            <button
              type="button"
              disabled={!canArchive || isBusy}
              onClick={() => {
                setResult(null);
                setActionPending(true);
                startTransition(async () => {
                  try {
                    const nextResult = await archiveCampaignAction(campaign.id);
                    setResult(nextResult);
                    if (nextResult.ok) router.refresh();
                  } finally {
                    setActionPending(false);
                  }
                });
              }}
              className="rounded-md border border-airmail-rot/30 px-5 py-3 font-body text-base font-semibold text-airmail-rot transition-colors hover:border-airmail-rot disabled:cursor-not-allowed disabled:opacity-50"
            >
              Kampagne archivieren
            </button>
          </div>
        </section>
        <CampaignQrDownload
          url={publicUrl}
          slug={campaign.slug}
          logoUrl={shownLogoUrl}
        />
      </div>
    </div>
  );
}
