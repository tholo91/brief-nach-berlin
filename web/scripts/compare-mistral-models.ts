/**
 * compare-mistral-models.ts
 *
 * Lokales Vergleichsskript: dieselben 10 Testfaelle laufen mit 4 Modellen durch die ECHTE
 * Briefpipeline (generateLetter / generateLetterVariant), Metriken werden gemessen, dazu
 * entsteht eine Blind-Ansicht. Prod-Code bleibt unveraendert.
 *
 * ZAEHLER/DB: Das Skript importiert weder die API-Route noch Zaehler, Supabase, Brevo oder
 * submitWizard. Es ruft nur generateLetter/generateLetterVariant direkt auf. Der oeffentliche
 * Briefzaehler steigt nicht.
 *
 * Ohne --run passiert NIE ein Generierungsaufruf. Netz ohne --run: nur GET /v1/models
 * (--check-models, --dry-run), kostenlos und ohne Kontingent.
 *
 * Aufruf (aus web/):
 *   npx tsx scripts/compare-mistral-models.ts --dry-run
 *   npx tsx scripts/compare-mistral-models.ts --check-models
 *   npx tsx scripts/compare-mistral-models.ts --selftest
 *   npx tsx scripts/compare-mistral-models.ts --run --confirm-no-campaign
 *   npx tsx scripts/compare-mistral-models.ts --run --confirm-no-campaign --cases bund-knapp,kommune-rathaus --models large3,large4
 *   npx tsx scripts/compare-mistral-models.ts --run --confirm-no-campaign --resume <run-id>
 *   npx tsx scripts/compare-mistral-models.ts --report <run-id>
 * Optional: --model large4=<id> (Modell-ID ueberschreiben), --effort large4=low|none|high|off
 *
 * Ausgabe: scripts/compare-mistral-models-output/<run-id>/ (gitignored)
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { findRuleViolations } from "../src/lib/generation/letterRules";
import { buildCases, type CaseDef } from "./compare-mistral-cases";
import { buildBlindHtml, buildKeyJson, buildReportMd } from "./compare-mistral-report";
import {
  DEFAULT_MODELS,
  HARD_CALL_CAP,
  LABELS,
  MODEL_KEYS,
  SEED,
  THROTTLE_MS,
  buildPlan,
  costUsd,
  fmtUsd,
  type CallLog,
  type Metrics,
  type ModelConfig,
  type ModelKey,
  type PairResult,
  type RawFile,
  type RawMeta,
} from "./compare-mistral-shared";

type MistralClient = typeof import("../src/lib/mistral").mistral;
type CompleteFn = MistralClient["chat"]["complete"];
type ChatRequest = Parameters<CompleteFn>[0];
type GenerateLetterFn = typeof import("../src/lib/generation/generateLetter").generateLetter;
type GenerateVariantFn = typeof import("../src/lib/generation/generateLetterVariant").generateLetterVariant;

const OUTPUT_ROOT = path.resolve(__dirname, "compare-mistral-models-output");
const ENV_PATH = path.resolve(__dirname, "../.env.local");
const MODELS_URL = "https://api.mistral.ai/v1/models";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface Args {
  help: boolean;
  dryRun: boolean;
  checkModels: boolean;
  run: boolean;
  selftest: boolean;
  confirmNoCampaign: boolean;
  report: string | null;
  resume: string | null;
  cases: string[] | null;
  models: ModelKey[] | null;
  modelOverrides: Partial<Record<ModelKey, string>>;
  effortOverrides: Partial<Record<ModelKey, string | null>>;
  maxTokensOverrides: Partial<Record<ModelKey, number>>;
}

function describeResponse(res: unknown): { preview?: string; contentKinds?: string; finishReason?: string | null } {
  const choice = (res as { choices?: Array<{ message?: { content?: unknown }; finishReason?: string | null }> })?.choices?.[0];
  const content = choice?.message?.content;
  let preview = "";
  let kinds = "";
  if (typeof content === "string") {
    kinds = "string";
    preview = content;
  } else if (Array.isArray(content)) {
    kinds = content.map((c) => (c as { type?: string })?.type ?? "?").join(",");
    const textChunk = content.find((c) => (c as { type?: string })?.type === "text") as { text?: string } | undefined;
    preview = textChunk?.text ?? "";
  }
  return { preview: preview.slice(0, 400), contentKinds: kinds, finishReason: choice?.finishReason ?? null };
}

function fail(message: string, code = 2): never {
  console.error(message);
  process.exit(code);
}

function isModelKey(value: string): value is ModelKey {
  return (MODEL_KEYS as string[]).includes(value);
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    help: false,
    dryRun: false,
    checkModels: false,
    run: false,
    selftest: false,
    confirmNoCampaign: false,
    report: null,
    resume: null,
    cases: null,
    models: null,
    modelOverrides: {},
    effortOverrides: {},
    maxTokensOverrides: {},
  };
  const value = (i: number, flag: string): string => {
    const v = argv[i + 1];
    if (!v || v.startsWith("--")) fail(`Flag ${flag} braucht einen Wert.`);
    return v;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    switch (a) {
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--check-models":
        args.checkModels = true;
        break;
      case "--run":
        args.run = true;
        break;
      case "--selftest":
        args.selftest = true;
        break;
      case "--confirm-no-campaign":
        args.confirmNoCampaign = true;
        break;
      case "--report":
        args.report = value(i, a);
        i += 1;
        break;
      case "--resume":
        args.resume = value(i, a);
        i += 1;
        break;
      case "--cases":
        args.cases = value(i, a).split(",").map((s) => s.trim()).filter(Boolean);
        i += 1;
        break;
      case "--models": {
        const keys = value(i, a).split(",").map((s) => s.trim()).filter(Boolean);
        for (const k of keys) if (!isModelKey(k)) fail(`Unbekanntes Modell "${k}". Erlaubt: ${MODEL_KEYS.join(", ")}`);
        args.models = keys as ModelKey[];
        i += 1;
        break;
      }
      case "--model": {
        const [k, id] = value(i, a).split("=");
        if (!k || !id || !isModelKey(k)) fail(`--model erwartet key=id mit key aus ${MODEL_KEYS.join(", ")}`);
        args.modelOverrides[k as ModelKey] = id;
        i += 1;
        break;
      }
      case "--effort": {
        const [k, v] = value(i, a).split("=");
        if (!k || !v || !isModelKey(k)) fail(`--effort erwartet key=wert (low, none, high oder off) mit key aus ${MODEL_KEYS.join(", ")}`);
        args.effortOverrides[k as ModelKey] = v === "off" ? null : v;
        i += 1;
        break;
      }
      case "--max-tokens": {
        const [k, v] = value(i, a).split("=");
        const n = Number(v);
        if (!k || !isModelKey(k) || !Number.isInteger(n) || n < 100 || n > 32000) {
          fail(`--max-tokens erwartet key=zahl (100 bis 32000) mit key aus ${MODEL_KEYS.join(", ")}`);
        }
        args.maxTokensOverrides[k as ModelKey] = n;
        i += 1;
        break;
      }
      default:
        fail(`Unbekanntes Argument: ${a}\n\n${helpText()}`);
    }
  }
  return args;
}

function helpText(): string {
  return `compare-mistral-models.ts: Mistral-Modellvergleich ueber die echte Briefpipeline

  --dry-run                Modellliste pruefen (GET /v1/models), Prompts und Aufrufplan ausgeben. KEINE Generierung.
  --check-models           Nur GET /v1/models, Kandidaten-IDs pruefen.
  --selftest               Offline-Selbsttest mit Fake-Antworten (kein Netz, keine Drosselung).
  --run                    Echte Laeufe (alle 10 Faelle x 4 Modelle). Braucht --confirm-no-campaign.
  --confirm-no-campaign    Pflicht fuer --run: Thomas bestaetigt, dass keine Kampagne laeuft.
  --cases a,b              Nur diese Faelle
  --models large3,large4   Nur diese Modelle (large3, large4, small4, medium35)
  --resume <run-id>        Fortsetzen: erfolgreiche Paare werden uebersprungen, Fehlschlaege wiederholt.
  --report <run-id>        report.md, blind.html, key.json aus gespeichertem raw.json neu bauen.
  --model key=<id>         Modell-ID ueberschreiben (z. B. large4=mistral-large-2611)
  --effort key=<wert|off>  reasoningEffort ueberschreiben
  --max-tokens key=<zahl>  maxTokens der Pipeline fuer dieses Modell ueberschreiben (Reasoning braucht Platz)

Ohne --run wird nie ein Generierungsaufruf ausgefuehrt.
Ausgabe: scripts/compare-mistral-models-output/<run-id>/ (gitignored)`;
}

// ---------------------------------------------------------------------------
// Env (wie scripts/test-argument-chain.ts): manuell parsen, DANN dynamisch importieren.
// Der Schluessel wird nie ausgegeben.
// ---------------------------------------------------------------------------

function loadEnv(): void {
  if (!fs.existsSync(ENV_PATH)) return;
  const raw = fs.readFileSync(ENV_PATH, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function requireApiKey(): string {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) fail("MISTRAL_API_KEY nicht gefunden (web/.env.local). Das Skript liest die Datei selbst.", 1);
  return key;
}

// ---------------------------------------------------------------------------
// Modell-ID-Check (GET /v1/models, keine Generierung)
// ---------------------------------------------------------------------------

type ModelEntry = Record<string, unknown> & { id?: string; aliases?: string[] };

interface CheckOutcome {
  perKey: Record<string, { found: boolean; resolvedId: string | null }>;
  allFound: boolean;
}

async function fetchModelList(apiKey: string): Promise<ModelEntry[]> {
  const res = await fetch(MODELS_URL, { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" } });
  if (!res.ok) fail(`GET /v1/models fehlgeschlagen: HTTP ${res.status}`, 1);
  const json = (await res.json()) as { data?: ModelEntry[] } | ModelEntry[];
  return Array.isArray(json) ? json : (json.data ?? []);
}

function summarize(entry: ModelEntry): string {
  const caps = (entry.capabilities ?? {}) as Record<string, unknown>;
  const aliases = Array.isArray(entry.aliases) ? entry.aliases.join(", ") : "-";
  const depr = Object.entries(entry)
    .filter(([k]) => /deprecat/i.test(k))
    .map(([k, v]) => `${k}=${v === null ? "null" : JSON.stringify(v)}`)
    .join(", ");
  return [
    `Name ${String(entry.name ?? "-")}`,
    `Abrechnung ${String(entry.billing_model_name ?? "-")}`,
    `reasoning ${String(caps.reasoning ?? "-")}`,
    `Kontext ${String(entry.max_context_length ?? "-")}`,
    `Aliase [${aliases}]`,
    depr || "keine Deprecation-Felder",
  ].join("; ");
}

async function checkModels(models: Record<ModelKey, ModelConfig>, apiKey: string, verbose: boolean): Promise<CheckOutcome> {
  const list = await fetchModelList(apiKey);
  console.log(`\nModellliste: ${list.length} Eintraege (GET /v1/models, keine Generierung).`);
  const perKey: CheckOutcome["perKey"] = {};
  let allFound = true;
  for (const key of MODEL_KEYS) {
    const cfg = models[key];
    const byId = list.filter((m) => m.id === cfg.id);
    const byAlias = list.filter((m) => m.id !== cfg.id && Array.isArray(m.aliases) && m.aliases.includes(cfg.id));
    const hit = byId[0] ?? byAlias[0];
    perKey[key] = { found: Boolean(hit), resolvedId: hit?.id ?? null };
    console.log(`\n[${key}] Kandidat ${cfg.id} (reasoningEffort ${cfg.reasoningEffort ?? "nicht gesetzt"})`);
    if (!hit) {
      allFound = false;
      console.log("  NICHT in der Modellliste. Nicht bestaetigt.");
      const similar = list
        .map((m) => m.id)
        .filter((id): id is string => typeof id === "string" && id.includes(cfg.id.split("-")[1] ?? "~"))
        .slice(0, 12);
      if (similar.length) console.log(`  Aehnliche IDs: ${similar.join(", ")}`);
      console.log(`  Mit anderer ID: --model ${key}=<id>`);
      continue;
    }
    for (const entry of byId) {
      console.log(`  ID vorhanden. ${summarize(entry)}`);
    }
    for (const entry of byAlias) {
      console.log(`  Alias von ${entry.id} (Name ${String(entry.name ?? "-")}, Abrechnung ${String(entry.billing_model_name ?? "-")})`);
    }
    if (verbose && byId.length === 0) console.log("  (nur als Alias gefunden)");
  }
  if (verbose) {
    const rel = list
      .map((m) => m.id)
      .filter((id): id is string => typeof id === "string" && /large|small|medium/.test(id))
      .sort();
    console.log(`\nRelevante IDs (large/small/medium): ${rel.join(", ")}`);
  }
  return { perKey, allFound };
}

// ---------------------------------------------------------------------------
// Wrapper um mistral.chat.complete
// ---------------------------------------------------------------------------

class HardCapError extends Error {
  constructor(cap: number) {
    super(`Aufrufdeckel von ${cap} HTTP-Aufrufen erreicht, Lauf wird abgebrochen (Kostenschutz).`);
    this.name = "HardCapError";
  }
}

interface RuntimeState {
  selftest: boolean;
  totalCalls: number;
  lastStart: number;
  capHit: boolean;
  current: PairResult | null;
  currentCfg: ModelConfig | null;
  currentCase: CaseDef | null;
  effortUnsupported: Set<ModelKey>;
}

type TaggedComplete = CompleteFn & { __selftestFake?: boolean };

function errStatus(err: unknown): number | null {
  if (!err || typeof err !== "object") return null;
  const e = err as { statusCode?: unknown; status?: unknown };
  if (typeof e.statusCode === "number") return e.statusCode;
  if (typeof e.status === "number") return e.status;
  return null;
}

function errBody(err: unknown): string {
  if (!err || typeof err !== "object") return "";
  const e = err as { body?: unknown; message?: unknown };
  return `${typeof e.body === "string" ? e.body : ""} ${typeof e.message === "string" ? e.message : ""}`;
}

function errClass(err: unknown): string {
  return err instanceof Error ? err.name : "NonError";
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Ersetzt mistral.chat.complete. target ist der echte (gebundene) SDK-Aufruf oder im Selftest die Fake-Funktion. */
function installWrapper(mistral: MistralClient, target: TaggedComplete, st: RuntimeState): CompleteFn {
  const wrapped = (async (req: ChatRequest, opts?: Parameters<CompleteFn>[1]) => {
    const cur = st.current;
    const cfg = st.currentCfg;
    if (!cur || !cfg) throw new Error("compare-mistral: Aufruf ausserhalb eines Laufs blockiert");
    if (st.selftest && !target.__selftestFake) {
      throw new Error("selftest: echter SDK-/Netz-Aufruf blockiert");
    }
    for (let pass = 0; pass < 2; pass += 1) {
      if (st.totalCalls >= HARD_CALL_CAP) {
        st.capHit = true;
        throw new HardCapError(HARD_CALL_CAP);
      }
      st.totalCalls += 1;
      if (!st.selftest) {
        const wait = st.lastStart + THROTTLE_MS - Date.now();
        if (wait > 0) await sleep(wait);
      }
      st.lastStart = Date.now();
      const effort = cfg.reasoningEffort && !st.effortUnsupported.has(cfg.key) ? cfg.reasoningEffort : null;
      const params = { ...req, model: cfg.id } as Record<string, unknown>;
      delete params.reasoningEffort;
      if (effort) params.reasoningEffort = effort;
      if (cfg.maxTokens !== undefined) params.maxTokens = cfg.maxTokens;
      const t0 = Date.now();
      try {
        const res = await target(params as ChatRequest, opts);
        cur.calls.push({
          model: cfg.id,
          reasoningEffort: effort,
          ms: Date.now() - t0,
          promptTokens: res.usage?.promptTokens ?? null,
          completionTokens: res.usage?.completionTokens ?? null,
          status: 200,
          ...describeResponse(res),
        });
        return res;
      } catch (err) {
        const status = errStatus(err);
        const log: CallLog = {
          model: cfg.id,
          reasoningEffort: effort,
          ms: Date.now() - t0,
          promptTokens: null,
          completionTokens: null,
          status: status ?? "error",
          errorClass: errClass(err),
        };
        cur.calls.push(log);
        // reasoningEffort vom Modell abgelehnt: einmalig ohne Parameter wiederholen, im Report vermerken.
        if (pass === 0 && effort && (status === 400 || status === 422) && /reasoning|effort/i.test(errBody(err))) {
          log.effortDropped = true;
          st.effortUnsupported.add(cfg.key);
          continue;
        }
        throw err;
      }
    }
    throw new Error("unreachable");
  }) as CompleteFn;
  (mistral.chat as unknown as { complete: CompleteFn }).complete = wrapped;
  return wrapped;
}

