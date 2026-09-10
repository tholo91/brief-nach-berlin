"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FOUNDER_INSTAGRAM, FOUNDER_LINKEDIN } from "@/lib/config";

function InstagramIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.8" r="1" className="fill-current stroke-none" /></svg>;
}

function LinkedInIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28z" /></svg>;
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
