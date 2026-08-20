# Ebenenwahl und kompakte Wizard-Navigation

## Ziel

Freie Briefe wählen nach Ton und Länge immer sichtbar Bund, Land oder Kommune, bevor Empfänger:innen erscheinen. Der Wizard nutzt oben eine kompakte Navigation mit Zurück und Fortschrittspunkten.

## Umsetzung

- Der freie Wizard baut den Ebenen-Routing-Kontext unabhängig von den bisherigen Feature-Flags auf.
- Eine Mistral-Empfehlung bleibt hilfreich, aber optional: Bei Timeout oder fehlender Empfehlung kann die Person jede verfügbare Ebene selbst wählen.
- Nicht verfügbare Ebenen bleiben sichtbar und erklären ehrlich den Grund.
- Kampagnen überspringen die Ebenenwahl weiterhin, weil ihr Ziel durch die Kampagne festgelegt ist.
- Eine gemeinsame Kopfzeile im Wizard zeigt nur den Zurück-Button und drei Fortschrittspunkte; die primären Weiter-Aktionen bleiben in den Formularen.
- Die separate mobile Fortschrittsanzeige im App-Header entfällt.

## Abnahme

- Mit nicht gesetzten alten Feature-Flags erscheint die freie Ebenenwahl trotzdem.
- Bund, Land und Kommune respektieren ihre tatsächliche PLZ-Abdeckung.
- Ein Kampagnenbrief kann die festgelegte Ebene nicht ändern.
- Zurück, Fortschrittspunkte und die unteren Weiter-CTAs sind auf Mobile und Desktop eindeutig und nicht doppelt.
