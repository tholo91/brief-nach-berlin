// Closing mail ("Kampagne beendet") for creators of ended campaigns. Manual,
// two-step flow, nothing is sent without an explicit flag.
//
//   1. --list                 Which ended campaigns still wait for the mail
//                             (ended, ended_notified_at null, 10+ letters).
//   2. --preview-to-me        Renders the mail and sends it to Thomas only
//                             (THOMAS_MAIL), with a marked gap where his
//                             personal paragraph goes. No DB writes, the links
//                             in the preview do not work.
//   3. --note "<text>"        Inserts Thomas' 2-3 sentences at the top. Use it
//                             with --preview-to-me again to check the result.
//   4. --send                 Really sends to the creator (BCC to THOMAS_MAIL),
//                             needs --note, refuses when the mail was already
//                             sent, and sets campaigns.ended_notified_at only
//                             after a successful send.
//
// Without --preview-to-me and --send the script only reads the campaign and
// writes an HTML preview file. Nothing is sent and nothing is written to the DB.
//
// --send creates a fresh `manage` token (the stored ones are hashed, so the old
// link cannot be recovered) and sends through Brevo. Only use --send after
// Thomas approved the exact campaign, recipient and note.
//
// Run:
//   cd web && npx tsx scripts/send-campaign-ended-mail.ts --list
//   npx tsx scripts/send-campaign-ended-mail.ts --slug <slug> --preview-to-me
//   npx tsx scripts/send-campaign-ended-mail.ts --slug <slug> --note "..." --preview-to-me
//   npx tsx scripts/send-campaign-ended-mail.ts --slug <slug> --note "..." --send
//   npx tsx scripts/send-campaign-ended-mail.ts --slug <slug> --out preview/ended.html
//
// Flags:
//   --list            List campaigns that still wait for the closing mail
//   --slug <slug>     Campaign slug (required except for --list)
//   --out <file>      Preview HTML path (default: send-campaign-ended-preview.html)
//   --to <email>      Override the recipient of --send (also disables the BCC
//                     and the ended_notified_at update: a test send)
//   --name <name>     Override the greeting name (e.g. first name only)
//   --note "<text>"   Thomas' personal paragraph at the top of the mail
//   --preview-to-me   Send the preview to Thomas only (no DB writes)
//   --send            Really send to the creator (cannot be combined with
//                     --preview-to-me)
//
// Voraussetzungen: web/.env.local enthält NEXT_PUBLIC_SUPABASE_URL und
// SUPABASE_SERVICE_ROLE_KEY (für --send und --preview-to-me zusätzlich
// BREVO_API_KEY). --list und --send brauchen Migration 034 (und 029).

import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  buildCampaignCreatorStats,
  CREATOR_STATS_REVIEW_COLUMNS,
  type CampaignFeedbackRow,
} from "../src/lib/campaigns/creatorStatsView";
import {
  CREATOR_SURVEY_MIN_LETTERS_ENDED,
  creatorSurveyUrl,
} from "../src/lib/campaigns/creatorSurvey";
import {
  endedMailSendStat,
  isAwaitingEndedMail,
  resolveEndedMailSend,
  type EndedMailMode,
} from "../src/lib/campaigns/endedMail";
import { formatLetterCount } from "../src/lib/campaigns/milestones";
import { APP_URL, FOUNDER_EMAIL } from "../src/lib/config";
import { buildCampaignCreatorEmailHtml } from "../src/lib/email/buildCampaignCreatorEmailHtml";
import { campaignPublicUrl } from "../src/lib/share";

// Same value as MANAGE_TOKEN_TTL_SECONDS in src/lib/campaigns/tokens.ts.
const MANAGE_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 365 * 100;
const DEFAULT_OUT = "send-campaign-ended-preview.html";
const USAGE =
  'Usage: npx tsx scripts/send-campaign-ended-mail.ts --list | --slug <slug> [--out <file.html>] [--to <email>] [--name <name>] [--note "<text>"] [--preview-to-me | --send]';

type Args = {
  list: boolean;
  slug?: string;
  out: string;
  to?: string;
  name?: string;
  note?: string;
  previewToMe: boolean;
  send: boolean;
};

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
    if (index === -1) return undefined;
    const next = argv[index + 1];
    return next === undefined || next.startsWith("--") ? "" : next;
  };
  return {
    list: argv.includes("--list"),
    slug: value("slug"),
    out: value("out") || DEFAULT_OUT,
    to: value("to"),
    name: value("name"),
    note: value("note"),
    previewToMe: argv.includes("--preview-to-me"),
    send: argv.includes("--send"),
  };
}

function usageProblem(args: Args): string | null {
  if (args.previewToMe && args.send) return "--preview-to-me und --send gehen nicht zusammen.";
  if (!args.list && args.slug === undefined) return "--slug fehlt.";
  if (args.slug === "") return "--slug braucht einen Wert.";
  if (args.note === "") return "--note braucht einen Text in Anführungszeichen.";
  if (args.to === "") return "--to braucht eine E-Mail-Adresse.";
  return null;
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

function isMissingColumn(error: { code?: string; message: string }): boolean {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /ended_notified_at|created_by_founder/.test(error.message)
  );
}

