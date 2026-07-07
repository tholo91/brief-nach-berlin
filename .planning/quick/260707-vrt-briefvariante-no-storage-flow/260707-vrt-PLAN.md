---
quick_id: 260707-vrt
slug: briefvariante-no-storage-flow
description: No-Storage-Flow zum Anpassen bestehender Briefentwuerfe
date: "2026-07-07"
status: planned
must_haves:
  truths:
    - Mail-Template enthaelt unter dem Briefentwurf den CTA "Brief anpassen"
    - CTA-Link uebergibt nur die E-Mail-Adresse im URL-Hash
    - /brief/anpassen zeigt E-Mail-Input, Brief-Textarea, Tonalitaetsauswahl und optionales Aenderungswunsch-Feld
    - Submit validiert E-Mail und mindestens 500 Zeichen Brieftext
    - Varianten-Prompt behandelt den Input als bestehenden Brief und erhaelt Fakten, Empfaenger, Forderung und Grussformel
    - Varianten-Mail nutzt Brevo-Tag brief_variant
    - Der Varianten-Flow importiert oder ruft incrementLetterCounters nicht auf
    - Success-Seite sagt "Angepasster Brief wurde dir zugeschickt."
  artifacts:
    - web/src/lib/email/buildEmailHtml.ts
    - web/src/lib/generation/generateLetter.ts
    - web/src/lib/generation/generateLetterVariant.ts
    - web/src/lib/email/buildVariantEmailHtml.ts
    - web/src/lib/email/sendVariantEmail.ts
    - web/src/lib/validation/wizardSchemas.ts
    - web/src/app/api/generate-letter-variant/route.ts
    - web/src/app/(site)/brief/anpassen/page.tsx
    - web/src/app/(site)/brief/anpassen/VariantForm.tsx
    - web/src/app/(site)/brief/anpassen/erfolg/page.tsx
    - web/src/__tests__/generateLetterVariantPrompt.test.ts
---

# Quick Task 260707-vrt: No-Storage-Flow zum Anpassen bestehender Briefentwuerfe

## Goal

Nutzer koennen nach der ersten Brief-Mail eine andere Formulierung oder Tonalitaet
anfordern, ohne den normalen Briefprozess neu zu starten.

## Tasks

### Task 1: Mail-CTA und Varianten-Mail

**Files:**
- `web/src/lib/email/buildEmailHtml.ts`
- `web/src/lib/email/buildVariantEmailHtml.ts`
- `web/src/lib/email/sendVariantEmail.ts`

**Action:**
- Normaler Brief-Mail direkt unter dem Briefentwurf einen schlichten CTA ohne Hintergrund hinzufuegen.
- Eigenes Varianten-Mail-Template und Brevo-Sender mit Tag `brief_variant` anlegen.

**Verify:**
- CTA-Link enthaelt nur `#email=<encoded-email>`.
- Varianten-Mail verwendet nicht das normale Erstbrief-Tag.

**Done:**
- Mail-CTA sichtbar, Variantenversand separat.

### Task 2: Prompt, Validation und API

**Files:**
- `web/src/lib/generation/generateLetter.ts`
- `web/src/lib/generation/generateLetterVariant.ts`
- `web/src/lib/validation/wizardSchemas.ts`
- `web/src/app/api/generate-letter-variant/route.ts`

**Action:**
- Tonalitaetsblock exportieren und fuer Varianten wiederverwenden.
- Varianten-Prompt erstellen, der den eingefuegten Text als bestehenden Brief behandelt.
- API mit E-Mail- und Brieftext-Validierung, Mistral-Generation, Output-Moderation und Variantenversand bauen.

**Verify:**
- API ruft `incrementLetterCounters` nicht auf.
- Prompt verbietet neue Fakten und verlangt Erhalt von Fakten, Empfaenger, Forderung und Grussformel.

**Done:**
- Separater API-Pfad erzeugt und versendet Varianten ohne Counter.

### Task 3: Anpassungsseite und Success-Seite

**Files:**
- `web/src/app/(site)/brief/anpassen/page.tsx`
- `web/src/app/(site)/brief/anpassen/VariantForm.tsx`
- `web/src/app/(site)/brief/anpassen/erfolg/page.tsx`

**Action:**
- Seite im bestehenden App/Site-Stil bauen.
- E-Mail aus URL-Hash lesen und sichtbar/editierbar vorausfuellen.
- Textarea, Tonalitaetsauswahl und optionales Aenderungswunsch-Feld anzeigen.
- Nach Erfolg auf `/brief/anpassen/erfolg` weiterleiten.

**Verify:**
- Kein MdB-Auswahl-UI.
- Placeholder fuer E-Mail lautet `deine@email.de`.
- Success-Copy ist eindeutig.

**Done:**
- Nutzerflow ist end-to-end bedienbar.
