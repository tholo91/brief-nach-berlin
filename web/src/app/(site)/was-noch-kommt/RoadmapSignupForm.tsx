"use client";

import { useState } from "react";

// TODO: wire to Supabase in separate task (see .planning/todos/pending/2026-05-21-roadmap-signup-supabase-wiring.md)
// For now this form is a visual placeholder: it validates the email shape,
// logs the submission to the console, and shows a success state.
// No data leaves the browser.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RoadmapSignupFormProps {
  ebene: "land" | "kommune" | "eu";
}

export function RoadmapSignupForm({ ebene }: RoadmapSignupFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setErrorMessage("Bitte gib eine gültige Email-Adresse ein.");
      return;
    }

    setErrorMessage(null);
    // TODO: wire to Supabase in separate task (see todo above).
    console.log("[roadmap-signup placeholder]", { ebene, email: value });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-white border border-waldgruen/20 rounded-2xl px-6 py-8 sm:px-8 sm:py-10 shadow-sm"
      >
        <p className="font-handwriting text-3xl text-waldgruen-dark leading-none mb-3">
          Danke.
        </p>
        <p className="font-body text-base text-warmgrau leading-relaxed">
          Wir melden uns, sobald die Landtag-Ebene live geht, voraussichtlich
          im Juni 2026. Eine einzige Mail, danach werden deine Daten gelöscht.
          Kein Newsletter, keine Weitergabe.
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
        Email-Adresse
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
          onChange={(event) => {
            setEmail(event.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          className="flex-1 rounded-xl border border-warmgrau/25 bg-creme px-4 py-3 font-body text-base text-waldgruen-dark placeholder:text-warmgrau/40 focus:outline-none focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20"
        />
        <button
          type="submit"
          className="rounded-xl bg-waldgruen-dark hover:bg-waldgruen text-creme font-body font-semibold px-6 py-3 transition-colors"
        >
          Sag mir Bescheid
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
        Wir speichern nur deine Email und die gewählte Ebene. Du bekommst eine
        einzige Mail, sobald die Ebene live geht. Danach werden deine Daten
        gelöscht. Kein Newsletter, keine Weitergabe.
      </p>
    </form>
  );
}
