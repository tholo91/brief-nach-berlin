import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { verifyRueckmeldungToken } from "../lib/rueckmeldung/token";
import { verifyDataDeletionToken } from "../lib/dataDeletion/token";

const webDir = resolve(__dirname, "../..");
const scriptPath = resolve(webDir, "scripts/send-lastcall-followup.ts");
const secret = "lastcall-sender-test-secret";
let tempDir: string;
let csvPath: string;
let capturePath: string;
let preloadPath: string;
let journalPath: string;
let previewDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "lastcall-sender-test-"));
  csvPath = join(tempDir, "recipients.csv");
  capturePath = join(tempDir, "requests.jsonl");
  preloadPath = join(tempDir, "fetch-preload.mjs");
  journalPath = join(tempDir, ".lastcall-send-journal.json");
  previewDir = join(tempDir, "preview");
  writeFileSync(preloadPath, `
    import { appendFileSync } from 'node:fs';
    globalThis.fetch = async (_url, options) => {
      appendFileSync(process.env.CAPTURE_PATH, JSON.stringify(JSON.parse(options.body)) + '\\n');
      if (process.env.FETCH_MODE === 'network-error') throw new Error('private network detail');
      if (process.env.FETCH_MODE === 'http-error') return new Response('private response body', { status: 503 });
      return new Response(JSON.stringify({ messageId: 'fake-message-id' }), { status: 201 });
    };
  `);
});
afterEach(() => rmSync(tempDir, { recursive: true, force: true }));

function run(args: string[], options: { input?: string; fetchMode?: string; noCsv?: boolean; noBrevo?: boolean } = {}) {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "test",
    LASTCALL_JOURNAL_PATH: journalPath,
    LASTCALL_PREVIEW_DIR: previewDir,
    CAPTURE_PATH: capturePath,
    FEEDBACK_TOKEN_SECRET: secret,
    BREVO_API_KEY: options.noBrevo ? "" : "fake-api-key",
    BREVO_SENDER_EMAIL: "brief@example.test",
    FETCH_MODE: options.fetchMode ?? "success",
  };
  return spawnSync(process.execPath, ["--import", "tsx", "--import", preloadPath, scriptPath, ...(options.noCsv ? [] : [csvPath]), ...args], {
    cwd: webDir,
    encoding: "utf8",
    input: options.input ?? "",
    env,
  });
}

