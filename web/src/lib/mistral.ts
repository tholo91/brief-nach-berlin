import { Mistral } from "@mistralai/mistralai";

export const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const RETRYABLE_HTTP_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const RETRYABLE_NETWORK_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
]);
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 400;
const MAX_JITTER_MS = 200;

export class MistralProviderUnavailableError extends Error {
  readonly statusCode: number;
  readonly attempts: number;
  constructor(statusCode: number, attempts: number, cause?: unknown) {
    super(`Mistral unavailable after ${attempts} attempt(s) (status ${statusCode})`);
    this.name = "MistralProviderUnavailableError";
    this.statusCode = statusCode;
    this.attempts = attempts;
    if (cause !== undefined) (this as { cause?: unknown }).cause = cause;
  }
}

function extractStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const e = err as { statusCode?: unknown; status?: unknown };
  if (typeof e.statusCode === "number") return e.statusCode;
  if (typeof e.status === "number") return e.status;
  return undefined;
}

function isRetryable(err: unknown): { retryable: boolean; status?: number } {
  const status = extractStatus(err);
  if (status !== undefined && RETRYABLE_HTTP_STATUS.has(status)) {
    return { retryable: true, status };
  }
  if (err && typeof err === "object") {
    const e = err as { name?: unknown; code?: unknown };
    if (e.name === "AbortError" || e.name === "TimeoutError") return { retryable: true };
    if (typeof e.code === "string" && RETRYABLE_NETWORK_CODES.has(e.code)) {
      return { retryable: true };
    }
  }
  return { retryable: false, status };
}

export async function withMistralRetry<T>(
  label: string,
  fn: () => Promise<T>,
  opts: { maxAttempts?: number } = {}
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? MAX_ATTEMPTS;
  let lastErr: unknown;
  let lastStatus: number | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const { retryable, status } = isRetryable(err);
      lastStatus = status;
      if (!retryable) throw err;
      if (attempt === maxAttempts) break;
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.floor(Math.random() * MAX_JITTER_MS);
      console.warn(
        `[mistral-retry] ${label} attempt ${attempt}/${maxAttempts} failed (status ${status ?? "n/a"}), retrying in ${delay}ms`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  if (lastStatus !== undefined && lastStatus >= 500) {
    throw new MistralProviderUnavailableError(lastStatus, maxAttempts, lastErr);
  }
  throw lastErr;
}