// ---------------------------------------------------------------------------
// Metriken
// ---------------------------------------------------------------------------

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function heuristicFlags(letter: string): Metrics["flags"] {
  const head = letter.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 5);
  return {
    dashes: (letter.match(/[–—]/g) ?? []).length,
    nichtNurSondern: /nicht\s+(nur|allein|bloß)[^.]{0,120}sondern/i.test(letter),
    erstens: /\b(Erstens|Zweitens|Drittens)\b/i.test(letter),
    gender: /\p{L}[*:_]\p{L}|[a-zäöüß][A-ZÄÖÜ]\p{Ll}*innen\b|[a-zäöüß]In\b/u.test(letter),
    noSalutation: !head.some((l) => /^(Sehr geehrte|Guten Tag)/i.test(l)),
    noClosing: !/(Mit freundlichen Grüßen|Mit freundlichem Gruß|Freundliche Grüße|Viele Grüße)/i.test(letter),
  };
}

function buildMetrics(opts: {
  letter: string;
  wordCount: number;
  bandMin: number;
  bandMax: number;
  inBand: boolean;
  sourceText: string;
  retried: boolean;
}): Metrics {
  const violations = findRuleViolations(opts.letter, opts.sourceText);
  const flags = heuristicFlags(opts.letter);
  const heuristicCount =
    (flags.dashes > 0 ? 1 : 0) +
    Number(flags.nichtNurSondern) +
    Number(flags.erstens) +
    Number(flags.gender) +
    Number(flags.noSalutation) +
    Number(flags.noClosing);
  return {
    wordCount: opts.wordCount,
    bandMin: opts.bandMin,
    bandMax: opts.bandMax,
    inBand: opts.inBand,
    ruleViolations: violations.length,
    ruleViolationDetails: violations.map((v) => ({ sentence: v.sentence, word: v.word })),
    flags,
    heuristicCount,
    retried: opts.retried,
  };
}

