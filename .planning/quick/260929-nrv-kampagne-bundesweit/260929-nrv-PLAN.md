---
phase: quick-260929-nrv
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements: [DRITTER-KAMPAGNENTYP, FIXER-KAMPAGNENEMPFAENGER, EMPFAENGERBINDUNG]
---

# Dritter Kampagnentyp: Fester Empfänger

## Ziel

Kampagnenersteller:innen können unabhängig von den bestehenden Zieltypen `Bund` und `Land` einen dritten Typ `Fixed` wählen. Alle Teilnehmenden schreiben dann an dieselbe serverseitig gespeicherte deutsche Postadresse. Die eingegebene PLZ bleibt für Teilnahmeprüfung und anonyme Regionalstatistik erforderlich, beeinflusst den Empfänger aber nicht.

Die NRV-Kampagne `unterschrift-ist-kein-dienstvergehen` wird auf folgenden festen Empfänger umgestellt:

- Hessisches Ministerium der Justiz und für den Rechtsstaat
- Luisenstraße 13
- 65185 Wiesbaden
- Anrede: „Sehr geehrte Damen und Herren,“

## Datenvertrag

- `CampaignTargetLevel`: `Bund | Land | Fixed`
- `CampaignFixedRecipient`: optionale Organisation, optionale Person, verpflichtende Anrede, Straße, Hausnummer, fünfstellige PLZ, Ort und festes `countryCode: DE`
- Mindestens Organisation oder Person ist erforderlich.
- `Fixed`: Empfänger gesetzt, Bundesland `null`, MdB-Liste leer.
- `Bund` und `Land`: Empfänger `null`; die bisherige Routinglogik bleibt unverändert.
- Kampagnenrevisionen speichern Zieltyp, Bundesland, festen Empfänger und MdB-Liste mit.

## Erstellen und Verwalten

- Erstellungsformular und Verwaltung zeigen drei gleichrangige Zielkarten.
- `Fixed` blendet strukturierte Adressfelder, Briefanrede und einen verpflichtenden Privatadressen-Hinweis ein.
- Adressdaten werden im lokalen Entwurf gespeichert; die Bestätigung selbst wird nicht persistiert.
- Beim Wechsel werden unvereinbare Daten gelöscht.
- Zieltyp und feste Adresse sind nur bis zur ersten Aktivierung änderbar. `activatedAt` sperrt sie dauerhaft, auch im pausierten Zustand.
- Die erste manuelle Freigabe umfasst die Prüfung, dass keine erkennbare Privatadresse veröffentlicht wird.

## Brief-Flow und Sicherheit

- Der Client sendet nur `{ kind: "campaign_fixed" }`.
- `submitWizard`, Auswahl, Generierung und Resend laden den Empfänger erneut aus der aktiven Kampagne.
- Keine alternativen Empfängerkarten bei `Fixed`.
- Prompt und Brief verwenden die exakte gespeicherte Anrede und Adresse, ohne politische Ebene, Zuständigkeit, Partei, Wahlkreis oder Absenderort zu erfinden.
- Generierungsnachweise und Briefsignale binden alle normalisierten Adressfelder.
- Anschriften zeigen Organisation, Person, Straße/Hausnummer und PLZ/Ort; `Deutschland` wird für Inlandspost nicht ausgegeben.
- Die öffentliche Kampagnenseite nennt Ziel und bundesweite Teilnahme transparent.

## Migration

Migration 023 erweitert Kampagnen, Revisionen und Briefsignale auf `Fixed`, aktualisiert die Freigabefunktion und hinterlegt die NRV-Adresse. Sie wird erst nach lokaler Prüfung angewendet. Falls 023 entgegen der lokalen Annahme bereits remote registriert ist, wird die Änderung vor Anwendung in eine neue Migration 024 verschoben.

## Abnahme

- Schema: alle drei Zieltypen und ungültige Kombinationen.
- Formular: Pflichtfelder, Hinweis, Entwurf und Zurücksetzen unvereinbarer Daten.
- Verwaltung: Ziel vor Aktivierung änderbar, danach auch pausiert gesperrt.
- Routing: mehrere deutsche PLZ liefern denselben festen Empfänger; ungültige PLZ bleibt abgelehnt.
- Sicherheit: manipulierte Clientdaten werden nicht akzeptiert; Nachweise binden alle Adressfelder.
- Prompt und Mail: Organisation, Person und beide gemeinsam; kein Land `Deutschland` in der Anschrift.
- Regression: bestehende Bund-, Land- und gezielte MdB-Kampagnen.
- Keine Migration, kein Deploy und kein echter KI-Aufruf vor abgeschlossener lokaler Prüfung.

