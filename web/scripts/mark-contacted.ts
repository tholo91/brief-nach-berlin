// Mark one review (or all reviews for an email) as personally answered.
// Sets `reviews.contacted_at` to a date. NULL = not yet contacted.
//
// This is the only write script in the operator feedback loop. Keep it
// narrow — single column, single table, with a preview + confirm step.
//
// Run:
//   pnpm -F web tsx scripts/mark-contacted.ts <id-or-email> [flags]
//
// Arguments:
//   <id-or-email>      UUID (any prefix length >= 8 works) OR a full email.
//                      Email matches MAY hit multiple rows (one user can have
//                      reviewed multiple times). Preview shows what will be
//                      updated.
//
// Flags:
//   --date YYYY-MM-DD  Override the contact date (default: today, UTC)
//   --unset            Set contacted_at back to NULL
//   --yes              Skip the confirm prompt
//   --all-matches      When an email matches multiple reviews, mark them all
//                      (otherwise abort and ask user to be specific)

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createClient } from "@supabase/supabase-js";

loadEnvLocal();

type Args = {
  target: string;
  date: string;
  unset: boolean;
  yes: boolean;
  allMatches: boolean;
};

function parseArgs(argv: string[]): Args {
  if (argv.length === 0) {
    console.error("Usage: mark-contacted.ts <id-or-email> [--date YYYY-MM-DD] [--unset] [--yes]");
    process.exit(2);
  }
  const a: Args = {
    target: argv[0]!,
    date: todayUtc(),
    unset: false,
    yes: false,
    allMatches: false,
  };
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => argv[++i];
    switch (arg) {
      case "--date":
        a.date = next();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date)) {
          throw new Error(`--date must be YYYY-MM-DD, got ${a.date}`);
        }
        break;
      case "--unset":
        a.unset = true;
        break;
      case "--yes":
        a.yes = true;
        break;
      case "--all-matches":
        a.allMatches = true;
        break;
      default:
        throw new Error(`Unknown flag: ${arg}`);
    }
  }
  return a;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function looksLikeEmail(s: string): boolean {
  return s.includes("@");
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

  // 1) Find matching rows (preview).
  const selectCols = "id, created_at, rating, email, display_name, body, contacted_at";
  const query = client.from("reviews").select(selectCols).order("created_at", { ascending: false });
  const { data, error } = looksLikeEmail(args.target)
    ? await query.eq("email", args.target)
    : await query.ilike("id", `${args.target}%`);
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    id: string;
    created_at: string;
    rating: number;
    email: string | null;
    display_name: string | null;
    body: string | null;
    contacted_at: string | null;
  }>;

  if (rows.length === 0) {
    console.error(`No review matches "${args.target}".`);
    process.exit(1);
  }
  if (rows.length > 1 && !args.allMatches) {
    console.error(`"${args.target}" matched ${rows.length} reviews:`);
    for (const r of rows) {
      console.error(
        `  ${r.id}  ${r.created_at.slice(0, 16)}  ${r.rating}★  ${r.display_name || "(anon)"} <${r.email}>  contacted=${r.contacted_at || "null"}`,
      );
    }
    console.error(
      "\nRefusing to update without --all-matches. Use a specific id prefix to disambiguate, or pass --all-matches to mark all of them.",
    );
    process.exit(1);
  }

  // 2) Preview + confirm.
  const targetValue = args.unset ? null : args.date;
  console.log(`\nWill set contacted_at = ${targetValue ?? "NULL"} on ${rows.length} review(s):\n`);
  for (const r of rows) {
    const bodySnip = (r.body || "").replace(/\s+/g, " ").slice(0, 80);
    console.log(
      `  ${r.id}  ${r.created_at.slice(0, 16)}  ${r.rating}★  ${r.display_name || "(anon)"} <${r.email}>`,
    );
    console.log(`    current contacted_at: ${r.contacted_at || "null"}`);
    if (bodySnip) console.log(`    body: ${bodySnip}${(r.body || "").length > 80 ? "…" : ""}`);
  }

  if (!args.yes) {
    const rl = createInterface({ input, output });
    const answer = (await rl.question("\nProceed? [y/N] ")).trim().toLowerCase();
    rl.close();
    if (answer !== "y" && answer !== "yes") {
      console.error("Aborted.");
      process.exit(0);
    }
  }

  // 3) Update.
  const ids = rows.map((r) => r.id);
  const { error: updateError, count } = await client
    .from("reviews")
    .update({ contacted_at: targetValue }, { count: "exact" })
    .in("id", ids);
  if (updateError) throw updateError;

  console.log(`\nOK — updated ${count ?? ids.length} row(s).`);
}

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
