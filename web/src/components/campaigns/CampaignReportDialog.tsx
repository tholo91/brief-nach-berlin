"use client";

import { useId, useRef, useState, useTransition } from "react";
import { reportCampaignAction } from "@/lib/actions/reportCampaign";
import {
  CAMPAIGN_REPORT_MESSAGE_MAX,
  CAMPAIGN_REPORT_MESSAGE_MIN,
  CAMPAIGN_REPORT_REASONS,
  CAMPAIGN_REPORT_REASON_LABELS,
  CAMPAIGN_REPORT_ROLES,
  CAMPAIGN_REPORT_ROLE_LABELS,
} from "@/lib/campaigns/reportOptions";

type FieldName = "reason" | "role" | "message" | "reporterEmail" | "goodFaith";
type Errors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["reason", "role", "message", "reporterEmail", "goodFaith"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fieldClass =
  "mt-1.5 block min-h-11 w-full rounded-md border border-waldgruen/25 bg-white px-3 py-2 font-body text-base text-waldgruen-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen aria-[invalid=true]:border-red-700";
const labelClass = "block font-body text-sm font-semibold text-waldgruen-dark";
const hintClass = "mt-1 font-body text-xs leading-relaxed text-warmgrau/70";
const errorClass = "mt-1 font-body text-xs font-semibold text-red-800";

export function CampaignReportDialog({ slug }: { slug: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const ids = {
    reason: `${baseId}-reason`,
    role: `${baseId}-role`,
    message: `${baseId}-message`,
    reporterEmail: `${baseId}-email`,
    goodFaith: `${baseId}-goodfaith`,
  } satisfies Record<FieldName, string>;

  const [reason, setReason] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [goodFaith, setGoodFaith] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");
  const [sentWithEmail, setSentWithEmail] = useState(false);
  const [pending, startTransition] = useTransition();

  function reset() {
    setReason("");
    setRole("");
    setMessage("");
    setReporterEmail("");
    setGoodFaith(false);
    setErrors({});
    setStatus("idle");
    setSentWithEmail(false);
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!(CAMPAIGN_REPORT_REASONS as readonly string[]).includes(reason)) {
      next.reason = "Bitte wähl aus, was nicht stimmt.";
    }
    if (!(CAMPAIGN_REPORT_ROLES as readonly string[]).includes(role)) {
      next.role = "Bitte wähl aus, wer du bist.";
    }
    const trimmed = message.trim();
    if (trimmed.length < CAMPAIGN_REPORT_MESSAGE_MIN || trimmed.length > CAMPAIGN_REPORT_MESSAGE_MAX) {
      next.message = `Bitte beschreib es in mindestens ${CAMPAIGN_REPORT_MESSAGE_MIN} Zeichen.`;
    }
    const email = reporterEmail.trim();
    if (email && (email.length > 200 || !EMAIL_PATTERN.test(email))) {
      next.reporterEmail = "Die E-Mail-Adresse sieht nicht vollständig aus.";
    }
    if (!goodFaith) {
      next.goodFaith = "Bitte bestätige, dass du nach bestem Wissen meldest.";
    }
    return next;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const next = validate();
    setErrors(next);
    const firstInvalid = FIELD_ORDER.find((name) => next[name]);
    if (firstInvalid) {
      document.getElementById(ids[firstInvalid])?.focus();
      return;
    }
    const email = reporterEmail.trim();
    startTransition(async () => {
      let ok = false;
      try {
        const result = await reportCampaignAction({
          slug,
          reason,
          role,
          message: message.trim(),
          reporterEmail: email || undefined,
          goodFaith,
        });
        ok = result.success;
      } catch {
        ok = false;
      }
      if (ok) {
        setSentWithEmail(Boolean(email));
        setStatus("success");
      } else {
        setStatus("failed");
      }
    });
  }

  function describedBy(name: FieldName, extra?: string): string | undefined {
    const parts = [extra, errors[name] ? `${ids[name]}-error` : undefined].filter(Boolean);
    return parts.length ? parts.join(" ") : undefined;
  }

  return (
    <>
      <p className="mt-6 font-body text-xs text-warmgrau/45">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          onClick={() => dialogRef.current?.showModal()}
          className="inline-flex min-h-11 items-center hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          Stimmt was nicht?
        </button>
      </p>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          ) {
            dialogRef.current?.close();
          }
        }}
        onClose={() => {
          if (status === "success") reset();
          triggerRef.current?.focus();
        }}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-waldgruen/20 bg-creme p-6 text-waldgruen-dark shadow-xl backdrop:bg-waldgruen-dark/40 sm:p-7"
      >
        <h2 id={titleId} className="font-body text-xl font-bold">Stimmt was nicht?</h2>

        {status === "success" ? (
          <div>
            <p role="status" className="mt-4 font-body text-base leading-relaxed">
              Danke, ist angekommen. Ich schaue drauf.
              {sentWithEmail && " Du bekommst gleich eine Bestätigung per Mail."}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => dialogRef.current?.close()}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-waldgruen px-5 font-body text-sm font-semibold text-white hover:bg-waldgruen-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
            >
              Schließen
            </button>
          </div>
        ) : (
          <>
            <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/75">
              Deine Nachricht geht an die Person hinter der Kampagne und an Brief-nach-Berlin.
            </p>
            <form noValidate onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor={ids.reason} className={labelClass}>Was stimmt nicht?</label>
                <select
                  id={ids.reason}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  aria-invalid={errors.reason ? true : undefined}
                  aria-describedby={describedBy("reason")}
                  className={fieldClass}
                >
                  <option value="" disabled>Bitte auswählen</option>
                  {CAMPAIGN_REPORT_REASONS.map((value) => (
                    <option key={value} value={value}>{CAMPAIGN_REPORT_REASON_LABELS[value]}</option>
                  ))}
                </select>
                {errors.reason && <p id={`${ids.reason}-error`} className={errorClass}>{errors.reason}</p>}
              </div>

              <div>
                <label htmlFor={ids.role} className={labelClass}>Ich bin</label>
                <select
                  id={ids.role}
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  aria-invalid={errors.role ? true : undefined}
                  aria-describedby={describedBy("role")}
                  className={fieldClass}
                >
                  <option value="" disabled>Bitte auswählen</option>
                  {CAMPAIGN_REPORT_ROLES.map((value) => (
                    <option key={value} value={value}>{CAMPAIGN_REPORT_ROLE_LABELS[value]}</option>
                  ))}
                </select>
                {errors.role && <p id={`${ids.role}-error`} className={errorClass}>{errors.role}</p>}
              </div>

              <div>
                <label htmlFor={ids.message} className={labelClass}>Was genau?</label>
                <textarea
                  id={ids.message}
                  rows={4}
                  maxLength={CAMPAIGN_REPORT_MESSAGE_MAX}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={describedBy("message", `${ids.message}-hint`)}
                  className={fieldClass}
                />
                <p id={`${ids.message}-hint`} className={hintClass}>Mindestens {CAMPAIGN_REPORT_MESSAGE_MIN} Zeichen.</p>
                {errors.message && <p id={`${ids.message}-error`} className={errorClass}>{errors.message}</p>}
              </div>

              <div>
                <label htmlFor={ids.reporterEmail} className={labelClass}>Deine E-Mail (optional)</label>
                <input
                  id={ids.reporterEmail}
                  type="email"
                  autoComplete="email"
                  value={reporterEmail}
                  onChange={(event) => setReporterEmail(event.target.value)}
                  aria-invalid={errors.reporterEmail ? true : undefined}
                  aria-describedby={describedBy("reporterEmail", `${ids.reporterEmail}-hint`)}
                  className={fieldClass}
                />
                <p id={`${ids.reporterEmail}-hint`} className={hintClass}>
                  Nur wenn du eine Antwort möchtest. Sieht nur Brief-nach-Berlin.
                </p>
                {errors.reporterEmail && (
                  <p id={`${ids.reporterEmail}-error`} className={errorClass}>{errors.reporterEmail}</p>
                )}
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <input
                    id={ids.goodFaith}
                    type="checkbox"
                    checked={goodFaith}
                    onChange={(event) => setGoodFaith(event.target.checked)}
                    aria-invalid={errors.goodFaith ? true : undefined}
                    aria-describedby={describedBy("goodFaith")}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-waldgruen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
                  />
                  <label htmlFor={ids.goodFaith} className="font-body text-sm leading-snug">
                    Ich mache diese Angaben nach bestem Wissen.
                  </label>
                </div>
                {errors.goodFaith && <p id={`${ids.goodFaith}-error`} className={errorClass}>{errors.goodFaith}</p>}
              </div>

              {status === "failed" && (
                <p role="alert" className="font-body text-sm font-semibold text-red-800">
                  Das hat nicht geklappt. Versuch es bitte in ein paar Minuten noch mal.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-waldgruen px-5 font-body text-sm font-semibold text-white hover:bg-waldgruen-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {pending ? "Wird gesendet …" : "Meldung senden"}
                </button>
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  className="inline-flex min-h-11 items-center px-2 font-body text-sm font-semibold text-warmgrau/75 hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </>
        )}
      </dialog>
    </>
  );
}
