"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Language = "de" | "en";

type Copy = {
  back: string;
  eyebrow: string;
  title: string;
  lead: string;
  aiReady: string;
  imageAlt: string;
  stepsTitle: string;
  steps: Array<{ title: string; body: string }>;
  promptTitle: string;
  promptBody: string;
  promptKicker: string;
  copyLabel: string;
  copiedLabel: string;
  guideCta: string;
  repoCta: string;
  gsdCta: string;
  contactTitle: string;
  contactBody: string;
  contactCta: string;
};

const STARTER_PROMPT = `You are working in a fork of https://github.com/tholo91/brief-nach-berlin.

First read:
- README.md
- ADAPT_TO_YOUR_COUNTRY.md
- web/src/lib/generation/generateLetter.ts
- web/src/lib/lookup/plzLookup.ts
- web/src/lib/config.ts
- web/src/lib/contact.ts

Goal:
Create LOCAL_ADAPTATION_PLAN.md for adapting this project to [COUNTRY/REGION].

Use the GSD framework if available:
https://github.com/gsd-build/get-shit-done

If GSD is not available, create the same structure manually.

The plan must include:
- MUST / SHOULD / OPTIONAL tasks
- local data requirements
- representative lookup strategy
- AI provider setup
- output language and official-language decisions
- email setup
- domain setup
- design localization
- political letter prompt changes
- local validation test cases

Do not start coding yet.`;

const copy: Record<Language, Copy> = {
  de: {
    back: "Zurück",
    eyebrow: "Open Source für lokale Demokratien",
    title: "Fork Brief nach Berlin for your country",
    lead:
      "Der Code ist offen. Wenn du eine lokale Version bauen willst, starte nicht mit Übersetzen. Lass zuerst ein LLM im Fork einen Plan schreiben: Daten, Zuständigkeiten, Sprache, Design, Mail, Domain und politische Brief-Logik.",
    aiReady:
      "Für AI-Forks vorbereitet: englische Agent-Anleitung, Datei-Map und ein erster Planungs-Prompt.",
    imageAlt:
      "Handgeschriebene Briefe fliegen über Europa, vorbei an Städten, Flüssen, Bahnlinien und Bergen.",
    stepsTitle: "Der kurze Weg",
    steps: [
      {
        title: "Fork the repo",
        body:
          "Nimm den offenen Code als Ausgangspunkt. Du brauchst keine Erlaubnis.",
      },
      {
        title: "Copy the prompt",
        body:
          "Lass dein LLM zuerst `ADAPT_TO_YOUR_COUNTRY.md` lesen und einen lokalen Plan schreiben.",
      },
      {
        title: "Localize with people",
        body:
          "Prüfe Abgeordnete, Sprache, Design und politische Anreize mit Menschen vor Ort.",
      },
    ],
    promptTitle: "Start with this prompt",
    promptBody:
      "Kopiere diesen Prompt in Codex, Claude, Cursor oder dein GSD-Setup. Er startet mit Planung, nicht mit Code.",
    promptKicker: "Prepared for AI-assisted forks",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    guideCta: "Read the adaptation guide",
    repoCta: "Open GitHub repo",
    gsdCta: "GSD framework",
    contactTitle: "Building a real local version?",
    contactBody:
      "Schreib mir kurz mit Land, politischer Ebene, Datenquelle und ob du bauen oder lokal testen kannst. Ich kann Kontext geben, aber nicht jedes Land selbst lokalisieren.",
    contactCta: "Email Thomas",
  },
  en: {
    back: "Back",
    eyebrow: "Open source for local democracies",
    title: "Fork Brief nach Berlin for your country",
    lead:
      "The code is open. If you want to build a local version, do not start by translating the German site. First let an LLM inside your fork create a plan for data, responsibilities, language, design, email, domain, and political letter logic.",
    aiReady:
      "Prepared for AI-assisted forks: English agent guide, file map, and a first planning prompt.",
    imageAlt:
      "Handwritten letters fly across Europe, passing cities, rivers, railway lines, and mountains.",
    stepsTitle: "The short path",
    steps: [
      {
        title: "Fork the repo",
        body:
          "Use the open code as a starting point. You do not need permission.",
      },
      {
        title: "Copy the prompt",
        body:
          "Ask your LLM to read `ADAPT_TO_YOUR_COUNTRY.md` and write a local plan first.",
      },
      {
        title: "Localize with people",
        body:
          "Validate representatives, language, design, and political incentives with people on the ground.",
      },
    ],
    promptTitle: "Start with this prompt",
    promptBody:
      "Paste this into Codex, Claude, Cursor, or your GSD setup. It starts with planning, not code.",
    promptKicker: "Prepared for AI-assisted forks",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    guideCta: "Read the adaptation guide",
    repoCta: "Open GitHub repo",
    gsdCta: "GSD framework",
    contactTitle: "Building a real local version?",
    contactBody:
      "Send a short email with country, political level, data source, and whether you can build or test locally. I can share context, but I cannot localize every country myself.",
    contactCta: "Email Thomas",
  },
};

