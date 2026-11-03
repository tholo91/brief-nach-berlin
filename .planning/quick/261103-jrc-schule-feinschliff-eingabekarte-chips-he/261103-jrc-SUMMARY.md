---
quick_id: 261103-jrc
status: complete
date: 2026-11-03
commit: 2189bfe
---

# /schule Feinschliff

Umgesetzt laut 261103-jrc-PLAN.md (Plan im Plan-Modus mit Thomas abgestimmt, daher kein separater Planner-Lauf; ausgeführt direkt im Haupt-Checkout).

- Chips: `emoji` an TopicStarter, Emoji vorne, Hover/Fokus zeigt rundes Plus, ausgewählt Haken; Variante `scroll` jetzt zwei Reihen (`grid-rows-2 grid-flow-col`), gilt für /schule und /eltern.
- JungExperience: InfoTip hinter "Was nervt dich?", Status über neuen `metaStart`-Slot im VoiceRecorder links neben dem Zähler, Feld wie Landing, Tipp-Placeholder über `useTypewriterPlaceholder` (aus Step2Issue ausgelagert), Klassenleiste nur nach eigenem Text mit `grow-in-row`.
- Klasse 5-13 (`KLASSE_MIN = 5`, auch im Klassenlink-Token), `youthLetterWords`: Kl. 5-6 100-150 Wörter.
- /schule: Hero-Text, Step-Connector entfernt, FadeFooterImage hinter den FAQ (global für /schule ausgeblendet).

Verifikation: Jest 180/180 Suites grün (Mistral gemockt), ESLint ohne Befund, `next build` ok, Browser-Check 375px und Desktop (/schule, Landing, /eltern), keine Konsolenfehler. Nicht gepusht.
