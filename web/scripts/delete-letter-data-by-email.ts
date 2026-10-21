// Deletes all reviews, voluntary letter signals, and outcome feedback for one email address.
// Default is dry-run. A deletion only happens with --confirm.
//
// Run:
//   npm exec tsx scripts/delete-letter-data-by-email.ts -- --email person@example.org
//   npm exec tsx scripts/delete-letter-data-by-email.ts -- --email person@example.org --confirm

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { deleteUserDataByEmail, lookupUserDataByEmail } from "../src/lib/dataDeletion/userData";

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
  console.log(`Dry run for ${args.email}:`);
  const found = await lookupUserDataByEmail(client, args.email);
  console.log(`- ${found.reviews.length} review(s)`);
  console.log(`- ${found.mapEntries.length} voluntary letter signal(s)`);
  console.log(`- ${found.outcomes.length} outcome response(s)`);
  if (found.reviews.length > 0) {
    console.log("Note: also remove this person's review from src/lib/reviews/fallbackReviews.ts if it is listed there.");
  }

  if (!args.confirm) {
    console.log("No data was deleted. Re-run with --confirm to permanently delete these rows.");
    return;
  }

  const deleted = await deleteUserDataByEmail(client, args.email);
  console.log(
    `Deleted ${deleted.reviews} review(s), ${deleted.mapEntries} signal(s), and ${deleted.outcomes} outcome response(s).`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
