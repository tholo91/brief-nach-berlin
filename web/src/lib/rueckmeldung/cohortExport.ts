// Only used by the last-call tsx scripts (export), never imported by the app.
import { readFileSync } from "node:fs";
import { normalizeEmail } from "./cohort";

export type ReviewWindow = { fromUtc: string | null; beforeUtc: string };

type PagedQuery = {
  not(column: string, operator: string, value: unknown): PagedQuery;
  gte(column: string, value: string): PagedQuery;
  lt(column: string, value: string): PagedQuery;
  order(column: string, options: { ascending: boolean }): PagedQuery;
  range(from: number, to: number): PromiseLike<{ data: Array<{ email: string | null }> | null; error: unknown }>;
};
type ReviewsClient = { from(table: string): { select(columns: string): PagedQuery } };

/** Reads review e-mails of the window, page by page. Failures throw without any data. */
export async function fetchReviewEmails(client: ReviewsClient, window: ReviewWindow, pageSize = 1000): Promise<string[]> {
  const emails: string[] = [];
  for (let start = 0; ; start += pageSize) {
    let query = client.from("reviews").select("email,created_at").not("email", "is", null);
    if (window.fromUtc) query = query.gte("created_at", window.fromUtc);
    query = query.lt("created_at", window.beforeUtc)
      .order("created_at", { ascending: true }).order("id", { ascending: true });
    const { data, error } = await query.range(start, start + pageSize - 1);
    if (error) throw new Error("Reviews konnten nicht vollständig gelesen werden.");
    for (const row of data ?? []) if (row.email) emails.push(row.email);
    if (!data || data.length < pageSize) break;
  }
  return emails;
}

/**
 * Addresses of an earlier send journal (sent plus the unclear pending one, so an unclear
 * send is never mailed twice). Throws a fixed message without any address.
 */
export function readJournalEmails(path: string): Set<string> {
  let value: unknown;
  try { value = JSON.parse(readFileSync(path, "utf8")); }
  catch { throw new Error("Versandjournal fehlt oder ist unlesbar."); }
  const journal = value as { sentEmails?: unknown; pendingEmail?: unknown } | null;
  if (
    !journal || typeof journal !== "object" || !Array.isArray(journal.sentEmails)
    || !journal.sentEmails.every((email) => typeof email === "string")
    || (journal.pendingEmail != null && typeof journal.pendingEmail !== "string")
  ) throw new Error("Versandjournal hat ein unerwartetes Format.");
  const result = new Set<string>();
  for (const raw of [...(journal.sentEmails as string[]), ...(typeof journal.pendingEmail === "string" ? [journal.pendingEmail] : [])]) {
    const email = normalizeEmail(raw);
    if (email) result.add(email);
  }
  return result;
}
