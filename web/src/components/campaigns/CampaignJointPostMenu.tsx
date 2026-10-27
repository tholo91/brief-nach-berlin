"use client";

import { useId } from "react";
import { useDismissableMenu } from "@/components/useDismissableMenu";
import { FOUNDER_CALENDLY } from "@/lib/config";
import { campaignJointPostHref } from "@/lib/contact";

const ITEM_CLASS =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-warmgrau/80 transition-colors duration-200 hover:bg-waldgruen/5 hover:text-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-waldgruen";

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function CampaignJointPostMenu({ slug }: { slug: string }) {
  const { open, setOpen, containerRef, triggerRef } = useDismissableMenu();
  const menuId = useId();

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-waldgruen px-4 py-2.5 text-center font-body text-sm font-semibold text-creme transition-[background-color,transform] duration-200 hover:bg-waldgruen-dark active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen sm:w-auto"
      >
        Gemeinsamen Post planen
        <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Gemeinsamen Post planen"
          className="absolute bottom-full left-0 z-20 mb-2 min-w-56 rounded-2xl border border-waldgruen/15 bg-creme p-2 shadow-lg shadow-warmgrau/10"
        >
          <a role="menuitem" href={FOUNDER_CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={ITEM_CLASS}>
            <CalendarIcon />
            <span>Kurzen Call buchen</span>
          </a>
          <a role="menuitem" href={campaignJointPostHref(slug)} onClick={() => setOpen(false)} className={ITEM_CLASS}>
            <MailIcon />
            <span>Mail schreiben</span>
          </a>
        </div>
      )}
    </div>
  );
}
