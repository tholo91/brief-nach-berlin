"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  type RefObject,
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
  endCampaignAction,
  updateCampaignEndDateAction,
  type CampaignEndResult,
} from "@/lib/actions/campaignEnd";
import {
  setMilestoneMailsAction,
  type SetMilestoneMailsResult,
} from "@/lib/actions/setMilestoneMails";
import {
  transferCampaignAction,
  type TransferCampaignResult,
} from "@/lib/actions/transferCampaign";
import { campaignContactHref } from "@/lib/contact";
import {
  berlinDateKey,
  formatCampaignEndDate,
  formatCampaignLiveSince,
} from "@/lib/campaigns/endDate";
import { campaignLogoPublicUrl } from "@/lib/campaigns/logo";
import {
  DEFAULT_CAMPAIGN_MILESTONES,
  formatMilestoneList,
} from "@/lib/campaigns/milestones";
import {
  BUNDESLAND_NAMES,
  compactCampaignSlug,
  isCampaignTargetLocked,
  type Campaign,
  type CampaignTargetLevel,
} from "@/lib/campaigns/schema";
import { campaignCompactShortUrl, campaignPublicUrl, campaignShortUrl } from "@/lib/share";
import {
  CampaignEndDatePicker,
  pickerValueFromEndsAt,
  resolvePickerDateKey,
} from "./CampaignEndDatePicker";
import { CampaignLogo } from "./CampaignLogo";
import { CampaignManagerHeader } from "./CampaignManagerHeader";
import { CampaignShareCard } from "./CampaignShareCard";
import { MdbCampaignSelector } from "./MdbCampaignSelector";
import { MilestoneMailsSwitch } from "./MilestoneMailsSwitch";

type ActionResult = UpdateCampaignResult | null;
type RuntimeResult = PauseCampaignResult | CampaignEndResult | null;

const maxClientLogoBytes = 4 * 1024 * 1024;
const maxLogoDisplaySize = 512;
const acceptedLogoTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

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

