---
status: complete
---
# /ngo-briefkampagne: Empfänger-Optionen + Copy

- Neue Sektion "Wen eure Briefe erreichen" (Wahlkreis-MdB, ausgewählte MdBs, Landesregierung/Senat, fester Empfänger), Copy belegt durch schema.ts, CreatorCampaignForm.tsx, submitWizard.ts.
- Neue Box "Das bekommt ihr" (Seite+Logo, Link+QR, Zähler, Verwaltungslink/Übergabe, kostenlos, keine Unterstützer-Daten für Ersteller:innen).
- Hero-Zielgruppe geöffnet (Initiativen, Creator), shortPoint 2 korrigiert, Forschungs-Box ans Ende, 2 neue FAQs, MODIFIED 2026-10-08.
- Checks: eslint ok, tsc ohne Fehler in der Datei (bestehende Fehler in anderen Dateien), landingPageContent-Test 5/5, lokal gerendert mobil+desktop.
- Nicht committet, STATE.md nicht angefasst (war bereits dirty).

## Runde 2 (Kürzung + Briefzähler)
- Seite gekürzt: Hero → Laufende Kampagnen → "So läuft es" (3 Schritte) + "Wen eure Briefe erreichen" (4 Zeilen) nebeneinander → 1 Satz Kosten/Daten → FAQ → CTA. Bild, Forschungs-Box, Karten-Sektionen entfernt.
- CampaignList: ab >20 Briefen exakte Zahl ("952 Briefe") statt "20+ Briefe". Kein Extra-Query, letter_count kommt schon aus select("*").
- Tests: campaignList 6/6, landingPageContent 5/5; lokal gerendert.
