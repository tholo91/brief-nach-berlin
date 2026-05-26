// Read-only inspection of the `reviews` table. Used to triage user feedback
// from the terminal without manual CSV exports from Supabase Studio.
//
// This script SELECTS ONLY. It contains no insert/update/delete code, by
// design. To mark a review as personally answered, use mark-contacted.ts.
//
// Run:
//   pnpm -F web tsx scripts/fetch-reviews.ts [flags]
//
// Flags:
//   --since YYYY-MM-DD     Only reviews on/after this date (default: 7 days ago)
//   --until YYYY-MM-DD     Only reviews before this date (exclusive)
//   --limit N              Max rows (default: 50, max 500)
//   --with-body            Only reviews with non-empty `body`
//   --rating N             Exact rating (1..5)
//   --rating-max N         All ratings <= N
//   --rating-min N         All ratings >= N
//   --tag TAG              Only reviews containing this feedback_tag
//   --source live|backlog|all   Filter by debug_payload.source (default: all)
//   --include-tests        Show test-emails too (default: filtered out)
//   --uncontacted          Only reviews with contacted_at IS NULL
//   --contacted            Only reviews with contacted_at NOT NULL
//   --full-body            Do not truncate `body`
//   --format table|json|md (default: table)
//
// Voraussetzungen: web/.env.local enthält NEXT_PUBLIC_SUPABASE_URL und
// SUPABASE_SERVICE_ROLE_KEY (Pattern aus send-backlog-followup.ts).

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

loadEnvLocal();

// Thomas's own test addresses — filtered out by default so they don't pollute
// the operator view. Extend as needed.
const TEST_EMAILS = new Set<string>(
  [
    "tholorenz@posteo.de",
    "thomas-lorenz@posteo.de",
    "thomas@visualmakers.de",
    "thomas.lorenz@visualmakers.de",
  ].map((e) => e.toLowerCase()),
);

const DEFAULT_LIMIT = 50;
const HARD_MAX_LIMIT = 500;
const DEFAULT_SINCE_DAYS = 7;
const BODY_TRUNCATE = 200;

type Args = {
  since?: string;
  until?: string;
  limit: number;
  withBody: boolean;
  rating?: number;
  ratingMax?: number;
  ratingMin?: number;
  tag?: string;
  source: "live" | "backlog" | "all";
  includeTests: boolean;
  uncontacted: boolean;
  contacted: boolean;
  fullBody: boolean;
  format: "table" | "json" | "md";
};

