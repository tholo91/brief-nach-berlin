---
quick_id: 261008-xfr
mode: quick
phase: quick-261008-xfr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/components/campaigns/CampaignManager.tsx
autonomous: true
requirements:
  - kampagne-verwalten-uebertragen-dialog
---

# Kampagne übertragen: von grünem Kasten zu Link + Dialog

<objective>
Auf `/kampagne/verwalten` ist "Kampagne übertragen" ein eigener, grün hinterlegter Kasten direkt unter der Statuskarte (`CampaignManager.tsx`, `{canTransfer && <section ...>}`). Das ist für eine seltene Aktion zu prominent. Ersetze ihn durch einen leisen Text-Link in der Karte "Kampagne umstellen" und verschiebe Formular und Warnung in einen Bestätigungsdialog.

Nur UI. Die Server-Action `transferCampaignAction`, ihre Texte, Tokens und Mails bleiben unverändert.
</objective>

<context>
Verifiziert (Code gelesen):
- Sichtbarkeit bleibt `canTransfer` = Status `awaiting_approval`, `active` oder `paused`.
- `CampaignManager` wird nur von `app/(site)/kampagne/verwalten/page.tsx` benutzt (zwei Stellen), nicht auf der öffentlichen Kampagnenseite.
- Ablauf: `transferCampaignAction` verschickt an die neue Adresse einen einmaligen Bestätigungslink (`createCampaignTransferToken`). Bis zur Bestätigung ändert sich nichts.
- Bei Annahme (`accept_campaign_transfer` in `web/supabase/migrations/016_campaign_transfers.sql` und `acceptCampaignTransferAction`): `creator_email` wird auf die neue Adresse gesetzt, alle offenen `manage`- und `transfer`-Tokens werden als benutzt markiert (alte Verwaltungs-Links sterben), die Verwaltungs-Session prüft `creatorEmail` und ist damit für die alte Adresse ungültig. Die neue Inhaberin bekommt eine neue Verwaltungs-Mail.
- `transferResult`-State, `submitTransfer`, `fieldErrors.recipientEmail` und `isBusy` existieren schon und werden wiederverwendet.
- Es gibt keine Dialog-Komponente im Repo. Nutze das native `<dialog>` mit `showModal()`, keine neue Dependency.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Block entfernen, Link + Dialog einbauen</name>
  <files>web/src/components/campaigns/CampaignManager.tsx</files>
  <action>
1. Lösche die `{canTransfer && (<section ...>...</section>)}` direkt unter der Statuskarte.
2. In der Karte "Kampagne umstellen" (unten, neben Pausieren/Archivieren) unter den zwei Buttons: wenn `canTransfer`, ein Text-Button im Link-Stil (kein Rahmen, `text-sm`, `underline`, dezente Farbe wie `text-warmgrau/70`): "Verwaltung an eine andere E-Mail-Adresse übertragen". Er ruft `dialogRef.current?.showModal()` auf, `disabled={isBusy}`.
3. `<dialog ref={dialogRef}>` mit den bestehenden Tailwind-Tokens (`rounded-md`, `bg-creme`, `font-typewriter` für Titel, `font-body` für Text). `::backdrop` abdunkeln (`backdrop:bg-black/40`). Schließen per Esc und per "Abbrechen". Klick auf den Backdrop schließt ebenfalls.
4. Inhalt des Dialogs:
   - Titel: "Verwaltung übertragen?"
   - Absatz: "Möchtest du die Verwaltung dieser Briefkampagne an eine andere E-Mail-Adresse übertragen?"
   - Warnbox (`airmail-rot`-Tokens, wie bestehende Fehlerbox): was passiert. Inhaltlich genau diese Punkte, in eigenen Worten, kurz:
     a. Die neue Adresse bekommt einen einmaligen Bestätigungslink. Bis sie bestätigt, bleibt dein Zugang bestehen.
     b. Nach der Bestätigung ist die neue Adresse Inhaberin und bekommt eine neue Verwaltungs-Mail.
     c. Deine bisherigen Verwaltungs-Links funktionieren dann nicht mehr. Das lässt sich nicht von dir aus rückgängig machen.
   - Das bestehende Formular: Label "Neue E-Mail-Adresse", Input `name="recipientEmail"`, Hidden `campaignId`, Feldfehler aus `transferResult.fieldErrors.recipientEmail`, `onSubmit={submitTransfer}`.
   - Buttons: "Abbrechen" (sekundär, `type="button"`) und "Übergabe starten" (primär, `type="submit"`, "Wird verschickt..." bei `isBusy`).
   - `transferResult.message` im Dialog anzeigen (Erfolg grün, Fehler rot, bestehende Klassen). Bei `ok: true` das Formular ausblenden und nur die Bestätigung plus "Schließen" zeigen. Nicht automatisch schließen.
