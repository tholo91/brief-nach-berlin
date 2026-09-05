// Deletes all reviews and voluntary letter signals for one email address.
// Default is dry-run. A deletion only happens with --confirm.
//
// Run:
//   npm exec tsx scripts/delete-letter-data-by-email.ts -- --email person@example.org
//   npm exec tsx scripts/delete-letter-data-by-email.ts -- --email person@example.org --confirm

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { createLetterSignalEmailHash } from "../src/lib/letterSignals/emailHash";

type Args = { email: string; confirm: boolean };

function parseArgs(argv: string[]): Args {
  let email: string | null = null;
  let confirm = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--email") email = argv[++index] ?? null;
    else if (arg === "--confirm") confirm = true;
    else throw new Error(`Unknown flag: ${arg}`);
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    throw new Error("Usage: delete-letter-data-by-email.ts --email person@example.org [--confirm]");
  }
  return { email: email.trim().toLowerCase(), confirm };
}

function loadEnvLocal() {
  const envPath = resolve(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.LETTER_SIGNAL_EMAIL_HASH_SECRET;
  if (!url || !key || !secret) throw new Error("Missing Supabase credentials or letter-signal email hash secret.");

  const client = createClient(url, key, { auth: { persistSession: false } });
  const lookupHash = createLetterSignalEmailHash(args.email, secret);
  const [reviewsResult, hashSignalsResult, emailSignalsResult] = await Promise.all([
    client.from("reviews").select("id, created_at, rating, letter_id").eq("email", args.email),
    client.from("letter_signals").select("id, created_at, status").eq("email_lookup_hash", lookupHash),
    client.from("letter_signals").select("id, created_at, status").eq("email_normalized", args.email),
  ]);
  if (reviewsResult.error) throw reviewsResult.error;
  if (hashSignalsResult.error) throw hashSignalsResult.error;
  if (emailSignalsResult.error) throw emailSignalsResult.error;

  const reviews = reviewsResult.data ?? [];
  const linkedLetterIds = Array.from(new Set(
    reviews.map((review) => review.letter_id).filter((value): value is string => typeof value === "string"),
  ));
  const linkedSignalsResult = linkedLetterIds.length > 0
    ? await client.from("letter_signals").select("id, created_at, status").in("letter_id", linkedLetterIds)
    : { data: [], error: null };
  if (linkedSignalsResult.error) throw linkedSignalsResult.error;
  const signals = Array.from(new Map(
    [...(hashSignalsResult.data ?? []), ...(emailSignalsResult.data ?? []), ...(linkedSignalsResult.data ?? [])]
      .map((signal) => [signal.id, signal]),
  ).values());
  console.log(`Dry run for ${args.email}:`);
  console.log(`- ${reviews.length} review(s)`);
  console.log(`- ${signals.length} voluntary letter signal(s)`);

  if (!args.confirm) {
    console.log("No data was deleted. Re-run with --confirm to permanently delete these rows.");
    return;
  }

  const signalIds = signals.map((signal) => signal.id);
  const [reviewDelete, signalDelete] = await Promise.all([
    client.from("reviews").delete({ count: "exact" }).eq("email", args.email),
    signalIds.length > 0
      ? client.from("letter_signals").delete({ count: "exact" }).in("id", signalIds)
      : Promise.resolve({ count: 0, error: null }),
  ]);
  if (reviewDelete.error) throw reviewDelete.error;
  if (signalDelete.error) throw signalDelete.error;
  console.log(`Deleted ${reviewDelete.count ?? reviews.length} review(s) and ${signalDelete.count ?? signals.length} signal(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
