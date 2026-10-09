// One-off: sends (or previews) the "Kampagne beendet" thank-you mail to the
// creator of an ended campaign. Without --send it only reads the campaign and
// writes an HTML preview. Nothing is sent and nothing is written to the DB.
//
// With --send it creates a fresh `manage` token (the stored ones are hashed,
// so the old link cannot be recovered) and sends through Brevo. Only use
// --send after Thomas approved the exact campaign and recipient.
//
// Run (preview, safe):
//   cd web && npx tsx scripts/send-campaign-ended-mail.ts \
//     --slug unterschrift-ist-kein-dienstvergehen --out preview/ended.html
//
// Run (test send to yourself, no BCC):
//   npx tsx scripts/send-campaign-ended-mail.ts --slug <slug> --to me@example.org --send
//
// Run (real send to the creator, BCC to THOMAS_MAIL):
//   npx tsx scripts/send-campaign-ended-mail.ts --slug <slug> --send
//
// Flags:
//   --slug <slug>   Campaign slug (required)
//   --out <file>    Preview HTML path (default: send-campaign-ended-preview.html)
//   --to <email>    Override the recipient (also disables the BCC)
//   --name <name>   Override the greeting name (e.g. first name only)
//   --send          Really send. Without it: preview only.
//
// Voraussetzungen: web/.env.local enthält NEXT_PUBLIC_SUPABASE_URL und
// SUPABASE_SERVICE_ROLE_KEY (für --send zusätzlich BREVO_API_KEY).

import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { formatLetterCount } from "../src/lib/campaigns/milestones";
import { APP_URL } from "../src/lib/config";
import { buildCampaignCreatorEmailHtml } from "../src/lib/email/buildCampaignCreatorEmailHtml";
import { campaignPublicUrl } from "../src/lib/share";

// Same value as MANAGE_TOKEN_TTL_SECONDS in src/lib/campaigns/tokens.ts.
const MANAGE_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 365 * 100;
const DEFAULT_OUT = "send-campaign-ended-preview.html";

type Args = { slug?: string; out: string; to?: string; name?: string; send: boolean };

type CampaignRow = {
  id: string;
  slug: string;
  title: string;
  creator_email: string;
  creator_name: string | null;
  letter_count: number | null;
  status: string;
  ends_at: string | null;
};

function parseArgs(argv: string[]): Args {
  const value = (name: string) => {
    const index = argv.indexOf(`--${name}`);
    return index === -1 ? undefined : argv[index + 1];
  };
  return {
    slug: value("slug"),
    out: value("out") ?? DEFAULT_OUT,
    to: value("to"),
    name: value("name"),
    send: argv.includes("--send"),
  };
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.slug) {
    console.error("Usage: --slug <slug> [--out <file.html>] [--to <email>] [--name <name>] [--send]");
    process.exit(1);
  }

  loadEnvLocal();
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

  const { data, error } = await client
    .from("campaigns")
    .select("id, slug, title, creator_email, creator_name, letter_count, status, ends_at")
    .eq("slug", args.slug)
    .maybeSingle();
  if (error) throw new Error(`Campaign lookup failed: ${error.message}`);
  if (!data) throw new Error(`Campaign not found: ${args.slug}`);
  const campaign = data as CampaignRow;

  const count = campaign.letter_count ?? 0;
  const recipient = args.to ?? campaign.creator_email;
  const creatorName = args.name ?? campaign.creator_name;
  const subject = `Danke für ${formatLetterCount(count)} Briefe zu „${campaign.title}“`;

  console.log(`Kampagne:   ${campaign.title} (${campaign.slug})`);
  console.log(`Status:     ${campaign.status}, ends_at ${campaign.ends_at ?? "nicht gesetzt"}`);
  console.log(`Empfänger:  ${recipient}${args.to ? " (überschrieben)" : ""}`);
  console.log(`Anrede:     Moin ${creatorName ?? ""},`);
  console.log(`Betreff:    ${subject}`);
  console.log(`letter_count: ${count}`);

  if (!args.send) {
    const imageUrl = `${APP_URL}/kampagne/${encodeURIComponent(campaign.slug)}/meilenstein/${count}/bild`;
    const html = buildCampaignCreatorEmailHtml({
      kind: "ended",
      campaignTitle: campaign.title,
      slug: campaign.slug,
      campaignUrl: campaignPublicUrl(campaign.slug),
      actionUrl: `${APP_URL}/kampagne/verwalten?token=vorschau`,
      creatorName,
      ended: { count, imageUrl, downloadUrl: `${imageUrl}?download=1` },
    });
    const outPath = resolve(args.out);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html, "utf8");
    console.log(`Vorschau:   ${outPath}`);
    console.log("Nichts gesendet. Mit --send wirklich versenden.");
    return;
  }

  // Mirrors createCampaignToken(campaignId, "manage") from
  // src/lib/campaigns/tokens.ts, which is `server-only` and cannot be imported here.
  const token = randomBytes(32).toString("base64url");
  const { error: tokenError } = await client.from("campaign_tokens").insert({
    campaign_id: campaign.id,
    kind: "manage",
    token_hash: createHash("sha256").update(token, "utf8").digest("hex"),
    expires_at: new Date(Date.now() + MANAGE_TOKEN_TTL_SECONDS * 1000).toISOString(),
  });
  if (tokenError) throw new Error(`Token create failed: ${tokenError.message}`);

  // Brevo sender checks BREVO_API_KEY at import time, so load it after loadEnvLocal.
  const { sendCampaignCreatorEmail } = await import(
    "../src/lib/email/sendCampaignCreatorEmail"
  );
  const result = await sendCampaignCreatorEmail({
    kind: "ended",
    recipientEmail: recipient,
    campaignTitle: campaign.title,
    slug: campaign.slug,
    creatorName,
    token,
    ended: { count },
    adminCopy: !args.to,
  });
  if (!result.success) {
    throw new Error("Send failed, see error log above");
  }
  console.log(`Gesendet:   messageId ${result.messageId ?? "unbekannt"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
