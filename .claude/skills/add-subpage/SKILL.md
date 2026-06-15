---
name: add-subpage
description: "Neue SEO/GEO-Unterseite für brief-nach-berlin.de erstellen. Handhabt Datei, JSON-LD-Schema, Sitemap-Eintrag und Anti-KI-Voice-Checkliste."
argument-hint: "[Thema — z.B. 'brief-an-bürgermeister' oder 'wie-oft-abgeordnete-schreiben']"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

<objective>
Neue SEO/GEO-optimierte Unterseite für brief-nach-berlin.de erstellen. Seiten liegen unter `app/(site)/[slug]/page.tsx`, tauchen nicht in der Hauptnav auf (reine Crawl-Fläche). Jede Seite muss die Anti-KI-Voice-Checkliste bestehen, im Sitemap eingetragen sein und korrektes JSON-LD enthalten.
</objective>

<stack>
- Next.js App Router, TypeScript
- Tailwind CSS + Schriften: `font-body` (Prosa), `font-typewriter` (Labels/Eyebrows), `font-display` (Display-Überschriften)
- Farben: `text-waldgruen`, `text-waldgruen-dark`, `text-warmgrau`, `bg-creme`, `bg-white`
- Komponenten: `components/editorial/` — `Prose`, `PullQuote`, `FactCallout`, `Figure`, `SectionDivider`
- FAQ-Komponente: `components/FAQAccordion` (nimmt `{ q: string, a: string }[]`)
- Config: `lib/config.ts` — importiere `APP_URL`
- Sitemap: `app/sitemap.ts` — URL zum Array hinzufügen
</stack>

<routing-conventions>
Alle Unterseiten liegen unter `app/(site)/[slug]/page.tsx`. Slug ist immer Deutsch und kebab-case.

Typische Muster (als Orientierung, nicht als Zwang):
- `[thema]-brief` — Anleitungsseiten für spezifische Anliegen (z.B. `kommunalpolitik-brief`)
- `warum-[x]` — Erklärseiten ("warum ein Brief mehr ist als ein Brief")
- `wie-[x]` — How-to-Seiten
- `[verb]-abgeordnete` — Aktionsseiten
- `[frage-als-slug]` — für direkte Suchanfragen (z.B. `lohnt-sich-brief-an-politiker`)
</routing-conventions>

<page-skeleton>
Jede Seite folgt exakt dieser Struktur. Keine Schritte überspringen.

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FactCallout } from "@/components/editorial/FactCallout";

// 1. Konstanten oben
const URL_PATH = "/[slug]";
const PUBLISHED = "YYYY-MM-DD";
const TITLE = "... | Brief nach Berlin";
const DESCRIPTION = "..."; // 150–160 Zeichen, konkretes Outcome

// 2. Metadata
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// 3. FAQ-Daten (4–6 Fragen)
const faqs = [
  { q: "...", a: "..." },
];

// 4. JSON-LD
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: { "@type": "Organization", name: "Brief nach Berlin" },
  publisher: { "@type": "Organization", name: "Brief nach Berlin", url: `${APP_URL}` },
  url: `${APP_URL}${URL_PATH}`,
};