function parseArgs(argv: string[]): Args {
  const a: Args = {
    limit: DEFAULT_LIMIT,
    withBody: false,
    source: "all",
    includeTests: false,
    uncontacted: false,
    contacted: false,
    fullBody: false,
    format: "table",
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => argv[++i];
    switch (arg) {
      case "--since":
        a.since = next();
        break;
      case "--until":
        a.until = next();
        break;
      case "--limit":
        a.limit = Math.min(HARD_MAX_LIMIT, Math.max(1, Number(next())));
        break;
      case "--with-body":
        a.withBody = true;
        break;
      case "--rating":
        a.rating = Number(next());
        break;
      case "--rating-max":
        a.ratingMax = Number(next());
        break;
      case "--rating-min":
        a.ratingMin = Number(next());
        break;
      case "--tag":
        a.tag = next();
        break;
      case "--source": {
        const v = next();
        if (v !== "live" && v !== "backlog" && v !== "all") {
          throw new Error(`--source must be live|backlog|all, got ${v}`);
        }
        a.source = v;
        break;
      }
      case "--include-tests":
        a.includeTests = true;
        break;
      case "--uncontacted":
        a.uncontacted = true;
        break;
      case "--contacted":
        a.contacted = true;
        break;
      case "--full-body":
        a.fullBody = true;
        break;
      case "--format": {
        const v = next();
        if (v !== "table" && v !== "json" && v !== "md") {
          throw new Error(`--format must be table|json|md, got ${v}`);
        }
        a.format = v;
        break;
      }
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown flag: ${arg}`);
    }
  }
  if (!a.since) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - DEFAULT_SINCE_DAYS);
    a.since = d.toISOString().slice(0, 10);
  }
  if (a.uncontacted && a.contacted) {
    throw new Error("--uncontacted and --contacted are mutually exclusive");
  }
  return a;
}

function printHelp() {
  // Strip the leading "// " from the header block so the help is the
  // canonical reference for flags.
  const header = readFileSync(__filename, "utf8")
    .split("\n")
    .slice(0, 32)
    .map((l) => l.replace(/^\/\/ ?/, ""))
    .join("\n");
  console.log(header);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in web/.env.local",
    );
  }
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let q = client
    .from("reviews")
    .select(
      [
        "id",
        "created_at",
        "rating",
        "body",
        "email",
        "display_name",
        "politician_id",
        "plz",
        "letter_sent",
        "feedback_tags",
        "contacted_at",
        "debug_payload",
      ].join(","),
    )
    .gte("created_at", `${args.since}T00:00:00Z`)
    .order("created_at", { ascending: false })
    .limit(args.limit);

  if (args.until) q = q.lt("created_at", `${args.until}T00:00:00Z`);
  if (args.rating !== undefined) q = q.eq("rating", args.rating);
  if (args.ratingMax !== undefined) q = q.lte("rating", args.ratingMax);
  if (args.ratingMin !== undefined) q = q.gte("rating", args.ratingMin);
  if (args.tag) q = q.contains("feedback_tags", [args.tag]);
  if (args.uncontacted) q = q.is("contacted_at", null);
  if (args.contacted) q = q.not("contacted_at", "is", null);

  const { data, error } = await q;
  if (error) throw error;
  if (!data) {
    console.error("(no data)");
    return;
  }

  // Client-side filters (cheaper than fighting Supabase's PostgREST syntax
  // for nested jsonb keys and not-empty checks).
  let rows = data as ReviewRow[];

  if (!args.includeTests) {
    rows = rows.filter((r) => !r.email || !TEST_EMAILS.has(r.email.toLowerCase()));
  }
  if (args.withBody) {
    rows = rows.filter((r) => r.body && r.body.trim().length > 0);
  }
  if (args.source !== "all") {
    rows = rows.filter((r) => {
      const isBacklog = r.debug_payload?.source === "backlog_2026_05";
      return args.source === "backlog" ? isBacklog : !isBacklog;
    });
  }

  if (args.format === "json") {
    console.log(JSON.stringify(rows, null, 2));
  } else if (args.format === "md") {
    printMd(rows, args);
  } else {
    printTable(rows, args);
  }

  // Helpful footer for the operator
  const hitLimit = data.length >= args.limit;
  console.error(
    `\n${rows.length} row(s) shown` +
      (rows.length !== data.length ? ` (of ${data.length} fetched)` : "") +
      (hitLimit ? ` — limit ${args.limit} hit, raise with --limit` : ""),
  );
}

type ReviewRow = {
  id: string;
  created_at: string;
  rating: number;
  body: string | null;
  email: string | null;
  display_name: string | null;
  politician_id: string | null;
  plz: string | null;
  letter_sent: boolean | null;
  feedback_tags: string[] | null;
  contacted_at: string | null;
  debug_payload: {
    source?: string;
    representativeName?: string;
    representativeParty?: string;
    representativeWahlkreis?: string;
    representativeLevel?: string;
    politicalLevel?: string;
    wordCount?: number;
    wordCountInRange?: boolean;
    mdbContextUsed?: boolean;
    toneLabel?: string;
    toneLevel?: number;
    generationMs?: number;
    issueTextLength?: number;
    letterLengthKey?: string;
  } | null;
};

const C = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
};

function ratingColor(n: number, s: string): string {
  if (n <= 2) return C.red(s);
  if (n === 3) return C.yellow(s);
  return C.green(s);
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function printTable(rows: ReviewRow[], args: Args) {
  for (const r of rows) {
    const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
    const ratingStr = ratingColor(r.rating, `${r.rating} ${stars}`);
    const date = r.created_at.slice(0, 16).replace("T", " ");
    const source = r.debug_payload?.source === "backlog_2026_05" ? "BACKLOG" : "LIVE";
    const sent =
      r.letter_sent === true ? "sent ✓" : r.letter_sent === false ? "not sent" : "unset";
    const name = r.display_name || "(anon)";
    const email = r.email || "—";
    const contactedStr = r.contacted_at
      ? C.cyan(`contacted ${r.contacted_at}`)
      : C.dim("uncontacted");

    console.log(
      `${C.bold(shortId(r.id))}  ${C.dim(date)}  ${ratingStr}  ${C.magenta(source)}  ${C.dim(sent)}  ${contactedStr}`,
    );
    console.log(`  ${C.bold(name)}  <${email}>`);

    if (source === "LIVE") {
      const p = r.debug_payload || {};
      const wcFlag = p.wordCountInRange === false ? C.red("out-of-range") : C.dim("in-range");
      const mdbFlag = p.mdbContextUsed === false ? C.dim("mdbCtx=false") : C.green("mdbCtx=true");
      const polLevel = p.politicalLevel || "?";
      const repLevel = p.representativeLevel || "?";
      const levelFlag =
        polLevel !== repLevel ? C.red(`level ${polLevel}→${repLevel}`) : `level ${repLevel}`;
      console.log(
        `  ${C.dim("MdB:")} ${p.representativeName || "—"} (${p.representativeParty || "—"}) / ${p.representativeWahlkreis || "—"} / PLZ ${r.plz || "—"}`,
      );
      console.log(
        `  ${C.dim("Letter:")} ${p.wordCount ?? "?"} words ${wcFlag}, ${p.generationMs ?? "?"}ms, tone ${p.toneLabel || "?"}(${p.toneLevel ?? "?"}), ${levelFlag}, ${mdbFlag}`,
      );
    }

    const tags = r.feedback_tags || [];
    if (tags.length > 0) {
      const colored = tags.map((t) => {
        if (POSITIVE_TAGS.has(t)) return C.green(t);
        if (NEGATIVE_TAGS.has(t)) return C.red(t);
        return C.dim(t);
      });
      console.log(`  ${C.dim("tags:")} ${colored.join(", ")}`);
    }

    if (r.body && r.body.trim().length > 0) {
      const body = args.fullBody ? r.body.trim() : truncate(r.body.trim(), BODY_TRUNCATE);
      console.log(`  ${C.cyan("BODY:")} ${body.replace(/\n+/g, " / ")}`);
    }

    console.log("");
  }
}

function printMd(rows: ReviewRow[], args: Args) {
  console.log(`# Reviews (${rows.length})\n`);
  for (const r of rows) {
    const date = r.created_at.slice(0, 16).replace("T", " ");
    const source = r.debug_payload?.source === "backlog_2026_05" ? "BACKLOG" : "LIVE";
    const sent =
      r.letter_sent === true ? "sent" : r.letter_sent === false ? "not sent" : "unset";
    const contacted = r.contacted_at ? `contacted ${r.contacted_at}` : "uncontacted";
    const name = r.display_name || "(anon)";
    const email = r.email || "—";
    console.log(`## ${shortId(r.id)} — ${r.rating}★ — ${date} — ${source}`);
    console.log(`- ${name} <${email}> — ${sent} — ${contacted}`);
    if (source === "LIVE") {
      const p = r.debug_payload || {};
      console.log(
        `- MdB: ${p.representativeName || "—"} (${p.representativeParty || "—"}) / ${p.representativeWahlkreis || "—"} / PLZ ${r.plz || "—"}`,
      );
      console.log(
        `- Letter: ${p.wordCount ?? "?"} words (inRange=${p.wordCountInRange}), ${p.generationMs ?? "?"}ms, tone ${p.toneLabel || "?"}(${p.toneLevel ?? "?"}), mdbCtx=${p.mdbContextUsed}`,
      );
    }
    if (r.feedback_tags && r.feedback_tags.length > 0) {
      console.log(`- tags: ${r.feedback_tags.join(", ")}`);
    }
    if (r.body && r.body.trim().length > 0) {
      const body = args.fullBody ? r.body.trim() : truncate(r.body.trim(), BODY_TRUNCATE);
      console.log(`\n> ${body.replace(/\n+/g, "\n> ")}\n`);
    }
    console.log("");
  }
}

// Tag classification mirrors web/src/lib/feedback/feedbackTags.ts (kept local
// here so the script has no Next-app import). Keep in sync if tags change.
const POSITIVE_TAGS = new Set([
  "tonfall_passt",
  "argumente_stark",
  "sofort_verschickbar",
  "mdb_gut_gewaehlt",
]);
const NEGATIVE_TAGS = new Set([
  "zu_lang",
  "zu_kurz",
  "falscher_ton",
  "zu_generisch",
  "klingt_nicht_nach_mir",
  "mdb_passt_nicht",
  "details_erfunden",
  "anliegen_verfehlt",
  "wiederholt_sich",
]);

function loadEnvLocal() {
  const envPath = resolve(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
