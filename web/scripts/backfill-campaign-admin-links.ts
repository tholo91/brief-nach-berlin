// Legt für jede Kampagne ohne Admin-Link einen eigenen Verwaltungs-Token an und
// schreibt den Klartext-Link in campaign_tokens.admin_link (Migration 043).
// Alte Links lassen sich nicht befüllen: Tokens liegen nur als Hash vor.
// Kampagnen in awaiting_email_verification bekommen ihren Link automatisch
// bei der E-Mail-Bestätigung (die widerruft vorher alle Verwaltungs-Tokens).
// Mehrfach ausführbar, überspringt Kampagnen mit aktivem Admin-Link.
//
// Run (aus web/):
//   npx tsx scripts/backfill-campaign-admin-links.ts          # nur zählen
//   npx tsx scripts/backfill-campaign-admin-links.ts --write  # schreiben
//
// Liest NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY aus web/.env.local.
// Gibt keine Links aus, sie stehen nur in der Datenbank.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const APP_URL = "https://www.brief-nach-berlin.de";
const MANAGE_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 365 * 100;

loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in web/.env.local.");
  process.exit(1);
}
const write = process.argv.includes("--write");
const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { data: campaigns, error } = await db
    .from("campaigns")
    .select("id, status")
    .neq("status", "awaiting_email_verification");
  if (error) throw new Error(`campaigns: ${error.message}`);

  const { data: existing, error: tokenError } = await db
    .from("campaign_tokens")
    .select("campaign_id")
    .eq("kind", "manage")
    .not("admin_link", "is", null)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString());
  if (tokenError) throw new Error(`campaign_tokens: ${tokenError.message}`);

  const done = new Set((existing ?? []).map((row) => row.campaign_id as string));
  const todo = (campaigns ?? []).filter((c) => !done.has(c.id as string));
  console.log(`Kampagnen: ${campaigns?.length ?? 0}, mit Admin-Link: ${done.size}, fehlen: ${todo.length}`);
  if (!write) {
    console.log("Nur gezählt. Mit --write schreiben.");
    return;
  }

  let ok = 0;
  for (const campaign of todo) {
    const token = randomBytes(32).toString("base64url");
    const { error: insertError } = await db.from("campaign_tokens").insert({
      campaign_id: campaign.id,
      kind: "manage",
      token_hash: createHash("sha256").update(token, "utf8").digest("hex"),
      expires_at: new Date(Date.now() + MANAGE_TOKEN_TTL_MS).toISOString(),
      admin_link: `${APP_URL}/kampagne/verwalten?token=${encodeURIComponent(token)}`,
    });
    if (insertError) {
      console.error(`Fehler bei ${campaign.id}: ${insertError.message}`);
      continue;
    }
    ok += 1;
  }
  console.log(`Geschrieben: ${ok} von ${todo.length}`);
}

function loadEnvLocal() {
  const envPath = resolve(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const name = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(name in process.env)) process.env[name] = value;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
