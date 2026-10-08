# Quick 261008: Fehler-UX + schlankes Logging für Netzwerkabbrüche

**Ziel:** Bei Verbindungsabbruch auf der Success-Page verstehen Nutzer sofort, dass der Brief sehr wahrscheinlich per Mail unterwegs ist. Fehler-Reports enthalten feste Kategorien und Zahlen statt "GenerationError".

**Grenzen:** Nichts speichern, keine neuen IDs, keine Dependency. Keine Änderung an generateLetter.ts, Prompt oder Längen-Retry. Kein Auto-Retry im Browser. Kein Freitext in Reports oder Logs.

**UI:** Nur Texte, Layout bleibt. Deshalb kein /frontend-design-Durchlauf (bewusst vermerkt).

## Tasks
1. Step3Success.tsx: elapsedMs, wasHidden (visibilitychange), Fehlerkategorie, neue Report-Felder, Texte.
2. lib/clientErrorKind.ts: feste Kategorien + Mapping (eigene Datei, weil "use server"-Module nur async Funktionen exportieren dürfen).
3. reportError.ts: optionale Felder mit `.catch(undefined)`, Fallback "ClientNetworkError", In-App-Browser-Label aus UA.
4. sendErrorReportEmail.ts: sechs neue Zeilen.
5. generate-letter/route.ts: Logzeile `[generate-letter] done` mit durationMs, lengthKey, campaignSlug.
6. reportErrorPrivacy.test.ts erweitern.
