"use client";

// Leichter Console-Ringpuffer für das "Fehler melden"-Frühwarnsystem.
//
// Patcht einmalig console.error/warn/log und hält die letzten N Einträge im
// Speicher (pro Browser-Tab). Beim Klick auf "Fehler melden" hängt
// Step3Success.tsx getClientLogs() an die Report-Mail an Thomas, damit
// clientseitige Fehler (Netzwerk, Render, unsere eigenen Logs) sichtbar werden.
// Serverseitige Mistral-Fehler kommen separat über das detail-Feld der API.
//
// Bewusst ohne Dependency und ohne Persistenz: keine DSGVO-Speicherung, der
// Puffer lebt nur im RAM und verschwindet beim Schließen des Tabs.

export interface ClientLogEntry {
  level: "log" | "warn" | "error";
  ts: string;
  msg: string;
}

const MAX_ENTRIES = 40;
const MAX_MSG_LENGTH = 1000;

const buffer: ClientLogEntry[] = [];
let installed = false;

function serializeArg(arg: unknown): string {
  if (typeof arg === "string") return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function record(level: ClientLogEntry["level"], args: unknown[]): void {
  const msg = args.map(serializeArg).join(" ").slice(0, MAX_MSG_LENGTH);
  buffer.push({ level, ts: new Date().toISOString(), msg });
  if (buffer.length > MAX_ENTRIES) buffer.shift();
}

export function installClientLogBuffer(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  (["log", "warn", "error"] as const).forEach((level) => {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      record(level, args);
      original(...args);
    };
  });
}

export function getClientLogs(): ClientLogEntry[] {
  return buffer.slice();
}
