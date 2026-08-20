"use server";

import { routeToLevel } from "@/lib/lookup/levelRouter";
import {
  signRoutingToken,
  hashRoutingIssue,
  normalizeRoutingIssue,
} from "@/lib/lookup/routingToken";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";

const ROUTING_TIMEOUT_MS = 3500;

/**
 * Startet die Ebenen-Klassifikation, sobald der User im Wizard sein Anliegen
 * bestätigt hat (Step-1-Weiter). Läuft fire-and-forget, während der User
 * PLZ/E-Mail ausfüllt. Das Ergebnis geht als signierter, kurzlebiger Token
 * zurück (LOCK-10): submitWizardAction akzeptiert nie ein rohes
 * Client-Routing-Objekt.
 *
 * Gibt bei JEDEM Fehler null zurück — der Client zeigt nichts an, der
 * Foreground-Fallback in submitWizardAction übernimmt.
 */
export async function prefetchRoutingAction(
  issueText: string
): Promise<{ token: string } | null> {
  if (!issueText || issueText.trim().length < 10) return null;

  const ipHash = hashIdentifier(await getClientIp());
  const ipLimit = checkRateLimit(
    `routing-prefetch:ip:${ipHash}`,
    LIMITS.ROUTING_PREFETCH_PER_IP.max,
    LIMITS.ROUTING_PREFETCH_PER_IP.windowMs
  );
  if (!ipLimit.allowed) {
    console.warn("[prefetchRouting] rate limited", {
      retryAfterSeconds: ipLimit.retryAfterSeconds,
    });
    return null;
  }

  const normalizedIssueText = normalizeRoutingIssue(issueText);

  const t0 = Date.now();
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), ROUTING_TIMEOUT_MS);
  try {
    const routing = await routeToLevel(normalizedIssueText, ctrl.signal);
    console.log("[prefetchRouting] ok", {
      elapsed: Date.now() - t0,
      level: routing.primary.level,
      confidence: routing.primary.confidence,
    });
    const token = signRoutingToken({
      issueHash: hashRoutingIssue(normalizedIssueText),
      routing,
    });
    return { token };
  } catch (err) {
    const isAbort = err instanceof Error && (err.name === "AbortError" || /abort/i.test(err.message));
    console.warn(`[prefetchRouting] ${isAbort ? "timeout" : "failed"}`, {
      elapsed: Date.now() - t0,
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