async function runList(client: SupabaseClient, now: Date) {
  const { data, error } = await client
    .from("campaigns")
    .select(
      "id, slug, title, creator_name, letter_count, status, ends_at, ended_notified_at, created_by_founder",
    )
    .not("ends_at", "is", null)
    .lte("ends_at", now.toISOString())
    .is("ended_notified_at", null)
    .gte("letter_count", CREATOR_SURVEY_MIN_LETTERS_ENDED)
    .neq("status", "blocked")
    .order("ends_at", { ascending: true });

  if (error) {
    if (isMissingColumn(error)) {
      console.error("Migration 034 fehlt (campaigns.ended_notified_at / created_by_founder).");
    } else {
      console.error(`Liste fehlgeschlagen: ${error.message}`);
    }
    process.exit(1);
  }

  const rows = (
    (data ?? []) as Array<{
      slug: string;
      title: string;
      creator_name: string | null;
      letter_count: number | null;
      status: string;
      ends_at: string | null;
      ended_notified_at: string | null;
      created_by_founder: boolean | null;
    }>
  )
    .filter((row) =>
      isAwaitingEndedMail(
        {
          status: row.status,
          letterCount: row.letter_count ?? 0,
          endsAt: row.ends_at,
          endedNotifiedAt: row.ended_notified_at,
        },
        now,
      ),
    )
    .sort((a, b) => Date.parse(a.ends_at ?? "") - Date.parse(b.ends_at ?? ""));

  if (rows.length === 0) {
    console.log("Keine beendete Kampagne wartet auf die Abschluss-Mail.");
    return;
  }
  console.log(`${rows.length} Kampagne(n) warten auf die Abschluss-Mail:\n`);
  for (const row of rows) {
    console.log(`${row.slug}`);
    console.log(`  Titel:    ${row.title}`);
    console.log(`  Briefe:   ${row.letter_count ?? 0}`);
    console.log(`  Ende:     ${row.ends_at}`);
    console.log(`  Founder:  ${row.created_by_founder ? "ja" : "nein"}`);
    console.log(
      `  Weiter:   npx tsx scripts/send-campaign-ended-mail.ts --slug ${row.slug} --preview-to-me\n`,
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const problem = usageProblem(args);
  if (problem) {
    console.error(`${problem}\n${USAGE}`);
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
  const now = new Date();

  if (args.list) {
    await runList(client, now);
    return;
  }

  const { data, error } = await client
    .from("campaigns")
    .select("id, slug, title, creator_email, creator_name, letter_count, status, ends_at")
    .eq("slug", args.slug as string)
    .maybeSingle();
  if (error) throw new Error(`Campaign lookup failed: ${error.message}`);
  if (!data) throw new Error(`Campaign not found: ${args.slug}`);
  const campaign = data as CampaignRow;

  // Separate select: the preview must keep working before migration 034.
  let createdByFounder = false;
  let endedNotifiedAt: string | null | undefined;
  const { data: extra, error: extraError } = await client
    .from("campaigns")
    .select("created_by_founder, ended_notified_at")
    .eq("id", campaign.id)
    .maybeSingle();
  if (extraError || !extra) {
    console.warn(
      "WARNUNG: Migration 034 fehlt: ohne Founder-Satz, ohne Versandschutz (ended_notified_at).",
    );
  } else {
    const flags = extra as { created_by_founder: boolean | null; ended_notified_at: string | null };
    createdByFounder = flags.created_by_founder === true;
    endedNotifiedAt = flags.ended_notified_at;
  }

  const count = campaign.letter_count ?? 0;
  const creatorName = args.name ?? campaign.creator_name;
  const subject = `Danke für ${formatLetterCount(count)} Briefe zu „${campaign.title}“`;
  const mode: EndedMailMode = args.send ? "send" : args.previewToMe ? "preview_to_me" : "file";
  const note = args.note?.trim() ? args.note.trim() : null;

  // Stats line: same builder and thresholds as the manage page (mirrors loadReviewRows).
  let rows: CampaignFeedbackRow[] | null = null;
  const { data: reviewData, error: reviewError } = await client
    .from("reviews")
    .select(CREATOR_STATS_REVIEW_COLUMNS)
    .eq("campaign_slug", campaign.slug)
    .order("created_at", { ascending: false });
  if (reviewError) {
    console.warn(`WARNUNG: Rückmeldungen nicht lesbar, keine Abschickquote: ${reviewError.message}`);
  } else {
    rows = (reviewData ?? []) as unknown as CampaignFeedbackRow[];
  }
  const sendStat = endedMailSendStat(
    buildCampaignCreatorStats({ rows, signalRows: null, now, letterCount: count, ended: true }),
  );

  const { error: surveyError } = await client
    .from("campaign_creator_surveys")
    .select("id, quote_mode")
    .limit(0);
  const surveyAvailable = !surveyError;

  const decision = resolveEndedMailSend({
    mode,
    note,
    candidate: {
      status: campaign.status,
      letterCount: count,
      endsAt: campaign.ends_at,
      endedNotifiedAt,
    },
    surveyAvailable,
    recipientOverridden: Boolean(args.to),
    now,
  });
  if (!decision.ok) {
    console.error(decision.reason);
    process.exit(1);
  }

  const thomasMail = process.env.THOMAS_MAIL || FOUNDER_EMAIL;
  const recipient = mode === "preview_to_me" ? thomasMail : (args.to ?? campaign.creator_email);

  console.log(`Kampagne:   ${campaign.title} (${campaign.slug})`);
  console.log(`Status:     ${campaign.status}, ends_at ${campaign.ends_at ?? "nicht gesetzt"}`);
  console.log(
    `Empfänger:  ${recipient}${mode === "preview_to_me" ? " (nur Vorschau an dich)" : args.to ? " (überschrieben)" : ""}`,
  );
  console.log(`Anrede:     Moin ${creatorName ?? ""},`);
  console.log(`Betreff:    ${mode === "preview_to_me" ? "[Vorschau] " : ""}${subject}`);
  console.log(`letter_count: ${count}`);
  console.log(`Founder:    ${createdByFounder ? "ja" : "nein"}`);
  console.log(
    `Abschickquote: ${sendStat ? `${sendStat.percent} % von ${sendStat.responses}` : "nicht gezeigt (unter 10 Antworten oder nicht lesbar)"}`,
  );
  console.log(`Persönlicher Absatz: ${note ? "gesetzt" : "fehlt"}`);
  console.log(
    `Feedback-Formular: ${surveyAvailable ? "verfügbar" : "noch nicht verfügbar (029/034)"}`,
  );

  if (mode === "file") {
    const imageUrl = `${APP_URL}/kampagne/${encodeURIComponent(campaign.slug)}/meilenstein/${count}/bild`;
    const html = buildCampaignCreatorEmailHtml({
      kind: "ended",
      campaignTitle: campaign.title,
      slug: campaign.slug,
      campaignUrl: campaignPublicUrl(campaign.slug),
      actionUrl: `${APP_URL}/kampagne/verwalten?token=vorschau`,
      creatorName,
      ended: {
        count,
        imageUrl,
        downloadUrl: `${imageUrl}?download=1`,
        feedbackUrl: creatorSurveyUrl("vorschau"),
        note,
        preview: true,
        createdByFounder,
        sendStat,
      },
    });
    const outPath = resolve(args.out);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html, "utf8");
    console.log(`Vorschau:   ${outPath}`);
    console.log("Nichts gesendet. Mit --preview-to-me an dich, mit --send an die Ersteller:innen.");
    return;
  }

  // Brevo sender checks BREVO_API_KEY at import time, so load it after loadEnvLocal.
  const { sendCampaignCreatorEmail } = await import("../src/lib/email/sendCampaignCreatorEmail");

  if (mode === "preview_to_me") {
    const result = await sendCampaignCreatorEmail({
      kind: "ended",
      recipientEmail: thomasMail,
      campaignTitle: campaign.title,
      slug: campaign.slug,
      creatorName,
      token: "vorschau",
      ended: { count, note, createdByFounder, sendStat, preview: true },
      adminCopy: false,
    });
    if (!result.success) {
      throw new Error("Send failed, see error log above");
    }
    console.log(`Vorschau gesendet an ${thomasMail}: messageId ${result.messageId ?? "unbekannt"}`);
    console.log(
      "Die Links in der Vorschau funktionieren nicht (Platzhalter-Token). Nichts in der DB geändert.",
    );
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

  const result = await sendCampaignCreatorEmail({
    kind: "ended",
    recipientEmail: recipient,
    campaignTitle: campaign.title,
    slug: campaign.slug,
    creatorName,
    token,
    ended: { count, note, createdByFounder, sendStat },
    adminCopy: !args.to,
  });
  if (!result.success) {
    throw new Error("Send failed, see error log above");
  }
  console.log(`Gesendet:   messageId ${result.messageId ?? "unbekannt"}`);

  if (decision.markNotified) {
    const { error: markError } = await client
      .from("campaigns")
      .update({ ended_notified_at: new Date().toISOString() })
      .eq("id", campaign.id)
      .is("ended_notified_at", null);
    if (markError) {
      console.error(
        `\n!!! ACHTUNG: Die Mail ist raus, aber ended_notified_at konnte nicht gesetzt werden: ${markError.message}`,
      );
      console.error(
        `!!! Von Hand im SQL Editor setzen, sonst droht ein Doppelversand:\n    update public.campaigns set ended_notified_at = now() where id = '${campaign.id}' and ended_notified_at is null;`,
      );
      process.exit(1);
    }
    console.log("ended_notified_at gesetzt.");
  } else {
    console.log("Testversand mit --to: ended_notified_at bleibt unverändert.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
