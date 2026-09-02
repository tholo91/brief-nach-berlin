import { createHash, timingSafeEqual } from "node:crypto";

export const INTERNAL_STATS_COOKIE = "bnb_stats_access";
export const INTERNAL_STATS_COOKIE_MAX_AGE = 8 * 60 * 60;

function digest(value: string): Buffer {
  return createHash("sha256").update(`brief-nach-berlin:stats:${value}`).digest();
}

function safeEqual(left: string, right: string): boolean {
  return timingSafeEqual(digest(left), digest(right));
}

export function isInternalStatsPasswordValid(
  password: string | null,
  configuredPassword: string | undefined,
): boolean {
  if (!password || !configuredPassword) return false;
  return safeEqual(password, configuredPassword);
}

export function isInternalStatsCookieValid(
  cookieValue: string | undefined,
  configuredPassword: string | undefined,
): boolean {
  if (!cookieValue || !configuredPassword) return false;
  return safeEqual(cookieValue, digest(configuredPassword).toString("hex"));
}

export function createInternalStatsCookieValue(password: string): string {
  return digest(password).toString("hex");
}
