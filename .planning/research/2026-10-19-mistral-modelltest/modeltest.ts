/**
 * Modellvergleich Brief-Generierung (Wegwerf, Scratchpad).
 * Run (aus web/): node_modules/.bin/tsx <pfad>/modeltest.ts <out.json>
 * Patcht MISTRAL_MODELS.letter zur Laufzeit, ändert keine Repo-Datei.
 */
import * as fs from "node:fs";

const WEB = "/Users/thomas/Documents/Git Repos/brief-nach-berlin/web";
const outPath = process.argv[2];

for (const line of fs.readFileSync(`${WEB}/.env.local`, "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq < 1) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (process.env[k] === undefined) process.env[k] = v;
}

type Politician = import("/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/lib/types/politician").Politician;

const FAKE_MDB: Politician = {
  id: 999001, politicianId: 999001, firstName: "Maria", lastName: "Beispiel", title: null,
  party: "SPD", wahlkreisId: 54, wahlkreisName: "Bremen I", level: "Bund",
  postalAddress: "Platz der Republik 1, 11011 Berlin", isDirect: true,
  abgeordnetenwatchUrl: null, committees: [],
};

const INPUTS = [
  { id: "1-heizungsgesetz", text: "Ich finde das neue Heizungsgesetz schlecht. Ich habe E-Auto und Wärmepumpe." },
  { id: "2-oepnv", text: "Das ÖPNV-Angebot in meinem Wahlkreis ist katastrophal. Letzte Woche habe ich 90 Minuten auf den Bus gewartet, am Ende kam keiner. Ich kann mir kein Auto leisten und brauche den Bus, um zur Arbeit zu kommen." },
  { id: "3-bildung", text: "Wir brauchen mehr Investitionen in Bildung. Lehrer sind überlastet, Klassen sind zu groß, Ausstattung ist marode." },
  { id: "4-krankenpfleger", text: "Ich bin Krankenpfleger und arbeite seit 8 Jahren auf der Intensivstation. Ich verdiene weniger als ein Berufseinsteiger in der freien Wirtschaft. Personalnotstand. Bürokratie. Wenn das so weitergeht, kündige ich." },
  { id: "5-bundeshaushalt", text: "Bitte stoppt den Bundeshaushalt-Entwurf." },
];

const FORBIDDEN = /ressortübergreifend|ganzheitlich|Brücken (bauen|schlagen)|neuralgisch|Standortsicherung|Daseinsvorsorge|Symbol|im Rahmen|vor diesem Hintergrund|in diesem Zusammenhang|im Lichte|gleichermaßen|herauskristallisier|hervorheb|unterstreich|untermauer|beleucht|navigier/i;

function paragraphs(letter: string): number {
  const parts = letter.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return parts.filter((p) => !/^\d{2}\.\d{2}\.\d{4}$/.test(p) && !/^Sehr geehrte/.test(p) && !/^Mit freundlichen Grüßen/.test(p)).length;
}

function flags(letter: string, expectSalutation: string | null) {
  const f: string[] = [];
  if (/[–—]/.test(letter)) f.push("gedankenstrich");
  if (/nicht (nur|allein|bloß)[^.]{0,80}sondern/i.test(letter)) f.push("nicht-nur-sondern");
  if (/sowohl[^.]{0,80}als auch|einerseits|zum einen/i.test(letter)) f.push("sowohl-als-auch");
  if (/\b(Erstens|Zweitens|Drittens)\b/i.test(letter)) f.push("erstens");
  const fw = letter.match(FORBIDDEN);
  if (fw) f.push(`verbotswort:${fw[0]}`);
  if (/\w[*:]\w|[a-zäöü]Innen\b|\/in\b/.test(letter)) f.push("genderzeichen");
  if (/freue mich auf|bitte um (eine )?(Antwort|Rückmeldung)|Ihre (Antwort|Rückmeldung)|Gespräch|Treffen/i.test(letter)) f.push("antwortbitte");
  if (/\[Ihr Name\]/.test(letter)) f.push("platzhalter-name");
  if (!/^\s*\d{2}\.\d{2}\.\d{4}/.test(letter)) f.push("kein-datum-oben");
  if (!/Mit freundlichen Grüßen/.test(letter)) f.push("kein-gruss");
  if (expectSalutation && !letter.includes(expectSalutation)) f.push("anrede-abweichend");
  const p = paragraphs(letter);
  if (p < 3 || p > 4) f.push(`absaetze:${p}`);
  return f;
}

async function main() {
  const mistralMod = await import(`${WEB}/src/lib/mistral`);
  // Large 4 denkt standardmäßig (content = Array mit thinking-Block). reasoningEffort "none" liefert
  // wieder einen String. Das ist die minimale Integrationsänderung, hier nur zur Laufzeit gepatcht.
  const chat = mistralMod.mistral.chat as { complete: (req: Record<string, unknown>, opts?: unknown) => Promise<unknown> };
  const origComplete = chat.complete.bind(chat);
  chat.complete = (req, opts) =>
    origComplete(req.model === "mistral-large-4" ? { ...req, reasoningEffort: "none" } : req, opts);
  const { generateLetter } = await import(`${WEB}/src/lib/generation/generateLetter`);
  const { getLandesregierungRecipient } = await import(`${WEB}/src/lib/lookup/landesregierungRecipient`);

  const cases: { id: string; text: string; level: "Bund" | "Land" }[] = INPUTS.map((i) => ({ ...i, level: "Bund" as const }));
  try {
    const { createRequire } = await import("node:module");
    const { createClient } = createRequire(`${WEB}/package.json`)("@supabase/supabase-js");
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data } = await sb.from("campaigns").select("issue_text").eq("slug", "prueft-die-afd").single();
    if (data?.issue_text) cases.push({ id: "6-kampagne-prueft-die-afd", text: data.issue_text as string, level: "Land" });
  } catch (e) {
    console.error("Kampagnentext nicht geladen:", e instanceof Error ? e.message : String(e));
  }

  type Row = {
    model: string; caseId: string; run: number; ok: boolean; error?: string; status?: number;
    letter?: string; wordCount?: number; inRange?: boolean; retried?: boolean; ms?: number; usedModel?: string; flags?: string[];
  };
  const rows: Row[] = [];
  const save = () => fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));

  async function one(model: string, c: (typeof cases)[number], run: number): Promise<Row> {
    (mistralMod.MISTRAL_MODELS as { letter: string }).letter = model;
    const base = c.level === "Land"
      ? { politicians: [], level: "Land" as const, landesregierung: getLandesregierungRecipient("BW", "institution")! }
      : { politicians: [FAKE_MDB] };
    const salutation = c.level === "Land" ? "Sehr geehrte Damen und Herren," : null;
    const t0 = Date.now();
    try {
      const r = await generateLetter({ ...base, issueText: c.text, letterLength: "1", toneLevel: 3 });
      return {
        model, caseId: c.id, run, ok: true, letter: r.letter, wordCount: r.wordCount, inRange: r.wordCountInRange,
        retried: r.retried, ms: Date.now() - t0, usedModel: r.model, flags: flags(r.letter, salutation),
      };
    } catch (err) {
      const cause = (err as { cause?: unknown }).cause as { statusCode?: number; message?: string } | undefined;
      const status = cause?.statusCode ?? (err as { statusCode?: number }).statusCode;
      return {
        model, caseId: c.id, run, ok: false, status, ms: Date.now() - t0,
        error: `${err instanceof Error ? err.name : "NonError"}: ${(cause?.message ?? (err instanceof Error ? err.message : "")).slice(0, 200)}`,
      };
    }
  }

  // Phase 1: andere Modelle (eigene Limit-Töpfe), nacheinander, ohne Pause.
  for (const model of ["mistral-large-4", "mistral-medium-latest"]) {
    for (const c of cases) {
      for (let run = 1; run <= 2; run++) {
        process.stdout.write(`${model} ${c.id} #${run} ... `);
        const row = await one(model, c, run);
        rows.push(row); save();
        console.log(row.ok ? `${row.wordCount} Wörter, ${row.ms} ms, flags=${row.flags!.join(",") || "-"}` : `FEHLER ${row.status ?? ""} ${row.error}`);
      }
    }
  }

  // Phase 2: Baseline mit dem Live-Modell, 30 s Pause, Abbruch bei 429.
  for (const c of cases) {
    if (rows.some((r) => r.model === "mistral-large-latest")) await new Promise((r) => setTimeout(r, 30_000));
    process.stdout.write(`mistral-large-latest ${c.id} #1 ... `);
    const row = await one("mistral-large-latest", c, 1);
    rows.push(row); save();
    console.log(row.ok ? `${row.wordCount} Wörter, ${row.ms} ms, flags=${row.flags!.join(",") || "-"}` : `FEHLER ${row.status ?? ""} ${row.error}`);
    if (!row.ok && row.status === 429) { console.log("429: Baseline abgebrochen."); break; }
  }
  console.log("fertig");
}

main().catch((e) => { console.error(e); process.exit(1); });