// ---------------------------------------------------------------------------
// Einzelner Lauf (Fall x Modell)
// ---------------------------------------------------------------------------

interface Deps {
  mistral: MistralClient;
  generateLetter: GenerateLetterFn;
  generateLetterVariant: GenerateVariantFn;
  LETTER_LENGTHS: typeof import("../src/lib/config").LETTER_LENGTHS;
  youthLetterWords: typeof import("../src/lib/schule/youth").youthLetterWords;
}

function describeError(err: unknown): NonNullable<PairResult["error"]> {
  const cause = err instanceof Error ? (err as { cause?: unknown }).cause : undefined;
  const status = errStatus(err) ?? errStatus(cause);
  const cls = cause instanceof Error ? `${errClass(err)} > ${errClass(cause)}` : errClass(err);
  const message = (err instanceof Error ? err.message : String(err)).slice(0, 300);
  return { class: cls, status, message };
}

function finalizeResult(rec: PairResult, cfg: ModelConfig, wallMs: number): void {
  rec.callCount = rec.calls.length;
  rec.http429 = rec.calls.filter((c) => c.status === 429).length;
  rec.contentRetry = Math.max(0, rec.calls.filter((c) => c.status === 200).length - 1);
  rec.ms = rec.calls.reduce((a, c) => a + c.ms, 0);
  rec.wallMs = wallMs;
  rec.promptTokens = rec.calls.reduce((a, c) => a + (c.promptTokens ?? 0), 0);
  rec.completionTokens = rec.calls.reduce((a, c) => a + (c.completionTokens ?? 0), 0);
  rec.costUsd = costUsd(cfg.price, rec.promptTokens, rec.completionTokens);
}

