/**
 * compare-mistral-report.ts
 *
 * Baut report.md, blind.html und key.json aus raw.json. Rein, ohne Netz.
 * blind.html enthaelt KEINE Modellnamen oder IDs (Zuordnung nur in key.json).
 */

import {
  LABELS,
  MODEL_KEYS,
  fmtUsd,
  type ModelKey,
  type PairResult,
  type RawFile,
} from "./compare-mistral-shared";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function avg(values: number[]): number | null {
  return values.length === 0 ? null : sum(values) / values.length;
}

function fmt(value: number | null, digits = 1): string {
  return value === null ? "-" : value.toFixed(digits);
}

function resultsFor(raw: RawFile, key: ModelKey): PairResult[] {
  return raw.results.filter((r) => r.modelKey === key);
}

export function buildKeyJson(raw: RawFile) {
  return {
    runId: raw.meta.runId,
    seed: raw.meta.seed,
    note: "Zuordnung Blind-Label zu Modell je Fall. Nicht in blind.html.",
    models: Object.fromEntries(
      MODEL_KEYS.map((k) => [
        k,
        { id: raw.meta.models[k].id, reasoningEffort: raw.meta.models[k].reasoningEffort },
      ]),
    ),
    labelOrder: raw.meta.labelOrder,
    modelRunOrder: raw.meta.modelOrder,
  };
}

