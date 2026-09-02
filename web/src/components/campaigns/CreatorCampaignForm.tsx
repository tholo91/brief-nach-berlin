"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  createCampaignDraftAction,
  type CreateCampaignDraftResult,
} from "@/lib/actions/createCampaignDraft";
import {
  BUNDESLAND_NAMES,
  compactCampaignSlug,
  normalizeCampaignSlug,
} from "@/lib/campaigns/schema";
import {
  MdbCampaignHiddenInputs,
  MdbCampaignSelector,
} from "./MdbCampaignSelector";

const initialResult: CreateCampaignDraftResult | null = null;
const draftStorageKey = "bnb_creator_campaign_draft";
const maxClientLogoBytes = 4 * 1024 * 1024;
const maxLogoDisplaySize = 512;
const issueTextMinChars = 100;
const issueTextBetterChars = 200;
const issueTextMaxChars = 4000;
const campaignDescriptionMaxChars = 400;
const acceptedLogoTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const firstStepErrorFields = new Set(["title", "issueText", "slug", "creatorName", "targetPoliticianIds"]);
const slugPattern = /^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/;
const draftFields = [
  "title",
  "issueText",
  "slug",
  "creatorName",
  "externalUrl",
  "description",
  "creatorEmail",
  "targetLevel",
  "targetState",
  "targetMode",
] as const;
type DraftField = (typeof draftFields)[number];
type CampaignDraft = Record<DraftField, string> & { targetPoliticianIds: number[] };
type StoredCampaignDraft = Partial<CampaignDraft> & { slugManuallyEdited?: boolean };
type FormStep = 1 | 2;
const emptyDraft: CampaignDraft = {
  title: "",
  issueText: "",
  slug: "",
  creatorName: "",
  externalUrl: "",
  description: "",
  creatorEmail: "",
  targetLevel: "Bund",
  targetState: "",
  targetMode: "default",
  targetPoliticianIds: [],
};
const targetLevelOptions = [
  {
    value: "Bund",
    title: "Bundestag",
    text: "Briefe gehen an Bundestagsabgeordnete aus dem Wahlkreis der schreibenden Person.",
  },
  {
    value: "Land",
    title: "Landesregierung",
    text: "Briefe gehen institutionell an die Landesregierung oder in Stadtstaaten an den Senat.",
  },
] as const;
const commonCampaignWritingTips = [
  "Problem: Was soll sich ändern?",
  "Forderung: Was soll politisch passieren?",
  "Kontext: Wo passiert es, wen betrifft es, warum jetzt?",
];

function fieldError(
  result: CreateCampaignDraftResult | null,
  field: string
): string | undefined {
  return result?.ok === false ? result.fieldErrors?.[field] : undefined;
}

function slugPreview(value: string): string {
  return normalizeCampaignSlug(value);
}