async function runPair(deps: Deps, st: RuntimeState, c: CaseDef, cfg: ModelConfig, order: number): Promise<PairResult> {
  const rec: PairResult = {
    caseId: c.id,
    modelKey: cfg.key,
    modelId: cfg.id,
    effortRequested: cfg.reasoningEffort,
    order,
    startedAt: new Date().toISOString(),
    letter: null,
    metrics: null,
    error: null,
    calls: [],
    callCount: 0,
    http429: 0,
    contentRetry: 0,
    ms: 0,
    wallMs: 0,
    promptTokens: 0,
    completionTokens: 0,
    costUsd: null,
  };
  st.current = rec;
  st.currentCfg = cfg;
  st.currentCase = c;
  const t0 = Date.now();
  try {
    if (c.kind === "letter" && c.letterInput) {
      const input = structuredClone(c.letterInput);
      const res = await deps.generateLetter(input);
      const band = input.youth
        ? deps.youthLetterWords(input.youth.klasse)
        : deps.LETTER_LENGTHS[input.letterLength ?? "1"];
      const sourceText = [input.issueText, input.name, input.party, input.ngo].filter(Boolean).join("\n");
      rec.letter = res.letter;
      rec.metrics = buildMetrics({
        letter: res.letter,
        wordCount: res.wordCount,
        bandMin: band.min,
        bandMax: band.max,
        inBand: res.wordCount >= band.min && res.wordCount <= band.max,
        sourceText,
        retried: res.retried,
      });
    } else if (c.kind === "variant" && c.variantInput) {
      const input = structuredClone(c.variantInput);
      const res = await deps.generateLetterVariant(input);
      rec.letter = res.letter;
      rec.metrics = buildMetrics({
        letter: res.letter,
        wordCount: res.wordCount,
        bandMin: res.targetMinWords,
        bandMax: res.targetMaxWords,
        inBand: res.wordCountInRange,
        sourceText: input.originalLetter,
        retried: res.lengthRetried,
      });
    } else {
      throw new Error(`Fall ${c.id} ohne Eingabe`);
    }
  } catch (err) {
    rec.error = describeError(err);
    if (rec.error.status === null && rec.calls.length > 0) {
      const last = rec.calls[rec.calls.length - 1];
      rec.error.status = last.status;
    }
  } finally {
    st.current = null;
    st.currentCfg = null;
    st.currentCase = null;
  }
  finalizeResult(rec, cfg, Date.now() - t0);
  return rec;
}

// ---------------------------------------------------------------------------
// Dateien
// ---------------------------------------------------------------------------

function newRunId(selftest: boolean): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  return `${selftest ? "selftest-" : ""}${stamp}`;
}

function assertRunId(id: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) fail(`Ungueltige run-id: ${id}`);
  return id;
}

function runDir(runId: string): string {
  return path.join(OUTPUT_ROOT, runId);
}

function saveRaw(raw: RawFile): void {
  const dir = runDir(raw.meta.runId);
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, "raw.json");
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(raw, null, 2), "utf8");
  fs.renameSync(tmp, target);
}

function loadRaw(runId: string): RawFile {
  const file = path.join(runDir(runId), "raw.json");
  if (!fs.existsSync(file)) fail(`Kein raw.json fuer run-id ${runId}: ${file}`, 1);
  return JSON.parse(fs.readFileSync(file, "utf8")) as RawFile;
}

function writeOutputs(raw: RawFile): string[] {
  const dir = runDir(raw.meta.runId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "report.md"), buildReportMd(raw), "utf8");
  fs.writeFileSync(path.join(dir, "blind.html"), buildBlindHtml(raw), "utf8");
  fs.writeFileSync(path.join(dir, "key.json"), JSON.stringify(buildKeyJson(raw), null, 2), "utf8");
  return ["raw.json", "report.md", "blind.html", "key.json"].map((f) => path.join(dir, f));
}

