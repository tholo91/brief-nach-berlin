"use client";

import { useMemo } from "react";
import { LetterPdfButton } from "@/components/schule/LetterPdfButton";
import type { Recipient } from "@/lib/lookup/rathausRecipient";
import { recipientEnvelope } from "@/lib/lookup/recipientEnvelope";
import { RathausAdresseButton } from "./RathausAdresseButton";

export function YouthLetterDraft({
  letterText,
  recipient = null,
  pdfDelivery = false,
}: {
  letterText: string;
  recipient?: Recipient | null;
  pdfDelivery?: boolean;
}) {
  const envelope = useMemo(() => (recipient ? recipientEnvelope(recipient) : null), [recipient]);

  return (
    <section aria-labelledby="youth-draft-heading" className="mt-6">
      <h2 id="youth-draft-heading" className="font-typewriter text-xl font-bold text-waldgruen-dark m-0">
        Dein Entwurf
      </h2>
      <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau">
        Schreib ihn von Hand ab und ergänze ein eigenes Erlebnis.
        {!pdfDelivery && " Eine Kopie kommt per Mail."}
      </p>
      <div className="mt-3 overflow-hidden rounded-sm border border-warmgrau/15 bg-white shadow-[0_20px_50px_-30px_rgba(27,67,50,0.45)]">
        <div
          aria-hidden="true"
          className="h-2 w-full"
          style={{
            background:
              "repeating-linear-gradient(-45deg, #c1121f 0 10px, #faf8f5 10px 15px, #1d3557 15px 25px, #faf8f5 25px 30px)",
          }}
        />
        <p className="m-0 max-w-prose whitespace-pre-line p-5 text-left font-body text-[17px] leading-[1.75] text-warmgrau sm:p-7">
          {letterText}
        </p>
      </div>
      {recipient?.kind === "rathaus" ? (
        <RathausAdresseButton recipient={recipient} className="mt-4" />
      ) : (
        envelope && (
          <div className="mt-4 rounded-xl border border-warmgrau/25 bg-creme/70 p-4">
            <h3 className="m-0 font-body text-sm font-semibold text-waldgruen-dark">Für den Umschlag</h3>
            <address className="mt-1 font-body text-base not-italic leading-relaxed text-warmgrau">
              {envelope.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
        )
      )}
      {pdfDelivery && envelope && <LetterPdfButton letterText={letterText} envelope={envelope} />}
    </section>
  );
}
