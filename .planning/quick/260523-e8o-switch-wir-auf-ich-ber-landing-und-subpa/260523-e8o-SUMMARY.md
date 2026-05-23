---
phase: quick
plan: 260523-e8o
status: complete
date: 2026-05-23
---

# Quick Task 260523-e8o: Switch wir→ich + Mithelfen-Block

## Goal

Across Landing + Subpages: "wir/uns/unser" → "ich/mich/mein" wo Thomas als Person gemeint ist; System-Aktionen umformuliert (Tool-Subjekt oder passiv); juristisches "wir" in Datenschutz/Impressum auf "ich" (Thomas ist alleiniger Verantwortlicher). Zusätzlich Mithelfen-Block auf /was-noch-kommt und /stimmen.

## What Changed

**Core copy (Commit 48d2aaa):** Hero SUB_HEADLINES (Tool-Subjekt statt "wir"), Roadmap.tsx ("Ich baue gerade und lerne"), Step2Issue wizard, layout.tsx meta description (3 Stellen via replace_all), guide.tsx CTA + Wahlkreis-Text, ki-transparenz Headlines, treppe-der-selbstwirksamkeit.

**Legal (Commit 7bad0af):** Datenschutz und Impressum komplett auf alleinverantwortliche ich-Form, Sie-Form zur Nutzer:in bleibt erhalten.

**Feedback flow (Commit 49d81ab):** /stimmen FAQ + Hero + Side-Note, PrivacyDisclosure ("Deine E-Mail" Bug-Fix als Free-Rider, "Meine" → "Deine"), FeedbackForm ThankYouCard. Mithelfen-Block auf /stimmen vor Sign-off.

**Roadmap (Commit 463cc45):** /was-noch-kommt Hero + Level-Beschreibungen + FAQ-Antworten, RoadmapSignupForm. Mithelfen-Block am Seitenende vor Final-CTA.

**Tone refinement (Commit a9b7c5a):** Nach User-Feedback "nie angeberisch, sondern so dass mir das wichtig ist":
- Mithelfen-Headline auf beiden Seiten: "Ich baue allein. Mithilfe ist willkommen." → **"Mir liegt was dran. Mithilfe ist willkommen."**
- Stimmen FAQ Z.49: "Ich lese jede Rückmeldung selbst" → "Ich lese jede Rückmeldung" (das "selbst" trug Eigenlob-Vibe)

## Hard rules respected (intentional no-touch)

- `warum-ein-brief/page.tsx` Z.205-206: "Wir haben Briefe gelesen" → Bundestags-Team, nicht Thomas. **Unverändert.**
- `ki-transparenz/page.tsx` Z.160: "Wenn wir wollen, dass digitale Infrastruktur..." → gesellschaftliches "wir". **Unverändert.**
- `keine-ki-briefflut/page.tsx` Z.216: Abgeordneten-Zitat. **Unverändert.**
- `web/src/lib/example-letters.ts`: Beispieltext im generierten Brief. **Unverändert.**

## Out of scope (separat einplanen)

- `datenschutz/page.tsx` Z.399 nennt "LDI NRW" als Aufsichtsbehörde — Thomas wohnt in Bremen, korrekt ist LfDI Bremen (in Abschnitt 1 schon richtig). Bug, aber nicht Teil dieses Tasks.

## Files Modified (14)

```
web/src/components/Hero.tsx
web/src/components/Roadmap.tsx
web/src/components/wizard/Step2Issue.tsx
web/src/app/layout.tsx
web/src/app/(site)/guide/page.tsx
web/src/app/(site)/ki-transparenz/page.tsx
web/src/app/(site)/treppe-der-selbstwirksamkeit/page.tsx
web/src/app/(site)/datenschutz/page.tsx
web/src/app/(site)/impressum/page.tsx
web/src/app/(site)/feedback/PrivacyDisclosure.tsx
web/src/app/(site)/feedback/FeedbackForm.tsx
web/src/app/(site)/stimmen/page.tsx
web/src/app/(site)/was-noch-kommt/page.tsx
web/src/app/(site)/was-noch-kommt/RoadmapSignupForm.tsx
```

## Commits

```
48d2aaa copy(landing+subpages): switch wir/uns/unser to ich + Tool-Subjekt
7bad0af copy(legal): datenschutz + impressum auf alleinverantwortliche ich-Form
49d81ab copy(feedback): stimmen + feedback-form auf ich, mithelfen-block auf stimmen
463cc45 copy(roadmap): was-noch-kommt auf ich + mithelfen-block
a9b7c5a copy(quick-260523-e8o): mithelfen-headlines weniger angeberisch, 'selbst' aus FAQ
```

## Verification

- ESLint clean for all edited files
- `tsc --noEmit` clean
- Manual smoke (Stichprobe): Landing-Hero zeigt Tool-Subjekt, /datenschutz Sie-Form intakt, /stimmen Mithelfen-Block vor Sign-off, /was-noch-kommt Mithelfen-Block vor Final-CTA

## Status

Complete.
