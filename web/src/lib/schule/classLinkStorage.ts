// Klassen-Link im Tab merken (sessionStorage), damit Reiterwechsel, Neuladen und
// der Wizard den Schulmodus nicht verlieren. Das Token selbst prüft nur der Server:
// Auf /schule?k=<token> wird es bei jedem Besuch neu verifiziert; ungültige Tokens
// werden hier gelöscht. Client-sicher (kein "server-only").

import { isValidKlasse } from "@/lib/schule/youth";

export const CLASS_LINK_STORAGE_KEY = "schule-class-link:v1";
export const CLASS_LINK_CHANGE_EVENT = "schule-class-link-change";

const MAX_TOKEN_LENGTH = 512;

export interface StoredClassLink {
  token: string;
  klasse: number;
  plz: string;
  delivery: "pdf" | "email";
  /** Ablauf des Tokens in ms seit 1970 (iat + Laufzeit), wie ihn der Server berechnet. */
  expiresAt: number;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function defaultStorage(): StorageLike | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null;
  }
}

function notifyChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CLASS_LINK_CHANGE_EVENT));
}

export function saveClassLink(link: StoredClassLink, storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(CLASS_LINK_STORAGE_KEY, JSON.stringify(link));
  } catch {
    // Privater Modus oder Kontingent: dann gilt der Link eben nur für diese Seite.
    return;
  }
  notifyChange();
}

export function clearClassLink(storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return;
  try {
    if (storage.getItem(CLASS_LINK_STORAGE_KEY) === null) return;
    storage.removeItem(CLASS_LINK_STORAGE_KEY);
  } catch {
    return;
  }
  notifyChange();
}

/** Gespeicherter Klassen-Link; abgelaufene oder kaputte Einträge werden entfernt. */
export function readClassLink(
  now: number = Date.now(),
  storage: StorageLike | null = defaultStorage()
): StoredClassLink | null {
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(CLASS_LINK_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredClassLink> | null;
    if (
      parsed &&
      typeof parsed.token === "string" &&
      parsed.token.length > 0 &&
      parsed.token.length <= MAX_TOKEN_LENGTH &&
      isValidKlasse(parsed.klasse) &&
      typeof parsed.plz === "string" &&
      /^\d{5}$/.test(parsed.plz) &&
      typeof parsed.expiresAt === "number" &&
      Number.isFinite(parsed.expiresAt) &&
      parsed.expiresAt > now
    ) {
      return {
        token: parsed.token,
        klasse: parsed.klasse,
        plz: parsed.plz,
        delivery: parsed.delivery === "pdf" ? "pdf" : "email",
        expiresAt: parsed.expiresAt,
      };
    }
  } catch {
    // fällt unten in den Aufräum-Zweig
  }
  try {
    storage.removeItem(CLASS_LINK_STORAGE_KEY);
  } catch {
    // egal
  }
  return null;
}

/** Link zur Schulseite; mit Token, damit der Server alles neu prüft und wiederherstellt. */
export function schuleHref(token: string | null | undefined): string {
  return token ? `/schule?k=${encodeURIComponent(token)}` : "/schule";
}