// ---------------------------------------------------------------------------
// Schaetzung (Dry-Run und vor --run)
// ---------------------------------------------------------------------------

const AVG_LATENCY_S: Record<ModelKey, number> = { large3: 15, large4: 25, small4: 8, medium35: 15 };
const THINKING_GUESS_TOKENS: Record<ModelKey, number> = { large3: 0, large4: 500, small4: 0, medium35: 0 };
const EXPECTED_CALLS_PER_PAIR = 1.25;
const CHARS_PER_TOKEN = 3.3;

interface Estimate {
  pairs: number;
  callsExpected: number;
  callsMin: number;
  minDurationMin: number;
  expectedDurationMin: number;
  costByModel: Record<ModelKey, number | null>;
  costKnownUsd: number;
  openPriceModels: ModelKey[];
}

function estimate(
  cases: CaseDef[],
  promptChars: Record<string, number>,
  targetWords: Record<string, number>,
  keys: ModelKey[],
  models: Record<ModelKey, ModelConfig>,
  pendingPairs?: Set<string>,
): Estimate {
  let pairs = 0;
  let expectedSeconds = 0;
  const costByModel = {} as Record<ModelKey, number | null>;
  for (const k of keys) costByModel[k] = models[k].price ? 0 : null;
  for (const c of cases) {
    for (const k of keys) {
      if (pendingPairs && !pendingPairs.has(`${c.id}|${k}`)) continue;
      pairs += 1;
      const pt = Math.ceil(promptChars[c.id] / CHARS_PER_TOKEN);
      const ct = Math.ceil(targetWords[c.id] * 1.9) + 40 + THINKING_GUESS_TOKENS[k];
      const price = models[k].price;
      if (price) {
        costByModel[k] = (costByModel[k] ?? 0) + (EXPECTED_CALLS_PER_PAIR * (pt * price.input + ct * price.output)) / 1_000_000;
      }
      expectedSeconds += EXPECTED_CALLS_PER_PAIR * Math.max(AVG_LATENCY_S[k], THROTTLE_MS / 1000);
    }
  }
  const callsExpected = Math.ceil(pairs * EXPECTED_CALLS_PER_PAIR);
  return {
    pairs,
    callsExpected,
    callsMin: pairs,
    minDurationMin: (pairs * THROTTLE_MS) / 1000 / 60,
    expectedDurationMin: expectedSeconds / 60,
    costByModel,
    costKnownUsd: keys.reduce((a, k) => a + (costByModel[k] ?? 0), 0),
    openPriceModels: keys.filter((k) => !models[k].price),
  };
}

function printEstimate(e: Estimate, keys: ModelKey[]): void {
  console.log("\nAufrufplan und Schaetzung (grob, Prompt/Antwort-Laengen aus den echten Prompts, Retry-Faktor 1,25):");
  console.log(`  Paare (Fall x Modell): ${e.pairs}`);
  console.log(`  HTTP-Aufrufe: mindestens ${e.callsMin}, erwartet etwa ${e.callsExpected}, Deckel ${HARD_CALL_CAP}`);
  console.log(`  Mindestdauer bei ${THROTTLE_MS / 1000} s Abstand: ${e.minDurationMin.toFixed(1)} min, erwartet etwa ${e.expectedDurationMin.toFixed(0)} min`);
  for (const k of keys) console.log(`  Kosten ${k}: ${e.costByModel[k] === null ? "Preis offen" : fmtUsd(e.costByModel[k])}`);
  console.log(`  Kosten Summe (nur Modelle mit Preis): ${fmtUsd(e.costKnownUsd)}${e.openPriceModels.length ? ` plus offen: ${e.openPriceModels.join(", ")}` : ""}`);
  console.log("  Hinweis: Abrechnung von Denk-Tokens unklar, Schaetzung enthaelt fuer large4 pauschal 500 Denk-Tokens je Aufruf.");
}

// ---------------------------------------------------------------------------
// Fake-Antworten fuer --selftest
// ---------------------------------------------------------------------------

function makeFakeComplete(st: RuntimeState): TaggedComplete {
  const fake = (async (req: ChatRequest) => {
    const cur = st.current;
    const c = st.currentCase;
    if (!cur || !c) throw new Error("selftest: Fake ausserhalb eines Laufs");
    const okSoFar = cur.calls.filter((x) => x.status === 200).length;
    // Einmal ein 429, damit Zaehlung und withMistralRetry mitgetestet werden (wartet 4 bis 10 s).
    if (c.id === "bund-knapp" && cur.modelKey === "large4" && cur.calls.length === 0) {
      throw Object.assign(new Error("selftest 429"), { statusCode: 429, body: "rate limited" });
    }
    const model = String(req.model);
    const bandMid = c.kind === "variant" ? 220 : bandMidFor(c);
    const offset = model === "mistral-small-latest" && okSoFar === 0 ? -60 : model === "mistral-large-latest" ? 10 : model === "mistral-medium-latest" ? 5 : 0;
    const total = Math.max(150, bandMid + offset);
    const body = Array.from({ length: Math.max(1, total - 10) }, (_, i) => `Wort${i % 7}`).join(" ");
    const letter = `Sehr geehrte Damen und Herren,\n\n${body}\n\nMit freundlichen Grüßen\nMax Beispiel`;
    const id = c.letterInput?.politicians[0]?.id ?? 0;
    const content =
      c.kind === "variant"
        ? JSON.stringify({ preservation_check: "ok", letter })
        : JSON.stringify({ selected_politician_id: id, letter });
    return {
      id: "selftest",
      object: "chat.completion",
      model,
      usage: { promptTokens: 1000 + okSoFar * 100, completionTokens: total * 2, totalTokens: 1000 + total * 2 },
      created: 0,
      choices: [{ index: 0, message: { role: "assistant", content }, finishReason: "stop" }],
    };
  }) as unknown as TaggedComplete;
  fake.__selftestFake = true;
  return fake;
}

function bandMidFor(c: CaseDef): number {
  if (c.id === "jung-klasse8") return 175;
  if (c.lengthKey === "1.5") return 330;
  return 220;
}

