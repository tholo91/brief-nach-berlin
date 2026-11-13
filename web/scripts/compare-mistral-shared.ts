/**
 * compare-mistral-shared.ts
 *
 * Gemeinsame Typen, Modell-Konfiguration, Preise und der seedbare Zufall fuer
 * scripts/compare-mistral-models.ts. Bewusst OHNE Import von @/lib/mistral, Route,
 * Supabase, Brevo oder Zaehler: dieses Modul ist rein.
 */

export type ModelKey = "large3" | "large4" | "small4" | "medium35";
export const MODEL_KEYS: ModelKey[] = ["large3", "large4", "small4", "medium35"];

export interface ModelConfig {
  key: ModelKey;
  /** Kandidat: gilt erst als bestaetigt, wenn GET /v1/models ihn zeigt. */
  id: string;
  /** null = Parameter nicht setzen. */
  reasoningEffort: string | null;
  /** USD pro 1 Mio. Tokens (Eingabe/Ausgabe); null = Preis offen. */
  price: { input: number; output: number } | null;
}

// Preise: Stand Story 2026-11-12 (USD pro 1 Mio. Tokens). medium35 ungeprueft.
export const PRICES: Record<ModelKey, { input: number; output: number } | null> = {
  large3: { input: 0.5, output: 1.5 },
  large4: { input: 0.7, output: 2.1 },
  small4: { input: 0.15, output: 0.6 },
  medium35: null,
};

// Modell-Kandidaten (per --model key=id und --effort key=wert|off ueberschreibbar).
export const DEFAULT_MODELS: Record<ModelKey, ModelConfig> = {
  large3: { key: "large3", id: "mistral-large-2512", reasoningEffort: null, price: PRICES.large3 },
  large4: { key: "large4", id: "mistral-large-latest", reasoningEffort: "low", price: PRICES.large4 },
  small4: { key: "small4", id: "mistral-small-latest", reasoningEffort: "none", price: PRICES.small4 },
  medium35: { key: "medium35", id: "mistral-medium-latest", reasoningEffort: "none", price: PRICES.medium35 },
};

/** Mindestabstand zwischen zwei HTTP-Aufrufen (Starts), Prod teilt sich 15/min. */
export const THROTTLE_MS = 7500;
/** Kostenschutz: mehr HTTP-Aufrufe insgesamt pro Lauf werden hart abgebrochen. */
export const HARD_CALL_CAP = 120;
/** Fester Seed fuer Modell-Reihenfolge und Blind-Labels (reproduzierbar). */
export const SEED = 261113;

export interface CaseExtra {
  title: string;
  text: string;
}

/** Alles, was Report und Blind-Ansicht ueber einen Fall wissen muessen. */
export interface CaseView {
  id: string;
  label: string;
  kind: "letter" | "variant";
  recipientLabel: string;
  /** Eingabetext (bei Fall 10: der Aenderungswunsch). */
  issueText: string;
  toneLevel: number;
  lengthKey: string;
  extra?: CaseExtra[];
}

export interface CallLog {
  model: string;
  reasoningEffort: string | null;
  /** Netto-Zeit des HTTP-Aufrufs ohne Drosselungs-Wartezeit. */
  ms: number;
  promptTokens: number | null;
  completionTokens: number | null;
  status: number | "error";
  errorClass?: string;
  /** reasoningEffort wurde vom Modell abgelehnt, naechster Aufruf ohne Parameter. */
  effortDropped?: boolean;
}

export interface RuleViolationInfo {
  sentence: string;
  word: string;
}

export interface Metrics {
  wordCount: number;
  bandMin: number;
  bandMax: number;
  inBand: boolean;
  ruleViolations: number;
  ruleViolationDetails: RuleViolationInfo[];
  flags: {
    /** Anzahl Gedankenstriche (en/em dash) */
    dashes: number;
    nichtNurSondern: boolean;
    erstens: boolean;
    gender: boolean;
    noSalutation: boolean;
    noClosing: boolean;
  };
  /** Anzahl der ausgeloesten Heuristik-Flags (dashes zaehlt 1, wenn > 0). */
  heuristicCount: number;
  /** aus dem Ergebnis der Pipeline (retried bzw. lengthRetried) */
  retried: boolean;
}

export interface PairResult {
  caseId: string;
  modelKey: ModelKey;
  modelId: string;
  effortRequested: string | null;
  order: number;
  startedAt: string;
  letter: string | null;
  metrics: Metrics | null;
  error: { class: string; status: number | string | null; message: string } | null;
  calls: CallLog[];
  callCount: number;
  http429: number;
  /** Aufrufe mit Status 200 minus 1 */
  contentRetry: number;
  /** Summe der Netto-Zeiten aller Aufrufe */
  ms: number;
  /** Gesamtzeit des Falls inkl. Drosselung und Retry-Wartezeit */
  wallMs: number;
  promptTokens: number;
  completionTokens: number;
  costUsd: number | null;
}

export interface RawMeta {
  runId: string;
  createdAt: string;
  selftest: boolean;
  seed: number;
  throttleMs: number;
  hardCallCap: number;
  models: Record<ModelKey, ModelConfig>;
  cases: CaseView[];
  modelOrder: Record<string, ModelKey[]>;
  labelOrder: Record<string, Record<string, ModelKey>>;
  effortUnsupported: ModelKey[];
  modelCheck: Record<string, { found: boolean; resolvedId: string | null }> | null;
  aborted: string | null;
}

export interface RawFile {
  meta: RawMeta;
  results: PairResult[];
}

export const LABELS = ["A", "B", "C", "D"] as const;

/** mulberry32: kleiner seedbarer Zufallsgenerator. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Feste Plaene je Fall: Reihenfolge der Modell-Laeufe und Blind-Label-Zuordnung.
 * Immer ueber alle 4 Modelle und alle Faelle berechnet, damit eine Teilauswahl
 * (--cases/--models) dieselben Reihenfolgen und Labels behaelt.
 */
export function buildPlan(caseIds: readonly string[]): {
  modelOrder: Record<string, ModelKey[]>;
  labelOrder: Record<string, Record<string, ModelKey>>;
} {
  const modelOrder: Record<string, ModelKey[]> = {};
  const labelOrder: Record<string, Record<string, ModelKey>> = {};
  caseIds.forEach((id, idx) => {
    modelOrder[id] = shuffled(MODEL_KEYS, mulberry32(SEED + idx));
    const labelled = shuffled(MODEL_KEYS, mulberry32(SEED + 1000 + idx));
    const map: Record<string, ModelKey> = {};
    labelled.forEach((key, i) => {
      map[LABELS[i]] = key;
    });
    labelOrder[id] = map;
  });
  return { modelOrder, labelOrder };
}

export function costUsd(
  price: { input: number; output: number } | null,
  promptTokens: number,
  completionTokens: number,
): number | null {
  if (!price) return null;
  return (promptTokens * price.input + completionTokens * price.output) / 1_000_000;
}

export function fmtUsd(value: number | null): string {
  return value === null ? "Preis offen" : `$${value.toFixed(4)}`;
}