function CopyIcon({ copied }: { copied: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {copied ? (
        <path
          d="M5 12.5l4.2 4.2L19 7"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <rect
            x="8"
            y="8"
            width="10"
            height="10"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M6 15H5.5A1.5 1.5 0 014 13.5v-8A1.5 1.5 0 015.5 4h8A1.5 1.5 0 0115 5.5V6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

function PromptPreview({
  t,
}: {
  t: Pick<Copy, "promptKicker" | "copyLabel" | "copiedLabel">;
}) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(STARTER_PROMPT);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-waldgruen/20 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-waldgruen/10 px-4 py-3">
        <p className="font-typewriter text-xs font-bold uppercase text-waldgruen/65">
          {t.promptKicker}
        </p>
        <button
          type="button"
          onClick={copyPrompt}
          className={`inline-flex items-center gap-2 rounded-sm px-3 py-2 font-body text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-waldgruen/40 focus:ring-offset-2 active:scale-95 ${
            copied
              ? "scale-105 bg-waldgruen text-creme"
              : "bg-waldgruen-dark text-creme hover:bg-waldgruen"
          }`}
          aria-live="polite"
        >
          <CopyIcon copied={copied} />
          {copied ? t.copiedLabel : t.copyLabel}
        </button>
      </div>
      <div className="relative">
        <pre className="max-h-24 overflow-hidden whitespace-pre-wrap break-words p-4 pr-10 font-typewriter text-xs leading-relaxed text-warmgrau sm:text-sm">
          {STARTER_PROMPT}
        </pre>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-white/0" />
        <span className="pointer-events-none absolute bottom-3 right-4 font-typewriter text-lg font-bold text-waldgruen/60">
          ...
        </span>
      </div>
    </div>
  );
}

export function EuropePageContent({
  contactEmail,
  language,
}: {
  contactEmail: string;
  language: Language;
}) {
  const t = copy[language];
  const subject =
    language === "de"
      ? "Brief nach Berlin in meinem Land nutzen"
      : "Using Brief nach Berlin in my country";
  const mailHref = `mailto:${contactEmail}?subject=${encodeURIComponent(
    subject
  )}`;
  const repoHref = "https://github.com/tholo91/brief-nach-berlin";
  const adaptationGuideHref = `${repoHref}/blob/main/ADAPT_TO_YOUR_COUNTRY.md`;
  const gsdHref = "https://github.com/gsd-build/get-shit-done";

  return (
    <div className="min-h-screen bg-creme px-6 py-16 md:py-20">
      <main className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-typewriter text-sm text-waldgruen transition-colors hover:text-waldgruen-dark"
          >
            &larr; {t.back}
          </Link>
          <div
            className="flex rounded-full border border-waldgruen/20 bg-white/70 p-1"
            aria-label="Language"
          >
            {(["de", "en"] as const).map((item) => (
              <Link
                key={item}
                href={`/europe?lang=${item}`}
                className={`rounded-full px-3 py-1.5 font-typewriter text-xs font-bold uppercase transition-colors ${
                  language === item
                    ? "bg-waldgruen text-creme"
                    : "text-waldgruen hover:bg-waldgruen/10"
                }`}
                aria-current={language === item ? "page" : undefined}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <p className="mb-3 font-typewriter text-sm font-bold uppercase text-waldgruen/60">
              {t.eyebrow}
            </p>
            <h1 className="mb-5 font-body text-3xl font-bold tracking-tight text-waldgruen-dark text-balance md:text-5xl">
              {t.title}
            </h1>
            <p className="font-body text-lg leading-relaxed text-warmgrau/85 md:text-xl">
              {t.lead}
            </p>
          </div>
          <figure className="-mx-2 md:mx-0">
            <Image
              src="/images/europe-correspondence.webp"
              alt={t.imageAlt}
              width={1376}
              height={768}
              sizes="(min-width: 768px) 18rem, 100vw"
              className="h-auto w-full rounded-lg shadow-sm"
              priority
            />
          </figure>
        </section>

        <p className="mt-8 border-l-4 border-waldgruen py-2 pl-5 font-body text-base leading-relaxed text-waldgruen-dark">
          {t.aiReady}
        </p>

        <section className="mt-10 border-y border-waldgruen/15 py-7">
          <h2 className="mb-5 font-body text-2xl font-bold text-waldgruen-dark">
            {t.stepsTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {t.steps.map((step, index) => (
              <article key={step.title}>
                <p className="mb-2 font-typewriter text-sm font-bold text-waldgruen/55">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mb-2 font-body text-lg font-bold text-waldgruen-dark">
                  {step.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-warmgrau">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="mb-2 font-body text-2xl font-bold text-waldgruen-dark">
              {t.promptTitle}
            </h2>
            <p className="font-body text-base leading-relaxed text-warmgrau">
              {t.promptBody}
            </p>
          </div>
          <PromptPreview t={t} />
        </section>

        <section className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={adaptationGuideHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-sm bg-waldgruen-dark px-5 py-3 text-center font-body font-bold text-creme transition-colors hover:bg-waldgruen"
          >
            {t.guideCta}
          </a>
          <a
            href={repoHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-sm border border-waldgruen/25 bg-white px-5 py-3 text-center font-body font-bold text-waldgruen-dark transition-colors hover:border-waldgruen hover:bg-creme"
          >
            {t.repoCta}
          </a>
          <a
            href={gsdHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-sm border border-waldgruen/25 px-5 py-3 text-center font-body font-bold text-waldgruen-dark transition-colors hover:border-waldgruen hover:bg-white"
          >
            {t.gsdCta}
          </a>
        </section>

        <section className="mt-14 rounded-sm border border-waldgruen/20 bg-white/70 p-6">
          <h2 className="mb-3 font-body text-xl font-bold text-waldgruen-dark">
            {t.contactTitle}
          </h2>
          <p className="mb-5 font-body text-base leading-relaxed text-warmgrau">
            {t.contactBody}
          </p>
          <a
            href={mailHref}
            className="inline-block rounded-sm bg-waldgruen-dark px-5 py-3 text-center font-body font-bold text-creme transition-colors hover:bg-waldgruen"
          >
            {t.contactCta}
          </a>
        </section>
      </main>
    </div>
  );
}