// ---------------------------------------------------------------------------
// Hauptablauf
// ---------------------------------------------------------------------------

async function loadDeps(): Promise<Deps> {
  const { mistral } = await import("../src/lib/mistral");
  const { generateLetter } = await import("../src/lib/generation/generateLetter");
  const { generateLetterVariant } = await import("../src/lib/generation/generateLetterVariant");
  const { LETTER_LENGTHS } = await import("../src/lib/config");
  const { youthLetterWords } = await import("../src/lib/schule/youth");
  return { mistral, generateLetter, generateLetterVariant, LETTER_LENGTHS, youthLetterWords };
}

function resolveModels(args: Args): Record<ModelKey, ModelConfig> {
  const models = {} as Record<ModelKey, ModelConfig>;
  for (const k of MODEL_KEYS) {
    const base = DEFAULT_MODELS[k];
    models[k] = {
      ...base,
      id: args.modelOverrides[k] ?? base.id,
      reasoningEffort: k in args.effortOverrides ? (args.effortOverrides[k] ?? null) : base.reasoningEffort,
      ...(args.maxTokensOverrides[k] !== undefined ? { maxTokens: args.maxTokensOverrides[k] } : {}),
    };
  }
  return models;
}

function selectCases(all: CaseDef[], args: Args): CaseDef[] {
  if (!args.cases) return all;
  const ids = new Set(all.map((c) => c.id));
  for (const id of args.cases) if (!ids.has(id)) fail(`Unbekannter Fall "${id}". Erlaubt: ${[...ids].join(", ")}`);
  return all.filter((c) => args.cases?.includes(c.id));
}

function caseViews(cases: CaseDef[]): RawMeta["cases"] {
  return cases.map(({ letterInput: _l, variantInput: _v, ...view }) => view);
}


async function dryRunPrompts(cases: CaseDef[]): Promise<{ promptChars: Record<string, number>; targetWords: Record<string, number> }> {
  const gen = await import("../src/lib/generation/generateLetter");
  const variant = await import("../src/lib/generation/generateLetterVariant");
  const { LETTER_LENGTHS } = await import("../src/lib/config");
  const { youthLetterWords } = await import("../src/lib/schule/youth");
  const promptChars: Record<string, number> = {};
  const targetWords: Record<string, number> = {};
  console.log("\nFaelle (Prompts aus der echten Pipeline gebaut, KEIN Aufruf):");
  for (const c of cases) {
    if (c.kind === "letter" && c.letterInput) {
      const input = c.letterInput;
      const band = input.youth ? youthLetterWords(input.youth.klasse) : LETTER_LENGTHS[input.letterLength ?? "1"];
      const tone = input.toneLevel ?? 3;
      const system = gen.buildSystemPrompt(input);
      const user = gen.buildUserPrompt(input, band.min, band.max, tone);
      promptChars[c.id] = system.length + user.length;
      targetWords[c.id] = Math.round((band.min + band.max) / 2);
      console.log(`  - ${c.id} [${c.label}] Ton ${tone}, Band ${band.min}-${band.max} Woerter, Eingabe ${input.issueText.length} Zeichen, System ${system.length} + User ${user.length} Zeichen`);
    } else if (c.kind === "variant" && c.variantInput) {
      const input = c.variantInput;
      const user = variant.buildVariantUserPrompt(input);
      const length = input.letterLength ?? "1";
      const band = LETTER_LENGTHS[length];
      promptChars[c.id] = variant.VARIANT_SYSTEM_PROMPT.length + user.length;
      targetWords[c.id] = Math.round((band.min + band.max) / 2);
      const refWords = countWords(input.originalLetter);
      console.log(`  - ${c.id} [${c.label}] Ton ${input.toneLevel}, Band ${band.min}-${band.max} Woerter, Referenzbrief ${refWords} Woerter, System ${variant.VARIANT_SYSTEM_PROMPT.length} + User ${user.length} Zeichen`);
    }
  }
  return { promptChars, targetWords };
}