5. Beim Öffnen `setTransferResult(null)`, damit alte Meldungen nicht stehen bleiben.
6. Texte: Deutsch, "du"-Form wie im Rest der Seite, keine Gedankenstriche (weder – noch —), Hyphens/Kommas/Doppelpunkte. Gegen `signs-of-ai-writing.md` prüfen. Keine Emojis.
7. Frontend-Arbeit: `/frontend-design` oder `/taste` nutzen und das im Plan/Summary nennen (Projektregel).
  </action>
  <verify>
- `cd web && npx tsc --noEmit` ohne neue Fehler.
- `cd web && npx jest src/__tests__/transferCampaignAction.test.ts` grün (Action unverändert).
- Dev-Server: Verwalten-Seite mit gültigem Token öffnen (Status active). Kein grüner Kasten mehr. Link in "Kampagne umstellen" öffnet den Dialog. Esc, Abbrechen und Backdrop-Klick schließen ihn.
- Eigene E-Mail-Adresse eingeben: Fehlermeldung "Das ist bereits die aktuelle Adresse." erscheint im Dialog am Feld.
- Mobil (375px): Dialog passt in den Viewport, Buttons erreichbar, kein horizontaler Scroll.
- Kampagne mit Status `archived` oder `blocked`: Link nicht sichtbar.
- Screenshot Desktop + Mobil als Beleg.
  </verify>
  <done>
Grüner Kasten weg. Link nur in "Kampagne umstellen". Dialog zeigt Warnung und Formular, Fehler- und Erfolgsmeldung erscheinen im Dialog. `transferCampaign.ts` und `acceptCampaignTransfer.ts` unverändert (`git diff` zeigt nur `CampaignManager.tsx`).
  </done>
</task>

</tasks>

<out_of_scope>
- Keine Änderung an Server-Actions, Tokens, Mails oder Migrationen.
- Keinen echten Transfer mit einer fremden Adresse auslösen. Keine Mail versenden. Beim Testen nur die Validierungs-Fehlerpfade (eigene Adresse) nutzen, oder die Action nicht absenden.
- Nichts committen oder pushen. Das Working Tree enthält andere ungestagte Änderungen (u.a. `CreatorCampaignForm.tsx`, `kampagne-starten`, E-Mail-Builder). Nur `CampaignManager.tsx` anfassen und nichts anderes stagen.
</out_of_scope>

<amendments date="2026-10-08">
Mit Thomas abgestimmt vor der Umsetzung:
1. Warnung nicht komplett rot: Punkte a und b als neutrale Liste, nur Punkt c in der roten Box.
2. Absatz unter dem Titel gestrichen (wiederholte nur die Titelfrage).
3. Einstieg in "Kampagne umstellen": Trennlinie, Zeile "Soll jemand anderes die Kampagne betreuen?" plus Link "Verwaltung übertragen".
4. E-Mail-Feld bekommt beim Öffnen den Fokus, Dialogbreite `w-[calc(100%-2rem)] max-w-md`, Backdrop-Klick über `event.target === event.currentTarget`.
5. Erweiterung: "Kampagne archivieren" bekommt denselben Bestätigungsdialog (Archivieren ist endgültig und lief bisher ohne Rückfrage).
Dev-Server-Test mit Verwaltungslink laut Thomas nicht nötig.
</amendments>
