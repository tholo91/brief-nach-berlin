# Landing-Anliegen im Wizard bearbeiten

## Ziel

Ein von der Landing übernommenes Anliegen öffnet im Wizard wieder den vorausgefüllten Schritt „Dein Anliegen“, inklusive Tipps. Bearbeitung bleibt vollständig im Wizard.

## Umsetzung

- Landing-Handoff startet in Wizard-Schritt 1 statt direkt bei PLZ und E-Mail.
- Der reguläre `Step2Issue` zeigt den übernommenen Text und die bestehende Tipp-Akkordeonlogik.
- Der Handoff bleibt bis zur Empfängerauswahl erhalten, damit Reload und Browser-History keinen Text verlieren.
- Kampagnen-Starts bleiben bewusst direkt bei PLZ und E-Mail; ihr Zurück-Button führt zur öffentlichen Kampagnenseite.
- Der manuelle Morph misst nach Navigation das tatsächlich gerenderte Wizard-Feld. Es gibt keine hart codierte Zielgeometrie mehr.
- Bei reduzierter Bewegung, fehlendem Feld oder fehlgeschlagener Animation erfolgt sofort eine korrekte Navigation.

## Abnahme

- Landing → `/app` zeigt den bearbeitbaren Text mit Tipps.
- Änderungen überleben Weiter, Zurück und Reload im selben Tab.
- Kampagnen bleiben beim direkten Kontakt-Schritt und können zurück zur Kampagnenseite.
- Landing-Morph funktioniert ohne weißen Zwischenzustand auf Mobile und Desktop.
