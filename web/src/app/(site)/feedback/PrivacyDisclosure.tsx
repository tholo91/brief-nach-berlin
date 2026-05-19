"use client";

import { useState } from "react";

export function PrivacyDisclosure() {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-xs text-warmgrau/60 hover:text-waldgruen underline underline-offset-2 decoration-warmgrau/30 hover:decoration-waldgruen transition-colors cursor-pointer"
      >
        Was passiert mit meinen Daten?
        <span
          aria-hidden="true"
          className={`text-[10px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {/* grid-rows trick: animates from 0fr (collapsed) to 1fr (auto-height). */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-lg border border-waldgruen/15 bg-creme/60 px-4 py-4 text-left text-sm text-warmgrau leading-relaxed space-y-3">
            <p>
              Wir speichern deine Bewertung in einer Datenbank
              (<strong>Supabase</strong>, Server in Frankfurt). Konkret landen
              dort:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Deine Sterne-Bewertung</li>
              <li>Dein Kommentar, falls du einen schreibst</li>
              <li>Dein Name oder Pseudonym, falls du einen angibst</li>
              <li>Dein Häkchen für die öffentliche Anzeige</li>
              <li>Deine Antwort, ob der Brief tatsächlich rausgeht</li>
              <li>Meine E-Mail-Adresse (aus dem Link in der Mail)</li>
              <li>Eine technische Verknüpfung zum erstellten Brief</li>
              <li>
                Einen anonymisierten Hash deiner IP-Adresse (nur Spam-Schutz,
                nicht zurückrechenbar)
              </li>
            </ul>
            <p>
              Wir benutzen deine E-Mail <strong>ausschließlich</strong> für
              eventuelle Rückfragen zu deiner Bewertung. Keine Newsletter, kein
              Marketing, keine Weitergabe.
            </p>
            <p>
              Wenn du das Häkchen „öffentlich zeigen" stehen lässt, kann deine
              Bewertung später anonymisiert auf brief-nach-berlin.de
              erscheinen, mit deinem Namen oder Pseudonym, falls du einen
              angegeben hast.{" "}
              <strong>Deine E-Mail wird niemals öffentlich gezeigt.</strong>
            </p>
            <p>
              Löschen kannst du deine Bewertung jederzeit, einfach eine Mail
              an{" "}
              <a
                href="mailto:datenschutz@brief-nach-berlin.de"
                className="text-waldgruen underline hover:text-waldgruen-dark"
              >
                datenschutz@brief-nach-berlin.de
              </a>
              .
            </p>
            <p className="text-xs text-warmgrau/70">
              Mehr Details:{" "}
              <a
                href="/datenschutz"
                className="underline hover:text-warmgrau"
              >
                Datenschutzerklärung
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
