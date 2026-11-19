"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  clearClassLink,
  readClassLink,
  saveClassLink,
  schuleHref,
  type StoredClassLink,
} from "@/lib/schule/classLinkStorage";
import type { JungEntry } from "./jungEntry";

// Entspricht der Token-Laufzeit (14 Tage), falls der Server keinen Ablauf mitgegeben hat.
const FALLBACK_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type ClassLinkSync =
  | { action: "save"; link: StoredClassLink }
  | { action: "clear" }
  | { action: "redirect"; href: string }
  | { action: "none" };

/**
 * Was die Schulseite mit dem Tab-Speicher tun soll:
 * gültiger Link -> merken, ungültiger -> vergessen (kein Redirect-Kreis),
 * kein Link in der URL, aber einer im Speicher -> mit ?k neu laden, damit der Server prüft.
 */
export function planClassLinkSync(
  entry: JungEntry,
  stored: StoredClassLink | null,
  now: number = Date.now()
): ClassLinkSync {
  if (entry.status === "valid") {
    return {
      action: "save",
      link: {
        token: entry.token,
        klasse: entry.klasse,
        plz: entry.plz,
        delivery: entry.delivery,
        expiresAt: entry.expiresAt ?? now + FALLBACK_TTL_MS,
      },
    };
  }
  if (entry.status === "invalid") return { action: "clear" };
  if (stored) return { action: "redirect", href: schuleHref(stored.token) };
  return { action: "none" };
}

export function useClassLinkPersistence(entry: JungEntry): void {
  const router = useRouter();
  useEffect(() => {
    const plan = planClassLinkSync(entry, readClassLink());
    if (plan.action === "save") saveClassLink(plan.link);
    else if (plan.action === "clear") clearClassLink();
    else if (plan.action === "redirect") router.replace(plan.href, { scroll: false });
  }, [entry, router]);
}
