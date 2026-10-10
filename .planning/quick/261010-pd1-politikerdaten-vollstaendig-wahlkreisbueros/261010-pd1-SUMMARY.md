---
quick_id: 261010-pd1
status: complete
date: 2026-10-10
---

# Summary: Politikerdaten vollständig und Wahlkreisbüros sauber

- Ursache fehlender Personen: abgeordnetenwatch v2 liest `range_end` als Seitengröße. Mit `range_end=start+99` fiel bei jedem Abruf der Eintrag an Index 99 weg, je nach API-Reihenfolge eine andere Person (vorher Hanna Steinmüller, zuletzt Thomas Stephan; in jedem Landtag mit über 99 Mandaten eine Person, z. B. Doris Ahnen, Kirsten Stich, Sarah Hagmann, Oskar Lipp, Heiko Kasseckert).
- Neu geladen: Bundestag 609 Einträge mit Wahlkreis (630 Mandate), Landtage 1766. Junge raus (ausgeschieden 19.07.2026), Zschau rein (nachgerückt 20.07.2026). Ausschüsse für Düring und Pöpsel nach Rate-Limit-Fehlern gezielt nachgeladen (552/609).
- Holger Kühnlenz (NI): "parteilos" -> "AfD" (Mandat ohne Fraktionsmitgliedschaft in der API, Personenprofil sagt AfD).
- Hamburg: alle 225 PLZ enthielten Wahlkreis 1 (Hamburg-Mitte), 200 nur diesen. Jetzt 25 PLZ mit korrektem Stadtteil-Wahlkreis, 200 ohne Zuordnung (App zeigt dann die Suche über alle MdL statt falscher Vorschläge).
- Wahlkreisbüros: 14 Datensätze mit Footer-Text bereinigt, zusammengelegte Büros getrennt; 0 Footer-Treffer, max. 5 Zeilen, jede Adresse mit PLZ.
- Datensatz-Reihenfolge jetzt stabil nach Mandats-ID (vorher API-Zufall), daher großer JSON-Diff.

## Verifikation
- Unabhängiger Abgleich gegen die API (Name, Partei/aktuelle Fraktion, Wahlkreis, Direktmandat, Vollständigkeit) für Bundestag und alle 16 Landtage: 0 Abweichungen.
- Stichprobe Wahlkreisbüros gegen bundestag.de: 20/20.
- Regierungschef:innen: keine Korrektur nötig; RP Schnieder auf rlp.de bestätigt.
- jest 1023/1023, tsc, eslint (0 Fehler).

## Offen
- BE (Konstituierung 29.10.2026) und MV (20.10.2026): danach `npm run fetch:landtag` und Regierungschef:innen neu prüfen; ST: Wahl der MP noch offen.
