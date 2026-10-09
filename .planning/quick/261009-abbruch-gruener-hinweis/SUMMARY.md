---
status: complete
---
# Summary 261009-abbruch-gruener-hinweis

Umgesetzt wie PLAN.md. Client-/Netzwerkfehler ohne HTTP-Status setzen `connectionLost`, die Seite zeigt dann den Erfolgsfall mit grünem Hinweis und Mailto-Fallback. HTTP-Fehler unverändert rot.

Checks: jest successPageExperience, reportErrorPrivacy, step3AlternativeRecipients, step3Landesregierung 26/26; eslint auf geänderten Dateien ok; tsc ohne Fehler in geänderten Dateien. Browser (localhost, 375px): Fetch auf /api/generate-letter lokal mit `TypeError("Load failed")` abgefangen, grüner Hinweis sichtbar, kein „Keine E-Mail erhalten?“, keine Ladepunkte, kein Request an den Server.

Folge: Diese Fälle erzeugen keine Fehler-Reports mehr. Häufigkeit nur noch indirekt über Vercel-Logs (Status 0 bei /api/generate-letter).
Nicht committet, nicht deployt (wartet auf Freigabe).

## Nachtrag Review 09.10.2026

- Grüner Hinweis nur noch bei Netzfehler (`load_failed`, `failed_to_fetch`, `network_error`) UND (Seite war im Hintergrund ODER Fetch lief mind. 3 s). Schneller Netzfehler bei sichtbarer Seite (offline, Adblocker) und `invalid_json`/`no_letter_text` bleiben beim bisherigen Pfad „Verbindung abgebrochen, Brief wahrscheinlich fertig“ mit Fehler melden.
- Separater Fix im selben Review: `generate-letter/route.ts` ruft den Meilenstein-Claim jetzt am Ende von `after()` auf, nach Brief-Mail und Follow-up. Brief-Mail-Fehler bricht den Block nicht mehr ab, Follow-up nur bei erfolgreicher Brief-Mail.
- Checks: jest 899/899, eslint ok, tsc ohne neue Fehler.