function requests(): Array<Record<string, unknown>> {
  if (!require("node:fs").existsSync(capturePath)) return [];
  return readFileSync(capturePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

it("dry-run only targets the founder and all answer buttons carry that recipient's valid token", () => {
  process.env.FEEDBACK_TOKEN_SECRET = secret;
  writeFileSync(csvPath, "victim@example.org\n");
  const result = run(["--dry-run"], { input: "ja\n" });
  expect(result.status).toBe(0);
  const [payload] = requests();
  expect(payload.to).toEqual([{ email: "Brief-nach-Berlin@posteo.de" }]);
  expect(payload.tags).toEqual(["followup-3m-test"]);
  const html = String(payload.htmlContent);
  const answerHrefs = [...html.matchAll(/href="([^"]*\/rueckmeldung\?[^"]*)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
  expect(answerHrefs).toHaveLength(3);
  for (const href of answerHrefs) {
    const url = new URL(href);
    const token = url.searchParams.get("t");
    expect(token).toBeTruthy();
    expect(verifyRueckmeldungToken(token!)).toEqual({ email: "brief-nach-berlin@posteo.de", cohort: "lastcall_2026_10" });
  }
});

it("refuses real sends without --confirm before opening the network", () => {
  writeFileSync(csvPath, "person@example.org\n");
  const result = run([], { input: "SENDEN\n" });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("--confirm");
  expect(requests()).toHaveLength(0);
});

it("checks token signing locally without printing the token or calling Brevo", () => {
  const result = run(["--check-token"]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("Token-Signatur und Cohort ok");
  expect(result.stdout).not.toContain(secret);
  expect(requests()).toHaveLength(0);
});

it("writes a private local preview without CSV, Brevo credentials, or network calls", () => {
  process.env.FEEDBACK_TOKEN_SECRET = secret;
  const result = run(["--preview"], { noCsv: true, noBrevo: true });
  expect(result.status).toBe(0);
  const htmlPath = join(previewDir, ".lastcall-preview.html");
  const textPath = join(previewDir, ".lastcall-preview.txt");
  expect(result.stdout.trim().split("\n")).toEqual([htmlPath, textPath]);
  const html = readFileSync(htmlPath, "utf8");
  const answerHrefs = [...html.matchAll(/href="([^"]*\/rueckmeldung\?[^"]*)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
  expect(answerHrefs).toHaveLength(3);
  for (const href of answerHrefs) {
    const token = new URL(href).searchParams.get("t");
    expect(verifyRueckmeldungToken(token!)).toEqual({ email: "brief-nach-berlin@posteo.de", cohort: "lastcall_2026_10" });
  }
  const deleteHref = html.match(/href="([^"]*\/datenloeschen\?t=[^"]+)"/)?.[1];
  expect(deleteHref).toBeTruthy();
  const deletionToken = new URL(deleteHref!).searchParams.get("t");
  expect(verifyDataDeletionToken(deletionToken!)?.email).toBe("brief-nach-berlin@posteo.de");
  expect(statSync(htmlPath).mode & 0o777).toBe(0o600);
  expect(statSync(textPath).mode & 0o777).toBe(0o600);
  expect(requests()).toHaveLength(0);
});

it("skips journaled recipients and sends only the remaining address", () => {
  writeFileSync(csvPath, "email\nperson-one@example.org\nperson-two@example.org\n");
  writeFileSync(journalPath, JSON.stringify({ campaign: "lastcall_2026_10", sentEmails: ["person-one@example.org"], pendingEmail: null }));
  const result = run(["--confirm"], { input: "SENDEN\n" });
  expect(result.status).toBe(0);
  expect(requests()).toHaveLength(1);
  expect(requests()[0].to).toEqual([{ email: "person-two@example.org" }]);
  expect(JSON.parse(readFileSync(journalPath, "utf8")).sentEmails).toContain("person-two@example.org");
});

it("stops on the first ambiguous network failure and blocks an automatic retry", () => {
  writeFileSync(csvPath, "first@example.org\nsecond@example.org\n");
  const failed = run(["--confirm"], { input: "SENDEN\n", fetchMode: "network-error" });
  expect(failed.status).toBe(1);
  expect(requests()).toHaveLength(1);
  expect(failed.stderr).toContain("Netzwerkfehler");
  expect(failed.stderr).not.toContain("private network detail");
  expect(failed.stdout).toContain("noch nicht versucht: 1");
  expect(JSON.parse(readFileSync(journalPath, "utf8")).pendingEmail).toBe("first@example.org");

  const retry = run(["--confirm"], { input: "SENDEN\n" });
  expect(retry.status).toBe(1);
  expect(retry.stderr).toContain("unklaren Versand");
  expect(requests()).toHaveLength(1);
});

it("blocks malformed journals, concurrent locks, and unwritable journal preflight", () => {
  writeFileSync(csvPath, "person@example.org\n");
  writeFileSync(journalPath, "{broken");
  expect(run(["--confirm"], { input: "SENDEN\n" }).status).toBe(1);
  expect(requests()).toHaveLength(0);

  rmSync(journalPath);
  writeFileSync(`${journalPath}.lock`, "running\n");
  expect(run(["--confirm"], { input: "SENDEN\n" }).stderr).toContain("gesperrt");
  expect(requests()).toHaveLength(0);

  rmSync(`${journalPath}.lock`);
  writeFileSync(`${journalPath}.preflight`, "stale probe\n");
  expect(run(["--confirm"], { input: "SENDEN\n" }).stderr).toContain("nicht beschreibbar");
  expect(requests()).toHaveLength(0);
});
