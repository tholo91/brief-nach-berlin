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

const initialResult: CreateCampaignDraftResult | null = null;
const draftStorageKey = "bnb_creator_campaign_draft";
const maxClientLogoBytes = 4 * 1024 * 1024;
const maxLogoDisplaySize = 512;
const acceptedLogoTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const draftFields = [
  "title",
  "issueText",
  "slug",
  "creatorName",
  "externalUrl",
  "description",
  "creatorEmail",
] as const;
type DraftField = (typeof draftFields)[number];
type CampaignDraft = Record<DraftField, string>;
const emptyDraft: CampaignDraft = {
  title: "",
  issueText: "",
  slug: "",
  creatorName: "",
  externalUrl: "",
  description: "",
  creatorEmail: "",
};

function fieldError(
  result: CreateCampaignDraftResult | null,
  field: string
): string | undefined {
  return result?.ok === false ? result.fieldErrors?.[field] : undefined;
}

function slugPreview(value: string): string {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
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
  const [result, setResult] = useState(initialResult);
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<CampaignDraft>(emptyDraft);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const normalizedSlug = useMemo(() => slugPreview(draft.slug), [draft.slug]);
  const titleError = fieldError(result, "title");
  const issueTextError = fieldError(result, "issueText");
  const slugError = fieldError(result, "slug");
  const creatorEmailError = fieldError(result, "creatorEmail");
  const externalUrlError = fieldError(result, "externalUrl");
  const descriptionError = fieldError(result, "description");
  const responsibilityError = fieldError(result, "responsibilityAccepted");
  const logoServerError = fieldError(result, "logo");

  useEffect(() => {
    const rawDraft = window.localStorage.getItem(draftStorageKey);
    if (!rawDraft) return;

    try {
      const savedDraft = JSON.parse(rawDraft) as Partial<Record<DraftField, string>>;
      const nextDraft = {
        ...emptyDraft,
        ...Object.fromEntries(
          draftFields.map((field) => [
            field,
            typeof savedDraft[field] === "string" ? savedDraft[field] : "",
          ])
        ),
      };
      window.setTimeout(() => setDraft(nextDraft), 0);
    } catch {
      window.localStorage.removeItem(draftStorageKey);
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
      window.localStorage.setItem(draftStorageKey, JSON.stringify(nextDraft));
      return nextDraft;
    });
  }

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

  async function submitConfirmedCampaign() {
    const form = formRef.current;
    if (!form || isPending || logoError) return;

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
      if (nextResult.ok) {
        window.localStorage.removeItem(draftStorageKey);
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
        if (logoError) return;
        if (!event.currentTarget.reportValidity()) return;
        setResult(null);
        setConfirmOpen(true);
      }}
    >
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
          onChange={(event) => updateDraft("title", event.target.value)}
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
        <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="issueText">
          Anliegen
        </label>
        <p id="issueText-help" className="font-body text-sm text-warmgrau/60">
          Du musst keinen Brief schreiben. Beschreibe nur das Anliegen und deine Forderungen so detailliert wie möglich. Das Tool formuliert daraus später individuelle Briefentwürfe, personalisiert für jede Person in ihrem Wahlkreis.
        </p>
        <textarea
          id="issueText"
          name="issueText"
          required
          minLength={20}
          maxLength={4000}
          rows={7}
          value={draft.issueText}
          onChange={(event) => updateDraft("issueText", event.target.value)}
          aria-invalid={Boolean(issueTextError)}
          aria-describedby={issueTextError ? "issueText-error" : "issueText-help"}
          className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base leading-relaxed outline-none focus:border-waldgruen"
          placeholder="Zum Beispiel: Was ist das Problem? Wo passiert es? Was soll sich politisch ändern? Stichpunkte oder ein normaler kurzer Absatz reichen."
        />
        {issueTextError && (
          <p id="issueText-error" className="font-body text-sm text-airmail-rot">
            {issueTextError}
          </p>
        )}
      </div>

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
            onChange={(event) => updateDraft("slug", event.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={Boolean(slugError)}
            aria-describedby={slugError ? "slug-error" : undefined}
            className="min-w-0 bg-transparent px-3 py-3 font-body text-base outline-none sm:px-4"
            placeholder="sichere-schulwege"
          />
        </div>
        {slugError && (
          <p id="slug-error" className="font-body text-sm text-airmail-rot">
            {slugError}
          </p>
        )}
      </div>

      <details className="group rounded-md border border-warmgrau/15 bg-white/40 px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between font-typewriter text-sm font-bold text-waldgruen-dark">
          Absender, Logo und Kontext hinzufügen (optional)
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 text-warmgrau/50 transition-transform group-open:rotate-180"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="creatorName">
              Name oder Organisation
            </label>
            <input
              id="creatorName"
              name="creatorName"
              maxLength={120}
              value={draft.creatorName}
              onChange={(event) => updateDraft("creatorName", event.target.value)}
              className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
              placeholder="Initiative Musterstadt"
            />
            <p className="font-body text-sm text-warmgrau/60">
              Wird auf der Kampagnenseite angezeigt, wenn du es ausfüllst.
            </p>
          </div>

          <div className="grid gap-2">
            <label className="font-typewriter text-sm font-bold text-waldgruen-dark" htmlFor="logo">
              Logo
            </label>
            <div className="grid gap-3 rounded-md border border-warmgrau/15 bg-white/45 p-4 sm:grid-cols-[72px_1fr] sm:items-center">
              <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-md border border-warmgrau/18 bg-white">
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
                    Logo
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={updateLogo}
                  aria-invalid={Boolean(logoError || logoServerError)}
                  aria-describedby={logoError || logoServerError ? "logo-error" : "logo-help"}
                  className="font-body text-sm text-warmgrau file:mr-3 file:rounded-md file:border-0 file:bg-waldgruen file:px-3 file:py-2 file:font-body file:text-sm file:font-semibold file:text-creme hover:file:bg-waldgruen-dark"
                />
                <p id="logo-help" className="font-body text-sm text-warmgrau/60">
                  Quadratisch wirkt am besten. Wir verkleinern das Bild vor dem Hochladen.
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
              Externer Link
            </label>
            <input
              id="externalUrl"
              name="externalUrl"
              type="url"
              maxLength={500}
              value={draft.externalUrl}
              onChange={(event) => updateDraft("externalUrl", event.target.value)}
              aria-invalid={Boolean(externalUrlError)}
              aria-describedby={externalUrlError ? "externalUrl-error" : undefined}
              className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen"
              placeholder="https://..."
            />
            {externalUrlError && (
              <p id="externalUrl-error" className="font-body text-sm text-airmail-rot">
                {externalUrlError}
              </p>
            )}
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
              value={draft.description}
              onChange={(event) => updateDraft("description", event.target.value)}
              aria-invalid={Boolean(descriptionError)}
              aria-describedby={descriptionError ? "description-error" : undefined}
              className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base leading-relaxed outline-none focus:border-waldgruen"
              placeholder="Ein Satz Kontext, damit andere verstehen, warum diese Kampagne existiert."
            />
            {descriptionError && (
              <p id="description-error" className="font-body text-sm text-airmail-rot">
                {descriptionError}
              </p>
            )}
          </div>
        </div>
      </details>

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
          Die Kampagne erscheint mit deinem Anliegen öffentlich. Brief nach Berlin stellt nur das Werkzeug bereit. Für Titel, Beschreibung, Logo, externe Links und den vorbereiteten Kampagnentext bist du als Privatperson oder Organisation verantwortlich.
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

      <div className="rounded-md border border-waldgruen/15 bg-creme/70 px-4 py-3 font-body text-sm leading-relaxed text-warmgrau/75">
        Nach der Zusammenfassung schicken wir dir eine E-Mail. Erst wenn du den Link darin bestätigst, wird die Kampagne öffentlich und du bekommst den Verwaltungslink.
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
              Diese Daten sind später nicht einfach änderbar.
            </h2>
            <dl className="mt-5 grid gap-3 rounded-md border border-warmgrau/15 bg-white/70 p-4">
              <div>
                <dt className="font-body text-xs font-semibold uppercase tracking-wide text-warmgrau/50">
                  Kurzadresse
                </dt>
                <dd className="mt-1 break-all font-body text-sm font-semibold text-waldgruen-dark">
                  brief-nach-berlin.de/kampagne/{normalizedSlug || "..."}
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
            </dl>
            <p className="mt-4 font-body text-sm leading-relaxed text-warmgrau/75">
              Bitte bestätige nur, wenn die E-Mail-Adresse dir gehört und du die Verantwortung für die Kampagneninhalte als Privatperson oder Organisation übernehmen kannst.
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
                onClick={submitConfirmedCampaign}
                disabled={isPending}
                className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-wait disabled:opacity-70"
              >
                {isPending ? "Wird geprüft..." : "Ja, Kampagne anlegen"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Wird geprüft..." : "Kampagne anlegen"}
      </button>
    </form>
  );
}
