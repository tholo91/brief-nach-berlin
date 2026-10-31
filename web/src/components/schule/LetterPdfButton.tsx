"use client";

import { useEffect, useState } from "react";
import type { RecipientEnvelope } from "@/lib/lookup/recipientEnvelope";
import { DownloadIcon } from "./icons";

const FILE_NAME = "brief-nach-berlin-entwurf.pdf";
const buttonClass =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-waldgruen px-4 py-2.5 font-body text-base font-bold text-creme transition-colors hover:bg-waldgruen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70";

// Das PDF entsteht im Browser. Die Bibliothek lädt erst hier, nicht mit der Seite.
export function LetterPdfButton({ letterText, envelope }: { letterText: string; envelope: RecipientEnvelope }) {
  const [attempt, setAttempt] = useState(0);
  const [prepared, setPrepared] = useState<{ attempt: number; url?: string; failed?: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;
    import("@/lib/schule/letterPdf")
      .then(({ buildLetterPdf }) => buildLetterPdf({ letterText, envelope }))
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPrepared({ attempt, url });
      })
      .catch(() => {
        if (!cancelled) setPrepared({ attempt, failed: true });
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [letterText, envelope, attempt]);

  const current = prepared?.attempt === attempt ? prepared : null;

  return (
    <div className="mt-4">
      {current?.url ? (
        <a href={current.url} download={FILE_NAME} className={buttonClass}>
          <DownloadIcon />
          PDF speichern
        </a>
      ) : current?.failed ? (
        <>
          <p role="alert" className="mb-2 font-body text-sm text-airmail-rot">
            Das PDF ließ sich nicht erstellen. Dein Entwurf steht weiter oben, du kannst ihn auch direkt abschreiben.
          </p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className={buttonClass}>
            <DownloadIcon />
            Noch einmal versuchen
          </button>
        </>
      ) : (
        <button type="button" disabled aria-busy="true" className={buttonClass}>
          <DownloadIcon />
          PDF wird vorbereitet...
        </button>
      )}
      <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau">
        Speicher das PDF, bevor du die Seite schließt. Auf dem iPad: Teilen, dann „In Dateien sichern“.
      </p>
    </div>
  );
}
