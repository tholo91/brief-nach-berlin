"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FOUNDER_LINKEDIN } from "@/lib/config";

type Language = "de" | "en";

type Copy = {
  back: string;
  eyebrow: string;
  title: string;
  lead: string;
  imageAlt: string;
  impactSince: string;
  impactLabel: string;
  pinnedImageAlt: string;
  steps: Array<{ title: string; body: string }>;
  promptTitle: string;
  promptBody: string;
  copyLabel: string;
  copiedLabel: string;
  guideCta: string;
  repoCta: string;
  gsdCta: string;
  linkedinCta: string;
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
    title: "Brief-nach-Berlin für dein Land nutzen",
    lead:
      "Der Code ist offen. Wenn du eine lokale Version für Österreich, die Schweiz oder ein anderes Land bauen willst, starte nicht mit Übersetzen. Lass zuerst einen Plan schreiben: Daten, Zuständigkeiten, Sprache, Mail, Domain und politische Brief-Logik. Wenn du jemanden in Österreich oder der Schweiz kennst, der helfen könnte, schick mir gern den Kontakt oder leite diese Seite weiter.",
    imageAlt:
      "Handgeschriebene Briefe fliegen über Europa, vorbei an Städten, Flüssen, Bahnlinien und Bergen.",
    impactSince: "Seit Mitte Mai 2026",
    impactLabel: "Briefe erstellt",
    pinnedImageAlt:
      "Plakatillustration: Ein europäischer Postbote hält einen Brief nach vorn, darunter steht Europe needs your letters.",
    steps: [
      {
        title: "Repository forken",
        body:
          "Nimm den offenen Code als Ausgangspunkt. Du brauchst keine Erlaubnis.",
      },
      {
        title: "Prompt kopieren",
        body:
          "Lass dein LLM zuerst `ADAPT_TO_YOUR_COUNTRY.md` lesen und einen lokalen Plan schreiben.",
      },
      {
        title: "Mit Menschen vor Ort prüfen",
        body:
          "Prüfe Abgeordnete, Sprache, Design und politische Anreize mit Menschen vor Ort.",
      },
    ],
    promptTitle: "Mit diesem Prompt starten",
    promptBody:
      "Kopiere diesen Prompt in Codex, Claude, Cursor oder dein GSD-Setup. Er startet mit Planung, nicht mit Code.",
    copyLabel: "Kopieren",
    copiedLabel: "Kopiert",
    guideCta: "Adaptions-Guide lesen",
    repoCta: "GitHub-Repo öffnen",
    gsdCta: "GSD-Framework",
    linkedinCta: "Thomas auf LinkedIn",
    contactTitle: "Baust du eine echte lokale Version?",
    contactBody:
      "Schreib mir kurz, für welches Land du baust und welche Datenquelle du nutzen würdest. Für Österreich und die Schweiz hilft auch ein guter Kontakt vor Ort. Ich freue mich über direkte Vorstellungen.",
    contactCta: "Thomas mailen",
  },
  en: {
    back: "Back",
    eyebrow: "Open source for local democracies",
    title: "Fork Brief-nach-Berlin for your country",
    lead:
      "Brief-nach-Berlin is a German civic tech tool. People enter a postal code and a concern, then get a draft letter to the right political representative. The code is open. If you want to build this for another country, start with data, institutions, language and local testing, not with a straight translation.",
    imageAlt:
      "Handwritten letters fly across Europe, passing cities, rivers, railway lines, and mountains.",
    impactSince: "Since mid-May 2026",
    impactLabel: "letters created",
    pinnedImageAlt:
      "Poster illustration: a European postman holds out a letter, with the words Europe needs your letters below.",
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
    copyLabel: "Copy",
    copiedLabel: "Copied",
    guideCta: "Read the adaptation guide",
    repoCta: "Open GitHub repo",
    gsdCta: "GSD framework",
    linkedinCta: "Thomas on LinkedIn",
    contactTitle: "Building a real local version?",
    contactBody:
      "Send me the country, the main language, and the data source you would start from. If you know someone local who should see this, introduce us.",
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

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

function DocumentIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

function BlocksIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <path d="M6.5 10v4" />
      <path d="M10 17.5h4" />
      <path d="M17.5 10v4" />
    </svg>
  );
}

