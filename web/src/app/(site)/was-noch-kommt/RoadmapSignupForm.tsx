"use client";

import { useState, useTransition } from "react";
import {
  submitRoadmapSignupAction,
  type RoadmapEbene,
} from "@/lib/actions/submitRoadmapSignup";

// Mirrors the validation in submitRoadmapSignup.ts (Zod is the source of
// truth). We keep this here so the user gets instant feedback before the
// Server Action round-trip.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RoadmapSignupFormProps {
  // The level this form signs the user up for. Use 'alle' for a generic
  // "tell me about any new level" form.
  ebene: RoadmapEbene;
}

export function RoadmapSignupForm({ ebene }: RoadmapSignupFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadySignedUp, setAlreadySignedUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setErrorMessage("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    setErrorMessage(null);

    startTransition(async () => {
      const result = await submitRoadmapSignupAction({
        email: value,
        ebene,
      });
      if (result.ok) {
        setAlreadySignedUp(result.alreadySignedUp);
        setSubmitted(true);
        setEmail("");
        return;
      }
      setErrorMessage(result.message);
    });
  }

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-white border border-waldgruen/20 rounded-2xl px-6 py-8 sm:px-8 sm:py-10 shadow-sm"
      >
        <p className="font-handwriting text-3xl text-waldgruen-dark leading-none mb-3">
          {alreadySignedUp ? "Schon dabei." : "Danke."}
        </p>
        <p className="font-body text-base text-warmgrau leading-relaxed">
          {alreadySignedUp
            ? "Du stehst schon auf der Liste. Wir melden uns, sobald es so weit ist."
            : "Wir melden uns, sobald die Ebene live geht, voraussichtlich im Juni 2026. Eine einzige Mail, danach werden deine Daten gelöscht. Kein Newsletter, keine Weitergabe."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white border border-waldgruen/20 rounded-2xl px-6 py-8 sm:px-8 sm:py-10 shadow-sm"
    >
      <label
        htmlFor="roadmap-email"
        className="block font-body text-sm font-semibold text-warmgrau mb-2"
      >
        E-Mail-Adresse
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="roadmap-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="du@example.de"
          value={email}
          disabled={pending}
          onChange={(event) => {
            setEmail(event.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          className="flex-1 rounded-xl border border-warmgrau/25 bg-creme px-4 py-3 font-body text-base text-waldgruen-dark placeholder:text-warmgrau/40 focus:outline-none focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending}
          className={[
            "rounded-xl bg-waldgruen-dark text-creme font-body font-semibold px-6 py-3 transition-colors min-h-[44px]",
            pending
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-waldgruen cursor-pointer",
          ].join(" ")}
        >
          {pending ? "Wird gesendet…" : "Sag mir Bescheid"}
        </button>
      </div>
      {errorMessage ? (
        <p
          role="alert"
          className="mt-3 font-body text-sm text-airmail-rot"
        >
          {errorMessage}
        </p>
      ) : null}
      <p className="font-body text-xs text-warmgrau/70 leading-relaxed mt-4">
        Wir speichern nur E-Mail und Ebene. Eine Benachrichtigung, dann
        gelöscht. Kein Newsletter.
      </p>
    </form>
  );
}
