"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FOUNDER_INSTAGRAM, FOUNDER_LINKEDIN } from "@/lib/config";

function InstagramIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.8" r="1" className="fill-current stroke-none" /></svg>;
}

function LinkedInIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M5.3 8.1H2.7V21h2.6V8.1ZM4 3a1.6 1.6 0 1 0 0 3.2A1.6 1.6 0 0 0 4 3ZM9.1 8.1H6.6V21h2.5v-6.4c0-1.7.3-3.4 2.5-3.4 2.2 0 2.2 2 2.2 3.5V21h2.6v-6.9c0-3.4-.7-6-4.6-6-1.9 0-3.1 1-3.6 1.9h-.1V8.1ZM18.9 8.1h2.4V21h-2.4V8.1Z" /></svg>;
}

export function SocialFollow({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return <div ref={containerRef} className="relative"><button ref={triggerRef} type="button" aria-expanded={open} aria-controls={menuId} aria-haspopup="menu" onClick={() => setOpen((current) => !current)} className="inline-flex items-center gap-2 rounded-full border border-waldgruen/20 px-3 py-1.5 font-body text-xs text-warmgrau/70 transition-colors duration-200 hover:border-waldgruen/45 hover:bg-waldgruen/5 hover:text-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"><span>{label}</span><svg aria-hidden="true" viewBox="0 0 16 16" className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m4 6 4 4 4-4" /></svg></button>{open && <div id={menuId} role="menu" aria-label={label} className="absolute left-0 top-full z-20 mt-2 min-w-44 rounded-2xl border border-waldgruen/15 bg-creme p-2 shadow-lg shadow-warmgrau/10"><a role="menuitem" href={FOUNDER_INSTAGRAM} target="_blank" rel="noopener noreferrer" title="Instagram" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-warmgrau/80 transition-colors duration-200 hover:bg-waldgruen/5 hover:text-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-waldgruen"><InstagramIcon /><span>Instagram</span></a><a role="menuitem" href={FOUNDER_LINKEDIN} target="_blank" rel="noopener noreferrer" title="LinkedIn" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-warmgrau/80 transition-colors duration-200 hover:bg-waldgruen/5 hover:text-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-waldgruen"><LinkedInIcon /><span>LinkedIn</span></a></div>}</div>;
}

export function SocialFollowIcons() {
  return <><a href={FOUNDER_INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-waldgruen/20 text-warmgrau/65 transition-colors duration-200 hover:border-waldgruen/45 hover:bg-waldgruen/5 hover:text-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"><InstagramIcon /></a><a href={FOUNDER_LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-waldgruen/20 text-warmgrau/65 transition-colors duration-200 hover:border-waldgruen/45 hover:bg-waldgruen/5 hover:text-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"><LinkedInIcon /></a></>;
}
