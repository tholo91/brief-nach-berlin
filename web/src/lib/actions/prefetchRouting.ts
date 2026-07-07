"use server";

import { routeToLevel } from "@/lib/lookup/levelRouter";
import { signRoutingToken, hashRoutingIssue } from "@/lib/lookup/routingToken";

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
  if (process.env.LANDTAG_ROUTING_ENABLED !== "true") return null;
  if (!issueText || issueText.trim().length < 10) return null;

  const t0 = Date.now();
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), ROUTING_TIMEOUT_MS);
  try {
    const routing = await routeToLevel(issueText, ctrl.signal);
    console.log("[prefetchRouting] ok", {
      elapsed: Date.now() - t0,
      level: routing.primary.level,
      confidence: routing.primary.confidence,
    });
    const token = signRoutingToken({
      issueHash: hashRoutingIssue(issueText),
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