// 5. Page-Komponente
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Eyebrow */}
        <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          [Oberthema]
        </p>

        {/* H1 */}
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          [Titel]
        </h1>

        {/* Lead — 40–60 Wörter, beantwortet die Frage vollständig */}
        <p className="font-body text-lg text-warmgrau/80 leading-relaxed mb-12">
          [Lead]
        </p>

        <Prose>
          {/* Inhalt: h2-Überschriften als echte Fragen, konkrete Zahlen statt Adjektive */}
          {/* Mindestens eine h2 als ChatGPT-Suchfrage formuliert */}
          {/* FactCallout und PullQuote für prägnante Kernaussagen nutzen */}
        </Prose>

        {/* Querlinks — mindestens 2 verwandte Seiten */}
        <div className="mt-16 border-t border-warmgrau/10 pt-8">
          <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-4">
            Mehr dazu
          </p>
          <ul className="flex flex-col gap-3">
            <li>
              <Link href="/[verwandte-seite]" className="font-body text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors">
                [Linktitel]
              </Link>
            </li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="font-body text-xl font-bold text-waldgruen-dark mb-6">Häufige Fragen</h2>
          <FAQAccordion items={faqs} />
        </div>

        {/* CTA */}
        <div className="mt-16 bg-creme rounded-xl p-8 text-center">
          <p className="font-body text-lg font-bold text-waldgruen-dark mb-4">
            Bereit, deinen Brief zu schreiben?
          </p>
          <Link
            href="/"
            className="inline-block bg-waldgruen text-creme font-body font-semibold px-8 py-3 rounded-lg hover:bg-waldgruen-dark transition-colors"
          >
            Brief schreiben
          </Link>
        </div>
      </main>
    </>
  );
}
```
</page-skeleton>

<sitemap-update>
Nach dem Erstellen der Seite in `app/sitemap.ts` eintragen:

```ts
{
  url: `${BASE_URL}/[slug]`,
  lastModified,
  changeFrequency: "monthly",
  priority: 0.8,  // Guide-Seiten: 0.9, Themensubseiten: 0.8, Hilfseiten: 0.7
},
```
</sitemap-update>

<geo-rules>
Diese Regeln sorgen dafür, dass die Seite von ChatGPT, Perplexity und Gemini zitiert wird.

1. **Answer-first.** Der Lead (erste ~200 Tokens nach der H1) muss die Kernfrage vollständig beantworten. Wer nur den Lead liest, hat die Antwort.

2. **40–60 Wörter im Lead.** Kein Teaser. Die echte Antwort.

3. **Fragenbasierte H2-Überschriften.** Mindestens eine H2 als Frage formulieren, die jemand genau so in ChatGPT tippt.

4. **Konkrete Zahlen, keine Adjektive.** "2–6 Wochen Antwortzeit" statt "schnelle Antwort". "9.260 Petitionen" statt "sehr viele Petitionen". Nur Zahlen verwenden, die aus bestehenden Quellen oder realistisch sind.

5. **FAQPage-Schema.** `FAQAccordion` mit 4–6 Fragen. Jede Antwort vollständig und standalone.

6. **Article-Schema.** Immer mitsenden (siehe Skeleton oben).

7. **Mindestens 2 Querlinks** zu anderen Seiten des Projekts. Entity Salience: KI-Engines belohnen vernetzten Content.

8. **`dateModified` im Schema.** Bei jeder Inhaltsaktualisierung `PUBLISHED`-Konstante updaten.
</geo-rules>

<voice-checklist>
Vor dem Abschluss jeden Punkt prüfen.

**Verbotene Wörter — sofort streichen:**
delve, underscore, showcase, foster, garner, elevate, navigate, resonate, crucial, pivotal, vital, intricate, vibrant, groundbreaking, seamless, tapestry, testament, landscape (abstrakt), interplay, synergies, robust, comprehensive, holistic, empowering, transformative

**Verbotene Konstruktionen:**
- "dient als" / "fungiert als" → umschreiben mit "ist"
- "Nicht nur X, sondern auch Y" → als zwei Sätze schreiben
- "Trotz aller Herausforderungen... [optimistischer Ausblick]" → ganzen Arc streichen
- "Zusammenfassend" / "Abschließend" / "Insgesamt" → löschen
- Dreier-Adjektiv-Regel: "schnell, verlässlich und sicher" → nur eines behalten

**Strukturregeln:**
- Satzcase in Überschriften. Kein Title Case.
- Keine Bullets im Format `**Konzept:** Erklärung` — stattdessen Prosa oder saubere Liste
- Keine Emojis
- **Keine Gedankenstriche (Em-Dashes)**. Durch Komma, Doppelpunkt oder Punkt ersetzen
- Einen Absatz nicht direkt danach zusammenfassen

**Stilregeln:**
- Satzlängen mischen. Kurze Sätze landen. Dann kann ein längerer mehr tragen.
- Konkrete Zahlen schlagen Adjektive
- Ton der Landing Page spiegeln: sachlich, direkt, ohne Politiksprech

**Projektname:** "Brief nach Berlin" (mit Leerzeichen). Domain: brief-nach-berlin.de.
</voice-checklist>

<existing-subpages>
Für Querlinks auf folgende Seiten zurückgreifen:
- `/guide` — Der komplette Guide vom Frust zum Brief
- `/tipps` — Schreibtipps
- `/lohnt-sich-brief-an-politiker` — Wirkt ein Brief wirklich?
- `/warum-ein-brief` — Warum ein Brief mehr ist als ein Brief
- `/wer-darf-mdb-schreiben` — Wer darf schreiben?
- `/abgeordneten-schreiben` — An Abgeordnete schreiben
- `/kommunalpolitik-brief` — Kommunalpolitik
- `/aktiv-werden` — Weitere Aktionsformen
- `/ki-transparenz` — KI-Transparenz
- `/treppe-der-selbstwirksamkeit` — Politische Selbstwirksamkeit
</existing-subpages>

<process>
1. `app/sitemap.ts` lesen, um Konflikte mit bestehenden URLs auszuschließen
2. Richtigen Slug aus den Routing-Conventions bestimmen
3. FAQ-Daten zuerst schreiben (zwingt zum Denken, was echte Nutzer fragen)
4. Lead schreiben (verankert den Voice für den Rest)
5. Restliche Seite nach Skeleton aufbauen
6. Voice-Checkliste von oben nach unten durchgehen
7. URL in `app/sitemap.ts` eintragen
8. `cd web && npm run build` — Seite muss im Build-Output erscheinen
9. Bericht: Seiten-Slug, primäres Suchziel, FAQ-Anzahl, Sitemap-Priorität
</process>
