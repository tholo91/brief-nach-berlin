"use client";

import { useId, useRef } from "react";
import type { CampaignFixedRecipientRecipient } from "@/lib/lookup/campaignFixedRecipient";

export function CampaignFixedRecipientBadge({
  recipient,
}: {
  recipient: CampaignFixedRecipientRecipient | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const pillClass = "mt-3 inline-flex min-h-11 w-full max-w-full items-center gap-2 rounded-full border border-waldgruen/20 bg-waldgruen/10 px-3 py-2 text-left font-body text-xs font-semibold text-waldgruen-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen sm:w-fit";

  if (!recipient) {
    return <span className={pillClass}>Fester Empfänger</span>;
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={pillClass}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <span className="shrink-0">Fester Empfänger:</span>
        <span className="min-w-0 truncate">{recipient.label}</span>
        <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-waldgruen" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </button>
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
        onClose={() => buttonRef.current?.focus()}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-waldgruen/20 bg-creme p-6 text-waldgruen-dark shadow-xl backdrop:bg-waldgruen-dark/40 sm:p-7"
      >
        <h2 id={titleId} className="font-body text-xl font-bold">Fester Empfänger</h2>
        <address className="mt-4 break-words font-body text-base not-italic leading-relaxed">
          {recipient.organizationName && <p className="font-semibold">{recipient.organizationName}</p>}
          {recipient.personName && <p>{recipient.personName}</p>}
          <p>{recipient.address.street} {recipient.address.houseNumber}</p>
          <p>{recipient.address.postalCode} {recipient.address.city}</p>
        </address>
        <p className="mt-4 font-body text-sm leading-relaxed text-warmgrau/75">Du kannst aus ganz Deutschland teilnehmen.</p>
        <button
          type="button"
          autoFocus
          onClick={() => dialogRef.current?.close()}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-waldgruen px-5 font-body text-sm font-semibold text-white hover:bg-waldgruen-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          Schließen
        </button>
      </dialog>
    </>
  );
}
