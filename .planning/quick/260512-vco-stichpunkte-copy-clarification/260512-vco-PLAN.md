---
id: 260512-vco
slug: stichpunkte-copy-clarification
date: 2026-05-12
status: in-progress
type: quick
---

# Stichpunkte Copy Clarification

User-Feedback aus Testgespräch: Es war nicht ersichtlich, dass man keinen Brief vortippen muss, sondern Stichpunkte ausreichen. Copy auf Landingpage und im Wizard so anpassen, dass die "Stichpunkte reichen, wir formulieren"-Botschaft an mehreren Touchpoints klar rüberkommt.

## Tasks

### 1. Hero-Sub-Headlines erweitern und schärfen
**File:** `web/src/components/Hero.tsx`
**Action:**
- SUB_HEADLINES Array (Zeile 5-22): Neue erste Rotation einfügen `["Drei Stichpunkte reichen, kein Aufsatz nötig.", "Wir bauen daraus einen Brief, der gelesen wird."]`
- Bisherige erste Rotation `["Tippen oder einfach drauf lossprechen.", "Ratzfatz formulieren wir dir einen überzeugenden Brief."]` ändern zu `["Sprich rein oder tipp ein paar Stichpunkte.", "Ratzfatz formulieren wir dir einen überzeugenden Brief."]`

### 2. HowItWorks Schritt 01 umformulieren
**File:** `web/src/components/HowItWorks.tsx`
**Action:** Description (Zeile 5-6) ersetzen mit `"Stichpunkte oder Gedanken per Sprachnachricht, wir übernehmen die Formulierung. Egal ob Müll auf dem Spielplatz, bezahlbarer Wohnraum oder Sorgen um die Demokratie."`

### 3. CallToAction-Paragraph umformulieren
**File:** `web/src/components/CallToAction.tsx`
**Action:** Paragraph (Zeile 31-33) ersetzen mit `"Beschreib uns in Stichpunkten, was dich bewegt. Wir finden die zuständigen Abgeordneten und formulieren einen Brief, der ankommt."`

### 4. Step2Issue (Wizard) klarstellen
**File:** `web/src/components/wizard/Step2Issue.tsx`
**Action:**
- a) Subheader-Paragraph (Zeile 176-178) ersetzen mit `"Stichpunkte reichen. Du musst keine ganzen Sätze schreiben. Sprich einfach drauf los oder tipp ein paar Notizen. Wir formulieren daraus deinen Brief."` und die conditional Voice-Ergänzung entfernen.
- b) Divider-Text (Zeile 194): "oder schreib es selbst" → "oder tipp deine Stichpunkte"
- c) PLACEHOLDER_EXAMPLES Array (Zeile 105-112): Zwei neue Stichpunkt-Beispiele am Anfang einfügen:
  - `"z.B. Radwege bei uns kaputt, Schlaglöcher überall, gefährlich für Schulkinder"`
  - `"z.B. Miete explodiert in unserem Viertel, Familien ziehen weg, was kann man tun?"`
- d) TipsDisclosure erstes Bullet (Zeile 75-79): Inhalt ersetzen mit `"Stichpunkte genügen. Notier konkret, wo du wohnst, was du siehst, was dich nervt. Wir bauen daraus die Sätze."` (Label "Sei konkret." entfernen, da die neue Aussage diese Rolle übernimmt.)

## Constraints

- **Keine em-dashes (—)** in der neuen Copy. Hyphens (-), Kommas, Doppelpunkte sind ok.
- Bestehende em-dashes in den geänderten Zeilen ersetzen.
- Sonst keine ungefragten Code-Refactorings.

## Done When

- Alle 4 Dateien committed.
- Type-Check passes (`pnpm tsc --noEmit` im web/ Verzeichnis).
- Visuelle Sichtprüfung: neue Copy erscheint korrekt und ohne em-dashes.