function isFirstStepComplete(draft: CampaignDraft, normalizedSlug: string): boolean {
  return (
    draft.title.trim().length >= 3 &&
    draft.creatorName.trim().length >= 2 &&
    draft.issueText.trim().length >= issueTextMinChars &&
    slugPattern.test(normalizedSlug)
  );
}

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
    return new File([blob], "kampagnen-logo.webp", { type: "image/webp" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function CreatorCampaignForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [result, setResult] = useState(initialResult);
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<CampaignDraft>(emptyDraft);
  const [step, setStep] = useState<FormStep>(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const normalizedSlug = useMemo(() => slugPreview(draft.slug), [draft.slug]);
  const normalizedCompactSlug = useMemo(
    () => compactCampaignSlug(normalizedSlug),
    [normalizedSlug]
  );
  const hasCompactSlug = normalizedCompactSlug !== normalizedSlug;
  const titleError = fieldError(result, "title");
  const issueTextError = fieldError(result, "issueText");
  const slugError = fieldError(result, "slug");
  const creatorNameError = fieldError(result, "creatorName");
  const creatorEmailError = fieldError(result, "creatorEmail");
  const externalUrlError = fieldError(result, "externalUrl");
  const descriptionError = fieldError(result, "description");
  const responsibilityError = fieldError(result, "responsibilityAccepted");
  const logoServerError = fieldError(result, "logo");
  const issueTextCharCount = draft.issueText.trim().length;
  const firstStepComplete = isFirstStepComplete(draft, normalizedSlug);

  useEffect(() => {
    const rawDraft = window.localStorage.getItem(draftStorageKey);
    if (!rawDraft) {
      window.localStorage.removeItem(`${draftStorageKey}:slug-manual`);
      return;
    }

    try {
      const savedDraft = JSON.parse(rawDraft) as StoredCampaignDraft;
      const nextDraft: CampaignDraft = {
        ...emptyDraft,
        ...Object.fromEntries(
          draftFields.map((field) => [
            field,
            typeof savedDraft[field] === "string" ? savedDraft[field] : "",
          ])
        ),
        targetPoliticianIds: Array.isArray(savedDraft.targetPoliticianIds)
          ? savedDraft.targetPoliticianIds.filter(
            (id): id is number => Number.isInteger(id) && id > 0
            )
          : [],
      };
      if (nextDraft.targetLevel !== "Land") {
        nextDraft.targetLevel = "Bund";
        nextDraft.targetState = "";
      }
      if (nextDraft.targetPoliticianIds.length > 0) {
        nextDraft.targetMode = "specific";
      }
      const restoredSlugManuallyEdited =
        savedDraft.slugManuallyEdited === true ||
        window.localStorage.getItem(`${draftStorageKey}:slug-manual`) === "true" ||
        (nextDraft.slug.length > 0 && slugPreview(nextDraft.slug) !== slugPreview(nextDraft.title));
      window.localStorage.removeItem(`${draftStorageKey}:slug-manual`);
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ ...nextDraft, slugManuallyEdited: restoredSlugManuallyEdited })
      );
      window.setTimeout(() => {
        setSlugManuallyEdited(restoredSlugManuallyEdited);
        setDraft(nextDraft);
      }, 0);
    } catch {
      window.localStorage.removeItem(draftStorageKey);
      window.localStorage.removeItem(`${draftStorageKey}:slug-manual`);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  function updateDraft(field: DraftField, value: string) {
    setDraft((currentDraft) => {
      const nextDraft = { ...currentDraft, [field]: value };
      if (field === "targetLevel" && value !== "Land") {
        nextDraft.targetState = "";
      }
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ ...nextDraft, slugManuallyEdited })
      );
      return nextDraft;
    });
  }

  function updateTitle(value: string) {
    setDraft((currentDraft) => {
      const nextDraft = {
        ...currentDraft,
        title: value,
        ...(slugManuallyEdited ? {} : { slug: slugPreview(value) }),
      };
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ ...nextDraft, slugManuallyEdited })
      );
      return nextDraft;
    });
  }

  function updateTargetMode(targetMode: "default" | "specific") {
    setDraft((currentDraft) => {
      const nextDraft: CampaignDraft = {
        ...currentDraft,
        targetMode,
        ...(targetMode === "specific"
          ? { targetLevel: "Bund", targetState: "" }
          : { targetPoliticianIds: [] }),
      };
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ ...nextDraft, slugManuallyEdited })
      );
      return nextDraft;
    });
  }

  function updateTargetPoliticianIds(ids: number[]) {
    setDraft((currentDraft) => {
      const nextDraft = {
        ...currentDraft,
        targetMode: "specific",
        targetLevel: "Bund",
        targetState: "",
        targetPoliticianIds: ids,
      } as CampaignDraft;
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ ...nextDraft, slugManuallyEdited })
      );
      return nextDraft;
    });
  }

  function updateLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoPreviewUrl(null);
    setLogoFileName(null);
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
    setLogoFileName(file.name);
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  function continueToSecondStep() {
    const form = formRef.current;
    if (!form || logoError) return;

    setResult(null);
    if (!form.reportValidity()) return;
    setStep(2);
    window.requestAnimationFrame(() => {
      const top = form.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  }

  function switchStep(nextStep: FormStep) {
    if (nextStep === step) return;
    if (nextStep === 1) {
      setStep(1);
      return;
    }
    if (firstStepComplete) continueToSecondStep();
  }

  async function submitCampaign() {
    const form = formRef.current;
    if (!form || isPending || logoError) return;

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    formData.set("creationConfirmed", "yes");
    const logo = formData.get("logo");
    if (logo instanceof File && logo.size > 0) {
      formData.set("logo", await resizeLogoFile(logo));
    }

    setResult(null);
    setConfirmOpen(false);
    startTransition(async () => {
      const nextResult = await createCampaignDraftAction(formData);
      setResult(nextResult);
      if (
        nextResult.ok === false &&
        Object.keys(nextResult.fieldErrors ?? {}).some((field) => firstStepErrorFields.has(field))
      ) {
        setStep(1);
      }
      if (nextResult.ok) {
        window.localStorage.removeItem(draftStorageKey);
        window.localStorage.removeItem(`${draftStorageKey}:slug-manual`);
        router.push(`/kampagne/${nextResult.slug}/erstellt`);
      }
    });
  }

  return (
    <form
      ref={formRef}
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 1) return;
        if (logoError) return;
        if (!event.currentTarget.reportValidity()) return;
        setResult(null);
        setConfirmOpen(true);
      }}
    >
      <div className="grid gap-2 rounded-md border border-warmgrau/12 bg-creme/55 p-3 sm:grid-cols-2">
        {[
          { number: 1, title: "Grundlage", text: "Anliegen und Absender" },
          { number: 2, title: "Freigabe", text: "Bild, Kontext und E-Mail" },
        ].map((item) => {
          const isActive = step === item.number;
          const isDisabled = item.number === 2 && step === 1 && !firstStepComplete;
          return (
            <button
              key={item.number}
              type="button"
              onClick={() => switchStep(item.number as FormStep)}
              disabled={isDisabled}
              className={`rounded-md px-3 py-2 text-left transition-colors ${
                isActive ? "bg-white text-waldgruen-dark shadow-sm" : "text-warmgrau/60 hover:bg-white/60"
              } ${
                isDisabled ? "cursor-not-allowed opacity-55 hover:bg-transparent" : "cursor-pointer"
              }`}
            >
              <p className="font-typewriter text-xs font-bold uppercase tracking-widest">
                Schritt {item.number}
              </p>
              <p className="mt-1 font-body text-sm font-semibold">{item.title}</p>
              <p className="font-body text-xs">{item.text}</p>
            </button>
          );
        })}
      </div>

      {step === 2 && (
        <>
          <input type="hidden" name="title" value={draft.title} />
          <input type="hidden" name="issueText" value={draft.issueText} />
          <input type="hidden" name="slug" value={draft.slug} />
          <input type="hidden" name="creatorName" value={draft.creatorName} />
          <input type="hidden" name="targetLevel" value={draft.targetLevel} />
          <input type="hidden" name="targetState" value={draft.targetState} />
          <input type="hidden" name="targetMode" value={draft.targetMode} />
          {draft.targetMode === "specific" && (
            <MdbCampaignHiddenInputs selectedIds={draft.targetPoliticianIds} />
          )}
        </>
      )}

      {step === 1 && (
        <>
      <div className="grid gap-2">
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="title">
          Kampagnentitel
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={120}
          value={draft.title}
          onChange={(event) => updateTitle(event.target.value)}
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? "title-error" : undefined}
          className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
          placeholder="Mehr sichere Schulwege in Bremen"
        />
        {titleError && (
          <p id="title-error" className="font-body text-sm text-airmail-rot">
            {titleError}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="creatorName">
          Absender
        </label>
        <input
          id="creatorName"
          name="creatorName"
          required
          minLength={2}
          maxLength={120}
          value={draft.creatorName}
          onChange={(event) => updateDraft("creatorName", event.target.value)}
          aria-invalid={Boolean(creatorNameError)}
          aria-describedby={creatorNameError ? "creatorName-error creatorName-help" : "creatorName-help"}
          className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
          placeholder="Initiative sichere Schulwege Bremen"
        />
        <p id="creatorName-help" className="font-body text-sm text-warmgrau/60">
          Dieser Name steht öffentlich auf der Kampagnenseite. Nutze die Person oder Organisation, die sichtbar Verantwortung übernimmt.
        </p>
        {creatorNameError && (
          <p id="creatorName-error" className="font-body text-sm text-airmail-rot">
            {creatorNameError}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="issueText">
          Anliegen
        </label>
        <details className="group overflow-hidden rounded-r-lg border-l-4 border-waldgruen bg-waldgruen/5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:bg-waldgruen/[0.12] [&::-webkit-details-marker]:hidden">
            Gib der Kampagne ein klares Briefing
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0 text-warmgrau/50 transition-transform group-open:rotate-180"
              aria-hidden="true"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <ul className="grid gap-2 px-4 pb-4 pt-1 font-body text-sm leading-relaxed text-warmgrau/75">
            {[
              ...commonCampaignWritingTips,
              ...(draft.targetLevel === "Land"
                ? [
                    "Argumente: Warum braucht das Thema eine landesweite politische Entscheidung?",
                    "Anschluss: Formuliere eine konkrete Bitte an die Landesregierung, ohne ein Ressort oder Ministerium zu raten.",
                  ]
                : [
                    "Argumente: Was ist für einzelne Abgeordnete oder ihre Fraktion relevant?",
                    "Anschluss: Bitte um eine konkrete politische Handlung, ohne Zuständigkeiten zu erfinden.",
                  ]),
            ].map((tip) => (
              <li key={tip} className="grid grid-cols-[10px_1fr] gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-waldgruen/55" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </details>
        <textarea
          id="issueText"
          name="issueText"
          required
          minLength={issueTextMinChars}
          maxLength={issueTextMaxChars}
          rows={7}
          value={draft.issueText}
          onChange={(event) => updateDraft("issueText", event.target.value)}
          aria-invalid={Boolean(issueTextError)}
          aria-describedby={issueTextError ? "issueText-error issueText-meta" : "issueText-meta"}
          className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base leading-relaxed outline-none focus:border-waldgruen"
          placeholder={[
            "Vor mehreren Grundschulen entstehen morgens gefährliche Situationen.",
            "Viele Eltern fahren deshalb wieder mit dem Auto, obwohl sie lieber laufen oder Rad fahren würden.",
            "Die Politik sollte sichere Querungen, Tempo 30 und bessere Kontrollen priorisieren...",
          ].join(" ")}
        />
        <div
          id="issueText-meta"
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-body text-xs text-warmgrau/55"
        >
          <span>
            Mind. {issueTextMinChars} Zeichen, besser ab {issueTextBetterChars} Zeichen.
          </span>
          <span
            className={
              issueTextCharCount > 0 && issueTextCharCount < issueTextMinChars
                ? "font-semibold text-airmail-rot"
                : "font-semibold text-warmgrau/60"
            }
          >
            {issueTextCharCount}/{issueTextMaxChars.toLocaleString("de-DE")} Zeichen
          </span>
        </div>
        {issueTextError && (
          <p id="issueText-error" className="font-body text-sm text-airmail-rot">
            {issueTextError}
          </p>
        )}
      </div>

      <fieldset className="grid gap-3">
        <legend className="font-typewriter text-sm font-bold text-waldgruen-dark">
          Wohin soll die Kampagne gehen?
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {targetLevelOptions.map((option) => {
            const isSelected = draft.targetLevel === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors ${
                  isSelected
                    ? "border-waldgruen bg-waldgruen/5"
                    : "border-warmgrau/20 bg-white hover:border-waldgruen/40"
                }`}
              >
                <input
                  type="radio"
                  name="targetLevel"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => {
                    if (option.value === "Land") updateTargetMode("default");
                    updateDraft("targetLevel", option.value);
                  }}
                  className="mt-1 h-4 w-4 shrink-0 border-warmgrau/30 text-waldgruen accent-waldgruen"
                />
                <span className="grid gap-0.5">
                  <span className="font-body text-base font-semibold text-waldgruen-dark">
                    {option.title}
                  </span>
                  <span className="font-body text-sm leading-relaxed text-warmgrau/65">
                    {option.text}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {draft.targetLevel === "Bund" && (
          <div className="rounded-md border border-waldgruen/20 bg-waldgruen/5 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={draft.targetMode === "specific"}
                onChange={(event) => updateTargetMode(event.target.checked ? "specific" : "default")}
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
            {draft.targetMode === "specific" && (
              <div className="mt-4 border-t border-waldgruen/15 pt-4">
                <MdbCampaignSelector
                  selectedIds={draft.targetPoliticianIds}
                  onChange={updateTargetPoliticianIds}
                />
                {fieldError(result, "targetPoliticianIds") && (
                  <p className="mt-2 font-body text-sm text-airmail-rot">
                    {fieldError(result, "targetPoliticianIds")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        {draft.targetLevel === "Land" && (
          <div className="grid gap-2">
            <label
              className="font-typewriter text-sm font-bold text-waldgruen-dark"
              htmlFor="targetState"
            >
              Bundesland
            </label>
            <select
              id="targetState"
              name="targetState"
              value={draft.targetState}
              onChange={(event) => updateDraft("targetState", event.target.value)}
              aria-describedby="targetState-help"
              className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
            >
              <option value="">Alle Bundesländer</option>
              {Object.entries(BUNDESLAND_NAMES).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
            <p id="targetState-help" className="font-body text-sm text-warmgrau/60">
              Wähle ein festes Bundesland, oder lass &quot;Alle Bundesländer&quot; stehen, dann entscheidet die PLZ der schreibenden Person.
            </p>
          </div>
        )}
      </fieldset>

      <div className="grid gap-2">
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="slug">
          Kurzadresse
        </label>
        <div className="grid overflow-hidden rounded-md border border-warmgrau/20 bg-white sm:grid-cols-[auto_1fr]">
          <span className="flex min-w-0 items-center border-b border-warmgrau/15 bg-creme/60 px-3 py-2 font-body text-xs text-warmgrau/60 sm:border-b-0 sm:border-r sm:px-4 sm:py-0 sm:text-sm">
            brief-nach-berlin.de/kampagne/
          </span>
          <input
            id="slug"
            name="slug"
            required
            value={draft.slug}
            onChange={(event) => {
              setSlugManuallyEdited(true);
              setDraft((currentDraft) => {
                const nextDraft = { ...currentDraft, slug: event.target.value };
                window.localStorage.setItem(
                  draftStorageKey,
                  JSON.stringify({ ...nextDraft, slugManuallyEdited: true })
                );
                return nextDraft;
              });
            }}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={Boolean(slugError)}
            aria-describedby={slugError ? "slug-error" : undefined}
            className="min-w-0 bg-transparent px-3 py-3 font-body text-base outline-none sm:px-4"
            placeholder="sichere-schulwege"
          />
        </div>
        <p className="font-body text-sm text-warmgrau/60">
          Wird aus dem Titel vorgeschlagen. Du kannst die Kurzadresse anpassen. Mit
          Bindestrichen lässt sie sich leichter lesen und aufschreiben; für Radio,
          Podcast oder Fernsehen funktionieren beide Varianten.
        </p>
        <div className="grid gap-2 rounded-md border border-waldgruen/12 bg-waldgruen/5 px-3 py-3">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-waldgruen/65">
              Empfohlen zum Teilen
            </p>
            <p className="mt-1 break-all font-body text-sm text-waldgruen-dark">
              brief-nach-berlin.de/kampagne/{normalizedSlug || "..."}
            </p>
          </div>
          {hasCompactSlug ? (
            <>
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-waldgruen/65">
                  Für gesprochene Weitergabe
                </p>
                <p className="mt-1 break-all font-body text-sm text-waldgruen-dark">
                  brief-nach-berlin.de/kampagne/{normalizedCompactSlug || "..."}
                </p>
              </div>
              <p className="font-body text-xs leading-relaxed text-warmgrau/65">
                Beide Adressen führen zur selben Kampagne.
              </p>
            </>
          ) : (
            <p className="font-body text-xs leading-relaxed text-warmgrau/65">
              Diese Kurzadresse enthält keine Bindestriche und hat deshalb keine zweite
              Variante.
            </p>
          )}
        </div>
        {slugError && (
          <p id="slug-error" className="font-body text-sm text-airmail-rot">
            {slugError}
          </p>
        )}
      </div>

        </>
      )}

      {step === 2 && (
        <>
          <div className="grid gap-4 rounded-md bg-waldgruen/5 px-4 py-4">
            <div>
              <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/65">
                Empfohlen
              </p>
              <h2 className="mt-1 font-typewriter text-xl font-bold leading-tight text-waldgruen-dark">
                Mach die Kampagne vertrauenswürdiger.
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/70">
                Für NGOs, Initiativen und Verantwortliche helfen Bild, Link und Kurzbeschreibung. Du kannst diese Angaben aber auch später ergänzen.
              </p>
            </div>

            <div className="grid gap-3 rounded-md border border-warmgrau/12 bg-white/65 p-4 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-warmgrau/50">
                  Öffentlich sichtbar
                </p>
                <p className="mt-1 font-body text-sm font-semibold text-waldgruen-dark">
                  {draft.title || "Deine Kampagne"} von {draft.creatorName || "deinem Absender"}
                </p>
                <p className="mt-1 break-all font-body text-xs text-warmgrau/60">
                  brief-nach-berlin.de/kampagne/{normalizedSlug || "..."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 justify-self-start rounded-md border border-waldgruen/20 px-2.5 py-1.5 font-body text-sm font-semibold text-waldgruen transition-colors hover:border-waldgruen hover:bg-waldgruen/5 sm:justify-self-end"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path
                    d="M9.8 3.1l3.1 3.1M2.8 13.2l2.7-.5 7.1-7.1a2.2 2.2 0 0 0-3.1-3.1L2.4 9.6 1.9 12.3c-.1.6.3 1 .9.9z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                ändern
              </button>
            </div>

          <div className="grid gap-2">
            <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="logo">
              Logo oder Bild
            </label>
            <div className="grid gap-3 rounded-md border border-warmgrau/15 bg-white/45 p-4 sm:grid-cols-[72px_1fr] sm:items-center">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                aria-label="Logo oder Bild auswählen"
                className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-md border border-warmgrau/18 bg-white transition-colors hover:border-waldgruen focus:border-waldgruen focus:outline-none"
              >
                {logoPreviewUrl ? (
                  <div
                    aria-hidden="true"
                    className="h-full w-full p-1.5"
                    style={{
                      backgroundImage: `url(${logoPreviewUrl})`,
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
              </button>
              <div className="grid gap-2">
                <input
                  ref={logoInputRef}
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={updateLogo}
                  aria-invalid={Boolean(logoError || logoServerError)}
                  aria-describedby={logoError || logoServerError ? "logo-error" : "logo-help"}
                  className="sr-only"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="rounded-md bg-waldgruen px-3 py-2 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
                  >
                    Bild auswählen
                  </button>
                  <span className="font-body text-sm text-warmgrau/60">
                    {logoFileName ? `Ausgewählt: ${logoFileName}` : "Noch kein Bild ausgewählt"}
                  </span>
                </div>
                <p id="logo-help" className="font-body text-sm text-warmgrau/60">
                  Ein quadratisches Logo oder Bild wirkt am besten. Wir verkleinern es vor dem Hochladen.
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
            <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="externalUrl">
              Link zu deiner Website
            </label>
            <input
              id="externalUrl"
              name="externalUrl"
              type="text"
              inputMode="url"
              maxLength={500}
              value={draft.externalUrl}
              onChange={(event) => updateDraft("externalUrl", event.target.value)}
              aria-invalid={Boolean(externalUrlError)}
              aria-describedby={externalUrlError ? "externalUrl-error" : undefined}
              className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
              placeholder="www.ngo.de/schulwege-petition"
            />
            {externalUrlError && (
              <p id="externalUrl-error" className="font-body text-sm text-airmail-rot">
                {externalUrlError}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="description">
                Kurze Beschreibung
              </label>
              <span
                className={`font-body text-sm ${
                  draft.description.length >= campaignDescriptionMaxChars
                    ? "text-airmail-rot"
                    : "text-warmgrau/60"
                }`}
                aria-live="polite"
              >
                {draft.description.length} / {campaignDescriptionMaxChars} Zeichen
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              maxLength={campaignDescriptionMaxChars}
              rows={3}
              value={draft.description}
              onChange={(event) =>
                updateDraft("description", event.target.value.slice(0, campaignDescriptionMaxChars))
              }
              aria-invalid={Boolean(descriptionError)}
              aria-describedby={descriptionError ? "description-error" : undefined}
              className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base leading-relaxed outline-none focus:border-waldgruen"
              placeholder="Wir sind eine lokale Initiative für sichere Wege zur Schule und setzen uns für kinderfreundliche Mobilität ein. Diese Kampagne soll zeigen, wie viele Menschen jetzt sichere Querungen und Tempo 30 erwarten."
            />
            {descriptionError && (
              <p id="description-error" className="font-body text-sm text-airmail-rot">
                {descriptionError}
              </p>
            )}
          </div>
        </div>

      <div className="grid gap-2 border-t border-warmgrau/12 pt-5">
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="creatorEmail">
          Deine E-Mail
        </label>
        <input
          id="creatorEmail"
          name="creatorEmail"
          type="email"
          required
          value={draft.creatorEmail}
          onChange={(event) => updateDraft("creatorEmail", event.target.value)}
          aria-invalid={Boolean(creatorEmailError)}
          aria-describedby={creatorEmailError ? "creatorEmail-error" : "creatorEmail-help"}
          className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
          placeholder="name@organisation.de"
        />
        <p id="creatorEmail-help" className="font-body text-sm text-warmgrau/60">
          Hierhin geht dein Freischaltlink, und später der Link zum Verwalten.
        </p>
        {creatorEmailError && (
          <p id="creatorEmail-error" className="font-body text-sm text-airmail-rot">
            {creatorEmailError}
          </p>
        )}
      </div>

      <div className="rounded-md border border-airmail-rot/20 bg-airmail-rot/5 px-4 py-4">
        <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-airmail-rot/80">
          Verantwortung
        </p>
        <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/75">
          Die Kampagne erscheint mit deinem Anliegen öffentlich. Brief-nach-Berlin stellt nur die Infrastruktur bereit. Für Titel, Beschreibung, Logo/Bild, externe Links und den vorbereiteten Kampagnentext bist du als Privatperson oder Organisation verantwortlich.
        </p>
        <label className="mt-3 flex items-start gap-3 font-body text-sm leading-relaxed text-warmgrau/80">
          <input
            name="responsibilityAccepted"
            type="checkbox"
            required
            aria-invalid={Boolean(responsibilityError)}
            aria-describedby={responsibilityError ? "responsibility-error" : undefined}
            className="mt-1 h-4 w-4 rounded border-warmgrau/30 text-waldgruen accent-waldgruen"
          />
          <span>
            Ich bestätige, dass ich diese Kampagne starten darf und für die bereitgestellten Inhalte verantwortlich bin.
          </span>
        </label>
        {responsibilityError && (
          <p id="responsibility-error" className="mt-2 font-body text-sm text-airmail-rot">
            {responsibilityError}
          </p>
        )}
      </div>
        </>
      )}

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

      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-waldgruen-dark/45 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-confirm-title"
            className="w-full max-w-lg rounded-xl border border-warmgrau/15 bg-creme p-5 shadow-xl md:p-6"
          >
            <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
              Bitte kurz prüfen
            </p>
            <h2
              id="campaign-confirm-title"
              className="mt-2 font-typewriter text-2xl font-bold leading-tight text-waldgruen-dark"
            >
              Stimmen E-Mail und öffentliche Kampagnendaten?
            </h2>
            <dl className="mt-5 grid gap-3 rounded-md border border-warmgrau/15 bg-white/70 p-4">
              <div>
                <dt className="font-body text-xs font-semibold uppercase tracking-wide text-warmgrau/50">
                  Aufrufbare Adressen
                </dt>
                <dd className="mt-1 grid gap-2 font-body text-sm font-semibold text-waldgruen-dark">
                  <div>
                    <span className="block text-xs font-normal text-warmgrau/60">
                      Mit Bindestrichen – empfohlen zum Teilen
                    </span>
                    <span className="block break-all">
                      brief-nach-berlin.de/kampagne/{normalizedSlug || "..."}
                    </span>
                  </div>
                  {hasCompactSlug ? (
                    <div>
                      <span className="block text-xs font-normal text-warmgrau/60">
                        Ohne Bindestriche – für Radio, Podcast oder Fernsehen
                      </span>
                      <span className="block break-all">
                        brief-nach-berlin.de/kampagne/{normalizedCompactSlug || "..."}
                      </span>
                    </div>
                  ) : (
                    <span className="block text-xs font-normal text-warmgrau/60">
                      Diese Kurzadresse enthält keine Bindestriche und hat deshalb keine
                      zweite Variante.
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-body text-xs font-semibold uppercase tracking-wide text-warmgrau/50">
                  E-Mail
                </dt>
                <dd className="mt-1 break-all font-body text-sm font-semibold text-waldgruen-dark">
                  {draft.creatorEmail || "..."}
                </dd>
              </div>
              <div>
                <dt className="font-body text-xs font-semibold uppercase tracking-wide text-warmgrau/50">
                  Kampagne
                </dt>
                <dd className="mt-1 font-body text-sm font-semibold text-waldgruen-dark">
                  {draft.title || "..."}
                </dd>
              </div>
              <div>
                <dt className="font-body text-xs font-semibold uppercase tracking-wide text-warmgrau/50">
                  Absender
                </dt>
                <dd className="mt-1 font-body text-sm font-semibold text-waldgruen-dark">
                  {draft.creatorName || "..."}
                </dd>
              </div>
            </dl>
            <p className="mt-4 font-body text-sm leading-relaxed text-warmgrau/75">
              Nach dem Klick schicken wir dir eine E-Mail. Erst wenn du den Link darin bestätigst, wird die Kampagne öffentlich und du bekommst den Verwaltungslink.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={isPending}
                className="rounded-md border border-waldgruen/25 px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen disabled:cursor-wait disabled:opacity-70"
              >
                Ändern
              </button>
              <button
                type="button"
                onClick={submitCampaign}
                disabled={isPending}
                className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-wait disabled:opacity-70"
              >
                {isPending ? "Wird geprüft..." : "Ja, Kampagne anlegen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 1 ? (
        <button
          type="button"
          onClick={continueToSecondStep}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-wait disabled:opacity-70"
        >
          Weiter zu Bild, Kontext und Freigabe
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={isPending}
            className="rounded-md border border-waldgruen/25 px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen disabled:cursor-wait disabled:opacity-70"
          >
            Zurück
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-wait disabled:opacity-70"
          >
            {isPending ? "Wird geprüft..." : "Kampagne anlegen"}
          </button>
        </div>
      )}
    </form>
  );
}
