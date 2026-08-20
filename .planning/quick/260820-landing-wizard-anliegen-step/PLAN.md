# Landing-Anliegen ohne Wiederholung an den Wizard übergeben

## Ziel

Ein auf der Landing eingegebenes Anliegen wird in den Wizard übernommen, ohne dass dieselbe Eingabe direkt erneut erscheint. Direkte Wizard-Besuche beginnen weiterhin beim Anliegen.

## Umsetzung

- Landing-Handoff startet direkt bei PLZ und E-Mail.
- Der Handoff bleibt bis zur Empfängerauswahl erhalten, damit Reload und Browser-History keinen Text verlieren, und verfällt nach 30 Minuten automatisch.
- Kampagnen-Starts bleiben bewusst direkt bei PLZ und E-Mail; ihr Zurück-Button führt zur öffentlichen Kampagnenseite.
- Die Landing speichert den Handoff vor der normalen Router-Navigation. Ein fehleranfälliger Shared-Element-Morph entfällt.

## Abnahme

- Landing → `/app` zeigt direkt PLZ und E-Mail, ohne das Anliegen zu wiederholen.
- Das Anliegen überlebt Weiter, Zurück und Reload im selben Tab innerhalb von 30 Minuten.
- Ein direkter Besuch von `/app` ohne gültigen Handoff startet beim Anliegen.
- Kampagnen bleiben beim direkten Kontakt-Schritt und können zurück zur Kampagnenseite.
- Die normale Navigation funktioniert auf Mobile und Desktop ohne hängenbleibenden Overlay-Klon.
