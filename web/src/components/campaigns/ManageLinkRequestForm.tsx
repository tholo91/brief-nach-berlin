"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import {
  requestCampaignManageLinkAction,
  type RequestCampaignManageLinkResult,
} from "@/lib/actions/requestCampaignManageLink";

const ERROR_COPY = {
  validation: "Bitte gib eine gültige E-Mail-Adresse ein.",
  rate_limited:
    "Du hast schon mehrere Links angefordert. Schau in dein Postfach oder versuch es in einer Stunde noch mal.",
  server_error: "Das hat gerade nicht geklappt. Versuch es gleich noch mal.",
} as const;

export function ManageLinkRequestForm() {
  const [result, setResult] = useState<RequestCampaignManageLinkResult | null>(null);
  const [pending, startTransition] = useTransition();
  const titleRef = useRef<HTMLParagraphElement>(null);

  const succeeded = result?.ok === true;
  useEffect(() => {
    if (succeeded) titleRef.current?.focus();
  }, [succeeded]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const raw = new FormData(event.currentTarget).get("email");
    const email = typeof raw === "string" ? raw : "";
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await requestCampaignManageLinkAction(email));
      } catch {
        setResult({ ok: false, reason: "server_error" });
      }
    });
  }

  const error = result && !result.ok ? ERROR_COPY[result.reason] : null;

  return (
    <div aria-live="polite">
      {result?.ok ? (
        <div className="mt-6 rounded-xl border border-waldgruen/20 bg-white/60 px-5 py-4">
          <p
            ref={titleRef}
            tabIndex={-1}
            className="font-typewriter text-lg font-bold text-waldgruen-dark focus:outline-none"
          >
            Schau in dein Postfach
          </p>
          <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/75">
            Wenn zu dieser Adresse eine Kampagne gehört, ist der Link in ein paar Minuten da. Sieh auch im Spam-Ordner nach.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6">
          <label
            htmlFor="manage-link-email"
            className="font-typewriter text-sm font-bold text-waldgruen-dark"
          >
            E-Mail-Adresse deiner Kampagne
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="manage-link-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              placeholder="name@beispiel.de"
              disabled={pending}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "manage-link-error" : undefined}
              className="min-h-12 w-full min-w-0 rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen disabled:opacity-60 sm:flex-1"
            />
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className="min-h-12 w-full whitespace-nowrap rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen sm:w-auto sm:shrink-0"
            >
              {pending ? "Wird geschickt …" : "Neuen Link schicken"}
            </button>
          </div>
          {error && (
            <p
              id="manage-link-error"
              role="alert"
              className="mt-3 rounded-md border border-airmail-rot/25 bg-airmail-rot/5 px-4 py-3 font-body text-sm text-airmail-rot"
            >
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