export function buildReportMd(raw: RawFile): string {
  const { meta, results } = raw;
  const lines: string[] = [];
  lines.push(`# Mistral-Modellvergleich ${meta.runId}${meta.selftest ? " (SELFTEST, Fake-Antworten)" : ""}`);
  lines.push("");
  lines.push(`Erstellt: ${meta.createdAt}. Seed: ${meta.seed}. Drosselung: ${meta.throttleMs} ms zwischen HTTP-Aufrufen. Aufrufdeckel: ${meta.hardCallCap}.`);
  if (meta.aborted) lines.push(`\n**Lauf abgebrochen:** ${meta.aborted}`);
  lines.push("");
  lines.push("## Modelle");
  lines.push("");
  lines.push("| Key | Modell-ID | reasoningEffort | Preis Ein/Aus (USD pro 1 Mio. Tokens) | ID in Modellliste bestätigt |");
  lines.push("|---|---|---|---|---|");
  for (const k of MODEL_KEYS) {
    const m = meta.models[k];
    const price = m.price ? `${m.price.input} / ${m.price.output}` : "Preis offen";
    const check = meta.modelCheck ? (meta.modelCheck[k]?.found ? `ja (${meta.modelCheck[k].resolvedId})` : "nein") : "nicht geprüft";
    const effort = meta.effortUnsupported.includes(k)
      ? `${m.reasoningEffort ?? "-"} (nicht unterstützt, ohne Parameter wiederholt)`
      : (m.reasoningEffort ?? "nicht gesetzt");
    lines.push(`| ${k} | ${m.id} | ${effort} | ${price} | ${check} |`);
  }

  lines.push("");
  lines.push("## Je Modell (Summen und Mittel)");
  lines.push("");
  lines.push("| Modell | Briefe ok | Fehlschläge | Wortband-Treffer | Regelverstöße | Heuristik-Funde | Inhalts-Retries | HTTP 429 | Aufrufe | Ø Zeit/Fall (s) | Prompt-Tok | Completion-Tok | Kosten |");
  lines.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const k of MODEL_KEYS) {
    const rs = resultsFor(raw, k);
    if (rs.length === 0) continue;
    const ok = rs.filter((r) => r.metrics);
    const failed = rs.filter((r) => r.error || !r.metrics);
    const inBand = ok.filter((r) => r.metrics?.inBand).length;
    const viol = sum(ok.map((r) => r.metrics?.ruleViolations ?? 0));
    const heur = sum(ok.map((r) => r.metrics?.heuristicCount ?? 0));
    const retries = sum(rs.map((r) => r.contentRetry));
    const cost = rs.every((r) => r.costUsd === null) ? null : sum(rs.map((r) => r.costUsd ?? 0));
    lines.push(
      `| ${k} | ${ok.length} | ${failed.length} | ${inBand}/${ok.length} | ${viol} | ${heur} | ${retries} | ${sum(rs.map((r) => r.http429))} | ${sum(rs.map((r) => r.callCount))} | ${fmt((avg(rs.map((r) => r.ms)) ?? 0) / 1000)} | ${sum(rs.map((r) => r.promptTokens))} | ${sum(rs.map((r) => r.completionTokens))} | ${fmtUsd(cost)} |`,
    );
  }

  lines.push("");
  lines.push("### Heuristik-Funde nach Art (Anzahl Briefe)");
  lines.push("");
  lines.push("Nur Heuristik, kein Urteil: Gedankenstrich, \"nicht nur ... sondern\", Erstens/Zweitens/Drittens, Genderzeichen, fehlende Anrede, fehlende Grußformel.");
  lines.push("");
  lines.push("| Modell | Gedankenstriche | nicht nur/sondern | Erstens... | Gender | ohne Anrede | ohne Gruß |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const k of MODEL_KEYS) {
    const ok = resultsFor(raw, k).filter((r) => r.metrics);
    if (ok.length === 0) continue;
    const count = (pick: (r: PairResult) => boolean) => ok.filter(pick).length;
    lines.push(
      `| ${k} | ${count((r) => (r.metrics?.flags.dashes ?? 0) > 0)} | ${count((r) => Boolean(r.metrics?.flags.nichtNurSondern))} | ${count((r) => Boolean(r.metrics?.flags.erstens))} | ${count((r) => Boolean(r.metrics?.flags.gender))} | ${count((r) => Boolean(r.metrics?.flags.noSalutation))} | ${count((r) => Boolean(r.metrics?.flags.noClosing))} |`,
    );
  }

  lines.push("");
  lines.push("## Je Fall");
  lines.push("");
  lines.push("Zelle: Wörter (Band) / Wortband ja,nein / Regelverstöße / Heuristik / Aufrufe (429) / Netto-Zeit s. FEHLER = Fehlschlag.");
  lines.push("");
  lines.push(`| Fall | ${MODEL_KEYS.join(" | ")} |`);
  lines.push(`|---|${MODEL_KEYS.map(() => "---").join("|")}|`);
  for (const c of meta.cases) {
    const cells = MODEL_KEYS.map((k) => {
      const r = results.find((x) => x.caseId === c.id && x.modelKey === k);
      if (!r) return "nicht gelaufen";
      if (r.error || !r.metrics) {
        return `FEHLER ${r.error?.class ?? "?"} ${r.error?.status ?? ""} (${r.callCount} Aufrufe)`;
      }
      const m = r.metrics;
      return `${m.wordCount} (${m.bandMin}-${m.bandMax}) / ${m.inBand ? "ja" : "nein"} / ${m.ruleViolations} / ${m.heuristicCount} / ${r.callCount} (${r.http429}) / ${(r.ms / 1000).toFixed(1)}`;
    });
    lines.push(`| ${c.id} | ${cells.join(" | ")} |`);
  }

  const failures = results.filter((r) => r.error || !r.metrics);
  lines.push("");
  lines.push("## Fehlschläge");
  lines.push("");
  if (failures.length === 0) {
    lines.push("Keine.");
  } else {
    for (const r of failures) {
      lines.push(`- ${r.caseId} / ${r.modelKey}: ${r.error?.class ?? "kein Brief"} (Status ${r.error?.status ?? "-"}), ${r.error?.message ?? ""}`);
    }
  }

  lines.push("");
  lines.push("## Hinweise");
  lines.push("");
  lines.push("- Wortband strikt wie Prod-Band (LETTER_LENGTHS bzw. youthLetterWords). Prod akzeptiert beim Retry ±15 Prozent, das hier nicht.");
  lines.push("- Regelverstöße = `findRuleViolations` aus der Prod-Pipeline (erfundene Selbstbezeichnung mit Geschlecht). Heuristik-Funde sind nur Heuristik, kein Qualitätsurteil.");
  lines.push("- Retries getrennt: `Inhalts-Retries` = Aufrufe mit Status 200 minus 1 (Länge/Regel-Korrektur der Pipeline), `HTTP 429` = Ratenlimit-Wiederholungen.");
  lines.push("- Zeit = Summe der Netto-Zeiten der HTTP-Aufrufe, ohne Drosselungs- und Retry-Wartezeit.");
  if (MODEL_KEYS.some((k) => meta.models[k].price === null)) {
    lines.push("- **Preis offen** für Modelle ohne hinterlegten Preis: Kosten dort leer und nicht in Summen.");
  }
  lines.push("- Die Abrechnung der Denk-Tokens (Reasoning) ist unklar. Kosten = Prompt-Tokens x Eingabepreis + Completion-Tokens (laut `usage`) x Ausgabepreis, Denk-Tokens nur soweit `usage` sie mitzählt.");
  lines.push("- Die Blind-Auflösung (Label zu Modell) steht nur in `key.json`.");
  lines.push("");
  return lines.join("\n");
}

