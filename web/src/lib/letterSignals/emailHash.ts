import { createHmac } from "node:crypto";

export function normalizeLetterSignalEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createLetterSignalEmailHash(email: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`letter-signal-email-v1:${normalizeLetterSignalEmail(email)}`, "utf8")
    .digest("hex");
}
