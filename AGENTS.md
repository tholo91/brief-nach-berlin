# Agent Instructions

## Projektorientierung

- Brief-nach-Berlin ist ein deutsches, überparteiliches Civic-Tech-Projekt: Nutzer:innen beschreiben ein Anliegen, die App findet zuständige Politiker:innen und erzeugt einen formal brauchbaren Brief zum Abschreiben und Abschicken.
- Markenschreibweise: „Brief-nach-Berlin“ immer mit Bindestrichen schreiben; bestehende URLs bleiben unverändert.
- Aktive Produktentwicklung liegt in `web/`. Root-Dokumente enthalten Strategie, Datenschutz, Anpassungsleitfäden, Presse- und Projektkontext.
- Öffentliche Sprache ist Deutsch, per Du, sachlich, ermutigend und nicht aktivistisch-aggressiv. Generierte Briefe an Politiker:innen bleiben formal per Sie.
- Für Marken-, Landing- oder größere UI-Arbeiten zuerst `.planning/brand-identity.md` lesen und bei Bedarf UI-Skills wie `frontend-design` oder `design-taste-frontend` nutzen.
- Datenschutz ist Produktkern: kein Account, keine unnötige Speicherung persönlicher Anliegen, keine stillen Tracking- oder Storage-Erweiterungen ohne explizite Prüfung gegen DSGVO-Dokumente.

## Daten, Politik und Versand

- Politiker-, PLZ-, Wahlkreis- und Zuständigkeitsdaten sind fachlich kritisch. Bei Änderungen an Routing, Datenimporten oder Level-Logik Tests und Stichproben einplanen, nicht nur TypeScript prüfen.
- Supabase wird für Statistik, Reviews, Rückmeldungen und Kampagnenlogik genutzt, nicht als allgemeiner User-Storage. Migrationen unter `web/supabase/migrations/` nicht mit remote angewendetem Zustand gleichsetzen. Neue Tabelle in `public`: in derselben Migration `REVOKE ALL` von `anon`, `authenticated`, `PUBLIC` und `GRANT` an `service_role` (Supabase vergibt ab 30.10.2026 keine Rechte mehr automatisch, Vorlage: `033_letter_outcomes.sql`).
- Brevo und Follow-up-Skripte können echte E-Mails auslösen. Keine Versand-, Kontaktstatus- oder Batch-Skripte ausführen, außer Thomas autorisiert den konkreten Versand ausdrücklich.
- Mistral/Voxtral-Aufrufe kosten Geld und können Nutzerdaten verarbeiten. Keine neuen AI-Logging-Flows oder Prompt-Dumps mit echten Anliegen einführen.

## Arbeitsweise

- Keep it shippable: Conversion, Vertrauen, Briefqualität und korrekte Zuständigkeit sind wichtiger als interne Perfektion.
- Bei Änderungen immer trennen: lokaler Code, committed/pushed Code, live deployter Zustand, Supabase-Objektzustand und Supabase-Migration-History.
- Bestehende untracked Assets oder Presse-/Mail-Dateien nicht anfassen, wenn sie nicht direkt zur Aufgabe gehören.

## Bauprinzipien

In `CLAUDE.md` und `AGENTS.md` identisch halten.

- **Lean und nachhaltig bauen.** Die einfachste Lösung, die das echte Problem der Nutzer:innen löst. Keine komplexen Funktionen, die jeden denkbaren Edge Case abdecken. Seltene Fälle lieber sauber scheitern lassen (klare Meldung, erneut versuchen möglich), statt Sonderlogik zu bauen.
- **Nur das Wichtigste shippen.** Vor jedem Fix fragen: Merken echte Nutzer:innen es, kostet es Geld, oder geht es um Recht und Datenschutz? Wenn nein, notieren statt bauen. Review-Funde und Kleinigkeiten nicht automatisch abarbeiten: erst den Einfluss auf Nutzer:innen einschätzen und Thomas aktiv bremsen, wenn es Richtung Perfektionieren geht. Nachhaltig heißt sauber gebaut, nicht vollständig.
- **Erweitern statt kopieren.** Vor neuer Logik prüfen, ob es sie schon gibt (z. B. Rate-Limit, Token, Mailversand, Empfänger-Prüfung). Eine bestehende Stelle erweitern, keine zweite Kopie anlegen.
- **Kosten im Blick.** Vercel und Brevo sind bezahlt, Mistral wird pro Nutzung bezahlt. Supabase soll so lange wie möglich im Free-Tarif bleiben: Daten in SQL aggregieren statt alle Zeilen zu laden, keine zusätzlichen Supabase-Dienste ohne Rückfrage.
- **Keine neuen Dienste oder SDKs** ohne Rückfrage bei Thomas.
- **Mistral-Kontingent schonen.** Tests mocken Mistral immer (`@/lib/mistral`). Keine echten `generateLetter`-Aufrufe aus Tests oder Skripten, während Kampagnen laufen: Das Kontingent (15 Anfragen pro Minute für mistral-large) teilt sich mit der Live-Seite.

<!-- code-tasks:agent-front-door -->
## Captured Ideas (Gitty)

Dieses Repo ist mit der Gitty-App für mobiles Task-Capturing verbunden. Captures landen in `captured-ideas-<username>.md`.

**Zu Beginn jeder Session, vor allem anderen:**
1. `git fetch --quiet` ausführen, um den neuesten Stand zu holen, ohne den Working Tree anzufassen.
2. Die frischeste `captured-ideas-*.md` lesen — falls die lokale Kopie veraltet sein könnte, direkt remote: `git show origin/<branch>:captured-ideas-<username>.md`.
3. Dem Header „Instructions for AI Agents" in der Datei folgen: offene `- [ ]` Punkte nach Priorität gruppiert auflisten. Nur auf Anweisung warten, wenn der User den Capture-Check ausdrücklich anspricht; sonst nach dem Listing mit der eigentlichen Aufgabe fortfahren.