const BLIND_CSS = `
:root { color-scheme: light dark; --bg: #faf8f3; --fg: #1f2a24; --muted: #5d6b63; --card: #ffffff; --line: #d9d4c7; --accent: #2f6b4f; }
@media (prefers-color-scheme: dark) { :root { --bg: #151a17; --fg: #e8ece9; --muted: #98a59d; --card: #1e2521; --line: #34403a; --accent: #6bbf93; } }
* { box-sizing: border-box; }
body { margin: 0; padding: 16px; background: var(--bg); color: var(--fg); font: 16px/1.5 -apple-system, system-ui, "Segoe UI", sans-serif; }
main { max-width: 880px; margin: 0 auto; }
h1 { font-size: 1.4rem; margin: 0 0 4px; }
h2 { font-size: 1.15rem; margin: 32px 0 6px; }
.meta { color: var(--muted); font-size: 0.9rem; margin: 0 0 8px; }
.input { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 12px; margin: 8px 0 16px; white-space: pre-wrap; }
details { margin: 8px 0 16px; }
summary { cursor: pointer; color: var(--accent); }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 12px; margin: 0 0 16px; }
.card h3 { margin: 0 0 4px; font-size: 1.05rem; }
.letter { white-space: pre-wrap; margin: 8px 0 12px; font-family: Georgia, "Times New Roman", serif; }
.error { color: var(--muted); font-style: italic; }
.rate { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
.rate label { display: flex; flex-direction: column; font-size: 0.85rem; color: var(--muted); }
select, textarea { font: inherit; padding: 8px; border-radius: 6px; border: 1px solid var(--line); background: var(--bg); color: var(--fg); width: 100%; }
button { font: inherit; padding: 12px 16px; border-radius: 8px; border: 0; background: var(--accent); color: #fff; cursor: pointer; }
.bar { position: sticky; bottom: 0; background: var(--bg); padding: 12px 0; border-top: 1px solid var(--line); display: flex; gap: 12px; align-items: center; }
#status { color: var(--muted); font-size: 0.9rem; }
`;

const BLIND_JS = `
function val(card, name) { var el = card.querySelector('[name=' + name + ']'); return el ? el.value : ''; }
function collect() {
  var out = {};
  document.querySelectorAll('.card').forEach(function (card) {
    var c = card.getAttribute('data-case');
    var l = card.getAttribute('data-label');
    if (!out[c]) out[c] = {};
    out[c][l] = { ton: val(card, 'ton'), konkretheit: val(card, 'konkretheit'), deutsch: val(card, 'deutsch'), notiz: val(card, 'notiz') };
  });
  return out;
}
function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  var ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  return ok;
}
function copyRatings() {
  var text = JSON.stringify(collect(), null, 2);
  var status = document.getElementById('status');
  function done(ok) { status.textContent = ok ? 'Bewertungen kopiert.' : 'Kopieren nicht möglich, bitte Text unten manuell kopieren.'; if (!ok) { var box = document.getElementById('fallback'); box.hidden = false; box.value = text; } }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
  } else { done(fallbackCopy(text)); }
}
`;

function ratingSelect(name: string, label: string): string {
  const options = ['<option value="">-</option>', ...[1, 2, 3, 4, 5].map((n) => `<option value="${n}">${n}</option>`)].join("");
  return `<label>${label}<select name="${name}">${options}</select></label>`;
}

export function buildBlindHtml(raw: RawFile): string {
  const { meta, results } = raw;
  const sections: string[] = [];
  meta.cases.forEach((c, idx) => {
    const labelMap = meta.labelOrder[c.id] ?? {};
    const cards: string[] = [];
    for (const label of LABELS) {
      const key = labelMap[label];
      if (!key) continue;
      const r = results.find((x) => x.caseId === c.id && x.modelKey === key);
      if (!r) continue;
      const body =
        r.letter && r.metrics
          ? `<div class="letter">${escapeHtml(r.letter)}</div>`
          : `<div class="letter error">Kein Brief erzeugt (Fehlschlag).</div>`;
      const words = r.metrics ? r.metrics.wordCount : 0;
      cards.push(
        `<section class="card" data-case="${escapeHtml(c.id)}" data-label="${label}" data-words="${words}">
<h3>Brief ${label}</h3>
<p class="meta">${words} Wörter</p>
${body}
<div class="rate">${ratingSelect("ton", "Ton (1-5)")}${ratingSelect("konkretheit", "Konkretheit (1-5)")}${ratingSelect("deutsch", "Deutsch (1-5)")}</div>
<textarea name="notiz" rows="2" placeholder="Notiz (optional)"></textarea>
</section>`,
      );
    }
    const extras = (c.extra ?? [])
      .map(
        (e) => `<details><summary>${escapeHtml(e.title)}</summary><div class="input">${escapeHtml(e.text)}</div></details>`,
      )
      .join("\n");
    sections.push(
      `<h2>Fall ${idx + 1}: ${escapeHtml(c.label)}</h2>
<p class="meta">Empfänger: ${escapeHtml(c.recipientLabel)}. Ton ${c.toneLevel} von 5. Länge: ${escapeHtml(c.lengthKey)}.</p>
<div class="input">${escapeHtml(c.issueText)}</div>
${extras}
${cards.join("\n")}`,
    );
  });

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Briefvergleich (blind)</title>
<style>${BLIND_CSS}</style>
</head>
<body>
<main>
<h1>Briefvergleich (blind)</h1>
<p class="meta">Lauf ${escapeHtml(meta.runId)}. Je Fall vier Briefe zum gleichen Eingabetext, Reihenfolge zufällig. Bewerte Ton, Konkretheit und Deutsch von 1 (schwach) bis 5 (stark).</p>
${sections.join("\n")}
<div class="bar"><button type="button" onclick="copyRatings()">Bewertungen kopieren</button><span id="status"></span></div>
<textarea id="fallback" rows="8" hidden></textarea>
</main>
<script>${BLIND_JS}</script>
</body>
</html>
`;
}