function PinnedEuropePoster({ alt }: { alt: string }) {
  return (
    <figure className="relative mt-10 w-[min(17rem,82vw)] rotate-[-3deg] md:absolute md:left-[calc(100%+1.5rem)] md:top-0 md:mt-0 md:w-44 lg:left-[calc(100%+2.5rem)] lg:w-60 xl:w-72">
      <div className="relative rounded-[2px] bg-[#f8edc8] p-1 shadow-[0_20px_38px_-24px_rgba(27,67,50,0.72)]">
        <Image
          src="/images/europe-pinned-note.webp"
          alt={alt}
          width={760}
          height={760}
          sizes="(min-width: 1024px) 18rem, (min-width: 768px) 18rem, 82vw"
          className="h-auto w-full rounded-[1px] border border-waldgruen/15"
        />
        <Image
          src="/images/ghibli-pin.png"
          alt=""
          width={64}
          height={74}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-12 w-auto -translate-x-1/2 -translate-y-1/2 rotate-[10deg] drop-shadow-[0_4px_4px_rgba(27,67,50,0.22)]"
        />
      </div>
    </figure>
  );
}

function PromptPreview({
  t,
}: {
  t: Pick<Copy, "copyLabel" | "copiedLabel">;
}) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(STARTER_PROMPT);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-waldgruen/20 bg-white shadow-sm">
      <div className="flex justify-end border-b border-waldgruen/10 px-4 py-3">
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
  letterCount,
}: {
  contactEmail: string;
  language: Language;
  letterCount: number;
}) {
  const t = copy[language];
  const formattedLetterCount = new Intl.NumberFormat(
    language === "de" ? "de-DE" : "en"
  ).format(letterCount);
  const subject =
    language === "de"
      ? "Brief-nach-Berlin in meinem Land nutzen"
      : "Using Brief-nach-Berlin in my country";
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
            aria-label={language === "de" ? "Sprache" : "Language"}
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

        <section>
          <header>
            <p className="mb-3 font-typewriter text-sm font-bold uppercase text-waldgruen/60">
              {t.eyebrow}
            </p>
            <h1 className="mb-5 font-body text-3xl font-bold tracking-tight text-waldgruen-dark text-balance md:text-5xl">
              {t.title}
            </h1>
            <p className="font-body text-lg leading-relaxed text-warmgrau/85 md:text-xl">
              {t.lead}
            </p>
          </header>
          <figure className="mt-8 -mx-2 md:mx-0">
            <Image
              src="/images/europe-correspondence.webp"
              alt={t.imageAlt}
              width={1376}
              height={768}
              sizes="(min-width: 768px) 48rem, 100vw"
              className="h-auto w-full rounded-lg shadow-sm"
              priority
            />
          </figure>
        </section>

        <section className="mt-8 grid gap-3 rounded-sm border border-waldgruen/20 bg-white/70 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <p className="font-typewriter text-4xl font-bold leading-none text-waldgruen-dark">
            {formattedLetterCount}
          </p>
          <div>
            <p className="font-typewriter text-xs font-bold uppercase text-waldgruen/55">
              {t.impactSince}
            </p>
            <p className="font-body text-base text-warmgrau">{t.impactLabel}</p>
          </div>
        </section>

        <section className="mt-10 border-y border-waldgruen/15 py-7">
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
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-waldgruen-dark px-5 py-3 text-center font-body font-bold text-creme transition-colors hover:bg-waldgruen"
          >
            <DocumentIcon className="h-4 w-4" />
            {t.guideCta}
          </a>
          <a
            href={repoHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-waldgruen/25 bg-white px-5 py-3 text-center font-body font-bold text-waldgruen-dark transition-colors hover:border-waldgruen hover:bg-creme"
          >
            <GitHubIcon className="h-4 w-4" />
            {t.repoCta}
          </a>
          <a
            href={gsdHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-waldgruen/25 px-5 py-3 text-center font-body font-bold text-waldgruen-dark transition-colors hover:border-waldgruen hover:bg-white"
          >
            <BlocksIcon className="h-4 w-4" />
            {t.gsdCta}
          </a>
        </section>

        <div className="relative">
          <PinnedEuropePoster alt={t.pinnedImageAlt} />
        </div>

        <section className="mt-14 rounded-sm border border-waldgruen/20 bg-white/70 p-6">
          <h2 className="mb-3 font-body text-xl font-bold text-waldgruen-dark">
            {t.contactTitle}
          </h2>
          <p className="mb-5 font-body text-base leading-relaxed text-warmgrau">
            {t.contactBody}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={mailHref}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-waldgruen-dark px-5 py-3 text-center font-body font-bold text-creme transition-colors hover:bg-waldgruen"
            >
              <MailIcon className="h-4 w-4" />
              {t.contactCta}
            </a>
            <a
              href={FOUNDER_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-waldgruen/25 px-5 py-3 text-center font-body font-bold text-waldgruen-dark transition-colors hover:border-waldgruen hover:bg-creme"
            >
              <LinkedInIcon className="h-4 w-4" />
              {t.linkedinCta}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
