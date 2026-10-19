import * as fs from "node:fs";
import { createRequire } from "node:module";

const WEB = "/Users/thomas/Documents/Git Repos/brief-nach-berlin/web";
for (const line of fs.readFileSync(`${WEB}/.env.local`, "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq < 1) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (process.env[k] === undefined) process.env[k] = v;
}

async function main() {
  const { Mistral } = createRequire(`${WEB}/package.json`)("@mistralai/mistralai");
  const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  const model = process.argv[2];
  const withSchema = process.argv[3] !== "plain";
  const effort = process.argv[4];
  const res = await client.chat.complete({
    model,
    messages: [
      { role: "system", content: "Antworte ausschließlich im JSON-Format: {\"letter\": \"<Text>\"}" },
      { role: "user", content: "Schreibe einen Satz über Busse in Bremen." },
    ],
    ...(withSchema
      ? { responseFormat: { type: "json_schema", jsonSchema: { name: "x", strict: true, schemaDefinition: { type: "object", additionalProperties: false, properties: { letter: { type: "string" } }, required: ["letter"] } } } }
      : {}),
    maxTokens: 400,
    ...(effort ? { reasoningEffort: effort } : {}),
  });
  const choice = res.choices?.[0];
  const content = choice?.message?.content;
  console.log(JSON.stringify({
    model, withSchema, effort,
    finishReason: choice?.finishReason,
    contentType: Array.isArray(content) ? "array" : typeof content,
    chunks: Array.isArray(content) ? content.map((c: { type?: string; text?: string; thinking?: unknown }) => ({ type: c.type, textStart: (c.text ?? "").slice(0, 80), hasThinking: Boolean(c.thinking) })) : undefined,
    contentStart: typeof content === "string" ? content.slice(0, 200) : undefined,
    usage: res.usage,
    messageKeys: Object.keys(choice?.message ?? {}),
  }, null, 2));
}
main().catch((e) => { console.error(e instanceof Error ? e.name + ": " + e.message.slice(0, 300) : e); process.exit(1); });