export function CampaignManager({
  campaign,
  ended,
  insights,
}: {
  campaign: Campaign;
  ended: boolean;
  insights?: ReactNode;
}) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>(null);
  const [runtimeResult, setRuntimeResult] = useState<RuntimeResult>(null);
  const [actionPending, setActionPending] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [milestoneMailsOn, setMilestoneMailsOn] = useState(campaign.milestoneMailsEnabled ?? true);
  const [milestoneResult, setMilestoneResult] = useState<SetMilestoneMailsResult | null>(null);
  const [milestonePending, startMilestoneTransition] = useTransition();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [targetPoliticianIds, setTargetPoliticianIds] = useState<number[]>(campaign.targetPoliticianIds);
  const [hasTargetMdbSelection, setHasTargetMdbSelection] = useState(
    campaign.targetPoliticianIds.length > 0
  );
  const [targetLevel, setTargetLevel] = useState<CampaignTargetLevel>(campaign.targetLevel);
  const [targetState, setTargetState] = useState(campaign.targetState ?? "");
  const [fixedRecipient, setFixedRecipient] = useState({
    organizationName: campaign.targetRecipient?.organizationName ?? "",
    personName: campaign.targetRecipient?.personName ?? "",
    salutation: campaign.targetRecipient?.salutation ?? "Sehr geehrte Damen und Herren,",
    street: campaign.targetRecipient?.street ?? "",
    houseNumber: campaign.targetRecipient?.houseNumber ?? "",
    postalCode: campaign.targetRecipient?.postalCode ?? "",
    city: campaign.targetRecipient?.city ?? "",
  });
  const [transferResult, setTransferResult] = useState<TransferCampaignResult | null>(null);
  const transferDialogRef = useRef<HTMLDialogElement>(null);
  const transferFormRef = useRef<HTMLFormElement>(null);
  const transferEmailRef = useRef<HTMLInputElement>(null);
  const endDialogRef = useRef<HTMLDialogElement>(null);
  const [endPicker, setEndPicker] = useState(() => pickerValueFromEndsAt(campaign.endsAt));
  const isBusy = isPending || actionPending;
  const canEdit = !ended && campaign.status !== "archived" && campaign.status !== "blocked";
  const canEditTarget = canEdit && !isCampaignTargetLocked(campaign);
  const canPause = !ended && campaign.status === "active";
  const canEnd =
    !ended &&
    ["draft", "awaiting_email_verification", "awaiting_approval", "active", "paused"].includes(
      campaign.status
    );
  const canTransfer =
    !ended && ["awaiting_approval", "active", "paused"].includes(campaign.status);
  const savedEndDateKey = campaign.endsAt ? berlinDateKey(new Date(campaign.endsAt)) : "";
  const pickedEndDateKey = resolvePickerDateKey(endPicker);
  const endDateChanged = pickedEndDateKey !== savedEndDateKey;
  const endDateIncomplete = endPicker.choice === "custom" && !endPicker.customDate;
  const endedLabel =
    ended && campaign.endsAt ? formatCampaignEndDate(campaign.endsAt) : null;
  const contactHref = campaignContactHref(campaign.slug);
  const currentLogoUrl = campaignLogoPublicUrl(campaign.logoPath);
  const shownLogoUrl = logoPreviewUrl ?? currentLogoUrl;
  const logoFileButtonClass = shownLogoUrl
    ? "file:bg-warmgrau/18 file:text-waldgruen-dark hover:file:bg-warmgrau/25"
    : "file:bg-waldgruen file:text-creme hover:file:bg-waldgruen-dark";
  const publicUrl = campaignPublicUrl(campaign.slug);
  // Root-level short links only resolve while the campaign is active.
  const shareUrlFor = campaign.status === "active" ? campaignShortUrl : campaignPublicUrl;
  const compactUrlFor = campaign.status === "active" ? campaignCompactShortUrl : campaignPublicUrl;
  const compactSlug = compactCampaignSlug(campaign.slug);
  const hasCompactUrl = compactSlug !== campaign.slug;
  const liveSinceLabel = campaign.activatedAt
    ? formatCampaignLiveSince(campaign.activatedAt)
    : null;
  const logoServerError =
    result?.ok === false && "fieldErrors" in result ? result.fieldErrors?.logo : undefined;
  const targetFieldErrors =
    result?.ok === false && "fieldErrors" in result ? result.fieldErrors : undefined;

  function toggleMilestoneMails(next: boolean) {
    const previous = milestoneMailsOn;
    setMilestoneMailsOn(next);
    setMilestoneResult(null);
    startMilestoneTransition(async () => {
      const nextResult = await setMilestoneMailsAction(campaign.id, next);
      setMilestoneResult(nextResult);
      if (!nextResult.ok) setMilestoneMailsOn(previous);
    });
  }

  function selectTargetLevel(nextLevel: CampaignTargetLevel) {
    setTargetLevel(nextLevel);
    if (nextLevel !== "Land") setTargetState("");
    if (nextLevel !== "Bund") {
      setHasTargetMdbSelection(false);
      setTargetPoliticianIds([]);
    }
    if (nextLevel !== "Fixed") {
      setFixedRecipient({
        organizationName: "",
        personName: "",
        salutation: "Sehr geehrte Damen und Herren,",
        street: "",
        houseNumber: "",
        postalCode: "",
        city: "",
      });
    }
  }

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
        setEditOpen(true);
        if (nextResult.ok) router.refresh();
      } finally {
        setActionPending(false);
      }
    });
  }

  function openImageEditor() {
    setEditOpen(true);
    window.requestAnimationFrame(() => {
      const input = logoInputRef.current;
      if (!input) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      input.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
      input.focus({ preventScroll: true });
    });
  }

  function openTransferDialog() {
    setTransferResult(null);
    transferFormRef.current?.reset();
    transferDialogRef.current?.showModal();
    transferEmailRef.current?.focus();
  }

  async function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;

    setTransferResult(null);
    setActionPending(true);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        setTransferResult(await transferCampaignAction(formData));
      } finally {
        setActionPending(false);
      }
    });
  }

  function runEndAction(action: () => Promise<CampaignEndResult>, onOk?: () => void) {
    setRuntimeResult(null);
    setActionPending(true);
    startTransition(async () => {
      try {
        const nextResult = await action();
        setRuntimeResult(nextResult);
        if (nextResult.ok) {
          onOk?.();
          router.refresh();
        }
      } finally {
        setActionPending(false);
      }
    });
  }

  function endCampaignNow() {
    endDialogRef.current?.close();
    runEndAction(() => endCampaignAction(campaign.id));
  }

  return (
    <div className="grid gap-8">
      <CampaignManagerHeader
        title={campaign.title}
        creatorName={campaign.creatorName}
        liveSinceLabel={liveSinceLabel}
        logoPath={campaign.logoPath}
        status={campaign.status}
        ended={ended}
        endedLabel={endedLabel}
        contactHref={contactHref}
        publicUrl={publicUrl}
        onEditImage={canEdit ? openImageEditor : undefined}
      />

      <CampaignShareCard
        publicUrl={publicUrl}
        shareUrl={shareUrlFor(campaign.slug)}
        compactUrl={hasCompactUrl ? compactUrlFor(compactSlug) : null}
        slug={campaign.slug}
        logoUrl={shownLogoUrl}
        linkInactive={!ended && campaign.status !== "active"}
      />

      {insights}

      {canEdit && (
        <section
          id="meilenstein-mails"
          aria-labelledby="meilenstein-mails-label"
          className="scroll-mt-32 rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1">
              <h2
                id="meilenstein-mails-label"
                className="font-typewriter text-lg font-bold text-waldgruen-dark md:text-xl"
              >
                Meilenstein-Mails
              </h2>
              <p id="meilenstein-mails-help" className="font-body text-sm text-warmgrau/65">
                Benachrichtige mich bei{" "}
                {formatMilestoneList(campaign.milestones ?? DEFAULT_CAMPAIGN_MILESTONES)} Briefen
              </p>
            </div>
            <MilestoneMailsSwitch
              checked={milestoneMailsOn}
              onChange={toggleMilestoneMails}
              disabled={milestonePending}
              labelId="meilenstein-mails-label"
              descriptionId="meilenstein-mails-help"
            />
          </div>
          {milestoneResult && (
            <div
              role="status"
              className={`mt-4 rounded-md border px-4 py-3 font-body text-sm ${
                milestoneResult.ok
                  ? "border-waldgruen/20 bg-white/60 text-waldgruen-dark"
                  : "border-airmail-rot/25 bg-airmail-rot/5 text-airmail-rot"
              }`}
            >
              {milestoneResult.message}
            </div>
          )}
        </section>
      )}

      <details
        id="campaign-settings"
        open={editOpen}
        onToggle={(event) => setEditOpen(event.currentTarget.open)}
        className="group scroll-mt-32 rounded-md border border-warmgrau/12 bg-white/75 shadow-sm"
      >
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-md p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen md:p-7 [&::-webkit-details-marker]:hidden">
          <div className="grid gap-1">
            <h2 className="font-typewriter text-lg font-bold text-waldgruen-dark md:text-xl">
              {canEdit ? "Kampagne bearbeiten" : "Kampagnenangaben ansehen"}
            </h2>
            <p className="font-body text-sm text-warmgrau/65">
              {canEdit
                ? "Titel, Anliegen, Empfänger, Bild, Laufzeit und Status"
                : "Ändern ist nicht mehr möglich."}
            </p>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-waldgruen-dark motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-180"
          >
            <path
              d="M5 8l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <form
          className="grid gap-5 border-t border-warmgrau/12 px-5 pb-5 pt-5 md:px-7 md:pb-7"
          onSubmit={submitCampaignUpdate}
        >
          {canEdit && (
            <p className="font-body text-sm leading-relaxed text-warmgrau/70">
              Änderungen werden vor der Veröffentlichung automatisch geprüft. Wenn die Prüfung
              scheitert, bleibt der bisherige öffentliche Text unverändert.
            </p>
          )}
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

          {canEditTarget && (
            <fieldset className="grid gap-3 rounded-md border border-warmgrau/15 bg-white/55 p-4">
              <legend className="px-1 font-typewriter text-sm font-bold text-waldgruen-dark">
                Wohin soll die Kampagne gehen?
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  ["Bund", "Bundestag"],
                  ["Land", "Landesregierung"],
                  ["Fixed", "Fester Empfänger"],
                ].map(([value, label]) => (
                  <label key={value} className={`cursor-pointer rounded-md border px-3 py-3 font-body text-sm font-semibold ${targetLevel === value ? "border-waldgruen bg-waldgruen/8 text-waldgruen-dark" : "border-warmgrau/20 bg-white text-warmgrau"}`}>
                    <input type="radio" name="targetLevel" value={value} checked={targetLevel === value} onChange={() => selectTargetLevel(value as CampaignTargetLevel)} disabled={isBusy} className="mr-2 accent-waldgruen" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {targetLevel === "Bund" ? (
            <div className="grid gap-4 rounded-md border border-waldgruen/20 bg-waldgruen/5 p-4">
              <h2 className="font-typewriter text-sm font-bold text-waldgruen-dark">
                Ziel der Bundestagskampagne
              </h2>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={hasTargetMdbSelection}
                  disabled={!canEdit || isBusy}
                  onChange={(event) => setHasTargetMdbSelection(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-waldgruen"
                />
                <span className="grid gap-0.5">
                  <span className="font-body text-base font-semibold text-waldgruen-dark">
                    An eine Auswahl von Abgeordneten richten
                  </span>
                  <span className="font-body text-sm leading-relaxed text-warmgrau/65">
                    Ohne Auswahl bleibt es eine normale Bundestagskampagne für die jeweils zuständigen MdBs.
                  </span>
                </span>
              </label>
              {hasTargetMdbSelection && (
                <div className="border-t border-waldgruen/15 pt-4">
                  <MdbCampaignSelector
                    selectedIds={targetPoliticianIds}
                    onChange={setTargetPoliticianIds}
                    disabled={!canEdit || isBusy}
                  />
                  {result?.ok === false && "fieldErrors" in result && result.fieldErrors?.targetPoliticianIds && (
                    <p className="mt-2 font-body text-sm text-airmail-rot">
                      {result.fieldErrors.targetPoliticianIds}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : targetLevel === "Land" ? (
            canEditTarget ? (
              <div className="grid gap-2 rounded-md border border-waldgruen/20 bg-waldgruen/5 p-4">
                <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="managerTargetState">Bundesland</label>
                <select id="managerTargetState" name="targetState" value={targetState} onChange={(event) => setTargetState(event.target.value)} disabled={isBusy} className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen">
                  <option value="">Alle Bundesländer</option>
                  {Object.entries(BUNDESLAND_NAMES).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                </select>
              </div>
            ) : (
            <p className="rounded-md border border-warmgrau/15 bg-white/55 px-4 py-3 font-body text-sm leading-relaxed text-warmgrau/70">
              Diese Landeskampagne richtet sich weiterhin an die institutionelle Landesregierung. Eine konkrete MdB-Auswahl ist hier nicht aktiv.
            </p>
            )
          ) : canEditTarget ? (
            <div className="grid gap-4 rounded-md border border-waldgruen/20 bg-waldgruen/5 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 font-typewriter text-sm font-bold text-waldgruen-dark">Organisation <span className="font-body font-normal text-warmgrau/55">optional</span><input name="fixedOrganizationName" maxLength={200} value={fixedRecipient.organizationName} onChange={(event) => setFixedRecipient((current) => ({ ...current, organizationName: event.target.value }))} className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base font-normal outline-none focus:border-waldgruen" /></label>
                <label className="grid gap-2 font-typewriter text-sm font-bold text-waldgruen-dark">Person <span className="font-body font-normal text-warmgrau/55">optional</span><input name="fixedPersonName" maxLength={200} value={fixedRecipient.personName} onChange={(event) => setFixedRecipient((current) => ({ ...current, personName: event.target.value }))} className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base font-normal outline-none focus:border-waldgruen" /></label>
              </div>
              <label className="grid gap-2 font-typewriter text-sm font-bold text-waldgruen-dark">Briefanrede<input name="fixedSalutation" required maxLength={200} value={fixedRecipient.salutation} onChange={(event) => setFixedRecipient((current) => ({ ...current, salutation: event.target.value }))} className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base font-normal outline-none focus:border-waldgruen" /></label>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
                <label className="grid gap-2 font-typewriter text-sm font-bold text-waldgruen-dark">Straße<input name="fixedStreet" required maxLength={120} value={fixedRecipient.street} onChange={(event) => setFixedRecipient((current) => ({ ...current, street: event.target.value }))} className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base font-normal outline-none focus:border-waldgruen" /></label>
                <label className="grid gap-2 font-typewriter text-sm font-bold text-waldgruen-dark">Hausnummer<input name="fixedHouseNumber" required maxLength={20} value={fixedRecipient.houseNumber} onChange={(event) => setFixedRecipient((current) => ({ ...current, houseNumber: event.target.value }))} className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base font-normal outline-none focus:border-waldgruen" /></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)_180px]">
                <label className="grid gap-2 font-typewriter text-sm font-bold text-waldgruen-dark">Postleitzahl<input name="fixedPostalCode" required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={fixedRecipient.postalCode} onChange={(event) => setFixedRecipient((current) => ({ ...current, postalCode: event.target.value.replace(/\D/g, "").slice(0, 5) }))} className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base font-normal outline-none focus:border-waldgruen" /></label>
                <label className="grid gap-2 font-typewriter text-sm font-bold text-waldgruen-dark">Ort<input name="fixedCity" required maxLength={120} value={fixedRecipient.city} onChange={(event) => setFixedRecipient((current) => ({ ...current, city: event.target.value }))} className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base font-normal outline-none focus:border-waldgruen" /></label>
                <div className="grid gap-2"><span className="font-typewriter text-sm font-bold text-waldgruen-dark">Land</span><div className="rounded-md border border-warmgrau/15 bg-creme/70 px-4 py-3 font-body text-base text-warmgrau/70">Deutschland</div></div>
              </div>
              <label className="flex items-start gap-3 rounded-md border border-airmail-rot/20 bg-airmail-rot/5 p-3 font-body text-sm leading-relaxed text-warmgrau/80"><input name="fixedAddressAccepted" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-waldgruen" /><span>Ich bestätige, dass dies eine öffentlich erreichbare Dienst-, Büro- oder Organisationsadresse und keine private Wohnadresse ist. Ich bin für die Richtigkeit und zulässige Nutzung der Angaben verantwortlich.</span></label>
              {(targetFieldErrors?.targetRecipient || targetFieldErrors?.fixedAddressAccepted) && <p className="font-body text-sm text-airmail-rot">{targetFieldErrors.targetRecipient ?? targetFieldErrors.fixedAddressAccepted}</p>}
            </div>
          ) : (
            <div className="rounded-md border border-warmgrau/15 bg-white/55 px-4 py-4 font-body text-sm leading-relaxed text-warmgrau/75">
              <p className="font-semibold text-waldgruen-dark">Fester Empfänger · nach Aktivierung gesperrt</p>
              {campaign.targetRecipient?.organizationName && <p className="mt-2">{campaign.targetRecipient.organizationName}</p>}
              {campaign.targetRecipient?.personName && <p>{campaign.targetRecipient.personName}</p>}
              {campaign.targetRecipient && <p>{campaign.targetRecipient.street} {campaign.targetRecipient.houseNumber}<br />{campaign.targetRecipient.postalCode} {campaign.targetRecipient.city}</p>}
              <p className="mt-2 text-xs text-warmgrau/60">Anrede: {campaign.targetRecipient?.salutation}</p>
            </div>
          )}

          <div className="grid gap-2">
            <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="logo">
              Logo oder Bild
            </label>
            <div className="grid gap-4 rounded-md border border-warmgrau/15 bg-white/45 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="grid justify-items-center gap-2 text-center">
                <CampaignLogo
                  logoPath={campaign.logoPath}
                  src={logoPreviewUrl}
                  name={campaign.title}
                  size="lg"
                />
                <p className="max-w-[10rem] font-body text-xs text-warmgrau/60">
                  So erscheint dein Bild auf der Kampagnenseite
                </p>
              </div>
              <div className="grid gap-2">
                <input
                  ref={logoInputRef}
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

          {!ended && (
            <button
              type="submit"
              disabled={!canEdit || isBusy}
              className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? "Wird geprüft..." : "Änderungen veröffentlichen"}
            </button>
          )}
        </form>
        {!ended && (
          <section className="grid gap-6 border-t border-warmgrau/12 px-5 pb-5 pt-5 md:px-7 md:pb-7">
            <div>
              <h3 className="font-typewriter text-lg font-bold text-waldgruen-dark">
                Laufzeit und Status
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/70">
                Mit einem Enddatum läuft die Kampagne von selbst aus. Pausieren blendet die
                öffentliche Seite vorübergehend aus. Beenden schließt die Kampagne für immer,
                die Seite zeigt danach den Endstand.
              </p>
            </div>
            <div className="grid gap-3">
              <CampaignEndDatePicker
                value={endPicker}
                onChange={setEndPicker}
                idPrefix="manage-end"
                disabled={isBusy}
              />
              <div>
                <button
                  type="button"
                  disabled={!endDateChanged || endDateIncomplete || isBusy}
                  onClick={() =>
                    runEndAction(
                      () => updateCampaignEndDateAction(campaign.id, pickedEndDateKey),
                      () =>
                        setEndPicker(
                          pickedEndDateKey
                            ? { choice: "custom", customDate: pickedEndDateKey }
                            : { choice: "none", customDate: "" }
                        )
                    )
                  }
                  className="min-h-11 w-full rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Enddatum speichern
                </button>
              </div>
            </div>
            <div className="grid gap-3 border-t border-warmgrau/12 pt-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={!canPause || isBusy}
                  onClick={() => {
                    setRuntimeResult(null);
                    setActionPending(true);
                    startTransition(async () => {
                      try {
                        const nextResult = await pauseCampaignAction(campaign.id);
                        setRuntimeResult(nextResult);
                        if (nextResult.ok) router.refresh();
                      } finally {
                        setActionPending(false);
                      }
                    });
                  }}
                  className="min-h-11 rounded-md border border-waldgruen/25 px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Kampagne pausieren
                </button>
                <button
                  type="button"
                  disabled={!canEnd || isBusy}
                  onClick={() => endDialogRef.current?.showModal()}
                  className="min-h-11 rounded-md border border-airmail-rot/30 px-5 py-3 font-body text-base font-semibold text-airmail-rot transition-colors hover:border-airmail-rot focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airmail-rot disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Kampagne jetzt beenden
                </button>
              </div>
              {runtimeResult && (
                <div
                  role="status"
                  className={`rounded-md border px-4 py-3 font-body text-sm ${
                    runtimeResult.ok
                      ? "border-waldgruen/20 bg-white/60 text-waldgruen-dark"
                      : "border-airmail-rot/25 bg-airmail-rot/5 text-airmail-rot"
                  }`}
                >
                  {runtimeResult.message}
                </div>
              )}
              {canTransfer && (
                <p className="border-t border-warmgrau/12 pt-4 font-body text-sm text-warmgrau/70">
                  Soll jemand anderes die Kampagne betreuen?{" "}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={openTransferDialog}
                    className="font-semibold text-waldgruen-dark underline underline-offset-4 transition-colors hover:text-waldgruen disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Verwaltung übertragen
                  </button>
                </p>
              )}
            </div>
          </section>
        )}
      </details>

      {canEnd && (
        <ManagerDialog dialogRef={endDialogRef} title="Kampagne jetzt beenden?">
          <p className="font-body text-sm leading-relaxed text-warmgrau/80">
            Der Link bleibt erreichbar und zeigt den Endstand. Über die Kampagne kann niemand
            mehr einen Brief starten.
          </p>
          <p className="rounded-md border border-airmail-rot/25 bg-airmail-rot/5 px-4 py-3 font-body text-sm text-airmail-rot">
            Beenden ist endgültig. Du kannst die Kampagne danach nicht wieder starten.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => endDialogRef.current?.close()}
              className="rounded-md border border-warmgrau/20 px-5 py-3 font-body text-base font-semibold text-warmgrau transition-colors hover:border-warmgrau/40"
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={endCampaignNow}
              className="rounded-md bg-airmail-rot px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-airmail-rot/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ja, jetzt beenden
            </button>
          </div>
        </ManagerDialog>
      )}

      {canTransfer && (
        <ManagerDialog dialogRef={transferDialogRef} title="Verwaltung übertragen?">
          <ul className="grid list-disc gap-2 pl-5 font-body text-sm leading-relaxed text-warmgrau/80">
            <li>
              Die neue Adresse bekommt einen einmaligen Bestätigungslink. Bis sie bestätigt,
              bleibt dein Zugang bestehen.
            </li>
            <li>
              Danach verwaltet die neue Adresse die Kampagne und bekommt eine eigene
              Verwaltungs-Mail.
            </li>
          </ul>
          <p className="rounded-md border border-airmail-rot/25 bg-airmail-rot/5 px-4 py-3 font-body text-sm text-airmail-rot">
            Deine bisherigen Verwaltungs-Links funktionieren dann nicht mehr. Du kannst die
            Übergabe nicht selbst rückgängig machen.
          </p>
          {transferResult?.ok && (
            <>
              <div className="rounded-md border border-waldgruen/20 bg-white/60 px-4 py-3 font-body text-sm text-waldgruen-dark">
                {transferResult.message}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => transferDialogRef.current?.close()}
                  className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
                >
                  Schließen
                </button>
              </div>
            </>
          )}
          <form
            ref={transferFormRef}
            hidden={transferResult?.ok === true}
            className="grid gap-4"
            onSubmit={submitTransfer}
          >
            <div className="grid gap-2">
              <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="recipientEmail">
                Neue E-Mail-Adresse
              </label>
              <input
                ref={transferEmailRef}
                id="recipientEmail"
                name="recipientEmail"
                type="email"
                required
                maxLength={200}
                placeholder="verein@beispiel.de"
                disabled={isBusy}
                className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen disabled:opacity-60"
              />
              <input type="hidden" name="campaignId" value={campaign.id} />
              {transferResult?.ok === false && transferResult.fieldErrors?.recipientEmail && (
                <p className="font-body text-sm text-airmail-rot">{transferResult.fieldErrors.recipientEmail}</p>
              )}
            </div>
            {transferResult?.ok === false && (
              <div className="rounded-md border border-airmail-rot/25 bg-airmail-rot/5 px-4 py-3 font-body text-sm text-airmail-rot">
                {transferResult.message}
              </div>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => transferDialogRef.current?.close()}
                className="rounded-md border border-warmgrau/20 px-5 py-3 font-body text-base font-semibold text-warmgrau transition-colors hover:border-warmgrau/40"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? "Wird verschickt..." : "Übergabe starten"}
              </button>
            </div>
          </form>
        </ManagerDialog>
      )}
    </div>
  );
}

function ManagerDialog({
  dialogRef,
  title,
  children,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-md border border-warmgrau/12 bg-creme p-0 text-warmgrau shadow-xl backdrop:bg-black/40"
    >
      <div className="grid gap-4 p-5 md:p-6">
        <h2 id={titleId} className="font-typewriter text-xl font-bold text-waldgruen-dark">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
