---
quick_id: 261103-jrc
mode: quick
date: 2026-11-03
---

# /schule: Feinschliff Eingabekarte, Hero, FAQ-Bild

## Context
Thomas hat /schule live angesehen: Themen-Chips gefallen, sollen aber Emojis, zwei scrollbare Reihen und einen Info-Tooltip bekommen. Das Eingabefeld soll wie auf der Landing aussehen und animieren, Statushinweise neben den Zeichenzähler, Klasse 5 und 6 dazu, Hero-Text und Seitenende überarbeitet. Grill-Antworten: Emoji wird bei Hover zu rundem +, nur selbst getippter Text blendet die Klassenleiste ein, kürzere Briefe für Kl. 5-6, zwei Reihen auch auf /eltern, "Alle Themen" bleibt.

Ablauf: über `/gsd-quick` (GSD-Pflicht im Repo), Frontend-Teile mit `/frontend-design`-Blick. Ein Commit-Paket, Push erst nach Thomas' OK.

## Änderungen

### 1. Themen-Chips (`src/components/topics/TopicStarterGrid.tsx`, Variante `scroll`)
- `TopicStarter` (`src/lib/topics/topicStarters.ts`) bekommt optional `emoji?: string`; Emojis in `src/lib/schule/jungTopics.ts` (gilt für JUNG_TOPICS und JUNG_OPEN_TOPICS, gleiche ids) und in den Eltern-Themen setzen.
- Trailing-Kreis entfällt. Vorne ein 20px-Slot: Emoji; bei Hover/Fokus (`group-hover`) ausgeblendet und runder `+`-Kreis eingeblendet; ausgewählt: Haken-Kreis. Ohne Emoji: Slot zeigt immer +/Haken (Fallback).
- Eingeklappt zwei Reihen, die gemeinsam scrollen: `grid grid-rows-2 grid-flow-col auto-cols-max overflow-x-auto` statt `flex`, bestehende Klassen `chip-scroll-fade scrollbar-hide snap-x` behalten. Gilt damit für /schule und /eltern. "Alle Themen" (ExpandableTopicChips) bleibt unverändert.

### 2. Info-Tooltip hinter "Was nervt dich?" (`src/components/jung/JungExperience.tsx`)
- Kleiner `i`-Button (44px Trefferfläche, `aria-describedby`), zeigt bei Hover, Fokus und Tap eine Sprechblase: "Nimm einen Baustein und mach ihn zu deinem: Was hast du selbst erlebt?" (Copy vor Commit gegen signs-of-ai-writing prüfen, keine Gedankenstriche). Kein Tooltip-Paket, lokal im Component; Escape/Außenklick schließt.

### 3. Statushinweis neben Zeichenzähler
- `VoiceRecorder` (`src/components/audio/VoiceRecorder.tsx`) bekommt optional `metaStart?: ReactNode`, gerendert im linken Teil der Meta-Zeile, wenn keine Aufnahme/Verarbeitung läuft.
- JungExperience reicht `statusMessage` (mit `id="jung-status"`, `aria-live`) dort hinein; der separate Absatz darunter entfällt. Fehlermeldungen (Klasse fehlt etc.) laufen über denselben Weg.

### 4. Eingabefeld wie Landing
- Rahmen: `rounded-xl border border-warmgrau/30 bg-creme shadow-sm`, Fokus `ring-2 ring-waldgruen` statt gestrichelt.
- Placeholder: Tipp-Animation aus `Step2Issue.tsx` (Zeilen ~343-389, type/hold/delete) in einen Hook `useTypewriterPlaceholder(examples, active)` unter `src/components/wizard/` auslagern, in Step2Issue und JungExperience nutzen (Erweitern statt kopieren). Overlay-`div` wie in Step2Issue Z. 573-580; reduced motion zeigt statisch. Die 4000ms-Rotation in JungExperience fällt weg.
- Regressionsrisiko Landing: Hook-Verhalten 1:1 übernehmen, Landing danach im Browser prüfen.

### 5. Klassenleiste
- Schwelle zählt nur selbst getippten Text, auch ohne Klassenlink: `ownTextEnough = ownText.length >= OWN_TEXT_MIN` (die `isOpen`-Ausnahme fällt weg). Sticky-Reveal (`finishRevealed`) und `fade-in-row` bleiben; Animation etwas deutlicher (Höhe aufklappen + Fade, z. B. `grid-rows-[0fr→1fr]`), reduced motion ohne.
- Klassen 5-13: `KLASSE_MIN = 5` in `src/lib/schule/youth.ts`. Raster in JungExperience und `ClassLinkGenerator.tsx` von `grid-cols-7` auf 9 Spalten (`max-w-md`), auf 375px prüfen.

### 6. Kürzere Briefe Kl. 5-6
- `youth.ts`: `youthLetterWords(klasse)` → 100-150 für Kl. 5-6, sonst 150-200. `generateLetter.ts` Z. ~680 nutzt es statt `YOUTH_LETTER_WORDS`. Ton "einfach und direkt" greift schon (`klasse <= 9`).

### 7. Seite `src/app/(site)/schule/page.tsx`
- Hero: "Wählen darfst du noch nicht," / "Schreiben schon!"
- "So geht's": `step-connector`-Span entfernen (CSS bleibt, falls anderswo nötig; Test `jungEntry.test.ts:172` anpassen).
- FAQ-Bild: `ConditionalFadeFooterImage` blendet /schule aus; /schule rendert FAQ in einem `relative`-Wrapper mit `FadeFooterImage variant="content" successBackground`, damit das Bild hinter dem FAQ liegt (FAQ-Karten bekommen ggf. leichten Hintergrund für Lesbarkeit).

## Verifikation
- `cd web && npx jest` (Mistral gemockt), insbesondere `jungEntry`, `topicStarters`, `youthClient`, `generateLetterYouthPrompt` (+ neuer Fall Kl. 5 → 100-150 Wörter).
- `npm run lint`, `npm run build`.
- Preview: /schule auf 375px und Desktop: Chips 2 Reihen + Emoji/Hover, Tooltip per Tap, Placeholder tippt, Statushinweis links neben Zähler, Leiste erst nach eigenem Text und bleibt, Klasse 5-13, kein Strich in "So geht's", Bild hinter FAQ. Gegencheck Landing (Placeholder unverändert) und /eltern (2 Reihen).
- Keine echten Mistral-Aufrufe.
