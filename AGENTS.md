# Agent Instructions

## Captured Ideas (Gitty)

Dieses Repo ist mit der Gitty-App für mobiles Task-Capturing verbunden. Captures landen in `captured-ideas-<username>.md`.

**Zu Beginn jeder Session, vor allem anderen:**
1. `git fetch --quiet` ausführen, um den neuesten Stand zu holen, ohne den Working Tree anzufassen.
2. Die frischeste `captured-ideas-*.md` lesen — falls die lokale Kopie veraltet sein könnte, direkt remote: `git show origin/<branch>:captured-ideas-<username>.md`.
3. Dem Header „Instructions for AI Agents" in der Datei folgen: offene `- [ ]` Punkte nach Priorität gruppiert auflisten. Nur auf Anweisung warten, wenn der User den Capture-Check ausdrücklich anspricht; sonst nach dem Listing mit der eigentlichen Aufgabe fortfahren.

## Projektorientierung

- Brief nach Berlin ist ein deutsches, überparteiliches Civic-Tech-Projekt: Nutzer:innen beschreiben ein Anliegen, die App findet zuständige Politiker:innen und erzeugt einen formal brauchbaren Brief zum Abschreiben und Abschicken.
- Aktive Produktentwicklung liegt in `web/`. Root-Dokumente enthalten Strategie, Datenschutz, Anpassungsleitfäden, Presse- und Projektkontext.
- Öffentliche Sprache ist Deutsch, per Du, sachlich, ermutigend und nicht aktivistisch-aggressiv. Generierte Briefe an Politiker:innen bleiben formal per Sie.
- Für Marken-, Landing- oder größere UI-Arbeiten zuerst `.planning/brand-identity.md` lesen und bei Bedarf UI-Skills wie `frontend-design` oder `design-taste-frontend` nutzen.
- Datenschutz ist Produktkern: kein Account, keine unnötige Speicherung persönlicher Anliegen, keine stillen Tracking- oder Storage-Erweiterungen ohne explizite Prüfung gegen DSGVO-Dokumente.

## Daten, Politik und Versand

- Politiker-, PLZ-, Wahlkreis- und Zuständigkeitsdaten sind fachlich kritisch. Bei Änderungen an Routing, Datenimporten oder Level-Logik Tests und Stichproben einplanen, nicht nur TypeScript prüfen.
- Supabase wird für Statistik, Reviews, Roadmap-Signups und Kampagnenlogik genutzt, nicht als allgemeiner User-Storage. Migrationen unter `web/supabase/migrations/` nicht mit remote angewendetem Zustand gleichsetzen.
- Brevo und Follow-up-Skripte können echte E-Mails auslösen. Keine Versand-, Kontaktstatus- oder Batch-Skripte ausführen, außer Thomas autorisiert den konkreten Versand ausdrücklich.
- Mistral/Voxtral-Aufrufe kosten Geld und können Nutzerdaten verarbeiten. Keine neuen AI-Logging-Flows oder Prompt-Dumps mit echten Anliegen einführen.

## Arbeitsweise

- Keep it shippable: Conversion, Vertrauen, Briefqualität und korrekte Zuständigkeit sind wichtiger als interne Perfektion.
- Bei Änderungen immer trennen: lokaler Code, committed/pushed Code, live deployter Zustand, Supabase-Objektzustand und Supabase-Migration-History.
- Bestehende untracked Assets oder Presse-/Mail-Dateien nicht anfassen, wenn sie nicht direkt zur Aufgabe gehören.

<!-- code-tasks:agent-front-door -->
## Captured Ideas (Gitty)

Dieses Repo ist mit der Gitty-App für mobiles Task-Capturing verbunden. Captures landen in `captured-ideas-<username>.md`.

**Zu Beginn jeder Session, vor allem anderen:**
1. `git fetch --quiet` ausführen, um den neuesten Stand zu holen, ohne den Working Tree anzufassen.
2. Die frischeste `captured-ideas-*.md` lesen — falls die lokale Kopie veraltet sein könnte, direkt remote: `git show origin/<branch>:captured-ideas-<username>.md`.
3. Dem Header „Instructions for AI Agents" in der Datei folgen: offene `- [ ]` Punkte nach Priorität gruppiert auflisten. Nur auf Anweisung warten, wenn der User den Capture-Check ausdrücklich anspricht; sonst nach dem Listing mit der eigentlichen Aufgabe fortfahren.
