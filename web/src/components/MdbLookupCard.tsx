"use client";

import { useId, useState, useTransition } from "react";
import { lookupMdbContactAction } from "@/lib/actions/lookupMdbContact";
import type { MdbContact } from "@/lib/lookup/mdbContact";

const AIRMAIL_EDGE =
  "repeating-linear-gradient(-45deg, var(--color-airmail-rot) 0 10px, var(--color-creme) 10px 15px, var(--color-airmail-blau) 15px 25px, var(--color-creme) 25px 30px)";

type State =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "done"; contacts: MdbContact[] };

const ERROR_COPY = {
  invalid: "Bitte gib eine Postleitzahl mit fünf Ziffern ein.",
  not_found: "Zu dieser Postleitzahl haben wir keinen Wahlkreis gefunden. Prüf die Ziffern noch einmal.",
} as const;

export function MdbLookupCard() {
  const inputId = useId();
  const [plz, setPlz] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await lookupMdbContactAction(plz);
      setState(
        result.ok
          ? { status: "done", contacts: result.contacts }
          : { status: "error", message: ERROR_COPY[result.reason] }
      );
    });
  }

  return (
    <section
      aria-labelledby={`${inputId}-title`}
      className="relative overflow-hidden rounded-2xl border border-warmgrau/15 bg-white shadow-sm"
    >
      <div aria-hidden className="h-2" style={{ background: AIRMAIL_EDGE }} />
      <div className="p-6 md:p-8">
        <h2
          id={`${inputId}-title`}
          className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark mb-2 text-balance"
        >
          Wer ist dein MdB, und wo sitzt das Büro?
        </h2>
        <p className="font-body text-warmgrau leading-relaxed mb-6 text-pretty">
          Gib deine Postleitzahl ein. Du bekommst den Namen, die Adresse des Wahlkreisbüros und
          einen Link zum Profil mit den Kontaktdaten.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor={inputId} className="block font-body text-sm font-semibold text-waldgruen-dark mb-1.5">
              Postleitzahl
            </label>
            <input
              id={inputId}
              name="plz"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              value={plz}
              onChange={(event) => setPlz(event.target.value.replace(/\D/g, ""))}
              placeholder="z. B. 28195"
              aria-describedby={state.status === "error" ? `${inputId}-error` : undefined}
              aria-invalid={state.status === "error"}
              className="w-full rounded-xl border border-warmgrau/25 bg-creme px-4 py-3 font-typewriter text-lg tracking-widest text-warmgrau placeholder:text-warmgrau/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
            />
          </div>
          <button
            type="submit"
            disabled={pending || plz.length !== 5}
            className="rounded-xl bg-waldgruen px-6 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Suche läuft" : "MdB anzeigen"}
          </button>
        </form>

        <div aria-live="polite" className="mt-6">
          {state.status === "error" ? (
            <p id={`${inputId}-error`} className="font-body text-airmail-rot">
              {state.message}
            </p>
          ) : null}

          {state.status === "done" ? (
            <div className="space-y-4">
              {state.contacts.length > 1 ? (
                <p className="font-body text-sm text-warmgrau/80">
                  {new Set(state.contacts.map((contact) => contact.wahlkreisName)).size > 1
                    ? "Deine Postleitzahl gehört zu mehreren Wahlkreisen. Such den heraus, in dem du wohnst."
                    : "Für deine Postleitzahl sind mehrere Abgeordnete eingetragen."}
                </p>
              ) : null}
              <ul className="space-y-4">
                {state.contacts.map((contact) => (
                  <li
                    key={contact.id}
                    className="rounded-xl border border-waldgruen/20 bg-waldgruen/5 p-5"
                  >
                    <p className="font-body text-lg font-bold text-waldgruen-dark">{contact.name}</p>
                    <p className="font-body text-sm text-warmgrau/80 mb-3">
                      {contact.party}, {contact.wahlkreisName}
                      {contact.isDirect ? ", direkt gewählt" : ""}
                    </p>
                    {contact.officeLines.length > 0 ? (
                      <address className="not-italic font-typewriter text-sm leading-relaxed text-warmgrau mb-4">
                        {contact.officeLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                    ) : (
                      <p className="font-body text-sm text-warmgrau/70 mb-4">
                        Ein Wahlkreisbüro ist im Profil nicht eingetragen.
                      </p>
                    )}
                    {contact.profileUrl ? (
                      <a
                        href={contact.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-xl bg-waldgruen px-5 py-2.5 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen-dark"
                      >
                        {contact.profileSource === "bundestag"
                          ? "Kontakt auf bundestag.de"
                          : "Profil auf abgeordnetenwatch.de"}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="font-body text-sm text-warmgrau/70 leading-relaxed">
                Die Telefonnummer steht meist auf der Homepage des Abgeordneten unter Kontakt oder
                Wahlkreisbüro.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