function modelPlanLines(models: Record<ModelKey, ModelConfig>, keys: ModelKey[]): void {
  console.log("\nModelle:");
  for (const k of keys) {
    const m = models[k];
    console.log(`  - ${k}: ${m.id}, reasoningEffort ${m.reasoningEffort ?? "nicht gesetzt"}, Preis ${m.price ? `${m.price.input}/${m.price.output} USD pro 1 Mio.` : "offen"}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const anyMode = args.dryRun || args.checkModels || args.run || args.selftest || args.report;
  if (args.help || !anyMode) {
    console.log(helpText());
    return;
  }

  // --report braucht weder Env noch Netz.
  if (args.report) {
    const raw = loadRaw(assertRunId(args.report));
    const files = writeOutputs(raw);
    console.log(`Report neu gebaut:\n${files.map((f) => `  ${f}`).join("\n")}`);
    return;
  }

  // Env: im Selftest absichtlich KEINE echte .env.local laden (kein echter Key im Prozess).
  if (args.selftest) {
    process.env.MISTRAL_API_KEY = "selftest-dummy-no-network";
  } else {
    loadEnv();
  }

  const models = resolveModels(args);
  const keys = args.models ?? MODEL_KEYS;

  if (args.selftest && (args.run || args.dryRun || args.checkModels)) {
    fail("--selftest nicht mit --run, --dry-run oder --check-models kombinieren.");
  }

  if (args.checkModels && !args.dryRun && !args.run) {
    const outcome = await checkModels(models, requireApiKey(), true);
    if (!outcome.allFound) fail("\nMindestens ein Kandidat fehlt in der Modellliste. Mit --model <key>=<id> eine andere ID waehlen.", 1);
    console.log("\nAlle Kandidaten sind in der Modellliste.");
    return;
  }

  const allCases = await buildCases();
  const cases = selectCases(allCases, args);

  // ---------------- Dry-Run: nie eine Generierung ----------------
  if (args.dryRun) {
    const apiKey = requireApiKey();
    const deps = await loadDeps();
    // Gurt und Hosentraeger: im Dry-Run darf nichts generieren.
    (deps.mistral.chat as unknown as { complete: CompleteFn }).complete = (async () => {
      throw new Error("dry-run: Generierungsaufruf blockiert");
    }) as unknown as CompleteFn;
    modelPlanLines(models, keys);
    const outcome = await checkModels(models, apiKey, true);
    const { promptChars, targetWords } = await dryRunPrompts(cases);
    printEstimate(estimate(cases, promptChars, targetWords, keys, models), keys);
    const plan = buildPlan(allCases.map((c) => c.id));
    console.log("\nGeplante Modell-Reihenfolge je Fall (fester Seed, wird in raw.json und key.json festgehalten):");
    for (const c of cases) console.log(`  ${c.id}: ${plan.modelOrder[c.id].filter((k) => keys.includes(k)).join(", ")}`);
    if (!outcome.allFound) fail("\nDry-Run beendet: mindestens ein Kandidat fehlt in der Modellliste. Mit --model <key>=<id> korrigieren.", 1);
    console.log("\nDry-Run ok. Es wurde KEIN Generierungsaufruf ausgefuehrt.");
    return;
  }

  // ---------------- --run und --selftest ----------------
  const selftest = args.selftest;
  if (args.run && !args.confirmNoCampaign) {
    fail("Echte Mistral-Aufrufe nur, wenn keine Kampagne laeuft. Nach eigener Pruefung --confirm-no-campaign setzen.");
  }
  if (args.run) requireApiKey();

  const deps = await loadDeps();
  const st: RuntimeState = {
    selftest,
    totalCalls: 0,
    lastStart: 0,
    capHit: false,
    current: null,
    currentCfg: null,
    currentCase: null,
    effortUnsupported: new Set<ModelKey>(),
  };

  let target: TaggedComplete;
  if (selftest) {
    // Fetch sperren: erreicht trotz allem etwas das Netz, wirft es.
    globalThis.fetch = (() => {
      throw new Error("selftest: fetch blockiert");
    }) as unknown as typeof fetch;
    target = makeFakeComplete(st);
  } else {
    target = deps.mistral.chat.complete.bind(deps.mistral.chat) as TaggedComplete;
  }

  // Modell-IDs pruefen (GET, kostenlos) bevor echte Laeufe starten.
  let modelCheck: RawMeta["modelCheck"] = null;
  if (args.run) {
    const outcome = await checkModels(models, requireApiKey(), false);
    modelCheck = outcome.perKey;
    if (!outcome.allFound) fail("\nAbbruch: mindestens ein Kandidat fehlt in der Modellliste. Mit --model <key>=<id> korrigieren.", 1);
  }

  const plan = buildPlan(allCases.map((c) => c.id));
  let raw: RawFile;
  if (args.resume) {
    raw = loadRaw(assertRunId(args.resume));
    st.totalCalls = raw.results.reduce((a, r) => a + r.callCount, 0);
    st.effortUnsupported = new Set(raw.meta.effortUnsupported);
    for (const k of MODEL_KEYS) raw.meta.models[k] = models[k];
    raw.meta.aborted = null;
    raw.meta.modelCheck = modelCheck ?? raw.meta.modelCheck;
    console.log(`Fortsetzen von ${raw.meta.runId}: ${raw.results.length} Ergebnisse vorhanden, ${st.totalCalls} Aufrufe bisher.`);
  } else {
    const meta: RawMeta = {
      runId: newRunId(selftest),
      createdAt: new Date().toISOString(),
      selftest,
      seed: SEED,
      throttleMs: selftest ? 0 : THROTTLE_MS,
      hardCallCap: HARD_CALL_CAP,
      models,
      cases: caseViews(allCases),
      modelOrder: plan.modelOrder,
      labelOrder: plan.labelOrder,
      effortUnsupported: [],
      modelCheck,
      aborted: null,
    };
    raw = { meta, results: [] };
  }

  // Offene Paare bestimmen (erfolgreiche Paare ueberspringen, Fehlschlaege wiederholen).
  const done = new Set(raw.results.filter((r) => r.metrics && !r.error).map((r) => `${r.caseId}|${r.modelKey}`));
  const pending = new Set<string>();
  for (const c of cases) for (const k of keys) if (!done.has(`${c.id}|${k}`)) pending.add(`${c.id}|${k}`);

  if (!selftest) {
    const { promptChars, targetWords } = await dryRunPrompts(cases);
    printEstimate(estimate(cases, promptChars, targetWords, keys, models, pending), keys);
  }

  installWrapper(deps.mistral, target, st);
  console.log(`\nRun-ID: ${raw.meta.runId}${selftest ? " (Selftest, Fake-Antworten, kein Netz)" : ""}`);
  console.log(`Ausgabe: ${runDir(raw.meta.runId)}`);
  console.log(`Offene Paare: ${pending.size}. Laeufe strikt sequenziell.\n`);

  let order = raw.results.length;
  outer: for (const c of cases) {
    const caseOrder = raw.meta.modelOrder[c.id] ?? plan.modelOrder[c.id];
    for (const k of caseOrder) {
      if (!keys.includes(k) || !pending.has(`${c.id}|${k}`)) continue;
      order += 1;
      process.stderr.write(`[${order}] ${c.id} / ${k} (${models[k].id}) ... `);
      const result = await runPair(deps, st, c, models[k], order);
      // Eventuell ersetzten Eintrag (Fehlschlag bei Resume) entfernen.
      raw.results = raw.results.filter((r) => !(r.caseId === c.id && r.modelKey === k));
      raw.results.push(result);
      raw.meta.effortUnsupported = [...st.effortUnsupported];
      saveRaw(raw);
      if (result.metrics && !result.error) {
        process.stderr.write(
          `${result.metrics.wordCount} Woerter (${result.metrics.inBand ? "im Band" : "ausserhalb"}), ${result.callCount} Aufrufe, ${(result.ms / 1000).toFixed(1)} s\n`,
        );
      } else {
        process.stderr.write(`FEHLER ${result.error?.class ?? "kein Brief"} (Status ${result.error?.status ?? "-"}), ${result.callCount} Aufrufe\n`);
      }
      if (st.capHit) {
        raw.meta.aborted = `Aufrufdeckel von ${HARD_CALL_CAP} erreicht nach ${st.totalCalls} Aufrufen`;
        saveRaw(raw);
        console.error(`\n${raw.meta.aborted}. Mit --resume ${raw.meta.runId} fortsetzen, wenn der Deckel bewusst angehoben wird.`);
        break outer;
      }
    }
  }

  const files = writeOutputs(raw);
  console.log(`\nFertig. Gesamt-HTTP-Aufrufe: ${st.totalCalls}. Dateien:\n${files.map((f) => `  ${f}`).join("\n")}`);

  if (selftest) selftestChecks(raw, files, st, deps, target);
}

// ---------------------------------------------------------------------------
// Selftest-Pruefungen (offline)
// ---------------------------------------------------------------------------

function selftestChecks(raw: RawFile, files: string[], st: RuntimeState, deps: Deps, target: TaggedComplete): void {
  const problems: string[] = [];
  const check = (cond: boolean, msg: string) => {
    if (!cond) problems.push(msg);
  };
  const dir = runDir(raw.meta.runId);

  check(raw.results.length === raw.meta.cases.length * MODEL_KEYS.length, `Ergebnisse: ${raw.results.length} statt ${raw.meta.cases.length * MODEL_KEYS.length}`);
  check(raw.results.every((r) => r.metrics && !r.error), "nicht alle Fake-Laeufe erfolgreich");
  check(raw.results.every((r) => r.callCount >= 1), "Lauf ohne Aufruf-Log");
  const r429 = raw.results.find((r) => r.caseId === "bund-knapp" && r.modelKey === "large4");
  check(r429?.http429 === 1, `429-Zaehlung: ${r429?.http429}`);
  const retry = raw.results.find((r) => r.caseId === "bund-knapp" && r.modelKey === "small4");
  check((retry?.contentRetry ?? 0) >= 1, `Inhalts-Retry (small4, Fake zu kurz): ${retry?.contentRetry}`);
  const sentModels = new Set(raw.results.flatMap((r) => r.calls.map((c) => c.model)));
  check(sentModels.size === 4, `Modell-Override: ${[...sentModels].join(", ")}`);
  const sentEfforts = new Set(raw.results.flatMap((r) => r.calls.map((c) => `${r.modelKey}:${c.reasoningEffort}`)));
  check(sentEfforts.has("large3:null") && sentEfforts.has("large4:low") && sentEfforts.has("small4:none"), `reasoningEffort-Override: ${[...sentEfforts].join(", ")}`);
  check(!raw.results.some((r) => r.calls.some((c) => c.model === "mistral-large-2512" && r.modelKey !== "large3")), "Modell-Override vermischt");

  for (const f of files) check(fs.existsSync(f), `Datei fehlt: ${f}`);

  // Blind: keine Modellnamen/IDs.
  const blind = fs.readFileSync(path.join(dir, "blind.html"), "utf8");
  const forbidden = /mistral|large|small|medium|magistral|large3|large4|small4|medium35|2512|latest/i;
  const m = blind.match(forbidden);
  check(!m, `blind.html enthaelt Modellhinweis: ${m?.[0]}`);

  // key.json: Zuordnung vollstaendig, Label-Karten in blind.html passen zu raw.json.
  const key = JSON.parse(fs.readFileSync(path.join(dir, "key.json"), "utf8")) as { labelOrder: Record<string, Record<string, ModelKey>> };
  for (const c of raw.meta.cases) {
    const map = key.labelOrder[c.id];
    check(Boolean(map) && LABELS.every((l) => isModelKey(map?.[l] ?? "")), `key.json unvollstaendig fuer ${c.id}`);
    for (const l of LABELS) {
      const modelKey = map?.[l];
      const res = raw.results.find((r) => r.caseId === c.id && r.modelKey === modelKey);
      const card = blind.match(new RegExp(`data-case="${c.id}" data-label="${l}" data-words="(\\d+)"`));
      check(Boolean(card) && Number(card?.[1]) === (res?.metrics?.wordCount ?? -1), `Blind-Karte ${c.id}/${l} passt nicht zu key.json`);
    }
  }
  const orders = new Set(Object.values(key.labelOrder).map((m) => LABELS.map((l) => m[l]).join(",")));
  check(orders.size > 1, "Blind-Reihenfolge nicht gemischt");

  // Wrapper-Schutz: im Selftest darf kein echtes Ziel erreichbar sein.
  const guardState: RuntimeState = { ...st, current: raw.results[0], currentCfg: raw.meta.models.large3, totalCalls: 0 };
  const unsafeTarget = (async () => {
    throw new Error("echtes Ziel erreicht");
  }) as unknown as TaggedComplete;
  const guarded = installWrapper(deps.mistral, unsafeTarget, guardState);
  guarded({ model: "x", messages: [] } as ChatRequest).then(
    () => problems.push("Selftest-Schutz: echtes Ziel wurde nicht blockiert"),
    (err: Error) => {
      if (!/selftest: echter SDK/.test(err.message)) problems.push(`Selftest-Schutz: falsche Meldung: ${err.message}`);
      // Deckel pruefen
      const capTest: RuntimeState = { ...st, totalCalls: HARD_CALL_CAP, capHit: false, current: raw.results[0], currentCfg: raw.meta.models.large3 };
      const capWrapped = installWrapper(deps.mistral, target, capTest);
      capWrapped({ model: "x", messages: [] } as ChatRequest).then(
        () => problems.push("Aufrufdeckel hat nicht gegriffen"),
        (e2: Error) => {
          if (e2.name !== "HardCapError" || !capTest.capHit) problems.push("Aufrufdeckel: falscher Fehler");
          finish();
        },
      );
    },
  );

  function finish() {
    if (problems.length > 0) {
      console.error("\nSELFTEST FEHLGESCHLAGEN:\n" + problems.map((p) => `  - ${p}`).join("\n"));
      process.exit(1);
    }
    console.log("\nSELFTEST OK: 40 Fake-Laeufe, Parser, Metriken, 429-/Retry-Zaehlung, Modell- und Effort-Override, Blind-Mischung, key.json, Dateien, Selftest-Schutz und Aufrufdeckel geprueft. Kein Netzaufruf.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
