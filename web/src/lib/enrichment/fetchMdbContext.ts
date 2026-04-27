import type { MdbContext } from "@/lib/types/wizard";

const API_BASE = "https://www.abgeordnetenwatch.de/api/v2";
const REVALIDATE_SECONDS = 3600; // 1 hour edge cache
const DEFAULT_TIMEOUT_MS = 2000;
const RECENT_VOTES_LIMIT = 25; // fetch this many, then keyword-rank down to 3
const TOP_RELEVANT = 3;

// Minimal German stopword set for the keyword-overlap scorer.
// Goal: avoid matching on filler words like "der/die/das/und".
const STOPWORDS = new Set([
  "der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "eines",
  "und", "oder", "aber", "doch", "nicht", "auch", "schon", "noch", "sehr",
  "ich", "du", "er", "sie", "es", "wir", "ihr", "mir", "mich", "dir", "dich", "uns", "euch",
  "ja", "nein", "dass", "weil", "wenn", "ob", "als", "wie", "wo", "was", "wer",
  "mit", "von", "zu", "zur", "zum", "für", "bei", "in", "im", "am", "an", "auf", "aus",
  "über", "unter", "vor", "nach", "durch", "ohne", "gegen", "um",
  "bin", "bist", "ist", "sind", "war", "waren", "habe", "hast", "hat", "haben", "hatte",
  "werde", "wirst", "wird", "werden", "wurde", "worden",
  "sehr", "mehr", "viel", "wenig", "hier", "dort", "dann",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 4 && !STOPWORDS.has(t))
  );
}

interface RankedItem {
  date: string;
  title: string;
  snippet: string;
  score: number;
}

function scoreOverlap(items: { date: string; title: string; snippet: string }[], issueTokens: Set<string>): RankedItem[] {
  return items
    .map((item) => {
      const titleTokens = tokenize(item.title);
      let score = 0;
      for (const t of titleTokens) if (issueTokens.has(t)) score++;
      return { ...item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

function isoToGermanDate(iso: string | undefined): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso.slice(0, 10);
  return `${m[3]}.${m[2]}.${m[1]}`;
}

interface PollResultRow {
  poll?: {
    label?: string;
    field_poll_date?: string;
    field_intro?: string;
  };
  vote?: string;
}

/**
 * Enrich the LLM prompt with MdB-specific context before letter generation.
 *
 * Strategy:
 *   - Committees come from the build-time cache (passed in as cachedCommittees).
 *   - Recent vote topics are fetched at runtime, keyword-ranked against the issue,
 *     and trimmed to the top 3 most relevant.
 *   - Network errors and timeouts are silent: caller still gets a valid (empty) MdbContext.
 *
 * Edge-cached for 1h via `next: { revalidate: 3600 }`. Timeout default 2s.
 */
export async function fetchMdbContext(
  mandateId: number,
  issueText: string,
  cachedCommittees: string[] | undefined,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<MdbContext> {
  const fallback: MdbContext = {
    committees: cachedCommittees ?? [],
    recentRelevant: [],
  };

  if (!mandateId || !issueText) return fallback;

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const url = `${API_BASE}/poll-results?mandate=${mandateId}&range_start=0&range_end=${RECENT_VOTES_LIMIT - 1}`;
    const res = await fetch(url, {
      signal: ctrl.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { data?: PollResultRow[] };

    const items = (json.data ?? [])
      .map((r) => {
        const title = r.poll?.label ?? "";
        const date = isoToGermanDate(r.poll?.field_poll_date);
        const vote = r.vote ?? "";
        const snippet = vote ? `Stimme: ${vote}` : "";
        return { date, title, snippet };
      })
      .filter((i) => i.title.length > 0);

    const issueTokens = tokenize(issueText);
    const ranked = scoreOverlap(items, issueTokens).slice(0, TOP_RELEVANT);

    return {
      committees: cachedCommittees ?? [],
      recentRelevant: ranked.map(({ score: _score, ...rest }) => rest),
    };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}
