---
created: 2026-10-04
title: Vollständigen Brief im Anliegenfeld erkennen
area: ui+generation
files:
  - web/src/components/wizard/Step2Issue.tsx
  - web/src/lib/generation/generateLetter.ts
  - web/src/lib/generation/
---

## Ziel

Menschen, die bereits einen vollständigen Brief in das Anliegenfeld der Landingpage schreiben, verstehen vor der Generierung, dass Brief-nach-Berlin daraus einen neuen Briefentwurf erstellt und ihren Text dabei umformulieren kann. So sinkt das Risiko, dass sie eine wortgetreue Übernahme oder den Versand ihres eingegebenen Briefs erwarten.

## Beobachtung

Vereinzelt tippen Nutzer:innen einen kompletten Brief in das Anliegenfeld und beschweren sich anschließend, dass der Text umformuliert wurde. Vermutlich war ihnen nicht klar, dass das Tool für ein Anliegen oder eine kurze Situationsbeschreibung gedacht ist. Das Problem betrifft die Erwartung an das Tool, nicht das Alter der Personen; die Erkennung darf nicht auf Alter oder andere persönliche Merkmale zielen.

## Gewünschtes Verhalten

- Wenn die bestehende KI-Verarbeitung erkennt, dass die Eingabe bereits wie ein vollständiger Brief ausformuliert ist, vor dem nächsten Schritt einen kurzen, gut verständlichen Hinweis anzeigen.
- Der Hinweis erklärt, dass das Tool aus dem Anliegen einen neuen Briefentwurf erstellt und die Eingabe dabei umformuliert werden kann. Er empfiehlt, stattdessen Anliegen, Situation und gewünschte Änderung in eigenen Worten zu beschreiben.
- Der Hinweis bietet eine klare Möglichkeit, den Text zu kürzen oder anzupassen. Ein Fortfahren mit der Eingabe bleibt möglich.
- Kurze Anliegen, Stichpunkte und unvollständige Situationsbeschreibungen lösen den Hinweis nicht aus.

## Umsetzungshinweise

- Erst zusammen mit der geplanten KI-Ermittlung des Anliegens auf der Landingpage umsetzen. Die Erkennung soll ein Ergebnis der ohnehin stattfindenden Mistral-Verarbeitung sein, ohne zusätzlichen Modellaufruf.
- Wenn möglich, die Erkennung als eng begrenztes strukturiertes Signal ausgeben lassen; keine vollständigen Eingaben für Diagnose, Analyse oder spätere Auswertung speichern.
- Die Erkennung muss robust gegen falsch positive Treffer sein. Bei Unsicherheit keinen Hinweis anzeigen; Nutzer:innen können unabhängig davon jederzeit selbst bearbeiten oder fortfahren.
- Den Hinweis barrierearm und mobil gut bedienbar gestalten. Keine Formulierung, die Nutzer:innen für einen langen Text tadelt.

## Akzeptanzkriterien

1. Eine klar als vollständiger Brief erkennbare Eingabe löst vor dem Fortfahren den Hinweis aus.
2. Ein kurzes Anliegen, Stichpunkte oder eine knappe Situationsbeschreibung lösen ihn nicht aus.
3. Nutzer:innen können den Text bearbeiten oder trotz Hinweis fortfahren.
4. Der Hinweis macht deutlich, dass das Tool einen neuen Entwurf erstellt und keine wortgetreue Übernahme oder automatischen Versand verspricht.
5. Es gibt keinen zusätzlichen Mistral-Aufruf und keine neue Speicherung oder Protokollierung des Anliegen- oder Brieftexts.
6. Die Erkennung verwendet keine Alters- oder sonstigen persönlichen Merkmale.

## Nicht Teil dieser Story

- Keine automatische Kürzung oder Umformulierung vor der Zustimmung der Nutzer:innen.
- Keine Blockade des Flows, wenn jemand bewusst einen vollständigen Brief als Ausgangspunkt verwenden möchte.
- Keine neue Auswertung von Anliegen, Beschwerdehäufigkeiten oder Nutzergruppen.
- Keine Änderung daran, dass Nutzer:innen den erzeugten Brief selbst prüfen, abschreiben und versenden.
