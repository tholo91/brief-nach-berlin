import { Mistral } from "@mistralai/mistralai";

export const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Source of truth for Mistral model IDs. Touched here, mirrored in
// datenschutz/page.tsx + ki-transparenz/page.tsx + .env.example.
// Reviewed 2026-05-30 after Mistral deprecation email. Next review:
// before 2026-08-31 (mistral-medium-2508 retirement) or the next email.
export const MISTRAL_MODELS = {
  letter: "mistral-large-latest",
  moderation: "mistral-moderation-latest",
  transcription: "voxtral-mini-latest",
  levelRouting: "mistral-small-latest",
} as const;

export type MistralStage = "routing" | "generation";

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
const RATE_LIMIT_MAX_ATTEMPTS = 6;
const RATE_LIMIT_MIN_WAIT_MS = 4_000;
const RATE_LIMIT_MAX_WAIT_MS = 10_000;

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

export class MistralStageError extends Error {
  readonly statusCode: number | undefined;
  readonly cause: unknown;

  constructor(
    readonly stage: MistralStage,
    cause: unknown,
  ) {
    super(`Mistral ${stage} failed`);
    this.name = "MistralStageError";
    this.statusCode = extractStatus(cause);
    this.cause = cause;
  }
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

function parseRetryAfterSec(err: unknown): number {
  const header =
    err &&
    typeof err === "object" &&
    "rawResponse" in err &&
    (err as { rawResponse?: Response }).rawResponse instanceof Response
      ? (err as { rawResponse: Response }).rawResponse.headers.get("retry-after")
      : null;
  return header ? parseFloat(header) : NaN;
}

// rateLimitBudgetMs (optional): 429 is retried while the summed 429 waits stay
// within the budget (Retry-After, else random 4-10 s), up to 6 attempts. Other
// retryable errors keep maxAttempts and their usual schedule.
export async function withMistralRetry<T>(
  label: string,
  fn: () => Promise<T>,
  opts: { maxAttempts?: number; rateLimitBudgetMs?: number } = {}
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? MAX_ATTEMPTS;
  const budgetMs = opts.rateLimitBudgetMs;
  let rateLimitWaitedMs = 0;
  let lastErr: unknown;
  let lastStatus: number | undefined;
  const hardMaxAttempts =
    budgetMs === undefined ? maxAttempts : Math.max(maxAttempts, RATE_LIMIT_MAX_ATTEMPTS);
  for (let attempt = 1; attempt <= hardMaxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const { retryable, status } = isRetryable(err);
      lastStatus = status;
      if (!retryable) throw err;
      const budgeted = budgetMs !== undefined && status === 429;
      if (attempt >= (budgeted ? hardMaxAttempts : maxAttempts)) break;
      let delay: number;
      if (budgeted) {
        const retryAfterSec = parseRetryAfterSec(err);
        delay = isFinite(retryAfterSec)
          ? retryAfterSec * 1000
          : RATE_LIMIT_MIN_WAIT_MS +
            Math.floor(Math.random() * (RATE_LIMIT_MAX_WAIT_MS - RATE_LIMIT_MIN_WAIT_MS));
        if (rateLimitWaitedMs + delay > budgetMs) break;
        rateLimitWaitedMs += delay;
      } else if (status === 429) {
        const retryAfterSec = parseRetryAfterSec(err);
        delay = isFinite(retryAfterSec)
          ? Math.min(retryAfterSec * 1000, 10_000)
          : 2_000 * attempt + Math.floor(Math.random() * MAX_JITTER_MS);
      } else {
        delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.floor(Math.random() * MAX_JITTER_MS);
      }
      console.warn(
        `[mistral-retry] ${label} attempt ${attempt}/${hardMaxAttempts} failed (status ${status ?? "n/a"}), retrying in ${delay}ms`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  if (lastStatus !== undefined && lastStatus >= 500) {
    throw new MistralProviderUnavailableError(lastStatus, maxAttempts, lastErr);
  }
  throw lastErr;
}
